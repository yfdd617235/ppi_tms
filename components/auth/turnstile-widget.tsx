'use client'

import { forwardRef } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onExpire: () => void
}

const TurnstileWidget = forwardRef<TurnstileInstance, TurnstileWidgetProps>(
  function TurnstileWidget({ onSuccess, onExpire }, ref) {
    return (
      <Turnstile
        ref={ref}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={onSuccess}
        onExpire={onExpire}
        options={{ theme: 'light', size: 'normal' }}
      />
    )
  }
)

export default TurnstileWidget
