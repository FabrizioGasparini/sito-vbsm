import { cache } from "react";
import { prisma } from "./prisma";

export interface NewsArticle {
  id: number;
  slug: string;
  titolo: string;
  categoria: string;
  data: string;
  autore: string;
  immagine: string;
  immagini: string[];
  estratto: string;
  contenuto: string;
  tags: string[];
  featured?: boolean;
}

export const emptyArticle: Omit<NewsArticle, "id"> = {
  slug: "",
  titolo: "",
  categoria: "Risultati",
  data: "",
  autore: "VBSM",
  immagine: "/images/placeholder.svg",
  immagini: [],
  estratto: "",
  contenuto: "",
  tags: [],
  featured: false,
};

type NewsRow = Awaited<ReturnType<typeof prisma.news.findFirst>> & {};

function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

// Data nel fuso orario italiano (YYYY-MM-DD): con toISOString() gli articoli
// salvati a mezzanotte ora italiana risultavano del giorno precedente.
const romeDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" });

function toArticle(row: NewsRow): NewsArticle {
  return {
    ...row,
    autore: row.autore ?? "",
    immagine: row.immagine ?? "",
    estratto: row.estratto ?? "",
    contenuto: row.contenuto ?? "",
    featured: row.featured ?? false,
    immagini: parseJsonArray(row.immagini),
    tags: parseJsonArray(row.tags),
    data: romeDate.format(row.data),
  };
}

// Recupera tutti gli articoli
export async function getNewsData(): Promise<NewsArticle[]> {
  const rows = await prisma.news.findMany({
    orderBy: { data: "desc" }
  });
  return rows.map(toArticle);
}

// Recupera un articolo per ID
export async function getNewsById(id: number): Promise<NewsArticle | undefined> {
  const article = await prisma.news.findUnique({ where: { id } });
  return article ? toArticle(article) : undefined;
}

// Recupera un articolo per slug (memorizzato per richiesta: usato sia da generateMetadata sia dalla pagina)
export const getNewsBySlug = cache(async (slug: string): Promise<NewsArticle | undefined> => {
  const article = await prisma.news.findUnique({ where: { slug } });
  return article ? toArticle(article) : undefined;
});

// Articoli in evidenza
export async function getFeaturedNews(): Promise<NewsArticle[]> {
  const articles = await getNewsData();
  return articles.filter(a => a.featured);
}

// Ultimi articoli
export async function getLatestNews(limit = 6): Promise<NewsArticle[]> {
  const rows = await prisma.news.findMany({ orderBy: { data: "desc" }, take: limit });
  return rows.map(toArticle);
}

// Articoli per categoria
export async function getNewsByCategory(category: string): Promise<NewsArticle[]> {
  if (category === "Tutte") return await getNewsData();
  const articles = await getNewsData();
  return articles.filter(a => a.categoria === category);
}

// Recupera tutte le categorie
export async function getCategories(): Promise<string[]> {
  const articles = await getNewsData();
  const categories = ["Tutte", ...new Set(articles.map(a => a.categoria)), "Eventi", "Comunicati", "Risultati"];
  return categories;
}
