import { getCompany } from "@/actions/company";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Building2, Mail, MapPin, Phone, Pencil } from "lucide-react";
import Link from "next/link";

export default async function CompanyPage() {
    const result = await getCompany();

    if (!result.success || !result.data) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {result.error || "No se pudo cargar la información de la empresa."}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const company = result.data;

    return (
        <div className="flex-1 space-y-4 p-12">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Mi Empresa</h2>
                <Link href="/dashboard/companies/edit">
                    <Button>
                        <Pencil className="mr-2 h-4 w-4 cursor-pointer" />
                        Editar Información
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Detalles de la Empresa</CardTitle>
                        <CardDescription>
                            Información general de tu organización.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                                <p className="text-lg font-semibold">{company.name}</p>
                            </div>
                            {company.logoUrl && (
                                <div className="h-16 w-16 overflow-hidden rounded-lg border">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={company.logoUrl}
                                        alt={`Logo de ${company.name}`}
                                        className="h-full w-full object-contain"
                                    />
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Building2 className="h-4 w-4" /> RUT
                                </p>
                                <p className="text-base">{company.rut}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> Email de Contacto
                                </p>
                                <p className="text-base">{company.contactEmail || "No registrado"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Phone className="h-4 w-4" /> Teléfono
                                </p>
                                <p className="text-base">{company.phone || "No registrado"}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Dirección
                                </p>
                                <p className="text-base">{company.address || "No registrada"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Resumen</CardTitle>
                        <CardDescription>
                            Estadísticas rápidas de tu empresa.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-muted-foreground">Usuarios</p>
                                <p className="text-2xl font-bold">{company._count?.users || 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-muted-foreground">Clientes</p>
                                <p className="text-2xl font-bold">{company._count?.clients || 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-muted-foreground">Productos</p>
                                <p className="text-2xl font-bold">{company._count?.products || 0}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-muted-foreground">Cotizaciones</p>
                                <p className="text-2xl font-bold">{company._count?.quotations || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
