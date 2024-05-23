import {
  Config,
  ConfigToken,
  IndexerService,
  Transfer,
} from "@citizenwallet/sdk";
import { TransferStore, useTransferStore } from "./state";
import { useMemo, useRef } from "react";
import { StoreApi, UseBoundStore } from "zustand";

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

  getSavedTransfers() {
    try {
      const rawSavedTransfers = localStorage.getItem(
        `transfers-${this.token.address}`
      );

      const savedTransfers = JSON.parse(
        rawSavedTransfers || "[]"
      ) as Transfer[];
      if (savedTransfers.length > 0) {
        this.store.putTransfers(savedTransfers);
      }
    } catch (_) {}
  }

  private listenerInterval: ReturnType<typeof setInterval> | undefined;
  private listenMaxDate = new Date();
  private fetchLimit = 10;

  listen() {
    try {
      this.listenerInterval = setInterval(async () => {
        console.log("Listening for new transactions");
        const params = {
          fromDate: this.listenMaxDate.toISOString(),
          limit: this.fetchLimit,
          offset: 0,
        };

        const transfers = await this.indexer.getAllNewTransfers(
          this.token.address,
          params
        );

        if (transfers.array.length > 0) {
          // new items, move the max date to the latest one
          this.listenMaxDate = new Date();
        }

        if (transfers.array.length === 0) {
          // nothing new to add
          return;
        }

        // new items, add them to the store
        this.store.putTransfers(transfers.array);

        const combinedTransfers = this.storeGetter().transfers;

        // save the new state to local storage
        localStorage.setItem(
          `transfers-${this.token.address}`,
          JSON.stringify(combinedTransfers)
        );

        // play sound if there are new transfers that are successful
        if (transfers.array.some((t) => t.status === "success")) {
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
    this.store.addTransfers([]);
    localStorage.removeItem(`transfers-${this.token.address}`);
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
