import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// get all pending stores
export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, {
                status: 401
            })
        }

        const stores = await prisma.store.findMany({
            where: { status: 'pending' },
            include: { user: true }
        })

        return NextResponse.json({ stores })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, {
            status: 400
        })
    }
}

// approve or reject store
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, {
                status: 401
            })
        }

        const { storeId, status } = await request.json()

        if (!storeId || !status || !['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid storeId or status' }, {
                status: 400
            })
        }

        const store = await prisma.store.update({
            where: { id: storeId },
            data: { 
                status: status,
                isActive: status === 'approved'
            },
            include: { user: true }
        })

        return NextResponse.json({ 
            message: `Store ${status} successfully`,
            store 
        })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, {
            status: 400
        })
    }
}