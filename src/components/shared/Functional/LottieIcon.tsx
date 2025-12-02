'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'

import AppleAnimation from '@/Icons/Apple.json'
import CartAnimation from '@/Icons/Cart.json'
import CloudAnimation from '@/Icons/Cloud.json'
import ComputerAnimation from '@/Icons/Computer.json'
import PenAnimation from '@/Icons/Pen.json'

interface LottieIconProps {
	icon: 'computer' | 'cloud' | 'apple' | 'cart' | 'pen'
	triggerPlay: boolean
}

const LottieIcon: React.FC<LottieIconProps> = ({ icon, triggerPlay }) => {
	const lottieRef = useRef<LottieRefCurrentProps>(null)

	const [playedOnce, setPlayedOnce] = useState(false)
	const [isPlaying, setIsPlaying] = useState(false)

	// switch icon to animation data
	let animationData
	switch (icon) {
		case 'computer':
			animationData = ComputerAnimation
			break
		case 'cloud':
			animationData = CloudAnimation
			break
		case 'apple':
			animationData = AppleAnimation
			break
		case 'cart':
			animationData = CartAnimation
			break
		case 'pen':
			animationData = PenAnimation
			break
		default:
			animationData = ComputerAnimation
			break
	}

	useEffect(() => {
		if (triggerPlay) {
			setPlayedOnce(false)
		}
	}, [triggerPlay])

	useEffect(() => {
		if (triggerPlay && !playedOnce && !isPlaying) {
			setIsPlaying(true)
			lottieRef.current?.goToAndPlay(0, true)
		}
	}, [triggerPlay, playedOnce])

	return (
		<div className="service-card--icon shrink-0">
			<Lottie
				lottieRef={lottieRef}
				animationData={animationData}
				loop={false}
				autoplay={false}
				onComplete={() => {
					setPlayedOnce(true)
					setIsPlaying(false)
				}}
			/>
		</div>
	)
}

export default LottieIcon
