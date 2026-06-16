// lib/rss.ts
// Fetches Croatian RSS feeds — no API key needed, always free

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

const CROATIAN_FEEDS = [
  { url: "https://www.poslovni.hr/feed",        source: "Poslovni.hr",  category: "business" },
  { url: "https://www.index.hr/rss/vijesti",     source: "Index.hr",     category: "general"  },
  { url: "https://www.jutarnji.hr/feed",         source: "Jutarnji.hr",  category: "general"  },
  { url: "https://www.bug.hr/rss",               source: "Bug.hr",       category: "tech"     },
  { url: "https://www.vecernji.hr/feed",         source: "Večernji.hr",  category: "general"  },
  { url: "https://www.tportal.hr/feed",          source: "tPortal.hr",   category: "general"  },
];

const REAL_ESTATE_FEEDS = [
  // Njuškalo saved search for Sesvete nekretnine (replace with your actual saved search RSS)
  { url: "https://www.njuskalo.hr/rss/nekretnine?location=sesvete", source: "Njuškalo", category: "real-estate" },
];

const META_MARKETING_FEEDS = [
  { url: "https://feeds.feedburner.com/mktgblog",                    source: "Marketing Week",  category: "marketing" },
  { url: "https://www.socialmediaexaminer.com/feed/",                source: "SM Examiner",     category: "marketing" },
  { url: "https://techcrunch.com/feed/",                             source: "TechCrunch",      category: "tech"     },
  { url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml", source: "The Verge AI", category: "ai" },
];

async function parseFeed(feedConfig: { url: string; source: string; category: string }): Promise<RSSItem[]> {
  try {
    const res = await fetch(feedConfig.url, {
      headers: { "User-Agent": "KyroBriefing/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const items = extractItemsFromXML(xml, feedConfig.source);
    // Return only today's articles (published in last 24h)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return items
      .filter(item => new Date(item.pubDate).getTime() > cutoff)
      .slice(0, 5); // Max 5 per source
  } catch {
    return [];
  }
}

function extractItemsFromXML(xml: string, source: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemMatches = xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi);

  for (const match of itemMatches) {
    const block = match[1];
    const title       = extractTag(block, "title");
    const description = stripHTML(extractTag(block, "description") || extractTag(block, "summary") || "");
    const link        = extractTag(block, "link") || extractTag(block, "guid") || "";
    const pubDate     = extractTag(block, "pubDate") || extractTag(block, "published") || new Date().toISOString();

    if (title) {
      items.push({ title, description: description.slice(0, 300), link, pubDate, source });
    }
  }
  return items;
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*<\\/${tag}>`, "i"));
  return match ? match[1].trim() : "";
}

function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim();
}

export async function fetchCroatianRSS() {
  const allFeeds = [...CROATIAN_FEEDS, ...REAL_ESTATE_FEEDS, ...META_MARKETING_FEEDS];
  const results = await Promise.allSettled(allFeeds.map(parseFeed));

  const items: RSSItem[] = [];
  results.forEach(r => {
    if (r.status === "fulfilled") items.push(...r.value);
  });

  return {
    croatian: items.filter(i => CROATIAN_FEEDS.some(f => f.source === i.source)),
    realEstate: items.filter(i => REAL_ESTATE_FEEDS.some(f => f.source === i.source)),
    marketing: items.filter(i => META_MARKETING_FEEDS.some(f => f.source === i.source)),
    fetchedAt: new Date().toISOString(),
  };
}
