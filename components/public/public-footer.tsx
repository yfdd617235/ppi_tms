'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, MessageCircle } from 'lucide-react'
import ContactDialog from './contact-dialog'

export default function PublicFooter() {
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
            style={{ width: 'auto', height: 'auto' }}
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
          <ContactDialog source="footer">
            <button className="flex items-center space-x-2 text-green-200 hover:text-green-500 transition-colors">
              <Mail className="w-5 h-5" />
              <span>Email</span>
            </button>
          </ContactDialog>
          <a
            href="https://www.linkedin.com/company/panamerican-private-investments/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-green-200 hover:text-green-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M22.23 0H1.77C.792 0 0 .774 0 1.728v20.543C0 23.225.792 24 1.77 24h20.46c.978 0 1.77-.774 1.77-1.729V1.728C24 .774 23.208 0 22.23 0zM7.12 20.452H3.56V9h3.56v11.452zm-1.78-13.01a2.07 2.07 0 11-.001-4.138 2.07 2.07 0 010 4.138zm15.18 13.01h-3.56v-5.941c0-1.417-.028-3.245-1.975-3.245-1.976 0-2.278 1.543-2.278 3.14v6.045h-3.56V9h3.42v1.563h.049c.476-.9 1.636-1.846 3.368-1.846 3.602 0 4.267 2.369 4.267 5.452v6.283z" />
            </svg>
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
