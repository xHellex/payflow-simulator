# ADR 003: Motor de Errores Deterministas vs Aleatoriedad

## Contexto
Para probar el manejo de estados de la pasarela de pagos (Éxito, Rechazo, Timeout), se necesitaba simular las respuestas de un servidor bancario.

## Decisión
Se implementó un interceptor determinista basado en el monto de la transacción (ej. terminar en `99` lanza `PaymentRejectedError`, terminar en `88` fuerza un `PaymentTimeoutError`), descartando el uso de `Math.random()`.

## Consecuencias
* **Positivas:** Garantiza que las pruebas unitarias e integración (TDD con Vitest) sean 100% predecibles y reproducibles. Permite documentar casos de uso exactos para la evaluación manual del simulador sin depender del azar.
* **Negativas:** Acopla ligeramente los datos de prueba (`mockAccounts.ts`) a las reglas del servicio, exigiendo que los montos se mantengan fijos para no romper las pruebas automatizadas.