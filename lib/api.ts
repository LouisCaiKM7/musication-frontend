import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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
