import { AccountList } from './components/AccountList';
import { Cart } from './components/Cart';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-blue-900 text-white py-4 px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-400 rounded-md"></div>
          <h1 className="text-2xl font-bold tracking-tight">Demo PayFlow</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Pago de Cuentas</h2>
          <p className="text-slate-600 mt-2">Selecciona los servicios que deseas pagar hoy.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AccountList />
          </div>
          <div className="lg:col-span-1">
            <Cart />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;