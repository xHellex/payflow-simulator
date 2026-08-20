# 💳 PayFlow Simulator - Pasarela de Pagos Transaccional

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_Strict-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-4A4A55?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
[![CI Tests](https://github.com/xHellex/payflow-simulator/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/xHellex/payflow-simulator/actions/workflows/test.yml)

🟢 **Demo en vivo:** [Haz clic aquí para probar el simulador](https://payflow-simulator-one.vercel.app/)

Un simulador de frontend (SPA) que replica la complejidad del flujo de pago de servicios básicos e institucionales (inspirado en sistemas transaccionales reales). 

El objetivo de este proyecto es demostrar el manejo avanzado del estado de la UI, la validación estricta de datos en tiempo de ejecución (Runtime), el cumplimiento de normativas de accesibilidad (WCAG) y el renderizado condicional basado en reglas de negocio específicas, todo respaldado por pruebas unitarias y de integración.

## 🚀 Arquitectura y Decisiones Técnicas

Este proyecto evita el acoplamiento y prioriza la separación de responsabilidades (Separation of Concerns).

* **Manejo de Estado (Zustand):** Se eligió Zustand por sobre React Context para manejar el carrito de pagos. Evita el *prop-drilling* y los renderizados innecesarios, manteniendo una API limpia y directa.
* **Control de Latencia (Promise.race & AbortController):** El cliente no confía ciegamente en el servidor. Se implementó un timeout del lado del cliente (`5000ms`) y un botón de cancelación manual que aborta la promesa de pago, evitando que la UI quede bloqueada indefinidamente.
* **Accesibilidad (a11y - WCAG):** El modal transaccional cuenta con soporte para navegación por teclado (gestión de foco inicial, Esc para cerrar) y lectores de pantalla (uso de role="dialog", aria-modal="true", role="alert" en errores y regiones aria-live="polite" para anunciar los cambios de estado asíncronos).
* **Validación de Formularios (React Hook Form + Zod):** El formulario de reembolso incluye validaciones estrictas con expresiones regulares (Regex) para el RUT chileno y el número de cuenta, garantizando que el `submit` solo ocurra con datos saneados.
* **Simulador Determinista de API:** En la capa de servicios (`paymentService.ts`), los errores no son aleatorios. Se programó un interceptor que lanza clases de error personalizadas (`PaymentRejectedError`, `PaymentTimeoutError`) basados en el monto a pagar, permitiendo realizar pruebas TDD predecibles.

## 🧪 Casos de Uso y Testing Manual

El motor de pagos está diseñado para forzar distintos escenarios. Puedes probarlos agregando las siguientes cuentas al carrito:

1. **Flujo Exitoso Normal:** Agrega "Aguas Andinas". El pago procesará en 2 segundos y devolverá un comprobante estándar.
2. **Renderizado Condicional (Regla de Negocio):** Agrega "Fonasa". El motor detectará la categoría institucional e inyectará un código de atención. La vista del recibo reaccionará dibujando un Voucher Médico adicional.
3. **Manejo de Errores (Rechazo):** Agrega "Enel" (Monto: $24.999). El motor interceptará la terminación `99` y forzará un rechazo por "Fondos Insuficientes". La UI transicionará limpiamente al estado de error ofreciendo reintento.
4. **Manejo de Latencia (Timeout & AbortController):** Agrega "VTR" (Monto: $32.088). La terminación `88` obligará a la pasarela a colgarse. El usuario puede cancelar la transacción manualmente con el botón, o esperar 5 segundos para que la máquina de estados aborte por timeout.

## 🛠️ Instalación y Ejecución

Este proyecto utiliza `pnpm` para la gestión de dependencias.

```bash
# 1. Clonar el repositorio
git clone [https://github.com/xHellex/payflow-simulator.git](https://github.com/xHellex/payflow-simulator.git)
cd payflow-simulator

# 2. Instalar dependencias
pnpm install

# 3. Levantar el entorno de desarrollo
pnpm dev

# 4. Ejecutar la suite de pruebas (Lógica de Negocio e Integración UI)
pnpm test