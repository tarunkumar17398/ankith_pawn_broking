export function inr(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function fmtDate(s: string): string {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function daysBetween(from: string, to: string): number {
  const d1 = new Date(from)
  const d2 = new Date(to)
  return Math.max(0, Math.round((d2.getTime() - d1.getTime()) / 86400000))
}
