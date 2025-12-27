'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchProducts } from "@/lib/features/product/productSlice";
import { fetchCart, uploadCart } from "@/lib/features/cart/cartSlice";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/store"
import { useUser,useAuth } from "@clerk/nextjs";
import { fetchAddress } from "@/lib/features/address/addressSlice";
import { fetchUserRatings } from "@/lib/features/rating/ratingSlice";

function PublicLayoutContent({ children }) {
    const dispatch = useDispatch()
    const {user} = useUser()
    const {getToken} = useAuth()

    const {cartItems} = useSelector((state)=> state.cart)

    useEffect(() => {
        dispatch(fetchProducts({}))
    }, [])

     useEffect(() => {
        if(user) {
            console.log("Fetching cart for user:", user.id)
            dispatch(fetchCart({getToken}))
            dispatch(fetchAddress({getToken}))
            dispatch(fetchUserRatings({getToken}))
            
            // Update user profile jika name kosong atau "user"
            if (!user.fullName || user.fullName === 'user') {
                updateUserProfile()
            }
        }
    }, [user])

    const updateUserProfile = async () => {
        try {
            const token = await getToken()
            const email = user.primaryEmailAddress?.emailAddress
            const nameFromEmail = email?.split('@')[0]
            
            if (nameFromEmail && nameFromEmail !== 'user') {
                await axios.post('/api/user/update-profile', 
                    { name: nameFromEmail },
                    { headers: { Authorization: `Bearer ${token}` }}
                )
                console.log("User profile updated with name:", nameFromEmail)
            }
        } catch (error) {
            console.error("Failed to update user profile:", error)
        }
    }

       useEffect(() => {
        if(user) {
            console.log("Uploading cart items:", cartItems)
            dispatch(uploadCart({getToken}))
        }
    }, [cartItems])


    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}

export default function PublicLayout({ children }) {
    return (
        <Provider store={makeStore()}>
            <PublicLayoutContent>{children}</PublicLayoutContent>
        </Provider>
    )
}
