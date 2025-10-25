'use client'

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreateUserInput, createUserSchema } from "@/lib/validations/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ClientOnly from "../ClientOnly";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

export function UserCreateForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreateUserInput>({
        resolver: zodResolver(createUserSchema),
    })

    const onSubmit = async (data: CreateUserInput) => {
        setIsLoading(true)

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (!res.ok) {
                let message = 'Por favor verifica los datos e intenta nuevamente.'
                try {
                    const errorData = await res.json()
                    console.log('Error response data:', errorData)
                    message = errorData.message || errorData.error || message
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError)
                    message = res.statusText || message
                }

                toast.error('Error al registrar', { description: message })
                return
            }
            
            const successData = await res.json()
            toast.success('Cuenta creada correctamente', { description: successData.message || 'Redirigiendo al gestor de usuarios...' })
            router.push('/dashboard/users')
            router.refresh()
        } catch (error) {
            console.error('Error al registrar:', error)
            toast.error('Error al registrar', { description: 'Ocurrio un error inesperado. Por favor intenta nuevamente.' })
        } finally {
            setIsLoading(false)
        }

    }

    return (
        <ClientOnly>
            <form onSubmit={handleSubmit(onSubmit)}>
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
                        <Input
                            id="password"
                            placeholder="••••••••"
                            disabled={isLoading}
                            {...register('password')}
                            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        {errors.password && (
                        <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                    </div>

                    <div className="space-y-1 mt-3">
                        <Label htmlFor="confirmPassword">Confirmar contraseña <span className="text-red-500">*</span></Label>
                        <Input
                            id="confirmPassword"
                            placeholder="Repite tu contraseña"
                            disabled={isLoading}
                            {...register('confirmPassword')}
                            className={errors.confirmPassword ? 'border-red-500' : ''}
                        />
                        {errors.confirmPassword && (
                        <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <div className="space-y-1 mt-3">
                        <Label htmlFor="role">Rol <span className="text-red-500">*</span></Label>
                        <Select
                            defaultValue={watch("role")}
                            onValueChange={(val) => setValue("role", val as CreateUserInput["role"])}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="seller">Vendedor</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.role && (
                        <p className="text-sm text-red-500">{errors.role.message}</p>
                        )}
                    </div>
                </div>

                <Button type="submit" className="mt-3 w-full cursor-pointer" disabled={isLoading}>
                    {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando usuario...
                    </>
                    ) : (
                    "Crear Usuario"
                    )}
                </Button>
            </form>
        </ClientOnly>
    )
}