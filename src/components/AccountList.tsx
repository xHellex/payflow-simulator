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
                        <div key={account.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border border-slate-200 rounded-xl gap-4">

                            {/* Sección Izquierda: Textos */}
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800">{account.companyName}</h3>
                                <p className="text-sm text-slate-500">{account.category} • Vence: {account.dueDate}</p>
                                <p className="text-xs text-slate-400 mt-1">Identificador: {account.clientIdentifier}</p>
                            </div>

                            {/* Sección Derecha: Precio y Botón */}
                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 mt-2 sm:mt-0">
                                <span className="text-lg font-bold text-slate-800 mb-0 sm:mb-2">
                                    ${account.amount.toLocaleString('es-CL')}
                                </span>

                                <button
                                    onClick={() => addToCart(account)}
                                    disabled={isInCart}
                                    className={`w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${isInCart
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