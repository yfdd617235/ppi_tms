'use client'

import { Mail } from 'lucide-react'
import ContactDialog from '@/components/public/contact-dialog'

const VIDEOS = [
  { id: 1, src: 'https://www.youtube.com/embed/m2q0tIxgevQ', title: 'Trading 525 USD in two minutes. SP500 futures' },
  { id: 2, src: 'https://www.youtube.com/embed/5x9nIEBr8QA', title: 'Premarket Analysis' },
  { id: 3, src: 'https://www.youtube.com/embed/gWySnIDaWUQ', title: 'Fibonacci Retracement' },
  { id: 4, src: 'https://www.youtube.com/embed/bpEew1Jbc3A', title: 'Interview with the CEO' },
]

export default function TradingPage() {
  return (
    <div className="text-black text-sm md:text-base lg:text-lg leading-relaxed">

      {/* Disclaimer */}
      <div className="mx-auto py-10 pt-24 md:py-24 px-4 lg:px-20 2xl:px-60 text-gray-300 bg-black">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">Disclaimer</h1>
        <p className="text-justify">
          The information provided on this website is purely informational and educational in nature.
          It is not intended as an invitation or encouragement to engage in any trading activity. We
          do not offer any financial advice or recommendations. Please be aware that trading is not a
          game, and it involves significant risks, including the potential loss of money. We urge you
          to carefully consider your financial situation and risk tolerance before participating in any
          form of trading. Always seek professional advice if needed.
        </p>
      </div>

      {/* What is Trading */}
      <div className="py-10 md:py-20 bg-gray-50">
        <div className="flex flex-col md:flex-row justify-center items-center mx-auto px-4 lg:px-20 2xl:px-60 gap-10">
          <div className="shrink-0 md:w-1/4 flex justify-center items-center">
            <h2 className="text-2xl md:text-3xl text-gray-900 font-bold text-center">
              What is Trading?
            </h2>
          </div>
          <div className="md:w-3/4">
            <p className="text-justify">
              Trading refers to the act of buying and selling financial assets such as stocks, bonds,
              commodities, or currencies, with the goal of making a profit. Traders attempt to
              capitalize on price fluctuations in the market by entering and exiting positions at
              opportune times. It is important to understand that trading is a complex and speculative
              activity that requires knowledge, skill, and experience.
            </p>
          </div>
        </div>
      </div>

      {/* YouTube Videos */}
      <div className="mx-auto py-10 md:py-20 px-4 lg:px-20 2xl:px-60">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
          {VIDEOS.map((video) => (
            <div key={video.id} className="h-full bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <iframe
                src={video.src}
                title={video.title}
                className="w-full h-64"
                allowFullScreen
              />
              <div className="p-6">
                <p className="text-gray-900 font-bold text-center">{video.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Algorithmic Trading */}
      <div className="py-10 md:py-20 bg-gray-50">
        <div className="flex flex-col gap-12 md:flex-row justify-center items-center mx-auto px-4 lg:px-20 2xl:px-60">

          {/* Videos */}
          <div className="flex flex-col md:w-2/5 justify-center items-center space-y-10">
            <div className="w-full">
              <h3 className="text-gray-900 font-bold text-center text-lg mb-3">Expert Advisor</h3>
              <video autoPlay muted loop className="w-full rounded-lg shadow-md">
                <source src="https://res.cloudinary.com/dopqozfgb/video/upload/v1732650612/Expert_Advisor__qeegsx.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="w-full">
              <h3 className="text-gray-900 font-bold text-center text-lg mb-3">Balance</h3>
              <video autoPlay muted loop className="w-full rounded-lg shadow-md">
                <source src="https://res.cloudinary.com/dopqozfgb/video/upload/v1732651712/Balance__oj3j36.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          {/* Text */}
          <div className="md:w-3/5">
            <h2 className="text-2xl md:text-3xl text-gray-900 font-bold text-center mb-6">
              What is Algorithmic Trading?
            </h2>
            <p className="text-justify mb-4">
              Algorithmic trading, also known as algo trading or automated trading, refers to the use
              of computer programs and algorithms to execute financial market trades. These algorithms
              follow predefined rules based on factors such as price, volume, and timing to capitalize
              on market opportunities with speed and accuracy beyond human capability.
            </p>
            <p className="text-justify mb-4">
              Algorithmic trading can involve simple strategies, like following a moving average, or
              complex systems that analyze large amounts of data and make decisions using artificial
              intelligence (AI) and machine learning.
            </p>
            <p className="text-primary font-bold text-justify mb-4">Key Benefits:</p>
            <p className="text-justify md:text-lg my-4 whitespace-pre-line">{`- Speed: Executes trades in milliseconds, faster than any human.\n- Accuracy: Reduces human error by following strict rules.\n- Efficiency: Monitors and reacts to multiple markets simultaneously.`}</p>
            <p className="text-justify">
              Despite its advantages, algorithmic trading carries significant risks. It requires a
              deep understanding of both markets and algorithms. Poorly designed strategies or glitches
              can cause major losses and even increase market volatility.
            </p>
            <br />
            <ContactDialog source="trading">
              <button className="flex items-center space-x-2 text-white hover:bg-primary/85 transition-colors bg-primary rounded-full px-6 py-3.5">
                <Mail className="w-5 h-5" />
                <span>Contact Us</span>
              </button>
            </ContactDialog>
          </div>
        </div>
      </div>
    </div>
  )
}
