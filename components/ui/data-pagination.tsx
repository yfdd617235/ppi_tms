import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface DataPaginationProps {
  page: number
  pageSize: number
  total: number
  baseParams?: Record<string, string>
}

export function DataPagination({ page, pageSize, total, baseParams = {} }: DataPaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (total === 0 || totalPages <= 1) return null

  const rangeFrom = (page - 1) * pageSize + 1
  const rangeTo = Math.min(page * pageSize, total)

  const buildUrl = (p: number) => {
    const params = new URLSearchParams({ ...baseParams, page: String(p) })
    return `?${params}`
  }

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>Mostrando {rangeFrom}–{rangeTo} de {total}</span>
      <div className="flex items-center gap-1.5">
        {page > 1 ? (
          <Button asChild variant="outline" size="sm">
            <Link href={buildUrl(page - 1)}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
        )}
        <span className="px-3 font-medium text-foreground">{page} / {totalPages}</span>
        {page < totalPages ? (
          <Button asChild variant="outline" size="sm">
            <Link href={buildUrl(page + 1)}>
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
