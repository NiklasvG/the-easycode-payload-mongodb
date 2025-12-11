'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie, { LottieRefCurrentProps } from 'lottie-react'

import { LottieIconNames } from '@/fields/lottieIcon'

import AppleAnimation from '@/Icons/Apple.json'
import CartAnimation from '@/Icons/Cart.json'
import CloudAnimation from '@/Icons/Cloud.json'
import ComputerAnimation from '@/Icons/Computer.json'
import PenAnimation from '@/Icons/Pen.json'
import EngagementAnimation from '@/Icons/Engagement.json'
import CodeAnimation from '@/Icons/Code.json'
import ClockAnimation from '@/Icons/Clock.json'
import ApplauseAnimation from '@/Icons/Applause.json'
import GitAnimation from '@/Icons/Git.json'
import BookAnimation from '@/Icons/Book.json'
import FireworkAnimation from '@/Icons/Firework.json'
import ConfettiAnimation from '@/Icons/Confetti.json'
import DeveloperAnimation from '@/Icons/Developer.json'
import SchoolAnimation from '@/Icons/School.json'

// use LottieIconNames
interface LottieIconProps {
	icon: LottieIconNames
	triggerPlay: boolean
}

const LottieIcon: React.FC<LottieIconProps> = ({ icon, triggerPlay }) => {
	const lottieRef = useRef<LottieRefCurrentProps>(null)
	const containerRef = useRef<HTMLDivElement | null>(null)

	const [playedOnce, setPlayedOnce] = useState(false)
	const [isPlaying, setIsPlaying] = useState(false)

	// Icon → Animation zuordnen
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
		case 'engagement':
			animationData = EngagementAnimation
			break
		case 'code':
			animationData = CodeAnimation
			break
		case 'clock':
			animationData = ClockAnimation
			break
		case 'applause':
			animationData = ApplauseAnimation
			break
		case 'git':
			animationData = GitAnimation
			break
		case 'book':
			animationData = BookAnimation
			break
		case 'firework':
			animationData = FireworkAnimation
			break
		case 'confetti':
			animationData = ConfettiAnimation
			break
		case 'developer':
			animationData = DeveloperAnimation
			break
		case 'school':
			animationData = SchoolAnimation
			break
		default:
			animationData = ComputerAnimation
			break
	}

	// Wenn von außen neu getriggert wird → Reset
	useEffect(() => {
		if (triggerPlay) {
			setPlayedOnce(false)
		}
	}, [triggerPlay])

	// Normales Verhalten: über Prop triggerPlay steuern (z. B. Hover, Scroll, etc.)
	useEffect(() => {
		if (triggerPlay && !playedOnce && !isPlaying) {
			setIsPlaying(true)
			lottieRef.current?.goToAndPlay(0, true)
		}
	}, [triggerPlay, playedOnce, isPlaying])

	// Zusatz: Auf mobilen Geräten einmal abspielen, wenn im Viewport
	useEffect(() => {
		if (typeof window === 'undefined') return

		const isMobile = window.matchMedia('(max-width: 767px)').matches
		if (!isMobile) return

		const element = containerRef.current
		if (!element) return

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !playedOnce && !isPlaying) {
						setIsPlaying(true)
						lottieRef.current?.goToAndPlay(0, true)
					}
				})
			},
			{
				threshold: 1 // ~100% sichtbar
			}
		)

		observer.observe(element)

		return () => {
			observer.disconnect()
		}
	}, [playedOnce, isPlaying])

	return (
		<div ref={containerRef} className="service-card--icon shrink-0">
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
