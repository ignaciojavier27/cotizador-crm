import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const stats = [
    {
      title: 'Cotizaciones',
      value: '0',
      icon: FileText,
      description: 'Total de cotizaciones',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Clientes',
      value: '0',
      icon: Users,
      description: 'Clientes registrados',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Productos',
      value: '0',
      icon: Package,
      description: 'Productos en catálogo',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Tasa de conversión',
      value: '0%',
      icon: TrendingUp,
      description: 'Cotizaciones aceptadas',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          ¡Bienvenido, {session.user.firstName}!
        </h1>
        <p className="mt-1 text-slate-600">
          Aquí tienes un resumen de tu actividad
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.bgColor} rounded-full p-2`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-500">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-blue-600" />
            <CardTitle>Primeros pasos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900">
                  Sistema en construcción
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Este dashboard está en desarrollo. Próximamente podrás:
                </p>
                <ul className="mt-2 space-y-1 text-sm text-blue-700">
                  <li>• Gestionar productos y categorías</li>
                  <li>• Crear y enviar cotizaciones</li>
                  <li>• Administrar clientes</li>
                  <li>• Configurar automatizaciones</li>
                  <li>• Ver reportes y estadísticas</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-slate-900">Información de tu cuenta</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-600">Email:</span>
                <span className="font-medium text-slate-900">{session.user.email}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-600">Nombre:</span>
                <span className="font-medium text-slate-900">
                  {session.user.firstName} {session.user.lastName}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-600">Rol:</span>
                <span className="font-medium text-slate-900 capitalize">
                  {session.user.role === 'admin' ? 'Administrador' : 'Vendedor'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}