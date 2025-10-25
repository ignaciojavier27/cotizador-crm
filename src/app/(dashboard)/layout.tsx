import { redirect } from 'next/navigation'
import { DashboardShell } from './dashboard/dashboard-shell'
import { auth } from '@/lib/auth/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <DashboardShell user={session.user}>
      {children}
    </DashboardShell>
  )
}
