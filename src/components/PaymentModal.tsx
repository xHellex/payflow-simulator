// src/components/PaymentModal.tsx
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaymentStore } from '../store/usePaymentStore';
import { processPaymentWithTimeout, PaymentTimeoutError, PaymentRejectedError } from '../services/paymentService';
import { Receipt } from './Receipt';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

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
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<RefundForm>({
        resolver: zodResolver(refundSchema)
    });

    const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0);

    // a11y: Trap de foco inicial, ciclo con Tab y cierre con ESC
    useEffect(() => {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        // 1. Identificar todos los elementos que pueden recibir foco dentro del modal
        const focusableSelectors = 'button, [href], input, select, textare, [tabindex]:not([tabindex="-1"])';
        const focusableElements = modalElement.querySelectorAll<HTMLElement>(focusableSelectors);

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Validación extra para satisfacer el modo estricto de TypeScript
        if (!firstElement || !lastElement) return;

        // 2. Dar el foco inicial al primer elemento interactivo al abrir el modal
        firstElement.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            // 3. Manejar el cierre con la tecla Escape
            if (e.key === 'Escape' && status !== 'PROCESSING') {
                onClose();
                return;
            }

            // 4. Implementar el Focus Trap si se presiona la tecla Tab
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Si presiona Shift + Tab (navegación hacia atrás)
                    if (document.activeElement === firstElement) {
                        e.preventDefault(); // Evita que el navegador saque el foco del modal
                        lastElement.focus(); // Lo enviamos al final
                    }
                } else {
                    // Si presiona solo Tab (navegación hacia adelante)
                    if (document.activeElement === lastElement) {
                        e.preventDefault(); // Evita que el navegador saque el foco del modal
                        firstElement.focus(); // Lo devolvemos al inicio
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, onClose]);

    // Orquestador de la transacción unificado
    const onSubmit = async () => {
        setStatus('PROCESSING');
        setErrorMessage('');

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const response = await processPaymentWithTimeout(cart, {
                timeoutMs: 5000,
                signal: controller.signal
            });
            setReceipt(response.receipt || null);
            setStatus('SUCCESS');
        } catch (error: unknown) {
            if (error instanceof Error && error.message === 'Aborted') {
                setStatus('IDLE');
            } else if (error instanceof PaymentTimeoutError) {
                setStatus('TIMEOUT');
                setErrorMessage(error.message);
            } else if (error instanceof PaymentRejectedError) {
                setStatus('ERROR');
                setErrorMessage(error.message);
            } else {
                setStatus('ERROR');
                setErrorMessage('Ocurrió un error inesperado. Intenta nuevamente.');
            }
        }
    };

    const handleCancelRequest = () => {
        abortController?.abort();
    };

    const handleClose = () => {
        if (status === 'SUCCESS') clearCart();
        setStatus('IDLE');
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                ref={modalRef}
                tabIndex={-1}
                className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden outline-none"
            >
                <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <h3 id="modal-title" className="font-bold text-lg">Pasarela de Pago Seguro</h3>
                    {status !== 'PROCESSING' && (
                        <button onClick={handleClose} className="text-blue-200 hover:text-white" aria-label="Cerrar modal">✕</button>
                    )}
                </div>

                {/* Contenedor aria-live para anunciar estados al lector de pantalla */}
                <div aria-live="polite" className="p-6">

                    {/* VISTA 1: FORMULARIO (IDLE) */}
                    {status === 'IDLE' && (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
                                Por favor, ingresa una cuenta bancaria para devoluciones automáticas en caso de que la transacción falle con tu banco.
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="RUT" placeholder="12345678-9" error={errors.rut?.message} {...register('rut')} />
                                <Input label="Correo Electrónico" placeholder="correo@ejemplo.com" error={errors.email?.message} {...register('email')} />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Banco</label>
                                    <select {...register('bank')} className={`w-full border rounded-md p-2 text-sm ${errors.bank ? 'border-red-500' : 'border-slate-300'}`} aria-invalid={!!errors.bank}>
                                        <option value="">Seleccionar...</option>
                                        <option value="BancoEstado">BancoEstado</option>
                                        <option value="Banco de Chile">Banco de Chile</option>
                                        <option value="BCI">BCI</option>
                                        <option value="Santander">Santander</option>
                                    </select>
                                    {errors.bank && <p className="text-red-500 text-xs mt-1" role="alert">{errors.bank.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">Tipo de Cuenta</label>
                                    <select {...register('accountType')} className={`w-full border rounded-md p-2 text-sm ${errors.accountType ? 'border-red-500' : 'border-slate-300'}`} aria-invalid={!!errors.accountType}>
                                        <option value="">Seleccionar...</option>
                                        <option value="Cuenta RUT">Cuenta RUT / Vista</option>
                                        <option value="Corriente">Cuenta Corriente</option>
                                    </select>
                                    {errors.accountType && <p className="text-red-500 text-xs mt-1" role="alert">{errors.accountType.message}</p>}
                                </div>
                            </div>

                            <Input label="Número de Cuenta" placeholder="Ej: 000123456" error={errors.accountNumber?.message} {...register('accountNumber')} />

                            <Button type="submit" variant="primary" className="mt-4">
                                Pagar ${totalAmount.toLocaleString('es-CL')}
                            </Button>
                        </form>
                    )}

                    {/* VISTA 2: PROCESANDO */}
                    {status === 'PROCESSING' && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mb-4" aria-hidden="true"></div>
                            <h3 className="text-lg font-bold text-slate-700">Procesando pago con el Banco...</h3>
                            <p className="text-slate-500 text-sm mt-2">Por favor, no cierres esta ventana.</p>

                            <Button onClick={handleCancelRequest} variant="secondary" className="mt-6 w-auto px-6 py-2 text-sm">
                                Cancelar Transacción
                            </Button>
                        </div>
                    )}

                    {/* VISTA 3: ERROR / TIMEOUT */}
                    {(status === 'ERROR' || status === 'TIMEOUT') && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl" aria-hidden="true">!</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                {status === 'TIMEOUT' ? 'Tiempo de espera agotado' : 'Transacción Rechazada'}
                            </h3>
                            <p className="text-slate-600 text-sm mb-6">{errorMessage}</p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button onClick={handleClose} variant="secondary" className="w-full sm:w-auto">
                                    Cancelar
                                </Button>
                                <Button onClick={() => setStatus('IDLE')} variant="primary" className="w-full sm:w-auto">
                                    Reintentar Pago
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* VISTA 4: ÉXITO */}
                    {status === 'SUCCESS' && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl" aria-hidden="true">✓</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">¡Pago Exitoso!</h3>

                            <Receipt />

                            <Button onClick={handleClose} variant="primary" className="mt-6">
                                Finalizar y Volver al Inicio
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};