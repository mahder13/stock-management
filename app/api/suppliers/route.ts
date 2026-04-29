import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(suppliers);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { name, contact, email, address } = body;

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        const supplier = await prisma.supplier.create({
            data: { name, contact, email, address },
        });

        return NextResponse.json(supplier, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
