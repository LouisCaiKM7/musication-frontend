import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export function getSimilarityColor(score: number): string {
  if (score >= 80) return 'bg-red-100 text-red-800 border-red-300'
  if (score >= 60) return 'bg-orange-100 text-orange-800 border-orange-300'
  if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  return 'bg-green-100 text-green-800 border-green-300'
}

export function getSimilarityLabel(score: number): string {
  if (score >= 80) return 'Very High'
  if (score >= 60) return 'High'
  if (score >= 40) return 'Moderate'
  return 'Low'
}

export function getSimilarityEmoji(score: number): string {
  if (score >= 80) return '🔴'
  if (score >= 60) return '🟠'
  if (score >= 40) return '🟡'
  return '🟢'
}
