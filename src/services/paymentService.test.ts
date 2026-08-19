// src/services/paymentService.test.ts
/// <reference types="vitest" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processPaymentWithTimeout, PaymentRejectedError, PaymentTimeoutError } from './paymentService';
import type { Account } from '../types';

describe('Payment Service Simulator', () => {

    // 1. Activamos los Fake Timers antes de cada prueba
    beforeEach(() => {
        vi.useFakeTimers();
    });

    // 2. Restauramos el reloj real al terminar
    afterEach(() => {
        vi.useRealTimers();
    });

    const normalAccount: Account = {
        id: '1', companyName: 'Aguas Andinas', category: 'Agua', amount: 10000,
        dueDate: '2026-08-25', clientIdentifier: '12345678-9'
    };

    const fonasaAccount: Account = {
        id: '2', companyName: 'Fonasa', category: 'Fonasa', amount: 5000,
        dueDate: '2026-08-20', clientIdentifier: '12345678-9'
    };

    it('debe procesar exitosamente un pago normal', async () => {
        const cart = [normalAccount];

        // Disparamos la promesa
        const promise = processPaymentWithTimeout(cart);

        // Avanzamos el reloj artificialmente los 2 segundos que tarda el servidor
        await vi.advanceTimersByTimeAsync(2000);

        const response = await promise;

        expect(response.status).toBe('SUCCESS');
        expect(response.receipt).toBeDefined();
        expect(response.receipt?.totalAmount).toBe(10000);
        expect(response.receipt?.fonasaVoucherCode).toBeUndefined();
    });

    it('debe generar un voucher de Fonasa si hay un pago médico en el carrito', async () => {
        const cart = [normalAccount, fonasaAccount];

        const promise = processPaymentWithTimeout(cart);
        await vi.advanceTimersByTimeAsync(2000);
        const response = await promise;

        expect(response.status).toBe('SUCCESS');
        expect(response.receipt?.fonasaVoucherCode).toBeDefined();
        expect(response.receipt?.fonasaVoucherCode).toMatch(/^FNS-/);
    });

    it('debe rechazar la transacción si el monto total termina en 99 (Fondos Insuficientes)', async () => {
        const errorAccount = { ...normalAccount, amount: 1999 };
        const cart = [errorAccount];

        const promise = processPaymentWithTimeout(cart);

        // 1. Conectamos el expect ANTES de avanzar el tiempo
        const assertion = expect(promise).rejects.toThrow(PaymentRejectedError);

        // 2. Ahora sí, avanzamos el reloj
        await vi.advanceTimersByTimeAsync(2000);

        // 3. Esperamos a que la aserción termine
        await assertion;
    });

    it('debe lanzar TIMEOUT si el servidor tarda más del límite', async () => {
        const timeoutAccount = { ...normalAccount, amount: 1088 };
        const cart = [timeoutAccount];

        const promise = processPaymentWithTimeout(cart, { timeoutMs: 5000 });

        // 1. Conectamos el expect
        const assertion = expect(promise).rejects.toThrow(PaymentTimeoutError);

        // 2. Avanzamos el reloj al límite
        await vi.advanceTimersByTimeAsync(5000);

        // 3. Esperamos la aserción
        await assertion;
    });
});