'use client'

import { useState, useEffect } from 'react'
import { Music2, ArrowRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { listTracks, compareTracks, Track, ComparisonResult, getAnalysisProgress, AnalysisProgress } from '@/lib/api'
import TrackSelector from '@/components/TrackSelector'
import SimilarityReport from '@/components/SimilarityReport'

export default function ComparePage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [comparing, setComparing] = useState(false)
  const [selectedTrack1, setSelectedTrack1] = useState<Track | null>(null)
  const [selectedTrack2, setSelectedTrack2] = useState<Track | null>(null)
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<AnalysisProgress | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  useEffect(() => {
    loadTracks()
  }, [])

  const loadTracks = async () => {
    try {
      setLoading(true)
      const data = await listTracks()
      const trackList = Array.isArray(data) ? data : data.tracks
      setTracks(trackList)
    } catch (err) {
      console.error('Failed to load tracks:', err)
      setError('Failed to load tracks')
    } finally {
      setLoading(false)
    }
  }

  const handleCompare = async () => {
    if (!selectedTrack1 || !selectedTrack2) {
      setError('Please select two tracks to compare')
      return
    }

    if (selectedTrack1.id === selectedTrack2.id) {
      setError('Please select two different tracks')
      return
    }

    setComparing(true)
    setError(null)
    setComparisonResult(null)
    setProgress({ status: 'processing', progress: 5, message: 'Starting comparison...' })

    try {
      // Start comparison (returns immediately with analysis_id)
      const response = await compareTracks(selectedTrack1.id, selectedTrack2.id)
      const currentAnalysisId = response.analysis_id
      setAnalysisId(currentAnalysisId)
      
      // Poll for progress
      const pollInterval = setInterval(async () => {
        try {
          const progressData = await getAnalysisProgress(currentAnalysisId)
          setProgress(progressData)
          
          if (progressData.status === 'completed') {
            clearInterval(pollInterval)
            // Fetch complete results
            const completeResult = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/analyses/${currentAnalysisId}`)
            if (completeResult.ok) {
              const data = await completeResult.json()
              // Reconstruct the comparison result from artifacts
              const similarityReport = data.analysis?.artifacts?.find((a: any) => a.artifact_type === 'similarity_report')
              if (similarityReport) {
                setComparisonResult({
                  analysis_id: currentAnalysisId,
                  results: {
                    ...similarityReport.data_json,
                    track1: {
                      title: selectedTrack1.title || 'Track 1',
                      duration: selectedTrack1.duration_seconds || 0,
                      tempo: 120
                    },
                    track2: {
                      title: selectedTrack2.title || 'Track 2',
                      duration: selectedTrack2.duration_seconds || 0,
                      tempo: 120
                    },
                    overall_similarity: similarityReport.data_json.overall_similarity,
                    chroma_analysis: similarityReport.data_json.chroma_analysis,
                    melody_analysis: similarityReport.data_json.melody_analysis,
                    tempo_analysis: similarityReport.data_json.tempo_analysis,
                    similar_segments: similarityReport.data_json.similar_segments,
                    summary: similarityReport.data_json.summary_text
                  },
                  visualizations: data.analysis?.artifacts
                    ?.filter((a: any) => a.content_type === 'image/png' && a.base64)
                    ?.map((a: any) => ({
                      type: a.artifact_type,
                      filename: `${a.artifact_type}.png`,
                      base64: a.base64
                    })) || []
                })
              }
            }
            setComparing(false)
          } else if (progressData.status === 'failed') {
            clearInterval(pollInterval)
            setError(progressData.message)
            setComparing(false)
          }
        } catch (err) {
          console.error('Failed to fetch progress:', err)
        }
      }, 1000)
      
    } catch (err: unknown) {
      console.error('Comparison failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to start comparison'
      setError(errorMessage)
      setProgress({ status: 'failed', progress: 0, message: errorMessage })
      setComparing(false)
    }
  }

  const handleReset = () => {
    setSelectedTrack1(null)
    setSelectedTrack2(null)
    setComparisonResult(null)
    setError(null)
    setProgress(null)
    setAnalysisId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music2 className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Track Comparison
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare two tracks for melody and harmony similarity using advanced music analysis
          </p>
        </header>

        {!comparisonResult ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Select Two Tracks to Compare
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">1</span>
                  First Track
                </h3>
                <TrackSelector
                  tracks={tracks}
                  selectedTrack={selectedTrack1}
                  onSelect={setSelectedTrack1}
                  excludeTrackId={selectedTrack2?.id}
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4 flex items-center gap-2">
                  <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center">2</span>
                  Second Track
                </h3>
                <TrackSelector
                  tracks={tracks}
                  selectedTrack={selectedTrack2}
                  onSelect={setSelectedTrack2}
                  excludeTrackId={selectedTrack1?.id}
                />
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <button
                onClick={handleCompare}
                disabled={!selectedTrack1 || !selectedTrack2 || comparing}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 hover:scale-105"
              >
                {comparing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-6 h-6" />
                    Compare Tracks
                  </>
                )}
              </button>
            </div>

            {comparing && progress && (
              <div className="mt-6">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{progress.message}</span>
                    <span className="text-sm font-semibold text-blue-600">{progress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress.progress}%` }}
                    >
                      <div className="h-full w-full bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">This may take 30-60 seconds</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle className="w-8 h-8" />
                <span className="text-lg font-semibold">Comparison Complete</span>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
              >
                New Comparison
              </button>
            </div>

            <SimilarityReport result={comparisonResult} />
          </div>
        )}

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mt-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Legal Disclaimer</h3>
              <p className="text-sm text-yellow-800">
                This tool provides <strong>technical similarity analysis only</strong>. Results do not constitute 
                legal evidence of plagiarism or copyright infringement. Copyright law requires consideration of 
                access, substantial similarity, and protectable elements. Please consult legal professionals for 
                copyright matters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
