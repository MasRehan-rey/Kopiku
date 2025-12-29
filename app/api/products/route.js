import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"


export async function GET(request){
    try {
        console.log("API: Fetching all products...")
        let products = await prisma.product.findMany({
            where: {inStock: true},
            include: {
                rating: {
                    select:  {
                        createdAt: true,
                        rating: true,
                        review: true,
                        user: {select: {name: true, image: true}}
                    }
                },
                store: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        console.log("API: Raw products found:", products.length)

        //remove product with  store isActive false
        products = products.filter(product => product.store.isActive )
        console.log("API: Filtered products (active stores):", products.length)
        
        return NextResponse.json({products})
    } catch (error) {
        console.error("API Error:", error);
        if (error?.code === 'P1001') {
            return NextResponse.json({ error: 'DATABASE_UNREACHABLE' }, {
                status: 503
            })
        }
        return NextResponse.json({error: "Ada error di server internal"}, {
            status: 500
        })
    }
}