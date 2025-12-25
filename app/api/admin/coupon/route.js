import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { inngest } from "@/inngest/client"; 

// get all coupons
export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, {
                status: 401
            })
        }

        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ coupons })
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, {
            status: 400
        })
    }
}

// add new coupon
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'not authorized' }, {
                status: 401
            })
        }

        const { coupon } = await request.json()
        
        // Validasi required fields
        if (!coupon || !coupon.code) {
            return NextResponse.json({ error: 'Coupon code is required' }, {
                status: 400
            })
        }
        
        coupon.code = coupon.code.toUpperCase()

        const createdCoupon = await prisma.coupon.create({data: coupon})
        
        //run inngest scheduler Function to delete coupon on expire
        await inngest.send({
            name: "app/coupon.expired",
            data: {
                code: createdCoupon.code,
                expires_at: createdCoupon.expiresAt
            }
        })

        return NextResponse.json({message: "Kupon Berhasil Ditambahkan"})

    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {
            status: 400
        })
    }
}

//delete coupon
export async function DELETE(request) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if(!isAdmin) {
            return NextResponse.json({ error: "not authorized"}, {
                status: 401
            })
        }

        const { searchParams } = request.nextUrl;
        const code = searchParams.get('code')

        await prisma.coupon.delete({where: { code }})
        return NextResponse.json({ message: 'Kupon Berhasil Dihapus' })
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {
            status: 400
        })
    }
}