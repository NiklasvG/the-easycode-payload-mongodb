// src\components\Chat\AIChat.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MessageSquare, Send, Sparkles, X, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

interface ChatMessage {
	role: 'user' | 'model'
	text: string
	isStreaming?: boolean
	thoughtSignature?: string
}

const STORAGE_KEY = 'easycode-ai-chat-opened'
const DISCLAIMER_KEY = 'easycode-ai-chat-disclaimer-confirmed'

export const AIChat: React.FC<{ initiallyOpen?: boolean }> = ({ initiallyOpen = false }) => {
	const [isOpen, setIsOpen] = useState(initiallyOpen)
	const [hasOpenedOnce, setHasOpenedOnce] = useState(initiallyOpen)
	const [hasConfirmedDisclaimer, setHasConfirmedDisclaimer] = useState(false)
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
	const requestAbort = useRef<AbortController | null>(null)
	useEffect(() => () => requestAbort.current?.abort(), [])

	// Beim Mount aus sessionStorage/localStorage lesen
	useEffect(() => {
		if (typeof window === 'undefined') return
		if (initiallyOpen) {
			try { window.sessionStorage.setItem(STORAGE_KEY, 'true') } catch { /* Keep the in-memory choice. */ }
		}
		let storedOpened: string | null = null
		let storedDisclaimer: string | null = null
		try {
			storedOpened = window.sessionStorage.getItem(STORAGE_KEY)
			storedDisclaimer = window.localStorage.getItem(DISCLAIMER_KEY)
		} catch { /* Storage may be disabled; the chat still works for this session. */ }
		if (storedOpened === 'true') {
			setHasOpenedOnce(true)
		}

		if (storedDisclaimer === 'true') {
			setHasConfirmedDisclaimer(true)
		}
	}, [initiallyOpen])

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

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!inputValue.trim() || isLoading) return

		setIsLoading(true) // ✅ Early locking
		const userText = inputValue.trim()
		const honeypot = new FormData(e.currentTarget).get('hp_field')
		const abort = new AbortController()
		requestAbort.current = abort
		const history = messages.slice(-20)
		let signatureIndex = -1
		for (let index = history.length - 1; index >= 0; index--) {
			if (history[index].role === 'model' && history[index].thoughtSignature) {
				signatureIndex = index
				break
			}
		}
		setInputValue('')
		setMessages((prev) => [...prev, { role: 'user', text: userText }])

		try {
			// Platzhalter für Streaming-Antwort
			setMessages((prev) => [
				...prev,
				{ role: 'model', text: '', isStreaming: true }
			])

			const res = await fetch('/api/ai-chat', {
				signal: abort.signal,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: userText,
					_hp: typeof honeypot === 'string' ? honeypot : '',
					history: history.map((m, index) => ({
						role: m.role,
						text: m.text.slice(0, 1000),
						thoughtSignature: index === signatureIndex ? m.thoughtSignature?.slice(0, 16384) : undefined,
					}))
				})
			})

			if (res.status === 429) {
				const data = await res.json()
				throw new Error(data.error || 'Too many requests')
			}

			if (!res.ok || !res.body) {
				const errorData = await res.json().catch(() => ({}))
				throw new Error(errorData.error || 'Request failed')
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

				// Extrahiere Thought Signature falls vorhanden
				let displayToUser = fullText
				let foundSig = ''
				if (fullText.includes('\n__THOUGHT_SIG__:')) {
					const parts = fullText.split('\n__THOUGHT_SIG__:')
					displayToUser = parts[0]
					foundSig = parts[1]
				}

				// Letzte model-Nachricht updaten
				setMessages((prev) => {
					const newMessages = [...prev]
					const last = newMessages[newMessages.length - 1]
					if (last && last.role === 'model' && last.isStreaming) {
						newMessages[newMessages.length - 1] = { ...last, text: displayToUser, thoughtSignature: foundSig ? foundSig.trim() : last.thoughtSignature }
					}
					return newMessages
				})
			}

			// Streaming abschließen
			setMessages((prev) => {
				const newMessages = [...prev]
				const last = newMessages[newMessages.length - 1]
				if (last && last.role === 'model') {
					newMessages[newMessages.length - 1] = { ...last, isStreaming: false }
				}
				return newMessages
			})
		} catch (error) {
			if (abort.signal.aborted) {
				setMessages((previous) => previous.map((message) => message.isStreaming ? { ...message, isStreaming: false } : message))
				return
			}
			console.error('Chat error:', error)
			setMessages((prev) => {
				// Alle trailing placeholders (falls vorhanden) entfernen
				const filtered = [...prev]
				while (
					filtered.length > 0 &&
					filtered[filtered.length - 1].role === 'model' &&
					(filtered[filtered.length - 1].isStreaming ||
						filtered[filtered.length - 1].text === '')
				) {
					filtered.pop()
				}
				// Einzelne Fehlermeldung hinzufügen
				return [
					...filtered,
					{
						role: 'model',
						text:
							(error instanceof Error ? error.message : '') ||
							'Sorry, ich habe einen Verbindungsfehler festgestellt. Bitte versuche es später erneut.',
						isStreaming: false
					}
				]
			})
		} finally {
			requestAbort.current = null
			setIsLoading(false)
			// optional: nach dem Senden wieder fokussieren
			requestAnimationFrame(() => inputRef.current?.focus())
		}
	}

	const handleToggleOpen = () => {
		const next = !isOpen
		if (!next) requestAbort.current?.abort()
		setIsOpen(next)

		// Wenn zum ersten Mal geöffnet → Flag setzen + sessionStorage
		if (next && !hasOpenedOnce) {
			setHasOpenedOnce(true)
			if (typeof window !== 'undefined') {
				try { window.sessionStorage.setItem(STORAGE_KEY, 'true') } catch { /* Keep the in-memory choice. */ }
			}
		}
	}

	const handleConfirmDisclaimer = () => {
		setHasConfirmedDisclaimer(true)
		if (typeof window !== 'undefined') {
			try { window.localStorage.setItem(DISCLAIMER_KEY, 'true') } catch { /* Keep the in-memory choice. */ }
		}
	}

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
			{isOpen && (
				<div id="easycode-ai-chat" role="region" aria-label="EasyCode AI Chat" className="mb-4 w-[90vw] max-w-sm md:w-96 h-[500px] bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 motion-reduce:animate-none">
					{/* Header */}
					<div className="bg-linear-to-r from-accent to-accent-dark p-4 flex justify-between items-center">
						<div className="flex items-center gap-2 text-white">
							<Sparkles className="w-5 h-5" />
							<span className="font-display font-bold tracking-wide">
								EasyCode AI
							</span>
						</div>
						<button
							aria-label="Chatfenster schließen"
							onClick={() => { requestAbort.current?.abort(); setIsOpen(false) }}
							className="text-white/80 hover:text-white transition-colors"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					<div className="flex-1 relative flex flex-col overflow-hidden">
						{!hasConfirmedDisclaimer && (
							<div className="absolute inset-0 z-20 bg-black/95 backdrop-blur-xs p-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
								<div className="p-4 bg-accent/10 rounded-full text-accent mb-6 ring-1 ring-accent/20">
									<ShieldCheck className="w-8 h-8" />
								</div>
								<h3 className="text-xl font-bold text-white mb-4">
									Wichtiger Hinweis
								</h3>
								<p className="text-sm text-gray-300 leading-relaxed mb-8 payload-richtext">
									Bitte keine sensiblen personenbezogenen Daten,
									Gesundheitsdaten, Zugangsdaten oder vertraulichen
									Informationen eingeben. Mehr Infos in der
									<Link href="/datenschutz"> Datenschutzerklärung</Link>.
								</p>
								<button
									onClick={handleConfirmDisclaimer}
									className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
								>
									Verstanden
								</button>
							</div>
						)}
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
															node.position.start.line ===
																node.position.end.line
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
							{/* Honeypot Field */}
							<input
								type="text"
								name="hp_field"
								className="hidden"
								autoComplete="off"
								tabIndex={-1}
							/>

							<div className="relative">
								<input
									ref={inputRef}
									type="text"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									disabled={!hasConfirmedDisclaimer}
									maxLength={1000}
									placeholder={
										hasConfirmedDisclaimer
											? 'Frag mich etwas ...'
											: 'Bitte erst Hinweis bestätigen'
									}
									className="w-full bg-background/50 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-base md:text-sm text-foreground focus:outline-hidden focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all placeholder:text-gray-400 disabled:opacity-50"
								/>
								{inputValue.length > 800 && (
									<div className="absolute -top-4 right-0 text-[10px] text-gray-500 font-mono">
										{inputValue.length}/1000
									</div>
								)}
								<button
									type="submit"
									aria-label="Nachricht senden"
									disabled={
										isLoading || !inputValue.trim() || !hasConfirmedDisclaimer
									}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent hover:text-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									<Send className="w-4 h-4" />
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Toggle Button */}
			<button
				onClick={handleToggleOpen}
				aria-label={isOpen ? 'KI-Chat schließen' : 'KI-Chat öffnen'}
				aria-expanded={isOpen}
				aria-controls="easycode-ai-chat"
				className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-accent hover:bg-accent-dark text-white shadow-lg shadow-accent/20 transition-all duration-300 hover:scale-110 active:scale-95"
			>
				{isOpen ? (
					<X className="w-6 h-6" />
				) : (
					<MessageSquare className="w-6 h-6" />
				)}

				{/* Pulse effect nur, wenn der Chat noch nie geöffnet wurde */}
				{!isOpen && !hasOpenedOnce && (
					<span className="absolute -z-10 w-full h-full rounded-full bg-accent opacity-40 animate-ping motion-reduce:animate-none" />
				)}
			</button>
		</div>
	)
}

