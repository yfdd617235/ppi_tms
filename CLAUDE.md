# PPI TMS — Contexto para Claude y agentes de IA

## ¿Qué es este proyecto?

**PPI TMS** es una plataforma web de **gestión de tesorería (Treasury Management System)** para **Panamerican Private Investments (PPI)**, empresa colombiana que administra fondos de grandes clientes corporativos.

### Modelo de negocio
PPI funciona como un **gestor de pagos tipo escrow**: los clientes (empresas) consignan dinero a PPI, y luego instruyen a PPI a quién pagarle, cuánto y cuándo. PPI cobra:
- **Tarifa de custodia:** 0.8% sobre el valor de cada ingreso verificado (configurable por transacción)
- **Impuesto 4x1000:** 0.4% sobre cada ingreso (se traslada al cliente)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend + Backend | Next.js 16 (App Router + Server Actions) |
| Estilos | Tailwind CSS v4 + shadcn/ui (Radix + Nova preset) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (JWT) |
| Almacenamiento | Supabase Storage |
| Email | Resend.com |
| Validación | Zod (siempre server-side) |
| Formularios | React Hook Form + @hookform/resolvers/zod |
| Despliegue | Vercel (frontend) + Supabase (managed) |

---

## Estructura de archivos

```
app/
  (auth)/           → Rutas públicas (login)
  (dashboard)/      → Rutas protegidas según rol:
    layout.tsx      → Obtiene perfil del usuario, renderiza AppShell
    superadmin/     → Panel del super admin
      ingresos/     → Tabla + acciones verificar/rechazar (usa IngresosAdminTable)
      egresos/      → Tabla de egresos + acciones ejecutar/rechazar
        actions.ts  → executeExpenseRequest, rejectExpenseRequest (usa createServiceClient para uploads)
      cuentas/      → Catálogo global de cuentas bancarias de PPI
        nueva/      → Crear cuenta global
        [id]/editar/ → Editar cuenta global
        actions.ts  → createAccount, updateAccount, toggleAccountStatus
      empresas/     → Lista con botones Ver detalle/Editar/Activar + botón Nueva empresa
        nueva/      → Formulario crear empresa (+ invitación de usuario)
        [id]/       → Ficha de empresa: datos + cuentas + usuarios + historial movimientos
        [id]/editar/ → Formulario editar ficha técnica
        [id]/cuentas/actions.ts → assignAccount, unassignAccount, toggleDiscrecion, createAndAssignAccount, updateAccountInfo
      usuarios/     → Panel de consulta y edición de usuarios del sistema
        [id]/       → Editar rol, nombre y empresa de un usuario
        actions.ts  → updateUser, deleteUser
    admin/          → Panel del admin (solo lectura)
      empresas/     → Lista de empresas (sin acciones)
    cliente/        → Panel del cliente (solo su empresa)
      ingresos/     → Tabla + formulario nueva solicitud con upload de soporte
      egresos/      → Tabla + formulario nueva solicitud (tipo programación: inmediato/programado/discreción)
      beneficiarios/ → Lista + crear/eliminar beneficiarios
        nueva/      → Formulario crear beneficiario
        actions.ts  → createBeneficiary, deactivateBeneficiary
  api/
    auth/callback/  → Callback de autenticación Supabase
    storage/proof/  → Genera URL firmada de Supabase Storage y redirige

components/
  ui/               → Componentes shadcn/ui (NO modificar directamente)
  layout/
    app-shell.tsx   → Client Component: layout principal con estado del sidebar móvil
    sidebar.tsx     → Navegación lateral por rol (acepta onClose para mobile)
    header.tsx      → Header con hamburguesa en mobile y UserNav
    user-nav.tsx    → Dropdown de usuario (avatar, cerrar sesión)
  auth/             → LoginForm
  ingresos/
    income-form.tsx         → Formulario nueva solicitud con upload de soporte
    ingresos-admin-table.tsx → Tabla del super admin con botones Verificar/Rechazar
    verify-income-dialog.tsx → Diálogo verificación con cálculo de comisiones en tiempo real
    reject-income-dialog.tsx → Diálogo rechazo con nota
  egresos/
    expense-form.tsx        → Formulario nueva solicitud de egreso (con selector de programación)
    admin-expense-actions.tsx → Diálogos ejecutar/rechazar egreso (Client Component)
  beneficiarios/
    beneficiary-form.tsx → Formulario crear beneficiario (Client Component)
  cuentas/
    account-form.tsx → Formulario crear/editar cuenta global (Client Component)
  empresas/
    company-form.tsx   → Formulario crear/editar empresa (Client Component, modo 'create'|'edit')
    account-dialogs.tsx → Diálogos crear/editar cuenta desde la ficha de empresa

lib/
  supabase/
    client.ts       → Cliente Supabase para browser (componentes 'use client')
    server.ts       → createClient() async + createServiceClient() sync — ver nota crítica abajo
    middleware.ts   → Cliente Supabase para proxy.ts (route protection)
  validations/      → Esquemas Zod: income.ts, expense.ts, beneficiary.ts, company.ts, account.ts
  currency.ts       → formatCOP(amount) — formato moneda colombiana
  financial.ts      → calcularComisiones(valorReal, comisionRate?) — 4x1000 + tarifa de custodia
  date.ts           → formatDate(date) — formato dd/mmm/aaaa (maneja correctamente fechas UTC sin desfase de zona horaria)
  utils.ts          → cn() de shadcn (clsx + tailwind-merge)

types/
  database.types.ts → Tipos TypeScript de todas las tablas Supabase
  index.ts          → Re-exports de tipos de aplicación

supabase/
  migrations/
    schema.sql      → Esquema unificado completo (todas las tablas, triggers, RLS)

proxy.ts            → Protección de rutas (auth check en cada request, Next.js 16)
.env.local.example  → Variables de entorno requeridas
```

