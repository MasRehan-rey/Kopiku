import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

console.log("API Cart route loaded")

//update user cart
export async function GET(request) {
    console.log("CART GET: Called!")
    try {
        const { userId } = getAuth(request)
        console.log("CART GET - User ID:", userId)
        
        if (!userId) {
            return NextResponse.json({ cart: {} })
        }
        
        // Ambil cart dari database
        const user = await prisma.user.findUnique({
            where: { id: userId }
        })
        
        console.log("CART GET - Cart from DB:", user?.cart)
        return NextResponse.json({ cart: user?.cart || {} })
    } catch (error) {
        console.error("CART GET Error:", error)
        return NextResponse.json({ cart: {} })
    }
}

export async function POST(request) {
    console.log("CART POST: Called!")
    
    try {
        const { userId } = getAuth(request)
        console.log("CART POST - User ID:", userId)
        
        if (!userId) {
            console.log("CART POST - No user ID found")
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }
        
        const body = await request.json()
        console.log("CART POST - Raw body:", body)
        const { cart } = body
        console.log("CART POST - Cart data:", cart)
        
        // Gunakan upsert - create jika tidak ada, update jika ada
        const result = await prisma.user.upsert({
            where: { id: userId },
            update: { cart: cart },
            create: { 
                id: userId, 
                name: 'User', // Default name
                email: 'user@example.com', // Default email
                image: 'default-avatar.png', // Default image
                cart: cart 
            }
        })
        
        console.log("CART POST - Upsert result:", result)
        console.log("CART POST - Cart saved successfully")
        return NextResponse.json({ message: "Cart updated successfully" })
        
    } catch (error) {
        console.error("CART POST Error:", error)
        console.error("CART POST Error stack:", error.stack)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}