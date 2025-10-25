import { UserRole } from '@prisma/client';
import { useState, useCallback } from 'react'

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface UserDB {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export function useUsers(initialUsers: User[] = []) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users');

      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      const result = await response.json();

      // Transformar la respuesta de la API
      const transformedUsers = result.data.users.map((user: UserDB) => ({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      }));
      
      setUsers(transformedUsers);
      return transformedUsers;

    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al desactivar usuario');
      }

      // Actualizar el estado local
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error al desactivar usuario:', error);
      throw error;
    }
  }, [fetchUsers]);

  return {
    users,
    setUsers,
    isLoading,
    fetchUsers,
    deleteUser,
  };
}