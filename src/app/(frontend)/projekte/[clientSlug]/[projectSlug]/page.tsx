import React, { cache } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import configPromise from '@payload-config'

// Icons aus lucide-react
import {
	ArrowLeft,
	ArrowRight,
	MessageSquare,
	Cpu,
	Code,
	ExternalLink,
	Github
} from 'lucide-react'
import RichText from '@/components/RichText'
import { LivePreviewListener } from '@/components/LivePreviewListener'

type Project = RequiredDataFromCollectionSlug<'projects'>
type Client = RequiredDataFromCollectionSlug<'clients'>

export async function generateStaticParams() {
	const payload = await getPayload({ config: configPromise })

	const { docs } = await payload.find({
		collection: 'projects',
		draft: false,
		limit: 1000,
		pagination: false,
		depth: 1,
		select: {
			slug: true,
			client: true
		}
	})

	const params =
		docs?.flatMap((project) => {
			const client = project.client as Client | string | null | undefined
			if (!client) return []

			const clientSlug = typeof client === 'string' ? client : client.slug
			if (!clientSlug || !project.slug) return []

			return [
				{
					clientSlug,
					projectSlug: project.slug
				}
			]
		}) ?? []

	return params
}

type Params = {
	clientSlug: string
	projectSlug: string
}

type Args = {
	params: Promise<Params>
}

