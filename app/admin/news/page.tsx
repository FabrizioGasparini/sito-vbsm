"use client"

import React, { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Eye, Save, X, ArrowLeft, Image as ImageIcon, Trophy } from "lucide-react"
import Link from "next/link"
import { type NewsArticle, getCategories } from "@/lib/news-data"
import { ImageUpload } from "@/components/image-upload"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SOCIETY_ID } from "@/lib/matches-data"
import { normalizeImageSrc } from "@/lib/utils"

type LocalArticle = Omit<NewsArticle, "id">

interface MatchData {
  campionato: string;
  date: string;
  time: string;
  location: string;
  home_team: { society_id: string; title: string };
  away_team: { society_id: string; title: string };
  result: string | null;
  played: boolean;
  sets: string[] | null;
}

type APIMatch = Omit<MatchData, "campionato">

const emptyArticle: LocalArticle = {
  slug: "",
  titolo: "",
  categoria: "Risultati",
  data: "",
  autore: "Redazione VSM",
  immagine: "/images/placeholder.svg",
  immagini: [],
  estratto: "",
  contenuto: "",
  tags: [],
  featured: false,
}

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null)
  const [tagsInput, setTagsInput] = useState("")
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [availableMatches, setAvailableMatches] = useState<MatchData[]>([])
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false)
  const [matchSearchTeam, setMatchSearchTeam] = useState("")
  const [matchSearchDate, setMatchSearchDate] = useState("")


  const [formData, setFormData] = useState<LocalArticle>(() => {
    try {
      const raw = localStorage.getItem("admin_news_draft")
      if (raw) {
        const parsed = JSON.parse(raw)
        return { ...emptyArticle, ...parsed }
      }
    } catch { }
    return emptyArticle
  })

  useEffect(() => {
    async function fetchCategories() {
      const response = await fetch("/api/news");
      const data: NewsArticle[] = await response.json();
      const cat = [...new Set(data.map((article) => article.categoria))];
      setCategories(cat);
    }

    fetchCategories();
  }, []);


  const contentRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    async function fetchData() {
      const news = await fetch("/api/news").then(res => res.json()) ?? []
      setArticles(news)
      const cats = (await getCategories()).filter(cat => cat !== "Tutte")
      setCategories(cats)
    }
    fetchData()
  }, [])

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/fipav")
      const data: Record<string, APIMatch[]> = await res.json()
      const all: MatchData[] = Object.entries(data).flatMap(([campionato, matches]) =>
        matches.map((m) => ({ ...m, campionato }))
      )
      // Sort by date descending
      setAvailableMatches(all.sort((a, b) => {
        // Parse date dd/mm/yyyy
        const [da, ma, ya] = a.date.split('/')
        const [db, mb, yb] = b.date.split('/')
        return new Date(Number(yb), Number(mb) - 1, Number(db)).getTime() - new Date(Number(ya), Number(ma) - 1, Number(da)).getTime()
      })) // Most recent first
    } catch (e) {
      console.error(e)
    }
  }

  const handleMatchSelect = (match: MatchData) => {
    const isHome = match.home_team.society_id === SOCIETY_ID
    const ourTeam = isHome ? match.home_team : match.away_team
    const theirTeam = isHome ? match.away_team : match.home_team

    // Parse score
    let homeSets = 0
    let awaySets = 0

    if (match.result) {
      // Typically result is "3-0" or "1-3"
      const parts = match.result.split('-')
      if (parts.length === 2) {
        homeSets = parseInt(parts[0])
        awaySets = parseInt(parts[1])
      }
    }

    const ourSets = isHome ? homeSets : awaySets
    const theirSets = isHome ? awaySets : homeSets
    const isWin = ourSets > theirSets

    // Try to guess tags
    const newTags: string[] = []

    // Championship mapping
    if (match.campionato.toLowerCase().includes("u13")) newTags.push("U13 Femminile")
    else if (match.campionato.toLowerCase().includes("u14")) newTags.push("U14 Femminile")
    else if (match.campionato.toLowerCase().includes("u16")) newTags.push("U16 Femminile")
    else if (match.campionato.toLowerCase().includes("u18")) newTags.push("U18 Femminile")
    else if (match.campionato.toLowerCase().includes("prima divisione")) newTags.push("Prima Divisione")
    else if (match.campionato.toLowerCase().includes("serie d")) newTags.push("Serie D")

    if (match.campionato.toLowerCase().includes("fipav")) newTags.push("FIPAV")
    else if (match.campionato.toLowerCase().includes("csi")) newTags.push("CSI")

    // Add specific team name if available (e.g. SEA di Ladurini)
    // Often contained in ourTeam.title but might need cleanup
    // Assuming ourTeam.title is something like "Volleyball San Martino" or "VBSM U16"
    // Let's look at the title.
    if (ourTeam.title && !ourTeam.title.includes("San Martino")) {
      newTags.push(ourTeam.title)
    }

    newTags.push(isWin ? "Vittoria" : "Sconfitta")
    newTags.push(isHome ? "Casa" : "Trasferta")


    // Construct Title
    // "U16 FIPAV: vittoria netta a Correggio!"
    let title = `${match.campionato}: `
    if (isWin) {
      title += `vittoria ${isHome ? 'in casa' : 'esterna'} `
      if (isHome) title += `contro ${theirTeam.title}`
      else title += `a ${match.location || 'trasferta'}`
    } else {
      title += `sconfitta ${isHome ? 'casalinga' : 'in trasferta'} contro ${theirTeam.title}`
    }
    title += "!"


    // Construct Excerpt
    // "La VBSM U16 SEA di Ladurini passa a Guastalla con un 3–0 pulito e ben gestito."
    let excerpt = `La VBSM ${match.campionato} `
    if (isWin) {
      excerpt += `domina ${isHome ? 'alla Bombonera' : 'in trasferta'} e supera ${theirTeam.title} `
      excerpt += `con un secco ${ourSets}–${theirSets}.`
    } else {
      excerpt += `ci prova ma cede a ${theirTeam.title} per ${ourSets}–${theirSets}.`
    }

    // Construct Content
    // "Grande prova per la nostra U16 CSI... Parziali: 25–20 • 25–17 • 25–16"
    let content = isWin
      ? `Grande prova per la nostra ${match.campionato}, che porta a casa una vittoria importante per ${ourSets}–${theirSets} contro ${theirTeam.title}!`
      : `Partita difficile per la nostra ${match.campionato}, che cede per ${ourSets}–${theirSets} contro ${theirTeam.title}.`

    content += `\n\nIl match si è svolto presso ${match.location}.`

    if (match.sets && match.sets.length > 0) {
      content += `\n\n**Parziali:**\n${match.sets.join(" • ")}`
    }

    // Convert date for form (YYYY-MM-DDTHH:mm)
    // input date is DD/MM/YYYY
    const [d, m, y] = match.date.split('/')
    // approximate time if not available
    const isoDate = `${y}-${m}-${d}`

    setFormData(prev => ({
      ...prev,
      titolo: title,
      estratto: excerpt,
      contenuto: content,
      data: isoDate,
      tags: newTags,
      categoria: "Partite",
      autore: ourTeam.title || "Redazione VSM"
    }))

    // Update local state for tags input
    setTagsInput(newTags.join(", "))

    setIsMatchDialogOpen(false)
  }

  // helper: genera slug semplice
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  // autosave su localStorage ogni X secondi o quando formData cambia
  useEffect(() => {
    try {
      localStorage.setItem("admin_news_draft", JSON.stringify(formData))
    } catch { }
  }, [formData])

  // se titolo cambia e slug vuoto -> genera slug
  useEffect(() => {
    if (formData.titolo && !formData.slug) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.titolo) }))
    }
    // aggiorna tagsInput quando il formData tags cambia
    setTagsInput((formData.tags || []).join(", "))
  }, [formData.titolo])

  // parsing minimale markdown-like per la preview
  const renderContent = (raw: string) => {
    // split in paragrafi e linee, ma supporta anche immagini inline ![alt](url)
    // e codeblocks ``` ```
    const lines = raw.split(/\r?\n/)
    const elements: React.ReactNode[] = []

    let i = 0
    let inCode = false
    let codeBuffer: string[] = []

    for (i = 0; i < lines.length; i++) {
      const line = lines[i]

      // codice multilinea
      if (line.trim().startsWith("```")) {
        if (!inCode) {
          inCode = true
          codeBuffer = []
        } else {
          // chiudi
          inCode = false
          elements.push(
            <pre key={`code-${i}`} className="bg-surface p-3 rounded overflow-x-auto text-sm">
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          )
          codeBuffer = []
        }
        continue
      }
      if (inCode) {
        codeBuffer.push(line)
        continue
      }

      // titolo livello 1 e 2
      if (line.startsWith("# ")) {
        elements.push(<h1 key={i} className="text-2xl font-bold mb-2">{line.replace(/^#\s+/, "")}</h1>)
        continue
      }
      if (line.startsWith("## ")) {
        elements.push(<h2 key={i} className="text-xl font-semibold mb-2">{line.replace(/^##\s+/, "")}</h2>)
        continue
      }

      // lista semplice
      if (line.trim().startsWith("- ")) {
        // raccogli le righe di lista
        const items: string[] = []
        let j = i
        while (j < lines.length && lines[j].trim().startsWith("- ")) {
          items.push(lines[j].trim().replace(/^-+\s*/, ""))
          j++
        }
        elements.push(
          <ul key={`ul-${i}`} className="list-disc pl-6 mb-3">
            {items.map((it, idx) => <li key={idx}>{renderInline(it)}</li>)}
          </ul>
        )
        i = j - 1
        continue
      }

      // immagine sola nella riga (es: ![alt](url))
      const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/)
      if (imgMatch) {
        const alt = imgMatch[1] || ""
        const url = imgMatch[2] || ""
        elements.push(
          <div key={`img-${i}`} className="mb-3">
            <img loading="lazy" decoding="async" src={normalizeImageSrc(url.replaceAll("//", "/"))} alt={alt}
              className="w-full h-auto object-cover rounded-lg shadow-lg" />
          </div>
        )
        continue
      }

      // altrimenti paragrafo (render inline: bold/italic/inline images)
      if (line.trim() === "") {
        elements.push(<div key={`br-${i}`} className="h-2" />)
      } else {
        elements.push(<div key={`p-${i}`} className="mb-3 text-sm leading-relaxed">{renderInline(line)}</div>)
      }
    }

    return elements
  }

  // render inline semplice: **bold**, *italic*, inline image ![alt](url)
  const renderInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let idx = 0

    // trova tutte le occorrenze di ![alt](url)
    const regex = /!\[([^\]]*)\]\(([^)]+(?:\([^)]+\)[^)]+)*)\)/g
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index)
      if (before) parts.push(renderSimpleFormatting(before, `t-before-${idx}`))

      const alt = match[1]
      const url = match[2]

      parts.push(
        <img loading="lazy" decoding="async"
          key={`inline-img-${idx}`}
          src={normalizeImageSrc(url.replaceAll("//", "/"))}
          alt={alt}
          style={{ width: "100%", height: "auto" }}
          className="rounded-lg shadow-lg"
        />
      )

      lastIndex = regex.lastIndex
      idx++
    }

    const rest = text.slice(lastIndex)
    if (rest) parts.push(renderSimpleFormatting(rest, `t-rest-${idx}`))

    return <>{parts}</>
  }


  // trasforma **bold** e *italic* in elementi
  const renderSimpleFormatting = (txt: string, keyPrefix: string) => {
    const tokens: React.ReactNode[] = []
    let pos = 0
    let idx = 0

    // regex combinata per bold, italic e combinati
    const combinedRegex = /(\*\*_(.+?)_\*\*)|(\*{2}(.+?)\*{2})|(_(.+?)_)/g
    let match: RegExpExecArray | null

    while ((match = combinedRegex.exec(txt)) !== null) {
      const before = txt.slice(pos, match.index)
      if (before) tokens.push(<span key={`${keyPrefix}-${idx}-before`}>{before}</span>)

      if (match[1]) {
        // **_bold e italic_**
        tokens.push(
          <strong key={`${keyPrefix}-${idx}-b`}>
            <em>{match[2]}</em>
          </strong>
        )
      } else if (match[3]) {
        // **bold**
        tokens.push(<strong key={`${keyPrefix}-${idx}-b`}>{match[4]}</strong>)
      } else if (match[5]) {
        // _italic_
        tokens.push(<em key={`${keyPrefix}-${idx}-i`}>{match[6]}</em>)
      }

      pos = combinedRegex.lastIndex
      idx++
    }

    const tail = txt.slice(pos)
    if (tail) tokens.push(<span key={`${keyPrefix}-tail`}>{tail}</span>)

    return <div key={`${keyPrefix}-container`}>{tokens}</div>
  }

  // ----- GALLERIA IMMAGINI: upload, drag & drop, reorder -----
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // aggiungi immagine da URL o da file (File -> objectURL)
  const addImage = async (urlOrFile: string | File) => {
    let url = ""
    if (typeof urlOrFile === "string") {
      url = normalizeImageSrc(urlOrFile.trim().replace(/[\s"'()]+/g, ""))
    } else {
      urlOrFile = new File([urlOrFile], urlOrFile.name.replace(/[\s"'()]+/g, "_"), { type: urlOrFile.type })
      url = URL.createObjectURL(urlOrFile)
    }
    setFormData((prev) => {
      const imgs = prev.immagini ? [...prev.immagini, url] : [url]
      return { ...prev, immagini: imgs }
    })
  }

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    for (let i = 0; i < files.length; i++) {
      addImage(files[i])
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleAddImageByUrl = () => {
    const url = prompt("Inserisci URL immagine (es. https://esempio.it/img.jpg):")
    if (url) addImage(url)
  }

  // drag & drop reordering (HTML5)
  const dragIndex = useRef<number | null>(null)
  const onDragStart = (e: React.DragEvent, idx: number) => {
    dragIndex.current = idx
    e.dataTransfer.effectAllowed = "move"
  }
  const onDropImage = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    const from = dragIndex.current
    if (from === null) return
    setFormData((prev) => {
      const imgs = prev.immagini ? [...prev.immagini] : []
      const [moved] = imgs.splice(from, 1)
      imgs.splice(idx, 0, moved)
      return { ...prev, immagini: imgs }
    })
    dragIndex.current = null
  }
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeImageAt = (idx: number) => {
    setFormData((prev) => {
      const imgs = prev.immagini ? prev.immagini.filter((_, i) => i !== idx) : []
      return { ...prev, immagini: imgs }
    })
  }

  // ----- CAROSELLO CUSTOM per preview -----
  const [carouselIndex, setCarouselIndex] = useState(0)
  useEffect(() => {
    setCarouselIndex(0)
  }, [formData.immagini?.length])

  const prevSlide = () => {
    if (!formData.immagini || formData.immagini.length === 0) return
    setCarouselIndex((s) => (s - 1 + formData.immagini!.length) % formData.immagini!.length)
  }
  const nextSlide = () => {
    if (!formData.immagini || formData.immagini.length === 0) return
    setCarouselIndex((s) => (s + 1) % formData.immagini!.length)
  }

  // ----- INSERIMENTO IMMAGINE INLINE: pos cursore -----
  const insertAtCursor = (insertion: string) => {
    const ta = contentRef.current
    if (!ta) {
      setFormData((prev) => ({ ...prev, contenuto: prev.contenuto + insertion }))
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = formData.contenuto.slice(0, start)
    const after = formData.contenuto.slice(end)
    const newContent = before + insertion + after
    setFormData({ ...formData, contenuto: newContent })
    // aggiornare il cursor dopo render -> setTimeout
    setTimeout(() => {
      const pos = start + insertion.length
      ta.setSelectionRange(pos, pos)
      ta.focus()
    }, 20)
  }

  // toolbar azioni semplici
  const applyWrap = (left: string, right = left) => {
    const ta = contentRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = formData.contenuto.slice(start, end)
    const before = formData.contenuto.slice(0, start)
    const after = formData.contenuto.slice(end)
    const newContent = before + left + selected + right + after
    setFormData({ ...formData, contenuto: newContent })
    setTimeout(() => {
      ta.setSelectionRange(start + left.length, end + left.length)
      ta.focus()
    }, 20)
  }

  // estrai tags
  const handleTagsChange = (tagsString: string) => {
    setTagsInput(tagsString)
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    setFormData({ ...formData, tags })
  }

  // ----- SAVE / CREATE / UPDATE -----
  const extractInlineImageUrls = (content: string): string[] => {
    if (!content) return []
    return [...new Set(
      [...content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)]
        .map((match) => match[1].trim())
        .filter(Boolean)
    )]
  }

  const handleSave = async (publish = true) => {
    if (!publish) {
      const draft = {
        ...formData,
        slug: formData.slug || generateSlug(formData.titolo || ""),
        data: formData.data || new Date().toISOString().slice(0, 10),
      }

      setFormData(draft)
      try {
        localStorage.setItem("admin_news_draft", JSON.stringify(draft))
      } catch { }
      setMessage("Bozza salvata localmente")
      return
    }

    if (!formData.titolo || !formData.contenuto) {
      setMessage("Titolo e contenuto sono obbligatori")
      return
    }

    const slug = formData.slug || generateSlug(formData.titolo)
    const inlineImages = extractInlineImageUrls(formData.contenuto || "")
    const persistedImages = [...new Set([...(formData.immagini || []), ...inlineImages])]

    if (isCreating) {
      const newId = Math.max(...articles.map((a) => a.id), 0) + 1
      const newArticle: NewsArticle = {
        ...(formData as LocalArticle),
        immagini: persistedImages,
        immagine: formData.immagine || inlineImages[0] || "/images/placeholder.svg",
        id: newId,
        slug,
        data: formData.data || new Date().toISOString().slice(0, 10),
      } as NewsArticle
      setArticles([newArticle, ...articles])
      setMessage("Articolo creato con successo!")

      // invio API (non-blocking)
      fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newArticle),
      }).catch((err) => console.error("POST error", err))

    } else if (editingArticle) {
      const updatedArticle: NewsArticle = {
        ...(formData as Omit<NewsArticle, "id">),
        immagini: persistedImages,
        immagine: formData.immagine || inlineImages[0] || "/images/placeholder.svg",
        id: editingArticle.id,
        slug,
        data: formData.data ? new Date(formData.data).toISOString().slice(0, 19).replace("T", " ") : editingArticle.data,
      }
      setArticles((prev) => prev.map((a) => (a.id === editingArticle.id ? updatedArticle : a)))
      setMessage("Articolo aggiornato con successo!")

      fetch("/api/news", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedArticle),
      }).catch((error) => {
        console.error("Error updating article:", error)
        setMessage("Errore durante l'aggiornamento dell'articolo")
      })
    }

    // pulisci stato editor e bozza
    setIsCreating(false)
    setEditingArticle(null)
    setFormData(emptyArticle)
    try { localStorage.removeItem("admin_news_draft") } catch { }
  }

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article)
    setFormData({ ...article, immagini: article.immagini || [] })
    setIsCreating(false)
  }

  const handleDelete = (article: NewsArticle) => {
    setDeleteTarget(article)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    const id = deleteTarget.id

    setArticles((prev) => prev.filter((article) => article.id !== id))
    if (editingArticle?.id === id) {
      setEditingArticle(null)
      setIsCreating(false)
      setFormData(emptyArticle)
      try { localStorage.removeItem("admin_news_draft") } catch { }
    }

    setMessage("Articolo eliminato con successo!")
    setDeleteTarget(null)
    await fetch(`/api/news?id=${id}`, { method: "DELETE" }).catch(() => { })
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingArticle(null)
    setFormData(emptyArticle)
    try { localStorage.removeItem("admin_news_draft") } catch { }
  }

  const deleteDialog = (
    <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminare la news?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {deleteTarget ? `Stai per eliminare “${deleteTarget.titolo}”. L'operazione non può essere annullata.` : ""}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
            Annulla
          </Button>
          <Button type="button" variant="destructive" onClick={confirmDelete}>
            Elimina
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  const handleCategoryChange = (value: string) => {
    setShowNewCategoryInput(value === "Nuova Categoria")
    setNewCategory("")
    setFormData({ ...formData, categoria: value })
  }

  // utile per mostrare in preview anche le immagini presenti nel contenuto
  const extractInlineImages = (content: string) => {
    const regex = /!\[([^\]]*)\]\(([^)]+)\)/g
    const res: { alt: string; url: string }[] = []
    let m: RegExpExecArray | null
    while ((m = regex.exec(content)) !== null) {
      res.push({ alt: m[1], url: m[2] })
    }
    return res
  }

  const uploadFile = async (file: File): Promise<string> => {
    const fData = new FormData()
    fData.append("file", file)


    const res = await fetch("/api/upload", {
      method: "POST",
      body: fData,
    })

    if (!res.ok) throw new Error("Upload fallito")
    const data = await res.json()

    formData.immagini.push(normalizeImageSrc(data.url))
    setFormData({ ...formData })
    return data.url as string
  }

  // render principale
  if (isCreating || editingArticle) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-ethnocentric text-3xl text-foreground">
                {isCreating ? "NUOVA NEWS" : "MODIFICA NEWS"}
              </h1>
              <p className="text-muted-foreground">
                {isCreating ? "Crea un nuovo articolo" : "Modifica l'articolo esistente"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Annulla
              </Button>
              <Button type="button" variant="outline" onClick={() => handleSave(false)}>
                <Save className="mr-2 h-4 w-4" />
                Salva bozza
              </Button>
              <Button type="button" onClick={() => handleSave(true)}>
                <Save className="mr-2 h-4 w-4" />
                Pubblica
              </Button>
            </div>
          </div>

          {message && (
            <Alert className="mb-6">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contenuto Principale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="titolo" className="mb-2">Titolo *</Label>
                    <Input
                      id="titolo"
                      value={formData.titolo}
                      className="bg-secondary"
                      onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                      placeholder="Inserisci il titolo dell'articolo"
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor="slug" className="mb-2">URL</Label>
                    <div className="flex-1 flex">
                      <Input
                        id="slug"
                        className="bg-secondary w-full"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="url-articolo"
                      />
                      <Button variant="ghost" size="sm" onClick={() => setFormData({ ...formData, slug: generateSlug(formData.titolo || "") })}>
                        Genera
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="estratto" className="mb-2">Estratto</Label>
                    <Textarea
                      id="estratto"
                      className="bg-secondary"
                      value={formData.estratto}
                      onChange={(e) => setFormData({ ...formData, estratto: e.target.value })}
                      placeholder="Breve descrizione dell'articolo"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="contenuto" className="mb-2">Contenuto *</Label>

                    {/* Toolbar semplice */}
                    <div className="flex gap-2 mb-2 overflow-x-auto scrollbar">
                      <Button size="sm" variant="outline" onClick={() => applyWrap("**", "**")}>Grassetto</Button>
                      <Button size="sm" variant="outline" onClick={() => applyWrap("_", "_")}>Corsivo</Button>
                      <Button size="sm" variant="outline" onClick={() => insertAtCursor("\n# Titolo Primario\n")}>H1</Button>
                      <Button size="sm" variant="outline" onClick={() => insertAtCursor("\n## Titolo Secondario\n")}>H2</Button>
                      <Button size="sm" variant="outline" onClick={() => insertAtCursor("\n- Punto Lista\n")}>Lista</Button>
                      <Button size="sm" variant="outline" className="hidden" onClick={() => {
                        // inserisci placeholder immagine inline
                        const alt = prompt("Testo alternativo immagine (opzionale):", "immagine")
                        const url = prompt("URL immagine (o sfoglia file):", "")
                        if (url) insertAtCursor(`\n![${alt || ""}](${url})\n`)
                      }}>
                        <ImageIcon className="mr-1 h-4 w-4" />Immagine Inline
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (!fileInputRef.current) return
                          fileInputRef.current.onchange = async (e) => {
                            const f = (e.target as HTMLInputElement).files
                            if (!f || f.length === 0) return
                            const file = f[0]

                            try {
                              const url = await uploadFile(file)
                              insertAtCursor(`\n![${file.name}](${url})\n`)
                            } catch (err) {
                              console.error("Errore upload:", err)
                              alert("Errore durante l'upload dell'immagine")
                            }

                            fileInputRef.current!.onchange = (ev) =>
                              handleFileSelected(ev as unknown as React.ChangeEvent<HTMLInputElement>)
                          }
                          fileInputRef.current.click()
                        }}
                      >
                        <ImageIcon className="mr-1 h-4 w-4" />Carica e Inserisci
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => insertAtCursor("(testo)[url]")}>Link Testo</Button>
                      <Button size="sm" variant="outline" onClick={() => insertAtCursor("<testo>[url]")}>Link Bottone</Button>
                    </div>

                    <Textarea
                      id="contenuto"
                      className="bg-secondary"
                      ref={contentRef}
                      value={formData.contenuto}
                      onChange={(e) => setFormData({ ...formData, contenuto: e.target.value })}
                      placeholder="Scrivi l'articolo usando la sintassi semplice (es. ![alt](http://image) per immagini). Usa ``` per blocchi codice."
                      rows={14}
                    />
                    <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileSelected} />
                  </div>
                </CardContent>
              </Card>

              {/* Galleria immagini */}
              <Card>
                <CardHeader>
                  <CardTitle>Galleria Immagini</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 items-center">
                    <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileSelected} />
                    <Button onClick={
                      () => {
                        if (!fileInputRef.current) return
                        fileInputRef.current.onchange = async (e) => {
                          const f = (e.target as HTMLInputElement).files
                          if (!f || f.length === 0) return
                          const file = f[0]

                          try {
                            const url = await uploadFile(file)
                            insertAtCursor(`\n![${file.name}](${url})\n`)
                          } catch (err) {
                            console.error("Errore upload:", err)
                            alert("Errore durante l'upload dell'immagine")
                          }

                          fileInputRef.current!.onchange = (ev) =>
                            handleFileSelected(ev as unknown as React.ChangeEvent<HTMLInputElement>)
                        }
                        fileInputRef.current.click()
                      }}

                    > <Plus className="mr-2 h-4 w-4" />Aggiungi da file</Button>
                    <Button onClick={handleAddImageByUrl} variant="outline"><ImageIcon className="mr-2 h-4 w-4" />Aggiungi da URL</Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(formData.immagini || []).map((img, idx) => (
                      <div
                        key={img + "-" + idx}
                        draggable
                        onDragStart={(e) => onDragStart(e, idx)}
                        onDrop={(e) => onDropImage(e, idx)}
                        onDragOver={onDragOver}
                        className="relative border rounded overflow-hidden"
                      >
                        <img loading="lazy" decoding="async" src={normalizeImageSrc(img)} alt={`img-${idx}`}
                          className="w-full h-auto object-cover rounded-lg shadow-lg" />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button onClick={() => removeImageAt(idx)} className="bg-white/80 p-1 rounded text-destructive">✕</button>
                        </div>
                      </div>
                    ))}
                    {(!formData.immagini || formData.immagini.length === 0) && (
                      <div className="col-span-3 text-sm text-muted-foreground">Nessuna immagine nella galleria</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Anteprima live: include immagini inline + carosello */}
              <Card>
                <CardHeader>
                  <CardTitle>Anteprima Live</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* carosello se immagini nella galleria */}
                    {formData.immagini && formData.immagini.length > 0 && (
                      <div className="relative">
                        <div className="w-full h-64 rounded overflow-hidden">
                          <img loading="lazy" decoding="async" src={normalizeImageSrc(formData.immagini[carouselIndex].replaceAll("//", "/"))} alt={`slide-${carouselIndex}`}
                            className="w-full h-auto object-cover rounded-lg shadow-lg" />
                        </div>
                        <div className="absolute inset-y-0 left-2 flex items-center">
                          <button onClick={prevSlide} className="bg-white/70 p-2 rounded">◀</button>
                        </div>
                        <div className="absolute inset-y-0 right-2 flex items-center">
                          <button onClick={nextSlide} className="bg-white/70 p-2 rounded">▶</button>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {formData.immagini.map((_, i) => (
                            <button key={i} onClick={() => setCarouselIndex(i)} className={`w-8 h-8 rounded ${i === carouselIndex ? "ring-2 ring-offset-1" : ""}`}>
                              <img loading="lazy" decoding="async" src={normalizeImageSrc(formData.immagini[i].replaceAll("//", "/"))} alt={`thumb-${i}`}
                                className="w-full h-auto object-cover rounded-lg shadow-lg" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* se non ci sono immagini nella galleria, ma ci sono immagini inline -> mostrate */}
                    {(!formData.immagini || formData.immagini.length === 0) && extractInlineImages(formData.contenuto || "").length > 0 && (
                      <div className="space-y-2">
                        {extractInlineImages(formData.contenuto).map((im, i) => (
                          <img loading="lazy" decoding="async" key={i} src={normalizeImageSrc(im.url.replaceAll("//", "/"))} alt={im.alt}
                            className="w-full h-auto object-cover rounded-lg shadow-lg" />
                        ))}
                      </div>
                    )}

                    {/* render del contenuto */}
                    <div className="prose max-w-none">
                      {renderContent(formData.contenuto || "")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Impostazioni</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="categoria" className="mb-2">Categoria</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => handleCategoryChange(value)}
                    >
                      <SelectTrigger className="bg-secondary w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: string) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                        <SelectItem value="Nuova Categoria">Nuova Categoria</SelectItem>
                      </SelectContent>
                    </Select>
                    {showNewCategoryInput && (
                      <div>
                        <Input
                          value={newCategory}
                          type="text"
                          onChange={(e) => { setNewCategory(e.target.value); setFormData({ ...formData, categoria: e.target.value }) }}
                          placeholder="Inserisci nuova categoria"
                          className="bg-secondary mt-2"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="data" className="mb-2">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      className="bg-secondary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="autore" className="mb-2">Autore</Label>
                    <Input
                      id="autore"
                      value={formData.autore}
                      onChange={(e) => setFormData({ ...formData, autore: e.target.value })}
                      className="bg-secondary"
                    />
                  </div>

                  <div>
                    <ImageUpload
                      value={formData.immagine}
                      onChange={(url) => setFormData({ ...formData, immagine: url })}
                      label="Immagine Principale"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags" className="mb-2">Tags (separati da virgola)</Label>
                    <Input
                      id="tags"
                      value={tagsInput}
                      onChange={(e) => handleTagsChange(e.target.value)}
                      placeholder="tag1, tag2, tag3"
                      className="bg-secondary"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured || false}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded border-gray-300 bg-secondary"
                    />
                    <Label htmlFor="featured">Articolo in evidenza</Label>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    <Button type="button" variant="outline" onClick={() => handleSave(false)}>
                      <Save className="mr-2" />Salva bozza
                    </Button>
                    <Button type="button" onClick={() => {
                      setFormData(prev => ({ ...prev, data: prev.data || new Date().toISOString().slice(0, 10) }))
                      handleSave(true)
                    }}>
                      <Save className="mr-2" />Pubblica
                    </Button>
                    {editingArticle && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => handleDelete(editingArticle)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />Elimina news
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {deleteDialog}
        </div>
      </div>
    )
  }

  // visualizzazione lista articoli
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Admin Panel
                </Link>
              </Button>
            </div>
            <h1 className="font-ethnocentric text-3xl text-foreground">GESTIONE NEWS</h1>
            <p className="text-muted-foreground">Gestisci tutti gli articoli del sito</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isMatchDialogOpen} onOpenChange={(open) => {
              setIsMatchDialogOpen(open)
              if (open && availableMatches.length === 0) fetchMatches()
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-white">
                  <Trophy className="w-4 h-4 mr-2" />
                  Importa da Partita
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Seleziona una Partita</DialogTitle>
                </DialogHeader>

                <div className="flex gap-4 my-2">
                  <Input
                    placeholder="Filtra per squadra..."
                    value={matchSearchTeam}
                    onChange={e => setMatchSearchTeam(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={matchSearchDate}
                    onChange={e => setMatchSearchDate(e.target.value)}
                    className="w-auto"
                  />
                </div>

                <div className="space-y-2 mt-2 overflow-x-hidden">
                  {availableMatches.length === 0 ? <p className="text-center py-4">Caricamento partite...</p> :
                    availableMatches
                      .filter(match => {
                        if (matchSearchTeam && !match.home_team.title.toLowerCase().includes(matchSearchTeam.toLowerCase()) && !match.away_team.title.toLowerCase().includes(matchSearchTeam.toLowerCase())) return false;
                        // match.date is DD/MM/YYYY
                        if (matchSearchDate) {
                          const [d, m, y] = match.date.split('/');
                          const iso = `${y}-${m}-${d}`;
                          if (iso !== matchSearchDate) return false;
                        }
                        return true;
                      })
                      .map((match, idx) => (
                        <div key={idx}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50 cursor-pointer transition-colors text-sm"
                          onClick={() => {
                            setIsCreating(true)
                            setFormData(emptyArticle)
                            handleMatchSelect(match)
                          }}
                        >
                          <div className="flex-1 grid grid-cols-[60px_1fr] gap-4 items-center">
                            <div className="text-muted-foreground text-xs">
                              <div>{match.date}</div>
                              <div>{match.time}</div>
                            </div>
                            <div>
                              <div className="font-medium">
                                <span className={match.home_team.society_id === SOCIETY_ID ? "font-bold text-primary" : ""}>{match.home_team.title}</span>
                                <span className="mx-1 text-muted-foreground">vs</span>
                                <span className={match.away_team.society_id === SOCIETY_ID ? "font-bold text-primary" : ""}>{match.away_team.title}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {match.campionato} • {match.location}
                              </div>
                            </div>
                          </div>
                          <div className="text-right min-w-[60px]">
                            {match.played ? (
                              <span className="font-bold text-base bg-slate-100 px-2 py-1 rounded">
                                {match.result}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded">
                                -
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                  }
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={() => { setIsCreating(true); setFormData(emptyArticle) }}>
              <Plus className="mr-2 h-4 w-4" />
              Nuova News
            </Button>
          </div>
        </div>

        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant={(article as NewsArticle).featured ? "default" : "secondary"}>{article.categoria}</Badge>
                      {(article as NewsArticle).featured && <Badge variant="destructive">In Evidenza</Badge>}
                      <span className="text-sm text-muted-foreground">
                        {new Date(article.data).toLocaleDateString("it-IT")}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold mb-2 line-clamp-2">{article.titolo}</h3>

                    <p className="text-muted-foreground mb-3 line-clamp-2">{article.estratto}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>👤 {article.autore}</span>
                      <span>🏷️ {(article.tags || []).join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/news/${article.slug}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleEdit(article)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(article)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nessun articolo trovato</p>
            <Button onClick={() => { setIsCreating(true); setFormData(emptyArticle) }}>
              <Plus className="mr-2 h-4 w-4" />
              Crea il primo articolo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
