import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//auth seller
export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        
        if (!userId) {
            return NextResponse.json({ error: 'not authorized' },{
                status: 401
            });
        }

        const storeInfo = await prisma.store.findUnique({
            where: { userId },
            include: { user: true }
        })

        console.log("API: Store info found:", storeInfo)
        console.log("API: Store status:", storeInfo?.status)

        const isSeller = storeInfo && storeInfo.status === 'approved' ? true : false
        console.log("API: Is seller result:", isSeller)

        return NextResponse.json({ isSeller, storeInfo })

    } catch (error) {
        console.error("API Error:", error);
            return NextResponse.json({error: error.code || error.message}, {
                status: 400
            })
    } 
}