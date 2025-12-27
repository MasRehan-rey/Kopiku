import prisma from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"


//add new address
export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const requestData = await request.json()
        
        console.log("API POST Address - User ID:", userId)
        console.log("API POST Address - Request data:", requestData)

        const {address} = requestData

        address.userId = userId

        console.log("API POST Address - Final address data:", address)

       const newAddress = await prisma.address.create({
        data: address
       })

        console.log("API POST Address - Address created:", newAddress)

        return NextResponse.json({newAddress, message: 'Alamat Berhasil Ditambahkan'})
    } catch (error) {
        console.error("API POST Address Error:", error);
        return NextResponse.json({ error: error.code || error.message }, {
            status: 400
        }) 
    }
}

// get all addresses for a user

export async function GET(request) {
    try {
        const { userId } = getAuth(request)

       const addresses = await prisma.address.findMany({
        where: { userId }
       })

        return NextResponse.json({addresses})
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error.code || error.message }, {
            status: 400
        }) 
    }
}