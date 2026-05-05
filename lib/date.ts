/**
 * Formatea una fecha al formato: dd/mmm/aaaa (ej: 05/may/2026)
 * @param date Fecha a formatear (Date, string o número)
 */
export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return '—'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'

  // Si el string es solo fecha (YYYY-MM-DD), Date lo interpreta como UTC 00:00
  // Para evitar que el desfase de zona horaria reste un día, usamos los métodos UTC
  // si el input es un string de exactamente 10 caracteres (YYYY-MM-DD)
  const isOnlyDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)

  const day = (isOnlyDate ? d.getUTCDate() : d.getDate()).toString().padStart(2, '0')
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  const month = months[isOnlyDate ? d.getUTCMonth() : d.getMonth()]
  const year = isOnlyDate ? d.getUTCFullYear() : d.getFullYear()

  return `${day}/${month}/${year}`
}
