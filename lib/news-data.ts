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
  immagine: "/volleyball-game.png",
  immagini: [],
  estratto: "",
  contenuto: "",
  tags: [],
  featured: false,
};

// Recupera tutti gli articoli
export async function getNewsData(): Promise<NewsArticle[]> {
  const rows = await prisma.news.findMany({
    orderBy: { data: "desc" }
  });

  return rows.map((row) => ({
    ...row,
    immagini: row.immagini ? JSON.parse(row.immagini) : [],
    tags: row.tags ? JSON.parse(row.tags) : [],
    data: row.data.toISOString().split("T")[0],
  } as NewsArticle));
}

// Recupera un articolo per ID
export async function getNewsById(id: number): Promise<NewsArticle | undefined> {
  const article = await prisma.news.findUnique({ where: { id } });
  if (!article) return undefined;
  return {
    ...article,
    immagini: article.immagini ? JSON.parse(article.immagini) : [],
    tags: article.tags ? JSON.parse(article.tags) : [],
    data: article.data.toISOString().split("T")[0],
  } as NewsArticle;
}

// Recupera un articolo per slug
export async function getNewsBySlug(slug: string): Promise<NewsArticle | undefined> {
  const article = await prisma.news.findUnique({ where: { slug } });
  console.log(article)
  if (!article) return undefined;
  return {
    ...article,
    immagini: article.immagini ? JSON.parse(article.immagini) : [],
    tags: article.tags ? JSON.parse(article.tags) : [],
    data: article.data.toISOString().split("T")[0],
  } as NewsArticle;
}

// Articoli in evidenza
export async function getFeaturedNews(): Promise<NewsArticle[]> {
  const articles = await getNewsData();
  return articles.filter(a => a.featured);
}

// Ultimi articoli
export async function getLatestNews(limit = 6): Promise<NewsArticle[]> {
  const articles = await getNewsData();
  return articles.slice(0, limit);
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
