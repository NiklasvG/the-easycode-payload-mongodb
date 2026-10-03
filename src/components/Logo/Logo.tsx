import React from 'react'

import Image from 'next/image'
import logo from '../../../public/Logo/EasyCode_Font.png'

export const Logo = () => {
	return (
		<Image
			src={logo}
			alt="EasyCode Logo"
			sizes="(min-width: 768px) 212px, 170px"
			className="h-8 md:h-10 w-auto shrink-0 xl:mr-8"
		/>
	)
}
