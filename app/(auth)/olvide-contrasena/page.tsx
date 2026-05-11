import type { Metadata } from 'next'
import ForgotPasswordForm from '@/components/auth/forgot-password-form'

export const metadata: Metadata = { title: 'Recuperar contraseña — PPI Treasury Portal' }

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">Panamerican Private Investments</h1>
        <p className="text-sm text-muted-foreground mt-1">Portal de Tesorería</p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-sm font-medium text-foreground">Recuperar contraseña</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
