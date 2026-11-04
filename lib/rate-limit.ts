// Rate limiter in memoria per singola istanza Node (adatto al deploy attuale con un solo processo PM2).
// Con più istanze o serverless servirebbe uno store condiviso (es. Redis).

type Bucket = { count: number; resetTime: number }

const buckets = new Map<string, Bucket>()

type RateLimitOptions = {
  /** Finestra temporale in millisecondi */
  windowMs: number
  /** Numero massimo di richieste nella finestra */
  max: number
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 3, // max 3 iscrizioni per ora per IP
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = DEFAULT_OPTIONS
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = buckets.get(key)

  if (!record || now > record.resetTime) {
    buckets.set(key, { count: 1, resetTime: now + options.windowMs })
    return { allowed: true }
  }

  if (record.count >= options.max) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  record.count++
  return { allowed: true }
}

/** Azzera il contatore (es. dopo un login riuscito) */
export function resetRateLimit(key: string) {
  buckets.delete(key)
}

/** IP del client dietro reverse proxy */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  )
}

// Pulizia periodica della mappa
const cleanup = setInterval(() => {
  const now = Date.now()
  for (const [key, value] of buckets.entries()) {
    if (now > value.resetTime) buckets.delete(key)
  }
}, 60 * 1000)

// Non tenere vivo il processo solo per il timer
if (typeof cleanup === "object" && "unref" in cleanup) cleanup.unref()
