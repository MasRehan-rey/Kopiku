import React from 'react'
import Title from './Title'

const Newsletter = () => {
    return (
        <div className='flex flex-col items-center mx-4 my-36'>
            <Title title="Berlangganan Newsletter" description="Dapatkan penawaran eksklusif, produk baru, dan update terbaru langsung di inbox Anda setiap minggu." visibleButton={false} />
            <div className='flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200'>
                <input className='flex-1 pl-5 outline-none' type="text" placeholder='Masukkan alamat email Anda' />
                <button className='font-medium bg-amber-800 text-white px-7 py-3 rounded-full hover:bg-amber-900 hover:scale-103 active:scale-95 transition'>
                    Dapatkan Update
                </button>

            </div>
        </div>
    )
}

export default Newsletter