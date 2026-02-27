const API_BASE = "https://hianimeapi-1vww.onrender.com";

export async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
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

