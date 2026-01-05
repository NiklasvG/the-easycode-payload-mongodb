// src\components\Chat\AIChat.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MessageSquare, Send, Sparkles, X } from 'lucide-react'

interface ChatMessage {
	role: 'user' | 'model'
	text: string
	isStreaming?: boolean
}

const STORAGE_KEY = 'easycode-ai-chat-opened'

export const AIChat: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [hasOpenedOnce, setHasOpenedOnce] = useState(false)
	const [messages, setMessages] = useState<ChatMessage[]>([
		{
			role: 'model',
			text: 'Hi! Ich bin **EasyCode AI**. Frag mich alles über Niklas – seine Projekte, seinen Tech-Stack, seine Erfahrung oder auch, wie du ihn am besten erreichen kannst.'
		}
	])
	const [inputValue, setInputValue] = useState('')
	const [isLoading, setIsLoading] = useState(false)

	const messagesEndRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null) // ✅ NEW

	// Beim Mount aus sessionStorage lesen
	useEffect(() => {
		if (typeof window === 'undefined') return
		const stored = window.sessionStorage.getItem(STORAGE_KEY)
		if (stored === 'true') {
			setHasOpenedOnce(true)
		}
	}, [])

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	// ✅ NEW: Fokus setzen, sobald der Chat geöffnet ist
	useEffect(() => {
		if (!isOpen) return
		// nach dem Render fokussieren
		requestAnimationFrame(() => {
			inputRef.current?.focus()
		})
	}, [isOpen])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!inputValue.trim() || isLoading) return

		const userText = inputValue.trim()
		setInputValue('')
		setMessages((prev) => [...prev, { role: 'user', text: userText }])
		setIsLoading(true)

		try {
			// Platzhalter für Streaming-Antwort
			setMessages((prev) => [
				...prev,
				{ role: 'model', text: '', isStreaming: true }
			])

			const res = await fetch('/api/ai-chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ message: userText })
			})

			if (!res.ok || !res.body) {
				throw new Error('Request failed')
			}

			const reader = res.body.getReader()
			const decoder = new TextDecoder()
			let fullText = ''

			// Chunks nacheinander lesen
			while (true) {
				const { value, done } = await reader.read()
				if (done) break

				const chunkText = decoder.decode(value, { stream: true })
				fullText += chunkText

				// Letzte model-Nachricht updaten
				setMessages((prev) => {
					const newMessages = [...prev]
					const last = newMessages[newMessages.length - 1]
					if (last && last.role === 'model' && last.isStreaming) {
						last.text = fullText
					}
					return newMessages
				})
			}

			// Streaming abschließen
			setMessages((prev) => {
				const newMessages = [...prev]
				const last = newMessages[newMessages.length - 1]
				if (last && last.role === 'model') {
					last.isStreaming = false
				}
				return newMessages
			})
		} catch (error) {
			console.error('Chat error:', error)
			setMessages((prev) => [
				...prev,
				{
					role: 'model',
					text: 'Sorry, ich habe einen Verbindungsfehler festgestellt. Bitte versuche es später erneut.'
				}
			])
		} finally {
			setIsLoading(false)
			// optional: nach dem Senden wieder fokussieren
			requestAnimationFrame(() => inputRef.current?.focus())
		}
	}

	const handleToggleOpen = () => {
		const next = !isOpen
		setIsOpen(next)

		// Wenn zum ersten Mal geöffnet → Flag setzen + sessionStorage
		if (next && !hasOpenedOnce) {
			setHasOpenedOnce(true)
			if (typeof window !== 'undefined') {
				window.sessionStorage.setItem(STORAGE_KEY, 'true')
			}
		}
	}

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
			{isOpen && (
				<div className="mb-4 w-[90vw] max-w-sm md:w-96 h-[500px] bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300">
					{/* Header */}
					<div className="bg-gradient-to-r from-accent to-accent-dark p-4 flex justify-between items-center">
						<div className="flex items-center gap-2 text-white">
							<Sparkles className="w-5 h-5" />
							<span className="font-display font-bold tracking-wide">
								EasyCode AI
							</span>
						</div>
						<button
							onClick={() => setIsOpen(false)}
							className="text-white/80 hover:text-white transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black bg-opacity-95 scroll-smooth chat-scroll">
						{messages.map((msg, idx) => (
							<div
								key={idx}
								className={`flex ${
									msg.role === 'user' ? 'justify-end' : 'justify-start'
								}`}
							>
								<div
									className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed
												${
													msg.role === 'user'
														? 'bg-accent text-white rounded-br-sm'
														: 'bg-black border border-white/10 text-gray-200 rounded-bl-sm'
												}`}
								>
									<div className="markdown markdown-chat">
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											components={{
												strong: ({ children }) => (
													<strong className="font-semibold text-accent">
														{children}
													</strong>
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
													return isInline ? (
														<code
															className="px-1 py-0.5 rounded bg-black/40 text-[0.8rem]"
															{...props}
														>
															{children}
														</code>
													) : (
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
											{msg.text}
										</ReactMarkdown>
									</div>

									{msg.isStreaming && (
										<div className="inline-flex gap-1 justify-start items-center">
											<div className="size-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
											<div className="size-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
											<div className="size-2 bg-accent rounded-full animate-bounce" />
										</div>
									)}
								</div>
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>

					{/* Input */}
					<form
						onSubmit={handleSubmit}
						className="p-4 bg-secondary-background border-t border-white/10"
					>
						<div className="relative">
							<input
								ref={inputRef} // ✅ NEW
								type="text"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								placeholder="Frag mich etwas ..."
								className="w-full bg-background/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-foreground focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-gray-400"
							/>
							<button
								type="submit"
								disabled={isLoading || !inputValue.trim()}
								className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent hover:text-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<Send className="w-4 h-4" />
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Toggle Button */}
			<button
				onClick={handleToggleOpen}
				className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20 transition-all duration-300 hover:scale-110 active:scale-95"
			>
				{isOpen ? (
					<X className="w-6 h-6" />
				) : (
					<MessageSquare className="w-6 h-6" />
				)}

				{/* Pulse effect nur, wenn der Chat noch nie geöffnet wurde */}
				{!isOpen && !hasOpenedOnce && (
					<span className="absolute -z-10 w-full h-full rounded-full bg-accent opacity-40 animate-ping" />
				)}
			</button>
		</div>
	)
}
