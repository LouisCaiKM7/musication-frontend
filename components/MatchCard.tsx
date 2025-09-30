'use client'

import { useState } from 'react'
import { Music, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { SimilarityResult, getVisualizationUrl } from '@/lib/api'
import { getSimilarityColor, getSimilarityEmoji, getSimilarityLabel, formatDuration } from '@/lib/utils'

interface MatchCardProps {
  match: SimilarityResult
}

export default function MatchCard({ match }: MatchCardProps) {
  const [expanded, setExpanded] = useState(false)

  const formatSegments = (segments: Array<{ start1: number; end1: number; start2: number; end2: number }>) => {
    if (segments.length === 0) return 'No specific segments'
    const first = segments[0]
    return `${formatDuration(first.start1)}-${formatDuration(first.end1)} ↔ ${formatDuration(first.start2)}-${formatDuration(first.end2)}`
  }

  return (
    <div className="border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-6 bg-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-gray-400">#{match.rank}</div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Music className="w-5 h-5" />
                {match.title}
              </h3>
              <p className="text-gray-600">{match.artist}</p>
              {match.album && <p className="text-sm text-gray-500">Album: {match.album}</p>}
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full border-2 font-semibold ${getSimilarityColor(match.similarityScore)}`}>
            {getSimilarityEmoji(match.similarityScore)} {match.similarityScore}% Similar
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Matched: {formatSegments(match.matchedSegments)}
          </span>
          {match.fingerprintMatch && (
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
              Fingerprint Match
            </span>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Hide Detailed Analysis
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              View Detailed Analysis
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div className="bg-gray-50 p-6 border-t-2">
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                📊 Fingerprint Analysis
              </h4>
              <div className="bg-white rounded-lg p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getVisualizationUrl(match.visualizationPaths.fingerprint)}
                  alt="Fingerprint visualization"
                  className="w-full h-auto rounded"
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🎼 Melody Similarity Heatmap
              </h4>
              <div className="bg-white rounded-lg p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getVisualizationUrl(match.visualizationPaths.chromaHeatmap)}
                  alt="Chroma heatmap"
                  className="w-full h-auto rounded"
                />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🎵 DTW Alignment Path
              </h4>
              <div className="bg-white rounded-lg p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getVisualizationUrl(match.visualizationPaths.dtwPath)}
                  alt="DTW path"
                  className="w-full h-auto rounded"
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">💡 Analysis Summary</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• <strong>Similarity Level:</strong> {getSimilarityLabel(match.similarityScore)}</li>
                <li>• <strong>Melody Similarity:</strong> {match.melodySimilarity}%</li>
                <li>• <strong>Fingerprint Match:</strong> {match.fingerprintMatch ? 'Yes (Possible duplicate)' : 'No'}</li>
                <li>• <strong>Matched Segments:</strong> {match.matchedSegments.length} section(s)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
