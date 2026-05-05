# PPI TMS — Hoja de Ruta del Proyecto

Marca cada paso con `[x]` cuando esté completado.

---

## FASE 1 — Configuración de Supabase (Prerequisito)

> Sin esto, la app no puede arrancar. Hacerlo antes de continuar con cualquier otra fase.

- [x] Proyecto Next.js 16 inicializado con shadcn/ui, Tailwind v4
- [x] Dependencias instaladas (`@supabase/ssr`, `resend`, `zod`, `react-hook-form`, etc.)
- [x] Esquema SQL completo creado → `supabase/migrations/001_initial_schema.sql`
- [ ] **1.1** Crear proyecto en [supabase.com](https://supabase.com) y copiar credenciales
- [ ] **1.2** Copiar `.env.local.example` a `.env.local` y rellenar todas las variables
- [ ] **1.3** Ejecutar `supabase/migrations/001_initial_schema.sql` en el SQL Editor de Supabase
- [ ] **1.4** En Supabase → Storage → crear bucket `payment-proofs` (privado)
- [ ] **1.5** En Supabase → Storage → crear bucket `payment-evidence` (privado)
- [ ] **1.6** En Supabase → Auth → deshabilitar "Confirm email" (para pruebas iniciales)
- [ ] **1.7** Crear el primer usuario `super_admin` desde Supabase Auth → Users → "Invite user", luego actualizar `profiles.role = 'super_admin'` manualmente en la tabla
- [ ] **1.8** Verificar que `npm run dev` levanta sin errores y el login funciona

---

## FASE 2 — Módulo de Ingresos Completo

- [x] Tabla de ingresos (cliente) con estados y colores
- [x] Formulario "Nueva solicitud de ingreso" (cliente)
- [x] Server Action `createIncomeRequest` con validación Zod
- [x] Notificación email a PPI al enviar (Resend)
- [x] Tabla de ingresos (super admin) con todas las empresas
- [ ] **2.1** Integrar carga de archivo (soporte de pago) al formulario del cliente → subir a bucket `payment-proofs` en Supabase Storage antes de guardar el registro
- [ ] **2.2** Botón "Verificar" en la fila de la tabla de ingresos (super admin) → abre un diálogo con:
  - Campo `valor_real` (numérico obligatorio)
  - Resumen automático de comisión PPI y 4x1000 calculado en tiempo real
  - Campo notas (opcional)
  - Botón "Confirmar verificación"
- [ ] **2.3** Server Action `verifyIncomeRequest` → actualiza `estado = 'verificado'` y `valor_real`, `verificado_por`, `verificado_at`
- [ ] **2.4** Verificar que el trigger PostgreSQL actualiza automáticamente `saldo_disponible` y `saldo_neto` al verificar
- [ ] **2.5** Botón "Rechazar" en la tabla (super admin) → dialogo con nota de rechazo
- [ ] **2.6** Ver / descargar soporte adjunto desde la tabla (ícono de clip) → URL firmada de Supabase Storage
- [ ] **2.7** El cliente puede ver el soporte que adjuntó desde su vista

---

## FASE 3 — Módulo de Egresos Completo

- [x] Tabla de egresos (cliente) con estados y colores
- [x] Formulario "Nueva solicitud de egreso" (cliente): cuenta, valor, tipo pago, beneficiario existente o nuevo, guardar beneficiario
- [x] Server Action `createExpenseRequest` con validación Zod
- [x] Tabla de egresos (super admin) con todas las empresas
- [ ] **3.1** Botón "Ejecutar pago" en la fila de la tabla de egresos (super admin) → abre diálogo con:
  - Detalle del egreso (empresa, beneficiario, valor)
  - Campo para subir evidencia de pago → bucket `payment-evidence`
  - Notas (opcional)
  - Botón "Confirmar ejecución"
- [ ] **3.2** Server Action `executeExpenseRequest` → actualiza `estado = 'ejecutado'`, `ejecutado_por`, `ejecutado_at`, `evidencia_url`
- [ ] **3.3** Verificar que el trigger PostgreSQL deduce automáticamente el saldo al ejecutar
- [ ] **3.4** Botón "Rechazar" en la tabla (super admin) → diálogo con nota
- [ ] **3.5** El cliente puede ver la evidencia de pago adjunta por el super admin
- [ ] **3.6** Opción de fecha programada en el formulario del cliente (date picker)
- [ ] **3.7** Mostrar en la tabla del cliente si el egreso es "a discreción de PPI" o tiene fecha programada

---

## FASE 4 — Gestión de Empresas y Cuentas (Super Admin)

- [x] Lista de empresas en `/superadmin/empresas` (vista básica)
- [ ] **4.1** Botón "Nueva empresa" → formulario completo con todos los campos de la ficha:
  - Razón social, NIT, dirección, correo, celular
  - Nombre y datos del representante legal
  - Nombre, correo y teléfono del contacto de operaciones
- [ ] **4.2** Botón "Editar empresa" → mismo formulario en modo edición
- [ ] **4.3** Botón "Ver detalle empresa" → página con:
  - Ficha completa de la empresa
  - Lista de cuentas asociadas
  - Lista de usuarios de esa empresa
  - Historial de ingresos y egresos de esa empresa
- [ ] **4.4** En la página de detalle: "Nueva cuenta" → formulario (nombre, descripción, `egreso_a_discrecion`)
- [ ] **4.5** Editar cuenta → cambiar nombre, descripción y condición de egresos
- [ ] **4.6** Activar/Desactivar empresa o cuenta (toggle)

---

## FASE 5 — Gestión de Usuarios (Super Admin)

- [ ] **5.1** En `/superadmin/empresas/[id]` → sección "Usuarios" → botón "Invitar usuario"
  - Invitar por correo via Supabase Auth (`admin.inviteUserByEmail`)
  - Asignar rol (`client` o `admin`) y empresa al crear
- [ ] **5.2** Lista de usuarios de la empresa en la ficha
- [ ] **5.3** Editar rol o empresa de un usuario existente
- [ ] **5.4** Desactivar usuario (sin borrar)

---

## FASE 6 — Gestión de Beneficiarios (Cliente)

- [x] Lista de beneficiarios en `/cliente/beneficiarios` (vista básica)
- [ ] **6.1** Botón "Nuevo beneficiario" → formulario completo con validación según tipo (cheque/transferencia)
- [ ] **6.2** Botón "Editar beneficiario"
- [ ] **6.3** Botón "Eliminar / Desactivar beneficiario"

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

## FASE 10 — Reportes

- [ ] **10.1** En las tablas de ingresos/egresos del super admin → botón "Exportar CSV" por empresa y fechas
- [ ] **10.2** Botón "Generar informe PDF" en la ficha de empresa (super admin) → genera informe con:
  - Encabezado empresa (razón social, NIT)
  - Saldo disponible y saldo neto
  - Historial completo de ingresos con verificados
  - Historial completo de egresos con ejecutados
  - Cálculo de comisiones y 4x1000 cobrados
- [ ] **10.3** El cliente puede generar su propio informe desde `/cliente/ingresos` o `/cliente/egresos`

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
| 1 | Configuración Supabase | 🔲 Pendiente |
| 2 | Módulo Ingresos Completo | 🔶 Parcial (falta upload + verificación) |
| 3 | Módulo Egresos Completo | 🔶 Parcial (falta ejecución + evidencia) |
| 4 | Gestión de Empresas y Cuentas | 🔶 Parcial (solo vista lista) |
| 5 | Gestión de Usuarios | 🔲 Pendiente |
| 6 | Gestión de Beneficiarios | 🔶 Parcial (solo vista lista) |
| 7 | Configuración de Cuenta | 🔲 Pendiente |
| 8 | Vistas Admin (solo lectura) | 🔶 Parcial (solo dashboard) |
| 9 | Perfil de Usuario | 🔲 Pendiente |
| 10 | Reportes PDF/CSV | 🔲 Pendiente |
| 11 | Reporte Diario Automático | 🔲 Pendiente |
| 12 | UX y Detalles | 🔲 Pendiente |
| 13 | Seguridad y Calidad | 🔲 Pendiente |
| 14 | Despliegue Producción | 🔲 Pendiente |

**Leyenda:** ✅ Completo | 🔶 Parcial | 🔲 Pendiente
