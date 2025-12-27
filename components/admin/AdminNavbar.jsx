'use client'
import { useUser, UserButton } from "@clerk/nextjs"
import Link from "next/link"

const AdminNavbar = () => {
    
    const { user } = useUser()

    return (
        <div className="flex items-center justify-between px-12 py-3 border-b border-amber-900 transition-all">
        <Link href="/" className="relative text-4xl font-semibold text-amber-900">
            <span className="text-amber-800">Kopi</span>ku<span className="text-amber-700 text-5xl leading-0">.</span>
            <p className="absolute text-xs font-semibold -top-1 -right-13 px-3 p-0.5 rounded-full flex items-center gap-2 text-white bg-amber-800">
            Admin
            </p>
            </Link>
            <div className="flex items-center gap-3">
                <p>Hi, {user?.firstName}</p>
                <UserButton/>
            </div>
        </div>
    )
}

export default AdminNavbar