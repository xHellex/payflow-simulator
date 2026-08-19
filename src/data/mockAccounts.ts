// src/data/mockAccounts.ts
import type { Account } from '../types';
export const mockAccounts: Account[] = [
    {
        id: '1',
        companyName: 'Aguas Andinas',
        category: 'Agua',
        amount: 15500,
        dueDate: '2026-08-25',
        clientIdentifier: '11223344-5'
    },
    {
        id: '2',
        companyName: 'Enel',
        category: 'Luz',
        amount: 24999, // Termina en 99: Forzará el error de "Fondos Insuficientes" en nuestro simulador
        dueDate: '2026-08-28',
        clientIdentifier: '5566778-9'
    },
    {
        id: '3',
        companyName: 'Fonasa (Bono Consulta)',
        category: 'Fonasa',
        amount: 5500,
        dueDate: '2026-08-20',
        clientIdentifier: '16123456-7'
    },
    {
        id: '4',
        companyName: 'VTR',
        category: 'Telecomunicaciones',
        amount: 32088, // Termina en 88: Forzará el "Timeout" en nuestro simulador
        dueDate: '2026-08-30',
        clientIdentifier: '99887766-1'
    }
];