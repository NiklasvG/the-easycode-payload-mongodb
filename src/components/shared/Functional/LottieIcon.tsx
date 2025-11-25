'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'

import ComputerAnimation from '@/Icons/Computer.json'
import CloudAnimation from '@/Icons/Cloud.json'

interface LottieIconProps {
	icon: 'computer' | 'cloud'
	triggerPlay: boolean
}

const LottieIcon: React.FC<LottieIconProps> = ({ icon, triggerPlay }) => {
	const lottieRef = useRef<LottieRefCurrentProps>(null)

	const [playedOnce, setPlayedOnce] = useState(false)
	const [isPlaying, setIsPlaying] = useState(false)

	const animationData = icon === 'cloud' ? CloudAnimation : ComputerAnimation

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
