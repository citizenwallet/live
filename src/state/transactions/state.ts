import { Transfer, TransferStatus } from "@citizenwallet/sdk";
import { create } from "zustand";

export type TransferStore = {
  transfers: Transfer[];
  totalTransfers: number;
  totalAmount: number;
  addTransfers: (transfers: Transfer[]) => void;
  putTransfers: (transfers: Transfer[]) => void;
};

const getInitialState = () => ({
  transfers: [],
  totalTransfers: 0,
  totalAmount: 0,
});

export const useTransferStore = create<TransferStore>((set) => ({
  ...getInitialState(),
  addTransfers: (transfers: Transfer[]) =>
    set((state) => {
      const newTransfers = [...transfers, ...state.transfers];

      return {
        transfers: newTransfers,
        totalTransfers: newTransfers.length,
        totalAmount: newTransfers.reduce(
          (acc, transfer) => acc + transfer.value,
          0
        ),
      };
    }),
  putTransfers: (transfers: Transfer[]) =>
    set((state) => {
      const existingTransfers = [...state.transfers];

      // add or update the transfers based on their hash
      for (const transfer of transfers) {
        const index = existingTransfers.findIndex(
          (t) => t.tx_hash === transfer.tx_hash
        );
        if (index === -1) {
          existingTransfers.unshift(transfer);
        } else {
          existingTransfers[index] = transfer;
        }
      }

      return {
        transfers: existingTransfers,
        totalTransfers: existingTransfers.length,
        totalAmount: existingTransfers.reduce(
          (acc, transfer) => acc + transfer.value,
          0
        ),
      };
    }),
}));
