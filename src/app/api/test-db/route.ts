import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const companies = await prisma.company.findMany({
            take: 5,
            include: {
                _count: {
                    select: {
                        users: true,
                        products: true,
                        clients: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Conexión a la base de datos exitosa',
            data: companies
        });
        
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error al conectar a la base de datos',
                error: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        )
    }
}