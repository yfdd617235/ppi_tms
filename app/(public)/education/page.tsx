'use client'

import { motion } from 'framer-motion'
import { GraduationCap, BookOpen, Users, Clock } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/context'

const ICONS = [GraduationCap, BookOpen, Users, Clock]

export default function EducationPage() {
  const { t } = useTranslation()

  const FEATURES = [
    { icon: ICONS[0], title: t('education.features.professionalTraining.title'), description: t('education.features.professionalTraining.description') },
    { icon: ICONS[1], title: t('education.features.structuredPrograms.title'),   description: t('education.features.structuredPrograms.description') },
    { icon: ICONS[2], title: t('education.features.expertInstructors.title'),    description: t('education.features.expertInstructors.description') },
    { icon: ICONS[3], title: t('education.features.soonAvailable.title'),        description: t('education.features.soonAvailable.description') },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="py-10 pt-24 md:py-24 px-6 bg-gray-50 text-center">
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-6 text-gray-900"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {t('education.hero.title')}
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl max-w-2xl mx-auto text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          {t('education.hero.subtitle')}
        </motion.p>
      </section>

      {/* Features */}
      <section className="py-10 md:py-16 px-6 md:px-16 bg-white">
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              className="p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 bg-white"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <feature.icon className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Development */}
      <section className="py-10 md:py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/project.jpg" alt="Corporate education" className="rounded-2xl shadow-lg w-full" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('education.development.title')}</h2>
            <p className="text-gray-700 leading-relaxed mb-6">{t('education.development.text')}</p>
            <p className="text-gray-500 italic">{t('education.development.note')}</p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
