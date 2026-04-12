const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RSS_FEEDS = [
  "https://nyaa.si/?page=rss&q=VARYG+DUAL+1080p&c=0_0&f=0",
  "https://subsplease.org/rss/?r=1080",
];

function parseXml(text: string): { title: string; link: string; pubDate: string }[] {
  const items: { title: string; link: string; pubDate: string }[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(text)) !== null) {
    const block = match[1];
    const t = block.match(/<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/);
    const l = block.match(/<link>(.*?)<\/link>/);
    const d = block.match(/<pubDate>(.*?)<\/pubDate>/);
    items.push({
      title: (t?.[1] || t?.[2] || "").trim(),
      link: (l?.[1] || "").trim(),
      pubDate: (d?.[1] || "").trim(),
    });
  }
  return items;
}

/** Extract anime name, episode number, quality from torrent title */
function extractInfo(title: string): { animeName: string; episode: number | null; quality: string } | null {
  // Common patterns: [Group] Anime Name - 01 (1080p) or [Group] Anime Name - S01E01 (1080p)
  // SubsPlease: [SubsPlease] Anime Name - 01 (1080p) [hash].mkv
  // VARYG: [VARYG] Anime Name - 01 DUAL 1080p.mkv

  let animeName = title;
  let episode: number | null = null;
  let quality = "1080p";

  // Remove group tag [...]
  animeName = animeName.replace(/^\[[^\]]*\]\s*/, "");
  
  // Extract quality
  const qMatch = animeName.match(/(480p|720p|1080p|2160p|4K)/i);
  if (qMatch) quality = qMatch[1];

  // Extract episode number: "S01E18" first, then " - 01"
  const seMatch = animeName.match(/S(\d+)E(\d+)/i);
  const dashMatch = animeName.match(/\s*-\s*(\d{1,4})(?:\s|v|\b)/i);
  const epWordMatch = animeName.match(/Episode\s*(\d{1,4})/i);
  
  if (seMatch) {
    episode = parseInt(seMatch[2], 10);
    animeName = animeName.substring(0, animeName.indexOf(seMatch[0])).trim();
  } else if (dashMatch) {
    episode = parseInt(dashMatch[1], 10);
    animeName = animeName.substring(0, animeName.indexOf(dashMatch[0])).trim();
  } else if (epWordMatch) {
    episode = parseInt(epWordMatch[1], 10);
    animeName = animeName.substring(0, animeName.indexOf(epWordMatch[0])).trim();
  }

  // Clean up remaining junk
  animeName = animeName
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/DUAL/gi, "")
    .replace(/\.(mkv|mp4|avi)/gi, "")
    .replace(/v\d+$/i, "")
    .trim();

  if (!animeName) return null;
  return { animeName, episode, quality };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "check") {
      // Fetch all RSS feeds and return parsed items
      const allItems: any[] = [];

      for (const feedUrl of RSS_FEEDS) {
        try {
          const resp = await fetch(feedUrl, {
            headers: { "User-Agent": "Mozilla/5.0" },
          });
          const text = await resp.text();
          const items = parseXml(text);
          
          for (const item of items.slice(0, 50)) { // Limit per feed
            const info = extractInfo(item.title);
            if (info) {
              allItems.push({
                rawTitle: item.title,
                animeName: info.animeName,
                episode: info.episode,
                quality: info.quality,
                link: item.link,
                pubDate: item.pubDate,
                source: feedUrl.includes("nyaa") ? "nyaa" : "subsplease",
              });
            }
          }
        } catch (e) {
          console.error(`Failed to fetch ${feedUrl}:`, e);
        }
      }

      return new Response(JSON.stringify({ items: allItems, count: allItems.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Use ?action=check" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("RSS monitor error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
