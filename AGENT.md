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
super_admin  →  Acceso total. Verifica ingresos. Ejecuta egresos. Ve todo.
admin        →  Solo lectura de todo. No ejecuta acciones.
client       →  Solo ve y opera su propia empresa. Aislamiento estricto.
```

---

## Las 6 tablas del sistema

| Tabla | Descripción |
|---|---|
| `companies` | Fichas de empresas clientes |
| `profiles` | Usuarios con rol y empresa asignada (extiende `auth.users`) |
| `accounts` | Cuentas de tesorería por empresa (tienen saldo) |
| `beneficiaries` | Destinatarios de pagos (cheque o transferencia) |
| `income_requests` | Solicitudes de ingreso/depósito |
| `expense_requests` | Solicitudes de egreso/pago |

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
PPI_COMMISSION_RATE = 0.008   // 0.8% del valor_real
TAX_4X1000_RATE     = 0.004   // 0.4% del valor_real

valorNeto = valorReal - (valorReal × 0.008) - (valorReal × 0.004)
         = valorReal × 0.988
```

El trigger `process_income_verification()` en PostgreSQL calcula y aplica estos valores automáticamente cuando `estado` cambia a `'verificado'`.

```sql
-- Lo que hace el trigger:
NEW.comision_ppi    := NEW.valor_real * 0.008;
NEW.impuesto_4x1000 := NEW.valor_real * 0.004;
NEW.valor_neto      := NEW.valor_real - NEW.comision_ppi - NEW.impuesto_4x1000;
UPDATE accounts SET saldo_disponible += valor_real, saldo_neto += valor_neto ...
```

---

## Patrones de código obligatorios

### Supabase en Server Components / Server Actions
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
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
Las funciones helper en PostgreSQL:

```sql
auth.user_role()       -- Devuelve el rol del usuario activo
auth.user_company_id() -- Devuelve el company_id del usuario activo
```

**Checklist antes de escribir cualquier query:**
- [ ] ¿La tabla tiene RLS habilitado?
- [ ] ¿La política cubre SELECT, INSERT, UPDATE, DELETE según el rol?
- [ ] ¿Estás usando `createServiceClient()` solo en Server Actions admin?
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
| Esquema de DB | `supabase/migrations/001_initial_schema.sql` |
| Estilos globales / colores | `app/globals.css` |
| Protección de rutas | `middleware.ts` |

---

## Datos que NO van en este archivo

- Código repetido del proyecto (léelo directamente)
- Historial de cambios (usa `git log`)
- Instrucciones de deployment (ver Vercel/Supabase dashboards)
