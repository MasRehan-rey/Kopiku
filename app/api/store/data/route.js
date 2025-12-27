import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

//get store info & store products



export async function GET(request) {
    try {
        // get store username from query params
        const {searchParams } = new URL(request.url)
        const username = searchParams.get('username')?.toLowerCase();

        console.log("Store data API - Username:", username);

        if (!username){
            console.log("Store data API - Username missing");
            return NextResponse.json({error: "username tidak ada"}, {
                status: 400
            })
        }

        //get store info and inStock product with ratings
        const store = await prisma.store.findUnique({
            where: {username, isActive: true},
            include: {Product: {include: {rating: true}}}
        })

        console.log("Store data API - Store found:", store?.name || "Not found");

        if(!store){
            return NextResponse.json({error: "toko tidak ditemukan"},{
                status: 400
            })
        }

        return NextResponse.json({store})

    } catch (error) {
        console.error("Store data API - Error:", error);
        return NextResponse.json({error: error.code || error.message}, {
            status: 400
        })
        
        
    }
}