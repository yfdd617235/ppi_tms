import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="fixed top-0 left-0 p-4">
        <Link href="/">
          <div className="h-10 w-10 overflow-hidden rounded-full">
            <img src="/logoA.svg" alt="PPI" className="w-full h-full object-cover" />
          </div>
        </Link>
      </div>
      {children}
    </div>
  )
}
