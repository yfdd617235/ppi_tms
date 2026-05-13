'use client'

import { Mail } from 'lucide-react'
import ContactDialog from '@/components/public/contact-dialog'
import { useTranslation } from '@/lib/i18n/context'

const VIDEO_SRCS = [
  'https://www.youtube.com/embed/m2q0tIxgevQ',
  'https://www.youtube.com/embed/5x9nIEBr8QA',
  'https://www.youtube.com/embed/gWySnIDaWUQ',
  'https://www.youtube.com/embed/bpEew1Jbc3A',
]

export default function TradingPage() {
  const { t } = useTranslation()

  const VIDEOS = [
    { id: 1, src: VIDEO_SRCS[0], title: t('trading.video1') },
    { id: 2, src: VIDEO_SRCS[1], title: t('trading.video2') },
    { id: 3, src: VIDEO_SRCS[2], title: t('trading.video3') },
    { id: 4, src: VIDEO_SRCS[3], title: t('trading.video4') },
  ]

  return (
    <div className="text-black text-sm md:text-base lg:text-lg leading-relaxed">

      {/* Disclaimer */}
      <div className="mx-auto py-10 pt-24 md:py-24 px-4 lg:px-20 2xl:px-60 text-gray-300 bg-black">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">{t('trading.titleDisclaimer')}</h1>
        <p className="text-justify">{t('trading.textDisclaimer')}</p>
      </div>

      {/* What is Trading */}
      <div className="py-10 md:py-20 bg-gray-50">
        <div className="flex flex-col md:flex-row justify-center items-center mx-auto px-4 lg:px-20 2xl:px-60 gap-10">
          <div className="shrink-0 md:w-1/4 flex justify-center items-center">
            <h2 className="text-2xl md:text-3xl text-gray-900 font-bold text-center">
              {t('trading.titleWhatIsTrading')}
            </h2>
          </div>
          <div className="md:w-3/4">
            <p className="text-justify">{t('trading.textWhatIsTrading')}</p>
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
              <h3 className="text-gray-900 font-bold text-center text-lg mb-3">{t('trading.video5')}</h3>
              <video autoPlay muted loop className="w-full rounded-lg shadow-md">
                <source src="https://res.cloudinary.com/dopqozfgb/video/upload/v1732650612/Expert_Advisor__qeegsx.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="w-full">
              <h3 className="text-gray-900 font-bold text-center text-lg mb-3">{t('trading.video6')}</h3>
              <video autoPlay muted loop className="w-full rounded-lg shadow-md">
                <source src="https://res.cloudinary.com/dopqozfgb/video/upload/v1732651712/Balance__oj3j36.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          {/* Text */}
          <div className="md:w-3/5">
            <h2 className="text-2xl md:text-3xl text-gray-900 font-bold text-center mb-6">
              {t('trading.titleAlgoTrading')}
            </h2>
            <p className="text-justify mb-4">{t('trading.textAlgoTrading1')}</p>
            <p className="text-justify mb-4">{t('trading.textAlgoTrading2')}</p>
            <p className="text-primary font-bold text-justify mb-4">{t('trading.textAlgoTrading3')}</p>
            <p className="text-justify md:text-lg my-4 whitespace-pre-line">{t('trading.textAlgoTradingBenefits')}</p>
            <p className="text-justify">{t('trading.textAlgoTrading4')}</p>
            <br />
            <ContactDialog source="trading">
              <button className="flex items-center space-x-2 text-white hover:bg-primary/85 transition-colors bg-primary rounded-full px-6 py-3.5">
                <Mail className="w-5 h-5" />
                <span>{t('common.contactUs')}</span>
              </button>
            </ContactDialog>
          </div>
        </div>
      </div>
    </div>
  )
}
