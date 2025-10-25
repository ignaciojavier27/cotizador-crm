'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';
import { UserRole } from '@prisma/client';
import { useUsers } from '@/hooks/useUsers';
import ClientOnly from '../ClientOnly';
import { UpdateUserInput, updateUserSchema } from '@/lib/validations/user';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

interface EditUserClientProps {
  userId: string;
  currentUserId: string;
}

export default function UserEditForm({ userId, currentUserId }: EditUserClientProps) {
  const router = useRouter();
  const { fetchUserById, updateUser, isLoading } = useUsers();
  
  const isEditingSelf = userId === currentUserId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'seller',
      isActive: true,
      password: '',
    }
  })

  const role = watch('role');
  const isActive = watch('isActive');

  // Cargar datos del usuario
  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await fetchUserById(userId);
        
        reset({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          role: userData.role,
          isActive: userData.isActive,
          password: '',
        });
      } catch {
        toast.error('Error al cargar usuario', {
          description: 'Redirigiendo al dashboard...',
        });

        router.push('/dashboard/users');
      }
    }

    loadUser();
  }, [userId, fetchUserById, router, reset]);

  const onSubmit = async (data: UpdateUserInput) => {
    try {
      const payload = { ...data };
      if(!payload.password) delete payload.password;

      await updateUser(userId, payload);
      toast.success('Usuario actualizado correctamente', {
        description: 'Redirigiendo al dashboard...',
      });
      router.push('/dashboard/users');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      toast.error(errorMessage);
    }
  };

  return (
    <ClientOnly>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Datos del usuario</h3>
        <p className="text-sm text-slate-600 pb-3">
          {isEditingSelf
            ? 'Estás editando tu propio perfil. No puedes cambiar tu rol ni desactivar tu cuenta.'
            : 'Completa los campos necesarios para actualizar el usuario.'}
        </p>

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="firstName">Nombre *</Label>
            <Input id="firstName" disabled={isLoading} {...register('firstName')} />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="lastName">Apellido *</Label>
            <Input id="lastName" disabled={isLoading} {...register('lastName')} />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email">Correo electrónico *</Label>
          <Input id="email" type="email" disabled={isLoading} {...register('email')} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password opcional */}
        <div className="space-y-1">
          <Label htmlFor="password">Nueva contraseña (opcional)</Label>
          <Input id="password" type="password" disabled={isLoading} {...register('password')} />
          {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          <p className="text-xs text-gray-500">
            Solo completa este campo si deseas cambiar la contraseña.
          </p>
        </div>

        {/* Rol */}
        <div className="space-y-1">
          <Label>Rol *</Label>
          <Select
            value={role}
            onValueChange={(val) => setValue('role', val as UpdateUserInput['role'])}
            disabled={isEditingSelf || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UserRole.admin}>Administrador</SelectItem>
              <SelectItem value={UserRole.seller}>Vendedor</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
        </div>

        {/* Estado */}
        <div className="flex items-center justify-between border rounded-lg p-4">
          <div className="space-y-0.5">
            <Label htmlFor="isActive" className="text-base">Usuario activo</Label>
            <p className="text-sm text-gray-500">
              {isActive ? 'El usuario puede acceder al sistema' : 'El usuario no puede acceder al sistema'}
            </p>
          </div>
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={(checked) => setValue('isActive', checked)}
            disabled={isEditingSelf || isLoading}
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/users')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>
    </ClientOnly>
  );
}