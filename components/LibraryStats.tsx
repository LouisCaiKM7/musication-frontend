'use client'

import { useEffect, useState } from 'react'
import { Library, Music2, Users } from 'lucide-react'
import { getLibraryStats, LibraryStats } from '@/lib/api'

export default function LibraryStatsComponent() {
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getLibraryStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load library stats:', error)
      // Use mock data for demo if API is not available
      setStats({
        totalTracks: 1247,
        genres: ['Pop', 'Rock', 'Jazz', 'Classical', 'Electronic'],
        artists: 856
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse text-gray-500">Loading library stats...</div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Library className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Music Library</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 bg-white rounded-lg p-4">
          <Music2 className="w-8 h-8 text-blue-600" />
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalTracks.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Tracks</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white rounded-lg p-4">
          <Users className="w-8 h-8 text-indigo-600" />
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.artists.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Artists</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-white rounded-lg p-4">
          <Library className="w-8 h-8 text-purple-600" />
          <div>
            <p className="text-2xl font-bold text-gray-800">{stats.genres.length}</p>
            <p className="text-sm text-gray-600">Genres</p>
          </div>
        </div>
      </div>
    </div>
  )
}
