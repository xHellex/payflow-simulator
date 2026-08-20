# ADR 002: Elección de Zustand sobre React Context para el Estado Global

## Contexto
El simulador requiere manejar un carrito de pagos dinámico que es accedido por múltiples componentes (Catálogo, Modal, Recibo) en diferentes niveles del árbol de renderizado.

## Decisión
Se eligió **Zustand** en lugar de la API nativa de React Context.

## Consecuencias
* **Positivas:** Se evita el *prop-drilling* y el infierno de *Providers* anidados. Zustand previene renderizados innecesarios al permitir que los componentes se suscriban solo a las porciones del estado que necesitan (ej. un componente puede leer el `cart` sin re-renderizarse si cambia el `status` de la transacción).
* **Negativas:** Introduce una dependencia externa de terceros (~1.1kB) en lugar de utilizar herramientas nativas de React.