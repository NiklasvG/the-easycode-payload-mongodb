import React from 'react'

import Image from 'next/image'

export const Logo = () => {
	return (
		<Image
			src="/Logo/EasyCode_Font.png"
			alt="EasyCode Logo"
			width={600}
			height={150}
			className="h-8 md:h-10 w-auto shrink-0 xl:mr-8"
		/>
	)
}
