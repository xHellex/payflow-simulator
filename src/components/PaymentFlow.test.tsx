// src/components/PaymentFlow.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Receipt } from './Receipt';
import { PaymentModal } from './PaymentModal';
import { usePaymentStore } from '../store/usePaymentStore';

describe('Flujo de Integración UI', () => {
    // Limpiamos el estado global de Zustand antes de cada prueba
    beforeEach(() => {
        usePaymentStore.setState({ cart: [], status: 'IDLE', receipt: null });
    });

    it('1. Muestra el voucher FONASA solo cuando el recibo lo incluye', () => {
        // Inyectamos un recibo simulado con Fonasa
        usePaymentStore.setState({
            receipt: {
                transactionId: 'TXN-123',
                date: new Date().toISOString(),
                totalAmount: 5000,
                paidAccounts: [],
                paymentMethod: 'Webpay',
                status: 'COMPLETED',
                fonasaVoucherCode: 'FNS-9999'
            }
        });

        render(<Receipt />);

        // Verificamos que el badge y el folio especial existan en el HTML
        expect(screen.getByText('FONASA')).toBeInTheDocument();
        expect(screen.getByText('Folio: FNS-9999')).toBeInTheDocument();
    });

    it('2. Bloquea el submit si el RUT tiene formato inválido', async () => {
        // Agregamos una cuenta al carrito para poder ver el formulario
        usePaymentStore.setState({
            cart: [{
                id: '1', companyName: 'Test', category: 'Luz', amount: 1000,
                dueDate: '2026', clientIdentifier: '1'
            }],
            status: 'IDLE'
        });

        render(<PaymentModal onClose={() => { }} />);

        // Simulamos que el usuario escribe un RUT inválido (sin guion)
        const rutInput = screen.getByPlaceholderText('12345678-9');
        fireEvent.change(rutInput, { target: { value: '111122223' } });

        // Hacemos clic en pagar
        const payButton = screen.getByRole('button', { name: /Pagar/i });
        fireEvent.click(payButton);

        // Zod es asíncrono, así que esperamos a que aparezca el mensaje de error
        await waitFor(() => {
            expect(screen.getByText(/Formato inválido/i)).toBeInTheDocument();
        });
    });

    it('3. Permite reintentar tras un rechazo y vuelve al formulario', () => {
        // Forzamos la máquina de estados a la vista de ERROR
        usePaymentStore.setState({ status: 'ERROR' });

        render(<PaymentModal onClose={() => { }} />);

        // Confirmamos que estamos en la pantalla de rechazo
        expect(screen.getByText('Transacción Rechazada')).toBeInTheDocument();

        // Hacemos clic en reintentar
        const retryButton = screen.getByRole('button', { name: /Reintentar Pago/i });
        fireEvent.click(retryButton);

        // Al reintentar, Zustand vuelve a 'IDLE' y el formulario debe reaparecer
        expect(screen.getByRole('button', { name: /Pagar/i })).toBeInTheDocument();
    });
});