import ProductEditForm from "@/components/forms/product-edit-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const currentUser = await getCurrentUser();

  if (!currentUser) return new Response(null, { status: 401 });

  return (
    <div className="px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Editar Producto
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Edita los detalles del producto
          </p>
        </div>

        {/* Card */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <ProductEditForm
            productId={id}
            currentUserCompanyId={currentUser.companyId}
          />
        </div>
      </div>
    </div>
  );
}
