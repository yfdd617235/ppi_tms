# landingOld — Código original de la landing page

Guarda el estado original de todos los archivos públicos antes de la modernización.
Para revertir: reemplaza el contenido de cada archivo con el código de la sección correspondiente.

---

## `components/public/public-navbar.tsx`

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showServices, setShowServices] = useState(false)
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToFooter = () => {
    document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  const handleMouseEnter = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current)
    setShowServices(true)
  }
  const handleMouseLeave = () => {
    closeTimeout.current = setTimeout(() => setShowServices(false), 150)
  }

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ${
        isScrolled ? 'bg-black/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 md:px-6">
        {/* Logo */}
        <Link href="/">
          <div className="h-10 w-10 overflow-hidden bg-green-950 rounded-full">
            <Image
              src="/logoTCS.png"
              alt="PPI"
              width={40}
              height={40}
              className="h-full w-full object-cover object-center scale-75"
            />
          </div>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center space-x-10 text-green-500 font-semibold">
          <Link href="/" className="hover:text-green-300 transition-colors duration-300">
            Home
          </Link>

          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 hover:text-green-300 transition-colors duration-300">
              Services <ChevronDown className="h-4 w-4" />
            </button>
            {showServices && (
              <div
                className="absolute left-0 mt-2 w-52 bg-white text-green-700 rounded-lg shadow-lg overflow-hidden"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Link href="/consulting" className="block px-4 py-2 hover:bg-green-100 text-sm font-medium">
                  Consulting
                </Link>
                <Link href="/projects-bank" className="block px-4 py-2 hover:bg-green-100 text-sm font-medium">
                  Projects Bank
                </Link>
                <Link href="/education" className="block px-4 py-2 hover:bg-green-100 text-sm font-medium">
                  Education
                </Link>
                <Link href="/trading" className="block px-4 py-2 hover:bg-green-100 text-sm font-medium">
                  Software Development
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={scrollToFooter}
            className="hover:text-green-300 transition-colors duration-300"
          >
            Contact
          </button>
        </div>

        {/* Login button + Mobile toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold border border-green-500 text-green-400 hover:bg-green-500 hover:text-black transition-colors duration-300 rounded-full px-4 py-1.5"
          >
            Login
          </Link>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-green-500 focus:outline-none"
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 text-white px-6 py-4 space-y-4">
          <Link href="/" onClick={() => setIsMenuOpen(false)} className="block hover:text-green-300 transition-colors">
            Home
          </Link>
          <details className="group">
            <summary className="cursor-pointer hover:text-green-300 list-none flex items-center gap-1">
              Services <ChevronDown className="h-4 w-4" />
            </summary>
            <div className="pl-4 mt-2 space-y-2 text-sm">
              <Link href="/consulting" onClick={() => setIsMenuOpen(false)} className="block hover:text-green-300">Consulting</Link>
              <Link href="/projects-bank" onClick={() => setIsMenuOpen(false)} className="block hover:text-green-300">Projects Bank</Link>
              <Link href="/education" onClick={() => setIsMenuOpen(false)} className="block hover:text-green-300">Education</Link>
              <Link href="/trading" onClick={() => setIsMenuOpen(false)} className="block hover:text-green-300">Software Development</Link>
            </div>
          </details>
          <button onClick={scrollToFooter} className="block hover:text-green-300 transition-colors w-full text-left">
            Contact
          </button>
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="block text-center border border-green-500 text-green-400 rounded-full px-4 py-2 hover:bg-green-500 hover:text-black transition-colors"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  )
}
```

---

## `components/public/landing-page.tsx`

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import PublicNavbar from './public-navbar'
import PublicFooter from './public-footer'

export default function LandingPage() {
  return (
    <div className="flex flex-col text-sm md:text-base lg:text-lg leading-relaxed">
      <PublicNavbar />

      {/* Hero Section */}
      <div className="relative h-screen w-full flex justify-center items-center overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover -z-20"
          src="/landscape.mp4"
          poster="/blackscreen.png"
          muted
          autoPlay
          loop
          playsInline
        />
        <div className="absolute top-0 left-0 w-full h-full bg-green-950 opacity-80 -z-10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="relative z-10 p-14 md:p-0 md:w-1/4 lg:w-1/6"
        >
          <Image
            src="/logoTC.png"
            alt="Panamerican Private Investments"
            width={300}
            height={300}
            className="max-w-full max-h-full"
            priority
          />
        </motion.div>
      </div>

      {/* We Make It Possible */}
      <motion.div
        className="py-10 md:py-20 bg-white text-black px-6 flex justify-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20">
          <div className="md:w-1/2 flex justify-center">
            <ScrollImage />
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-bold text-green-900 mb-6">We make it possible</h2>
            <p className="text-justify">
              We turn your ideas into real projects through a structured process. Following the key
              stages of professional project management{' '}
              <span className="font-bold text-green-900">
                —Evaluation, Planning, Execution, and Control—
              </span>{' '}
              we transform your vision into tangible results. We analyze and assess potential, design
              strategies, implement solutions, and accompany you until your project is fully operational.
            </p>
            <br />
            <CopyEmailButton />
          </div>
        </div>
      </motion.div>

      {/* About Us */}
      <motion.div
        className="py-10 md:py-20 bg-gradient-to-br from-[#DDEEE0] to-white text-black px-6 lg:px-20 2xl:px-60"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col md:flex-row justify-center items-center gap-10">
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 md:w-1/4 flex justify-center items-center"
          >
            <Image
              src="/weare.jpg"
              alt="Who we are"
              width={400}
              height={400}
              className="w-full max-w-sm rounded-2xl shadow-lg"
            />
          </motion.div>
          <div className="md:w-3/4 space-y-6">
            <p className="text-justify">
              We are a dedicated team of professionals committed to driving growth and innovation in
              business. Our mission is to provide comprehensive solutions in business consulting,
              software development, and project management.
            </p>
            <p className="text-justify">
              We focus on building strong relationships with our clients, understanding their unique
              needs, and crafting personalized strategies that deliver sustainable results. With
              expertise in project evaluation and international trade, we ensure our clients receive
              the support they need to thrive in a competitive environment.
            </p>
            <p className="text-justify">
              We believe in collaboration and transparency, working closely with our partners to
              achieve common goals while maximizing opportunities at every step.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Services Cards */}
      <motion.div
        className="py-10 md:py-20 mx-auto w-full px-4 lg:px-20 2xl:px-40 text-black"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-center text-2xl md:text-4xl font-bold text-green-900 mb-6">
          Our Services
        </h2>
        <br />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {SERVICES.map((service) => (
            <motion.div
              key={service.href}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full shadow-lg shadow-[#DDEEE0] rounded-lg bg-white hover:bg-green-50"
            >
              <Link href={service.href} className="flex flex-col h-full">
                <Image
                  src={service.img}
                  alt={service.title}
                  width={400}
                  height={256}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="flex flex-col justify-between flex-grow">
                  <div className="p-6">
                    <h5 className="text-green-900 text-center font-bold text-lg md:text-xl">
                      {service.title}
                    </h5>
                    <p className="mt-3 text-left">{service.description}</p>
                  </div>
                  <div className="flex justify-end items-end p-2">
                    <p className="text-green-500 font-extralight">See more</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Global Presence */}
      <motion.div
        className="py-10 md:py-20 bg-gradient-to-tl from-[#DDEEE0] to-white flex flex-col items-center text-black px-6 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">Making it Real</h2>
        <p className="max-w-3xl mx-auto mb-10">
          We focus on transforming ideas into tangible and measurable results. Through strategy,
          collaboration, and precision, we bring every project to life.
        </p>
        <div className="grid grid-cols-2 md:w-1/2 text-green-900 font-semibold">
          <div>
            <h3 className="text-4xl">30M+ USD</h3>
            <p>Projects Managed</p>
          </div>
          <div>
            <h3 className="text-4xl">5+ yrs</h3>
            <p>Years of Experience</p>
          </div>
        </div>
      </motion.div>

      <PublicFooter />
    </div>
  )
}

const SERVICES = [
  {
    href: '/consulting',
    img: '/global.jpg',
    title: 'Corporative Consulting',
    description: 'We support the full investment cycle, from evaluation to project execution.',
  },
  {
    href: '/projects-bank',
    img: '/lightbulb.jpg',
    title: 'Projects Portfolio and Private Equity',
    description: 'We evaluate high-potential projects and invest in those with the strongest prospects.',
  },
  {
    href: '/education',
    img: '/project.jpg',
    title: 'Training',
    description: 'We provide advisory and training in strategy, financial markets, and risk management.',
  },
  {
    href: '/trading',
    img: '/trading.jpg',
    title: 'Software Development',
    description:
      'We create customized technology tools for automated investment and advisory, optimizing financial and operational processes.',
  },
]

function ScrollImage() {
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.8 }
    )
    if (imgRef.current) observer.observe(imgRef.current)
    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current)
    }
  }, [])

  return (
    <div ref={imgRef} className="flex justify-center items-center transition-all duration-700 ease-in-out">
      <Image
        src={isVisible ? '/lightbulbgears3.jpeg' : '/lightbulbgears2.jpeg'}
        alt="Project Realization"
        width={500}
        height={400}
        className="max-w-full h-auto transition-opacity duration-700 ease-in-out"
      />
    </div>
  )
}

function CopyEmailButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText('director@panamericanprivateinvestments.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center space-x-2 text-white hover:text-green-500 transition-colors bg-green-900 rounded-full px-6 py-3.5"
    >
      <Mail className="w-5 h-5" />
      <span>{copied ? 'Copied!' : 'Contact Us'}</span>
    </button>
  )
}
```

---

## `components/public/public-footer.tsx`

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, MessageCircle } from 'lucide-react'

export default function PublicFooter() {
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText('director@panamericanprivateinvestments.com')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <footer id="footer" className="bg-black text-white pt-20 pb-2 px-6 lg:px-20 2xl:px-60">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start text-left">

        {/* Logo */}
        <div className="flex flex-col items-center">
          <Image
            src="/logoTC.png"
            alt="Panamerican Private Investments"
            width={208}
            height={208}
            className="h-52 w-auto object-center"
          />
        </div>

        {/* Services links */}
        <div className="flex flex-col items-start md:items-center px-4">
          <div className="flex flex-col space-y-2 text-green-200">
            <h3 className="text-white font-bold text-lg md:text-xl pb-3">Our Services</h3>
            <Link href="/consulting" className="hover:text-green-500 transition-colors">Corporative Consulting</Link>
            <Link href="/projects-bank" className="hover:text-green-500 transition-colors">Projects Portfolio and Private Equity</Link>
            <Link href="/education" className="hover:text-green-500 transition-colors">Training</Link>
            <Link href="/trading" className="hover:text-green-500 transition-colors">Software Development</Link>
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col items-start md:items-end space-y-3 px-4 text-sm md:text-base">
          <h5 className="font-bold text-white mb-1 text-lg md:text-xl">Contact Us</h5>
          <p className="text-gray-300 text-left md:text-right">
            Cra 42 C #3 Sur 81, Torre 1, Piso 15<br />
            CE Milla de Oro, Medellín, Colombia
          </p>
          <button
            onClick={copyEmail}
            className="flex items-center space-x-2 text-green-200 hover:text-green-500 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>{copied ? 'Copied!' : 'Email'}</span>
          </button>
          <a
            href="https://www.linkedin.com/company/panamerican-private-investments/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-green-200 hover:text-green-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M22.23 0H1.77C.792 0 0 .774 0 1.728v20.543C0 23.225.792 24 1.77 24h20.46c.978 0 1.77-.774 1.77-1.729V1.728C24 .774 23.208 0 22.23 0zM7.12 20.452H3.56V9h3.56v11.452zm-1.78-13.01a2.07 2.07 0 11-.001-4.138 2.07 2.07 0 010 4.138zm15.18 13.01h-3.56v-5.941c0-1.417-.028-3.245-1.975-3.245-1.976 0-2.278 1.543-2.278 3.14v6.045h-3.56V9h3.42v1.563h.049c.476-.9 1.636-1.846 3.368-1.846 3.602 0 4.267 2.369 4.267 5.452v6.283z"/></svg>
            <span>LinkedIn</span>
          </a>
          <a
            href="https://wa.me/+573006190721"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-green-200 hover:text-green-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="mt-20">
        <h3 className="text-gray-500 font-bold text-sm">We Make It Possible</h3>
        <p className="text-gray-500 text-sm">
          From vision to execution — we transform ideas into tangible results through strategy, innovation, and excellence.
        </p>
      </div>

      <div className="my-2 border-t border-gray-700 pt-4 text-center text-gray-500 text-xs">
        &copy; 2025 Panamerican Private Investments. All rights reserved.
      </div>
    </footer>
  )
}
```

