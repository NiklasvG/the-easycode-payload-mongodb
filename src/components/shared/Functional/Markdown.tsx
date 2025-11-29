'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type MarkdownProps = {
	children: string
	className?: string
}

/**
 * Markdown-Komponente mit GFM-Unterstützung und
 * einheitlichem Styling für Links, Bold & Code.
 */
export const Markdown: React.FC<MarkdownProps> = ({ children, className }) => {
	return (
		<div className={`markdown ${className}`}>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					strong: ({ children }) => (
						<strong className="font-semibold text-accent">{children}</strong>
					),
					a: ({ children, href, ...props }) => (
						<a
							href={href}
							{...props}
							className="text-accent hover:underline"
							target="_blank"
							rel="noreferrer"
						>
							{children}
						</a>
					),
					code: ({ node, children, ...props }) => {
						const isInline =
							!node?.position ||
							node.position.start.line === node.position.end.line

						if (isInline) {
							return (
								<code
									className="px-1 py-0.5 rounded bg-black/40 text-[0.8rem]"
									{...props}
								>
									{children}
								</code>
							)
						}

						return (
							<code
								className="block p-2 rounded bg-black/60 text-[0.75rem] overflow-x-auto"
								{...props}
							>
								{children}
							</code>
						)
					}
				}}
			>
				{children}
			</ReactMarkdown>
		</div>
	)
}

export default Markdown
