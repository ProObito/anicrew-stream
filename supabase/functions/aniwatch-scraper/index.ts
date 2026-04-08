const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BASE_URL = "https://aniwatchtv.to";
const HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};
const XHR_HEADERS = { ...HEADERS, "X-Requested-With": "XMLHttpRequest" };

// ─── Megacloud Decryption (ported from Python) ───
function hashStr(key: string): number {
  let v = 0;
  for (const ch of key) v = ((v * 31 + ch.charCodeAt(0)) & 0xffffffff) >>> 0;
  return v;
}
function lcg(n: number): number {
  return ((n * 1103515245 + 12345) & 0x7fffffff) >>> 0;
}
function shuffleSources(sources: string[], key: string): string[] {
  if (!key) return sources;
  const arrCount = Math.floor(sources.length / key.length);
  const arrays: string[][] = Array.from({ length: arrCount }, () =>
    Array(key.length).fill("")
  );
  const keyDict = [...key].map((c, i) => ({ i, c }));
  const sorted = [...keyDict].sort((a, b) => a.c.localeCompare(b.c));
  let p = 0;
  for (const { i: idx } of sorted) {
    for (let ai = 0; ai < arrCount; ai++) {
      if (p < sources.length) {
        arrays[ai][idx] = sources[p];
        p++;
      }
    }
  }
  return arrays.flat();
}
function processSources(encrypted: string, key: string): string {
  let currentHash = hashStr(key);
  const newSources: string[] = [];
  for (const ch of encrypted) {
    currentHash = lcg(currentHash);
    const val1 = ch.charCodeAt(0) - 32;
    const val2 = currentHash % 95;
    newSources.push(String.fromCharCode(((val1 - val2 + 95) % 95) + 32));
  }
  return shuffleSources(newSources, key).join("");
}

function extractClientKey(html: string): string {
  const m = html.match(
    /([a-zA-Z0-9]{48})|x: "([a-zA-Z0-9]{16})", y: "([a-zA-Z0-9]{16})", z: "([a-zA-Z0-9]{16})"/
  );
  if (!m) return "";
  if (m[1]) return m[1];
  return [m[2], m[3], m[4]].filter(Boolean).join("");
}

async function megacloudExtract(embedUrl: string) {
  const sidMatch = embedUrl.match(/e-1\/([a-zA-Z0-9]+)/);
  if (!sidMatch) return { sources: [], tracks: [] };
  const sid = sidMatch[1];
  const baseUrl = "https://megacloud.tv";
  const fixedEmbed = embedUrl.replace(".blog", ".tv");

  const headers = {
    ...HEADERS,
    origin: baseUrl,
    referer: "https://aniwatchtv.to/",
  };

  const htmlResp = await fetch(fixedEmbed, { headers });
  const html = await htmlResp.text();
  const clientKey = extractClientKey(html);

  const srcUrl = `${baseUrl}/embed-2/v3/e-1/getSources?id=${sid}&_k=${clientKey}`;
  const srcResp = await fetch(srcUrl, {
    headers: { ...headers, referer: fixedEmbed },
  });
  const resp = await srcResp.json();

  if (typeof resp.sources === "string") {
    const decrypted = processSources(resp.sources, clientKey);
    try {
      resp.sources = JSON.parse(decrypted);
    } catch {
      resp.sources = [];
    }
  }
  if (!resp.sources) resp.sources = [];
  if (!resp.tracks) resp.tracks = [];
  return resp;
}