export default async function ProjectDetailPage({
	params: paramsPromise
}: Args) {
	// 1. Draft Mode Status abrufen
	const { isEnabled: draft } = await draftMode()
	const { projectSlug } = await paramsPromise

	// Deine Query Funktion berücksichtigt bereits "draft: isEnabled", das passt also!
	const project = await queryProjectBySlug({
		slug: decodeURIComponent(projectSlug)
	})

	if (!project) {
		notFound()
	}

	const client = project.client as Client | string | null | undefined
	const clientName =
		typeof client === 'object' && client?.companyName
			? client.companyName
			: project.customer || 'Projekt'

	const clientObj = typeof client === 'object' ? client : null

	// Nimm die erste Kontaktperson mit Kommentar (oder passe die Logik nach Bedarf an)
	const primaryContact =
		clientObj?.contacts?.find(
			(contact) => contact.comment && contact.comment.trim().length > 0
		) ?? null

	// Quote-Daten mit Fallback
	const quote = primaryContact?.comment
		? {
				text: primaryContact.comment,
				author: primaryContact.name,
				role: primaryContact.position,
				image: primaryContact.image
			}
		: project.quote?.text
			? {
					text: project.quote?.text || '',
					author: project.quote?.author || clientName,
					role: project.quote?.position || null,
					image: null
				}
			: null

	const technologies =
		project.technologies?.map((t) => t.name).filter(Boolean) ?? []

	return (
		<article className="min-h-screen bg-background text-foreground animate-in fade-in duration-500 selection:bg-accent selection:text-white">
			{draft && <LivePreviewListener />}

			{/* --- HERO SECTION --- */}
			<section className="bg-background w-full h-full py-24 lg:py-36 2xl:py-28">
				<div className="container mx-auto px-6 relative z-10">
					<Link
						href="/projekte"
						className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-accent mb-8 transition-colors group"
					>
						<ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
						Alle Projekte
					</Link>

					<div className="flex flex-col lg:flex-row gap-12 lg:items-end mb-12">
						<div className="flex-1">
							<div className="flex items-center gap-3 mb-6">
								<span className="text-accent font-bold tracking-wider uppercase text-sm border border-accent/20 px-3 py-1 rounded-full bg-accent/5">
									{clientName}
								</span>
								<span className="w-1 h-1 bg-gray-600 rounded-full"></span>
								<span className="text-gray-300 text-sm uppercase tracking-wider">
									{project.industry}
								</span>
							</div>

							<h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
								{project.title}
							</h1>

							{project.outcomeSentence && (
								<p className="text-xl md:text-2xl text-gray-300 max-w-2xl font-light leading-relaxed border-l-4 border-accent pl-6">
									{project.outcomeSentence}
								</p>
							)}
						</div>

						<div className="lg:max-w-xs w-full bg-secondary-background border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
							<div className="mb-4">
								<div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">
									Role
								</div>
								<div className="text-lg font-medium">{project.role}</div>
							</div>
							{technologies.length > 0 && (
								<div>
									<div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">
										Stack
									</div>
									<div className="flex flex-wrap gap-2">
										{technologies.slice(0, 4).map((tech) => (
											<span
												key={tech}
												className="text-xs px-2 py-1 bg-white/10 rounded text-gray-300"
											>
												{tech}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Hero Image – nutzt das Upload-Feld heroImage */}
					{project.heroImage && typeof project.heroImage === 'object' && (
						<div className="relative w-full aspect-[16/9] lg:aspect-[21/9] rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
							<Image
								src={project.heroImage.url!}
								alt={`${project.title} Hero`}
								fill
								className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
								sizes="(max-width: 1024px) 100vw, 1200px"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
						</div>
					)}
				</div>
			</section>

			{/* --- CASE STUDY CONTENT --- */}
			<section className="py-20">
				<div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
					{/* Main Content Column */}
					<div className="lg:col-span-8 space-y-20">
						{/* 1. Challenge & Goal */}
						<div className="grid md:grid-cols-2 gap-12">
							<div>
								<h3 className="text-2xl font-display font-bold mb-4 text-white flex items-center gap-2">
									<span className="text-accent">01.</span> Die Herausforderung
								</h3>
								<div className="text-gray-300 leading-relaxed text-lg">
									{project.theChallenge && (
										<RichText data={project.theChallenge} />
									)}
								</div>
							</div>
							<div>
								<h3 className="text-2xl font-display font-bold mb-4 text-white flex items-center gap-2">
									<span className="text-accent">02.</span> Das Ziel
								</h3>
								<div className="text-gray-300 leading-relaxed text-lg">
									{project.theGoal && <RichText data={project.theGoal} />}
								</div>
							</div>
						</div>

						{/* 2. Solution */}
						<div>
							<h3 className="text-3xl font-display font-bold mb-6 text-white flex items-center gap-3">
								<span className="text-accent">03.</span> Die Lösung
							</h3>
							<div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
								{project.theSolution && <RichText data={project.theSolution} />}
							</div>
						</div>

						{/* Visuals Interspersed */}
						{project.secondaryImages && project.secondaryImages.length > 0 && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
								{project.secondaryImages.map((imgItem, idx) => {
									const img =
										typeof imgItem.image === 'object' ? imgItem.image : null
									if (!img?.url) return null

									return (
										<div
											key={idx}
											className="rounded-xl overflow-hidden border border-white/5 shadow-lg h-64 md:h-80 relative"
										>
											<Image
												src={img.url}
												alt={img.alt || 'Feature Detail'}
												fill
												className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
												sizes="(max-width: 1024px) 100vw, 600px"
											/>
										</div>
									)
								})}
							</div>
						)}

						{/* 3. Outcome */}
						<div>
							<h3 className="text-3xl font-display font-bold mb-8 text-white flex items-center gap-3">
								<span className="text-accent">04.</span> Ergebnis & Wirkung
							</h3>
							<div className="prose prose-invert prose-lg max-w-none text-gray-300 leading-relaxed">
								{project.theOutcome && <RichText data={project.theOutcome} />}
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
								{project.stats?.map((stat, idx) => (
									<div
										key={idx}
										className="bg-secondary-background p-6 rounded-2xl border border-white/5 hover:border-accent/30 transition-colors"
									>
										<div className="text-3xl md:text-4xl font-bold text-white mb-2 font-display">
											{stat.value}
										</div>
										<div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
											{stat.label}
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Sidebar Column */}
					<div className="lg:col-span-4 space-y-12">
						{/* Quote */}
						{!!quote && (
							<div className="bg-gradient-to-br from-secondary-background to-background border border-white/10 p-8 rounded-3xl relative">
								<MessageSquare className="absolute top-8 left-8 w-8 h-8 text-accent/20" />
								<blockquote className="relative z-10">
									<p className="text-xl italic text-gray-200 mb-6 leading-relaxed">
										&quot;{quote.text}&quot;
									</p>
									<footer className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold overflow-hidden">
											{quote.image &&
											typeof quote.image === 'object' &&
											'url' in quote.image &&
											quote.image.url ? (
												<Image
													src={quote.image.url as string}
													alt={quote.author}
													width={40}
													height={40}
													className="w-full h-full object-cover"
												/>
											) : (
												quote.author.charAt(0)
											)}
										</div>
										<div>
											<div className="font-bold text-white text-sm">
												{quote.author}
											</div>
											{quote.role && (
												<div className="text-xs text-accent">{quote.role}</div>
											)}
										</div>
									</footer>
								</blockquote>
							</div>
						)}

						{/* Tech Stack */}
						{technologies.length > 0 && (
							<div className="bg-secondary-background border border-white/5 rounded-2xl p-6">
								<h4 className="font-bold text-white mb-6 flex items-center gap-2">
									<Cpu className="w-5 h-5 text-accent" /> Tech Stack
								</h4>
								<div className="flex flex-wrap gap-2">
									{technologies.map((tech) => (
										<span
											key={tech}
											className="px-3 py-2 bg-background border border-white/10 text-gray-300 rounded-lg text-sm hover:border-accent/50 hover:text-white transition-all cursor-default"
										>
											{tech}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Nerd Details */}
						{project.theNerdDetails && (
							<div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
								<div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
									<Code className="w-16 h-16 text-accent" />
								</div>
								<h4 className="font-bold text-gray-200 mb-4 font-mono text-sm uppercase tracking-widest">
									For Developers
								</h4>
								<div className="text-gray-400 text-sm leading-relaxed font-mono">
									{project.theNerdDetails && (
										<RichText data={project.theNerdDetails} />
									)}
								</div>
							</div>
						)}

						{/* Actions */}
						<div className="flex flex-col gap-4 sticky top-24">
							{project.demoUrl && (
								<a
									href={project.demoUrl}
									target="_blank"
									rel="noreferrer"
									className="flex items-center justify-center gap-2 w-full py-4 bg-accent hover:bg-accent-dark text-white rounded-xl font-bold transition-all shadow-lg shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-1"
								>
									<ExternalLink className="w-5 h-5" /> Website ansehen
								</a>
							)}
							{project.repoUrl && (
								<a
									href={project.repoUrl}
									target="_blank"
									rel="noreferrer"
									className="flex items-center justify-center gap-2 w-full py-4 bg-secondary-background hover:bg-white/5 text-white border border-white/10 rounded-xl font-medium transition-colors"
								>
									<Github className="w-5 h-5" /> Zum Code
								</a>
							)}
						</div>
					</div>
				</div>
			</section>

			{/* Next Project / CTA */}
			<section className="py-20 border-t border-white/5 bg-secondary-background/30">
				<div className="container mx-auto px-6 text-center">
					<h2 className="text-2xl md:text-3xl font-display font-bold mb-8">
						Bereit für dein Projekt?
					</h2>
					<Link
						href="/kontakt"
						className="inline-flex items-center gap-2 text-accent hover:text-white font-bold text-lg transition-colors border-b-2 border-accent hover:border-white pb-1"
					>
						Let&apos;s talk about it <ArrowRight className="w-5 h-5" />
					</Link>
				</div>
			</section>
		</article>
	)
}

export async function generateMetadata({
	params: paramsPromise
}: Args): Promise<Metadata> {
	const { projectSlug } = await paramsPromise
	const project = await queryProjectBySlug({
		slug: decodeURIComponent(projectSlug)
	})

	if (!project) return {}

	return {
		title: project.title,
		description: project.shortDescription,
		openGraph: {
			title: project.title,
			description: project.shortDescription
		}
	}
}

// -------- Helpers --------

const queryProjectBySlug = cache(async ({ slug }: { slug: string }) => {
	const { isEnabled: draft } = await draftMode()
	const payload = await getPayload({ config: configPromise })

	const result = await payload.find({
		collection: 'projects',
		draft,
		limit: 1,
		pagination: false,
		overrideAccess: draft,
		where: {
			slug: {
				equals: slug
			}
		},
		depth: 2
	})

	return (result.docs?.[0] as Project | undefined) || null
})
