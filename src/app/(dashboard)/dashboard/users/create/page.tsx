import { Metadata } from "next";
import { UserCreateForm } from "@/components/forms/user-create-form";

export const metadata: Metadata = {
  title: "Nuevo Usuario | Cotizador CRM",
  description: "Crea un nuevo usuario para tu empresa",
};

export default function CreateUserPage() {
  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Crear nuevo usuario
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Ingresa los datos del nuevo miembro de tu empresa
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <UserCreateForm />
        </div>
      </div>
    </div>
  );
}
