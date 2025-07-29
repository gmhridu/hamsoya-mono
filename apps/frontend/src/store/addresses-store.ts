import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShippingAddress } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

interface AddressesStore {
  addresses: ShippingAddress[];
  
  // Actions
  addAddress: (address: Omit<ShippingAddress, 'id'>) => void;
  updateAddress: (id: string, updates: Partial<ShippingAddress>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  
  // Computed values
  getDefaultAddress: () => ShippingAddress | null;
  getAddressById: (id: string) => ShippingAddress | null;
}

export const useAddressesStore = create<AddressesStore>()(
  persist(
    (set, get) => ({
      addresses: [],

      addAddress: (addressData) => {
        const newAddress: ShippingAddress = {
          ...addressData,
          id: Date.now().toString(),
          isDefault: get().addresses.length === 0, // First address is default
        };

        set((state) => ({
          addresses: [...state.addresses, newAddress],
        }));
      },

      updateAddress: (id: string, updates: Partial<ShippingAddress>) => {
        set((state) => ({
          addresses: state.addresses.map((address) =>
            address.id === id ? { ...address, ...updates } : address
          ),
        }));
      },

      removeAddress: (id: string) => {
        set((state) => {
          const addressToRemove = state.addresses.find((addr) => addr.id === id);
          const remainingAddresses = state.addresses.filter((addr) => addr.id !== id);
          
          // If we're removing the default address and there are other addresses,
          // make the first remaining address the default
          if (addressToRemove?.isDefault && remainingAddresses.length > 0) {
            remainingAddresses[0].isDefault = true;
          }
          
          return { addresses: remainingAddresses };
        });
      },

      setDefaultAddress: (id: string) => {
        set((state) => ({
          addresses: state.addresses.map((address) => ({
            ...address,
            isDefault: address.id === id,
          })),
        }));
      },

      getDefaultAddress: () => {
        return get().addresses.find((address) => address.isDefault) || null;
      },

      getAddressById: (id: string) => {
        return get().addresses.find((address) => address.id === id) || null;
      },
    }),
    {
      name: STORAGE_KEYS.addresses,
    }
  )
);
