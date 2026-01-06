// src/blocks/ContactLinks/Component.tsx
import React from 'react'
import {
	Mail,
	Linkedin,
	Instagram,
	Github,
	Link as LinkIcon
} from 'lucide-react'
import { ContactLinksBlock } from '@/payload-types'

type SocialType = 'linkedin' | 'instagram' | 'github' | 'website'

type Props = ContactLinksBlock

const iconByType: Record<SocialType, React.FC<{ className?: string }>> = {
	linkedin: Linkedin,
	instagram: Instagram,
	github: Github,
	website: LinkIcon
}

export const ContactLinksBlockComponent: React.FC<Props> = ({
	email,
	socials
}) => {
	return (
		<div className="space-y-8 mb-6">
			<a href={`mailto:${email}`} className="flex items-center gap-4 group">
				<div className="w-12 h-12 rounded-xl bg-secondary-background border border-white/5 flex items-center justify-center text-muted-foreground group-hover:text-accent group-hover:border-accent/30 transition-all">
					<Mail className="w-5 h-5" />
				</div>
				<div>
					<div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
						E-Mail
					</div>
					<div className="text-lg font-medium text-foreground group-hover:text-accent transition-colors">
						{email}
					</div>
				</div>
			</a>

			{socials?.length ? (
				<div className="flex gap-4">
					{socials.map((s, i) => {
						const Icon = iconByType[s.type]
						const label = s.label || s.type
						return (
							<a
								key={`${s.type}-${i}`}
								href={s.url}
								target="_blank"
								rel="noopener noreferrer"
								className="w-12 h-12 rounded-xl bg-secondary-background border border-white/5 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/30 hover:-translate-y-1 transition-all"
								title={label}
							>
								<Icon className="w-5 h-5" />
							</a>
						)
					})}
				</div>
			) : null}
		</div>
	)
}
