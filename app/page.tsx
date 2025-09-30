'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Music2, Search, AlertCircle } from 'lucide-react'
import FileUploader from '@/components/FileUploader'
import LibraryStatsComponent from '@/components/LibraryStats'
import LoadingSpinner from '@/components/LoadingSpinner'
import { uploadAudioFile, startAnalysis } from '@/lib/api'

export default function Home() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError(null)
  }

  const handleClearFile = () => {
    setSelectedFile(null)
    setError(null)
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select an audio file first')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Upload file
      const { jobId } = await uploadAudioFile(selectedFile)
      
      // Start analysis
      await startAnalysis(jobId)
      
      // Navigate to results page
      router.push(`/results/${jobId}`)
    } catch (err: unknown) {
      console.error('Analysis error:', err)
      const errorMessage = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to analyze audio file. Please try again.'
      setError(errorMessage || 'Failed to analyze audio file. Please try again.')
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Music2 className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Musication
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Advanced Music Similarity Analysis & Plagiarism Detection
          </p>
        </header>

        {/* Library Stats */}
        <LibraryStatsComponent />

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Upload Your Audio File
          </h2>
          
          <FileUploader 
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClear={handleClearFile}
          />

          {error && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {isAnalyzing ? (
            <LoadingSpinner message="Analyzing audio and comparing with library..." />
          ) : (
            <div className="mt-8 text-center">
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 mx-auto hover:scale-105"
              >
                <Search className="w-6 h-6" />
                Find Similar Tracks
              </button>
              <p className="mt-4 text-sm text-gray-500">
                Analysis typically takes 30-60 seconds
              </p>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Legal Disclaimer</h3>
              <p className="text-sm text-yellow-800">
                This tool provides <strong>technical similarity analysis only</strong>. It does not constitute legal advice or copyright infringement determination. 
                Copyright infringement requires evidence of access, substantial similarity, and protectable elements under copyright law. 
                Please consult legal professionals for copyright matters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
