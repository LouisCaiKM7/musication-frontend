'use client'

import { ComparisonResult } from '@/lib/api'
import { TrendingUp, Music, Clock, Key } from 'lucide-react'

interface SimilarityReportProps {
  result: ComparisonResult
}

export default function SimilarityReport({ result }: SimilarityReportProps) {
  const { results, visualizations } = result
  const { overall_similarity, chroma_analysis, similar_segments, summary } = results

  const getSimilarityColor = (percentage: number) => {
    if (percentage >= 80) return 'text-red-600 bg-red-50 border-red-200'
    if (percentage >= 60) return 'text-orange-600 bg-orange-50 border-orange-200'
    if (percentage >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getScoreColor = (score: number) => {
    const percentage = score * 100
    if (percentage >= 80) return 'bg-red-500'
    if (percentage >= 60) return 'bg-orange-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-6">
      {/* Overall Similarity Score */}
      <div className={`rounded-2xl shadow-xl p-8 border-4 ${getSimilarityColor(overall_similarity.similarity_percentage)}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-white shadow-lg mb-4">
            <div className="text-5xl font-bold">
              {overall_similarity.similarity_percentage.toFixed(1)}%
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {overall_similarity.similarity_level} Similarity
          </h2>
          <p className="text-xl font-semibold">
            {overall_similarity.verdict}
          </p>
        </div>
      </div>

      {/* Track Info */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Track Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">Track 1</h4>
            </div>
            <p className="text-lg font-bold text-gray-900 mb-2">{results.track1.title}</p>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Duration: {results.track1.duration.toFixed(1)}s</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Tempo: {results.track1.tempo.toFixed(1)} BPM</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-indigo-900">Track 2</h4>
            </div>
            <p className="text-lg font-bold text-gray-900 mb-2">{results.track2.title}</p>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Duration: {results.track2.duration.toFixed(1)}s</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Tempo: {results.track2.tempo.toFixed(1)} BPM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Scores */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Analysis Components</h3>
        
        <div className="space-y-6">
          {/* Harmony/Chroma */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Harmony (Chroma)</span>
              <span className="font-bold text-lg">{(overall_similarity.component_scores.chroma_harmony * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${getScoreColor(overall_similarity.component_scores.chroma_harmony)}`}
                style={{ width: `${overall_similarity.component_scores.chroma_harmony * 100}%` }}
              />
            </div>
          </div>

          {/* Melody */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Melody Contour</span>
              <span className="font-bold text-lg">{(overall_similarity.component_scores.melody_contour * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${getScoreColor(overall_similarity.component_scores.melody_contour)}`}
                style={{ width: `${overall_similarity.component_scores.melody_contour * 100}%` }}
              />
            </div>
          </div>

          {/* Tempo */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Tempo Match</span>
              <span className="font-bold text-lg">{(overall_similarity.component_scores.tempo * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${getScoreColor(overall_similarity.component_scores.tempo)}`}
                style={{ width: `${overall_similarity.component_scores.tempo * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Analysis */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-5 h-5 text-purple-600" />
            <h4 className="font-semibold text-purple-900">Key Transposition</h4>
          </div>
          <p className="text-gray-700">
            {chroma_analysis.transposition_semitones === 0
              ? 'Both tracks are in the same key'
              : `Track 2 is ${Math.abs(chroma_analysis.transposition_semitones)} semitone${Math.abs(chroma_analysis.transposition_semitones) > 1 ? 's' : ''} ${chroma_analysis.transposition_semitones > 0 ? 'higher' : 'lower'} than Track 1`}
          </p>
        </div>
      </div>

      {/* Similar Segments */}
      {similar_segments.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Similar Segments ({similar_segments.length} found)
          </h3>
          <div className="space-y-3">
            {similar_segments.slice(0, 10).map((segment, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-green-700">Segment {index + 1}</span>
                  <span className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                    {(segment.similarity_score * 100).toFixed(0)}% match
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="text-gray-700">
                    <span className="font-semibold">{results.track1.title}:</span> {segment.track1_start_time.toFixed(1)}s - {segment.track1_end_time.toFixed(1)}s
                  </div>
                  <div className="text-gray-700">
                    <span className="font-semibold">{results.track2.title}:</span> {segment.track2_start_time.toFixed(1)}s - {segment.track2_end_time.toFixed(1)}s
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visualizations */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Visual Analysis</h3>
        <div className="space-y-6">
          {visualizations.map((viz, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b-2 border-gray-200">
                <h4 className="font-semibold text-gray-800 capitalize">
                  {viz.type.replace(/_/g, ' ')}
                </h4>
              </div>
              <div className="p-4 bg-white">
                {viz.base64 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`data:image/png;base64,${viz.base64}`}
                    alt={viz.filename}
                    className="w-full h-auto"
                  />
                ) : viz.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${viz.image_url}`}
                    alt={viz.filename}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    Visualization not available
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Text */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Detailed Analysis Summary</h3>
        <pre className="bg-gray-50 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap text-gray-700 border-2 border-gray-200">
          {summary}
        </pre>
      </div>
    </div>
  )
}
