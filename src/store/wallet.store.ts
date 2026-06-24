import { create } from "zustand";

interface WalletStore {
  address: string | null;
  isConnected: boolean;
  setAddress: (address: string | null) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  isConnected: false,
  setAddress: (address) => set({ address, isConnected: !!address }),
  disconnect: () => set({ address: null, isConnected: false }),
}));
