-- ============================================================
-- PPI TMS — Esquema completo de base de datos
-- Versión unificada (incluye todas las migraciones y ajustes)
-- Correr en un proyecto Supabase limpio desde cero.
-- ============================================================

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE public.companies (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razon_social                  TEXT NOT NULL,
  nit                           TEXT NOT NULL UNIQUE,
  direccion                     TEXT,
  correo                        TEXT NOT NULL,
  celular                       TEXT,
  nombre_representante_legal    TEXT,
  nombre_contacto_operaciones   TEXT,
  correo_contacto_operaciones   TEXT,
  telefono_contacto_operaciones TEXT,
  activa                        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Perfil de usuario (extiende auth.users de Supabase)
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  role       TEXT        NOT NULL CHECK (role IN ('super_admin', 'admin', 'client')) DEFAULT 'client',
  full_name  TEXT,
  email      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Catálogo global de cuentas bancarias de PPI
-- No pertenecen a una empresa; se asignan vía company_accounts
CREATE TABLE public.accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre        TEXT        NOT NULL,
  descripcion   TEXT,
  nombre_banco  TEXT,
  numero_cuenta TEXT,
  tipo_cuenta   TEXT CHECK (tipo_cuenta IN ('corriente', 'ahorros')),
  activa        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asignación de cuentas a empresas (many-to-many)
-- Aquí se guarda el saldo por empresa y la condición de egresos
CREATE TABLE public.company_accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id          UUID        NOT NULL REFERENCES public.accounts(id)  ON DELETE CASCADE,
  saldo_disponible    NUMERIC(20,4) NOT NULL DEFAULT 0,
  saldo_neto          NUMERIC(20,4) NOT NULL DEFAULT 0,
  egreso_a_discrecion BOOLEAN     NOT NULL DEFAULT FALSE,
  activa              BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(company_id, account_id)
);

-- Beneficiarios de pago
CREATE TABLE public.beneficiaries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  tipo              TEXT        NOT NULL CHECK (tipo IN ('cheque', 'transferencia')),
  nombre            TEXT        NOT NULL,
  cedula_nit        TEXT        NOT NULL,
  entidad_financiera TEXT,
  tipo_cuenta       TEXT CHECK (tipo_cuenta IN ('ahorros', 'corriente', 'nequi', 'daviplata', 'otro')),
  numero_cuenta     TEXT,
  activo            BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Solicitudes de ingreso (depósitos del cliente a PPI)
