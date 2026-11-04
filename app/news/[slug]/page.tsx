import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getNewsBySlug, getLatestNews } from "@/lib/news-data"
import Link from "next/link"
import { Calendar, User, ArrowLeft } from "lucide-react"
import { ArticleCarousel } from "@/components/carousel"
import { Separator } from "@/components/ui/separator"
import { normalizeImageSrc } from "@/lib/utils"
import type { Metadata } from "next"
import { pageMetadata, toDescription } from "@/lib/seo"
import { SITE_NAME, LOGO_IMAGE, absoluteUrl } from "@/lib/site"

interface NewsArticlePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getNewsBySlug(slug)
  if (!article) {
    return pageMetadata({ title: "Articolo non trovato", description: "L'articolo richiesto non è disponibile.", path: `/news/${slug}`, noIndex: true })
  }
  const image = normalizeImageSrc(article.immagine)
  return pageMetadata({
    title: article.titolo,
    description: toDescription(article.estratto || article.contenuto, `${article.categoria} - ${SITE_NAME}`),
    path: `/news/${article.slug}`,
    image: image && !image.endsWith("placeholder.svg") ? image : null,
    type: "article",
    publishedTime: article.data,
  })
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { slug } = await params
  const article = await getNewsBySlug(slug)

  if (!article) {
    notFound()
  }

  const relatedNews = (await getLatestNews(4))
    .filter((news) => news.id !== article.id)
    .slice(0, 3)

  const formatData = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const isSafeExternalUrl = (href: string) => {
    try {
      const parsed = new URL(href)
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  }

  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    const regex = /!\[([^\]]*)\]\(([^)]+)\)/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    let idx = 0
    while ((match = regex.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index)
      if (before) parts.push(renderSimpleFormatting(before, `t-before-${idx}`))
      const alt = match[1]
      const url = match[2]
      parts.push(
        <span key={`inline-img-${idx}`} className="relative inline-block h-40 w-64 mx-2 align-middle rounded-lg overflow-hidden shadow-md">
          <img loading="lazy" decoding="async"
            src={normalizeImageSrc(url)}
            alt={alt}
            className="h-full w-full object-cover"
          />
        </span>
      )
      lastIndex = regex.lastIndex
      idx++
    }
    const rest = text.slice(lastIndex)
    if (rest) parts.push(renderSimpleFormatting(rest, `t-rest-${idx}`))
    return <>{parts}</>
  }

  const renderSimpleFormatting = (txt: string, keyPrefix: string) => {
    const tokens: React.ReactNode[] = []
    let pos = 0
    let idx = 0
    const combinedRegex = /(\*\*_(.+?)_\*\*)|(\*{2}(.+?)\*{2})|(_(.+?)_)/g
    let match: RegExpExecArray | null
    while ((match = combinedRegex.exec(txt)) !== null) {
      const before = txt.slice(pos, match.index)
      if (before) tokens.push(<span key={`${keyPrefix}-${idx}-before`}>{before}</span>)
      if (match[1]) {
        tokens.push(<strong key={`${keyPrefix}-${idx}-b`} className="font-bold text-foreground"><em>{match[2]}</em></strong>)
      } else if (match[3]) {
        tokens.push(<strong key={`${keyPrefix}-${idx}-b`} className="font-bold text-foreground">{match[4]}</strong>)
      } else if (match[5]) {
        tokens.push(<em key={`${keyPrefix}-${idx}-i`} className="italic text-foreground/90">{match[6]}</em>)
      }
      pos = combinedRegex.lastIndex
      idx++
    }
    const tail = txt.slice(pos)
    if (tail) tokens.push(<span key={`${keyPrefix}-tail`}>{tail}</span>)
    return <span key={`${keyPrefix}-container`}>{tokens}</span>
  }


  const renderContent = (raw: string) => {
    const lines = raw.replace("\r", "").split(/\r?\n/)
    const elements: React.ReactNode[] = []
    let inCode = false
    let codeBuffer: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim().startsWith("```")) {
        if (!inCode) {
          inCode = true
          codeBuffer = []
        } else {
          inCode = false
          elements.push(
            <pre key={`code-${i}`} className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono my-6 border border-border">
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          )
        }
        continue
      }
      if (inCode) {
        codeBuffer.push(line)
        continue
      }

      if (line.startsWith("# ")) {
        // Il titolo dell'articolo è l'unico <h1> della pagina: i titoli nel testo partono da <h2>
        elements.push(<h2 key={i} className="text-3xl md:text-4xl font-bold mt-12 mb-6 text-foreground">{line.replace(/^#\s+/, "")}</h2>)
        continue
      }
      if (line.startsWith("## ")) {
        elements.push(<h3 key={i} className="text-2xl md:text-3xl font-semibold mt-10 mb-4 text-foreground">{line.replace(/^##\s+/, "")}</h3>)
        continue
      }

      if (line.trim().startsWith("- ")) {
        const items: string[] = []
        let j = i
        while (j < lines.length && lines[j].trim().startsWith("- ")) {
          items.push(lines[j].trim().replace(/^-+\s*/, ""))
          j++
        }
        elements.push(
          <ul key={`ul-${i}`} className="list-disc pl-6 mb-6 space-y-2 text-muted-foreground">
            {items.map((it, idx) => <li key={idx}>{renderInline(it)}</li>)}
          </ul>
        )
        i = j - 1
        continue
      }

      const linkOnlyMatch = line.match(/^\(([^)]+)\)\[([^\]]+)\]\s*$/)
      if (linkOnlyMatch) {
        const label = linkOnlyMatch[1]
        const href = linkOnlyMatch[2]

        if (href.startsWith("/") || href.startsWith("#") || href.startsWith("./") || href.startsWith("../")) {
          elements.push(
            <div key={`link-${i}`} className="my-8 text-center">
              <Button asChild size="lg" className="font-semibold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                <Link href={href}>
                  {label}
                </Link>
              </Button>
            </div>
          )
          continue
        }

        elements.push(
          <div key={`link-${i}`} className="my-8 text-center">
            <Button asChild size="lg" className="font-semibold text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <a href={isSafeExternalUrl(href) ? href : "#"} target="_blank" rel="noopener noreferrer">
                {label}
              </a>
            </Button>
          </div>
        )
        continue
      }

      const inlineLinkRegex = line.match(/\(([^)]+)\)\[([^\]]+)\]/g)
      if (inlineLinkRegex) {
        const parts: React.ReactNode[] = []
        const inlineRegex = /\(([^)]+)\)\[([^\]]+)\]/g
        let lastIdx = 0
        let lm: RegExpExecArray | null
        let linkIdx = 0
        while ((lm = inlineRegex.exec(line)) !== null) {
          const before = line.slice(lastIdx, lm.index)
          if (before) parts.push(renderSimpleFormatting(before, `l-${i}-${linkIdx}-before`))

          const label = lm[1]
          const href = lm[2]

          if (href.startsWith("/") || href.startsWith("#") || href.startsWith("./") || href.startsWith("../")) {
            parts.push(
              <Link key={`l-${i}-${linkIdx}`} href={href} className="text-primary font-semibold hover:underline decoration-2 underline-offset-2 transition-colors">
                {renderSimpleFormatting(label, `l-${i}-${linkIdx}-label`)}
              </Link>
            )
          } else {
            parts.push(
              <a
                key={`l-${i}-${linkIdx}`}
                href={isSafeExternalUrl(href) ? href : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline decoration-2 underline-offset-2 transition-colors"
              >
                {renderSimpleFormatting(label, `l-${i}-${linkIdx}-label`)}
              </a>
            )
          }

          lastIdx = inlineRegex.lastIndex
          linkIdx++
        }

        const tail = line.slice(lastIdx)
        if (tail) parts.push(renderSimpleFormatting(tail, `l-${i}-tail`))

        elements.push(
          <p key={`p-${i}`} className="text-lg leading-relaxed text-muted-foreground mb-6 text-pretty">
            {parts}
          </p>
        )
        continue
      }

      const galleryMatch = line.match(/^\<([^\>]+)\>\((gallery:[^)]+)\)\s*$/)
      if (galleryMatch) {
        const galleryName = galleryMatch[1]
        const galleryLink = galleryMatch[2].replace("gallery:", "/gallery/")
        elements.push(
          <div key={`gallery-${i}`} className="my-10 text-center">
            <Button asChild size="lg" className="font-bold text-xl px-10 py-8 rounded-xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 bg-gradient-to-r from-primary to-rose-600 border-none">
              <Link href={galleryLink}>
                {galleryName}
              </Link>
            </Button>
          </div>
        )
        continue
      }

      const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/)
      if (imgMatch) {
        elements.push(
          <div key={`img-${i}`} className="my-8 w-full relative rounded-xl overflow-hidden shadow-xl">
            <img loading="lazy" decoding="async"
              src={normalizeImageSrc(imgMatch[2].replaceAll("//", "/"))}
              alt={imgMatch[1]}
              className="w-full h-auto object-cover"
             />
            {imgMatch[1] && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-center">
                <span className="text-white text-sm font-medium">{imgMatch[1]}</span>
              </div>
            )}
          </div>
        )
        continue
      }

      if (line.trim() === "") {
        elements.push(<div key={`br-${i}`} className="h-4" />)
      } else {
        elements.push(<p key={`p-${i}`} className="text-lg leading-relaxed text-muted-foreground mb-6 text-pretty">{renderInline(line)}</p>)
      }
    }

    return elements
  }

  const heroImage = normalizeImageSrc(article.immagine) || "/images/placeholder.svg"

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.titolo,
    description: article.estratto || undefined,
    datePublished: article.data,
    image: [absoluteUrl(heroImage)],
    author: { "@type": "Organization", name: article.autore || SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absoluteUrl(LOGO_IMAGE) } },
    mainEntityOfPage: absoluteUrl(`/news/${article.slug}`),
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <Navigation />

      {/* Hero Section */}
      <div className="relative w-full min-h-[500px] md:min-h-[600px] lg:min-h-[650px] flex items-end pt-28 sm:pt-32 md:pt-36 lg:pt-40">
        <div className="absolute inset-0">
          <img fetchPriority="high" decoding="async"
            src={normalizeImageSrc(article.immagine) || "/images/placeholder.svg"}
            alt={article.titolo}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/30" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Button variant="ghost" asChild className="mb-8 text-white hover:text-primary hover:bg-white/10 -ml-4">
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alle News
            </Link>
          </Button>

          <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-primary text-primary-foreground text-base px-4 py-1 border-none shadow-lg shadow-primary/20">
                {article.categoria}
              </Badge>
              {article.featured && (
                <Badge variant="secondary" className="text-base px-4 py-1 backdrop-blur-md bg-white/20 text-white border-none">
                  In Evidenza
                </Badge>
              )}
            </div>

            <h1 className="font-ethnocentric text-4xl md:text-5xl lg:text-6xl text-primary leading-tight drop-shadow-lg text-balance">
              {article.titolo}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-200 text-sm md:text-base font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-primary capitalize">{formatData(article.data)}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <span className="text-primary">{article.autore}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-8 lg:col-start-3">
            {/* Abstract */}
            <div className="mb-12">
              <p className="text-xl md:text-2xl font-medium text-foreground/80 leading-relaxed border-l-4 border-primary pl-6 italic">
                {article.estratto}
              </p>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-12">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-sm py-1 px-3 border-primary/20 text-muted-foreground">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <Separator className="my-12" />

            {/* Article Body */}
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl prose-img:shadow-xl">
              {renderContent(article.contenuto || "")}
            </div>
            
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl prose-img:shadow-xl">
              <div className="my-8 w-full relative rounded-xl overflow-hidden shadow-xl">
                <img loading="lazy" decoding="async"
                  src={normalizeImageSrc(article.immagine || "/images/placeholder.svg")}
                  alt={article.titolo}
                  className="w-full h-auto object-cover"
                />
                
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-center">
                  <span className="text-white text-sm font-medium">{article.titolo}</span>
                </div>
              
              </div>
            </div>

            {/* Carousel */}
            {article.immagini && article.immagini.length > 0 && (
              <div className="mt-10 pt-6 border-t">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-8 bg-primary rounded-full" />
                  Galleria Immagini
                </h3>
                <ArticleCarousel immagini={article.immagini} title={article.titolo} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="py-20 bg-muted/30 border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-ethnocentric text-2xl lg:text-3xl text-primary">ALTRE NEWS</h2>
              <Button variant="outline" asChild>
                <Link href="/news">Vedi tutte</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedNews.map((news) => (
                <Card key={news.id} className="group hover:shadow-xl transition-all duration-300 border-none bg-card overflow-hidden h-full flex flex-col">
                  <Link href={`/news/${news.slug}`} className="flex flex-col h-full">
                    <div className="relative overflow-hidden w-full aspect-video">
                      <img loading="lazy" decoding="async"
                        src={normalizeImageSrc(news.immagine) || "/images/placeholder.svg"}
                        alt={news.titolo}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground border-none shadow-md">
                        {news.categoria}
                      </Badge>
                    </div>
                    <CardContent className="p-6 flex-grow flex flex-col">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span className="capitalize">{formatData(news.data)}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-balance group-hover:text-primary transition-colors mb-3 line-clamp-2">
                        {news.titolo}
                      </h3>
                      <p className="text-muted-foreground text-sm text-pretty line-clamp-3 flex-grow">{news.estratto}</p>

                      <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                        Leggi articolo <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
