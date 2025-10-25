import UserEditForm from "@/components/forms/user-edit-form";
import { getCurrentUser } from "@/lib/auth/session";

interface EditUserPageProps {
    params: {
        id: string;
    };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    if(!currentUser) return new Response(null, { status: 401 });

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        Editar Usuario
                    </h1>
                    <p className="mt-2 text-sm text-slate-600">
                        Edita los detalles de tu usuario
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-lg bg-white p-8 shadow-lg">
                    <UserEditForm userId={id} currentUserId={currentUser?.id} />
                </div>
            </div>
        </div>
    );
}