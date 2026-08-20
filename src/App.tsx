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

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {/* flex-col para móvil, lg:flex-row para desktop */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Columna Izquierda: Cuentas (Toma más espacio en desktop) */}
          <div className="w-full lg:w-2/3">
            <AccountList />
          </div>

          {/* Columna Derecha: Carrito (Fijo en desktop) */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-8">
            <Cart />
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;