### Nota crítica sobre `createServiceClient()`

`createServiceClient()` es una función **síncrona** (no `async`) que usa `@supabase/supabase-js` directamente (NO `@supabase/ssr`). Esto es esencial para que la service role key funcione sin que las cookies del usuario la sobreescriban:

```ts
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
```

Si se usa `createServerClient` de `@supabase/ssr` con cookies para el service client, la sesión del usuario prevalece y el RLS se aplica igual — ignorando el service role key. **Nunca usar `await createServiceClient()`.**

---

## Roles y permisos

| Rol | Qué puede hacer |
|---|---|
| `super_admin` | Lectura/escritura de TODO. Verifica ingresos, ejecuta egresos, crea/edita empresas e invita usuarios. Ve totales globales. |
| `admin` | Solo lectura de TODO (empresas, ingresos, egresos). No puede crear, editar ni ejecutar acciones. |
| `client` | CRUD solo de su propia empresa y cuentas. No puede ver información de otras empresas. |

El aislamiento multi-tenant se aplica en **dos capas**:
1. **PostgreSQL RLS (Row Level Security):** garantía a nivel de base de datos
2. **Server Actions:** validación adicional en la aplicación

---

## Layout responsivo

El layout usa un componente `AppShell` (Client Component) que:
- **Desktop (lg+):** sidebar fijo en la izquierda, exactamente como está
- **Mobile/Tablet (< lg):** sidebar oculto, botón hamburguesa en el header abre un drawer con overlay oscuro
- Al hacer clic en cualquier enlace del sidebar o en el overlay, el drawer se cierra
- El padding del `<main>` es `p-4` en mobile y `p-6` en desktop

Todas las tablas usan `overflow-x-auto` en su contenedor para scroll horizontal en pantallas pequeñas.

---

## Flujos operativos

### Módulo de Ingresos (Solicitud de fondos)
1. El cliente se loguea, elige la cuenta y registra una consignación:
   - Valor consignado (`valor_cliente`)
   - Soporte de pago (PDF o imagen, máx 10MB) → sube a bucket `payment-proofs`
   - Descripción (opcional)
2. Al enviar, el estado cambia a `enviado` y se envía alerta por email a PPI
3. El super admin revisa el comprobante, contrasta con el banco, registra `valor_real` y elige la tarifa de custodia (`comision_rate`, default 0.8%)
4. Al marcar `verificado`, un trigger PostgreSQL:
   - Usa `comision_rate` almacenado en el registro (elegido por el super admin al verificar)
   - Calcula `comision_ppi = valor_real × comision_rate`
   - Calcula `impuesto_4x1000 = valor_real × 0.004`
   - Calcula `valor_neto = valor_real − comision_ppi − impuesto_4x1000`
   - Actualiza `company_accounts.saldo_bruto += valor_real` (WHERE account_id + company_id)
   - Actualiza `company_accounts.saldo_neto += valor_neto`
5. El renglón se sombrea en verde en la tabla

**Estados:** `borrador` → `enviado` → `verificado` | `rechazado`

