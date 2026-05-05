import type { Metadata } from 'next'
import LoginForm from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Iniciar sesión — PPI Treasury Portal' }

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-foreground font-bold text-lg tracking-tight">P</span>
        </div>
        <h1 className="text-lg font-semibold text-foreground">Panamerican Private Investments</h1>
        <p className="text-sm text-muted-foreground mt-1">Portal de Tesorería</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-sm font-medium text-foreground mb-5">Iniciar sesión</h2>
        <LoginForm />
      </div>
    </div>
  )
}
