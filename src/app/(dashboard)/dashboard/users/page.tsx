// src/app/dashboard/users/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { UserRole } from "@prisma/client";
import UsersClient from "@/components/users/UsersClient";
import { getAllUsers } from "@/lib/services/userServices";
import { User } from "@/hooks/useUsers";

/**
 * Obtiene la lista de usuarios desde la base de datos
 * Esta función se ejecuta en el servidor
 */
async function getUsers(companyId: string): Promise<User[]> {
  try {
    const filters = {
      companyId,
      role: null,
      isActive: null,
      search: null,
    };
    
    const result = await getAllUsers(filters);
    
    // Transformar el resultado de getAllUsers al formato que espera UsersClient
    return result.users.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`, // Combinar firstName y lastName
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(), // Convertir Date a string
    }));

  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    return [];
  }
}

export default async function UsersPage() {
  // Verificar autenticación
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  // Verificar que sea administrador
  if (session.user.role !== UserRole.admin) {
    redirect('/dashboard');
  }

  // Obtener usuarios de la misma empresa
  const initialUsers = await getUsers(session.user.companyId);

  return <UsersClient initialUsers={initialUsers} />;
}