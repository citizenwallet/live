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
import { getTransactions } from "@/lib/opencollective";
type ExtendedTransfer = Transfer & {
  fromProfile?: {
    name: string;
    imgsrc: string;
  };
  data: {
    description: string;
    value: number;
    currency: string;
    valueUsd: number;
    via: string;
  };
};

const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

class TransferLogic {
  store: TransferStore;
  storeGetter: () => TransferStore;
  token: ConfigToken;
  communitySlug: string;
  indexer: IndexerService;
  accountAddress: string | undefined;
  opencollectiveSlug: string | undefined;
  givethProjectId: number | undefined;
  onNewTransactions?: ([]) => void;

  constructor(
    config: Config,
    accountAddress: string | undefined,
    opencollectiveSlug: string | undefined,
    givethProjectId: number | undefined,
    store: () => TransferStore,
    onNewTransactions?: ([]) => void
  ) {
    this.store = store();
    this.storeGetter = store;
    this.token = config.token;
    this.communitySlug = config.community.alias;
    this.accountAddress = accountAddress;
    this.givethProjectId = givethProjectId;
    this.opencollectiveSlug = opencollectiveSlug;
    this.onNewTransactions = onNewTransactions;
    this.indexer = new IndexerService(config.indexer);
  }

  private listenerInterval: ReturnType<typeof setInterval> | undefined;
  private listenerIntervalGiveth: ReturnType<typeof setInterval> | undefined;
  private listenerIntervalOpenCollective:
    | ReturnType<typeof setInterval>
    | undefined;
  private listenMaxDate = new Date();
  private listenerFetchLimit = 10;

  processNewTransfers(transfers: Transfer[]) {
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
  }

  listen() {
    try {
      this.listenerInterval = setInterval(async () => {
        const params = {
          fromDate: this.listenMaxDate.toISOString(),
          limit: this.listenerFetchLimit,
          offset: 0,
        };
        console.log("listening for new transfers", this.accountAddress, params);
        try {
          const { array: transfers = [] } = this.accountAddress
            ? await this.indexer.getNewTransfers(
                this.token.address,
                this.accountAddress,
                params
              )
            : await this.indexer.getAllNewTransfers(this.token.address, params);

          this.processNewTransfers(transfers);
        } catch (e) {
          console.error("Error fetching transactions", e);
          return;
        }
      }, 1500);

      if (this.opencollectiveSlug) {
        this.listenerIntervalOpenCollective = setInterval(async () => {
          const data = await getTransactions(
            this.opencollectiveSlug || "",
            this.listenMaxDate,
            undefined,
            this.loaderFetchLimit
          );
          console.log(">>> logic: data from opencollective", data);
          if (data.length > 0) {
            this.processNewTransfers(
              data.map((transfer: any) => {
                transfer.to = this.accountAddress;
                return transfer;
              })
            );
          }
        }, 5000);
      }
      if (this.givethProjectId) {
        this.listenerIntervalGiveth = setInterval(async () => {
          console.log(
            "listening for new transfers on giveth",
            this.accountAddress
          );
          try {
            const data = await fetch(
              `/api/giveth?projectId=${this.givethProjectId}&projectAddress=${
                this.accountAddress
              }&fromDate=${this.listenMaxDate.toISOString()}`
            );
            const res = await data.json();
            console.log(">>> response from /api/giveth", res);
            if (res.transfers.length > 0) {
              this.processNewTransfers(res.transfers);
            }
          } catch (e) {
            console.error("Error fetching transactions from giveth", e);
            return;
          }
        }, 5000);
      }

      return () => {
        clearInterval(this.listenerInterval);
        this.listenerIntervalGiveth &&
          clearInterval(this.listenerIntervalGiveth);
        this.listenerIntervalOpenCollective &&
          clearInterval(this.listenerIntervalOpenCollective);
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

      if (this.opencollectiveSlug) {
        try {
          const data = await getTransactions(
            this.opencollectiveSlug,
            date,
            undefined,
            this.loaderFetchLimit
          );
          if (data.length > 0) {
            data.map((transfer: any) => {
              transfer.to = this.accountAddress;
              transfers.push(transfer);
            });
          }
        } catch (e) {
          console.error("Unable to fetch transactions from open collective", e);
        }
      }
      if (this.givethProjectId) {
        const apiCall = `/api/giveth?projectId=${
          this.givethProjectId
        }&projectAddress=${this.accountAddress}&take=${
          this.loaderFetchLimit
        }&skip=${offset}&fromDate=${date.toISOString()}`;
        const data = await fetch(apiCall);
        const res = await data.json();
        if (res.transfers.length > 0) {
          transfers.push(...res.transfers);
        }
      }

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

      const randomNumber = getRandomNumber(500, 2000);
      await delay(randomNumber);

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
  setOpencollectiveSlug(opencollectiveSlug: string | null) {
    this.store.setOpencollectiveSlug(opencollectiveSlug);
  }
  setGivethProjectId(givethProjectId: number | null) {
    this.store.setGivethProjectId(givethProjectId);
  }
}

export const useTransfers = (
  config: Config,
  accountAddress?: string,
  opencollectiveSlug?: string,
  givethProjectId?: number,
  onNewTransactions?: ([]) => void
): [UseBoundStore<StoreApi<TransferStore>>, TransferLogic] => {
  const transferStore = useTransferStore;

  const transferLogic = useMemo(
    () =>
      new TransferLogic(
        config,
        accountAddress,
        opencollectiveSlug,
        givethProjectId,
        () => transferStore.getState(),
        onNewTransactions
      ),
    [
      config,
      transferStore,
      accountAddress,
      opencollectiveSlug,
      givethProjectId,
      onNewTransactions,
    ]
  );

  return [transferStore, transferLogic];
};
