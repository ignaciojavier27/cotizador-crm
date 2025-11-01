import { ProductCreateForm } from "@/components/forms/product-create-form";

export default function CreateProductPage() {
    return(
    <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
        <div className="w-full max-w-md">

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900">
                    Crear un nuevo producto
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                    Ingresa los datos del nuevo producto
                </p>
            </div>

            <div className="rounded-lg bg-white p-8 shadow-lg">
                <ProductCreateForm />
            </div>
        </div>
    </div>  
    )
}