"use client";
import { useEffect, useState } from "react";
import { listTracks, deleteTrack, analyzeTrack, getTrack, type Track, type MusicMatch } from "@/lib/api";
import { Trash2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import MusicMatchResults from "./MusicMatchResults";

export default function TrackList({ refreshToken }: { refreshToken: number }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);

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

  const handleAnalyze = async (trackId: string) => {
    setAnalyzing(trackId);
    try {
      const result = await analyzeTrack(trackId);
      
      // Refresh track data to get analysis results
      if (result.analysis?.status === 'completed') {
        const updatedTrack = await getTrack(trackId);
        setTracks((prev) =>
          prev.map((t) => (t.id === trackId ? updatedTrack.track : t))
        );
        setExpandedTrack(trackId); // Auto-expand to show results
      }
      
      // Show notification
      if (result.analysis?.status === 'completed') {
        const summary = result.analysis?.summary || 'Analysis completed!';
        alert(`✅ ${summary}`);
      } else if (result.analysis?.status === 'failed') {
        alert(`❌ Analysis failed: ${result.analysis?.summary || 'Unknown error'}`);
      }
    } catch (e) {
      const error = e as Error;
      alert(error?.message || "Failed to start analysis");
    } finally {
      setAnalyzing(null);
    }
  };

  if (loading) return <div>Loading tracks...</div>;
  if (err) return <div style={{ color: "red" }}>{err}</div>;
  if (!tracks.length) return <div>No tracks yet.</div>;

  return (
    <div className="grid gap-3">
      {tracks.map((t) => {
        const latestAnalysis = t.analyses && t.analyses.length > 0 
          ? t.analyses[t.analyses.length - 1] 
          : null;
        const matches = latestAnalysis?.artifacts?.[0]?.data_json as MusicMatch[] | undefined;
        const hasResults = latestAnalysis?.status === 'completed' && matches && matches.length > 0;
        const hasCompletedAnalysis = latestAnalysis?.status === 'completed';
        const isProcessing = latestAnalysis && !['completed', 'failed'].includes(latestAnalysis.status);
        const isExpanded = expandedTrack === t.id;
        
        return (
          <div key={t.id} className="border rounded-xl p-4 relative">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-semibold flex-1">{t.title}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAnalyze(t.id)}
                  disabled={analyzing === t.id}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Identify music"
                >
                  {analyzing === t.id ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deleting === t.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete track"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <audio controls src={t.audio_url} className="w-full mb-2" />
            <div className="text-xs text-gray-500">
              {t.uploaded_at ? new Date(t.uploaded_at).toLocaleString() : 'Unknown date'}
            </div>
            
            {/* Show analysis results - both success, no matches, and failed */}
            {hasCompletedAnalysis && (
              <div className="mt-3">
                <button
                  onClick={() => setExpandedTrack(isExpanded ? null : t.id)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Identification Results
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      {hasResults 
                        ? `Show Identification Results (${matches?.length || 0} match${matches?.length !== 1 ? 'es' : ''})`
                        : 'Show Identification Results (No matches found)'
                      }
                    </>
                  )}
                </button>
                
                {isExpanded && (
                  <MusicMatchResults 
                    matches={matches || []} 
                    summary={latestAnalysis?.summary} 
                  />
                )}
              </div>
            )}
            
            {/* Show processing status */}
            {isProcessing && (
              <div className="mt-3 p-3 rounded-lg text-sm bg-yellow-50 border border-yellow-200 text-yellow-700">
                ⏳ {latestAnalysis?.summary || 'Processing...'}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
