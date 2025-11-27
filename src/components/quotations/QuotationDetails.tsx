"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    ArrowLeft,
    Printer,
    Calendar,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    CreditCard
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/utils/date";
import { PDFButtons } from "@/components/pdf/PDFButtons";

// We use a loose type here to accept the data from getQuotationById
// In a real app we might want to export the specific type from the service
interface QuotationDetailsProps {
    quotation: any;
}

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

export default function QuotationDetails({ quotation }: QuotationDetailsProps) {
    const router = useRouter();
    const status = statusMap[quotation.status as keyof typeof statusMap] || statusMap.sent;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3">
                            {quotation.quotationNumber}
                            <Badge variant={status.variant} className={status.className}>
                                {status.label}
                            </Badge>
                        </h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <PDFButtons quotationId={quotation.id} quotationNumber={quotation.quotationNumber} />
                    <Button variant="outline" className="gap-2" onClick={() => window.print()}>
                        <Printer className="h-4 w-4" />
                        Imprimir
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - Left Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Client Information */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                Información del Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Cliente / Empresa</p>
                                    <p className="text-lg font-medium">{quotation.client.name}</p>
                                </div>
                                {quotation.client.taxId && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">RUT / Identificación</p>
                                        <p>{quotation.client.taxId}</p>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{quotation.client.email || "Sin email"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{quotation.client.phone || "Sin teléfono"}</span>
                                </div>
                                {quotation.client.address && (
                                    <div className="flex items-start gap-2 md:col-span-2">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                                        <span className="text-sm">{quotation.client.address}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items Table */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                Detalle de Productos / Servicios
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Cant.</TableHead>
                                        <TableHead className="text-right">Precio Unit.</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {quotation.details.map((detail: any) => (
                                        <TableRow key={detail.id}>
                                            <TableCell>
                                                <div className="font-medium">{detail.product.name}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                    {detail.product.description}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{detail.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(detail.unitPrice)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(detail.subtotal)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Internal Notes */}
                    {quotation.internalNotes && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium">Notas Internas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 whitespace-pre-wrap">{quotation.internalNotes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Right Column */}
                <div className="space-y-6">
                    {/* Summary / Dates */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                Fechas y Estado
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Fecha de emisión</span>
                                <span className="text-sm font-medium">
                                    {format(new Date(quotation.createdAt), "dd MMM yyyy", { locale: es })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Vencimiento</span>
                                <span className="text-sm font-medium">
                                    {quotation.expiresAt
                                        ? format(new Date(quotation.expiresAt), "dd MMM yyyy", { locale: es })
                                        : "N/A"}
                                </span>
                            </div>
                            <Separator />
                            <div>
                                <span className="text-sm text-gray-500 block mb-1">Vendedor</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                        {quotation.user.firstName[0]}{quotation.user.lastName[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {quotation.user.firstName} {quotation.user.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500">{quotation.user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Totals */}
                    <Card className="bg-gray-50/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-medium flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-gray-500" />
                                Resumen Económico
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal Neto</span>
                                <span>{formatCurrency(quotation.total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Impuestos (IVA)</span>
                                <span>{formatCurrency(quotation.totalTax)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-end">
                                <span className="font-bold text-lg">Total</span>
                                <span className="font-bold text-xl text-primary">
                                    {formatCurrency(quotation.total + quotation.totalTax)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}