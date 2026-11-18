const MILLISECONDS_PER_MINUTE = 60 * 1000

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

export function formatEta(minMinutes: number, maxMinutes: number): string {
  return `${minMinutes}–${maxMinutes} min`
}

export function formatDeliveryWindow(
  createdAt: string | Date,
  minMinutes: number,
  maxMinutes: number,
): string {
  const start = new Date(createdAt)
  const startTime = start.getTime()

  if (Number.isNaN(startTime)) return ''

  const startDate = new Date(startTime + minMinutes * MILLISECONDS_PER_MINUTE)
  const endDate = new Date(startTime + maxMinutes * MILLISECONDS_PER_MINUTE)

  return `${timeFormatter.format(startDate)} – ${timeFormatter.format(endDate)}`
}
