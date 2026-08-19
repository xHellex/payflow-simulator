// src/store/usePaymentStore.ts
import { create } from 'zustand';
import type { Account, PaymentStatus, TransactionReceipt } from '../types';
interface PaymentState {
    cart: Account[];
    status: PaymentStatus;
    receipt: TransactionReceipt | null;
    // Acciones
    addToCart: (account: Account) => void;
    removeFromCart: (accountId: string) => void;
    clearCart: () => void;
    setStatus: (status: PaymentStatus) => void;
    setReceipt: (receipt: TransactionReceipt | null) => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
    cart: [],
    status: 'IDLE',
    receipt: null,

    addToCart: (account) => set((state) => {
        // Evitamos duplicados en el carrito
        if (state.cart.some(a => a.id === account.id)) return state;
        return { cart: [...state.cart, account] };
    }),

    removeFromCart: (accountId) => set((state) => ({
        cart: state.cart.filter(a => a.id !== accountId)
    })),

    clearCart: () => set({ cart: [], status: 'IDLE', receipt: null }),

    setStatus: (status) => set({ status }),

    setReceipt: (receipt) => set({ receipt }),
}));