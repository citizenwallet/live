import { Transfer, TransferStatus } from "@citizenwallet/sdk";
import { create } from "zustand";

type StripeSettings = {
  products: [
    {
      id: string;
      name: string;
      description: string;
      amount: number;
    }
  ];
};

export type CommunitySettings = {
  opencollectiveSlug?: string;
  giveth?: {
    projectId?: number;
    url?: string;
  };
  stripe?: StripeSettings;
};

export type TransferStore = {
  transfers: Transfer[];
  totalTransfers: number;
  totalAmount: number;
  fromDate: Date;
  loading: boolean;
  account: string | null;
  communitySettings: CommunitySettings | null;
  addTransfers: (transfers: Transfer[]) => void;
  putTransfers: (transfers: Transfer[]) => void;
  clearTransfers: () => void;
  setDate: (date: Date) => void;
  startLoadingFromDate: (date: Date) => void;
  setAccount: (account: string | null) => void;
  setCommunitySettings: (communitySettings: CommunitySettings | null) => void;
  stopLoadingFromDate: () => void;
};

const getInitialState = () => ({
  transfers: [],
  totalTransfers: 0,
  totalAmount: 0,
  fromDate: new Date(),
  loading: false,
  account: null,
  communitySettings: null,
});

export const useTransferStore = create<TransferStore>((set) => ({
  ...getInitialState(),
  addTransfers: (transfers: Transfer[]) =>
    set((state) => {
      const newTransfers = [...transfers, ...state.transfers];

      return {
        transfers: newTransfers,
      };
    }),
  putTransfers: (transfers: Transfer[]) =>
    set((state) => {
      const existingTransfers = [...state.transfers];

      // add or update the transfers based on their hash
      for (const transfer of transfers) {
        const index = existingTransfers.findIndex(
          (t) => t.hash === transfer.hash
        );
        if (index === -1) {
          existingTransfers.unshift(transfer);
        } else {
          existingTransfers[index] = transfer;
        }
      }

      existingTransfers.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      return {
        transfers: existingTransfers,
        totalTransfers: existingTransfers.length,
        totalAmount: existingTransfers.reduce(
          (acc, transfer) => acc + transfer.value,
          0
        ),
      };
    }),
  clearTransfers: () => set(getInitialState()),
  setDate: (date: Date) => set({ fromDate: date }),
  startLoadingFromDate: (date: Date) =>
    set({
      fromDate: date,
      loading: true,
      transfers: [],
      totalAmount: 0,
      totalTransfers: 0,
    }),
  stopLoadingFromDate: () => set({ loading: false }),
  setAccount: (account: string | null) => set({ account }),
  setCommunitySettings: (communitySettings: CommunitySettings | null) =>
    set({ communitySettings }),
}));
