'use client';

import { ClientWithCompany } from "@/types/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Mail, 
  Pencil, 
  Phone, 
  ShieldCheck, 
  Trash2, 
  User, 
  Users, 
  XCircle 
} from "lucide-react";
import { confirmDelete } from "@/utils/confirmation";
import { notify } from "@/utils/notifications";
import { useClients } from "@/hooks/useClients";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ClientDetailsClientProps {
  client: ClientWithCompany;
}

export default function ClientDetailsClient({ client }: ClientDetailsClientProps) {
  const router = useRouter();
  const { deleteClient } = useClients();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete(client.name)) return;
    
    setIsDeleting(true);
    try {
      await deleteClient(client.id);
      notify.success('Cliente eliminado correctamente');
      router.push('/dashboard/clients');
    } catch {
      notify.error('Error al eliminar el cliente');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'No especificada';
    try {
      return format(new Date(date), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="container mx-auto p-6 pt-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/clients')}
          className="mb-4 -ml-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a clientes
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{client.name}</h1>
            <p className="text-gray-600 mt-1">Información completa del cliente</p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/clients/edit/${client.id}`)}
              className="cursor-pointer"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información de contacto */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Información de Contacto
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Nombre completo</p>
                  <p className="font-medium text-slate-900">{client.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Correo electrónico</p>
                  <a 
                    href={`mailto:${client.email}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {client.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <a 
                    href={`tel:${client.phone}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {client.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Información de la empresa del cliente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-orange-600" />
              Información de la Empresa del Cliente
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Empresa</p>
                  <p className="font-medium text-slate-900">{client.clientCompany}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Contacto de referencia</p>
                  <p className="font-medium text-slate-900">{client.referenceContact}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Consentimiento de datos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-teal-600" />
              Protección de Datos
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${client.dataConsent ? 'bg-green-50' : 'bg-red-50'} rounded-lg flex items-center justify-center shrink-0`}>
                  {client.dataConsent ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Consentimiento de uso de datos</p>
                  <p className={`font-medium ${client.dataConsent ? 'text-green-600' : 'text-red-600'}`}>
                    {client.dataConsent ? 'Autorizado' : 'No autorizado'}
                  </p>
                </div>
              </div>

              {client.consentDate && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Fecha de consentimiento</p>
                    <p className="font-medium text-slate-900">{formatDate(client.consentDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Empresa asociada */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Tu Empresa
            </h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium text-slate-900">{client.company.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">RUT</p>
                <p className="font-medium text-slate-900">{client.company.rut}</p>
              </div>
            </div>
          </div>

          {/* Metadatos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Información del Sistema
            </h2>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">ID del cliente</p>
                <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">
                  {client.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha de creación</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(client.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Última actualización</p>
                <p className="text-sm font-medium text-slate-900">
                  {formatDate(client.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}