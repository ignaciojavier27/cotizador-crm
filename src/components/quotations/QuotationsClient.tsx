"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuotationStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Filter,
  X,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { QuotationDashboard } from "@/types/quotation";
import { useQuotations } from "@/hooks/useQuotations";
import { confirmDelete } from "@/utils/confirmation";
import { notify } from "@/utils/notifications";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { formatCurrency } from "@/utils/date";


const statusMap = {
  sent: {
    label: "Enviada",
    variant: "default" as const,
    className: "bg-blue-100 text-blue-800 border-blue-200"
  },
  accepted: {
    label: "Aceptada",
    variant: "outline" as const,
    className: "border-green-500 text-green-700 bg-green-50"
  },
  rejected: {
    label: "Rechazada",
    variant: "destructive" as const,
    className: ""
  },
  expired: {
    label: "Expirada",
    variant: "secondary" as const,
    className: ""
  },
};

interface QuotationsClientProps {
  initialQuotations: QuotationDashboard[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    status?: QuotationStatus;
    clientId?: string;
    userId?: string;
    search?: string;
  };
}

export default function QuotationsClient({
  initialQuotations,
  pagination: initialPagination,
  filters: initialFilters,
}: QuotationsClientProps) {
  const router = useRouter();

  const {
    quotations,
    pagination,
    isLoading,
    error,
    filters,
    hasFilters,
    activeFiltersCount,
    applyFilters,
    clearFilters,
    changePage,
    deleteQuotation,
    updateQuotationStatus,
    totalQuotations,
  } = useQuotations({
    initialQuotations,
    initialPagination,
    initialFilters,
    autoFetch: initialQuotations.length === 0,
  });

  const [searchInput, setSearchInput] = useState(initialFilters.search || "");
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters.status || "all");

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
    setSearchInput("");
    setStatusFilter("all");
    clearFilters();
  }, [clearFilters]);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    applyFilters({
      ...filters,
      status: status === "all" ? undefined : (status as QuotationStatus),
    });
  };

  const handleDeleteQuotation = async (id: string, quotationNumber: string) => {
    if (!confirmDelete(`la cotización ${quotationNumber}`)) return;

    try {
      await deleteQuotation(id);
      notify.success("Cotización eliminada correctamente");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al eliminar la cotización");
    }
  };

  const handleAcceptQuotation = async (id: string, quotationNumber: string) => {
    if (!confirm(`¿Confirmar aceptación de la cotización ${quotationNumber}?`)) return;

    try {
      await updateQuotationStatus(id, "accepted", undefined, "Cotización aceptada por el cliente");
      notify.success("Cotización aceptada");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al aceptar cotización");
    }
  };

  const handleRejectQuotation = async (id: string, quotationNumber: string) => {
    const reason = prompt(`Ingrese el motivo de rechazo para ${quotationNumber}:`);
    if (!reason) return;

    try {
      await updateQuotationStatus(id, "rejected", reason, "Cotización rechazada");
      notify.success("Cotización rechazada");
    } catch (error) {
      notify.error(error instanceof Error ? error.message : "Error al rechazar cotización");
    }
  };

  const isExpiringSoon = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const renderTableContent = () => {
    if (isLoading && quotations.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
            <p className="mt-2 text-gray-500">Cargando cotizaciones...</p>
          </TableCell>
        </TableRow>
      );
    }

    if (quotations.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500">
              {hasFilters ? "No hay cotizaciones que coincidan con los filtros" : "No hay cotizaciones"}
            </p>
          </TableCell>
        </TableRow>
      );
    }

    return quotations.map((quotation) => (
      <TableRow key={quotation.id}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <Link
                className="font-medium text-red-950 hover:underline hover:cursor-pointer"
                href={`/dashboard/quotations/${quotation.id}`}
              >
                {quotation.quotationNumber}
              </Link>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium">{quotation.client.name}</p>
            <p className="text-sm text-gray-500">{quotation.client.email || "Sin email"}</p>
          </div>
        </TableCell>
        <TableCell>
          <span className="text-sm text-gray-600">
            {format(new Date(quotation.createdAt), "dd MMM yyyy", { locale: es })}
          </span>
        </TableCell>
        <TableCell>
          {quotation.expiresAt ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {format(new Date(quotation.expiresAt), "dd MMM yyyy", { locale: es })}
              </span>
              {isExpiringSoon(quotation.expiresAt) && (
                <Badge variant="outline" className="text-orange-500">
                  ¡Próxima!
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </TableCell>
        <TableCell>
          <Badge
            variant={statusMap[quotation.status].variant}
            className={statusMap[quotation.status].className}
          >
            {statusMap[quotation.status].label}
          </Badge>
        </TableCell>
        <TableCell>
          <span className="text-sm text-gray-500">{quotation._count?.details || 0} items</span>
        </TableCell>
        <TableCell className="text-right font-medium">
          {formatCurrency(quotation.total + quotation.totalTax)}
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
                onClick={() => router.push(`/dashboard/quotations/details/${quotation.id}`)}
                className="cursor-pointer"
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver detalle
              </DropdownMenuItem>

              {quotation.status === "sent" && (
                <>
                  <DropdownMenuItem
                    onClick={() => router.push(`/dashboard/quotations/${quotation.id}/edit`)}
                    className="cursor-pointer"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAcceptQuotation(quotation.id, quotation.quotationNumber)}
                    className="cursor-pointer text-green-600 focus:text-green-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aceptar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleRejectQuotation(quotation.id, quotation.quotationNumber)}
                    className="cursor-pointer text-orange-600 focus:text-orange-600"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteQuotation(quotation.id, quotation.quotationNumber)}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </>
              )}
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
          <h1 className="text-3xl font-bold">Gestión de Cotizaciones</h1>
          <p className="text-gray-600 mt-1">Administra las cotizaciones de tu empresa</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/quotations/new")}
          className="flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nueva Cotización
        </Button>
      </div>

      {/* Alertas de error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{totalQuotations}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Enviadas</p>
          <p className="text-2xl font-bold text-blue-600">
            {quotations.filter((q) => q.status === "sent").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Aceptadas</p>
          <p className="text-2xl font-bold text-green-600">
            {quotations.filter((q) => q.status === "accepted").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <p className="text-sm text-gray-500">Rechazadas</p>
          <p className="text-2xl font-bold text-red-600">
            {quotations.filter((q) => q.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por número, cliente o email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por estado */}
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="sent">Enviadas</SelectItem>
              <SelectItem value="accepted">Aceptadas</SelectItem>
              <SelectItem value="rejected">Rechazadas</SelectItem>
              <SelectItem value="expired">Expiradas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableContent()}</TableBody>
        </Table>
      </div>

      {/* Resumen y paginación */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
        <div className="text-sm text-gray-600">
          Mostrando {quotations.length} de {totalQuotations} cotización{totalQuotations !== 1 ? "es" : ""}
          {hasFilters && " (filtrados)"}
        </div>

        <div className="flex gap-2 items-center">
          {hasFilters && activeFiltersCount > 0 && (
            <Button variant="outline" onClick={handleClearFilters} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Limpiar filtros
            </Button>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => changePage(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoading}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages || isLoading}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}