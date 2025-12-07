'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Search, Pencil, Trash2, Percent, Filter, X } from 'lucide-react';
import { useTaxes } from '@/hooks/useTaxes';
import { confirmDelete } from '@/utils/confirmation';
import { notify } from '@/utils/notifications';
import { formatDate } from '@/utils/date';
import { TaxFull } from '@/types/tax';
import Link from 'next/link';

interface TaxesClientProps {
    initialTaxes: TaxFull[];
    totalTaxes: number;
}

export default function TaxesClient({ initialTaxes }: TaxesClientProps) {
    const router = useRouter();

    const {
        taxes,
        isLoading,
        totalTaxes,
        filters,
        applyFilters,
        clearFilters,
        deleteTax,
        hasFilters,
        activeFiltersCount,
        error,
    } = useTaxes({
        initialTaxes,
        initialFilters: {},
        autoFetch: initialTaxes.length === 0,
    });

    const [searchInput, setSearchInput] = useState('');
    const [statusInput, setStatusInput] = useState<'all' | 'active' | 'inactive'>('all');

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

    const handleStatusChange = useCallback((value: 'all' | 'active' | 'inactive') => {
        setStatusInput(value);

        const newFilters = { ...filters };
        if (value === 'all') {
            delete newFilters.isActive;
        } else {
            newFilters.isActive = value === 'active';
        }

        applyFilters(newFilters);
    }, [filters, applyFilters]);

    const handleClearFilters = useCallback(() => {
        setSearchInput('');
        setStatusInput('all');
        clearFilters();
    }, [clearFilters]);

    const handleQuickStatusFilter = useCallback((status: boolean | null) => {
        if (status === null) {
            handleStatusChange('all');
        } else {
            handleStatusChange(status ? 'active' : 'inactive');
        }
    }, [handleStatusChange]);

    const handleDeleteTax = async (taxId: string, taxName: string) => {
        if (!confirmDelete(taxName)) return;
        try {
            await deleteTax(taxId);
            notify.success('Impuesto eliminado correctamente');
        } catch {
            notify.error('Error al eliminar el impuesto');
        }
    };

    const renderFiltersBadge = () => {
        if (!hasFilters || activeFiltersCount === 0) return null;

        return (
            <div className="flex items-center gap-2 mb-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700">
                    {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} aplicado{activeFiltersCount !== 1 ? 's' : ''}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-auto p-1 text-blue-600 hover:text-blue-800"
                >
                    <X className="w-3 h-3" />
                </Button>
            </div>
        );
    };

    const renderTableContent = () => {
        if (isLoading && taxes.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                        <p className="mt-2 text-gray-500">Cargando impuestos...</p>
                    </TableCell>
                </TableRow>
            );
        }

        if (taxes.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {hasFilters ? 'No hay impuestos que coincidan con los filtros' : 'No se encontraron impuestos'}
                    </TableCell>
                </TableRow>
            );
        }

        return taxes.map((tax) => (
            <TableRow key={tax.id}>
                <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Percent className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <Link
                                className="font-medium text-red-950 hover:underline hover:cursor-pointer"
                                href={`/dashboard/taxes/edit/${tax.id}`}
                            >
                                {tax.name}
                            </Link>
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <span className="font-semibold">{tax.percentage}%</span>
                </TableCell>
                <TableCell>
                    <span className="text-sm text-gray-600 max-w-[200px] line-clamp-2">
                        {tax.description || '-'}
                    </span>
                </TableCell>
                <TableCell>
                    <Badge
                        variant={tax.isActive ? "default" : "secondary"}
                        className={tax.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}
                    >
                        {tax.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                    {formatDate(tax.createdAt)}
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
                                onClick={() => router.push(`/dashboard/taxes/edit/${tax.id}`)}
                                className="cursor-pointer"
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => handleDeleteTax(tax.id, tax.name)}
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Gestión de Impuestos</h1>
                    <p className="text-gray-600 mt-1">Configura los impuestos aplicables a tus productos</p>
                </div>
                <Button
                    onClick={() => router.push('/dashboard/taxes/create')}
                    className="flex items-center gap-2 cursor-pointer shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Impuesto
                </Button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative col-span-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            placeholder="Buscar por nombre o descripción..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={statusInput} onValueChange={handleStatusChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="active">Solo activos</SelectItem>
                            <SelectItem value="inactive">Solo inactivos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {renderFiltersBadge()}

                <div className="flex flex-wrap gap-2 mt-4">
                    <Button
                        variant={statusInput === 'all' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleQuickStatusFilter(null)}
                    >
                        Todos
                    </Button>
                    <Button
                        variant={statusInput === 'active' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleQuickStatusFilter(true)}
                    >
                        Activos
                    </Button>
                    <Button
                        variant={statusInput === 'inactive' ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleQuickStatusFilter(false)}
                    >
                        Inactivos
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Porcentaje</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha Creación</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {renderTableContent()}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                <div className="text-sm text-gray-600">
                    Mostrando {taxes.length} de {totalTaxes} registro{totalTaxes !== 1 ? 's' : ''}
                    {hasFilters && ' (filtrados)'}
                </div>

                {(hasFilters && activeFiltersCount > 0) && (
                    <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
                        <X className="w-4 h-4" />
                        Limpiar filtros
                    </Button>
                )}
            </div>
        </div>
    );
}
