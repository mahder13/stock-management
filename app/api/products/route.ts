import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const products = await prisma.product.findMany({
            include: { supplier: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { name, description, sku, price, quantity, minStockLevel, supplierId } = body;

        if (!name || !sku || price === undefined || isNaN(parseFloat(price))) {
            return NextResponse.json({ error: "Name, SKU, and valid Price are required" }, { status: 400 });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                sku,
                price: parseFloat(price),
                quantity: parseInt(quantity) || 0,
                minStockLevel: parseInt(minStockLevel) || 5,
                supplierId: supplierId || null,
            },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        if (error.code === "P2002") {
            return NextResponse.json({ error: "SKU must be unique" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
