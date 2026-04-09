import { useState } from "react";
import { Trash2, Save, ExternalLink, Import, Search, Loader2, Upload } from "lucide-react";
import { useEpisodeLinks, useUpsertEpisodeLink, useDeleteEpisodeLink } from "@/hooks/useEpisodeLinks";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VideoVersion {
  label: string;
  embed_url: string;
  drive_url?: string;
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
  // Alternate video versions (sub, dub, hindi etc)
  const [versions, setVersions] = useState<VideoVersion[]>([]);
  const [newVerLabel, setNewVerLabel] = useState("");
  const [newVerEmbed, setNewVerEmbed] = useState("");
  const [newVerDrive, setNewVerDrive] = useState("");

  // Import state
  const [showImport, setShowImport] = useState(false);
  const [importSearch, setImportSearch] = useState(animeName);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<any>(null);
  const [episodeList, setEpisodeList] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importingAll, setImportingAll] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingEps, setLoadingEps] = useState(false);
  const [importProgress, setImportProgress] = useState("");

  const edgeFnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aniwatch-scraper`;
  const driveFnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/drive-upload`;

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

  const uploadToDrive = async (fileUrl: string, fileName: string): Promise<{ driveUrl: string; embedUrl: string } | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(driveFnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          action: "upload_from_url",
          fileUrl,
          fileName,
        }),
      });
      const data = await res.json();
      if (data.error) {
        console.error("Drive upload error:", data.error);
        return null;
      }
      return { driveUrl: data.driveUrl, embedUrl: data.embedUrl };
    } catch (e) {
      console.error("Drive upload failed:", e);
      return null;
    }
  };

  const handleImportEpisode = async (ep: any, autoSave = false) => {
    setImporting(true);
    setImportProgress(`Fetching sources for Ep ${ep.number}...`);
    try {
      const res = await fetch(`${edgeFnUrl}?action=sources&epId=${ep.dataId}`);
      const data = await res.json();

      const subSources = data.sub;
      const dubSources = data.dub;

      const m3u8Url = subSources?.sources?.[0]?.file || subSources?.sources?.[0]?.url || "";
      const dubM3u8 = dubSources?.sources?.[0]?.file || dubSources?.sources?.[0]?.url || "";

      // Upload sub to Drive
      let subDrive: { driveUrl: string; embedUrl: string } | null = null;
      if (m3u8Url) {
        setImportProgress(`Uploading Ep ${ep.number} (Sub) to Drive...`);
        subDrive = await uploadToDrive(m3u8Url, `${animeName} - Ep ${ep.number} Sub.mp4`);
      }

      // Upload dub to Drive
      let dubDrive: { driveUrl: string; embedUrl: string } | null = null;
      if (dubM3u8) {
        setImportProgress(`Uploading Ep ${ep.number} (Dub) to Drive...`);
        dubDrive = await uploadToDrive(dubM3u8, `${animeName} - Ep ${ep.number} Dub.mp4`);
      }

      // Build versions array for alternate tracks
      const importedVersions: VideoVersion[] = [];
      if (dubM3u8 || dubDrive) {
        importedVersions.push({
          label: "Dub",
          embed_url: dubDrive?.embedUrl || dubM3u8,
          drive_url: dubDrive?.driveUrl,
        });
      }

      const mainEmbed = subDrive?.embedUrl || m3u8Url;
      const mainDrive = subDrive?.driveUrl || "";

      if (autoSave) {
        // Auto-save directly
        await upsert.mutateAsync({
          anilist_id: anilistId,
          episode_number: Number(ep.number),
          title: ep.title || `Episode ${ep.number}`,
          embed_url: mainEmbed || undefined,
          drive_url: mainDrive || undefined,
          subtitle_tracks: importedVersions, // Using subtitle_tracks to store alternate versions
          audio_tracks: [],
        });
        toast.success(`Ep ${ep.number} imported & saved!`);
      } else {
        setEpNum(Number(ep.number));
        setTitle(ep.title || `Episode ${ep.number}`);
        setEmbedUrl(mainEmbed);
        setDriveUrl(mainDrive);
        setVersions(importedVersions);
        toast.success(`Ep ${ep.number} imported! Review and save.`);
      }
    } catch (e: any) {
      toast.error(`Import Ep ${ep.number} failed: ` + e.message);
    }
    setImporting(false);
    setImportProgress("");
  };

  const handleImportAll = async () => {
    if (!episodeList.length) return;
    setImportingAll(true);
    for (const ep of episodeList) {
      await handleImportEpisode(ep, true);
    }
    setImportingAll(false);
    toast.success("All episodes imported!");
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
        subtitle_tracks: versions, // alternate video versions stored here
        audio_tracks: [],
      });
      toast.success(`Episode ${epNum} saved!`);
      setTitle("");
      setEmbedUrl("");
      setDriveUrl("");
      setVersions([]);
      setEpNum((n) => n + 1);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addVersion = () => {
    if (!newVerEmbed && !newVerDrive) return;
    setVersions([...versions, { label: newVerLabel || "Version", embed_url: newVerEmbed, drive_url: newVerDrive || undefined }]);
    setNewVerLabel("");
    setNewVerEmbed("");
    setNewVerDrive("");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">
                  Selected: <span className="text-primary">{selectedAnime.title}</span>
                </p>
                {episodeList.length > 0 && (
                  <button
                    onClick={handleImportAll}
                    disabled={importingAll || importing}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50"
                  >
                    <Upload className="w-3 h-3" />
                    {importingAll ? "Importing..." : `Import All (${episodeList.length})`}
                  </button>
                )}
              </div>

              {importProgress && (
                <div className="flex items-center gap-2 text-xs text-primary mb-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> {importProgress}
                </div>
              )}

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
                      disabled={importing || importingAll}
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
          <label className="text-xs text-muted-foreground">Main Embed URL (Drive/iframe)</label>
          <input
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/.../preview"
            className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Drive Download URL</label>
          <input
            type="url"
            value={driveUrl}
            onChange={(e) => setDriveUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/.../view"
            className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Alternate Video Versions (Sub/Dub/Hindi etc.) */}
        <div className="border border-border rounded-lg p-3 space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Alternate Versions ({versions.length}) — Sub/Dub/Hindi etc.
          </h4>
          {versions.map((v, i) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-secondary/50 rounded-lg p-2">
              <span className="text-primary font-bold uppercase">{v.label}</span>
              <span className="text-foreground flex-1 truncate">{v.embed_url?.slice(0, 50)}...</span>
              <button onClick={() => setVersions(versions.filter((_, j) => j !== i))} className="text-destructive p-1">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={newVerLabel}
              onChange={(e) => setNewVerLabel(e.target.value)}
              placeholder="Label (Dub, Hindi...)"
              className="flex-1 min-w-[100px] bg-background border border-border rounded p-1.5 text-foreground text-xs focus:outline-none focus:border-primary"
            />
            <input
              type="url"
              value={newVerEmbed}
              onChange={(e) => setNewVerEmbed(e.target.value)}
              placeholder="Embed URL"
              className="flex-[2] min-w-[150px] bg-background border border-border rounded p-1.5 text-foreground text-xs focus:outline-none focus:border-primary"
            />
            <input
              type="url"
              value={newVerDrive}
              onChange={(e) => setNewVerDrive(e.target.value)}
              placeholder="Drive URL (optional)"
              className="flex-[2] min-w-[150px] bg-background border border-border rounded p-1.5 text-foreground text-xs focus:outline-none focus:border-primary"
            />
            <button onClick={addVersion} className="text-primary text-xs font-bold px-2">+Add</button>
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
                      {(link as any).subtitle_tracks?.length || 0} versions
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
