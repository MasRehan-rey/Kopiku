'use client'
import { useEffect, useState } from "react"
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"
import { dummyStoreData } from "@/assets/assets"
import { useAuth, useUser, SignedIn, SignedOut } from "@clerk/nextjs"
import axios from "axios"
import { useRouter } from "next/navigation"
import { SignIn } from "@clerk/nextjs"

const StoreLayout = ({ children }) => {

    const { getToken, isSignedIn } = useAuth()
    const { user } = useUser()
    const router = useRouter()
    
    const [isSeller, setIsSeller] = useState(false)
    const [loading, setLoading] = useState(true)
    const [storeInfo, setStoreInfo] = useState(null)

    const fetchIsSeller = async () => {
        try {
            console.log("Fetching seller status for user:", user?.id)
            const token = await getToken()
            const response = await axios.get('/api/store/is-seller', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log("Raw API Response:", response.data)
            console.log("isSeller value:", response.data.isSeller)
            console.log("storeInfo value:", response.data.storeInfo)
            
            setIsSeller(response.data.isSeller)
            setStoreInfo(response.data.storeInfo)

        } catch (error) {
            console.error("Error fetching seller status:", error)
            setIsSeller(false)
        } finally {
            setLoading(false)
        }
    }

    // Fetch seller status when user is signed in
    useEffect(() => {
        if (isSignedIn && user && getToken) {
            fetchIsSeller()
        } else if (isSignedIn === false) {
            setLoading(false)
        }
    }, [isSignedIn, user, getToken])

    // HAPUS redirect logic - tidak redirect ke create-store

    return (
        <>
            <SignedOut>
                <div className="min-h-screen flex items-center justify-center">
                    <SignIn 
                        routing="hash"
                        redirectUrl="/store"
                    />
                </div>
            </SignedOut>
            
            <SignedIn>
                {loading ? (
                    <div className="min-h-screen flex items-center justify-center">
                        <Loading />
                    </div>
                ) : isSeller ? (
                    <div className="flex flex-col h-screen">
                        <SellerNavbar />
                        <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                            <SellerSidebar storeInfo={storeInfo} />
                            <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                                {children}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                        <h1 className="text-2xl sm:text-4xl font-semibold text-slate-400">Kamu tidak diizinkan mengakses Halaman Ini</h1>
                        <Link href="/" className="bg-slate-700 text-white flex items-center gap-2 mt-8 p-2 px-6 max-sm:text-sm rounded-full">
                            Kembali ke Beranda  <ArrowRightIcon size={18} />
                        </Link>
                    </div>
                )}
            </SignedIn>
        </>
    )
}

export default StoreLayout