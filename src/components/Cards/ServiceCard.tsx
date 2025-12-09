'use client'

import React, { useState } from 'react'

// Libraries
import dynamic from 'next/dynamic'
import { ArrowUpRight, BadgeCheck } from 'lucide-react'

// Components
import { Media as MediaComponent } from '@/components/Media'
import { CMSLink } from '@/components/Link'
const LottieIcon = dynamic(
	() => import('@/components/shared/Functional/LottieIcon'),
	{
		ssr: false
	}
)

// Types
import { Media, Page, Post } from '@/payload-types'
interface optionsProps {
	border?: boolean
}

interface ServiceCardProps {
	link: {
		type?: 'custom' | 'reference' | null | undefined
		newTab?: boolean | null | undefined
		reference?:
			| {
					relationTo: 'pages'
					value: string | Page
			  }
			| {
					relationTo: 'posts'
					value: string | Post
			  }
			| null
			| undefined
		url?: string | null
		label: string
	}
	icon?: 'computer' | 'cloud' | 'apple' | 'cart' | 'pen'
	image?: string | Media | null | undefined
	headline: string
	abstract: string
	tags: string[]
	options?: optionsProps
	items?: {
		text: string
	}[]
}

const ServiceCard: React.FC<ServiceCardProps> = ({
	link,
	icon,
	image,
	headline,
	abstract,
	items,
	tags,
	options = {
		border: true
	}
}) => {
	const [playAnimation, setPlayAnimation] = useState(false)

	const handleMouseEnter = () => {
		setPlayAnimation(true)
	}

	const handleMouseLeave = () => {
		setPlayAnimation(false)
	}

	return (
		<div
			className={`service-card group ${
				!options.border ? 'no-border' : ''
			} ${image ? 'image-teaser' : ''}`}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{icon && (
				<div className="service-card--icon shrink-0">
					<LottieIcon icon={icon} triggerPlay={playAnimation} />
				</div>
			)}
			{image && (
				<div className="image-teaser__image">
					<MediaComponent
						className=""
						imgClassName="object-cover w-full h-full"
						priority
						resource={image}
					/>
				</div>
			)}

			<div className="flex gap-4 sm:gap-4 items-center">
				<p
					className={`teaser__title ${link?.label === 'no-link' ? '' : 'group-hover:underline'}`}
				>
					{link?.label === 'no-link' ? (
						<>{headline}</>
					) : (
						<CMSLink
							{...link}
							className="after:absolute after:inset-0 after:z-10"
						/>
					)}
				</p>
				{link?.label !== 'no-link' && (
					<span className="shrink-0 flex items-center justify-center bg-accent rounded-full size-7 sm:size-8 -mt-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300">
						<ArrowUpRight className="stroke-3 text-primary! size-5 sm:size-6 shrink-0" />
					</span>
				)}
			</div>
			<div className={`teaser__text ${icon ? 'hidden md:block' : ''}`}>
				<p className="pb-6 2xl:pb-8 big">{abstract}</p>
				{items && items.length > 0 && (
					<ul className="list list--check list--icon list--line space-y-2 !mb-0">
						{items.map((item, index) => (
							<li key={index} className="flex items-center gap-3">
								<BadgeCheck className="size-8 text-accent" /> {item.text}
							</li>
						))}
					</ul>
				)}
				<ul className="list list--tag md:mt-4">
					{tags.map((tag, index) => (
						<li className={`${index === 0 ? 'highlight' : ''}`} key={index}>
							{tag}
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}

export default ServiceCard
