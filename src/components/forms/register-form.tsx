'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { RegisterInput, registerSchema } from '@/lib/validations/auth'
import ClientOnly from '@/components/ClientOnly'
import { Skeleton } from '@/components/ui/skeleton'

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        let message = 'Por favor verifica los datos e intenta nuevamente.'
        try {
          const errorData = await res.json()
          console.log('Error response data:', errorData)
          // Extraer el mensaje de la estructura de respuesta del servidor
          message = errorData.message || errorData.error || message
        } catch (parseError) {
          console.error('Error parsing error response:', parseError)
          // Si no se puede parsear la respuesta, usar el status text
          message = res.statusText || message
        }

        toast.error('Error al registrar', { description: message })
        return
      }

      // Si llegamos aquí, la respuesta fue exitosa
      const successData = await res.json()
      
      toast.success('Cuenta creada correctamente', {
        description: successData.message || 'Redirigiendo al inicio de sesión...',
      })

      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Error al registrar usuario:', error)
      toast.error('Error inesperado', {
        description: 'Intenta nuevamente más tarde.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ClientOnly
      fallback={
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full mt-2" />
        </div>
        <div>
          <Skeleton className="h-4 w-1/4 mb-2" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full mt-4" />
      </div>
    }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Datos del usuario --- */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Datos del usuario</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName">Nombre <span className="text-red-500">*</span></Label>
              <Input
                id="firstName"
                placeholder="Juan"
                disabled={isLoading}
                {...register('firstName')}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName">Apellido <span className="text-red-500">*</span></Label>
              <Input
                id="lastName"
                placeholder="Pérez"
                disabled={isLoading}
                {...register('lastName')}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1 mt-3">
            <Label htmlFor="email">Correo electrónico <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              disabled={isLoading}
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1 mt-3">
            <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                disabled={isLoading}
                {...register('password')}
                className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1 mt-3">
            <Label htmlFor="confirmPassword">Confirmar contraseña <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                disabled={isLoading}
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {/* --- Datos de la empresa --- */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Datos de la empresa</h3>
          <div className="space-y-1">
            <Label htmlFor="companyName">Nombre de la empresa <span className="text-red-500">*</span></Label>
            <Input
              id="companyName"
              placeholder="Ej: Panadería San José"
              disabled={isLoading}
              {...register('companyName')}
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-1 mt-3">
            <Label htmlFor="companyRut">RUT / ID de empresa <span className="text-red-500">*</span></Label>
            <Input
              id="companyRut"
              placeholder="12.345.678-9"
              disabled={isLoading}
              {...register('companyRut')}
              className={errors.companyRut ? 'border-red-500' : ''}
            />
            {errors.companyRut && (
              <p className="text-sm text-red-500">{errors.companyRut.message}</p>
            )}
          </div>

          <div className="space-y-1 mt-3">
            <Label htmlFor="companyPhone">Teléfono (opcional)</Label>
            <Input
              id="companyPhone"
              placeholder="+56 9 1234 5678"
              disabled={isLoading}
              {...register('companyPhone')}
            />
          </div>

          <div className="space-y-1 mt-3">
            <Label htmlFor="companyAddress">Dirección (opcional)</Label>
            <Input
              id="companyAddress"
              placeholder="Av. Siempre Viva 123"
              disabled={isLoading}
              {...register('companyAddress')}
            />
          </div>
        </div>

        {/* --- Botón --- */}
        <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </Button>
      </form>
    </ClientOnly>
  )
}