### Módulo de Egresos (Pagos a terceros)
1. El cliente solicita un egreso:
   - Elige la cuenta origen
   - Selecciona beneficiario existente o crea uno nuevo (cheque o transferencia)
   - Elige tipo de **programación** (`programacion` en DB):
     - `inmediato`: PPI ejecuta lo antes posible
     - `programado`: el cliente selecciona una fecha específica (`fecha_programada`)
     - `discrecion`: PPI decide cuándo pagar
   - Si la cuenta tiene `egreso_a_discrecion = true`, se sugiere esa opción al cliente
2. El estado inicial es `pendiente`
3. El super admin ejecuta el pago manualmente, adjunta evidencia (bucket `payment-evidence`) y marca `ejecutado`
4. Un trigger PostgreSQL deduce el valor:
   - `company_accounts.saldo_bruto -= valor` (WHERE account_id + company_id)
   - `company_accounts.saldo_neto -= valor`

**Estados:** `borrador` → `enviado` → `pendiente` → `ejecutado` | `rechazado`

### Condición de egresos y programación
- La tabla `company_accounts` tiene `egreso_a_discrecion` (boolean) — es un setting **por empresa y cuenta**, no global
- La tabla `expense_requests` tiene `programacion` (text: 'inmediato' | 'programado' | 'discrecion') y `fecha_programada` (date, solo cuando programacion = 'programado')
- En las tablas de egresos (cliente y admin) se muestra la programación con etiquetas de color:
  - Verde: Inmediato | Azul: Programado (con fecha) | Naranja: A discreción PPI

---

## Supabase Storage

| Bucket | Uso | Quién sube |
|---|---|---|
| `payment-proofs` | Soportes de consignaciones | Cliente (vía Server Action con service role) |
| `payment-evidence` | Evidencias de pagos ejecutados | Super admin (vía Server Action con service role) |

**Para ver/descargar archivos:** `GET /api/storage/proof?path={path}&bucket={bucket}` — genera URL firmada (1h) y redirige.

El `path` almacenado en DB es relativo al bucket: `{company_id}/{timestamp}-{filename}`.

---

## Reglas financieras críticas

```
NUNCA usar float para dinero.
Usar NUMERIC(20,4) en PostgreSQL.
Todos los cálculos financieros son SERVER-SIDE únicamente.
Los saldos SOLO se actualizan via triggers PostgreSQL, nunca manualmente.
```

| Concepto | Tasa | Función |
|---|---|---|
| Tarifa de custodia | Variable (default 0.8%) — el super admin la elige al verificar; se guarda en `income_requests.comision_rate` | `calcularComisiones(valorReal, comisionRate?)` en `lib/financial.ts` |
| Impuesto 4x1000 | 0.4% del valor_real | `calcularComisiones()` en `lib/financial.ts` |
| Disponible (`saldo_neto`) | valor_real − 4x1000 − tarifa de custodia | Calculado por trigger PostgreSQL; columna `saldo_neto` en `company_accounts` |

---

## Gestión de empresas (super_admin)

### Flujo para crear un cliente nuevo
1. Super admin va a `/superadmin/empresas/nueva`
2. Llena la ficha técnica: razón social, NIT, dirección, correo, teléfono, representante legal, contacto de operaciones
3. Ingresa email + nombre del usuario cliente → el sistema llama `serviceClient.auth.admin.inviteUserByEmail()`
4. Supabase envía email de invitación al cliente con link para establecer su contraseña (válido 24h)
5. El trigger `handle_new_user()` crea el `profiles` record; el Server Action actualiza `company_id` y `full_name`
6. El cliente hace clic en el link, establece su contraseña, y puede ingresar directamente

> **Importante:** La invitación de usuarios se hace SIEMPRE desde el formulario de empresa.
> El módulo `/superadmin/usuarios` es solo para consulta, edición de roles y eliminación.

### Ficha de detalle de empresa (`/superadmin/empresas/[id]`)
- Ficha técnica completa de la empresa
- **Cuentas asignadas:** con botones para crear nueva cuenta, editar, desasignar
- **Usuarios registrados:** lista de usuarios vinculados a la empresa
- **Movimientos recientes:** historial combinado de ingresos y egresos

### Editar ficha técnica
- Super admin va a `/superadmin/empresas/[id]/editar`
- Puede editar todos los campos de la ficha + cambiar el email del usuario

### Activar / Desactivar empresa
- Botón "Desactivar/Activar" en cada card de la lista
- Llama `toggleCompanyStatus(id, currentActiva)` — Server Action con form

