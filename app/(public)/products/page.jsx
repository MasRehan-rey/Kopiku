'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import Loading from '@/components/Loading'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '@clerk/nextjs'

const Products = () => {
    const { getToken } = useAuth()
    const searchParams = useSearchParams()
    const category = searchParams.get('category') || ''
    
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchProducts = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/products', {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            // Filter by category if specified
            const filteredProducts = category 
                ? data.products.filter(product => product.category === category)
                : data.products
                
            setProducts(filteredProducts)
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Gagal memuat produk')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [category])

    if (loading) return <Loading />

    return (
        <div className="px-6 py-10">
            <h1 className="text-2xl mb-6">
                {category ? `Produk: ${category}` : 'Semua Produk'}
            </h1>
            
            {products.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500">Tidak ada produk dalam kategori ini</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Products
