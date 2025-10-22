import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Si el usuario ya está autenticado, redirigir al dashboard
  const session = await auth()
  
  if (session?.user) {
    redirect('/dashboard')
  }

  return <>{children}</>
}