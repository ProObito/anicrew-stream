import { useState } from "react";
import { Plus, Trash2, Save, ExternalLink } from "lucide-react";
import { useEpisodeLinks, useUpsertEpisodeLink, useDeleteEpisodeLink } from "@/hooks/useEpisodeLinks";
import { toast } from "sonner";

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
      });
      toast.success(`Episode ${epNum} saved!`);
      setTitle("");
      setEmbedUrl("");
      setDriveUrl("");
      setEpNum((n) => n + 1);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-display font-bold text-foreground mb-1">
        Edit Episodes — {animeName}
      </h3>
      <p className="text-xs text-muted-foreground mb-4">AniList ID: {anilistId}</p>

      {/* Add/Edit form */}
      <div className="space-y-3 mb-6">
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
          <label className="text-xs text-muted-foreground">Embed URL (iframe)</label>
          <input
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/.../preview"
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
