// src\components\Chat\AIChat.tsx
'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MessageSquare, Send, Sparkles, X, ShieldCheck, Trash2, LoaderCircle } from 'lucide-react'
import {
  CHAT_MESSAGE_CHARS,
  CHAT_CONSENT_VERSION,
  CHAT_CONSENT_MAX_AGE,
  parseChatConsent,
  type ChatConsent,
  compactChatHistory,
} from '@/utilities/chatProtocol'

import { readChatEvents } from '@/utilities/readChatEvents'

interface ChatMessage {
  role: 'user' | 'model'
  text: string
  isStreaming?: boolean
  excludeFromContext?: boolean
}

const CHAT_CONSENT_SUMMARY =
  'Ich willige ein, dass The-EasyCode meine Nachrichten und den Gesprächsverlauf zur Beantwortung meiner Fragen an OpenAI Ireland Ltd. übermittelt. Die Verarbeitung kann außerhalb der EU erfolgen.'
const CHAT_CONSENT_CHOICE = 'Die Einwilligung ist freiwillig und jederzeit im Chat widerrufbar.'
const CHAT_CONSENT_WARNING =
  'Bitte keine sensiblen Daten oder Daten anderer Personen eingeben. KI-Antworten können Fehler enthalten.'

const STORAGE_KEY = 'easycode-ai-chat-opened'
const CONSENT_KEY = 'easycode-ai-chat-consent'
function storedConsent() {
  try {
    return parseChatConsent(JSON.parse(storedSetting('sessionStorage', CONSENT_KEY) || 'null'))
  } catch {
    return null
  }
}
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
  const [consent, setConsent] = useState<ChatConsent | null>(storedConsent)
  const consentRef = useRef(consent)
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

  const messagesRef = useRef<HTMLDivElement>(null)
  const followLatest = useRef(true)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const consentHeadingRef = useRef<HTMLHeadingElement>(null)
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

  useEffect(() => {
    const list = messagesRef.current
    if (isOpen && list && followLatest.current) list.scrollTop = list.scrollHeight
  }, [messages, isOpen])

  // ✅ NEW: Fokus setzen, sobald der Chat geöffnet ist
  useEffect(() => {
    if (!isOpen) return
    // nach dem Render fokussieren
    const frame = requestAnimationFrame(() => {
      const target = consent ? inputRef.current : consentHeadingRef.current
      target?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [isOpen, consent])

  const closeChat = () => {
    requestAbort.current?.abort()
    setIsOpen(false)
    launcherRef.current?.focus({ preventScroll: true })
  }

  const handleConsent = () => {
    const accepted: ChatConsent = {
      accepted: true,
      version: CHAT_CONSENT_VERSION,
      acceptedAt: Date.now(),
      id: window.crypto.randomUUID(),
    }
    consentRef.current = accepted
    setConsent(accepted)
    try {
      window.sessionStorage.setItem(CONSENT_KEY, JSON.stringify(accepted))
      window.localStorage.removeItem('easycode-ai-chat-disclaimer-confirmed')
    } catch {
      /* Consent remains valid in memory if browser storage is unavailable. */
    }
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleWithdrawConsent = useCallback(() => {
    consentRef.current = null
    setConsent(null)
    requestAbort.current?.abort()
    setMessages((previous) => previous.slice(0, 1))
    setInputValue('')
    setErrorMessage('')
    try {
      window.sessionStorage.removeItem(CONSENT_KEY)
    } catch {
      /* The in-memory withdrawal still blocks further requests. */
    }
  }, [])

  useEffect(() => {
    if (!consent) {
      try {
        window.sessionStorage.removeItem(CONSENT_KEY)
      } catch {
        /* Browser storage may be unavailable. */
      }
      return
    }
    const timer = window.setTimeout(
      handleWithdrawConsent,
      Math.max(0, consent.acceptedAt + CHAT_CONSENT_MAX_AGE - Date.now()),
    )
    return () => window.clearTimeout(timer)
  }, [consent, handleWithdrawConsent])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue.trim() || requestAbort.current || !consent || Date.now() < retryAt) return
    const activeConsent = parseChatConsent(consentRef.current)
    if (!activeConsent) {
      handleWithdrawConsent()
      return
    }
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
    followLatest.current = true
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
          consent: activeConsent,
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
        if (consentRef.current?.id !== activeConsent.id || abort.signal.aborted) return
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
      if (consentRef.current?.id !== activeConsent.id || abort.signal.aborted) return
      setMessages((prev) =>
        prev.map((message, index) =>
          index === userIndex + 1 ? { ...message, text: fullText, isStreaming: false } : message,
        ),
      )
    } catch (error) {
      if (consentRef.current?.id !== activeConsent.id) return
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

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] z-50 flex flex-col items-end">
      {isOpen && (
        <div
          id="easycode-ai-chat"
          role="region"
          aria-label="EasyCode AI Chat"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation()
              closeChat()
            }
          }}
          className="mb-4 w-[calc(100vw-2rem)] max-w-sm md:w-96 h-[min(36rem,calc(100dvh-7rem-env(safe-area-inset-bottom)))] bg-black border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-200 motion-reduce:animate-none"
        >
          {/* Header */}
          <div className="shrink-0 bg-secondary-background border-b border-white/10 p-3 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              <span className="font-display font-bold tracking-wide">EasyCode AI</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Verlauf löschen"
                disabled={isLoading || messages.length <= 1}
                onClick={() => {
                  setMessages((previous) => previous.slice(0, 1))
                  setInputValue('')
                  setErrorMessage('')
                  inputRef.current?.focus()
                }}
                className="group relative flex size-11 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-0 top-full z-30 mt-2 whitespace-nowrap rounded-lg border border-white/10 bg-secondary-background px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-disabled:invisible"
                >
                  Verlauf löschen
                </span>
              </button>
              <button
                type="button"
                aria-label="Chatfenster schließen"
                onClick={closeChat}
                title="Chatfenster schließen"
                className="flex size-11 items-center justify-center rounded-xl text-white/80 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 relative flex flex-col overflow-hidden">
            {!consent && (
              <div className="absolute inset-0 z-20 bg-black overflow-y-auto overscroll-contain p-5 flex flex-col items-center justify-start text-center">
                <div className="p-3 bg-accent/10 rounded-full text-accent mb-4 ring-1 ring-accent/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3
                  ref={consentHeadingRef}
                  tabIndex={-1}
                  className="text-xl font-bold text-white mb-4 outline-hidden"
                >
                  KI-Chat freiwillig nutzen
                </h3>
                <div className="text-sm text-gray-300 leading-relaxed space-y-3 mb-5 payload-richtext">
                  <p>{CHAT_CONSENT_SUMMARY}</p>
                  <p>{CHAT_CONSENT_CHOICE}</p>
                  <p className="text-xs text-gray-400">{CHAT_CONSENT_WARNING}</p>
                  <p>
                    <a
                      href="/datenschutz"
                      aria-label="Datenschutz zum KI-Chat (neuer Tab)"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline underline-offset-4"
                    >
                      Datenschutz zum KI-Chat
                    </a>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConsent}
                  className="w-full shrink-0 bg-accent-contrast hover:bg-accent-contrast/90 text-white font-bold py-3 px-6 rounded-xl transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Einwilligen und Chat nutzen
                </button>
                <button
                  type="button"
                  onClick={closeChat}
                  className="mt-3 w-full shrink-0 rounded-xl border border-white/20 py-3 px-6 text-sm text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Ohne KI-Chat fortfahren
                </button>
              </div>
            )}
            <div
              ref={messagesRef}
              role="log"
              aria-label="Chatverlauf"
              aria-live="polite"
              aria-busy={isLoading}
              inert={!consent}
              onScroll={(event) => {
                const list = event.currentTarget
                followLatest.current = list.scrollHeight - list.scrollTop - list.clientHeight < 64
              }}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-black chat-scroll"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`min-w-0 max-w-[90%] p-3 rounded-2xl text-sm leading-relaxed [overflow-wrap:anywhere]
												${
                          msg.role === 'user'
                            ? 'bg-accent-contrast text-white rounded-br-sm'
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
                            <strong className="font-semibold">{children}</strong>
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
                      <div
                        aria-hidden="true"
                        className="inline-flex gap-1 justify-start items-center motion-reduce:[&>div]:animate-none"
                      >
                        <div className="size-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="size-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="size-2 bg-accent rounded-full animate-bounce" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {consent && (
              <button
                type="button"
                onClick={handleWithdrawConsent}
                className="shrink-0 min-h-11 bg-secondary-background px-4 py-2 text-xs text-gray-300 underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-accent"
              >
                Einwilligung widerrufen
              </button>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 p-4 bg-secondary-background border-t border-white/10"
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
                  disabled={!consent || isLoading || cooldown > 0}
                  maxLength={CHAT_MESSAGE_CHARS}
                  enterKeyHint="send"
                  aria-label="Deine Nachricht an den KI-Assistenten"
                  placeholder={consent ? 'Frag mich etwas ...' : 'Bitte erst einwilligen'}
                  className="w-full min-w-0 bg-background/50 border border-white/20 rounded-xl pl-4 pr-12 py-3 text-base text-foreground focus:outline-hidden focus:border-accent focus:ring-2 focus:ring-accent transition-colors placeholder:text-gray-400 disabled:opacity-50"
                />
                {inputValue.length > 800 && (
                  <div className="absolute -top-4 right-0 text-[10px] text-gray-500 font-mono">
                    {inputValue.length}/{CHAT_MESSAGE_CHARS}
                  </div>
                )}
                <button
                  type="submit"
                  aria-label="Nachricht senden"
                  title={isLoading ? 'Antwort wird erstellt' : 'Nachricht senden'}
                  disabled={isLoading || cooldown > 0 || !inputValue.trim() || !consent}
                  className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-accent transition-colors hover:bg-accent/10 hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <LoaderCircle
                      className="size-4 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  ) : (
                    <Send className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        ref={launcherRef}
        onClick={handleToggleOpen}
        aria-label={isOpen ? 'KI-Chat schließen' : 'KI-Chat öffnen'}
        aria-expanded={isOpen}
        aria-controls="easycode-ai-chat"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-accent-contrast hover:bg-accent-contrast/90 text-white shadow-lg shadow-accent/20 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  )
}
