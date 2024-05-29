import { Config, ConfigToken, IndexerService } from "@citizenwallet/sdk";
import { TransferStore, useTransferStore } from "./state";
import { useMemo } from "react";
import { StoreApi, UseBoundStore } from "zustand";
import { delay } from "@/lib/delay";

class TransferLogic {
  store: TransferStore;
  storeGetter: () => TransferStore;
  token: ConfigToken;
  indexer: IndexerService;

  constructor(config: Config, store: () => TransferStore) {
    this.store = store();
    this.storeGetter = store;
    this.token = config.token;
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

        const { array: transfers = [] } = await this.indexer.getAllNewTransfers(
          this.token.address,
          params
        );

        if (transfers.length > 0) {
          // new items, move the max date to the latest one
          this.listenMaxDate = new Date();
        }

        if (transfers.length === 0) {
          // nothing new to add
          return;
        }

        // new items, add them to the store
        this.store.putTransfers(transfers);

        const combinedTransfers = this.storeGetter().transfers;

        // play sound if there are new transfers that are successful
        if (transfers.some((t) => t.status === "success")) {
          // @ts-ignore
          window.playSound();
        }
      }, 1000);

      return () => {
        clearInterval(this.listenerInterval);
      };
    } catch (_) {}
    return () => {};
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

      const { array: transfers = [], meta } =
        await this.indexer.getAllNewTransfers(this.token.address, params);

      if (transfers.length === 0) {
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
    } catch (_) {}
  }
}

export const useTransfers = (
  config: Config
): [UseBoundStore<StoreApi<TransferStore>>, TransferLogic] => {
  const transferStore = useTransferStore;

  const transferLogic = useMemo(
    () => new TransferLogic(config, () => transferStore.getState()),
    [config, transferStore]
  );

  return [transferStore, transferLogic];
};
