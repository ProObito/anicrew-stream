import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useEpisodeLinks(anilistId: string) {
  return useQuery({
    queryKey: ["episode-links", anilistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episode_links")
        .select("*")
        .eq("anilist_id", anilistId)
        .order("episode_number", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!anilistId,
  });
}

export function useUpsertEpisodeLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (link: {
      anilist_id: string;
      episode_number: number;
      title?: string;
      embed_url?: string;
      drive_url?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("episode_links").upsert(
        { ...link, added_by: user?.id },
        { onConflict: "anilist_id,episode_number" }
      );
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["episode-links", vars.anilist_id] });
    },
  });
}

export function useDeleteEpisodeLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, anilistId }: { id: string; anilistId: string }) => {
      const { error } = await supabase.from("episode_links").delete().eq("id", id);
      if (error) throw error;
      return anilistId;
    },
    onSuccess: (anilistId) => {
      qc.invalidateQueries({ queryKey: ["episode-links", anilistId] });
    },
  });
}
