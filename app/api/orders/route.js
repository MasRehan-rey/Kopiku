import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { PaymentMethod } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request) {
    try {
        console.log("Order API - Request received");
        
        const { userId, has } = getAuth(request)
        console.log("Order API - Auth check:", { userId, hasAuth: !!userId });
        
        if(!userId){
            return NextResponse.json({ error: 'Anda harus login terlebih dahulu' }, { status: 401 })
        }
        
        const { addressId, items, couponCode, paymentMethod } = await request.json()
        console.log("Order API - Request data:", { addressId, items, couponCode, paymentMethod });

        //Check if all required fields are present
        if(!addressId || !paymentMethod || !items || !Array.isArray(items) || items.length === 0){
            return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 })
        }

        let coupon = null;

        if(couponCode) {
            coupon = await prisma.coupon.findUnique({
                where: {
                         code: couponCode
                }
            }) 
            if (!coupon) {
                return NextResponse.json({ error: 'Kupon tidak ditemukan atau sudah kadaluarsa' }, { status: 404 })
            }
        }

        //Check if coupon is valid for new user
        if (couponCode && coupon.forNewUser) {
            const userOrders = await prisma.order.findMany({
                where: { userId }
            })
            if (userOrders.length > 0) {
                return NextResponse.json({ error: 'Kupon hanya valid untuk pengguna baru' }, { status: 400 })
            }
        }

        const isPlusMember = has({ plan: 'plus' })

        // check if coupon is valid for member
        if (couponCode && coupon.forMember) {
            // Check if user has plus plan using Clerk
            
            if (!isPlusMember) {
                console.log("COUPON POST - User not plus member")
                return NextResponse.json({ error: 'Kupon hanya untuk member plus' }, { status: 400 })
            }
        }

        //Group orders by store using a Map
        const ordersByStore = new Map()

        for(const item of items){
            const product = await prisma.product.findUnique({where: {id: item.id}})
            if (!product) {
                return NextResponse.json({ error: `Produk dengan ID ${item.id} tidak ditemukan` }, { status: 404 })
            }
            const storeId = product.storeId
            if(!ordersByStore.has(storeId)){
                ordersByStore.set(storeId, [])
            }
            ordersByStore.get(storeId).push({...item, price: product.price})
        }

        let ordersIds = [];
        let fullAmount = 0;
        let isShippingFeeAdded = false

        console.log("Order API - Starting order creation for", ordersByStore.size, "stores");

        //create orders for each seller
        for(const[storeId, sellerItems] of ordersByStore.entries()){
            let total = sellerItems.reduce((acc, item)=>acc + (item.price * item.quantity), 0)

            if(couponCode){
                total -= (total * coupon.discount) / 100;
            }
            if(!isPlusMember && !isShippingFeeAdded){
                total += 3000;
                isShippingFeeAdded = true
            }

            fullAmount += parseFloat(total.toFixed(2))

            console.log("Order API - Creating order for store:", storeId);
            console.log("Order API - Order data:", {
                userId,
                storeId,
                addressId,
                total: parseFloat(total.toFixed(2)),
                paymentMethod,
                isCouponUsed: coupon ? true : false,
                coupon: coupon ? coupon : {},
                orderItems: sellerItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            });

            const order = await prisma.order.create({
                data: {
                    userId,
                    storeId,
                    addressId,
                    total: parseFloat(total.toFixed(2)),
                    paymentMethod,
                    isCouponUsed: coupon ? true : false,
                    coupon: coupon ? coupon : {},
                    orderItems: {
                        create: sellerItems.map(item => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            })
            ordersIds.push(order.id)
        }

        if(paymentMethod === 'STRIPE'){
            console.log("Order API - Processing Stripe payment");
            if (!process.env.STRIPE_SECRET_KEY) {
                return NextResponse.json({ error: 'Stripe tidak dikonfigurasi dengan benar' }, { status: 500 })
            }
            
            const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
            const origin = await request.headers.get('origin')
            console.log("Order API - Creating Stripe session");
            console.log("Order API - Order IDs for metadata:", ordersIds);

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'idr',
                        unit_amount: Math.round(fullAmount * 100),
                        product_data: {
                            name: 'Pembayaran Pesanan',
                        },
                    },
                    quantity: 1
                }],
                mode: 'payment',
                success_url: `${origin}/loading?nextUrl=orders`,
                cancel_url: `${origin}/cart`,
                metadata: {
                    orderIds: ordersIds.join(','),
                    userId,
                    appId: 'kopikita'
                }
            })
            console.log("Order API - Stripe session created:", session.id);
            return NextResponse.json({session})
        }

        //clear the cart
        try {
            await prisma.user.update({
                where: {clerkId: userId},  
                data: {cart : {}}
            })
            console.log("Cart cleared successfully for user:", userId)
        } catch (cartError) {
            console.error("Failed to clear cart:", cartError)
            // Continue even if cart clear fails
        }

        return NextResponse.json({message: 'Orders Placed Successfully'})

    } catch (error) {
        console.error("Order API Error:", error)
        console.error("Order API Error stack:", error.stack)
        return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 })
    }
}

//get all orders for a user 
export async function GET(request){
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: 'Anda harus login terlebih dahulu' }, { status: 401 })
        }

        const orders = await prisma.order.findMany({
            where: {
                userId, 
                OR: [
                    {paymentMethod: PaymentMethod.COD},
                    {AND: [{paymentMethod: PaymentMethod.STRIPE}, {isPaid: true}]}
                ]
            },
            include: {
                orderItems: {include: {product: true}},
                address: true
            },
            orderBy: {createdAt: 'desc'}
        })

        return NextResponse.json({orders})
    } catch (error) {
        console.error("Orders GET Error:", error)
        return NextResponse.json({ error: error.message || 'Terjadi kesalahan' }, { status: 500 })
    }
}