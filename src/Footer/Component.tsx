import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'
import {
	Mail,
	Linkedin,
	Instagram,
	Github,
	Link as LinkIcon
} from 'lucide-react'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

type SocialType = 'linkedin' | 'instagram' | 'github' | 'website'

const iconByType: Record<SocialType, React.FC<{ className?: string }>> = {
	linkedin: Linkedin,
	instagram: Instagram,
	github: Github,
	website: LinkIcon
}

export async function Footer() {
	const footerData: Footer = await getCachedGlobal('footer', 1)()

	const { aboutText, sections, contact } = footerData || {}

	return (
		<footer className="mt-auto border-t border-white/5 bg-secondary-background/30">
			<div className="container py-16">
				<div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-12 lg:gap-8">
					{/* Logo & About */}
					<div className="flex flex-col gap-6 sm:col-span-2">
						<Link className="flex items-center" href="/">
							<Logo />
						</Link>
						{aboutText && (
							<p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
								{aboutText}
							</p>
						)}
					</div>

					{/* Contact */}
					<div className="flex flex-col gap-6 lg:order-last">
						<h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
							Kontakt
						</h3>
						<div className="space-y-4">
							{contact?.email && (
								<a
									href={`mailto:${contact.email}`}
									className="flex items-center gap-3 group"
								>
									<div className="shrink-0 w-10 h-10 rounded-lg bg-secondary-background border border-white/5 flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:border-accent/30 transition-all">
										<Mail className="w-4 h-4" />
									</div>
									<span className="text-sm text-muted-foreground group-hover:text-accent transition-colors">
										{contact.email}
									</span>
								</a>
							)}

							{contact?.socials?.length ? (
								<div className="flex gap-3 pt-2">
									{contact.socials.map((s, i) => {
										const Icon = iconByType[s.type as SocialType] || LinkIcon
										return (
											<a
												key={i}
												href={s.url}
												target="_blank"
												rel="noopener noreferrer"
												className="w-10 h-10 rounded-lg bg-secondary-background border border-white/5 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/30 hover:-translate-y-1 transition-all"
												title={s.label || s.type}
											>
												<Icon className="w-4 h-4" />
											</a>
										)
									})}
								</div>
							) : null}
						</div>
					</div>

					{/* Sections */}
					{sections?.map((section, sectionIndex) => (
						<div key={sectionIndex} className="flex flex-col gap-6">
							<h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
								{section.label}
							</h3>
							<nav className="flex flex-col gap-3">
								{section.navItems?.map(({ link }, i) => (
									<CMSLink
										key={i}
										{...link}
										className="text-muted-foreground hover:text-accent transition-colors text-sm"
									/>
								))}
							</nav>
						</div>
					))}
				</div>
			</div>

			{/* Bottom Bar */}
			<div className="border-t border-white/5 py-8">
				<div className="container flex justify-center items-center gap-4 text-xs text-muted-foreground">
					<p>
						© {new Date().getFullYear()} The-Easycode. Alle Rechte vorbehalten.
					</p>
				</div>
			</div>
		</footer>
	)
}
