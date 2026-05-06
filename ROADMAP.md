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
  - Campo `comision_rate` (porcentaje, default 0.8%) — el super admin puede ajustar la tasa por transacción
  - Resumen automático de comisión PPI y 4x1000 calculado en tiempo real según la tasa ingresada
  - Campo notas (opcional)
  - Botón "Confirmar verificación"
- [x] **2.3** Server Action `verifyIncomeRequest` → actualiza `estado = 'verificado'` y `valor_real`, `comision_rate`, `verificado_por`, `verificado_at`
- [x] **2.8** Comisión PPI variable: el super admin puede ingresar cualquier porcentaje de comisión al verificar un ingreso; la tasa se persiste en `income_requests.comision_rate` y el trigger la usa para calcular `comision_ppi`, `valor_neto` y actualizar saldos
- [x] **2.4** Verificar que el trigger PostgreSQL actualiza automáticamente `saldo_disponible` y `saldo_neto` al verificar
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
- [x] **6.1** Botón "Nuevo beneficiario" → formulario completo con validación según tipo (cheque/transferencia)
- [x] **6.2** Botón "Editar beneficiario"
- [x] **6.3** Botón "Eliminar / Desactivar beneficiario"

---

## FASE 7 — Configuración de Cuenta (Cliente)

- [ ] **7.1** En `/cliente` → cada tarjeta de cuenta tiene un botón "Configurar"
- [ ] **7.2** Toggle para cambiar `egreso_a_discrecion` (a discreción de PPI vs pagos programados)
- [ ] **7.3** El cliente puede ver qué condición está activa en cada cuenta

---

## FASE 8 — Vistas de Solo Lectura (Admin)

- [x] Dashboard admin básico
- [ ] **8.1** `/admin/empresas` → misma vista que super admin pero sin botones de acción
- [ ] **8.2** `/admin/ingresos` → misma tabla que super admin pero sin botón Verificar
- [ ] **8.3** `/admin/egresos` → misma tabla que super admin pero sin botón Ejecutar
- [ ] **8.4** El admin puede ver soportes y evidencias adjuntas

---

## FASE 9 — Perfil de Usuario

- [ ] **9.1** Página `/perfil` → editar nombre completo y contraseña
- [ ] **9.2** Link "Mi perfil" en el menú de usuario (header) ya existe → conectarlo a la página

---

## FASE 10 — Inteligencia Financiera y Reporting TMS

- [x] **10.1** Corregir cálculo de "Total en custodia" en el Dashboard del Super Admin (sumar `saldo_neto` de `company_accounts`).
- [ ] **10.2** Estado de Cuenta / Ledger (Super Admin) — dentro del detalle de empresa (`/superadmin/empresas/[id]`):
  - Historial cronológico unificado: ingresos y egresos en orden cronológico.
  - Columnas: Fecha · Tipo · Descripción · Cargo · Abono · Saldo acumulado (running balance).
  - Desglose de deducciones por ingreso verificado: Tarifa de custodia + 4×1000.
  - Filtro por rango de fechas.
- [ ] **10.3** Estado de Cuenta (Cliente) — `/cliente/estado-de-cuenta`:
  - Misma vista que 10.2 pero limitada a la empresa del cliente.
  - Transparencia total: el cliente ve exactamente qué tarifa de custodia y 4×1000 se cobró por cada ingreso.
- [ ] **10.4** Dashboard Financiero Avanzado (Super Admin):
  - KPIs globales: total procesado por período, nº de transacciones, tarifa de custodia acumulada.
  - Gráfica de barras: ingresos vs egresos por mes — **shadcn/ui BarChart** (basado en Recharts, integrado con el stack existente).
  - Gráfica de línea: tarifa de custodia cobrada por mes — **shadcn/ui LineChart**.
  - Gráfica de dona: distribución del volumen por cliente — **shadcn/ui PieChart**.
  - Filtros por rango de fechas y por cliente.
- [ ] **10.5** Exportación y Reportes:
  - Exportar estado de cuenta a Excel/CSV por rango de fechas y por empresa.
  - Reporte de tarifas de custodia cobradas por período (total y por cliente).
  - Generación de informe PDF corporativo del estado de cuenta.

---

## FASE 11 — Reporte Diario Automático

- [ ] **11.1** Crear Supabase Edge Function `daily-report` que:
  - Consulta todas las empresas activas y sus cuentas
  - Calcula saldo disponible y neto por cuenta
  - Genera email HTML con el resumen del día
  - Envía a cada empresa (correo del contacto de operaciones) + copia al super admin
- [ ] **11.2** Configurar `pg_cron` en Supabase SQL Editor para ejecutar a las 6PM hora Colombia (UTC-5):
  ```sql
  select cron.schedule('daily-report', '0 23 * * *', $$
    select net.http_post(
      url := '<SUPABASE_EDGE_FUNCTION_URL>/daily-report',
      headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>"}'
    );
  $$);
  ```
- [ ] **11.3** Verificar recepción de correo de prueba

---

## FASE 12 — UX y Detalles de Interfaz

- [ ] **12.1** Añadir `<Toaster />` de sonner al layout raíz y usar `toast.success()` / `toast.error()` en todas las acciones (reemplaza los mensajes de error inline)
- [ ] **12.2** Skeletons de carga para tablas y dashboards
- [ ] **12.3** Estado vacío con ilustración o mensaje claro en cada tabla
- [ ] **12.4** Paginación en las tablas cuando hay más de 20 registros
- [ ] **12.5** Búsqueda/filtro por fecha y estado en las tablas de ingresos/egresos
- [ ] **12.6** Diseño responsive para móvil (hamburger menu para el sidebar)
- [ ] **12.7** Confirmación antes de acciones destructivas (rechazar, eliminar)

---

## FASE 13 — Seguridad y Calidad

- [ ] **13.1** Añadir políticas RLS de Storage para que solo el propietario del `company_id` pueda leer sus archivos
- [ ] **13.2** Validar en Server Actions que el `company_id` del usuario coincide con el del registro que está modificando (validación extra además del RLS)
- [ ] **13.3** Limitar tamaño de archivos en uploads (máx 10MB)
- [ ] **13.4** Verificar que el super admin no puede ver datos sin sesión activa
- [ ] **13.5** Rate limiting básico en las Server Actions de creación

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
| 6 | Gestión de Beneficiarios | ✅ Completo |
| 7 | Configuración de Cuenta | 🔲 Pendiente |
| 8 | Vistas Admin (solo lectura) | 🔶 Parcial (solo dashboard) |
| 9 | Perfil de Usuario | 🔲 Pendiente |
| 10 | Inteligencia Financiera y Reporting TMS | 🔶 Parcial (10.1 ✅; falta 10.2–10.5) |
| 11 | Reporte Diario Automático | 🔲 Pendiente |
| 12 | UX y Detalles | 🔲 Pendiente |
| 13 | Seguridad y Calidad | 🔲 Pendiente |
| 14 | Despliegue Producción | 🔲 Pendiente |

**Leyenda:** ✅ Completo | 🔶 Parcial | 🔲 Pendiente
