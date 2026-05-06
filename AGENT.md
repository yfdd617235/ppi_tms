# AGENT.md — Guía de contexto para agentes de IA

Este archivo es la referencia rápida para cualquier agente (Copilot, Cursor, Claude, Gemini, etc.) que trabaje en el código de **PPI TMS**.

---

## ¿Qué construye este proyecto?

Una **plataforma de gestión de tesorería** (Treasury Management System) para **Panamerican Private Investments (PPI)**, Colombia. PPI recibe fondos de clientes corporativos y los dispersa a terceros según instrucciones. Es una plataforma tipo escrow/custodia.

**NO es un CRM.** Es un TMS / Cash Management & Disbursement Platform.

---

## Stack en una línea

```
Next.js 16 (App Router) + Tailwind v4 + shadcn/ui (Radix+Nova) + Supabase + Resend
```

---

## Estructura de roles

```
super_admin  →  Acceso total. Crea/edita empresas (e invita usuarios desde ahí). Verifica ingresos. Ejecuta egresos.
               Consulta y edita roles en /superadmin/usuarios.
admin        →  Solo lectura de todo. No ejecuta acciones ni crea registros.
client       →  Solo ve y opera su propia empresa. Aislamiento estricto.
```

---

## Las 7 tablas del sistema

| Tabla | Descripción |
|---|---|
| `companies` | Fichas de empresas clientes |
| `profiles` | Usuarios con rol y empresa asignada (extiende `auth.users`) |
| `accounts` | **Catálogo global** de cuentas bancarias de PPI (sin saldos, sin company_id) |
| `company_accounts` | Junction table: asigna cuentas a empresas, guarda `saldo_bruto`, `saldo_neto`, `egreso_a_discrecion` |
| `beneficiaries` | Destinatarios de pagos (cheque o transferencia), por empresa |
| `income_requests` | Solicitudes de ingreso/depósito |
| `expense_requests` | Solicitudes de egreso/pago (incluye campo `programacion`: inmediato/programado/discrecion) |

`accounts` es un catálogo global (el super admin lo gestiona en `/superadmin/cuentas`). Los saldos viven en `company_accounts` —los triggers actualizan esa tabla, no `accounts`. Los clientes solo ven las cuentas que tienen asignadas vía `company_accounts`.

---

## Máquinas de estado (CRÍTICO)

### Ingresos
```
borrador → enviado → verificado ← (trigger actualiza saldo)
                  → rechazado
```

### Egresos
```
borrador → enviado → pendiente → ejecutado ← (trigger deduce saldo)
                              → rechazado
```

**Los balances solo cambian via trigger PostgreSQL. NUNCA calcular manualmente en código.**

---

## Lógica financiera (NO modificar sin entender)

```typescript
// lib/financial.ts
PPI_COMMISSION_RATE = 0.008   // tasa por defecto (0.8%) — solo usada como default
TAX_4X1000_RATE     = 0.004   // 0.4% del valor_real — fija, no configurable

// comisionRate es opcional; si no se pasa, usa PPI_COMMISSION_RATE
calcularComisiones(valorReal, comisionRate?)
```

**La tarifa de custodia PPI es variable**: el super admin la elige al verificar cada ingreso (default 0.8%).
Se persiste en `income_requests.comision_rate` (NUMERIC 10,6, expresada como decimal: 0.008 = 0.8%).

El trigger `process_income_verification()` en PostgreSQL usa `NEW.comision_rate` para calcular:

```sql
-- Lo que hace el trigger:
NEW.comision_ppi    := NEW.valor_real * NEW.comision_rate;  -- tasa variable
NEW.impuesto_4x1000 := NEW.valor_real * 0.004;              -- fija siempre
NEW.valor_neto      := NEW.valor_real - NEW.comision_ppi - NEW.impuesto_4x1000;
UPDATE company_accounts
  SET saldo_bruto += valor_real, saldo_neto += valor_neto
  WHERE account_id = NEW.account_id AND company_id = NEW.company_id;
```

---

## Patrones de código obligatorios

### Supabase en Server Components / Server Actions
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()

// Para bypass de RLS (uploads, acciones admin):
// ⚠️ createServiceClient es SÍNCRONO — NO usar await
import { createServiceClient } from '@/lib/supabase/server'
const serviceClient = createServiceClient()
```

### Supabase en Client Components ('use client')
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Formato de moneda (SIEMPRE)
```typescript
import { formatCOP } from '@/lib/currency'
formatCOP(1250000)  // → "$1.250.000"
```

### Formato de fecha (SIEMPRE)
```typescript
import { formatDate } from '@/lib/date'
formatDate('2026-05-05')           // → "05/may/2026"
formatDate('2026-05-05T22:00:00Z') // → "05/may/2026" (respeta zona local)
// Maneja automáticamente fechas tipo DATE (YYYY-MM-DD) sin desfase UTC
```

### Cálculo de comisiones (SIEMPRE server-side)
```typescript
import { calcularComisiones } from '@/lib/financial'
const { comisionPPI, impuesto4x1000, valorNeto } = calcularComisiones(valorReal)
```

### Validación con Zod (SIEMPRE en el servidor)
```typescript
import { incomeRequestSchema } from '@/lib/validations/income'
const parsed = incomeRequestSchema.safeParse(formData)
if (!parsed.success) return { error: parsed.error.flatten() }
```

### Upload a Storage (SIEMPRE con createServiceClient en Server Action)
```typescript
const serviceClient = createServiceClient()  // sin await — es síncrono
const path = `${company_id}/${Date.now()}-${filename}`
await serviceClient.storage.from('payment-proofs').upload(path, file, { ... })
// Guarda `path` en DB (no la URL completa)
```

### Obtener URL de archivo
```
GET /api/storage/proof?path={path}&bucket={bucket}
→ redirige a URL firmada (1 hora de validez)
```

---

## Layout responsivo

```
Desktop (lg+):   sidebar fijo izquierda + header + main (p-6)
Mobile (<lg):    hamburguesa en header → drawer con sidebar + overlay oscuro
```

- `AppShell` en `components/layout/app-shell.tsx` maneja el estado del drawer móvil
- Las tablas usan `overflow-x-auto` en su contenedor para scroll horizontal
- Los grids de cards usan `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- **El diseño desktop NO cambió** — solo se agregó comportamiento móvil

