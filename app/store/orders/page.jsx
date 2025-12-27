'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { orderDummyData } from "@/assets/assets"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import toast from "react-hot-toast"

export default function StoreOrders() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const {getToken} = useAuth()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'Rp'

    const getDisplayName = (user) => {
        if (user?.name && user.name !== 'user') {
            return user.name;
        }
        // Fallback ke email atau username
        return user?.email?.split('@')[0] || user?.username || 'User';
    }

    const formatCurrency = (amount) => {
        return `${currency}${amount.toLocaleString('id-ID')}`
    }

    const fetchOrders = async () => {
        try {
            const token = await getToken()
            const { data } = await axios.get('/api/store/orders',{
                headers : {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log("Store orders - Raw data:", data.orders);
            console.log("Store orders - First order user:", data.orders[0]?.user);
            console.log("Store orders - User email:", data.orders[0]?.user?.email);
            console.log("Store orders - User name:", data.orders[0]?.user?.name);
            setOrders(data.orders)
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId, status) => {
        try {
            const token = await getToken()
            await axios.post('/api/store/orders',{orderId, status}, {
                headers : {
                    Authorization: `Bearer ${token}`
                }
            })
            setOrders(prev => 
                prev.map(order => 
                    order.id === orderId ? {...order, status} : order
                )
            )
            toast.success("Status Order Berhasil Diubah")  
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <>
            <h1 className="text-2xl text-slate-500 mb-5">Pesanan <span className="text-slate-800 font-medium">Cafe</span></h1>
            {orders.length === 0 ? (
                <p>Tidak ada Pesanan</p>
            ) : (
                <div className="overflow-x-auto max-w-4xl rounded-md shadow border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                            <tr>
                                {["No.", "Pelanggan", "Total", "Pembayaran", "Kupon", "Status", "Tanggal"].map((heading, i) => (
                                    <th key={i} className="px-4 py-3">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map((order, index) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                    onClick={() => openModal(order)}
                                >
                                    <td className="pl-6 text-green-600" >
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3">{getDisplayName(order.user)}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{formatCurrency(order.total)}</td>
                                    <td className="px-4 py-3">{order.paymentMethod}</td>
                                    <td className="px-4 py-3">
                                        {order.isCouponUsed ? (
                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                                {order.coupon?.code}
                                            </span>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-4 py-3" onClick={(e) => { e.stopPropagation() }}>
                                        <select
                                            value={order.status}
                                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                                            className="border-gray-300 rounded-md text-sm focus:ring focus:ring-blue-200"
                                        >
                                            <option value="ORDER_PLACED">PESANAN DIBUAT</option>
                                            <option value="PROCESSING">DIPROSES</option>
                                            <option value="SHIPPED">DIKIRIM</option>
                                            <option value="DELIVERED">TERKIRIM</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/50 text-slate-700 text-sm backdrop-blur-xs z-50" >
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
                        <h2 className="text-xl font-semibold text-slate-900 mb-4 text-center">
                            Detail Pesanan
                        </h2>

                        {/* Customer Details */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Informasi Pelanggan</h3>
                            <p><span className="text-green-700">Nama:</span> {getDisplayName(selectedOrder.user)}</p>
                            <p><span className="text-green-700">Email:</span> {selectedOrder.user?.email}</p>
                            <p><span className="text-green-700">No Telephone:</span> {selectedOrder.address?.phone}</p>
                            <p><span className="text-green-700">Alamat:</span> {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.state}, ${selectedOrder.address?.zip}, ${selectedOrder.address?.country}`}</p>
                        </div>

                        {/* Products */}
                        <div className="mb-4">
                            <h3 className="font-semibold mb-2">Produk</h3>
                            <div className="space-y-2">
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 border border-slate-100 shadow rounded p-2">
                                        <img
                                            src={item.product.images?.[0].src || item.product.images?.[0]}
                                            alt={item.product?.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="text-slate-800">{item.product?.name}</p>
                                            <p>jml: {item.quantity}</p>
                                            <p>Harga: {formatCurrency(item.price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment & Status */}
                        <div className="mb-4">
                            <p><span className="text-green-700">Metode Pembayaran:</span> {selectedOrder.paymentMethod}</p>
                            <p><span className="text-green-700">Bayar:</span> {selectedOrder.isPaid ? "Ya" : "Tidak"}</p>
                            {selectedOrder.isCouponUsed && (
                                <p><span className="text-green-700">Kupon:</span> {selectedOrder.coupon.code} ({selectedOrder.coupon.discount}% off)</p>
                            )}
                            <p><span className="text-green-700">Status:</span> {
                                selectedOrder.status?.toLowerCase() === 'order_placed' ? 'PESANAN DIBUAT' :
                                selectedOrder.status?.toLowerCase() === 'processing' ? 'DIPROSES' :
                                selectedOrder.status?.toLowerCase() === 'shipped' ? 'DIKIRIM' :
                                selectedOrder.status?.toLowerCase() === 'delivered' ? 'TERKIRIM' :
                                selectedOrder.status || 'Tidak Diketahui'
                            }</p>
                            <p><span className="text-green-700">Tanggal Pesanan:</span> {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end">
                            <button onClick={closeModal} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300" >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
