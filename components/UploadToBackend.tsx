"use client"
import { useState } from 'react'
import { uploadTrack } from '@/lib/api'

export default function UploadToBackend({ onUploaded }: { onUploaded: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setErr(null)
    try {
      await uploadTrack(file, title || file.name)
      setFile(null)
      setTitle('')
      onUploaded()
    } catch (e) {
      const error = e as Error;
      setErr(error.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <input className="border rounded px-3 py-2" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit" disabled={!file || loading} className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-50">
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {err && <div className="text-red-600 text-sm">{err}</div>}
    </form>
  )
}
