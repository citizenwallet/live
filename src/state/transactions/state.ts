import { Transfer } from '@citizenwallet/sdk';
import { create } from 'zustand';

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

export interface TransferStore {
  transfers: Transfer[];
  totalTransfers: number;
  totalAmount: number;
  fromDate: Date;
  loading: boolean;
  account: string | null;
  communitySettings: CommunitySettings | null;
  addTransfers: (transfers: Transfer[]) => void;
  updateOrAddTransfers: (transfers: Transfer[]) => {
    updated: number;
    added: number;
    transfers: Transfer[];
  };
  clearTransfers: () => void;
  setDate: (date: Date) => void;
  startLoadingFromDate: (date: Date) => void;
  setAccount: (account: string | null) => void;
  setCommunitySettings: (communitySettings: CommunitySettings | null) => void;
  stopLoadingFromDate: () => void;
}

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
  updateOrAddTransfers: (transfers: Transfer[]) => {
    let updated = 0;
    let added = 0;
    let updatedTransfers: Transfer[] = [];
    set((state: TransferStore) => {
      updatedTransfers = [...state.transfers];
      transfers.forEach((newTransfer) => {
        const existingIndex = updatedTransfers.findIndex(
          (t) => t.tx_hash === newTransfer.tx_hash && t.to === newTransfer.to // TODO: Add from address check (but we have two tx for minting then sending from @topup to @fridge)
        );

        if (existingIndex !== -1) {
          updated++;
          // Update existing transfer
          updatedTransfers[existingIndex] = {
            ...updatedTransfers[existingIndex],
            ...newTransfer,
          };
        } else {
          added++;
          // Add new transfer
          updatedTransfers.push(newTransfer);
        }
      });

      updatedTransfers.sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      return {
        transfers: updatedTransfers,
        totalTransfers: updatedTransfers.length,
        totalAmount: updatedTransfers.reduce(
          (acc, transfer) => acc + transfer.value,
          0
        ),
      };
    });
    return { transfers: updatedTransfers, updated, added };
  },
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
