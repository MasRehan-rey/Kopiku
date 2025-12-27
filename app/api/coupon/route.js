import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//verify coupon
export async function POST(request) {
    console.log("COUPON POST: Called!")
    try {
        const auth = getAuth(request)
        console.log("COUPON POST - Auth object:", auth)
        
        const { userId } = auth
        console.log("COUPON POST - User ID:", userId)
        
        const { code } = await request.json()
        console.log("COUPON POST - Code:", code)

        if (!userId) {
            console.log("COUPON POST - No user ID found")
            return NextResponse.json({ error: 'Anda harus login terlebih dahulu' }, { status: 401 })
        }

        const coupon = await prisma.coupon.findUnique({
            where: {
                code: code.toUpperCase(),
                expiresAt: { gt: new Date() }
            }
        })
        
        console.log("COUPON POST - Coupon found:", coupon)

        if (!coupon) {
            return NextResponse.json({ error: 'Kupon tidak ditemukan atau sudah kadaluarsa' }, { status: 404 })
        }

        if (coupon.forNewUser) {
            const userOrders = await prisma.order.findMany({
                where: { userId }
            })
            if (userOrders.length > 0) {
                return NextResponse.json({ error: 'Kupon hanya valid untuk pengguna baru' }, { status: 400 })
            }
        }

        if (coupon.forMember) {
            // Check if user has plus plan using Clerk
            const { has } = auth
            console.log("COUPON POST - Has function:", has)
            
            const hasPlusPlan = has({ plan: 'plus' })
            console.log("COUPON POST - Has plus plan:", hasPlusPlan)
            
            if (!hasPlusPlan) {
                console.log("COUPON POST - User not plus member")
                return NextResponse.json({ error: 'Kupon hanya untuk member plus' }, { status: 400 })
            }
            
            console.log("COUPON POST - User is plus member")
        }

        return NextResponse.json({ coupon })

    } catch (error) {
        console.error("Coupon API Error:", error)
        console.error("Coupon API Error stack:", error.stack)
        return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 })
    }
}