CREATE TABLE public.income_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES public.accounts(id),
  company_id  UUID NOT NULL REFERENCES public.companies(id),
  created_by  UUID NOT NULL REFERENCES public.profiles(id),

  -- Valores registrados por el cliente
  valor_cliente   NUMERIC(20,4) NOT NULL CHECK (valor_cliente > 0),
  descripcion     TEXT,
  soporte_url     TEXT,
  soporte_nombre  TEXT,

  -- Valores verificados por super_admin
  valor_real      NUMERIC(20,4) CHECK (valor_real > 0),
  verificado_por  UUID REFERENCES public.profiles(id),
  verificado_at   TIMESTAMPTZ,
  notas_admin     TEXT,

  -- Calculados automáticamente al verificar (trigger)
  comision_ppi    NUMERIC(20,4),   -- valor_real * 0.008
  impuesto_4x1000 NUMERIC(20,4),   -- valor_real * 0.004
  valor_neto      NUMERIC(20,4),   -- valor_real - comision_ppi - impuesto_4x1000

  estado TEXT NOT NULL DEFAULT 'enviado'
    CHECK (estado IN ('borrador', 'enviado', 'verificado', 'rechazado')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Solicitudes de egreso (pagos de PPI a terceros por orden del cliente)
CREATE TABLE public.expense_requests (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),

  -- Beneficiario (existente o nuevo en línea)
  beneficiary_id                  UUID REFERENCES public.beneficiaries(id),
  nuevo_beneficiario_nombre       TEXT,
  nuevo_beneficiario_cedula_nit   TEXT,
  nuevo_beneficiario_entidad      TEXT,
  nuevo_beneficiario_tipo_cuenta  TEXT,
  nuevo_beneficiario_numero_cuenta TEXT,
  guardar_beneficiario            BOOLEAN DEFAULT FALSE,

  valor            NUMERIC(20,4) NOT NULL CHECK (valor > 0),
  tipo_pago        TEXT          NOT NULL CHECK (tipo_pago IN ('cheque', 'transferencia')),
  descripcion      TEXT,
  
  -- Programación de pago
  programacion     TEXT NOT NULL CHECK (programacion IN ('inmediato', 'programado', 'discrecion')) DEFAULT 'inmediato',
  fecha_programada DATE,

  -- Ejecución por super_admin
  ejecutado_por  UUID REFERENCES public.profiles(id),
  ejecutado_at   TIMESTAMPTZ,
  evidencia_url  TEXT,
  evidencia_nombre TEXT,
  notas_admin    TEXT,

  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('borrador', 'enviado', 'pendiente', 'ejecutado', 'rechazado')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCIONES Y TRIGGERS
-- ============================================================

-- updated_at automático en todas las tablas
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_updated_at     BEFORE UPDATE ON public.companies        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_profiles_updated_at      BEFORE UPDATE ON public.profiles         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_accounts_updated_at      BEFORE UPDATE ON public.accounts         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_beneficiaries_updated_at BEFORE UPDATE ON public.beneficiaries    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_income_updated_at        BEFORE UPDATE ON public.income_requests  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_expense_updated_at       BEFORE UPDATE ON public.expense_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Crear perfil automáticamente al registrar usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Actualizar saldo en company_accounts al verificar un ingreso
CREATE OR REPLACE FUNCTION process_income_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'verificado' AND OLD.estado != 'verificado' THEN
    NEW.comision_ppi    := NEW.valor_real * 0.008;
    NEW.impuesto_4x1000 := NEW.valor_real * 0.004;
    NEW.valor_neto      := NEW.valor_real - NEW.comision_ppi - NEW.impuesto_4x1000;

    UPDATE public.company_accounts
    SET saldo_disponible = saldo_disponible + NEW.valor_real,
        saldo_neto       = saldo_neto       + NEW.valor_neto
    WHERE account_id = NEW.account_id
      AND company_id = NEW.company_id;
  END IF;

  -- Reversar si pasa de verificado → rechazado
  IF OLD.estado = 'verificado' AND NEW.estado = 'rechazado' THEN
    UPDATE public.company_accounts
    SET saldo_disponible = saldo_disponible - OLD.valor_real,
        saldo_neto       = saldo_neto       - OLD.valor_neto
    WHERE account_id = OLD.account_id
      AND company_id = OLD.company_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_income_status_change
  BEFORE UPDATE OF estado ON public.income_requests
  FOR EACH ROW EXECUTE FUNCTION process_income_verification();

-- Restar saldo en company_accounts al ejecutar un egreso
CREATE OR REPLACE FUNCTION process_expense_execution()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'ejecutado' AND OLD.estado != 'ejecutado' THEN
    UPDATE public.company_accounts
    SET saldo_disponible = saldo_disponible - NEW.valor,
        saldo_neto       = saldo_neto       - NEW.valor
    WHERE account_id = NEW.account_id
      AND company_id = NEW.company_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_expense_status_change
  BEFORE UPDATE OF estado ON public.expense_requests
  FOR EACH ROW EXECUTE FUNCTION process_expense_execution();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.companies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_requests ENABLE ROW LEVEL SECURITY;

-- Helpers para obtener el rol y company_id del usuario activo
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- POLÍTICAS: COMPANIES
CREATE POLICY "sa_companies_all"     ON public.companies FOR ALL    USING (public.user_role() = 'super_admin');
CREATE POLICY "admin_companies_read" ON public.companies FOR SELECT USING (public.user_role() = 'admin');
CREATE POLICY "client_company_read"  ON public.companies FOR SELECT USING (public.user_role() = 'client' AND id = public.user_company_id());

-- POLÍTICAS: PROFILES
CREATE POLICY "sa_profiles_all"     ON public.profiles FOR ALL    USING (public.user_role() = 'super_admin');
CREATE POLICY "admin_profiles_read" ON public.profiles FOR SELECT USING (public.user_role() = 'admin');
CREATE POLICY "client_own_profile"  ON public.profiles FOR ALL    USING (id = auth.uid());

-- POLÍTICAS: ACCOUNTS
CREATE POLICY "sa_accounts_all"     ON public.accounts FOR ALL    USING (public.user_role() = 'super_admin');
CREATE POLICY "admin_accounts_read" ON public.accounts FOR SELECT USING (public.user_role() = 'admin');
CREATE POLICY "client_accounts"     ON public.accounts FOR SELECT
  USING (
    public.user_role() = 'client' AND EXISTS (
      SELECT 1 FROM public.company_accounts ca
      WHERE  ca.account_id = accounts.id
        AND  ca.company_id = public.user_company_id()
        AND  ca.activa     = true
    )
  );

-- POLÍTICAS: COMPANY_ACCOUNTS
CREATE POLICY "sa_ca_all"      ON public.company_accounts FOR ALL    USING (public.user_role() = 'super_admin');
CREATE POLICY "admin_ca_read"  ON public.company_accounts FOR SELECT USING (public.user_role() = 'admin');
CREATE POLICY "client_ca_read" ON public.company_accounts FOR SELECT USING (public.user_role() = 'client' AND company_id = public.user_company_id());

-- POLÍTICAS: BENEFICIARIES
CREATE POLICY "sa_ben_all"     ON public.beneficiaries FOR ALL    USING (public.user_role() = 'super_admin');
CREATE POLICY "admin_ben_read" ON public.beneficiaries FOR SELECT USING (public.user_role() = 'admin');
CREATE POLICY "client_ben"     ON public.beneficiaries FOR ALL    USING (public.user_role() = 'client' AND company_id = public.user_company_id());

-- POLÍTICAS: INCOME REQUESTS
CREATE POLICY "sa_income_all"     ON public.income_requests FOR ALL    USING (public.user_role() = 'super_admin');
CREATE POLICY "admin_income_read" ON public.income_requests FOR SELECT USING (public.user_role() = 'admin');
CREATE POLICY "client_income"     ON public.income_requests FOR ALL    USING (public.user_role() = 'client' AND company_id = public.user_company_id());

-- POLÍTICAS: EXPENSE REQUESTS
CREATE POLICY "sa_expense_all"     ON public.expense_requests FOR ALL    USING (public.user_role() = 'super_admin');
CREATE POLICY "admin_expense_read" ON public.expense_requests FOR SELECT USING (public.user_role() = 'admin');
CREATE POLICY "client_expense"     ON public.expense_requests FOR ALL    USING (public.user_role() = 'client' AND company_id = public.user_company_id());

-- ============================================================
-- STORAGE (Manual en Dashboard → Storage)
-- ============================================================
-- Bucket: payment-proofs   (privado)
-- Bucket: payment-evidence (privado)
