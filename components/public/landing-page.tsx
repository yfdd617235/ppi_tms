'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import PublicNavbar from './public-navbar'
import PublicFooter from './public-footer'
import ContactDialog from './contact-dialog'
import { useTranslation } from '@/lib/i18n/context'

const SERVICE_IMAGES = ['/global.jpg', '/lightbulb.jpg', '/project.jpg', '/trading.jpg']
const SERVICE_LINKS = ['/consulting', '/projects-bank', '/education', '/trading']

function HighlightText({ text }: { text: string }) {
  const parts = text.split(/<highlight>(.*?)<\/highlight>/)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <span key={i} className="font-semibold text-primary">{part}</span>
          : part
      )}
    </>
  )
}

export default function LandingPage() {
  const { t } = useTranslation()

  const SERVICES = [
    { title: t('cards.title1'), description: t('cards.message1') },
    { title: t('cards.title2'), description: t('cards.message2') },
    { title: t('cards.title3'), description: t('cards.message3') },
    { title: t('cards.title4'), description: t('cards.message4') },
  ]

  return (
    <div className="flex flex-col text-sm md:text-base lg:text-lg leading-relaxed">
      <PublicNavbar />

      {/* Hero */}
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
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-50 opacity-80 -z-10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="relative z-10 p-14 md:p-0 md:w-1/3 lg:w-1/4"
        >
          <Image
            src="/logoTCG.svg"
            alt="Panamerican Private Investments"
            width={700}
            height={700}
            className="w-full h-auto"
            style={{ height: 'auto' }}
            priority
          />
        </motion.div>
      </div>

      {/* We Make It Possible */}
      <motion.div
        className="py-10 md:py-20 bg-white px-6 flex justify-center"
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
            <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-6">{t('weMake.title')}</h2>
            <p className="text-gray-600 leading-relaxed">
              <HighlightText text={t('weMake.text1')} />
            </p>
            <br />
            <ContactDialog source="landing-page">
              <button className="flex items-center space-x-2 text-white hover:bg-primary/85 transition-colors bg-primary rounded-full px-6 py-3.5">
                <Mail className="w-5 h-5" />
                <span>{t('common.contactUs')}</span>
              </button>
            </ContactDialog>
          </div>
        </div>
      </motion.div>

      {/* About Us */}
      <motion.div
        className="py-10 md:py-20 bg-gray-50 px-6 lg:px-20 2xl:px-60"
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
              className="w-full max-w-sm rounded-2xl shadow-lg h-auto"
              style={{ height: 'auto' }}
            />
          </motion.div>
          <div className="md:w-3/4 space-y-6 text-gray-600 leading-relaxed">
            <p>{t('about.text1')}</p>
            <p>{t('about.text2')}</p>
            <p>{t('about.text3')}</p>
          </div>
        </div>
      </motion.div>

      {/* Services Cards */}
      <motion.div
        className="py-10 md:py-20 mx-auto w-full px-4 lg:px-20 2xl:px-40"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-center text-2xl md:text-4xl font-semibold text-gray-900 mb-10">
          {t('cards.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {SERVICES.map((service, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-shadow"
            >
              <Link href={SERVICE_LINKS[i]} className="flex flex-col h-full">
                <div className="relative h-64 w-full overflow-hidden rounded-t-2xl">
                  <Image
                    src={SERVICE_IMAGES[i]}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-between grow">
                  <div className="p-6">
                    <h5 className="text-gray-900 text-center font-semibold text-lg md:text-xl">
                      {service.title}
                    </h5>
                    <p className="mt-3 text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  </div>
                  <div className="flex justify-end items-end p-3">
                    <p className="text-primary text-sm font-medium">{t('cards.seemore')} →</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Global Presence */}
      <motion.div
        className="py-10 md:py-20 bg-gray-50 border-t border-gray-100 flex flex-col items-center px-6 text-center"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">{t('global.title')}</h2>
        <p className="max-w-3xl mx-auto mb-10 text-gray-600 leading-relaxed">{t('global.text')}</p>
        <div className="grid grid-cols-2 md:w-1/2 text-primary font-semibold">
          <div>
            <h3 className="text-4xl">30M+ USD</h3>
            <p className="text-gray-600 font-normal mt-1">{t('global.projects')}</p>
          </div>
          <div>
            <h3 className="text-4xl">6+ yrs</h3>
            <p className="text-gray-600 font-normal mt-1">{t('global.experience')}</p>
          </div>
        </div>
      </motion.div>

      <PublicFooter />
    </div>
  )
}

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
        style={{ width: 'auto', height: 'auto' }}
      />
    </div>
  )
}
