// src/components/Cart.tsx
import { useState } from 'react';
import { usePaymentStore } from '../store/usePaymentStore';
import { PaymentModal } from './PaymentModal';


export const Cart = () => {
    const { cart, removeFromCart } = usePaymentStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const totalAmount = cart.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 sticky top-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Resumen de Pago</h2>

            {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    No has seleccionado cuentas para pagar.
                </div>
            ) : (
                <>
                    <div className="space-y-3 mb-6">
                        {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="text-slate-600">{item.companyName}</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-medium">${item.amount.toLocaleString('es-CL')}</span>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                        title="Eliminar"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-slate-200 pt-4 mb-6">
                        <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                            <span>Total a Pagar</span>
                            <span>${totalAmount.toLocaleString('es-CL')}</span>
                        </div>
                    </div>

                    <button onClick={() => setIsModalOpen(true)} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
                        Proceder al Pago
                    </button>
                </>
            )}
            {isModalOpen && <PaymentModal onClose={() => setIsModalOpen(false)} />}
        </div>

    );
};