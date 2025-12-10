// src/blocks/CollaborationBlock/Component.tsx
import React from 'react'
import Image from 'next/image'
import {
	BadgeCheck,
	BadgePlus,
	Coffee,
	HandCoins,
	Home,
	ShoppingBasket,
	Truck,
	Users,
	UserRound,
	Wallet
} from 'lucide-react'

import type { CollaborationBlock } from '@/payload-types'
import LeftCurve from '@/components/shared/Designs/Collaboration/LeftCurve'
import RightCurve from '@/components/shared/Designs/Collaboration/RightCurve'

export const CollaborationBlockComponent: React.FC<CollaborationBlock> = (
	props
) => {
	const {
		title,
		items,
		sideDescription,
		enableLink,
		link: linkField,
		backgroundVariant,
		id
	} = props

	const bgClass =
		backgroundVariant === 'primary'
			? 'bg-background'
			: 'bg-secondary-background'

	return (
		<section
			id={id ?? undefined}
			className={['py-12 lg:py-24 2xl:py-32 overflow-hidden', bgClass]
				.filter(Boolean)
				.join(' ')}
		>
			<div className="container lg:flex">
				{/* Linke Spalte: Payload-Texte */}
				<div className="max-w-2xl">
					{title && <h2 className="h2 mb-4 md:mb-8">{title}</h2>}

					{items && items.length > 0 && (
						<ul className="max-w-[22rem] mb-8 md:mb-14">
							{items.map((item, index) => (
								<li key={item.id ?? index} className="mb-3 py-3">
									<div className="flex items-center">
										<BadgeCheck className="text-accent size-6 shrink-0" />
										<h6 className="body-2 ml-5">{item.title}</h6>
									</div>
									{item.description && (
										<p className="body-2 mt-3 text-muted-foreground">
											{item.description}
										</p>
									)}
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Rechte Spalte: Beschreibung + Icon-Kreis */}
				<div className="lg:ml-auto xl:w-[38rem] mt-14 lg:mt-4">
					{sideDescription && (
						<p className="body-2 mb-16 text-muted-foreground lg:mb-32 lg:max-w-sm lg:mx-auto">
							{sideDescription}
						</p>
					)}

					<div className="relative left-1/2 flex w-[22rem] aspect-square border border-white/5 rounded-full -translate-x-1/2">
						<div className="flex w-60 aspect-square m-auto border border-white/5 rounded-full">
							<div className="w-[6rem] aspect-square m-auto p-[0.2rem] bg-conic-gradient rounded-full relative">
								<div className="absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 glasCenterSmall" />
								<div className="flex items-center justify-center w-full h-full bg-card rounded-full">
									<Image
										src="/Logo/EasyCode_transparent.png"
										alt="Logo"
										width={50}
										height={50}
									/>
								</div>
							</div>
						</div>

						<ul>
							<li className="absolute top-0 left-1/2 h-1/2 -ml-[1.6rem] origin-bottom">
								<div className="relative -top-[1.6rem] flex w-[3.2rem] h-[3.2rem] bg-secondary-background border border-white/5 rounded-xl">
									<div className="m-auto grid place-items-center text-accent size-8">
										<UserRound />
									</div>
								</div>
							</li>
							<li className="absolute top-0 left-1/2 h-1/2 -ml-[1.6rem] origin-bottom rotate-45">
								<div className="relative -top-[1.6rem] flex w-[3.2rem] h-[3.2rem] bg-secondary-background border border-white/5 rounded-xl -rotate-45">
									<div className="m-auto grid place-items-center text-accent size-8">
										<Coffee />
									</div>
								</div>
							</li>
							<li className="absolute top-0 left-1/2 h-1/2 -ml-[1.6rem] origin-bottom rotate-90">
								<div className="relative -top-[1.6rem] flex w-[3.2rem] h-[3.2rem] bg-secondary-background border border-white/5 rounded-xl -rotate-90">
									<div className="m-auto grid place-items-center text-accent size-8">
										<HandCoins />
									</div>
								</div>
							</li>
							<li className="absolute top-0 left-1/2 h-1/2 -ml-[1.6rem] origin-bottom rotate-135">
								<div className="relative -top-[1.6rem] flex w-[3.2rem] h-[3.2rem] bg-secondary-background border border-white/5 rounded-xl -rotate-135">
									<div className="m-auto grid place-items-center text-accent size-8">
										<Users />
									</div>
								</div>
							</li>
							<li className="absolute top-0 left-1/2 h-1/2 -ml-[1.6rem] origin-bottom rotate-180">
								<div className="relative -top-[1.6rem] flex w-[3.2rem] h-[3.2rem] bg-secondary-background border border-white/5 rounded-xl -rotate-180">
									<div className="m-auto grid place-items-center text-accent size-8">
										<ShoppingBasket />
									</div>
								</div>
							</li>
							<li className="absolute top-0 left-1/2 h-1/2 -ml-[1.6rem] origin-bottom rotate-225">
								<div className="relative -top-[1.6rem] flex w-[3.2rem] h-[3.2rem] bg-secondary-background border border-white/5 rounded-xl -rotate-225">
									<div className="m-auto grid place-items-center text-accent size-8">
										<Wallet />
									</div>
								</div>
							</li>
							<li className="absolute top-0 left-1/2 h-1/2 -ml-[1.6rem] origin-bottom rotate-270">
								<div className="relative -top-[1.6rem] flex w-[3.2rem] h-[3.2rem] bg-secondary-background border border-white/5 rounded-xl -rotate-270">
									<div className="m-auto grid place-items-center text-accent size-8">
										<BadgePlus />
									</div>
								</div>
							</li>
							<li className="absolute top-0 left-1/2 h-1/2 -ml-[1.6rem] origin-bottom rotate-315">
								<div className="relative -top-[1.6rem] flex w-[3.2rem] h-[3.2rem] bg-secondary-background border border-white/5 rounded-xl -rotate-315">
									<div className="m-auto grid place-items-center text-accent size-8">
										<Home />
									</div>
								</div>
							</li>
						</ul>
						<LeftCurve />
						<RightCurve />
					</div>
				</div>
			</div>
		</section>
	)
}

export default CollaborationBlockComponent
