const API_BASE = "https://hianime-api-seven-teal.vercel.app";

async function fetchWithRetry(url: string, retries = 3, delay = 3000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 503 || res.status === 502) {
        // Server is waking up, retry
        if (i < retries - 1) {
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
      }
      return res;
    } catch (err) {
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("API unavailable after retries");
}

export async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetchWithRetry(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);

  const data = await res.json();
  if (typeof data === "object" && data !== null && "success" in data && (data as any).success === false) {
    const message =
      typeof (data as any).message === "string"
        ? (data as any).message
        : JSON.stringify((data as any).message ?? "Unknown API error");
    throw new Error(message);
  }

  return data;
}

// Pre-warm the API on app load (fire & forget)
fetch(`${API_BASE}/api/v1/home`).catch(() => {});
