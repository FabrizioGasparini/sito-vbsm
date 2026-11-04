import { getLatestNews, type NewsArticle } from "@/lib/news-data"
import { HomeClient } from "@/components/home-client"
import { pageMetadata } from "@/lib/seo"
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"

export const revalidate = 3600 // Revalidate every hour

export const metadata = {
  ...pageMetadata({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  // La home usa il titolo di default del layout (senza template "| Volleyball San Martino" ripetuto)
  title: { absolute: `${SITE_NAME} | Società di pallavolo a San Martino in Rio` },
}

export default async function HomePage() {
  let latestNews: NewsArticle[] = []
  try {
    latestNews = await getLatestNews(4)
  } catch (error) {
    // La home deve restare disponibile anche se il database non risponde:
    // la sezione news mostra uno stato vuoto e la pagina viene rigenerata alla prossima rivalidazione.
    console.error("Home: impossibile caricare le news", error)
  }

  return <HomeClient latestNews={latestNews} />
}
