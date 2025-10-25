import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
})

export interface LibraryStats {
  totalTracks: number
  genres: string[]
  artists: number
}

export interface AnalysisJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  processingTime?: number
}

export interface MatchedSegment {
  start1: number
  end1: number
  start2: number
  end2: number
}

export interface SimilarityResult {
  id: string
  libraryTrackId: string
  title: string
  artist: string
  album: string
  similarityScore: number
  fingerprintMatch: boolean
  melodySimilarity: number
  matchedSegments: MatchedSegment[]
  visualizationPaths: {
    fingerprint: string
    chromaHeatmap: string
    dtwPath: string
  }
  rank: number
}

export interface AnalysisResults {
  jobId: string
  status: string
  matches: SimilarityResult[]
  uploadedFileName: string
  processingTime: number
}

// Upload audio file
export async function uploadAudioFile(file: File): Promise<{ jobId: string }> {
  const formData = new FormData()
  formData.append('audio', file)

  const response = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return response.data
}

// Start analysis
export async function startAnalysis(jobId: string): Promise<{ status: string }> {
  const response = await api.post(`/api/analyze/${jobId}`)
  return response.data
}

// Check job status
export async function checkJobStatus(jobId: string): Promise<AnalysisJob> {
  const response = await api.get(`/api/status/${jobId}`)
  return response.data
}

// Get analysis results
export async function getAnalysisResults(jobId: string): Promise<AnalysisResults> {
  const response = await api.get(`/api/results/${jobId}`)
  return response.data
}

// Get library statistics
export async function getLibraryStats(): Promise<LibraryStats> {
  const response = await api.get('/api/library/stats')
  return response.data
}

// Get visualization image URL
export function getVisualizationUrl(path: string): string {
  return `${API_URL}${path}`
}

export default api

// ===== Flask backend integration (tracks) =====
export type Track = {
  id: string
  title: string
  audio_url: string
  uploaded_at: string | null
  duration_seconds: number | null
  sample_rate: number | null
}

export async function listTracks(): Promise<{ tracks: Track[] } | Track[]> {
  const res = await api.get('/tracks', { headers: { Accept: 'application/json' } })
  return res.data
}

export async function uploadTrack(file: File, title: string) {
  const form = new FormData()
  form.append('file', file)
  form.append('title', title)
  const res = await api.post('/tracks', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function deleteTrack(trackId: string) {
  const res = await api.delete(`/tracks/${trackId}`)
  return res.data
}
