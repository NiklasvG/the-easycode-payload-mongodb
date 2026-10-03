// src\components\Chat\AIChat.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MessageSquare, Send, Sparkles, X, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import {
  CHAT_MESSAGE_CHARS,
  CHAT_NOTICE_VERSION,
  compactChatHistory,
} from '@/utilities/chatProtocol'
import { readChatEvents } from '@/utilities/readChatEvents'

interface ChatMessage {
  role: 'user' | 'model'
  text: string
  isStreaming?: boolean
  excludeFromContext?: boolean
}

const STORAGE_KEY = 'easycode-ai-chat-opened'
const DISCLAIMER_KEY = 'easycode-ai-chat-disclaimer-confirmed'
function storedSetting(storage: 'localStorage' | 'sessionStorage', key: string) {
  try {
    return typeof window === 'undefined' ? null : window[storage].getItem(key)
  } catch {
    return null
  }
}

export const AIChat: React.FC<{ initiallyOpen?: boolean }> = ({ initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const [hasOpenedOnce, setHasOpenedOnce] = useState(
    () => initiallyOpen || storedSetting('sessionStorage', STORAGE_KEY) === 'true',
  )
  const [hasConfirmedDisclaimer, setHasConfirmedDisclaimer] = useState(
    () => storedSetting('localStorage', DISCLAIMER_KEY) === CHAT_NOTICE_VERSION,
  )
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Hi! Ich bin **EasyCode AI**, ein KI-Assistent. Ich beantworte Fragen zu Niklas’ Leistungen, öffentlichen Projekten und Kontaktmöglichkeiten.',
      excludeFromContext: true,
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [retryAt, setRetryAt] = useState(0)
  const [cooldown, setCooldown] = useState(0)
  useEffect(() => {
    if (retryAt <= Date.now()) return
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((retryAt - Date.now()) / 1000))
      setCooldown(remaining)
      if (remaining === 0) window.clearInterval(timer)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [retryAt])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null) // ✅ NEW
  const requestAbort = useRef<AbortController | null>(null)
  useEffect(() => () => requestAbort.current?.abort(), [])

  useEffect(() => {
    if (initiallyOpen) {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, 'true')
      } catch {
        /* Keep the in-memory choice. */
      }
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
    if (
      !inputValue.trim() ||
      requestAbort.current ||
      !hasConfirmedDisclaimer ||
      Date.now() < retryAt
    )
      return
    const userText = inputValue.trim()
    const honeypot = new FormData(e.currentTarget).get('hp_field')
    const abort = new AbortController()
    requestAbort.current = abort
    setIsLoading(true)
    setErrorMessage('')
    const history = compactChatHistory(
      messages.filter((message) => !message.excludeFromContext && !message.isStreaming),
    )
    const userIndex = messages.length
    setInputValue('')
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userText },
      { role: 'model', text: '', isStreaming: true },
    ])
    const timeout = window.setTimeout(() => abort.abort(), 55000)
    let fullText = ''
    let lastPaint = 0
    try {
      const res = await fetch('/api/ai-chat', {
        signal: abort.signal,
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history,
          noticeVersion: CHAT_NOTICE_VERSION,
          _hp: typeof honeypot === 'string' ? honeypot : '',
        }),
      })
      if (res.status === 429) {
        const seconds = Number(res.headers.get('Retry-After'))
        const wait =
          Number.isFinite(seconds) && seconds > 0 ? Math.min(Math.ceil(seconds), 86400) : 60
        setCooldown(wait)
        setRetryAt(Date.now() + wait * 1000)
      }
      if (!res.ok || !res.body) {
        throw new Error(
          res.status === 429
            ? 'Zu viele Anfragen. Bitte warte bis zum nächsten Versuch.'
            : res.status === 503
              ? 'Der KI-Chat ist noch nicht verfügbar. Bitte nutze das Kontaktformular.'
              : 'Die Anfrage konnte nicht beantwortet werden. Bitte versuche es später erneut.',
        )
      }
      for await (const event of readChatEvents(res.body)) {
        if (event.type !== 'delta') continue
        fullText += event.text
        if (performance.now() - lastPaint < 50) continue
        lastPaint = performance.now()
        setMessages((prev) =>
          prev.map((message, index) =>
            index === userIndex + 1 ? { ...message, text: fullText } : message,
          ),
        )
      }
      setMessages((prev) =>
        prev.map((message, index) =>
          index === userIndex + 1 ? { ...message, text: fullText, isStreaming: false } : message,
        ),
      )
    } catch (error) {
      setErrorMessage(
        abort.signal.aborted
          ? 'Antwort abgebrochen. Du kannst deine Frage erneut senden.'
          : error instanceof Error
            ? error.message
            : 'Verbindungsfehler. Bitte versuche es erneut.',
      )
      setMessages((prev) =>
        prev
          .map((message, index) =>
            index >= userIndex
              ? { ...message, isStreaming: false, excludeFromContext: true }
              : message,
          )
          .filter((message) => message.text !== ''),
      )
      setInputValue((current) => current || userText)
    } finally {
      window.clearTimeout(timeout)
      requestAbort.current = null
      setIsLoading(false)
      setMessages((previous) =>
        previous.length > 41 ? [previous[0], ...previous.slice(-40)] : previous,
      )
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
        try {
          window.sessionStorage.setItem(STORAGE_KEY, 'true')
        } catch {
          /* Keep the in-memory choice. */
        }
      }
    }
  }

  const handleConfirmDisclaimer = () => {
    setHasConfirmedDisclaimer(true)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(DISCLAIMER_KEY, CHAT_NOTICE_VERSION)
      } catch {
        /* Keep the in-memory choice. */
      }
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div
          id="easycode-ai-chat"
          role="region"
          aria-label="EasyCode AI Chat"
          aria-busy={isLoading}
          className="mb-4 w-[90vw] max-w-sm md:w-96 h-[500px] bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 motion-reduce:animate-none"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-accent to-accent-dark p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              <span className="font-display font-bold tracking-wide">EasyCode AI</span>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setMessages((previous) => previous.slice(0, 1))
                setInputValue('')
                setErrorMessage('')
              }}
              className="text-xs text-white disabled:opacity-50"
            >
              Verlauf löschen
            </button>
            <button
              aria-label="Chatfenster schließen"
              onClick={() => {
                requestAbort.current?.abort()
                setIsOpen(false)
              }}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 relative flex flex-col overflow-hidden">
            {!hasConfirmedDisclaimer && (
              <div className="absolute inset-0 z-20 bg-black/95 backdrop-blur-xs overflow-y-auto p-5 flex flex-col items-center justify-start text-center animate-in fade-in duration-300">
                <div className="p-4 bg-accent/10 rounded-full text-accent mb-6 ring-1 ring-accent/20">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Wichtiger Hinweis</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-8 payload-richtext">
                  Du nutzt einen KI-Assistenten. Deine Nachricht und der erforderliche
                  Gesprächsverlauf werden zur Antworterzeugung an OpenAI übermittelt. Antworten
                  können Fehler enthalten. Bitte keine sensiblen personenbezogenen Daten,
                  Gesundheitsdaten, Zugangsdaten oder vertraulichen Informationen eingeben. Mehr
                  Infos in der
                  <Link href="/datenschutz"> Datenschutzerklärung</Link>.
                </p>
                <button
                  onClick={handleConfirmDisclaimer}
                  className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Hinweis gelesen – Chat nutzen
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black bg-opacity-95 scroll-smooth chat-scroll">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                        urlTransform={(url) => {
                          if (url === 'mailto:info@the-easycode.eu') return url
                          try {
                            const parsed = new URL(url, window.location.origin)
                            if (
                              parsed.origin === window.location.origin &&
                              !parsed.username &&
                              !parsed.password &&
                              !parsed.search &&
                              !parsed.hash &&
                              (parsed.pathname.startsWith('/projekte/') ||
                                parsed.pathname === '/kontakt')
                            )
                              return parsed.href
                            if (
                              parsed.href ===
                              'https://www.linkedin.com/in/niklas-von-grzymala-a4aab0182/'
                            )
                              return parsed.href
                          } catch {
                            /* Invalid model-generated link. */
                          }
                          return ''
                        }}
                        components={{
                          img: () => null,
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
                              !node?.position || node.position.start.line === node.position.end.line
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
                          },
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
              {errorMessage && (
                <p role="alert" className="mb-2 text-sm text-gray-300">
                  {errorMessage}
                </p>
              )}
              {cooldown > 0 && (
                <p role="status" className="mb-2 text-xs text-gray-300">
                  Erneut senden in {cooldown} Sekunden.
                </p>
              )}
              {isLoading && (
                <button
                  type="button"
                  onClick={() => requestAbort.current?.abort()}
                  className="mb-2 text-sm text-accent"
                >
                  Antwort stoppen
                </button>
              )}
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
                  disabled={!hasConfirmedDisclaimer || isLoading || cooldown > 0}
                  maxLength={CHAT_MESSAGE_CHARS}
                  aria-label="Deine Nachricht an den KI-Assistenten"
                  placeholder={
                    hasConfirmedDisclaimer ? 'Frag mich etwas ...' : 'Bitte erst Hinweis bestätigen'
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
                    isLoading || cooldown > 0 || !inputValue.trim() || !hasConfirmedDisclaimer
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
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}

        {/* Pulse effect nur, wenn der Chat noch nie geöffnet wurde */}
        {!isOpen && !hasOpenedOnce && (
          <span className="absolute -z-10 w-full h-full rounded-full bg-accent opacity-40 animate-ping motion-reduce:animate-none" />
        )}
      </button>
    </div>
  )
}
