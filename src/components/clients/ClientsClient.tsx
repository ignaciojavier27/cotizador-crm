'use client'

import { useClients } from "@/hooks/useClients";
import { ClientWithCompany } from "@/types/client";
import { confirmDelete } from "@/utils/confirmation";
import { notify } from "@/utils/notifications";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { MoreHorizontal, Package, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";


export default function ClientsClient(
    { initialClients }: { initialClients: ClientWithCompany[] }
) {
    const router = useRouter();

    const {
        clients,
        isLoading,
        totalClients,
        filters,
        applyFilters,
        clearFilters,
        deleteClient,
        hasFilters,
        activeFiltersCount,
        error
    } = useClients({
        initialClients,
        initialFilters: {},
        autoFetch: initialClients.length === 0
    });

    const [searchInput, setSearchInput] = useState('');

    /**
     * Debounce para búsqueda
     */
    useEffect(() => {
        const timeout = setTimeout(() => {
            applyFilters({
                ...filters,
                search: searchInput.trim() || undefined,
            });
        }, 400);
        return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    const handleClearFilters = useCallback(() => {
        setSearchInput('');
        clearFilters();
    }, [clearFilters]);

    const handleDeleteclient = async (clientId: string, clientName: string) => {
        if (!confirmDelete(clientName)) return;
        try {
            await deleteClient(clientId);
            notify.success('Cliente eliminado correctamente');
        } catch {
            notify.error('Error al eliminar el cliente');
        }
    }

  const renderTableContent = () => {
    if (isLoading && clients.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <p className="mt-2 text-gray-500">Cargando clientes...</p>
          </TableCell>
        </TableRow>
      );
    }

    if (clients.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
            {hasFilters ? 'No hay clientes que coincidan con los filtros' : 'No se encontraron clientes'}
          </TableCell>
        </TableRow>
      );
    }

    return clients.map((client) => (
      <TableRow key={client.id}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <Link 
                className="font-medium text-red-950 hover:underline hover:cursor-pointer"
                href={`/dashboard/clients/details/${client.id}`}
              >
                {client.name}
              </Link>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-gray-600">{client.clientCompany}</span>
        </TableCell>
        <TableCell>
          <span className="text-sm text-gray-600">{client.phone}</span>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/clients/edit/${client.id}`)}
                className="cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteclient(client.id, client.name)}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="container mx-auto p-6 pt-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
          <p className="text-gray-600 mt-1">Administra a los clientes de tu empresa</p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/clients/create')}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Alertas de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Buscar */}
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, correo o teléfono"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>
      </div>

      {/* Resumen y paginación */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-sm text-gray-600">
          Mostrando {clients.length} de {totalClients} cliente{totalClients !== 1 ? 's' : ''}
          {hasFilters && ' (filtrados)'}
        </div>
        
        {(hasFilters && activeFiltersCount > 0 )&& (
          <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}