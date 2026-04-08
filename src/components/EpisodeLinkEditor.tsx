import { useState } from "react";
import { Trash2, Save, ExternalLink, Import, Search, Loader2, FileText, Music } from "lucide-react";
import { useEpisodeLinks, useUpsertEpisodeLink, useDeleteEpisodeLink } from "@/hooks/useEpisodeLinks";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SubtitleTrack {
  label: string;
  lang: string;
  url: string;
  kind?: string;
}
interface AudioTrack {
  label: string;
  lang: string;
  url: string;
}

interface Props {
  anilistId: string;
  animeName: string;
}

const EpisodeLinkEditor = ({ anilistId, animeName }: Props) => {
  const { data: links, isLoading } = useEpisodeLinks(anilistId);
  const upsert = useUpsertEpisodeLink();
  const remove = useDeleteEpisodeLink();

  const [epNum, setEpNum] = useState(1);
  const [title, setTitle] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [driveUrl, setDriveUrl] = useState("");
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);

  // Import state
  const [showImport, setShowImport] = useState(false);
  const [importSearch, setImportSearch] = useState(animeName);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<any>(null);
  const [episodeList, setEpisodeList] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingEps, setLoadingEps] = useState(false);

  // Subtitle/audio manual add
  const [newSubLabel, setNewSubLabel] = useState("");
  const [newSubUrl, setNewSubUrl] = useState("");
  const [newAudioLabel, setNewAudioLabel] = useState("");
  const [newAudioUrl, setNewAudioUrl] = useState("");

  const edgeFnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aniwatch-scraper`;

  const handleSearch = async () => {
    if (!importSearch.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`${edgeFnUrl}?action=search&q=${encodeURIComponent(importSearch)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e: any) {
      toast.error("Search failed: " + e.message);
    }
    setSearching(false);
  };

  const handleSelectAnime = async (anime: any) => {
    setSelectedAnime(anime);
    setSearchResults([]);
    setLoadingEps(true);
    try {
      const res = await fetch(`${edgeFnUrl}?action=episodes&id=${encodeURIComponent(anime.id)}`);
      const data = await res.json();
      setEpisodeList(data.episodes || []);
    } catch (e: any) {
      toast.error("Failed to load episodes: " + e.message);
    }
    setLoadingEps(false);
  };

  const handleImportEpisode = async (ep: any) => {
    setImporting(true);
    try {
      const res = await fetch(`${edgeFnUrl}?action=sources&epId=${ep.dataId}`);
      const data = await res.json();

      const subSources = data.sub;
      const tracks: SubtitleTrack[] = [];

      if (subSources?.tracks) {
        for (const t of subSources.tracks) {
          if (t.kind === "captions" || t.kind === "subtitles" || t.label) {
            tracks.push({
              label: t.label || t.kind || "Unknown",
              lang: t.srclang || t.label || "und",
              url: t.file || t.src || "",
              kind: t.kind,
            });
          }
        }
      }

      const m3u8Url = subSources?.sources?.[0]?.file || subSources?.sources?.[0]?.url || "";

      setEpNum(Number(ep.number));
      setTitle(ep.title || `Episode ${ep.number}`);
      setEmbedUrl(m3u8Url);
      setSubtitleTracks(tracks);

      toast.success(`Episode ${ep.number} imported! Review and save.`);
    } catch (e: any) {
      toast.error("Import failed: " + e.message);
    }
    setImporting(false);
  };

  const handleSave = async () => {
    if (!embedUrl && !driveUrl) {
      toast.error("At least one link required");
      return;
    }
    try {
      await upsert.mutateAsync({
        anilist_id: anilistId,
        episode_number: epNum,
        title: title || `Episode ${epNum}`,
        embed_url: embedUrl || undefined,
        drive_url: driveUrl || undefined,
        subtitle_tracks: subtitleTracks,
        audio_tracks: audioTracks,
      });
      toast.success(`Episode ${epNum} saved!`);
      setTitle("");
      setEmbedUrl("");
      setDriveUrl("");
      setSubtitleTracks([]);
      setAudioTracks([]);
      setEpNum((n) => n + 1);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addSubtitle = () => {
    if (!newSubUrl) return;
    setSubtitleTracks([...subtitleTracks, { label: newSubLabel || "Subtitle", lang: "und", url: newSubUrl }]);
    setNewSubLabel("");
    setNewSubUrl("");
  };

  const addAudio = () => {
    if (!newAudioUrl) return;
    setAudioTracks([...audioTracks, { label: newAudioLabel || "Audio", lang: "und", url: newAudioUrl }]);
    setNewAudioLabel("");
    setNewAudioUrl("");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-bold text-foreground">
            Edit Episodes — {animeName}
          </h3>
          <p className="text-xs text-muted-foreground">AniList ID: {anilistId}</p>
        </div>
        <button
          onClick={() => setShowImport(!showImport)}
          className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-xl text-sm font-bold border border-border transition"
        >
          <Import className="w-4 h-4" />
          {showImport ? "Close Import" : "Import from Aniwatch"}
        </button>
      </div>

      {/* Import Panel */}
      {showImport && (
        <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Search className="w-4 h-4" /> Search Aniwatch
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={importSearch}
              onChange={(e) => setImportSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search anime..."
              className="flex-1 bg-background border border-border rounded-lg p-2 text-foreground text-sm focus:outline-none focus:border-primary"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold transition disabled:opacity-50"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {searchResults.map((r: any) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectAnime(r)}
                  className="w-full text-left p-2 hover:bg-background rounded-lg text-sm text-foreground transition"
                >
                  {r.title} <span className="text-muted-foreground">({r.id})</span>
                </button>
              ))}
            </div>
          )}

          {selectedAnime && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Selected: <span className="text-primary">{selectedAnime.title}</span>
              </p>
              {loadingEps ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading episodes...
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                  {episodeList.map((ep: any) => (
                    <button
                      key={ep.dataId}
                      onClick={() => handleImportEpisode(ep)}
                      disabled={importing}
                      className="bg-background hover:bg-primary/20 border border-border rounded-lg p-2 text-xs font-medium text-foreground transition disabled:opacity-50"
                    >
                      Ep {ep.number}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit form */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Episode #</label>
            <input
              type="number"
              min={1}
              value={epNum}
              onChange={(e) => setEpNum(Number(e.target.value))}
              className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Episode title"
              className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Embed / M3U8 URL</label>
          <input
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Drive/Download URL</label>
          <input
            type="url"
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Subtitles */}
        <div className="border border-border rounded-lg p-3 space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3 h-3" /> Subtitles ({subtitleTracks.length})
          </h4>
          {subtitleTracks.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-foreground flex-1 truncate">{s.label} — {s.url.slice(0, 50)}...</span>
              <button onClick={() => setSubtitleTracks(subtitleTracks.filter((_, j) => j !== i))} className="text-destructive p-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubLabel}
              onChange={(e) => setNewSubLabel(e.target.value)}
              placeholder="Label (e.g. English)"
              className="flex-1 bg-background border border-border rounded p-1.5 text-foreground text-xs focus:outline-none focus:border-primary"
            />
            <input
              type="url"
              value={newSubUrl}
              onChange={(e) => setNewSubUrl(e.target.value)}
              placeholder="Subtitle URL (.vtt/.srt)"
              className="flex-[2] bg-background border border-border rounded p-1.5 text-foreground text-xs focus:outline-none focus:border-primary"
            />
            <button onClick={addSubtitle} className="text-primary text-xs font-bold px-2">+Add</button>
          </div>
        </div>

        {/* Audio Tracks */}
        <div className="border border-border rounded-lg p-3 space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Music className="w-3 h-3" /> Audio Tracks ({audioTracks.length})
          </h4>
          {audioTracks.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="text-foreground flex-1 truncate">{a.label} — {a.url.slice(0, 50)}...</span>
              <button onClick={() => setAudioTracks(audioTracks.filter((_, j) => j !== i))} className="text-destructive p-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newAudioLabel}
              onChange={(e) => setNewAudioLabel(e.target.value)}
              placeholder="Label (e.g. Japanese)"
              className="flex-1 bg-background border border-border rounded p-1.5 text-foreground text-xs focus:outline-none focus:border-primary"
            />
            <input
              type="url"
              value={newAudioUrl}
              onChange={(e) => setNewAudioUrl(e.target.value)}
              placeholder="Audio URL"
              className="flex-[2] bg-background border border-border rounded p-1.5 text-foreground text-xs focus:outline-none focus:border-primary"
            />
            <button onClick={addAudio} className="text-primary text-xs font-bold px-2">+Add</button>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={upsert.isPending}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {upsert.isPending ? "Saving..." : "Save Episode"}
        </button>
      </div>

      {/* Existing links */}
      <div className="border-t border-border pt-4">
        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Added Episodes ({links?.length ?? 0})
        </h4>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : !links?.length ? (
          <p className="text-sm text-muted-foreground">No episodes added yet</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between bg-secondary rounded-lg p-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Ep {link.episode_number} — {link.title || "Untitled"}
                  </p>
                  <div className="flex gap-3 mt-1">
                    {link.embed_url && (
                      <a href={link.embed_url} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Embed
                      </a>
                    )}
                    {link.drive_url && (
                      <a href={link.drive_url} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Drive
                      </a>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {(link as any).subtitle_tracks?.length || 0} subs · {(link as any).audio_tracks?.length || 0} audio
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => remove.mutate({ id: link.id, anilistId })}
                  className="text-destructive hover:text-destructive/80 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeLinkEditor;
