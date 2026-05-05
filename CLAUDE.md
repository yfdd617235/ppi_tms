# PPI TMS — Contexto para Claude y agentes de IA

## ¿Qué es este proyecto?

**PPI TMS** es una plataforma web de **gestión de tesorería (Treasury Management System)** para **Panamerican Private Investments (PPI)**, empresa colombiana que administra fondos de grandes clientes corporativos.

### Modelo de negocio
PPI funciona como un **gestor de pagos tipo escrow**: los clientes (empresas) consignan dinero a PPI, y luego instruyen a PPI a quién pagarle, cuánto y cuándo. PPI cobra:
- **Comisión de servicio:** 0.8% sobre el valor de cada ingreso verificado
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
    superadmin/     → Panel del super admin
    admin/          → Panel del admin (solo lectura)
    cliente/        → Panel del cliente (solo su empresa)
  api/
    auth/callback/  → Callback de autenticación Supabase

components/
  ui/               → Componentes shadcn/ui (NO modificar directamente)
  layout/           → Sidebar, Header, UserNav
  auth/             → LoginForm
  ingresos/         → Formulario y tabla de ingresos
  egresos/          → Formulario y tabla de egresos
  beneficiarios/    → Gestión de beneficiarios
  empresas/         → Fichas de clientes (super admin)

lib/
  supabase/
    client.ts       → Cliente Supabase para browser (componentes 'use client')
    server.ts       → Cliente Supabase para Server Components y Server Actions
    middleware.ts   → Cliente Supabase para middleware.ts
  validations/      → Esquemas Zod para todos los formularios
  currency.ts       → formatCOP(amount) — formato moneda colombiana
  financial.ts      → calcularComisiones(valorReal) — 4x1000 + comisión PPI
  utils.ts          → cn() de shadcn (clsx + tailwind-merge)

types/
  database.types.ts → Tipos TypeScript de todas las tablas Supabase
  index.ts          → Re-exports de tipos de aplicación

supabase/
  migrations/
    001_initial_schema.sql → Esquema completo (tablas, triggers, RLS, políticas)

middleware.ts       → Protección de rutas (auth check en cada request)
.env.local.example  → Variables de entorno requeridas
```

---

## Roles y permisos

| Rol | Qué puede hacer |
|---|---|
| `super_admin` | Lectura/escritura de TODO. Verifica ingresos, ejecuta egresos, gestiona todas las empresas. Ve totales globales. |
| `admin` | Solo lectura de TODO (todas las empresas, cuentas, operaciones). No puede ejecutar acciones. |
| `client` | CRUD solo de su propia empresa y cuentas. No puede ver información de otras empresas. |

El aislamiento multi-tenant se aplica en **dos capas**:
1. **PostgreSQL RLS (Row Level Security):** garantía a nivel de base de datos
2. **Middleware y Server Actions:** validación adicional en la aplicación

---

## Flujos operativos

### Módulo de Ingresos (Solicitud de fondos)
1. El cliente se loguea, elige la cuenta y registra una consignación:
   - Valor consignado (`valor_cliente`)
   - Soporte de pago (PDF o imagen)
   - Descripción (opcional)
2. Al enviar, el estado cambia a `enviado` y se envía alerta por email a PPI
3. El super admin revisa el comprobante, contrasta con el banco y registra `valor_real`
4. Al marcar `verificado`, un trigger PostgreSQL:
   - Calcula `comision_ppi = valor_real × 0.008`
   - Calcula `impuesto_4x1000 = valor_real × 0.004`
   - Calcula `valor_neto = valor_real − comision_ppi − impuesto_4x1000`
   - Actualiza `accounts.saldo_disponible += valor_real`
   - Actualiza `accounts.saldo_neto += valor_neto`
5. El renglón se sombrea en verde en la tabla

**Estados:** `borrador` → `enviado` → `verificado` | `rechazado`

### Módulo de Egresos (Pagos a terceros)
1. El cliente solicita un egreso:
   - Elige la cuenta origen
   - Selecciona beneficiario existente o crea uno nuevo (cheque o transferencia)
   - Define valor y fecha programada (o a discreción de PPI)
2. El estado inicial es `pendiente`
3. El super admin ejecuta el pago manualmente, adjunta evidencia y marca `ejecutado`
4. Un trigger PostgreSQL deduce el valor:
   - `accounts.saldo_disponible -= valor`
   - `accounts.saldo_neto -= valor`

**Estados:** `borrador` → `enviado` → `pendiente` → `ejecutado` | `rechazado`

### Condición de egresos
- Cada cuenta tiene `egreso_a_discrecion` (boolean)
- `true`: PPI decide cuándo pagar
- `false`: el cliente puede programar fechas específicas
- El cliente puede cambiar esta condición en cualquier momento

---

## Reglas financieras críticas

```
NUNCA usar float para dinero.
Usar NUMERIC(20,4) en PostgreSQL.
Todos los cálculos financieros son SERVER-SIDE únicamente.
```

| Concepto | Tasa | Función |
|---|---|---|
| Comisión PPI | 0.8% del valor_real | `calcularComisiones()` en `lib/financial.ts` |
| Impuesto 4x1000 | 0.4% del valor_real | `calcularComisiones()` en `lib/financial.ts` |
| Valor Neto | valor_real − 4x1000 − comisión | Calculado por trigger PostgreSQL |

---

## Datos del cliente (Ficha)

Cada empresa registrada tiene:
- Razón social, NIT
- Dirección, correo, celular
- Nombre del representante legal
- Nombre, correo y teléfono del contacto de operaciones

---

## Automatizaciones

- **Alerta de ingreso:** email a PPI vía Resend cuando un cliente envía una solicitud
- **Reporte diario (TODO):** Supabase `pg_cron` → Edge Function → Resend
  - Contenido: saldo disponible + saldo neto por empresa/cuenta
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
- Fechas: ISO 8601, zona horaria `America/Bogota`
- Cliente Supabase: `lib/supabase/server.ts` en Server Components/Actions, `lib/supabase/client.ts` en Client Components
- Componentes base: están en `components/ui/` (shadcn) — no modificar directamente
