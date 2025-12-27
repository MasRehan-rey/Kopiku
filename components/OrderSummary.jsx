import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {Protect, protect, useAuth, useUser} from "@clerk/nextjs";
import axios from 'axios';
import { fetchCart } from '@/lib/features/cart/cartSlice';

const OrderSummary = ({ totalPrice, items }) => {

    const { user } = useUser()
    const { getToken } = useAuth()
    const dispatch = useDispatch()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

    const router = useRouter();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');

    const handleCouponCode = async (event) => {
        event.preventDefault();
        console.log("Client: Coupon form submitted!")
        console.log("Client: Applying coupon code:", couponCodeInput)
        
        try {
            if(!user){
                console.log("Client: No user found")
                return toast("Anda harus login terlebih dahulu")
            }
            
            const token = await getToken();
            console.log("Client: Token obtained")
            
            const { data } = await axios.post('/api/coupon', {code: couponCodeInput}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            
            console.log("Client: Coupon API response:", data)
            setCoupon(data.coupon)
            toast.success('Kupon berhasil Diterima')
        } catch (error) {
            console.error("Client: Coupon error:", error.response?.data)
            toast.error(error?.response?.data?.error || error?.message)
        }
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        try {
              if(!user){
                console.log("Client: No user found")
                return toast("Anda harus login Untuk melakukan Pemesanan")
            }
                 if(!selectedAddress){
                console.log("Client: No address found")
                return toast("Tolong Isi Alamat")
            }
            const token = await getToken();
            const orderData = {
                addressId: selectedAddress.id,
                items,
                paymentMethod
            }
            
            console.log("Client: Order data to send:", orderData);
            console.log("Client: Selected address:", selectedAddress);
            console.log("Client: Payment method:", paymentMethod);

            if(coupon){
                orderData.couponCode = coupon.code
            }

            //create order
            const {data} = await axios.post('/api/orders', orderData, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if(paymentMethod === 'STRIPE'){
                window.location.href = data.session.url;
            }else {
                toast.success(data.message)
                router.push('/orders')
                dispatch(fetchCart({getToken}))
            }
        } catch (error) {
            toast.error(error?.response?.data?.error || error.message)
        }
        
        router.push('/orders')
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Rincian Pembayaran</h2>
            <p className='text-slate-400 text-xs my-4'>Metode Pembayaran</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-gray-500' />
                <label htmlFor="COD" className='cursor-pointer'>COD</label>
            </div>
            <div className='flex gap-2 items-center mt-1'>
                <input type="radio" id="STRIPE" name='payment' onChange={() => setPaymentMethod('STRIPE')} checked={paymentMethod === 'STRIPE'} className='accent-gray-500' />
                <label htmlFor="STRIPE" className='cursor-pointer'>Pembayaran via payment gateway</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Alamat</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center'>
                            <p>{selectedAddress.name}, {selectedAddress.city}, {selectedAddress.state}, {selectedAddress.zip}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer' size={18} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-400 p-2 w-full my-3 outline-none rounded' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Pilih Alamat</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.city}, {address.state}, {address.zip}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-slate-600 mt-1' onClick={() => setShowAddressModal(true)} >Tambahkan Alamat <PlusIcon size={18} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Pengiriman:</p>
                        {coupon && <p>Kupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p><Protect plan={'plus'} fallback={`${currency}3000`}>Gratis</Protect></p>
                        {coupon && <p>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={handleCouponCode} className='flex justify-center gap-3 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Kode Kupon' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                            <button className='bg-slate-600 text-white px-3 rounded hover:bg-slate-800 active:scale-95 transition-all'>Terima</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                            <p>Kode: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                            <p>{coupon.description}</p>
                            <XIcon size={18} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4'>
                <p>Total:</p>

                <p className='font-medium text-right'>
                    <Protect plan ={'plus'} fallback={` ${currency}${coupon ? (totalPrice + 3000 - (coupon.discount / 100 * totalPrice)).toFixed(2) : (totalPrice + 3000).toLocaleString()}`}> 
                    {currency}
                    {coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(2) :
                    (totalPrice).toLocaleString()}
                       
                    </Protect>
                   
                    
                    </p>
            </div>
            <button onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'Mohon Tunggu...' })} className='w-full bg-slate-700 text-white py-2.5 rounded hover:bg-slate-900 active:scale-95 transition-all'>Buat Order</button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary