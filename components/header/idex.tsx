"use client"
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Header = () => {
    const pathname = usePathname()
  return (

   <header>
    <div className='container mx-auto flex items-center justify-between py-2 px-6'>
        <div className='flex items-center justify-between'>
            <Link href='/' className='inline-block'>
                <Image
                  src='/coinhub1.png'
                  alt='CoinHub logo'
                  width={125}
                  height={40}  
                />
            </Link>
            
        </div>
        <nav className='flex items-center gap-4'>
            <Link href='/' className={pathname === '/' ? 'text-primary' : 'text-gray-500'}>Home</Link>
            <Link href='/search-model' className={pathname === '/search-model' ? 'text-primary' : 'text-gray-500'}>Search Model</Link>
            <Link href='/coins' className={pathname === '/coins' ? 'text-primary' : 'text-gray-500'}>Coins</Link>
        </nav>
    
    </div>
   </header>
  )
}

export default Header