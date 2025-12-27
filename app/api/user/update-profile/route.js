import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { userId } = getAuth(request);
        const { name } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Update user name di database
        const updatedUser = await prisma.user.update({
            where: { clerkId: userId },
            data: { name }
        });

        return NextResponse.json({ 
            message: "Profile updated successfully",
            user: updatedUser 
        });

    } catch (error) {
        console.error("Update profile error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