---

## `app/(public)/consulting/page.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import { TrendingUp, FolderKanban, Settings, Bot, Globe, Mail } from 'lucide-react'

const SERVICES = [
  { icon: TrendingUp, title: 'Treasury Management', description: 'We optimize cash flow, financial planning, and resource management to maximize liquidity and profitability.' },
  { icon: FolderKanban, title: 'Subrogated Project Administration', description: 'We take on the operational and administrative management of strategic projects, ensuring transparency, compliance, and efficiency at every stage.' },
  { icon: Settings, title: 'Process Optimization', description: 'We analyze and redesign key processes to reduce costs, eliminate bottlenecks, and improve overall productivity.' },
  { icon: Bot, title: 'Process Automation', description: 'We implement digital solutions integrating artificial intelligence and automation to minimize repetitive tasks and improve accuracy.' },
  { icon: Globe, title: 'Offshore Structuring Advisory', description: 'We provide specialized advice for designing secure, efficient, and compliant international corporate structures.' },
]

function CopyEmailButton() {
  const handleCopy = () => {
    navigator.clipboard.writeText('director@panamericanprivateinvestments.com')
    alert('Email copied to clipboard 📋')
  }
  return (
    <button onClick={handleCopy} className="flex items-center space-x-2 text-white hover:text-green-500 transition-colors bg-green-900 rounded-full px-6 py-3.5">
      <Mail className="w-5 h-5" />
      <span>Contact Us</span>
    </button>
  )
}

