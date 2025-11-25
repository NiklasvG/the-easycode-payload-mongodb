'use client'

import React, { useState, useEffect } from 'react'

// Types
import type { Header as HeaderType } from '@/payload-types'

// Libraries
import { disablePageScroll, enablePageScroll } from '@fluejs/noscroll'

// Components
import Link from 'next/link'
import { ArrowUpRight, Instagram, Linkedin, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import MenuSvg from '@/components/shared/Designs/svg/MenuSvg'
import { Logo } from '@/components/Logo/Logo'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
	const pathname = usePathname()

	const navItems = data?.navItems || []

	const [openNavigation, setOpenNavigation] = useState<boolean>(false)
	const [openNavigationDelay, setOpenNavigationDelay] = useState<boolean>(false)

	const toggleNavigation = () => {
		if (openNavigation) {
			setOpenNavigation(false)
			enablePageScroll()
		} else {
			setOpenNavigation(true)
			disablePageScroll()
		}
	}

	const handleClick = () => {
		if (!openNavigation) return

		enablePageScroll()
		setOpenNavigation(false)
	}

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			setOpenNavigationDelay(openNavigation)
		}, 10)

		return () => {
			clearTimeout(timeoutId)
		}
	}, [openNavigation])

	useEffect(() => {
		// check if browser
		if (typeof window === 'undefined') return

		const handleResize = () => {
			if (window.innerWidth >= 1024 && openNavigation) {
				enablePageScroll()
				setOpenNavigation(false)
			}
		}

		window.addEventListener('resize', handleResize)
		return () => window.removeEventListener('resize', handleResize)
	}, [openNavigation])

	return (
		<>
			<ul className="hidden lg:flex relative z-20 items-center justify-center gap-4 lg:gap-8 m-auto">
				{navItems.map(({ link }, i) => {
					const isActive = pathname.startsWith(link?.url || '')
					const variant = isActive ? 'default' : 'ghost'

					if (!link?.url) return null

					return (
						<li key={i} className="nav-main__item">
							<Link href={link.url} onClick={handleClick}>
								<Button variant={variant} size="lg">
									{link?.label}
								</Button>
							</Link>
						</li>
					)
				})}
			</ul>

			<ul className="hidden md:flex gap-6 items-center justify-end w-full">
				<li className="nav-main__item">
					<Link href="/Suche" onClick={handleClick}>
						<Button variant="secondary" size="lg">
							<Search />
							Suche
						</Button>
					</Link>
				</li>
				<li className="nav-main__item">
					<Link href="/Kontakt" onClick={handleClick}>
						<Button variant="outline" size="lg">
							Kontakt
							<span className="block bg-accent rounded-full p-1">
								<ArrowUpRight className="stroke-3 !text-primary" />
							</span>
						</Button>
					</Link>
				</li>
			</ul>

			<Button
				className="ml-auto lg:hidden px-3 relative"
				onClick={toggleNavigation}
				variant="ghost"
			>
				<MenuSvg openNavigation={openNavigationDelay} />
			</Button>

			{/* Mobile Navigation */}
			<div
				className={`${
					openNavigation ? 'flex' : 'hidden'
				} z-40 fixed top-0 left-0 right-0 bottom-0 bg-background flex-col h-full lg:hidden lg:bg-transparent`}
			>
				<div className="flex items-center container mx-auto w-full py-4 lg:py-8 gap-8">
					<Link href="/" className="logo shrink-0" onClick={handleClick}>
						<Logo />
					</Link>

					<ul className="hidden sm:flex gap-6 items-center justify-end w-full">
						<li className="nav-main__item">
							<Link href="/Suche" onClick={handleClick}>
								<Button variant="secondary" size="lg">
									<Search />
									Suche
								</Button>
							</Link>
						</li>
						<li className="nav-main__item">
							<Link href="/Kontakt" onClick={handleClick}>
								<Button variant="outline" size="lg">
									Kontakt
									<span className="block bg-accent rounded-full p-1">
										<ArrowUpRight className="stroke-3 !text-primary" />
									</span>
								</Button>
							</Link>
						</li>
					</ul>
					<Button
						className="ml-auto lg:hidden px-3 relative"
						onClick={toggleNavigation}
						variant="ghost"
					>
						<MenuSvg openNavigation={openNavigationDelay} />
					</Button>
				</div>

				<div className="relative z-20 w-full border-t overflow-auto">
					<div className="container py-4">
						<ul className="pb-14 flex flex-col gap-4 lg:gap-8">
							{navItems.map(({ link }, i) => {
								const href = link?.url
								const label = link?.label

								if (!href || !label) return null

								return (
									<li key={i} className="nav-main__item nav-main__item--1">
										<Link
											href={href}
											onClick={handleClick}
											className="nav-main__link nav-main__link--1"
										>
											{label}
										</Link>
									</li>
								)
							})}
						</ul>
						<div className="flex flex-col gap-6">
							<div className="text-accent text-2xl font-medium">
								Jetzt durchstarten!
							</div>
							<Link href="/Kontakt" onClick={handleClick}>
								<Button variant="default" size="lg">
									Kontakt
									<span className="block bg-accent rounded-full p-1">
										<ArrowUpRight className="stroke-3 !text-primary" />
									</span>
								</Button>
							</Link>

							<div className="flex gap-6 mt-8">
								<div className="social-media__label">Folge uns</div>
								<a
									href="https://www.linkedin.com/company/the-easycode/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Linkedin className="text-white hover:text-accent transition-all" />
								</a>
								<a
									href="https://www.instagram.com/the_easycode/"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Instagram className="text-white hover:text-accent transition-all" />
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
