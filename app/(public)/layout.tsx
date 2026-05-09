import PublicNavbar from '@/components/public/public-navbar'
import PublicFooter from '@/components/public/public-footer'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </>
  )
}
