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
  createdAt: Date | string;
}

export interface UserDetail extends UserDB {
  companyId: string;
  updatedAt?: Date | string;
  company?: {
    id: string;
    name: string;
  }
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
        createdAt: typeof user.createdAt === 'string'
          ? user.createdAt
          : user.createdAt.toISOString(),
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

  const fetchUserById = useCallback(async (userId:string): Promise<UserDetail> => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cargar usuario');
      }

      const result = await response.json();

      return result.data
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [])

  const updateUser = useCallback(async (userId: string, data: Partial<UserDB>) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar usuario');
      }

      const result = await response.json();

      // Actualizar la lista local de usuarios
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId
            ? {
                ...user,
                name: `${result.data.firstName} ${result.data.lastName}`,
                email: result.data.email,
                role: result.data.role,
                isActive: result.data.isActive,
              }
            : user
        )
      );

      return result.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
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
        throw new Error('Error al eliminar usuario');
      }

      // Actualizar el estado local
      await fetchUsers();
      return true;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }, [fetchUsers]);

const createUser = useCallback(async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
  }) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear usuario');
      }

      const result = await response.json();

      // Agregar el nuevo usuario a la lista
      const newUser: User = {
        id: result.data.id,
        name: `${result.data.firstName} ${result.data.lastName}`,
        email: result.data.email,
        role: result.data.role,
        isActive: result.data.isActive,
        createdAt: result.data.createdAt,
      };

      setUsers(prevUsers => [...prevUsers, newUser]);

      return result.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    users,
    setUsers,
    isLoading,
    fetchUsers,
    fetchUserById,
    updateUser,
    deleteUser,
    createUser
  };
}