---

## Variables de entorno

```bash
NEXT_PUBLIC_SUPABASE_URL          # Siempre disponible (browser + server)
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Siempre disponible (browser + server)
SUPABASE_SERVICE_ROLE_KEY         # ⚠️ SOLO en Server Actions. Jamás en client.
RESEND_API_KEY                    # Solo server
NEXT_PUBLIC_APP_URL               # URL base
PPI_NOTIFICATION_EMAIL            # Destino de alertas
```

---

## UI y diseño

### Paleta de colores
- **Fondo:** blanco puro (`--background: oklch(1 0 0)`)
- **Primario / Botones:** verde dólar (`--primary: oklch(0.497 0.115 143.6)` ≈ `#2E7D32`)
- **Sidebar:** blanco con acentos verdes al hover/activo
- **Fuente:** Geist Sans (cargada via `next/font`)

### Estados de operaciones (color de filas)
```
verificado / ejecutado  →  bg-green-50  text-green-700
enviado / pendiente     →  bg-yellow-50 text-yellow-700
rechazado               →  bg-red-50    text-red-700
borrador                →  bg-gray-50   text-gray-600
```

### Componentes base
Los componentes shadcn están en `components/ui/`. **No modificar directamente.**  
Para personalizar, crear un wrapper en `components/` que use el componente base.

---

## Multi-tenancy: reglas de seguridad

RLS (Row Level Security) está habilitado en todas las tablas.  
Las funciones helper en PostgreSQL (en esquema `public`, no `auth`):

```sql
public.user_role()       -- Devuelve el rol del usuario activo
public.user_company_id() -- Devuelve el company_id del usuario activo
```

**Checklist antes de escribir cualquier query:**
- [ ] ¿La tabla tiene RLS habilitado?
- [ ] ¿La política cubre SELECT, INSERT, UPDATE, DELETE según el rol?
- [ ] ¿Estás usando `createServiceClient()` solo en Server Actions que lo requieren?
- [ ] ¿El cliente NUNCA recibe `SUPABASE_SERVICE_ROLE_KEY`?

---

## Archivos clave por función

| Necesitas... | Archivo |
|---|---|
| Tipos de la DB | `types/database.types.ts` |
| Tipos de app | `types/index.ts` |
| Cliente Supabase (browser) | `lib/supabase/client.ts` |
| Cliente Supabase (server) | `lib/supabase/server.ts` |
| Formato de moneda | `lib/currency.ts` → `formatCOP()` |
| Cálculo de comisiones | `lib/financial.ts` → `calcularComisiones()` |
| Validación ingresos | `lib/validations/income.ts` |
| Validación egresos | `lib/validations/expense.ts` |
| Validación beneficiarios | `lib/validations/beneficiary.ts` |
| Validación empresas | `lib/validations/company.ts` |
| Esquema de DB | `supabase/migrations/schema.sql` (unificado) |
| Estilos globales / colores | `app/globals.css` |
| Protección de rutas | `proxy.ts` |
| Layout con sidebar móvil | `components/layout/app-shell.tsx` |
| URL firmada de Storage | `app/api/storage/proof/route.ts` |
| Acciones ingresos (admin) | `app/(dashboard)/superadmin/ingresos/actions.ts` |
| Acciones ingresos (cliente) | `app/(dashboard)/cliente/ingresos/actions.ts` |
| Acciones empresas (super admin) | `app/(dashboard)/superadmin/empresas/actions.ts` |
| Acciones cuentas de empresa | `app/(dashboard)/superadmin/empresas/[id]/cuentas/actions.ts` |
| Acciones usuarios (super admin) | `app/(dashboard)/superadmin/usuarios/actions.ts` |
| Formulario empresa (crear/editar) | `components/empresas/company-form.tsx` |
| Diálogos cuentas (crear/editar) | `components/empresas/account-dialogs.tsx` |
| Acciones egresos (super admin) | `app/(dashboard)/superadmin/egresos/actions.ts` |
| Formulario egreso (cliente) | `components/egresos/expense-form.tsx` |
| Diálogos ejecutar/rechazar egreso | `components/egresos/admin-expense-actions.tsx` |
| Catálogo global de cuentas | `app/(dashboard)/superadmin/cuentas/` |
| Formato de fechas | `lib/date.ts` → `formatDate()` |
| Acciones beneficiarios (cliente) | `app/(dashboard)/cliente/beneficiarios/actions.ts` |
| Formulario beneficiario | `components/beneficiarios/beneficiary-form.tsx` |

---

## Datos que NO van en este archivo

- Código repetido del proyecto (léelo directamente)
- Historial de cambios (usa `git log`)
- Instrucciones de deployment (ver Vercel/Supabase dashboards)
