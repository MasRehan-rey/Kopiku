import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const POST = async (request) => {
    try {
        const body = await request.text()
        const sig = request.headers.get('stripe-signature')

        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.log("Stripe webhook secret not configured")
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
        }

        const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)

        const handlePayment = async (session, isPaid) => {
            const { orderIds, userId, appId } = session.metadata
            
            if (appId !== 'kopikita') {
                console.log("Invalid app ID:", appId)
                return
            }

            const orderIdsArray = orderIds.split(',')
            console.log("Processing payment for orders:", orderIdsArray, "Paid:", isPaid)

            if (isPaid) {
                // Mark order as paid
                await Promise.all(orderIdsArray.map(async (orderId) => {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: { isPaid: true }
                    })
                }))
                console.log("Orders marked as paid:", orderIdsArray)
                
                // Clear cart
                await prisma.user.update({
                    where: { clerkId: userId },
                    data: { cart: {} }
                })
                console.log("Cart cleared for user:", userId)
            } else {
                // Delete orders if payment failed
                await Promise.all(orderIdsArray.map(async (orderId) => {
                    await prisma.order.delete({
                        where: { id: orderId }
                    })
                }))
                console.log("Orders deleted due to failed payment:", orderIdsArray)
            }
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                await handlePayment(session, true)
                break
            }
            case 'checkout.session.expired': {
                const session = event.data.object
                await handlePayment(session, false)
                break
            }
            default:
                console.log('Unhandled event type:', event.type)
                break
        }

        return NextResponse.json({ received: true })
        
    } catch (error) {
        console.error("Stripe webhook error:", error)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}

export const config = {
    api: {bodyparser: false }
}