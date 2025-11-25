'use client'

import React from 'react'
import Image from 'next/image'
import { Splide, SplideSlide, Options } from '@splidejs/react-splide'
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll'

import '@splidejs/splide/css'

interface Logo {
	src: string
	alt: string
	width?: number
	height?: number
}

interface LogoSliderProps {
	logos: Logo[]
	options?: Options
	logoHeight?: number
}

const defaultOptions: Options = {
	type: 'loop', // Endlosschleife
	perPage: 5, // Anzahl Logos pro Ansicht
	gap: '1rem', // Abstand tussen Logos
	arrows: false,
	pagination: false,
	drag: 'free', // Freies Draggen
	snap: true, // Snap-Funktion nach Slide
	autoScroll: {
		// kontinuierliches Scrollen
		speed: 0.8, // Geschwindigkeit (je höher, desto schneller)
		pauseOnHover: true,
		pauseOnFocus: false,
		rewind: false // kein Zurücksetzen nötig
	},
	breakpoints: {
		640: { perPage: 2 },
		768: { perPage: 3 },
		1024: { perPage: 4 }
	}
}

export const LogoSlider: React.FC<LogoSliderProps> = ({
	logos,
	options,
	logoHeight = 60
}) => (
	<div className="splide-slider">
		<Splide
			options={{ ...defaultOptions, ...options }}
			extensions={{ AutoScroll }}
			aria-label="Logo Slider"
		>
			{logos.map((logo, idx) => (
				<SplideSlide key={idx}>
					<div className="flex items-center justify-center p-4">
						<div
							className="relative w-full"
							style={{ height: `${logo.height || logoHeight}px` }}
						>
							<Image
								src={logo.src}
								alt={logo.alt}
								fill
								style={{ objectFit: 'contain' }}
								sizes="(max-width: 1024px) 25vw, (max-width: 768px) 33vw, (max-width: 640px) 50vw, 20vw"
							/>
						</div>
					</div>
				</SplideSlide>
			))}
		</Splide>
	</div>
)
