import { useState } from "react";
import { Trash2, Save, ExternalLink, Import, Search, Loader2, Upload, Link2 } from "lucide-react";
import { useEpisodeLinks, useUpsertEpisodeLink, useDeleteEpisodeLink } from "@/hooks/useEpisodeLinks";
import { toast } from "sonner";

interface VideoVersion {
  label: string;
  embed_url: string;
  drive_url?: string;
}

interface Props {
  anilistId: string;
  animeName: string;
}

/** Convert any Drive/GoFile/other link to an embeddable URL */
function toEmbedUrl(url: string): string {
  if (!url) return "";
  // Google Drive: /file/d/ID/view → /file/d/ID/preview
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  // GoFile embed
  if (url.includes("gofile.io/d/")) {
    return url; // GoFile links work directly in iframe
  }
  // Already an embed/preview URL or any other URL — use as-is
  return url;
}

/** Convert any Drive link to a download/view URL */
function toDriveViewUrl(url: string): string {
  if (!url) return "";
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/view`;
  }
  return url;
}

const EpisodeLinkEditor = ({ anilistId, animeName }: Props) => {
  const { data: links, isLoading } = useEpisodeLinks(anilistId);
  const upsert = useUpsertEpisodeLink();
  const remove = useDeleteEpisodeLink();

  const [epNum, setEpNum] = useState(1);
  const [title, setTitle] = useState("");
  const [mainUrl, setMainUrl] = useState(""); // User pastes any Drive/GoFile/embed link
  const [versions, setVersions] = useState<VideoVersion[]>([]);
  const [newVerLabel, setNewVerLabel] = useState("");
  const [newVerUrl, setNewVerUrl] = useState("");

  // Import state
  const [showImport, setShowImport] = useState(false);
  const [importSearch, setImportSearch] = useState(animeName);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<any>(null);
  const [episodeList, setEpisodeList] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingEps, setLoadingEps] = useState(false);

  const edgeFnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aniwatch-scraper`;

  // Aniwatch search — just gets episode names/numbers
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

  // Import just fills in ep number & title — user adds links manually
  const handleImportEpisode = (ep: any) => {
    setEpNum(Number(ep.number));
    setTitle(ep.title || `Episode ${ep.number}`);
    setMainUrl("");
    setVersions([]);
    toast.success(`Ep ${ep.number} selected — now paste the Drive/GoFile link`);
  };

  // Import all — creates empty entries with just titles
  const handleImportAllTitles = async () => {
    if (!episodeList.length) return;
    for (const ep of episodeList) {
      try {
        await upsert.mutateAsync({
          anilist_id: anilistId,
          episode_number: Number(ep.number),
          title: ep.title || `Episode ${ep.number}`,
        });
      } catch { /* skip duplicates */ }
    }
    toast.success(`${episodeList.length} episode titles imported! Now add links.`);
  };

  // Import all WITH embed links from Aniwatch
  const [importingWithLinks, setImportingWithLinks] = useState(false);
  const [importProgress, setImportProgress] = useState("");

  const handleImportAllWithLinks = async () => {
    if (!selectedAnime) return;
    setImportingWithLinks(true);
    setImportProgress("Fetching embed links from Aniwatch...");
    try {
      const res = await fetch(`${edgeFnUrl}?action=batch-embeds&id=${encodeURIComponent(selectedAnime.id)}`);
      const data = await res.json();
      const episodes = data.episodes || [];
      
      if (!episodes.length) {
        toast.error("No episodes found");
        setImportingWithLinks(false);
        return;
      }

      let saved = 0;
      for (const ep of episodes) {
        setImportProgress(`Saving Ep ${ep.number}/${episodes.length}...`);
        try {
          await upsert.mutateAsync({
            anilist_id: anilistId,
            episode_number: Number(ep.number),
            title: ep.title || `Episode ${ep.number}`,
            embed_url: ep.sub_embed || ep.dub_embed || undefined,
            subtitle_tracks: ep.dub_embed ? [{ label: "Dub", embed_url: ep.dub_embed }] : [],
          });
          saved++;
        } catch { /* skip */ }
      }
      toast.success(`${saved} episodes imported with video links!`);
    } catch (e: any) {
      toast.error("Import failed: " + e.message);
    }
    setImportingWithLinks(false);
    setImportProgress("");
  };

  const handleSave = async () => {
    if (!mainUrl) {
      toast.error("Paste a Drive or embed link");
      return;
    }
    const embedUrl = toEmbedUrl(mainUrl);
    const driveUrl = toDriveViewUrl(mainUrl);

    try {
      await upsert.mutateAsync({
        anilist_id: anilistId,
        episode_number: epNum,
        title: title || `Episode ${epNum}`,
        embed_url: embedUrl,
        drive_url: driveUrl !== embedUrl ? driveUrl : undefined,
        subtitle_tracks: versions,
        audio_tracks: [],
      });
      toast.success(`Episode ${epNum} saved!`);
      setTitle("");
      setMainUrl("");
      setVersions([]);
      setEpNum((n) => n + 1);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addVersion = () => {
    if (!newVerUrl) return;
    const embed = toEmbedUrl(newVerUrl);
    const drive = toDriveViewUrl(newVerUrl);
    setVersions([...versions, {
      label: newVerLabel || "Version",
      embed_url: embed,
      drive_url: drive !== embed ? drive : undefined,
    }]);
    setNewVerLabel("");
    setNewVerUrl("");
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

      {/* Import Panel — fetches episode names only */}
      {showImport && (
        <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-4">
          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Search className="w-4 h-4" /> Search Aniwatch (episode list only)
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleImportAllWithLinks}
                      disabled={importingWithLinks}
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold transition disabled:opacity-50"
                    >
                      <Upload className="w-3 h-3" />
                      {importingWithLinks ? importProgress : `Import All with Links (${episodeList.length})`}
                    </button>
                    <button
                      onClick={handleImportAllTitles}
                      className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg text-xs font-bold border border-border transition"
                    >
                      Titles Only
                    </button>
                  </div>
                )}
              </div>

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
                      className="bg-background hover:bg-primary/20 border border-border rounded-lg p-2 text-xs font-medium text-foreground transition"
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
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Link2 className="w-3 h-3" /> Video Link (Drive / GoFile / any embed URL)
          </label>
          <input
            type="url"
            value={mainUrl}
            onChange={(e) => setMainUrl(e.target.value)}
            placeholder="Paste Drive link, GoFile link, or any embed URL..."
            className="w-full bg-secondary border border-border rounded-lg p-2 text-foreground text-sm focus:outline-none focus:border-primary"
          />
          {mainUrl && (
            <p className="text-xs text-muted-foreground mt-1">
              Embed: <span className="text-primary">{toEmbedUrl(mainUrl)}</span>
            </p>
          )}
        </div>

        {/* Alternate Video Versions (Sub/Dub/Hindi etc.) */}
        <div className="border border-border rounded-lg p-3 space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Alternate Versions ({versions.length}) — Dub/Hindi etc.
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
              className="flex-1 min-w-[80px] bg-background border border-border rounded p-1.5 text-foreground text-xs focus:outline-none focus:border-primary"
            />
            <input
              type="url"
              value={newVerUrl}
              onChange={(e) => setNewVerUrl(e.target.value)}
              placeholder="Paste Drive/GoFile/embed link"
              className="flex-[3] min-w-[150px] bg-background border border-border rounded p-1.5 text-foreground text-xs focus:outline-none focus:border-primary"
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
                      <a href={link.drive_url} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Drive
                      </a>
                    )}
                    {!link.embed_url && <span className="text-xs text-destructive">No link yet</span>}
                  </div>
                </div>
                <button
                  onClick={() => remove.mutate({ id: link.id, anilistId })}
                  className="text-destructive hover:text-destructive/80 p-2"
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
