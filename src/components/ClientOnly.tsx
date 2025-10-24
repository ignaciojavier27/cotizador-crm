'use client'

import { useEffect, useState, ReactNode } from 'react'

export default function ClientOnly({
  children,
  fallback,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return fallback ?? null

  return <>{children}</>
}
