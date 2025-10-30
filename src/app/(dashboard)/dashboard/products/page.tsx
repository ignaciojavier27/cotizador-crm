import { requireAuth } from '@/lib/auth/authorize';
import { getAllProducts } from '@/lib/services/productServices';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProductsClient from '@/components/products/ProductsClient';
import { ProductFull } from '@/types/product';

export const metadata = {
  title: 'Productos | Dashboard',
  description: 'Gestiona el catálogo de productos de tu empresa',
};

interface ProductsPageResult {
  products: ProductFull[];
  total: number;
  filters: {
    search: string;
    company: string;
    isActive: string;
    categoryId: string;
  };
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

async function getProductsData(companyId: string): Promise<{
  products: ProductFull[];
  total: number;
}> {
  try {
    const result: ProductsPageResult = await getAllProducts({
      companyId,
      isActive: null,
      search: null,
      categoryId: null,
    });

    return {
      products: result.products,
      total: result.total,
    };
  } catch (error) {
    console.error('Error al cargar productos:', error);
    return {
      products: [],
      total: 0,
    };
  }
}

async function getCategories(companyId: string): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      where: {
        companyId,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map(cat => ({
      id: String(cat.id),
      name: cat.name,
      description: cat.description || undefined,
    }));
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    return [];
  }
}

export default async function ProductsPage() {
  let user;
  
  try {
    user = await requireAuth();

    if (!user?.companyId) {
      console.warn('Usuario sin companyId, redirigiendo a dashboard');
      redirect('/dashboard');
    }

    // Cargar datos en paralelo para mejor performance
    const [productsData, categories] = await Promise.allSettled([
      getProductsData(user.companyId),
      getCategories(user.companyId),
    ]);

    // Manejar resultados de las promesas
    const products = productsData.status === 'fulfilled' ? productsData.value.products : [];
    const totalProducts = productsData.status === 'fulfilled' ? productsData.value.total : 0;
    const categoriesData = categories.status === 'fulfilled' ? categories.value : [];

    // Log para debugging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Cargados ${products.length} productos de ${totalProducts} totales`);
      console.log(`📂 Cargadas ${categoriesData.length} categorías`);
    }

    return (
      <ProductsClient
        initialProducts={products}
        categories={categoriesData}
        totalProducts={totalProducts}
      />
    );
  } catch (error) {
    console.error('Error crítico en ProductsPage:', error);
    
    // Redirigir a login solo si es error de autenticación
    if (error instanceof Error && error.message.includes('auth')) {
      redirect('/login');
    }
    
    // Para otros errores, mostrar página con estado vacío
    return (
      <ProductsClient
        initialProducts={[]}
        categories={[]}
        totalProducts={0}
      />
    );
  }
}