import BeneficiaryForm from '@/components/beneficiarios/beneficiary-form'

export default function NuevoBeneficiarioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Nuevo beneficiario</h1>
        <p className="text-sm text-muted-foreground">Registra un destinatario de pago</p>
      </div>
      <BeneficiaryForm />
    </div>
  )
}
