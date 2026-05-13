# Guía de Despliegue y Flujo de Trabajo Profesional — PPI TMS

> Documento para el desarrollador. Cubre la configuración inicial, el despliegue a producción
> y el flujo de trabajo correcto para hacer cambios sin afectar a los usuarios activos.

---

## Índice

1. [Costos reales de infraestructura](#1-costos-reales-de-infraestructura)
2. [Arquitectura de ambientes](#2-arquitectura-de-ambientes)
3. [Cuentas que debe crear el cliente](#3-cuentas-que-debe-crear-el-cliente)
4. [Migrar el repositorio a la organización del cliente](#4-migrar-el-repositorio-a-la-organización-del-cliente)
5. [Configurar Supabase Production](#5-configurar-supabase-production)
6. [Configurar Resend con el dominio del cliente](#6-configurar-resend-con-el-dominio-del-cliente)
7. [Desplegar en Vercel](#7-desplegar-en-vercel)
8. [Configurar el dominio en Cloudflare y Vercel](#8-configurar-el-dominio-en-cloudflare-y-vercel)
9. [Variables de entorno — referencia completa](#9-variables-de-entorno--referencia-completa)
10. [Verificación final antes de abrir al público](#10-verificación-final-antes-de-abrir-al-público)
11. [Flujo de trabajo una vez en producción](#11-flujo-de-trabajo-una-vez-en-producción)
12. [Tu ambiente local de desarrollo](#12-tu-ambiente-local-de-desarrollo)
13. [Procedimiento para cambios de base de datos](#13-procedimiento-para-cambios-de-base-de-datos)
14. [Procedimiento para hotfixes urgentes](#14-procedimiento-para-hotfixes-urgentes)
15. [Backups manuales de Supabase](#15-backups-manuales-de-supabase)
16. [Responsabilidades y propiedad de cuentas](#16-responsabilidades-y-propiedad-de-cuentas)

---

## 1. Costos reales de infraestructura

### Qué se paga y qué no

| Servicio | Plan | Costo | Nota |
|---|---|---|---|
| GitHub Organization | Free | $0/mes | Repos privados incluidos |
| Cloudflare | Free | $0/mes | DNS + SSL gratis |
| Resend | Free | $0/mes | 3,000 emails/mes, 100/día — suficiente al inicio |
| Vercel | **Hobby (Free)** | **$0/mes** | Ver nota abajo |
| Supabase staging | Free | $0/mes | Para desarrollo, puede pausarse sin problema |
| **Supabase production** | **Pro** | **$25/mes** | Ver nota abajo |
| **Total mensual** | | **$25/mes** | |

### Vercel — por qué el plan gratis es suficiente

El plan Hobby (gratuito) de Vercel incluye todo lo necesario para este proyecto:
- Dominio custom ✅
- Variables de entorno separadas por ambiente (Production vs Preview) ✅
- Deploys automáticos desde GitHub ✅
- El sitio nunca se "duerme" — siempre responde sin importar el tráfico ✅

Vercel **no** tiene el problema de auto-pausa. Una vez desplegado, el sitio responde permanentemente.

**Cuándo necesitarías pagar Vercel Pro ($20/mes):**
- Si Vercel envía un aviso por uso comercial en cuenta personal (su ToS dice "no comercial", rara vez se enforcea en proyectos pequeños, pero es un riesgo a tener en cuenta)
- Si la generación de PDFs del ledger empieza a dar timeout — el plan Hobby limita las funciones serverless a 10 segundos; si el ledger crece mucho, el PDF puede tardar más
- Si el cliente quiere acceso propio al dashboard de Vercel (Pro permite equipos multi-usuario)

Por ahora, Hobby es la decisión correcta. Migrar a Pro en el momento que alguna de esas situaciones ocurra.

### Supabase — por qué producción necesita el plan Pro

El free tier de Supabase tiene tres limitaciones críticas para producción:

1. **Auto-pausa:** Los proyectos se pausan automáticamente tras 7 días sin consultas a la base de datos. Si hay un puente, vacaciones o simplemente pocos clientes al inicio, el sistema deja de responder. Inaceptable para datos financieros.
2. **Storage limitado:** Solo 1GB para los dos buckets (`payment-proofs` y `payment-evidence`). Dependiendo del volumen de transacciones puede durar meses, pero es un techo que se alcanza.
3. **Sin backups automáticos:** El plan Pro incluye backups diarios. El free tier no.

El plan Pro cuesta **$25/mes por organización** y elimina las tres limitaciones.

**¿Se puede evitar pagar con backups manuales?** Técnicamente sí, con dos mecanismos:
- Un cron job que hace una query simple cada 5-6 días evita el auto-pause (ver sección 15)
- Los backups manuales se pueden hacer con `pg_dump` y la CLI de Supabase (ver sección 15)

Para staging esto funciona perfectamente. Para producción con datos financieros reales, el riesgo de que el cron falle un día y el sistema se pause no justifica el ahorro de $25/mes.

---

## 2. Arquitectura de ambientes

```
┌─────────────────┐     ┌──────────────────────┐     ┌────────────────────────┐
│   LOCAL (dev)   │ ──► │  PREVIEW (staging)   │ ──► │  PRODUCTION            │
│  localhost:3000 │     │  *.vercel.app        │     │  panamericanprivate    │
│  .env.local     │     │  Vercel Preview env  │     │  investments.com       │
│  ppi-staging DB │     │  ppi-staging DB      │     │  Vercel Production env │
└─────────────────┘     └──────────────────────┘     │  ppi-production DB     │
                                                      └────────────────────────┘
```

**Reglas:**
- Ningún cambio va directo a producción. Todo pasa por local → preview → main.
- La base de datos de producción (`ppi-production`) nunca se usa para desarrollo ni pruebas.
- Los datos de clientes reales solo existen en `ppi-production`.

---

## 3. Cuentas que debe crear el cliente

El cliente es el propietario legal de su infraestructura. Tú eres el administrador técnico.
Vercel queda bajo tu cuenta personal — el cliente no necesita cuenta de Vercel.

### 3.1 GitHub — Organización

1. El cliente crea una cuenta en [github.com](https://github.com) si no tiene una.
2. Va a **Your organizations → New organization**.
3. Nombre sugerido: `panamerican-private-investments` (todo minúsculas, sin espacios).
4. Plan: **Free** — suficiente para repositorios privados con equipos pequeños.
5. El cliente te invita: **Settings → Members → Invite member** → tu usuario de GitHub → rol **Owner**.

### 3.2 Supabase — Cuenta y proyecto de producción

1. El cliente crea cuenta en [supabase.com](https://supabase.com) con su email corporativo.
2. Crea una organización: "Panamerican Private Investments".
3. **Activar el plan Pro** en la organización: **Organization Settings → Billing → Upgrade to Pro**.
4. Dentro de la organización, crea un **nuevo proyecto**:
   - Nombre: `ppi-production`
   - Región: `South America (São Paulo)` o `US East (N. Virginia)` — la más cercana a Colombia
   - Contraseña de base de datos: generar una fuerte y guardarla en un gestor de contraseñas
5. El cliente te invita a la organización: **Organization Settings → Members → Invite** → tu email → rol **Owner**.
6. Guarda las credenciales del proyecto (las necesitarás en el paso 7):
   - `Project URL` → Settings → API
   - `anon public key` → Settings → API
   - `service_role key` → Settings → API (tratar como contraseña, nunca exponer)

### 3.3 Cloudflare — DNS del dominio

1. El cliente crea cuenta en [cloudflare.com](https://cloudflare.com).
2. Agrega el dominio `panamericanprivateinvestments.com`:
   - **Add a Site** → ingresa el dominio → plan **Free** es suficiente.
   - Cloudflare escanea los DNS actuales y los importa.
3. En el registrador donde compraron el dominio (GoDaddy, Namecheap, etc.),
   cambian los **nameservers** a los dos que Cloudflare les indica (ej: `ada.ns.cloudflare.com`).
   Este cambio puede tardar hasta 24 horas en propagarse.
4. El cliente te invita: **Manage Account → Members → Invite Member** → tu email → rol **Administrator**.

### 3.4 Resend — Email transaccional

1. El cliente crea cuenta en [resend.com](https://resend.com) con su email corporativo.
2. Va a **Domains → Add Domain** → agrega `panamericanprivateinvestments.com`.
3. Resend entrega unos registros DNS (SPF, DKIM, DMARC). Se configuran en Cloudflare:
   - En Cloudflare → DNS → añadir cada registro que Resend indica.
   - Volver a Resend y hacer clic en **Verify DNS Records** (puede tardar unos minutos).
4. Una vez verificado, crear un **API Key**: Settings → API Keys → Create API Key → permiso **Sending access**.
5. El cliente comparte la API Key de forma segura (nunca por WhatsApp o email sin cifrar).

---

## 4. Migrar el repositorio a la organización del cliente

El repo actual está en tu cuenta personal. Se transfiere así:

1. Ir al repo → **Settings → General → Danger Zone → Transfer repository**.
2. Ingresar el nombre del repo para confirmar.
3. Seleccionar destino: la organización recién creada (`panamerican-private-investments`).
4. El repo queda en `github.com/panamerican-private-investments/ppi-tms`.
5. GitHub crea una redirección automática desde tu URL anterior durante un tiempo.
6. Actualiza el remote en tu máquina local:
   ```bash
   git remote set-url origin https://github.com/panamerican-private-investments/ppi-tms.git
   ```

---

## 5. Configurar Supabase Production

Con el proyecto `ppi-production` ya creado:

1. Ir a **SQL Editor** en el proyecto de producción.
2. Copiar el contenido de `supabase/migrations/schema.sql` y ejecutarlo completo.
3. Verificar que todas las tablas se crearon: **Table Editor** debe mostrar
   `companies`, `profiles`, `accounts`, `company_accounts`, `income_requests`,
   `expense_requests`, `beneficiaries`, `contact_requests`.
4. Ir a **Authentication → Email Templates** y personalizar:
   - **Invite user**: cambiar el asunto y el cuerpo para que refleje la marca de PPI.
5. Ir a **Authentication → URL Configuration**:
   - **Site URL**: `https://panamericanprivateinvestments.com`
   - **Redirect URLs**: agregar `https://panamericanprivateinvestments.com/auth/callback`
6. Ir a **Storage → Buckets** y verificar que existen `payment-proofs` y `payment-evidence`
   con sus políticas RLS. Si no, crearlos con las políticas del schema.

---

## 6. Configurar Resend con el dominio del cliente

Una vez verificado el dominio en Resend (paso 3.4):

- Los emails saldrán de `noreply@panamericanprivateinvestments.com`.
- `RESEND_FROM_DOMAIN` = `panamericanprivateinvestments.com`
- `PPI_NOTIFICATION_EMAIL` = el email corporativo de PPI donde llegan las alertas.

---

## 7. Desplegar en Vercel

Vercel se gestiona desde **tu cuenta personal** (plan Hobby, gratuito).

1. En [vercel.com](https://vercel.com) con tu cuenta → **Add New Project → Import Git Repository**.
2. Conectar tu cuenta de GitHub (o la organización del cliente si tienes acceso) y seleccionar `ppi-tms`.
3. Vercel detecta Next.js automáticamente. No cambiar el framework.
4. **Antes de hacer el primer deploy**, configurar las variables de entorno (ver sección 9).
5. Hacer clic en **Deploy**.
6. El primer deploy toma 2-3 minutos. Al terminar, Vercel da una URL tipo `ppi-tms-xxx.vercel.app`.

---

## 8. Configurar el dominio en Cloudflare y Vercel

### En Vercel:
1. Ir al proyecto → **Settings → Domains → Add Domain**.
2. Ingresar `panamericanprivateinvestments.com` y también `www.panamericanprivateinvestments.com`.
3. Vercel muestra los registros DNS necesarios (un registro `A` y un `CNAME`).

### En Cloudflare:
1. Ir al dominio → **DNS → Records**.
2. Agregar los registros que Vercel indicó:
   - Registro `A` para `@` → IP de Vercel (`76.76.21.21`)
   - Registro `CNAME` para `www` → `cname.vercel-dns.com`
3. El **proxy** (nube naranja) en Cloudflare para estos registros debe estar en modo
   **DNS only** (nube gris) — Vercel necesita manejar el SSL directamente.
4. En Vercel, esperar a que el dominio aparezca con estado **Valid Configuration** (5-30 min).

Resultado: `https://panamericanprivateinvestments.com` con SSL automático.

---

## 9. Variables de entorno — referencia completa

Configurar en Vercel → Project → **Settings → Environment Variables**.
Las variables de entorno por ambiente (Production vs Preview) funcionan en el plan Hobby gratuito.

| Variable | Production | Preview | Descripción |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL ppi-production | URL ppi-staging | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key production | anon key staging | Clave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | service role production | service role staging | Solo server-side |
| `NEXT_PUBLIC_APP_URL` | `https://panamericanprivateinvestments.com` | URL de Vercel preview | URL base de la app |
| `RESEND_API_KEY` | API key de Resend | API key de Resend | Mismo para ambos |
| `RESEND_FROM_DOMAIN` | `panamericanprivateinvestments.com` | tu dominio de prueba | Dominio verificado en Resend |
| `PPI_NOTIFICATION_EMAIL` | email corporativo PPI | tu email de prueba | Destino de alertas de contacto |
| `TELEGRAM_BOT_TOKEN` | token del bot | token del bot | Mismo para ambos |
| `TELEGRAM_CHAT_ID` | chat ID del superadmin | tu chat ID | Puede diferir en preview |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | site key production | site key de prueba | Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | secret key production | secret key de prueba | Cloudflare Turnstile |

> **Keys de prueba de Turnstile para Preview:** Siempre pasan la verificación sin resolver captcha.
> Site key: `1x00000000000000000000AA` / Secret key: `1x0000000000000000000000000000000AA`

### Variables en tu máquina local (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co          # ppi-staging
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...                        # ppi-staging
SUPABASE_SERVICE_ROLE_KEY=eyJ...                            # ppi-staging
NEXT_PUBLIC_APP_URL=http://localhost:3000
RESEND_API_KEY=re_...
RESEND_FROM_DOMAIN=tu-dominio-verificado-en-resend.com
PPI_NOTIFICATION_EMAIL=tu-email@gmail.com
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=123456789
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA    # key de prueba
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA   # key de prueba
```

`.env.local` nunca se sube a git (está en `.gitignore`).

---

## 10. Verificación final antes de abrir al público

Hacer este checklist en la URL de producción antes de comunicar el lanzamiento:

- [ ] La página principal carga sin errores en consola del navegador
- [ ] El formulario de contacto en `/` envía y llega email + Telegram al superadmin
- [ ] El login funciona con un usuario superadmin de prueba
- [ ] Crear una empresa desde `/superadmin/empresas/nueva` — llega el email de invitación
- [ ] El usuario invitado puede establecer contraseña y loguearse
- [ ] Crear un ingreso como cliente — llega alerta Telegram al superadmin
- [ ] El superadmin puede verificar el ingreso y el saldo se actualiza correctamente
- [ ] Crear un egreso como cliente y ejecutarlo como superadmin
- [ ] Descargar el estado de cuenta en PDF y en CSV
- [ ] El cambio de idioma (ES/EN) funciona en todas las páginas públicas
- [ ] `https://panamericanprivateinvestments.com` tiene candado SSL verde
- [ ] `https://www.panamericanprivateinvestments.com` redirige al dominio principal

---

## 11. Flujo de trabajo una vez en producción

### Estrategia de ramas (Git branching)

```
main ──────────────────────────────────────────────────── producción
  │
  ├── feat/nueva-funcionalidad ── se prueba en preview ── merge a main
  │
  ├── fix/bug-en-egresos ──────── se prueba en preview ── merge a main
  │
  └── hotfix/error-critico ─────────────────────────────── merge directo a main
```

- **`main`** es la rama de producción. Vercel la despliega automáticamente.
- **Nunca** se trabaja directamente en `main`.
- Cada feature o fix tiene su propia rama.

### Flujo día a día para cualquier cambio

```bash
# 1. Asegurarse de estar en main actualizado
git checkout main
git pull origin main

# 2. Crear rama para el cambio
git checkout -b feat/nombre-descriptivo
# Ejemplos:
# feat/exportar-pdf-egresos
# fix/calculo-saldo-neto
# chore/actualizar-dependencias

# 3. Desarrollar y probar en localhost:3000

# 4. Cuando está listo, subir la rama
git add .
git commit -m "feat: descripción clara de lo que hace el cambio"
git push origin feat/nombre-descriptivo

# 5. Vercel crea automáticamente una Preview URL
#    Probar en esa URL — usa ppi-staging, igual que local

# 6. Si todo está bien, merge a main
git checkout main
git merge feat/nombre-descriptivo
git push origin main
# Vercel despliega a producción automáticamente en ~2 minutos

# 7. Eliminar la rama
git branch -d feat/nombre-descriptivo
git push origin --delete feat/nombre-descriptivo
```

### Qué pasa en Vercel con cada push

| Evento | Resultado en Vercel |
|---|---|
| Push a cualquier rama que no es `main` | Preview deployment con URL única (usa ppi-staging) |
| Merge/push a `main` | Production deployment automático (usa ppi-production) |

---

## 12. Tu ambiente local de desarrollo

Tu máquina siempre apunta a `ppi-staging`. Nunca a producción.

```
.env.local → ppi-staging Supabase → datos de prueba
```

### Para instalar el proyecto en una máquina nueva

```bash
git clone https://github.com/panamerican-private-investments/ppi-tms.git
cd ppi-tms
npm install
cp .env.local.example .env.local
# Editar .env.local con las credenciales de ppi-staging
npm run dev
```

### Comandos útiles del día a día

```bash
npm run dev          # Servidor de desarrollo en localhost:3000
npm run build        # Verificar que el build de producción pasa sin errores
npm run lint         # Verificar reglas de ESLint
npx tsc --noEmit     # Verificar errores de TypeScript sin compilar
```

> **Regla:** Antes de hacer push de una rama, correr `npm run build` localmente.
> Si el build falla en tu máquina, también fallará en Vercel.

---

## 13. Procedimiento para cambios de base de datos

Cuando un cambio de código requiere modificar el schema (nueva tabla, columna, índice, etc.):

### El orden siempre es: schema primero, código después

```
❌ Incorrecto:
   1. Merge código nuevo a main
   2. Vercel despliega → el código busca una columna que no existe
   3. Error 500 para todos los usuarios activos

✅ Correcto:
   1. Aplicar el cambio de schema en ppi-production (Supabase SQL Editor)
   2. Merge código nuevo a main
   3. Vercel despliega → el código encuentra el schema actualizado
```

### Paso a paso

1. Escribir el SQL del cambio. Ejemplo:
   ```sql
   -- supabase/migrations/003_agregar_campo_notas.sql
   ALTER TABLE expense_requests ADD COLUMN notas_cliente text;
   ```
2. Guardar el archivo en `supabase/migrations/` con nombre numerado y descriptivo.
3. Ejecutar el SQL en `ppi-staging` y probar en local.
4. Cuando todo funciona, ejecutar el **mismo SQL** en `ppi-production`.
5. Hacer merge del código a main → Vercel despliega.

---

## 14. Procedimiento para hotfixes urgentes

Si hay un bug crítico en producción que afecta a usuarios activos:

```bash
# 1. Crear rama hotfix directamente desde main actualizado
git checkout main
git pull origin main
git checkout -b hotfix/descripcion-del-bug

# 2. Aplicar el fix mínimo — no aprovechar para refactorizar

# 3. Verificar con build local
npm run build

# 4. Push y merge a main
git add .
git commit -m "hotfix: descripción del bug corregido"
git push origin hotfix/descripcion-del-bug
git checkout main
git merge hotfix/descripcion-del-bug
git push origin main
# Vercel despliega en ~2 minutos

# 5. Verificar en producción que el bug está resuelto
# 6. Eliminar la rama
git branch -d hotfix/descripcion-del-bug
git push origin --delete hotfix/descripcion-del-bug
```

---

## 15. Backups manuales de Supabase

Supabase Pro incluye backups diarios automáticos. Si en algún momento quisieras
hacer backups manuales adicionales o mantener una copia local, así se hace:

### Backup de la base de datos (tablas y datos)

Requiere tener instalado `pg_dump`. El connection string está en
Supabase → **Settings → Database → Connection string → URI**.

```bash
# Descargar toda la base de datos como archivo SQL
pg_dump "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  --no-owner --no-acl \
  -f backup-$(date +%Y-%m-%d).sql
```

Para restaurar en caso de emergencia:
```bash
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f backup-2026-05-01.sql
```

### Backup del storage (archivos PDF e imágenes)

Requiere la [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
# Instalar la CLI (una sola vez)
npm install -g supabase

# Descargar todos los archivos de un bucket
supabase storage cp --recursive \
  ss://payment-proofs ./backups/payment-proofs/

supabase storage cp --recursive \
  ss://payment-evidence ./backups/payment-evidence/
```

### Cron job para evitar el auto-pause en el proyecto de staging (free tier)

El proyecto `ppi-staging` en el free tier se pausa tras 7 días sin actividad.
Para evitarlo sin pagar, configurar un GitHub Actions cron que haga un ping cada 5 días:

Crear el archivo `.github/workflows/keep-staging-alive.yml`:

```yaml
name: Keep staging DB alive
on:
  schedule:
    - cron: '0 8 */5 * *'   # cada 5 días a las 8am UTC
  workflow_dispatch:          # también permite ejecutarlo manualmente

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping staging database
        run: |
          curl -s -o /dev/null \
            -H "apikey: ${{ secrets.STAGING_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.STAGING_ANON_KEY }}" \
            "${{ secrets.STAGING_URL }}/rest/v1/companies?select=id&limit=1"
```

Agregar en GitHub → repo → **Settings → Secrets → Actions**:
- `STAGING_URL` → URL del proyecto ppi-staging
- `STAGING_ANON_KEY` → anon key del proyecto ppi-staging

> Este cron aplica **solo a staging**. El proyecto de producción con plan Pro
> nunca se pausa, independientemente de la actividad.

---

## 16. Responsabilidades y propiedad de cuentas

| Servicio | Propietario | Tu rol | Quién paga |
|---|---|---|---|
| GitHub Organization | Cliente (PPI) | Admin / Maintainer | Cliente ($0) |
| Supabase ppi-production | Cliente (PPI) | Owner del proyecto | Cliente ($25/mes) |
| Cloudflare | Cliente (PPI) | Administrator | Cliente ($0) |
| Resend | Cliente (PPI) | Admin | Cliente ($0 inicial) |
| **Vercel** | **Tú (desarrollador)** | Owner | **Tú ($0 — Hobby)** |
| Supabase ppi-staging | Tú (desarrollador) | Owner | Tú ($0 — Free) |

### Separación de responsabilidades

- El cliente administra su facturación de Supabase directamente.
- Tú nunca tienes acceso a la tarjeta de crédito del cliente.
- Si el cliente decide cambiar de desarrollador, conserva GitHub, Supabase, Cloudflare y Resend sin interrupciones. El nuevo desarrollador solo necesita acceso a Vercel (que está bajo tu cuenta) — en ese caso se transfiere el proyecto de Vercel o se hace un nuevo deploy.

### Contacto de emergencia para el cliente

Documentar y entregar al cliente:
- Cómo acceder al dashboard de Supabase para ver el estado del proyecto
- Cómo pausar manualmente el proyecto de Supabase si hay una emergencia de seguridad
- El email del superadmin y cómo crear un nuevo superadmin si fuera necesario
- Quién controla el dominio en Cloudflare y cómo redirigirlo a otro servidor si fuera necesario

---

*Documento para el proyecto PPI TMS. Actualizar conforme evolucione la infraestructura.*
