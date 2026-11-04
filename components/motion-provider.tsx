"use client"

import { MotionConfig } from "framer-motion"
import type { ReactNode } from "react"

// Rispetta la preferenza di sistema "riduci movimento" per tutte le animazioni framer-motion
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
