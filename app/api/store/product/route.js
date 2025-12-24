import imageKit from "@/configs/imageKit"
import authSeller from "@/middlewares/authSeller"
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// add new product
export async function POST(request){
    try {
        const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if(!storeId){
            return NextResponse.json({error: 'not authorized'}, {status: 401})
        }

        //Get the data from the form
        const formData = await request.formData()
        const name = formData.get("name")
        const description = formData.get("description")
        const mrp = Number(formData.get("mrp"))
        const price = Number(formData.get("price"))
        const category = formData.get("category")
        const images = formData.getAll("images")

        if(!name || !description || !mrp || !price || !category || images.length < 1){
             return NextResponse.json({error: 'Produk Tidak Ditemukan'}, {status: 400})
        }

        //uploading Images to ImageKit
        const imagesUrl = await Promise.all(images.map(async(image) => {
            const buffer = Buffer.from(await image.arrayBuffer());
            const response = await imageKit.upload({
                file: buffer, 
                fileName: image.name,
                folder: "products",
            })
            const url = imageKit.url ({
                path: response.filePath,
                transformation: [
                    {quality: 'auto'},
                    {format: 'webp'}, 
                    {width: '1024'}
                ]
            })
            return url
        }))

        await prisma.product.create({
            data: {
                name, 
                description,
                mrp,
                price,
                category,
                images: imagesUrl,
                storeId
            }
        })

        return NextResponse.json({message: "Product added succesfully"})
        
    } catch (error) {
      console.error(error);
      return NextResponse.json({error: error.code || error.message},
        {status: 400}
      )
    }
}

//Get all products for a seller
export async function GET (request){
    try {
         const { userId } = getAuth(request)
        const storeId = await authSeller(userId)

        if(!storeId){
            return NextResponse.json({error: 'not authorized'}, {status: 401})
        }

        const product = await prisma.product.findMany({
            where: {storeId}
        })
    } catch (error) {
         console.error(error);
        return NextResponse.json({error: error.code || error.message},
        {status: 400})
    }
}