export default function ConsultingPage() {
  return (
    <div className="min-h-screen bg-white text-green-900">
      <section className="py-10 pt-24 md:py-24 px-6 bg-gradient-to-br from-[#DDEEE0] to-white text-center">
        <motion.h1 className="text-4xl md:text-5xl font-bold mb-6 text-green-900" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>Corporate Consulting</motion.h1>
        <motion.p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>We design financial and operational strategies that drive efficiency, sustainability, and global expansion for your company.</motion.p>
      </section>
      <section className="py-10 md:py-16 px-6 md:px-16 bg-white">
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <motion.div key={index} className="p-8 border rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-2 bg-white" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }}>
              <service.icon className="text-green-700 w-10 h-10 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="py-10 md:py-20 px-6 md:px-16 bg-gradient-to-tl from-[#DDEEE0] to-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/global.jpg" alt="Corporate consulting" className="rounded-2xl shadow-lg w-full" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl font-bold text-green-900 mb-4">Long-Term Strategic Support</h2>
            <p className="text-gray-700 leading-relaxed mb-6">At Panamerican Private Investments, we offer comprehensive solutions that go beyond traditional consulting. We focus on sustainability, confidentiality, and operational efficiency to build solid and profitable corporate structures.</p>
            <CopyEmailButton />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
```

---

## `app/(public)/projects-bank/page.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import { Search, ClipboardList, Settings, BarChart3, Mail } from 'lucide-react'

const STEPS = [
  { icon: Search, title: 'Evaluation', description: 'We analyze the feasibility and potential of each idea, considering technical, financial, and market factors.' },
  { icon: ClipboardList, title: 'Planning', description: 'We design strategies, establish schedules, budgets, and resources needed to ensure project success.' },
  { icon: Settings, title: 'Execution', description: 'We implement designed solutions, overseeing every stage to ensure quality, compliance, and efficiency.' },
  { icon: BarChart3, title: 'Control', description: 'We monitor project progress, assess results, and apply continuous improvements to maximize impact.' },
]

function CopyEmailButton() {
  const handleCopy = () => {
    navigator.clipboard.writeText('director@panamericanprivateinvestments.com')
    alert('Email copied to clipboard 📋')
  }
  return (
    <button onClick={handleCopy} className="flex items-center space-x-2 text-white hover:text-green-500 transition-colors bg-green-900 rounded-full px-6 py-3.5">
      <Mail className="w-5 h-5" />
      <span>Contact Us</span>
    </button>
  )
}

export default function ProjectsBankPage() {
  return (
    <div className="min-h-screen bg-white text-green-900">
      <section className="py-10 pt-24 md:py-24 px-6 bg-gradient-to-br from-[#DDEEE0] to-white text-center">
        <motion.h1 className="text-4xl md:text-5xl font-bold mb-6 text-green-900" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>Projects Bank and Private Equity</motion.h1>
        <motion.p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>We turn your ideas into real projects through a structured process.</motion.p>
      </section>
      <section className="py-10 md:py-16 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 className="text-3xl font-bold text-green-900 text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8 }}>Our Structured Process</motion.h2>
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <motion.div key={index} className="flex flex-col items-center text-center p-6 border rounded-2xl shadow-md bg-[#F9FBFA] hover:shadow-lg transition-transform hover:-translate-y-2" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.2 }} viewport={{ once: true }}>
                <step.icon className="text-green-700 w-10 h-10 mb-3" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{index + 1}. {step.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-10 md:py-20 px-6 md:px-16 bg-gradient-to-tl from-[#DDEEE0] to-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/lightbulb.jpg" alt="Project management" className="rounded-2xl shadow-lg w-full" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl font-bold text-green-900 mb-4">From Concept to Reality</h2>
            <p className="text-gray-700 leading-relaxed mb-6">At Panamerican Private Investments, we drive projects from conception to completion.</p>
            <CopyEmailButton />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
```

---

## `app/(public)/education/page.tsx`

```tsx
'use client'

import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Users, Clock } from 'lucide-react'

const FEATURES = [
  { icon: GraduationCap, title: 'Professional Training', description: 'Programs designed to develop financial, strategic, and leadership skills.' },
  { icon: BookOpen, title: 'Structured Programs', description: 'Progressive modules that combine applied theory and real-world business cases.' },
  { icon: Users, title: 'Expert Instructors', description: 'Professionals with international experience and practical expertise in corporate management.' },
  { icon: Clock, title: 'Coming Soon', description: 'We are working on the courses to make them available to the public very soon. Stay tuned for updates!' },
]

export default function EducationPage() {
  return (
    <div className="min-h-screen bg-white text-green-900">
      <section className="py-10 pt-24 md:py-24 px-6 bg-gradient-to-br from-[#DDEEE0] to-white text-center">
        <motion.h1 className="text-4xl md:text-5xl font-bold mb-6 text-green-900" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>Education and Professional Training</motion.h1>
        <motion.p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-700" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }}>We are building a specialized educational platform to share valuable knowledge in finance, investment, and business management.</motion.p>
      </section>
      <section className="py-10 md:py-16 px-6 md:px-16 bg-white">
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <motion.div key={index} className="p-8 border rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-2 bg-white" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.1 }} viewport={{ once: true }}>
              <feature.icon className="text-green-700 w-10 h-10 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="py-10 md:py-20 px-6 md:px-16 bg-gradient-to-tl from-[#DDEEE0] to-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/project.jpg" alt="Corporate education" className="rounded-2xl shadow-lg w-full" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl font-bold text-green-900 mb-4">Educational Platform in Development</h2>
            <p className="text-gray-700 leading-relaxed mb-6">Panamerican Private Investments aims to strengthen the financial and business training of our clients and partners.</p>
            <p className="text-gray-600 italic">Our courses will soon be available online and in-person.</p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
```

---

## `app/(public)/trading/page.tsx`

```tsx
'use client'

import { Mail } from 'lucide-react'

function CopyEmailButton() {
  const handleCopy = () => {
    navigator.clipboard.writeText('director@panamericanprivateinvestments.com')
    alert('Email copied to clipboard 📋')
  }
  return (
    <button onClick={handleCopy} className="flex items-center space-x-2 text-white hover:text-green-500 transition-colors bg-green-900 rounded-full px-6 py-3.5">
      <Mail className="w-5 h-5" />
      <span>Contact Us</span>
    </button>
  )
}

const VIDEOS = [
  { id: 1, src: 'https://www.youtube.com/embed/m2q0tIxgevQ', title: 'Trading 525 USD in two minutes. SP500 futures' },
  { id: 2, src: 'https://www.youtube.com/embed/5x9nIEBr8QA', title: 'Premarket Analysis' },
  { id: 3, src: 'https://www.youtube.com/embed/gWySnIDaWUQ', title: 'Fibonacci Retracement' },
  { id: 4, src: 'https://www.youtube.com/embed/bpEew1Jbc3A', title: 'Interview with the CEO' },
]

export default function TradingPage() {
  return (
    <div className="text-black text-sm md:text-base lg:text-lg leading-relaxed">
      <div className="mx-auto py-10 pt-24 md:py-24 px-4 lg:px-20 2xl:px-60 text-green-200 bg-black">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Disclaimer</h1>
        <p className="text-justify">The information provided on this website is purely informational and educational in nature...</p>
      </div>
      <div className="py-10 md:py-20 bg-gradient-to-br from-[#DDEEE0] to-white">
        <div className="flex flex-col md:flex-row justify-center items-center mx-auto px-4 lg:px-20 2xl:px-60 gap-10">
          <div className="flex-shrink-0 md:w-1/4 flex justify-center items-center">
            <h2 className="text-2xl md:text-3xl text-green-900 font-bold text-center">What is Trading?</h2>
          </div>
          <div className="md:w-3/4">
            <p className="text-justify">Trading refers to the act of buying and selling financial assets...</p>
          </div>
        </div>
      </div>
      <div className="mx-auto py-10 md:py-20 px-4 lg:px-20 2xl:px-60">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {VIDEOS.map((video) => (
            <div key={video.id} className="h-full shadow-lg shadow-[#DDEEE0] rounded-lg hover:bg-green-50">
              <iframe src={video.src} title={video.title} className="w-full h-64 rounded-t-lg" allowFullScreen />
              <div className="p-6"><p className="text-green-900 font-bold text-center">{video.title}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```
