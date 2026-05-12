export type UserRole = 'super_admin' | 'admin' | 'client'
export type IncomeStatus = 'borrador' | 'enviado' | 'verificado' | 'rechazado'
export type ExpenseStatus = 'borrador' | 'enviado' | 'pendiente' | 'cheque_emitido' | 'ejecutado' | 'rechazado'
export type BeneficiaryType = 'cheque' | 'transferencia'
export type AccountType = 'ahorros' | 'corriente' | 'nequi' | 'daviplata' | 'otro'

// Row types (one per table, no circular refs)
type CompanyRow = {
  id: string
  razon_social: string
  nit: string
  direccion: string | null
  correo: string
  celular: string | null
  nombre_representante_legal: string | null
  nombre_contacto_operaciones: string | null
  correo_contacto_operaciones: string | null
  telefono_contacto_operaciones: string | null
  activa: boolean
  created_at: string
  updated_at: string
}

type ProfileRow = {
  id: string
  company_id: string | null
  role: UserRole
  full_name: string | null
  email: string
  created_at: string
  updated_at: string
}

type AccountRow = {
  id: string
  nombre: string
  descripcion: string | null
  nombre_banco: string | null
  numero_cuenta: string | null
  tipo_cuenta: 'corriente' | 'ahorros' | null
  activa: boolean
  created_at: string
  updated_at: string
}

type CompanyAccountRow = {
  id: string
  company_id: string
  account_id: string
  saldo_bruto: string
  saldo_neto: string
  egreso_a_discrecion: boolean
  activa: boolean
  created_at: string
}

type BeneficiaryRow = {
  id: string
  company_id: string
  tipo: BeneficiaryType
  nombre: string
  cedula_nit: string
  entidad_financiera: string | null
  tipo_cuenta: AccountType | null
  numero_cuenta: string | null
  activo: boolean
  created_at: string
  updated_at: string
}

type IncomeRequestRow = {
  id: string
  account_id: string
  company_id: string
  created_by: string
  valor_cliente: string
  descripcion: string | null
  soporte_url: string | null
  soporte_nombre: string | null
  valor_real: string | null
  verificado_por: string | null
  verificado_at: string | null
  notas_admin: string | null
  comision_ppi: string | null
  impuesto_4x1000: string | null
  valor_neto: string | null
  estado: IncomeStatus
  created_at: string
  updated_at: string
}

type ExpenseRequestRow = {
  id: string
  account_id: string
  company_id: string
  created_by: string
  beneficiary_id: string | null
  nuevo_beneficiario_nombre: string | null
  nuevo_beneficiario_cedula_nit: string | null
  nuevo_beneficiario_entidad: string | null
  nuevo_beneficiario_tipo_cuenta: string | null
  nuevo_beneficiario_numero_cuenta: string | null
  guardar_beneficiario: boolean
  valor: string
  tipo_pago: BeneficiaryType
  descripcion: string | null
  programacion: string
  fecha_programada: string | null
  cheque_url: string | null
  cheque_nombre: string | null
  cheque_emitido_por: string | null
  cheque_emitido_at: string | null
  ejecutado_por: string | null
  ejecutado_at: string | null
  evidencia_url: string | null
  evidencia_nombre: string | null
  notas_admin: string | null
  estado: ExpenseStatus
  created_at: string
  updated_at: string
}

// Insert types
type CompanyInsert = Omit<CompanyRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }
type ProfileInsert = Omit<ProfileRow, 'created_at' | 'updated_at'>
type AccountInsert = Omit<AccountRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }
type CompanyAccountInsert = Omit<CompanyAccountRow, 'id' | 'created_at'> & { id?: string }
type BeneficiaryInsert = Omit<BeneficiaryRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }
type IncomeRequestInsert = Omit<IncomeRequestRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }
type ExpenseRequestInsert = Omit<ExpenseRequestRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: CompanyRow
        Insert: CompanyInsert
        Update: Partial<CompanyInsert>
      }
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: Partial<ProfileInsert>
      }
      accounts: {
        Row: AccountRow
        Insert: AccountInsert
        Update: Partial<AccountInsert>
      }
      company_accounts: {
        Row: CompanyAccountRow
        Insert: CompanyAccountInsert
        Update: Partial<CompanyAccountInsert>
      }
      beneficiaries: {
        Row: BeneficiaryRow
        Insert: BeneficiaryInsert
        Update: Partial<BeneficiaryInsert>
      }
      income_requests: {
        Row: IncomeRequestRow
        Insert: IncomeRequestInsert
        Update: Partial<IncomeRequestInsert>
      }
      expense_requests: {
        Row: ExpenseRequestRow
        Insert: ExpenseRequestInsert
        Update: Partial<ExpenseRequestInsert>
      }
    }
    Views: Record<string, never>
    Functions: {
      user_role: { Args: Record<string, never>; Returns: UserRole }
      user_company_id: { Args: Record<string, never>; Returns: string }
    }
    Enums: Record<string, never>
  }
}
