import { Metadata } from "next"
import { RegisterForm } from "@/components/forms/register-form"

export const metadata: Metadata = {
  title: "Registro | Cotizador CRM",
  description: "Crea tu cuenta y registra tu empresa en Cotizador CRM",
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Cotizador CRM</h1>
          <p className="mt-2 text-sm text-slate-600">
            Registra tu empresa y comienza a gestionar tus cotizaciones
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Crear cuenta de empresa
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Ingresa los datos de tu empresa y tu usuario administrador
            </p>
          </div>

          <RegisterForm />

          {/* Enlace a login */}
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">¿Ya tienes una cuenta? </span>
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Inicia sesión
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
