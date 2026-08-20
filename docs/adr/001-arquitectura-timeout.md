# ADR 001: Implementación de Timeout del lado del cliente

## Contexto
En sistemas transaccionales, las caídas de red o la latencia excesiva del proveedor de pagos pueden dejar la UI bloqueada indefinidamente.

## Decisión
Se implementó un patrón `Promise.race` en la capa de servicios (`paymentService.ts`) que hace competir la petición de pago contra un temporizador estricto (5000ms), combinado con un `AbortController` inyectado desde la UI para permitir la cancelación manual por parte del usuario.

## Consecuencias
* **Positivas:** El usuario nunca queda bloqueado. Mejora la experiencia y la percepción de seguridad.
* **Negativas/Riesgos:** Un timeout o cancelación manual en el cliente no detiene la petición en vuelo hacia el banco. En un entorno real, el `AbortController.signal` se inyecta en el cliente HTTP (ej. `fetch`), pero esto solo corta la conexión de red. Si el servidor ya recibió la orden, el cobro puede efectuarse igual. Por ende, la arquitectura exige un proceso de conciliación asíncrono en el backend para reversar pagos "huérfanos".