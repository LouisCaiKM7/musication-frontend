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
export type MusicMatch = {
  score: number
  title: string
  artist: string
  recording_id: string
  musicbrainz_url: string
}

export type Analysis = {
  id: string
  method: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string | null
  completed_at: string | null
  summary: string | null
  artifacts?: {
    id: string
    artifact_type: string
    content_type: string
    data_json: MusicMatch[] | null
    data_url: string | null
  }[]
}

export type Track = {
  id: string
  title: string
  audio_url: string
  uploaded_at: string | null
  duration_seconds: number | null
  sample_rate: number | null
  analyses?: Analysis[]
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

export async function analyzeTrack(trackId: string) {
  const res = await api.post(`/tracks/${trackId}/analyze`)
  return res.data
}

export async function getTrack(trackId: string): Promise<{ track: Track }> {
  const res = await api.get(`/tracks/${trackId}`)
  return res.data
}

export type SimilarSegment = {
  track1_start_frame: number
  track1_end_frame: number
  track2_start_frame: number
  track2_end_frame: number
  track1_start_time: number
  track1_end_time: number
  track2_start_time: number
  track2_end_time: number
  similarity_score: number
  max_similarity: number
}

export type ComparisonResult = {
  analysis_id: string
  results: {
    track1: {
      title: string
      duration: number
      tempo: number
    }
    track2: {
      title: string
      duration: number
      tempo: number
    }
    overall_similarity: {
      overall_similarity_score: number
      similarity_percentage: number
      similarity_level: string
      verdict: string
      component_scores: {
        chroma_harmony: number
        melody_contour: number
        tempo: number
      }
      weights: {
        chroma_harmony: number
        melody_contour: number
        tempo: number
      }
    }
    chroma_analysis: {
      transposition_semitones: number
      similarity_score: number
      dtw_distance: number
    }
    melody_analysis: {
      similarity_score: number
      dtw_distance: number
    }
    tempo_analysis: {
      track1_tempo: number
      track2_tempo: number
      tempo_ratio: number
    }
    similar_segments: SimilarSegment[]
    summary: string
  }
  visualizations: {
    type: string
    filename: string
    base64: string
  }[]
}

export async function compareTracks(
  trackId1: string,
  trackId2: string
): Promise<ComparisonResult> {
  const res = await api.post(`/tracks/${trackId1}/compare/${trackId2}`)
  return res.data
}

export function getVisualizationImageUrl(analysisId: string, artifactType: string): string {
  return `${API_URL}/analyses/${analysisId}/visualizations/${artifactType}`
}

export type AnalysisProgress = {
  status: 'processing' | 'completed' | 'failed'
  progress: number
  message: string
}

export async function getAnalysisProgress(analysisId: string): Promise<AnalysisProgress> {
  const res = await api.get(`/analyses/${analysisId}/progress`)
  return res.data
}
