import EditCategoryForm from "@/components/forms/category-edit-form";
import { getCurrentUser } from "@/lib/auth/session";

interface EditCategoryPageProps {
    params: {
        id: string;
    };
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
    const { id } = params;
    const currentUser = await getCurrentUser();

    if(id == null) return new Response(null, { status: 400 });
    if(!currentUser) return new Response(null, { status: 401 });

    return(
        <div className="flex pt-5 items-center justify-center">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Editar Categoría
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Edita los detalles de tu categoría
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-lg bg-white p-8 shadow-lg">
                    <EditCategoryForm categoryId={Number(id)} currentUser={currentUser} />
                </div>
            </div>
        </div>  
    )
}