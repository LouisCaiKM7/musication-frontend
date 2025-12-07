"use client";
import { MusicMatch } from "@/lib/api";
import { ExternalLink, Music, Award } from "lucide-react";

interface MusicMatchResultsProps {
  matches: MusicMatch[];
  summary?: string | null;
}


export default function MusicMatchResults({ matches, summary }: MusicMatchResultsProps) {
  const hasMatches = matches && matches.length > 0;

  return (
    <div className="mt-3 space-y-3">
      {summary && (
        <div className={`p-3 rounded-lg border ${
          hasMatches 
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-2">
            {hasMatches ? (
              <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <Music className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm font-medium ${
              hasMatches ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {summary}
            </p>
          </div>
        </div>
      )}
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-4">
        <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Music className="w-4 h-4 text-blue-600" />
          Music Identification Results
        </h4>
        
        {hasMatches ? (
          <div className="space-y-2">
            {matches.map((match, index) => (
              <div
                key={match.recording_id}
                className={`p-3 rounded-lg border ${
                  index === 0
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {index === 0 && (
                        <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                      <p className="font-semibold text-gray-900 truncate">
                        {match.artist} - {match.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span className={`font-medium ${
                        match.score >= 90 ? 'text-green-600' :
                        match.score >= 75 ? 'text-yellow-600' :
                        'text-orange-600'
                      }`}>
                        {match.score}% match
                      </span>
                      <a
                        href={match.musicbrainz_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        MusicBrainz
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-white border border-gray-200">
            <div className="text-center">
              <div className="text-4xl mb-2">🔍</div>
              <p className="font-medium text-gray-800 mb-1">No Matches Found</p>
              <p className="text-sm text-gray-600">
                This audio could not be identified in the MusicBrainz/Acoustid database.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                The track might be original, rare, or not yet indexed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
