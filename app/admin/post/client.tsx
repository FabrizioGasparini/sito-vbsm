"use client"

import { useEffect, useRef } from "react"
import "@/post-generator/post.css"
import { MARKUP } from "@/post-generator/markup"

/**
 * Il generatore è scritto in JavaScript "vanilla" (canvas + DOM): qui si inserisce il suo markup
 * e lo si monta dopo il primo render; allo smontaggio vengono rimossi tutti i listener globali.
 */
export default function PostGenerator() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cleanup: (() => void) | undefined
    let cancelled = false
    import("@/post-generator/app").then(({ mount }) => {
      if (!cancelled && ref.current) cleanup = mount(ref.current)
    })
    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return <div ref={ref} className="vbsm-post" dangerouslySetInnerHTML={{ __html: MARKUP }} />
}
