export type { Database, UserRole, IncomeStatus, ExpenseStatus, BeneficiaryType, AccountType } from './database.types'

import type { Database } from './database.types'

export type Company = Database['public']['Tables']['companies']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Account = Database['public']['Tables']['accounts']['Row']
export type Beneficiary = Database['public']['Tables']['beneficiaries']['Row']
export type IncomeRequest = Database['public']['Tables']['income_requests']['Row']
export type ExpenseRequest = Database['public']['Tables']['expense_requests']['Row']

export type ProfileWithCompany = Profile & { companies: Company | null }
