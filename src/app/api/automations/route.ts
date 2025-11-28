import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { automationSchema } from "@/lib/validations/automation";

export async function GET(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.companyId) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const automations = await prisma.automation.findMany({
            where: {
                companyId: session.user.companyId,
                deletedAt: null,
            },
            include: {
                _count: {
                    select: { notifications: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(automations);
    } catch (error) {
        console.error("Error fetching automations:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.companyId) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        if (session.user.role !== "admin") {
            return NextResponse.json(
                { error: "Solo los administradores pueden crear automatizaciones" },
                { status: 403 }
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

        const automation = await prisma.automation.create({
            data: {
                companyId: session.user.companyId,
                type,
                daysWait,
                emailSubject,
                emailContent,
                isActive,
            },
        });

        return NextResponse.json(automation, { status: 201 });
    } catch (error) {
        console.error("Error creating automation:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
