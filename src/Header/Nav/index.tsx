'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { Instagram, Linkedin } from '@/components/icons/brands'
import type { Header as HeaderType } from '@/payload-types'
import { Button, buttonVariants } from '@/components/ui/button'
import { Logo } from '@/components/Logo/Logo'
import { CMSLink } from '@/components/Link'
import { resolveCMSLinkHref } from '@/utilities/resolveCMSLinkHref'
import MenuSvg from '@/components/shared/Designs/svg/MenuSvg'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const items = (data?.navItems || []).flatMap(({ link }, index) => {
    const href = resolveCMSLinkHref(link)
    if (!href) return []
    const doc = link.reference?.value
    const label = link.label || (doc && typeof doc === 'object' ? doc.title : '') || 'Seite'
    const active =
      href.startsWith('/') &&
      (pathname === href || (href !== '/' && pathname.startsWith(`${href}/`)))
    return [{ link, href, label, active, index }]
  })

  useEffect(() => {
    if (!open || !dialog.current) return
    const element = dialog.current
    const previousOverflow = document.body.style.overflow
    element.showModal()
    document.body.style.overflow = 'hidden'
    const breakpoint = window.matchMedia('(min-width: 1024px)')
    const onResize = () => {
      if (breakpoint.matches) element.close()
    }
    breakpoint.addEventListener('change', onResize)
    return () => {
      breakpoint.removeEventListener('change', onResize)
      document.body.style.overflow = previousOverflow
      element.close()
    }
  }, [open])

  const close = () => dialog.current?.close()
  return (
    <>
      <nav className="hidden min-w-0 lg:block" aria-label="Hauptnavigation">
        <ul className="flex items-center gap-2 xl:gap-8">
          {items.map(({ link, label, active, index }) => (
            <li key={index} className="min-w-0">
              <CMSLink
                {...link}
                label={label}
                aria-current={active ? 'page' : undefined}
                className="header-link"
              />
            </li>
          ))}
        </ul>
      </nav>
      <div className="ml-auto hidden shrink-0 items-center gap-3 md:flex">
        <Link
          href="/suche"
          className={buttonVariants({ variant: 'secondary', className: 'header-search' })}
        >
          <Search aria-hidden="true" />
          Suche
        </Link>
        <Link href="/kontakt" className={buttonVariants({ variant: 'outline' })}>
          Kontakt
          <span className="rounded-full bg-accent p-1">
            <ArrowUpRight className="text-white size-4" aria-hidden="true" />
          </span>
        </Link>
      </div>
      <Button
        ref={trigger}
        type="button"
        variant="ghost"
        size="icon"
        className="ml-auto shrink-0 lg:hidden md:ml-0"
        onClick={() => setOpen(true)}
        aria-label="Menü öffnen"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-haspopup="dialog"
      >
        <MenuSvg openNavigation={false} />
      </Button>
      <dialog
        ref={dialog}
        id="mobile-navigation"
        className="mobile-navigation"
        aria-label="Navigation"
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return
          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex="0"]',
          )
          const first = controls[0]
          const last = controls[controls.length - 1]
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last?.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first?.focus()
          }
        }}
        onCancel={() => setOpen(false)}
        onClose={() => {
          setOpen(false)
          trigger.current?.focus({ preventScroll: true })
        }}
      >
        <div className="container flex min-h-full flex-col py-4">
          <div className="flex items-center justify-between gap-4 pb-6">
            <Link
              href="/"
              className="logo shrink-0"
              aria-label="The-EasyCode – Startseite"
              onClick={close}
            >
              <Logo />
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label="Menü schließen"
              aria-expanded="true"
              className="mobile-navigation__close"
              autoFocus
            >
              <X className="size-6" aria-hidden="true" />
            </Button>
          </div>
          <nav aria-label="Mobile Hauptnavigation">
            <ul>
              {items.map(({ link, label, active, index }) => (
                <li key={index}>
                  <CMSLink
                    {...link}
                    label={null}
                    aria-current={active ? 'page' : undefined}
                    onClick={close}
                    className={`mobile-navigation__link nav-main__link--1 ${active ? 'text-accent' : ''}`}
                  >
                    <span>{label}</span>
                    <ArrowUpRight aria-hidden="true" className="size-5 shrink-0" />
                  </CMSLink>
                </li>
              ))}
              <li>
                <Link
                  href="/suche"
                  onClick={close}
                  aria-current={pathname === '/suche' ? 'page' : undefined}
                  className="mobile-navigation__link"
                >
                  <span>Suche</span>
                  <Search aria-hidden="true" className="size-5 shrink-0" />
                </Link>
              </li>
            </ul>
          </nav>
          <div className="pt-10 pb-6">
            <p className="text-accent text-2xl font-medium mb-6">Jetzt durchstarten!</p>
            <Link
              href="/kontakt"
              onClick={close}
              className={buttonVariants({ variant: 'default' })}
            >
              Kontakt
              <span className="rounded-full bg-accent p-1">
                <ArrowUpRight className="size-4 text-white" aria-hidden="true" />
              </span>
            </Link>
            <div className="flex flex-wrap items-center gap-3 mt-10 text-foreground">
              <span className="mr-2 text-sm font-semibold">Folge uns</span>
              <a
                href="https://www.linkedin.com/company/the-easycode/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="LinkedIn (öffnet in neuem Tab)"
              >
                <Linkedin />
              </a>
              <a
                href="https://www.instagram.com/the_easycode/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Instagram (öffnet in neuem Tab)"
              >
                <Instagram />
              </a>
            </div>
          </div>
        </div>
      </dialog>
    </>
  )
}
