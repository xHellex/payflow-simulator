// src/types/index.ts

// 1. Categorías de servicios a pagar
export type ServiceCategory = 'Agua' | 'Luz' | 'Fonasa' | 'Telecomunicaciones' | 'Autopista';

// 2. Estados de la máquina de pagos
export type PaymentStatus = 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR' | 'TIMEOUT';

// 3. Estructura de la deuda/cuenta
export interface Account {
    id: string;
    companyName: string;
    category: ServiceCategory;
    amount: number;
    dueDate: string;
    clientIdentifier: string; // Ej: RUT, Rol o Número de cliente
}

// 4. Estructura del Recibo de Transacción
export interface TransactionReceipt {
    transactionId: string;
    date: string;
    totalAmount: number;
    paidAccounts: Account[];
    paymentMethod: 'Webpay' | 'Cuenta_Reembolso' | 'Presencial';
    status: 'COMPLETED';
    // Propiedad opcional: Solo existirá si el pago incluye Fonasa
    fonasaVoucherCode?: string;
}

// 5. Respuesta esperada de nuestra API Mock
export interface PaymentResponse {
    status: 'SUCCESS'; // Cambiamos PaymentStatus por el string literal 'SUCCESS'
    message?: string;
    receipt?: TransactionReceipt;
}