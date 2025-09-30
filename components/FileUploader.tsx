'use client'

import { useState, useRef } from 'react'
import { Upload, Music, X, FileAudio } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onClear: () => void
}

export default function FileUploader({ onFileSelect, selectedFile, onClear }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (isAudioFile(file)) {
        onFileSelect(file)
      } else {
        alert('Please upload an audio file (MP3, WAV, FLAC, M4A, OGG)')
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (isAudioFile(file)) {
        onFileSelect(file)
      } else {
        alert('Please upload an audio file (MP3, WAV, FLAC, M4A, OGG)')
      }
    }
  }

  const isAudioFile = (file: File): boolean => {
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/ogg', 'audio/x-m4a']
    const audioExtensions = ['.mp3', '.wav', '.flac', '.m4a', '.ogg']
    
    return audioTypes.includes(file.type) || 
           audioExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!selectedFile ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300',
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-105'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.flac,.m4a,.ogg"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-4">
            <div className={cn(
              'p-4 rounded-full transition-colors',
              isDragging ? 'bg-blue-100' : 'bg-gray-100'
            )}>
              <Upload className={cn(
                'w-12 h-12 transition-colors',
                isDragging ? 'text-blue-600' : 'text-gray-500'
              )} />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {isDragging ? 'Drop your audio file here' : 'Upload Audio File'}
              </h3>
              <p className="text-gray-500 text-sm">
                Drag and drop or click to browse
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Supported formats: MP3, WAV, FLAC, M4A, OGG
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-blue-500 rounded-xl p-6 bg-blue-50">
          <button
            onClick={onClear}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-blue-100 transition-colors"
            aria-label="Clear file"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <FileAudio className="w-8 h-8 text-blue-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-gray-800 truncate">
                {selectedFile.name}
              </h4>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  Audio File
                </span>
                <span>{formatFileSize(selectedFile.size)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
