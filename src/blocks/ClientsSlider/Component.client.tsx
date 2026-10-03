'use client'

import React from 'react'
import Image from 'next/image'
import { Splide, Options } from '@splidejs/react-splide'
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll'

import '@splidejs/splide/css'

interface Logo {
	src: string
	alt: string
	companyName: string
	width?: number
	height?: number
	imageWidth?: number
	imageHeight?: number
}

interface LogoSliderProps {
	logos: Logo[]
	options?: Options
	logoHeight?: number
}

const defaultOptions: Options = {
	label: 'Kundenlogos',
	type: 'loop', // Endlosschleife
	perPage: 5, // Anzahl Logos pro Ansicht
	gap: '1rem', // Abstand tussen Logos
	arrows: false,
	reducedMotion: { speed: 0, rewindSpeed: 0, autoScroll: false },
	pagination: false,
	drag: 'free', // Freies Draggen
	snap: true, // Snap-Funktion nach Slide
	autoScroll: {
		// kontinuierliches Scrollen
		speed: 0.8, // Geschwindigkeit (je höher, desto schneller)
		pauseOnHover: true,
		pauseOnFocus: true,
		rewind: false // kein Zurücksetzen nötig
	},
	breakpoints: {
		640: { perPage: 2 },
		768: { perPage: 3 },
		1024: { perPage: 4 }
	}
}

export const LogoSlider: React.FC<LogoSliderProps> = ({ logos, options, logoHeight = 60 }) => (
	<div className="splide-slider">
		<Splide
			hasTrack={false}
			options={{ ...defaultOptions, ...options }}
			extensions={{ AutoScroll }}
			aria-label="Logo Slider"
		>
			<div className="splide__track">
				<div className="splide__list">
					{logos.map((logo, idx) => (
						<div className="splide__slide" key={idx}>
							<div className="flex items-center justify-center p-4">
								<div
									className="relative w-full flex items-center justify-center"
									style={{ height: `${logo.height || logoHeight}px` }}
									title={logo.companyName}
								>
									<Image
										src={logo.src}
										alt={logo.alt}
										width={logo.imageWidth || 80}
										height={logo.imageHeight || 80}
										className="max-w-full max-h-full w-auto h-auto object-contain"
										sizes={`${Math.ceil((logo.height || logoHeight) * ((logo.imageWidth || 80) / (logo.imageHeight || 80)))}px`}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</Splide>
	</div>
)
