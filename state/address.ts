import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Define the store's type
interface AddressState {
  address: string[];
  setAddress: (newAddress: string[]) => void;
}

// Create the store
const useAddressStore = create<AddressState>()(
  devtools((set) => ({
    address: [""], // Initial state
    setAddress: (newAddress) => set({ address: newAddress }),
  }))
);

export default useAddressStore;
