import React from 'react'

import Image from 'next/image'
import logo from '../../../public/Logo/EasyCode_Font.png'

export const Logo = () => {
  return (
    <Image
      src={logo}
      alt="EasyCode Logo"
      sizes="(min-width: 768px) 212px, 170px"
      className="h-auto w-[min(53vw,212px)] max-w-full xl:mr-8"
    />
  )
}
