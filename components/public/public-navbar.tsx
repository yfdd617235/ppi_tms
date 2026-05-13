'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown } from 'lucide-react'
import ContactDialog from './contact-dialog'
import { useTranslation } from '@/lib/i18n/context'

export default function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showServices, setShowServices] = useState(false)
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { lang, setLang, t } = useTranslation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMouseEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setShowServices(true)
  }
  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => setShowServices(false), 150)
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        {/* Logo */}
        <Link href="/">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <Image
              src="/logoA.svg"
              alt="PPI"
              width={40}
              height={40}
              className="h-full w-full object-cover object-center"
              style={{ width: '100%', height: '100%' }}
              priority
            />
          </div>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-10 font-semibold text-[#00261C]">
          <Link href="/" className="hover:opacity-70 transition-opacity duration-300">
            {t('navbar.home')}
          </Link>

          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 hover:opacity-70 transition-opacity duration-300">
              {t('navbar.service')} <ChevronDown className="h-4 w-4" />
            </button>
            {showServices && (
              <div
                className="absolute left-0 mt-2 w-52 bg-[#00261C] text-white rounded-xl shadow-xl border border-white/10 overflow-hidden"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link href="/consulting" className="block px-4 py-2.5 hover:bg-white/10 text-sm font-medium transition-colors">
                  {t('navbar.services.consulting')}
                </Link>
                <Link href="/projects-bank" className="block px-4 py-2.5 hover:bg-white/10 text-sm font-medium transition-colors">
                  {t('navbar.services.projects')}
                </Link>
                <Link href="/education" className="block px-4 py-2.5 hover:bg-white/10 text-sm font-medium transition-colors">
                  {t('navbar.services.education')}
                </Link>
                <Link href="/trading" className="block px-4 py-2.5 hover:bg-white/10 text-sm font-medium transition-colors">
                  {t('navbar.services.software')}
                </Link>
              </div>
            )}
          </div>

          <ContactDialog source="navbar">
            <button className="hover:opacity-70 transition-opacity duration-300">
              {t('navbar.contact')}
            </button>
          </ContactDialog>
        </div>

        {/* Language switcher + Login button + Mobile toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center text-sm font-semibold text-[#00261C]">
            <button
              onClick={() => setLang('es')}
              className={`px-1.5 transition-opacity duration-200 ${lang === 'es' ? 'opacity-100' : 'opacity-35 hover:opacity-60'}`}
            >
              ES
            </button>
            <span className="opacity-25">|</span>
            <button
              onClick={() => setLang('en')}
              className={`px-1.5 transition-opacity duration-200 ${lang === 'en' ? 'opacity-100' : 'opacity-35 hover:opacity-60'}`}
            >
              EN
            </button>
          </div>
          <Link
            href="/login"
            className="text-sm font-semibold bg-[#00261C] text-white hover:bg-[#00261C]/85 transition-colors duration-300 rounded-full px-4 py-1.5"
          >
            Login
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden focus:outline-none text-[#00261C]"
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#00261C] text-white px-6 py-4 space-y-4">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="block hover:opacity-70 transition-opacity">
            {t('navbar.home')}
          </Link>
          <details className="group">
            <summary className="cursor-pointer hover:opacity-70 list-none flex items-center gap-1">
              {t('navbar.service')} <ChevronDown className="h-4 w-4" />
            </summary>
            <div className="pl-4 mt-2 space-y-2 text-sm">
              <Link href="/consulting" onClick={() => setIsMenuOpen(false)} className="block hover:opacity-70">{t('navbar.services.consulting')}</Link>
              <Link href="/projects-bank" onClick={() => setIsMenuOpen(false)} className="block hover:opacity-70">{t('navbar.services.projects')}</Link>
              <Link href="/education" onClick={() => setIsMenuOpen(false)} className="block hover:opacity-70">{t('navbar.services.education')}</Link>
              <Link href="/trading" onClick={() => setIsMenuOpen(false)} className="block hover:opacity-70">{t('navbar.services.software')}</Link>
            </div>
          </details>
          <ContactDialog source="navbar-mobile">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="block hover:opacity-70 transition-opacity w-full text-left"
            >
              {t('navbar.contact')}
            </button>
          </ContactDialog>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <button
              onClick={() => setLang('es')}
              className={`transition-opacity duration-200 ${lang === 'es' ? 'opacity-100' : 'opacity-40'}`}
            >
              ES
            </button>
            <span className="opacity-30">|</span>
            <button
              onClick={() => setLang('en')}
              className={`transition-opacity duration-200 ${lang === 'en' ? 'opacity-100' : 'opacity-40'}`}
            >
              EN
            </button>
          </div>
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="block text-center bg-white/10 text-white rounded-full px-4 py-2 hover:bg-white/20 transition-colors"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  )
}
