import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { UserRole } from "@prisma/client";
import CategoriesClient from "@/components/categories/CategoriesClient";
import { getCategories } from "@/lib/services/categoryServices";

async function fetchCategories(companyId: string) {
  try {
    const result = await getCategories({
      search: null,
      companyId,
    });

    return result.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      createdAt: cat.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== UserRole.admin) {
    redirect('/dashboard');
  }

  const initialCategories = await fetchCategories(session.user.companyId);

  return <CategoriesClient initialCategories={initialCategories} />;
}