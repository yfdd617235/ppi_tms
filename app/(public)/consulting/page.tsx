'use client'

import { motion } from 'framer-motion'
import { TrendingUp, FolderKanban, Settings, Bot, Globe, Mail } from 'lucide-react'
import ContactDialog from '@/components/public/contact-dialog'

const SERVICES = [
  {
    icon: TrendingUp,
    title: 'Treasury Management',
    description: 'We optimize cash flow, financial planning, and resource management to maximize liquidity and profitability.',
  },
  {
    icon: FolderKanban,
    title: 'Subrogated Project Administration',
    description: 'We take on the operational and administrative management of strategic projects, ensuring transparency, compliance, and efficiency at every stage.',
  },
  {
    icon: Settings,
    title: 'Process Optimization',
    description: 'We analyze and redesign key processes to reduce costs, eliminate bottlenecks, and improve overall productivity.',
  },
  {
    icon: Bot,
    title: 'Process Automation',
    description: 'We implement digital solutions integrating artificial intelligence and automation to minimize repetitive tasks and improve accuracy.',
  },
  {
    icon: Globe,
    title: 'Offshore Structuring Advisory',
    description: 'We provide specialized advice for designing secure, efficient, and compliant international corporate structures.',
  },
]

export default function ConsultingPage() {
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
          Corporate Consulting
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl max-w-2xl mx-auto text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          We design financial and operational strategies that drive efficiency, sustainability, and
          global expansion for your company.
        </motion.p>
      </section>

      {/* Services */}
      <section className="py-10 md:py-16 px-6 md:px-16 bg-white">
        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <motion.div
              key={index}
              className="p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 bg-white"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <service.icon className="text-primary w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Value */}
      <section className="py-10 md:py-20 px-6 md:px-16 bg-gray-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/global.jpg" alt="Corporate consulting" className="rounded-2xl shadow-lg w-full" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Long-Term Strategic Support</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              At Panamerican Private Investments, we offer comprehensive solutions that go beyond
              traditional consulting. We focus on sustainability, confidentiality, and operational
              efficiency to build solid and profitable corporate structures.
            </p>
            <ContactDialog source="consulting">
              <button className="flex items-center space-x-2 text-white hover:bg-primary/85 transition-colors bg-primary rounded-full px-6 py-3.5">
                <Mail className="w-5 h-5" />
                <span>Contact Us</span>
              </button>
            </ContactDialog>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
