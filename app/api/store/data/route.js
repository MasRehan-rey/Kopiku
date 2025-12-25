import Product from "@/app/(public)/product/[productId]/page";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";

//get store info & store products



export async function GET(request) {
    try {
        // get store username from query params
        const {searchParams } = new URL(request.url)
        const username = searchParams.get('username').toLowerCase();

        if (!username){
            return NextResponse.json({error: "username tidak ada"}, {
                status: 400
            })
        }

        //get store info and inStock product with ratings
        const store = await prisma.store.findUnique({
            where: {username, isActive: true},
            include: {Product: {include: {rating: true}}}
        })

        if(!store){
            return NextResponse.json({error: "toko tidak ditemukan"},{
                status: 400
            })
        }

        return NextResponse.json({store})

    } catch (error) {
        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {
            status: 400
        })
        
        
    }
}