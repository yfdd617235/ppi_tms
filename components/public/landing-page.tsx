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
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-50/80 -z-10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="relative z-10 flex flex-col items-center p-4 md:p-0 w-5/6 sm:w-3/4 md:w-3/5 lg:w-1/2 xl:w-2/5"
        >
          <Image
            src="/logoTCG.svg"
            alt="Panamerican Private Investments"
            width={700}
            height={700}
            className="w-full h-auto"
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
            <h2 className="text-2xl md:text-4xl font-bold text-primary mb-6">We make it possible</h2>
            <p className="text-justify">
              We turn your ideas into real projects through a structured process. Following the key
              stages of professional project management{' '}
              <span className="font-bold text-primary">
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
        className="py-10 md:py-20 bg-gray-50 text-black px-6 lg:px-20 2xl:px-60"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col md:flex-row justify-center items-center gap-10">
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="shrink-0 md:w-1/4 flex justify-center items-center"
          >
            <Image
              src="/weare.jpg"
              alt="Who we are"
              width={400}
              height={400}
              className="w-full max-w-sm rounded-2xl shadow-lg"
              style={{ height: 'auto' }}
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
        <h2 className="text-center text-2xl md:text-4xl font-bold text-gray-900 mb-6">
          Our Services
        </h2>
        <br />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {SERVICES.map((service) => (
            <motion.div
              key={service.href}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow"
            >
              <Link href={service.href} className="flex flex-col h-full">
                <Image
                  src={service.img}
                  alt={service.title}
                  width={400}
                  height={256}
                  className="w-full h-64 object-cover rounded-t-2xl"
                  style={{ width: '100%' }}
                />
                <div className="flex flex-col justify-between grow">
                  <div className="p-6">
                    <h5 className="text-gray-900 text-center font-bold text-lg md:text-xl">
                      {service.title}
                    </h5>
                    <p className="mt-3 text-left text-gray-600">{service.description}</p>
                  </div>
                  <div className="flex justify-end items-end p-2">
                    <p className="text-primary font-extralight">See more</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Making it Real */}
      <motion.div
        className="py-10 md:py-20 bg-white border-t border-gray-100 flex flex-col items-center text-black px-6 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Making it Real</h2>
        <p className="max-w-3xl mx-auto mb-10 text-gray-600">
          We focus on transforming ideas into tangible and measurable results. Through strategy,
          collaboration, and precision, we bring every project to life.
        </p>
        <div className="grid grid-cols-2 md:w-1/2 text-primary font-semibold">
          <div>
            <h3 className="text-4xl">30M+ USD</h3>
            <p className="text-gray-500 font-normal mt-1">Projects Managed</p>
          </div>
          <div>
            <h3 className="text-4xl">5+ yrs</h3>
            <p className="text-gray-500 font-normal mt-1">Years of Experience</p>
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
        style={{ width: '100%', height: 'auto' }}
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
      className="flex items-center space-x-2 text-white hover:bg-primary/85 transition-colors bg-primary rounded-full px-6 py-3.5"
    >
      <Mail className="w-5 h-5" />
      <span>{copied ? 'Copied!' : 'Contact Us'}</span>
    </button>
  )
}
