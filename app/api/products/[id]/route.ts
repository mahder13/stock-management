import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                supplier: true,
                stockMovements: {
                    orderBy: { createdAt: "desc" },
                    take: 10
                }
            },
        });

        if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

        return NextResponse.json(product);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();

        // Remove fields that should not be updated directly via data
        const { id: _, supplier, stockMovements, createdAt, updatedAt, ...updateData } = body;

        // Clean up data for types
        if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);
        if (updateData.quantity !== undefined) updateData.quantity = parseInt(updateData.quantity);
        if (updateData.minStockLevel !== undefined) updateData.minStockLevel = parseInt(updateData.minStockLevel);

        // Handle empty supplierId as null
        if (updateData.supplierId === "") {
            updateData.supplierId = null;
        }

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Delete related stock movements first if needed, though schema might handle it depending on referential integrity
        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
