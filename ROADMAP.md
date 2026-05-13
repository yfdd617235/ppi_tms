# PPI TMS — Hoja de Ruta del Proyecto

Marca cada paso con `[x]` cuando esté completado.

---

## FASE 1 — Configuración de Supabase (Prerequisito)

> Sin esto, la app no puede arrancar. Hacerlo antes de continuar con cualquier otra fase.

- [x] Proyecto Next.js 16 inicializado con shadcn/ui, Tailwind v4
- [x] Dependencias instaladas (`@supabase/ssr`, `resend`, `zod`, `react-hook-form`, etc.)
- [x] Esquema SQL completo creado → `supabase/migrations/001_initial_schema.sql`
- [x] **1.1** Crear proyecto en [supabase.com](https://supabase.com) y copiar credenciales
- [x] **1.2** Copiar `.env.local.example` a `.env.local` y rellenar todas las variables
- [x] **1.3** Ejecutar `supabase/migrations/001_initial_schema.sql` en el SQL Editor de Supabase
- [x] **1.4** En Supabase → Storage → crear bucket `payment-proofs` (privado)
- [x] **1.5** En Supabase → Storage → crear bucket `payment-evidence` (privado)
- [x] **1.6** En Supabase → Auth → deshabilitar "Confirm email" (para pruebas iniciales)
- [x] **1.7** Crear el primer usuario `super_admin` desde Supabase Auth → Users → "Invite user", luego actualizar `profiles.role = 'super_admin'` manualmente en la tabla
- [x] **1.8** Verificar que `npm run dev` levanta sin errores y el login funciona

---

## FASE 2 — Módulo de Ingresos Completo

- [x] Tabla de ingresos (cliente) con estados y colores
- [x] Formulario "Nueva solicitud de ingreso" (cliente)
- [x] Server Action `createIncomeRequest` con validación Zod
- [x] Notificación email a PPI al enviar (Resend)
- [x] Tabla de ingresos (super admin) con todas las empresas
- [x] **2.1** Integrar carga de archivo (soporte de pago) al formulario del cliente → subir a bucket `payment-proofs` en Supabase Storage antes de guardar el registro
- [x] **2.2** Botón "Verificar" en la fila de la tabla de ingresos (super admin) → abre un diálogo con:
  - Campo `valor_real` (numérico obligatorio)
  - Campo `comision_rate` (porcentaje, default 0.4%) — el super admin puede ajustar la tasa por transacción
  - Resumen automático de comisión PPI y 4x1000 calculado en tiempo real según la tasa ingresada
  - Campo notas (opcional)
  - Botón "Confirmar verificación"
- [x] **2.3** Server Action `verifyIncomeRequest` → actualiza `estado = 'verificado'` y `valor_real`, `comision_rate`, `verificado_por`, `verificado_at`
- [x] **2.8** Comisión PPI variable: el super admin puede ingresar cualquier porcentaje de comisión al verificar un ingreso; la tasa se persiste en `income_requests.comision_rate` y el trigger la usa para calcular `comision_ppi`, `valor_neto` y actualizar saldos
- [x] **2.4** Verificar que el trigger PostgreSQL actualiza automáticamente `saldo_bruto` y `saldo_neto` (Disponible) al verificar
- [x] **2.5** Botón "Rechazar" en la tabla (super admin) → dialogo con nota de rechazo
- [x] **2.6** Ver / descargar soporte adjunto desde la tabla (ícono de clip) → URL firmada de Supabase Storage
- [x] **2.7** El cliente puede ver el soporte que adjuntó desde su vista

---

## FASE 3 — Módulo de Egresos Completo

- [x] Tabla de egresos (cliente) con estados y colores
- [x] Formulario "Nueva solicitud de egreso" (cliente): cuenta, valor, tipo pago, beneficiario existente o nuevo, guardar beneficiario
- [x] Server Action `createExpenseRequest` con validación Zod
- [x] Tabla de egresos (super admin) con todas las empresas
- [x] **3.1** Botón "Ejecutar pago" en la fila de la tabla de egresos (super admin) → abre diálogo con:
  - Detalle del egreso (empresa, beneficiario, valor)
  - Campo para subir evidencia de pago → bucket `payment-evidence`
  - Notas (opcional)
  - Botón "Confirmar ejecución"
- [x] **3.2** Server Action `executeExpenseRequest` → actualiza `estado = 'ejecutado'`, `ejecutado_por`, `ejecutado_at`, `evidencia_url`
- [x] **3.3** Verificar que el trigger PostgreSQL deduce automáticamente el saldo al ejecutar
- [x] **3.4** Botón "Rechazar" en la tabla (super admin) → diálogo con nota
- [x] **3.5** El cliente puede ver la evidencia de pago adjunta por el super admin
- [x] **3.6** Opción de fecha programada en el formulario del cliente (date picker)
- [x] **3.7** Mostrar en la tabla del cliente si el egreso es "a discreción de PPI" o tiene fecha programada
- [x] **3.8** Corrección del trigger `process_expense_execution()`: fórmula proporcional `saldo_bruto -= valor × (saldo_bruto / saldo_neto)` garantiza que retirar el 100% del saldo disponible deja `saldo_bruto` en cero

---

## FASE 4 — Gestión de Empresas y Cuentas (Super Admin)

- [x] Lista de empresas en `/superadmin/empresas` (vista básica)
- [x] **4.1** Botón "Nueva empresa" → formulario completo con todos los campos de la ficha:
  - Razón social, NIT, dirección, correo, celular
  - Nombre y datos del representante legal
  - Nombre, correo y teléfono del contacto de operaciones
- [x] **4.2** Botón "Editar empresa" → mismo formulario en modo edición
- [x] **4.3** Botón "Ver detalle empresa" → página con:
  - [x] Ficha completa de la empresa
  - [x] Lista de cuentas asociadas
  - [x] Lista de usuarios de esa empresa
  - [x] Historial de ingresos y egresos de esa empresa
- [x] **4.4** En la página de detalle: "Nueva cuenta" → formulario (nombre, descripción, `egreso_a_discrecion`)
- [x] **4.5** Editar cuenta → cambiar nombre, descripción y condición de egresos
- [x] **4.6** Activar/Desactivar empresa (toggle)
- [x] **4.7** Asignación de cuentas del catálogo durante la creación de empresa (formulario unificado con checkboxes + `egreso_a_discrecion` por cuenta)

---

## FASE 5 — Gestión de Usuarios (Super Admin)

> La invitación de usuarios se hace desde la ficha de cada empresa (Fase 4).
> Esta fase es un panel centralizado de consulta y edición.

- [x] **5.1** Lista de todos los usuarios en `/superadmin/usuarios` con empresa, rol y fecha
- [x] **5.2** Editar usuario → cambiar nombre, rol o empresa asignada
- [x] **5.3** Eliminar usuario (con confirmación y protección contra auto-eliminación)


---

## FASE 6 — Gestión de Beneficiarios (Cliente)

- [x] Lista de beneficiarios en `/cliente/beneficiarios` (vista básica)
- [x] **6.1** Botón "Nuevo beneficiario" → formulario completo con validación según tipo (cheque/transferencia/efectivo)
- ~~**6.2** Botón "Editar beneficiario"~~ — descartado: los beneficiarios son inmutables por auditoría; el cliente puede eliminar y crear uno nuevo si necesita corregir datos
- [x] **6.3** Botón "Eliminar / Desactivar beneficiario"
- [x] **6.4** Soporte del tipo "Efectivo" en beneficiarios: campos Nombre, Cédula/NIT y Punto de Entrega Registrado (sin datos bancarios)
- [x] **6.5** Filtrado de beneficiarios en formulario de egreso según tipo de pago seleccionado (evita inconsistencias tipo/pago)
- [x] **6.6** Tarjeta de detalle del beneficiario al seleccionarlo en nueva solicitud de egreso (nombre, cédula/NIT, banco, tipo cuenta, número cuenta, punto de entrega)
- [x] **6.7** El super admin ve `punto_entrega` al revisar/ejecutar egresos de tipo efectivo — implementado en `components/egresos/admin-expense-actions.tsx`

---

## FASE 7 — Configuración de Cuenta (Cliente)

- ~~**7.1** En `/cliente` → cada tarjeta de cuenta tiene un botón "Configurar"~~ — descartado: `egreso_a_discrecion` es condición contractual que controla PPI, no el cliente
- ~~**7.2** Toggle para cambiar `egreso_a_discrecion`~~ — descartado por la misma razón
- [x] **7.3** El cliente ve en su dashboard qué cuentas operan "A discreción de PPI" (badge informativo, solo lectura)

---

## FASE 8 — Vistas de Solo Lectura (Admin)

- [x] Dashboard admin básico
- [x] **8.1** `/admin/empresas` → misma vista que super admin pero sin botones de acción
- [x] **8.2** `/admin/ingresos` → misma tabla que super admin pero sin botón Verificar
- [x] **8.3** `/admin/egresos` → misma tabla que super admin pero sin botón Ejecutar
- [x] **8.4** El admin puede ver soportes y evidencias adjuntas

---

## FASE 9 — Perfil de Usuario

- [x] **9.1** Página `/perfil` → editar nombre completo y contraseña
- [x] **9.2** Link "Mi perfil" en el menú de usuario (header) ya existe → conectarlo a la página

---

## FASE 10 — Inteligencia Financiera y Reporting TMS

- [x] **10.1** Corregir cálculo de "Total en custodia" en el Dashboard del Super Admin (sumar `saldo_neto` de `company_accounts`).
- [x] **10.2** Estado de Cuenta / Ledger (Super Admin):
  - `/superadmin/empresas/[id]/ledger` — ledger por empresa con running balance, filtro de fechas y export CSV.
  - `/superadmin/estado-de-cuenta` — ledger consolidado global con filtro por empresa y fecha.
  - `/admin/estado-de-cuenta` — misma vista consolidada para el rol admin (solo lectura).
- [x] **10.3** Estado de Cuenta (Cliente) — `/cliente/estado-de-cuenta`:
  - Historial filtrable con desglose de tarifa de custodia y 4×1000 por ingreso (transparencia total).
  - Export CSV desde la misma página.
- [x] **10.4** Dashboard Financiero Avanzado (Super Admin) en `/superadmin`:
  - KPIs del mes: total procesado, tarifas cobradas, nº de ingresos verificados.
  - Gráfica de barras: ingresos vs egresos por mes (últimos 6 meses).
  - Gráfica de línea: tarifa de custodia cobrada por mes.
  - Gráfica de dona: distribución del saldo en custodia por cliente.
- [x] **10.5** Exportación CSV — API route `/api/ledger/export` con filtros por empresa y fecha.

---

## FASE 11 — Notificaciones Telegram al Super Admin

- [x] **11.1** Crear `lib/telegram.ts` con helper `sendTelegramAlert(message)` — fetch nativo a la Bot API, no bloqueante.
- [x] **11.2** Agregar notificación Telegram en `cliente/ingresos/actions.ts` al crear solicitud de ingreso (🟢 con empresa y valor).
- [x] **11.3** Agregar notificación Telegram en `cliente/egresos/actions.ts` al crear solicitud de egreso (🔴 con empresa y valor).
- [ ] **11.4** Configurar variables de entorno en `.env.local` y Vercel:
  - `TELEGRAM_BOT_TOKEN` — obtenido de @BotFather en Telegram
  - `TELEGRAM_CHAT_ID` — obtenido de `api.telegram.org/bot{TOKEN}/getUpdates`

---

## FASE 12 — UX y Detalles de Interfaz

- [x] **12.1** Añadir `<Toaster />` de sonner al layout raíz y usar `toast.success()` / `toast.error()` en todas las acciones (reemplaza los mensajes de error inline)
- [ ] **12.2** Skeletons de carga para tablas y dashboards (descartado — Server Components no lo requieren)
- [x] **12.3** Estado vacío con ilustración o mensaje claro en cada tabla
- [x] **12.4** Paginación en las tablas cuando hay más de 20 registros
- [x] **12.5** Búsqueda/filtro por fecha y estado en las tablas de ingresos/egresos
- [x] **12.6** Diseño responsive para móvil (hamburger menu para el sidebar)
- [x] **12.7** Confirmación antes de acciones destructivas (rechazar, eliminar)

---

## FASE 13 — Seguridad y Calidad

- [x] **13.1** Validar `company_id` en `/api/storage/proof` antes de generar URL firmada — clientes solo pueden acceder a archivos de su propia empresa en `payment-proofs`; admins tienen acceso libre
- [x] **13.2** Validar en Server Actions que el `company_id` del usuario coincide con el del registro que está modificando — implementado en `ingresos/actions.ts`, `egresos/actions.ts` y `beneficiarios/actions.ts`
- [x] **13.3** Validación backend de tamaño de archivos (máx 10MB) en `cliente/ingresos/actions.ts` y `superadmin/egresos/actions.ts`
- [x] **13.4** Verificar que ningún rol puede acceder al dashboard sin sesión activa — implementado via `proxy.ts` (middleware) + `app/(dashboard)/layout.tsx` (doble capa)
- [ ] **13.5** Rate limiting en Server Actions — descartado para esta versión (TMS interno con <10 clientes; requiere dependencia externa como Upstash Redis)

---

## FASE 14 — Despliegue a Producción

- [ ] **14.1** Crear proyecto de producción en Supabase (separado del de desarrollo)
- [ ] **14.2** Ejecutar migraciones en producción
- [ ] **14.3** Conectar repositorio a Vercel → configurar variables de entorno de producción
- [ ] **14.4** Configurar dominio personalizado en Vercel (si aplica)
- [ ] **14.5** Verificar que el callback de auth (`/api/auth/callback`) funciona en producción
- [ ] **14.6** Configurar `NEXT_PUBLIC_APP_URL` con la URL de producción
- [ ] **14.7** Prueba end-to-end en producción:
  - Crear empresa → crear usuario → login como cliente → enviar ingreso → verificar como admin → enviar egreso → ejecutar como admin → revisar saldos

---

## Resumen de progreso

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Configuración Supabase | ✅ Completo |
| 2 | Módulo Ingresos Completo | ✅ Completo |
| 3 | Módulo Egresos Completo | ✅ Completo |
| 4 | Gestión de Empresas y Cuentas | ✅ Completo |
| 5 | Gestión de Usuarios | ✅ Completo |
| 6 | Gestión de Beneficiarios | ✅ Completo (6.2 descartado por diseño) |
| 7 | Configuración de Cuenta | ✅ Completo (7.1 y 7.2 descartados; 7.3 implementado) |
| 8 | Vistas Admin (solo lectura) | ✅ Completo |
| 9 | Perfil de Usuario | ✅ Completo |
| 10 | Inteligencia Financiera y Reporting TMS | ✅ Completo |
| 11 | Notificaciones Telegram al Super Admin | 🔶 Parcial (11.1–11.3 ✅; 11.4 configurar vars de entorno en producción) |
| 12 | UX y Detalles | ✅ Completo |
| 13 | Seguridad y Calidad | ✅ Completo (13.5 descartado — no aplica para TMS interno) |
| 14 | Despliegue Producción | 🔲 Pendiente |

**Leyenda:** ✅ Completo | 🔶 Parcial | 🔲 Pendiente
