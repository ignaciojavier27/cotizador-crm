'use client'

import { Toaster } from 'sonner'

export function SonnerProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      closeButton
      toastOptions={{
        className: 'sonner-toast-custom',
        duration: 4000,
      }}
    />
  )
}