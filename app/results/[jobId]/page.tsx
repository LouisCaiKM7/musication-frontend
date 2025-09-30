'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Music2, Clock, RefreshCw } from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'
import MatchCard from '@/components/MatchCard'
import { getAnalysisResults, checkJobStatus, AnalysisResults } from '@/lib/api'

export default function ResultsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.jobId as string

  const [results, setResults] = useState<AnalysisResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('processing')

  useEffect(() => {
    if (jobId) {
      pollForResults()
    }
  }, [jobId])

  const pollForResults = async () => {
    try {
      // Poll job status until complete
      let attempts = 0
      const maxAttempts = 60 // 5 minutes max

      const poll = async () => {
        try {
          const statusData = await checkJobStatus(jobId)
          setStatus(statusData.status)

          if (statusData.status === 'completed') {
            // Fetch results
            const resultsData = await getAnalysisResults(jobId)
            setResults(resultsData)
            setLoading(false)
          } else if (statusData.status === 'failed') {
            setError('Analysis failed. Please try again.')
            setLoading(false)
          } else if (attempts < maxAttempts) {
            attempts++
            setTimeout(poll, 5000) // Poll every 5 seconds
          } else {
            setError('Analysis timeout. Please try again.')
            setLoading(false)
          }
        } catch (err) {
          console.error('Polling error:', err)
          if (attempts < 3) {
            // Retry a few times
            attempts++
            setTimeout(poll, 5000)
          } else {
            setError('Failed to check analysis status.')
            setLoading(false)
          }
        }
      }

      poll()
    } catch (err: any) {
      console.error('Results error:', err)
      setError(err.response?.data?.message || 'Failed to load results.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-12">
            <LoadingSpinner message={`Analyzing your audio file... (${status})`} />
            <div className="mt-8 text-center">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <p>Comparing against music library</p>
              </div>
              <p className="mt-2 text-sm text-gray-500">This may take up to a minute</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Analysis Failed</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!results || results.matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Music2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No Matches Found</h2>
            <p className="text-gray-600 mb-8">
              Your audio file doesn't have significant similarity with any tracks in our library.
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Analyze Another File
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
                  <Music2 className="w-8 h-8 text-blue-600" />
                  Analysis Results
                </h1>
                <p className="text-gray-600">
                  Found <strong>{results.matches.length}</strong> similar track(s) for{' '}
                  <strong>{results.uploadedFileName}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span>Processed in {results.processingTime.toFixed(2)}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Matches */}
        <div className="space-y-6">
          {results.matches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Analyze Another File
          </button>
        </div>
      </div>
    </div>
  )
}
