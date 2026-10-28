// src/blocks/ContactLinks/Component.tsx
import React from 'react'
import { Mail, Link as LinkIcon } from 'lucide-react'
import { Github, Instagram, Linkedin } from '@/components/icons/brands'
import { ContactLinksBlock } from '@/payload-types'

type SocialType = 'linkedin' | 'instagram' | 'github' | 'website'

type Props = ContactLinksBlock

const iconByType: Record<SocialType, React.FC<{ className?: string }>> = {
  linkedin: Linkedin,
  instagram: Instagram,
  github: Github,
  website: LinkIcon,
}

export const ContactLinksBlockComponent: React.FC<Props> = ({ email, socials }) => {
  return (
    <div className="min-w-0 space-y-8 mb-6">
      {email && (
        <a
          href={`mailto:${email}`}
          className="group flex min-w-0 items-center gap-4 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <div className="size-12 shrink-0 rounded-xl bg-secondary-background border border-white/15 flex items-center justify-center text-muted-foreground group-hover:text-accent group-focus-visible:text-accent transition-colors duration-150">
            <Mail aria-hidden="true" className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
              E-Mail
            </div>
            <div className="text-lg font-medium text-foreground group-hover:text-accent group-focus-visible:text-accent [overflow-wrap:anywhere] transition-colors duration-150">
              {email}
            </div>
          </div>
        </a>
      )}

      {socials?.length ? (
        <div className="flex flex-wrap gap-4">
          {socials.map((s, i) => {
            if (!s.url) return null
            const Icon = iconByType[s.type] || LinkIcon
            const label = s.label || s.type
            return (
              <a
                key={`${s.type}-${i}`}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="size-12 shrink-0 rounded-xl bg-secondary-background border border-white/15 flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/40 focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent transition-colors duration-150"
                title={label}
                aria-label={`${label} (öffnet in neuem Tab)`}
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
