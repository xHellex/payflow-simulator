// src/components/Receipt.tsx
import { usePaymentStore } from '../store/usePaymentStore';

export const Receipt = () => {
    const { receipt } = usePaymentStore();

    if (!receipt) return null;

    return (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mt-4 text-left">
            <div className="text-center mb-6 border-b border-slate-200 pb-4">
                <h4 className="font-bold text-slate-800 text-lg uppercase tracking-widest">Comprobante de Pago</h4>
                <p className="text-slate-500 text-sm">Sencillito PayFlow</p>
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-6 font-mono">
                <p><span className="font-bold">N° Transacción:</span> {receipt.transactionId}</p>
                <p><span className="font-bold">Fecha:</span> {new Date(receipt.date).toLocaleString('es-CL')}</p>
                <p><span className="font-bold">Método de Pago:</span> {receipt.paymentMethod}</p>
                <p><span className="font-bold">Estado:</span> {receipt.status}</p>
            </div>

            <div className="mb-6">
                <h5 className="font-bold text-slate-700 border-b border-slate-200 pb-2 mb-2">Cuentas Pagadas</h5>
                <ul className="space-y-2">
                    {receipt.paidAccounts.map((acc) => (
                        <li key={acc.id} className="flex justify-between text-sm">
                            <span>{acc.companyName}</span>
                            <span className="font-mono">${acc.amount.toLocaleString('es-CL')}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex justify-between items-center font-bold text-lg text-slate-800 border-t border-slate-300 pt-4">
                <span>TOTAL PAGADO</span>
                <span>${receipt.totalAmount.toLocaleString('es-CL')}</span>
            </div>

            {/* RENDERIZADO CONDICIONAL: Voucher de Fonasa */}
            {receipt.fonasaVoucherCode && (
                <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">FONASA</span>
                        <span className="font-bold text-blue-900 text-sm">Orden de Atención Médica</span>
                    </div>
                    <p className="text-xs text-blue-800 mb-1">Este comprobante es válido para su atención.</p>
                    <p className="font-mono font-bold text-blue-900 text-lg">Folio: {receipt.fonasaVoucherCode}</p>
                </div>
            )}
        </div>
    );
};