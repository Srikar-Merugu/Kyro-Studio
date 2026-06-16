// lib/newsdata.ts
// NewsData.io free tier: 200 credits/day — plenty for one daily briefing

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  pubDate: string;
  category: string;
  country?: string;
}

const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY!;
const BASE_URL = "https://newsdata.io/api/1/latest";

async function fetchNews(params: Record<string, string>): Promise<NewsArticle[]> {
  if (!NEWSDATA_API_KEY) {
    console.warn("⚠️ NEWSDATA_API_KEY not set — skipping international news");
    return [];
  }

  const url = new URL(BASE_URL);
  url.searchParams.set("apikey", NEWSDATA_API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json();

    if (data.status !== "success") return [];

    return (data.results || []).slice(0, 8).map((article: any) => ({
      title:       article.title || "",
      description: (article.description || "").slice(0, 400),
      source:      article.source_name || "Unknown",
      pubDate:     article.pubDate || new Date().toISOString(),
      category:    params.category || "general",
      country:     article.country?.[0] || "",
    }));
  } catch (err) {
    console.warn("NewsData.io fetch failed:", err);
    return [];
  }
}

export async function fetchInternationalNews(type: "general" | "technology") {
  if (type === "technology") {
    // Tech + AI news in English
    return fetchNews({
      language: "en",
      category: "technology",
      q: "AI OR artificial intelligence OR Meta OR marketing",
    });
  }

  // General world news — business focus
  return fetchNews({
    language: "en",
    category: "business,world",
  });
}
