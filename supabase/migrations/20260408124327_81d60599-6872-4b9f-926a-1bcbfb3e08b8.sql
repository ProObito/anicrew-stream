
ALTER TABLE public.episode_links
  ADD COLUMN IF NOT EXISTS subtitle_tracks jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS audio_tracks jsonb DEFAULT '[]'::jsonb;
