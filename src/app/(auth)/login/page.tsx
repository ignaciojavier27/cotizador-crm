import { LoginForm } from '@/components/forms/login-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Cotizador CRM',
  description: 'Inicia sesión en tu cuenta de Cotizador CRM',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Cotizador CRM
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sistema de cotizaciones para PYMES
          </p>
        </div>

        {/* Card de Login */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Iniciar Sesión
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <LoginForm />

          {/* Enlace a registro */}
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">¿No tienes una cuenta? </span>
            <a 
              href="/register" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Regístrate aquí
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-500">
          © 2024 Cotizador CRM. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}