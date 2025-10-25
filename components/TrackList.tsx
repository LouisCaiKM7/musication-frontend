"use client";
import { useEffect, useState } from "react";
import { listTracks, deleteTrack, type Track } from "@/lib/api";
import { Trash2 } from "lucide-react";

export default function TrackList({ refreshToken }: { refreshToken: number }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr(null);
    listTracks()
      .then((data: { tracks: Track[] } | Track[]) => {
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : data.tracks;
        setTracks(arr || []);
      })
      .catch((e: Error) => setErr(e?.message || "Failed to load tracks"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [refreshToken]);

  const handleDelete = async (trackId: string) => {
    if (!confirm("Are you sure you want to delete this track?")) return;
    
    setDeleting(trackId);
    try {
      await deleteTrack(trackId);
      // Remove from local state
      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    } catch (e) {
      const error = e as Error;
      alert(error?.message || "Failed to delete track");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div>Loading tracks...</div>;
  if (err) return <div style={{ color: "red" }}>{err}</div>;
  if (!tracks.length) return <div>No tracks yet.</div>;

  return (
    <div className="grid gap-3">
      {tracks.map((t) => (
        <div key={t.id} className="border rounded-xl p-4 relative">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="font-semibold flex-1">{t.title}</div>
            <button
              onClick={() => handleDelete(t.id)}
              disabled={deleting === t.id}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete track"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <audio controls src={t.audio_url} className="w-full mb-2" />
          <div className="text-xs text-gray-500">
            {t.uploaded_at ? new Date(t.uploaded_at).toLocaleString() : 'Unknown date'}
          </div>
        </div>
      ))}
    </div>
  );
}
