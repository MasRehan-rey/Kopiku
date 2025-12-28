'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'

    return (
       <div className='mx-6'>
  <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>

    {/* --- Banner Promo / Hero --- */}
    <div className='relative flex-1 flex flex-col bg-[#E6D5C3] rounded-3xl xl:min-h-100 group'>
      <div className='p-5 sm:p-16'>

        <div className='inline-flex items-center gap-3 bg-[#D2BBA5] text-[#6A4E3C] pr-4 p-1 rounded-full text-xs sm:text-sm'>
          <span className='bg-[#6A4E3C] px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs'>
            Apa yang Baru
          </span>
          Dapatkan Kupon Diskon hingga 20% 
          <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
        </div>

        <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-medium 
          bg-gradient-to-r from-[#3B2F2F] to-[#C79B63] bg-clip-text text-transparent
          max-w-xs sm:max-w-md'>
          Temani setiap kemajuanmu dengan Kopikita
        </h2>

        <div className='text-[#3B2F2F] text-sm font-medium mt-4 sm:mt-8'>
          <p>Mulai Dari</p>
          <p className='text-3xl'>{currency}5000</p>
        </div>

        <button className='bg-[#3B2F2F] text-white text-sm py-2.5 px-7 sm:py-5 sm:px-12 
          mt-4 sm:mt-10 rounded-md hover:bg-[#2A2222] hover:scale-103 
          active:scale-95 transition'>
          LEBIH BANYAK
        </button>
      </div>

      <Image className='sm:absolute bottom-9 right-4 md:right-4 w-full sm:max-w-65' 
        src={assets.iced_latte} alt="" />
    </div>


    {/* --- 2 Card Produk --- */}
    <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-[#3B2F2F]'>

      <div className='flex-1 flex items-center justify-between w-full bg-[#D7C2AC] rounded-3xl p-6 px-8 group'>
        <div>
          <p className='text-3xl font-medium bg-gradient-to-r from-[#3B2F2F] to-[#B37A4C] bg-clip-text text-transparent max-w-40'>
            Produk Terbaik
          </p>
          <p className='flex items-center gap-1 mt-4'>
            Lihat lebih banyak <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} />
          </p>
        </div>
        <Image className='w-35' src={assets.americano} alt="" />
      </div>

      <div className='flex-1 flex items-center justify-between w-full bg-[#EAD4B6] rounded-3xl p-6 px-8 group'>
        <div>
          <p className='text-3xl font-medium bg-gradient-to-r from-[#3B2F2F] to-[#D0935A] bg-clip-text text-transparent max-w-40'>
            Camilan Favorit
          </p>
          <p className='flex items-center gap-1 mt-4'>
            Lihat lebih banyak <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} />
          </p>
        </div>
        <Image className='w-35' src={assets.croissant} alt="" />
      </div>

    </div>
  </div>

  <CategoriesMarquee />
</div>


    )
}

export default Hero