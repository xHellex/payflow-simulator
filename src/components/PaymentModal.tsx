// src/components/PaymentModal.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaymentStore } from '../store/usePaymentStore';
import { processPaymentWithTimeout, PaymentTimeoutError, PaymentRejectedError } from '../services/paymentService';
import { Receipt } from './Receipt';


// 1. Definimos el esquema estricto con Zod
const refundSchema = z.object({
    rut: z.string()
        .regex(/^[0-9]{7,8}-[0-9Kk]$/, 'Formato inválido. Usa guion y sin puntos (ej: 12345678-9)'),
    bank: z.string()
        .min(1, 'Selecciona un banco'),
    accountType: z.string()
        .min(1, 'Selecciona el tipo de cuenta'),
    accountNumber: z.string()
        .regex(/^[0-9]+$/, 'La cuenta solo debe contener números')
        .min(5, 'El número es muy corto'),
    email: z.string()
        .email('Ingresa un correo válido (ej: usuario@correo.com)')
});

type RefundForm = z.infer<typeof refundSchema>;

interface PaymentModalProps {
    onClose: () => void;
}

export const PaymentModal = ({ onClose }: PaymentModalProps) => {
    const { cart, status, setStatus, setReceipt, clearCart } = usePaymentStore();
    const [errorMessage, setErrorMessage] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<RefundForm>({
        resolver: zodResolver(refundSchema)
    });

    const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0);

    // 2. Orquestador de la transacción
    const onSubmit = async () => { // Quitamos 'data: RefundForm' ya que borramos el console.log
        setStatus('PROCESSING');
        setErrorMessage('');

        try {
            // Usamos el wrapper que abortará si tarda más de 5000ms
            const response = await processPaymentWithTimeout(cart, { timeoutMs: 5000 });
            setReceipt(response.receipt || null);
            setStatus('SUCCESS');
        } catch (error: unknown) {
            if (error instanceof PaymentTimeoutError) {
                setStatus('TIMEOUT');
                setErrorMessage(error.message);
                // Nota Arquitectónica: En un escenario real, un timeout en el cliente no asegura
                // que el banco no haya cobrado el dinero. Se requiere reconciliación asíncrona.
            } else if (error instanceof PaymentRejectedError) {
                setStatus('ERROR');
                setErrorMessage(error.message);
            } else {
                setStatus('ERROR');
                setErrorMessage('Ocurrió un error inesperado. Intenta nuevamente.');
            }
        }
    };

    const handleClose = () => {
        if (status === 'SUCCESS') clearCart();
        setStatus('IDLE');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">

                {/* Cabecera del Modal */}
                <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Pasarela de Pago Seguro</h3>
                    {status !== 'PROCESSING' && (
                        <button onClick={handleClose} className="text-blue-200 hover:text-white">✕</button>
                    )}
                </div>

                <div className="p-6">
                    {/* VISTA 1: FORMULARIO (IDLE) */}
                    {status === 'IDLE' && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
                                Por favor, ingresa una cuenta bancaria para devoluciones automáticas en caso de que la transacción falle con tu banco.
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">RUT</label>
                                    <input {...register('rut')} className="w-full border border-slate-300 rounded-md p-2 text-sm" placeholder="12345678-9" />
                                    {errors.rut && <p className="text-red-500 text-xs mt-1">{errors.rut.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Correo Electrónico</label>
                                    <input {...register('email')} className="w-full border border-slate-300 rounded-md p-2 text-sm" placeholder="correo@ejemplo.com" />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Banco</label>
                                    <select {...register('bank')} className="w-full border border-slate-300 rounded-md p-2 text-sm">
                                        <option value="">Seleccionar...</option>
                                        <option value="BancoEstado">BancoEstado</option>
                                        <option value="Banco de Chile">Banco de Chile</option>
                                        <option value="BCI">BCI</option>
                                        <option value="Santander">Santander</option>
                                    </select>
                                    {errors.bank && <p className="text-red-500 text-xs mt-1">{errors.bank.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de Cuenta</label>
                                    <select {...register('accountType')} className="w-full border border-slate-300 rounded-md p-2 text-sm">
                                        <option value="">Seleccionar...</option>
                                        <option value="Cuenta RUT">Cuenta RUT / Vista</option>
                                        <option value="Corriente">Cuenta Corriente</option>
                                    </select>
                                    {errors.accountType && <p className="text-red-500 text-xs mt-1">{errors.accountType.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">Número de Cuenta</label>
                                <input {...register('accountNumber')} className="w-full border border-slate-300 rounded-md p-2 text-sm" placeholder="Ej: 000123456" />
                                {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber.message}</p>}
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors mt-4">
                                Pagar ${totalAmount.toLocaleString('es-CL')}
                            </button>
                        </form>
                    )}

                    {/* VISTA 2: PROCESANDO */}
                    {status === 'PROCESSING' && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
                            <h3 className="text-lg font-bold text-slate-700">Procesando pago con el Banco...</h3>
                            <p className="text-slate-500 text-sm mt-2">Por favor, no cierres esta ventana.</p>
                        </div>
                    )}

                    {/* VISTA 3: ERROR / TIMEOUT */}
                    {(status === 'ERROR' || status === 'TIMEOUT') && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">!</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                {status === 'TIMEOUT' ? 'Tiempo de espera agotado' : 'Transacción Rechazada'}
                            </h3>
                            <p className="text-slate-600 text-sm mb-6">{errorMessage}</p>

                            <div className="flex gap-4 justify-center">
                                <button onClick={handleClose} className="px-4 py-2 border border-slate-300 rounded-md font-medium text-slate-600 hover:bg-slate-50">
                                    Cancelar
                                </button>
                                <button onClick={() => setStatus('IDLE')} className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">
                                    Reintentar Pago
                                </button>
                            </div>
                        </div>
                    )}

                    {/* VISTA 4: ÉXITO */}
                    {status === 'SUCCESS' && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">¡Pago Exitoso!</h3>

                            {/* Insertamos el componente del recibo aquí */}
                            <Receipt />

                            <button onClick={handleClose} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 mt-6 transition-colors">
                                Finalizar y Volver al Inicio
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};