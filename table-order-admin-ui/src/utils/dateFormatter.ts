import dayjs from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

export function formatDate(date: string | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  return dayjs(date).format(format)
}

export function formatRelativeTime(date: string | Date): string {
  const now = dayjs()
  const target = dayjs(date)
  const diffMinutes = now.diff(target, 'minute')

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`

  const diffHours = now.diff(target, 'hour')
  if (diffHours < 24) return `${diffHours}시간 전`

  const diffDays = now.diff(target, 'day')
  if (diffDays < 7) return `${diffDays}일 전`

  return formatDate(date, 'YYYY-MM-DD')
}
