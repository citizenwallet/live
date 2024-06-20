import {
  Config,
  ConfigToken,
  IndexerService,
  Transfer,
} from "@citizenwallet/sdk";
import { TransferStore, useTransferStore } from "./state";
import { useMemo } from "react";
import { StoreApi, UseBoundStore } from "zustand";
import { delay } from "@/lib/delay";

class TransferLogic {
  store: TransferStore;
  storeGetter: () => TransferStore;
  token: ConfigToken;
  indexer: IndexerService;
  accountAddress: string | undefined;
  onNewTransactions?: ([]) => void;

  constructor(
    config: Config,
    accountAddress: string | undefined,
    store: () => TransferStore,
    onNewTransactions?: ([]) => void
  ) {
    this.store = store();
    this.storeGetter = store;
    this.token = config.token;
    this.accountAddress = accountAddress;
    this.onNewTransactions = onNewTransactions;
    this.indexer = new IndexerService(config.indexer);
  }

  private listenerInterval: ReturnType<typeof setInterval> | undefined;
  private listenMaxDate = new Date();
  private listenerFetchLimit = 10;

  listen() {
    try {
      this.listenerInterval = setInterval(async () => {
        const params = {
          fromDate: this.listenMaxDate.toISOString(),
          limit: this.listenerFetchLimit,
          offset: 0,
        };
        console.log("listening for new transfers", this.accountAddress, params);
        const { array: transfers = [] } = this.accountAddress
          ? await this.indexer.getNewTransfers(
              this.token.address,
              this.accountAddress,
              params
            )
          : await this.indexer.getAllNewTransfers(this.token.address, params);

        if (transfers.length > 0) {
          // new items, move the max date to the latest one
          this.listenMaxDate = new Date();
          this.onNewTransactions?.(transfers);
        }

        if (transfers.length === 0) {
          // nothing new to add
          return;
        }

        // new items, add them to the store
        this.store.putTransfers(transfers);
      }, 1000);

      return () => {
        clearInterval(this.listenerInterval);
      };
    } catch (_) {}
    return () => {};
  }

  triggerNewTransaction(tx: Transfer) {
    this.onNewTransactions?.([tx]);
    this.store.putTransfers([tx]);
  }

  clearTransfers() {
    this.store.clearTransfers();
    this.store.setDate(new Date());
  }

  private loaderFetchLimit = 100;

  async loadFrom(date: Date, offset: number = 0): Promise<void | undefined> {
    try {
      if (offset === 0) {
        this.store.startLoadingFromDate(date);
      }

      const params = {
        fromDate: date.toISOString(),
        limit: this.loaderFetchLimit,
        offset,
      };

      const { array: transfers = [], meta } = this.accountAddress
        ? await this.indexer.getNewTransfers(
            this.token.address,
            this.accountAddress,
            params
          )
        : await this.indexer.getAllNewTransfers(this.token.address, params);

      if (transfers.length === 0) {
        this.store.stopLoadingFromDate();
        return;
      }

      // new items, add them to the store
      this.store.putTransfers(transfers);

      const isLastPage = transfers.length < this.loaderFetchLimit;
      if (isLastPage) {
        this.store.stopLoadingFromDate();
        return;
      }

      await delay(250);

      const nextOffset = offset + this.loaderFetchLimit;

      return this.loadFrom(date, nextOffset);
    } catch (e) {
      console.error("loadFrom error", e);
      this.store.stopLoadingFromDate();
    }
  }
  setAccount(account: string | null) {
    this.store.setAccount(account);
  }
}

export const useTransfers = (
  config: Config,
  accountAddress?: string,
  onNewTransactions?: ([]) => void
): [UseBoundStore<StoreApi<TransferStore>>, TransferLogic] => {
  const transferStore = useTransferStore;

  const transferLogic = useMemo(
    () =>
      new TransferLogic(
        config,
        accountAddress,
        () => transferStore.getState(),
        onNewTransactions
      ),
    [config, transferStore, accountAddress, onNewTransactions]
  );

  return [transferStore, transferLogic];
};
