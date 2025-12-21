'use client'

import { Track } from '@/lib/api'
import { Music, Check } from 'lucide-react'

interface TrackSelectorProps {
  tracks: Track[]
  selectedTrack: Track | null
  onSelect: (track: Track) => void
  excludeTrackId?: string
}

export default function TrackSelector({ 
  tracks, 
  selectedTrack, 
  onSelect,
  excludeTrackId 
}: TrackSelectorProps) {
  const availableTracks = tracks.filter(track => track.id !== excludeTrackId)

  if (availableTracks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tracks available. Please upload some tracks first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {availableTracks.map((track) => {
        const isSelected = selectedTrack?.id === track.id
        
        return (
          <button
            key={track.id}
            onClick={() => onSelect(track)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              isSelected
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {isSelected ? <Check className="w-5 h-5" /> : <Music className="w-5 h-5" />}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">
                  {track.title || 'Untitled Track'}
                </h4>
                <div className="flex gap-4 text-sm text-gray-600 mt-1">
                  {track.duration_seconds && (
                    <span>{Math.floor(track.duration_seconds / 60)}:{String(Math.floor(track.duration_seconds % 60)).padStart(2, '0')}</span>
                  )}
                  {track.sample_rate && (
                    <span>{(track.sample_rate / 1000).toFixed(1)} kHz</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
