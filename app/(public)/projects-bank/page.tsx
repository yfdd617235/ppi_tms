'use client'

import { motion } from 'framer-motion'
import { Search, ClipboardList, Settings, BarChart3, Mail } from 'lucide-react'

const STEPS = [
  {
    icon: Search,
    title: 'Evaluation',
    description: 'We analyze the feasibility and potential of each idea, considering technical, financial, and market factors.',
  },
  {
    icon: ClipboardList,
    title: 'Planning',
    description: 'We design strategies, establish schedules, budgets, and resources needed to ensure project success.',
  },
  {
    icon: Settings,
    title: 'Execution',
    description: 'We implement designed solutions, overseeing every stage to ensure quality, compliance, and efficiency.',
  },
  {
    icon: BarChart3,
    title: 'Control',
    description: 'We monitor project progress, assess results, and apply continuous improvements to maximize impact.',
  },
]

function CopyEmailButton() {
  const handleCopy = () => {
    navigator.clipboard.writeText('director@panamericanprivateinvestments.com')
    alert('Email copied to clipboard 📋')
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center space-x-2 text-white hover:bg-primary/85 transition-colors bg-primary rounded-full px-6 py-3.5"
    >
      <Mail className="w-5 h-5" />
      <span>Contact Us</span>
    </button>
  )
}

export default function ProjectsBankPage() {
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
          Projects Bank and Private Equity
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl max-w-3xl mx-auto text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          We turn your ideas into real projects through a structured process. Following the key stages
          of professional project management —Evaluation, Planning, Execution, and Control— we
          transform your vision into tangible results.
        </motion.p>
      </section>

      {/* Process diagram */}
      <section className="py-10 md:py-16 px-6 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-gray-900 text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            Our Structured Process
          </motion.h2>
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <motion.div
                key={index}
                className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-2xl shadow-sm bg-white hover:shadow-lg transition-all hover:-translate-y-2"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <step.icon className="text-primary w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
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
            <img src="/lightbulb.jpg" alt="Project management" className="rounded-2xl shadow-lg w-full" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">From Concept to Reality</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              At Panamerican Private Investments, we drive projects from conception to completion.
              Through a rigorous, structured approach, we ensure every initiative achieves its full
              potential.
            </p>
            <CopyEmailButton />
          </motion.div>
        </div>
      </section>
    </div>
  )
}
