import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const movements = await prisma.stockMovement.findMany({
            include: { product: { select: { name: true, sku: true } } },
            orderBy: { createdAt: "desc" },
        });
        return NextResponse.json(movements);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { productId, type, quantity, reason } = body;

        if (!productId || !type || !quantity) {
            return NextResponse.json({ error: "Product, Type, and Quantity are required" }, { status: 400 });
        }

        const qtyChange = parseInt(quantity);
        const finalQtyChange = type === "OUT" ? -qtyChange : qtyChange;

        // Use a transaction to ensure both records are updated correctly
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update the product quantity
            const product = await tx.product.update({
                where: { id: productId },
                data: {
                    quantity: {
                        increment: finalQtyChange
                    }
                }
            });

            // 2. Create the stock movement record
            const movement = await tx.stockMovement.create({
                data: {
                    productId,
                    type,
                    quantity: qtyChange,
                    reason
                }
            });

            return { product, movement };
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
