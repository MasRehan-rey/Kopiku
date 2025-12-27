'use client'

import { usePathname } from "next/navigation"
import { HomeIcon, ShieldCheckIcon, StoreIcon, TicketPercentIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { assets } from "@/assets/assets"
import { useUser, useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import axios from "axios"

const AdminSidebar = () => {

    const { user } = useUser()
    const { getToken } = useAuth()
    const pathname = usePathname()
    const [pendingCount, setPendingCount] = useState(0)

    const fetchPendingCount = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/admin/approve-store', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setPendingCount(data.stores?.length || 0)
        } catch (error) {
            console.error('Error fetching pending count:', error)
        }
    }

    useEffect(() => {
        if (user && getToken) {
            fetchPendingCount()
        }
    }, [user, getToken])

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Cafe', href: '/admin/stores', icon: StoreIcon },
        { name: 'Cafe yang Disetujui', href: '/admin/approve', icon: ShieldCheckIcon, badge: pendingCount },
        { name: 'Kupon', href: '/admin/coupons', icon: TicketPercentIcon  },
    ]

    return user && (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
            <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
                <Image className="w-14 h-14 rounded-full" src={assets.kopikita1} alt="" width={80} height={80} />
                <p className="text-slate-700">Admin Kopikita</p>
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${pathname === link.href && 'bg-slate-100 sm:text-slate-600'}`}>
                            <link.icon size={18} className="sm:ml-5" />
                            <p className="max-sm:hidden">{link.name}</p>
                            {link.badge > 0 && (
                                <span className="absolute top-1.5 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {link.badge}
                                </span>
                            )}
                            {pathname === link.href && <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default AdminSidebar