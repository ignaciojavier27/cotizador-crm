import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { automationSchema } from "@/lib/validations/automation";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.companyId) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Solo los administradores pueden editar automatizaciones" },
                { status: 403 }
            );
        }

        const automation = await prisma.automation.findUnique({
            where: { id },
        });

        if (!automation || automation.companyId !== session.user.companyId) {
            return NextResponse.json(
                { error: "Automatización no encontrada" },
                { status: 404 }
            );
        }

        const body = await req.json();
        const validation = automationSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Datos inválidos", details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { type, daysWait, emailSubject, emailContent, isActive } =
            validation.data;

        const updatedAutomation = await prisma.automation.update({
            where: { id },
            data: {
                type,
                daysWait,
                emailSubject,
                emailContent,
                isActive,
            },
        });

        return NextResponse.json(updatedAutomation);
    } catch (error) {
        console.error("Error updating automation:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        const { id } = await params;

        if (!session?.user?.companyId) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Solo los administradores pueden eliminar automatizaciones" },
                { status: 403 }
            );
        }

        const automation = await prisma.automation.findUnique({
            where: { id },
        });

        if (!automation || automation.companyId !== session.user.companyId) {
            return NextResponse.json(
                { error: "Automatización no encontrada" },
                { status: 404 }
            );
        }

        await prisma.automation.update({
            where: { id },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ message: "Automatización eliminada correctamente" });
    } catch (error) {
        console.error("Error deleting automation:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
