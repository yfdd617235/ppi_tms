'use client'

import { useTranslation } from '@/lib/i18n/context'

const GOVERNANCE_LIST_KEYS = [
  'list1', 'list2', 'list3', 'list4', 'list5', 'list6', 'list7',
] as const

export default function CumplimientoPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white text-gray-800 text-sm md:text-base leading-relaxed">

      {/* Hero */}
      <section className="pt-20 pb-10 md:pt-28 md:pb-16 px-6 md:px-16 2xl:px-60 bg-gray-50 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-5 text-gray-900">
          {t('compliance.hero.title')}
        </h1>
        <p className="max-w-3xl mx-auto text-gray-700 text-justify md:text-center">
          {t('compliance.hero.subtitle')}
        </p>
      </section>

      {/* Compliance body */}
      <section className="py-10 md:py-16 px-6 md:px-16 2xl:px-60 bg-white">
        <div className="max-w-4xl mx-auto space-y-5 text-gray-700">
          <p className="text-justify">{t('compliance.standards.text')}</p>

          <div>
            <p className="text-justify mb-3">{t('compliance.services.intro')}</p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-gray-700">
              <li>{t('compliance.services.treasury')}</li>
              <li>{t('compliance.services.projects')}</li>
              <li>{t('compliance.services.optimization')}</li>
            </ul>
          </div>

          <p className="text-justify">{t('compliance.culture.text')}</p>
          <p className="text-justify">{t('compliance.technology.text')}</p>
          <p className="text-justify">{t('compliance.technology.impact')}</p>
          <p className="text-justify">{t('compliance.allies.text')}</p>
        </div>
      </section>

      {/* Infographic 1 */}
      <section className="py-10 md:py-14 px-6 md:px-16 2xl:px-60 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/etapas-trazabilidad.jpg"
            alt="Etapas de trazabilidad y control"
            className="w-full rounded-2xl shadow-md"
          />
        </div>
      </section>

      {/* Corporate governance */}
      <section className="py-10 md:py-16 px-6 md:px-16 2xl:px-60 bg-white">
        <div className="max-w-4xl mx-auto space-y-5 text-gray-700">
          <p className="text-justify">{t('compliance.governance.para1')}</p>
          <p className="text-justify">{t('compliance.governance.para2')}</p>
          <p className="text-justify">{t('compliance.governance.para3')}</p>
          <p className="text-justify">{t('compliance.governance.para4')}</p>

          <div>
            <p className="text-justify mb-3">{t('compliance.governance.listIntro')}</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              {GOVERNANCE_LIST_KEYS.map((key) => (
                <li key={key}>{t(`compliance.governance.${key}`)}</li>
              ))}
            </ul>
          </div>

          <p className="text-justify">{t('compliance.governance.para5')}</p>
          <p className="text-justify">{t('compliance.governance.para6')}</p>
        </div>
      </section>

      {/* Infographic 2 */}
      <section className="py-10 md:py-14 px-6 md:px-16 2xl:px-60 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lineamientos-disposiciones.jpg"
            alt="Lineamientos y disposiciones"
            className="w-full rounded-2xl shadow-md"
          />
        </div>
      </section>

    </div>
  )
}