### Acciones del Server Action (`superadmin/empresas/actions.ts`)
- `createCompany(formData)` — crea empresa + invita usuario si se provee email
- `updateCompany(id, formData)` — edita ficha técnica + puede cambiar email del usuario
- `toggleCompanyStatus(id, currentActiva)` — cambia estado activa/inactiva
- `resendInvite(companyId)` — reenvía enlace de acceso al usuario de la empresa
- Todas verifican `profile.role === 'super_admin'` antes de usar `createServiceClient()`

### Acciones de cuentas (`superadmin/empresas/[id]/cuentas/actions.ts`)
- `assignAccount` / `unassignAccount` — asignar/desasignar cuentas del catálogo
- `createAndAssignAccount` — crear cuenta global y asignarla en un paso
- `updateAccountInfo` — editar nombre, descripción y condición de discreción
- `toggleCompanyAccountDiscrecion` — alternar condición de egresos

---

## Arquitectura de cuentas bancarias

Las cuentas son un **catálogo global de PPI**, independiente de cada empresa:
- `accounts`: datos del banco (nombre, banco, número, tipo) — sin saldos ni empresa
- `company_accounts`: tabla junction — asigna cuentas a empresas, guarda saldos y `egreso_a_discrecion`

El super admin gestiona el catálogo en `/superadmin/cuentas` y asigna cuentas a cada empresa en la ficha `/superadmin/empresas/[id]`.

El cliente solo ve sus cuentas asignadas (RLS via `EXISTS` en `company_accounts`). Los saldos se consultan via join: `company_accounts.select('saldo_bruto, saldo_neto, accounts(id, nombre)')`.

- `saldo_bruto`: capital depositado total (suma de `valor_real` de ingresos verificados)
- `saldo_neto`: saldo disponible real para egresos (después de tarifa de custodia + 4×1000)

## Gestión de beneficiarios (cliente)

- `/cliente/beneficiarios`: lista de beneficiarios activos con botón "Nuevo beneficiario" y botón "Eliminar" (soft-delete: `activo = false`)
- `/cliente/beneficiarios/nueva`: formulario para crear beneficiario (tipo cheque o transferencia; si transferencia, requiere entidad, tipo y número de cuenta)
- En `/cliente/egresos/nueva`: el formulario de egreso permite seleccionar un beneficiario existente O crear uno nuevo inline, con opción de guardarlo como frecuente (`guardar_beneficiario = true`)

Acciones en `cliente/beneficiarios/actions.ts`:
- `createBeneficiary(formData)` — valida con `beneficiarySchema`, inserta en `beneficiaries`
- `deactivateBeneficiary(id)` — marca `activo = false` verificando que pertenezca a la empresa del usuario

---

## Automatizaciones

- **Alerta de ingreso:** email a PPI vía Resend cuando un cliente envía una solicitud
- **Reporte diario (TODO):** Supabase `pg_cron` → Edge Function → Resend
  - Contenido: saldo bruto + saldo neto (disponible) por empresa/cuenta
  - Se envía al cliente y al super admin al cierre del día

---

## Variables de entorno requeridas

```bash
NEXT_PUBLIC_SUPABASE_URL          # URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Clave pública (anon key)
SUPABASE_SERVICE_ROLE_KEY         # Solo server-side. NUNCA al cliente.
RESEND_API_KEY                    # API key de Resend
NEXT_PUBLIC_APP_URL               # URL base de la app
PPI_NOTIFICATION_EMAIL            # Email que recibe alertas
```

---

## Comandos del proyecto

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run lint     # ESLint
npx tsc --noEmit # Type checking
```

---

## Convenciones de código

- Componentes funcionales con TypeScript (sin class components)
- Validación de formularios: Zod en el servidor, React Hook Form en el cliente
- Monetario: siempre usar `formatCOP(amount)` de `lib/currency.ts` para mostrar
- Cálculos: siempre usar `calcularComisiones(valorReal)` de `lib/financial.ts`
- Fechas: siempre usar `formatDate(date)` de `lib/date.ts` → formato `dd/mmm/aaaa` (ej: 05/may/2026). Maneja automáticamente fechas UTC sin desfase.
- Cliente Supabase: `lib/supabase/server.ts` en Server Components/Actions, `lib/supabase/client.ts` en Client Components
- `createServiceClient()` solo para operaciones que requieren bypass de RLS (uploads, operaciones admin). Nunca exponer al cliente.
- Componentes base: están en `components/ui/` (shadcn) — no modificar directamente
