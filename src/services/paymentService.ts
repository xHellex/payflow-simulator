// src/services/paymentService.ts
import type { Account, PaymentResponse, TransactionReceipt } from '../types';

// 1. Clases de Error Tipadas
export class PaymentTimeoutError extends Error {
    constructor() {
        super('La pasarela no respondió a tiempo');
        this.name = 'PaymentTimeoutError';
    }
}

export class PaymentRejectedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PaymentRejectedError';
    }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 2. La función original
export const processPayment = async (cart: Account[], signal?: AbortSignal): Promise<PaymentResponse> => {
    await delay(2000);

    // Si se canceló la petición antes de tiempo, abortamos
    if (signal?.aborted) throw new Error('Aborted');

    const totalAmount = cart.reduce((acc, account) => acc + account.amount, 0);

    if (totalAmount % 100 === 99) {
        throw new PaymentRejectedError('Transacción rechazada por el banco emisor. Fondos insuficientes.');
    }

    if (totalAmount % 100 === 88) {
        await delay(6000); // Simulamos que el backend se quedó colgado
        throw new Error('TIMEOUT_INTERNO'); // Nunca debería llegar acá gracias al Promise.race
    }

    const isFonasa = cart.some(acc => acc.category === 'Fonasa');

    const receipt: TransactionReceipt = {
        transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        date: new Date().toISOString(),
        totalAmount,
        paidAccounts: cart,
        paymentMethod: 'Webpay',
        status: 'COMPLETED',
        ...(isFonasa && { fonasaVoucherCode: `FNS-${Date.now()}` })
    };

    return {
        status: 'SUCCESS',
        receipt
    };
};

// 3. El Wrapper Timeout del Cliente
export const processPaymentWithTimeout = (
    cart: Account[],
    { timeoutMs = 5000, signal }: { timeoutMs?: number; signal?: AbortSignal } = {}
): Promise<PaymentResponse> => {
    return Promise.race([
        processPayment(cart, signal),
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new PaymentTimeoutError()), timeoutMs)
        ),
    ]);
};