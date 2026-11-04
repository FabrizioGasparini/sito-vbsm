import { getLatestNews } from "@/lib/news-data"
import { HomeClient } from "@/components/home-client"

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  const latestNews = await getLatestNews(4)

  return <HomeClient latestNews={latestNews} />
}
