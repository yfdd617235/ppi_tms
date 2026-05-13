'use client'

import { useRef, useActionState, useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import TurnstileWidget from '@/components/auth/turnstile-widget'
import { submitContactRequest, type ContactState } from '@/app/(public)/actions'
import { verifyTurnstileToken } from '@/app/(auth)/olvide-contrasena/actions'
import { useTranslation } from '@/lib/i18n/context'

const COUNTRY_CODES = [
  { code: '+57',  label: '🇨🇴 +57'  },
  { code: '+1',   label: '🇺🇸 +1'   },
  { code: '+52',  label: '🇲🇽 +52'  },
  { code: '+54',  label: '🇦🇷 +54'  },
  { code: '+55',  label: '🇧🇷 +55'  },
  { code: '+56',  label: '🇨🇱 +56'  },
  { code: '+51',  label: '🇵🇪 +51'  },
  { code: '+58',  label: '🇻🇪 +58'  },
  { code: '+593', label: '🇪🇨 +593' },
  { code: '+507', label: '🇵🇦 +507' },
  { code: '+34',  label: '🇪🇸 +34'  },
  { code: '+44',  label: '🇬🇧 +44'  },
  { code: '+49',  label: '🇩🇪 +49'  },
  { code: '+33',  label: '🇫🇷 +33'  },
]

const initialState: ContactState = { success: false, error: undefined }

interface ContactDialogProps {
  children: React.ReactNode
  source?: string
}

export default function ContactDialog({ children, source }: ContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const countryCodeRef = useRef<HTMLSelectElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const turnstileRef = useRef(null)
  const { t } = useTranslation()

  const [state, formAction, pending] = useActionState(
    async (_prev: ContactState, formData: FormData): Promise<ContactState> => {
      if (!turnstileToken) {
        return { success: false, error: t('contact.errorVerification') }
      }

      const verified = await verifyTurnstileToken(turnstileToken)
      if (!verified.success) {
        setTurnstileToken(null)
        ;(turnstileRef.current as any)?.reset()
        return { success: false, error: t('contact.errorVerificationFailed') }
      }

      const code   = countryCodeRef.current?.value ?? '+57'
      const number = phoneRef.current?.value?.trim() ?? ''
      if (number) formData.set('phone', `${code} ${number}`)

      return submitContactRequest(_prev, formData)
    },
    initialState
  )

  useEffect(() => {
    if (state.success) setSent(true)
  }, [state.success])

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) {
      setSent(false)
      setTurnstileToken(null)
      ;(turnstileRef.current as any)?.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">{t('contact.title')}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {t('contact.description')}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <p className="font-medium text-sm">{t('contact.successTitle')}</p>
            <p className="text-xs text-muted-foreground">{t('contact.successText')}</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4 mt-2">
            {source && <input type="hidden" name="source" value={source} />}

            <div className="space-y-1.5">
              <Label htmlFor="ct-name">{t('contact.name')} *</Label>
              <Input id="ct-name" name="name" placeholder={t('contact.namePlaceholder')} required disabled={pending} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ct-email">{t('contact.email')} *</Label>
              <Input id="ct-email" name="email" type="email" placeholder={t('contact.emailPlaceholder')} required disabled={pending} />
            </div>

            <div className="space-y-1.5">
              <Label>{t('contact.phone')}</Label>
              <div className="flex gap-2">
                <select
                  ref={countryCodeRef}
                  defaultValue="+57"
                  disabled={pending}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring shrink-0"
                >
                  {COUNTRY_CODES.map(({ code, label }) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
                <Input
                  ref={phoneRef}
                  type="tel"
                  placeholder={t('contact.phonePlaceholder')}
                  disabled={pending}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ct-message">{t('contact.message')} *</Label>
              <Textarea
                id="ct-message"
                name="message"
                placeholder={t('contact.messagePlaceholder')}
                rows={4}
                required
                disabled={pending}
                className="resize-none"
              />
            </div>

            <TurnstileWidget
              ref={turnstileRef}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
            />

            {state.error && (
              <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {state.error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={pending || !turnstileToken}>
              {pending ? t('contact.sending') : t('contact.send')}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
