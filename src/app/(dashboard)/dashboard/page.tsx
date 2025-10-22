import LogoutButton from '@/components/ui/logout-button'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  console.log(session.user)

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">
          ¡Bienvenido al Dashboard!
        </h1>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>Nombre:</strong> {session.user.firstName} {session.user.lastName}</p>
          <p><strong>Rol:</strong> {session.user.role}</p>
          <p><strong>Empresa:</strong> {session.user.companyId}</p>
        </div>
        
        <div className="mt-6">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}