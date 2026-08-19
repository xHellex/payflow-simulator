// src/components/AccountList.tsx
import { mockAccounts } from '../data/mockAccounts';
import { usePaymentStore } from '../store/usePaymentStore';

export const AccountList = () => {
    const { cart, addToCart } = usePaymentStore();

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Cuentas por Pagar</h2>
            <div className="space-y-4">
                {mockAccounts.map((account) => {
                    const isInCart = cart.some((item) => item.id === account.id);

                    return (
                        <div
                            key={account.id}
                            className="flex justify-between items-center p-4 border border-slate-100 rounded-lg hover:border-blue-100 hover:bg-slate-50 transition-colors"
                        >
                            <div>
                                <h3 className="font-semibold text-slate-700">{account.companyName}</h3>
                                <p className="text-sm text-slate-500">
                                    {account.category} • Vence: {account.dueDate}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Identificador: {account.clientIdentifier}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-slate-800">
                                    ${account.amount.toLocaleString('es-CL')}
                                </p>
                                <button
                                    onClick={() => addToCart(account)}
                                    disabled={isInCart}
                                    className={`mt-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${isInCart
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {isInCart ? 'Agregado' : 'Agregar al pago'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};