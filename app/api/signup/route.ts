import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    console.log("Signup API Heartbeat Checked");
    return NextResponse.json({
        status: "alive",
        timestamp: new Date().toISOString(),
        prismaConfigured: !!prisma
    });
}

export async function POST(req: Request) {
    console.log("--- Signup API Started ---");
    try {
        const body = await req.json();
        const { name, email, password, role } = body;
        console.log("Processing signup for:", email);

        if (!email || !password) {
            console.log("Validation error: email or password missing");
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        console.log("Checking database for existing user...");
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.log("Signup failed: User already exists");
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 12);

        console.log("Inserting user into database...");
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "STAFF",
            },
        });

        console.log("User created successfully with ID:", user.id);
        return NextResponse.json(
            { message: "User created successfully", user: { id: user.id, email: user.email } },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("DIAGNOSTIC Signup error details:", {
            message: error.message,
            code: error.code,
            meta: error.meta,
            stack: error.stack
        });
        // We return the error details as JSON so we don't get the HTML "Unexpected token <" error
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error.message,
                stack: error.stack,
                code: error.code // Prisma error codes
            },
            { status: 500 }
        );
    } finally {
        console.log("--- Signup API Finished ---");
    }
}