// ─── Aniwatch Scraping ───
async function searchAnime(query: string) {
  const url = `${BASE_URL}/search?keyword=${encodeURIComponent(query)}`;
  const resp = await fetch(url, { headers: HEADERS });
  const html = await resp.text();

  const results: { title: string; id: string; url: string }[] = [];
  const seen = new Set<string>();

  // Match all anchor tags with href containing /watch/ and a title attribute
  const linkRegex = /href="(\/[^"]*)"[^>]*title="([^"]+)"/g;
  let match;
  while ((match = linkRegex.exec(html)) !== null && results.length < 15) {
    const href = match[1];
    const title = match[2];
    // Only anime watch links
    if (!href.includes("?ref=search") && !href.startsWith("/watch/")) continue;
    const cleanHref = href.split("?")[0];
    const animeId = cleanHref.split("/").pop() || "";
    if (!animeId || seen.has(animeId)) continue;
    seen.add(animeId);
    results.push({
      title: title.replace(/&#39;/g, "'").replace(/&amp;/g, "&"),
      id: animeId,
      url: `${BASE_URL}${cleanHref}`,
    });
  }

  return results;
}

async function getEpisodeList(animeId: string) {
  // Extract numeric ID from anime slug like "naruto-shippuden-355"
  const numericId = animeId.split("-").pop();
  const url = `${BASE_URL}/ajax/v2/episode/list/${numericId}`;
  const resp = await fetch(url, { headers: XHR_HEADERS });
  const json = await resp.json();
  const html = json.html || "";

  const episodes: {
    dataId: string;
    number: string;
    title: string;
  }[] = [];
  const epRegex =
    /data-id="(\d+)"[^>]*data-number="(\d+)"[^>]*title="([^"]*)"/g;
  let m;
  while ((m = epRegex.exec(html)) !== null) {
    episodes.push({ dataId: m[1], number: m[2], title: m[3].replace(/&#39;/g, "'") });
  }
  return episodes;
}

async function getEpisodeSources(epDataId: string) {
  // Get servers
  const serverUrl = `${BASE_URL}/ajax/v2/episode/servers?episodeId=${epDataId}`;
  const serverResp = await fetch(serverUrl, { headers: XHR_HEADERS });
  const serverJson = await serverResp.json();
  const serverHtml = serverJson.html || "";

  const result: { sub: any; dub: any } = { sub: null, dub: null };

  for (const dtype of ["sub", "dub"] as const) {
    const pattern = new RegExp(
      `data-type="${dtype}" data-id="(\\d+)"[^>]+data-server-id="(\\d+)"`,
      "g"
    );
    const matches: { dataId: string; serverId: string }[] = [];
    let sm;
    while ((sm = pattern.exec(serverHtml)) !== null) {
      matches.push({ dataId: sm[1], serverId: sm[2] });
    }
    // Priority: server 1 (MegaCloud), then 4 (VidSrc)
    const priority: Record<string, number> = { "1": 1, "4": 2 };
    matches.sort(
      (a, b) => (priority[a.serverId] || 99) - (priority[b.serverId] || 99)
    );

    for (const { dataId } of matches) {
      try {
        const srcUrl = `${BASE_URL}/ajax/v2/episode/sources?id=${dataId}`;
        const srcResp = await fetch(srcUrl, { headers: XHR_HEADERS });
        const srcJson = await srcResp.json();
        const embedLink = srcJson.link;
        if (
          embedLink &&
          (embedLink.toLowerCase().includes("megacloud") ||
            embedLink.toLowerCase().includes("rapid-cloud") ||
            embedLink.toLowerCase().includes("cloud-stream"))
        ) {
          const extracted = await megacloudExtract(embedLink);
          if (extracted.sources?.length) {
            result[dtype] = extracted;
            break;
          }
        }
      } catch (e) {
        console.error(`Source extraction error for ${dtype}:`, e);
      }
    }
  }

  return result;
}

// ─── Handler ───
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "search") {
      const query = url.searchParams.get("q") || "";
      const results = await searchAnime(query);
      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "episodes") {
      const animeId = url.searchParams.get("id") || "";
      const episodes = await getEpisodeList(animeId);
      return new Response(JSON.stringify({ episodes }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "sources") {
      const epId = url.searchParams.get("epId") || "";
      const sources = await getEpisodeSources(epId);
      return new Response(JSON.stringify(sources), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: search, episodes, sources" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Scraper error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
