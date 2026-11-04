# Sito Volleyball San Martino

Sito ufficiale della società sportiva Volleyball San Martino: squadre, calendario FIPAV, news, gallerie, sponsor, Torneo 24H e area riservata di amministrazione.

## Stack

- **Next.js 15** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS 4** (configurazione in `app/globals.css`), componenti UI basati su Radix
- **Prisma 6** su **MySQL**
- Autenticazione area riservata con JWT in cookie `httpOnly` (`lib/auth.ts`)
- Deploy su server Windows con **PM2** (`pm2.json`, `deploy.js`)

## Requisiti

- Node.js >= 20.9
- MySQL raggiungibile dal server
- Cartella `public/` con le immagini del sito (non versionata, vedi `.gitignore`)
- Cartella esterna per gli upload (default `C:\VBSM\storage\uploads`), servita su `/uploads`

## Configurazione

Copiare `.env.example` in `.env` e compilare tutti i valori. Il file `.env` **non deve mai essere committato**.

| Variabile | Descrizione |
| --- | --- |
| `DATABASE_URL` | Connessione MySQL per Prisma |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenziali amministratore |
| `VIEWER_USERNAME` / `VIEWER_PASSWORD` | Profilo limitato (gestione Torneo 24H), opzionale |
| `JWT_SECRET` | Segreto di firma dei token, almeno 32 caratteri casuali |
| `NEXT_PUBLIC_SITE_URL` | URL pubblico (canonical, sitemap, Open Graph). Default `https://volleyballsanmartino.it` |
| `UPLOAD_DIR` | Cartella degli upload. Default `C:\VBSM\storage\uploads` |
| `FIPAV_SEASON_YEAR` | Opzionale: forza l'anno della stagione per il calendario FIPAV |

## Comandi

```bash
npm ci              # installa le dipendenze (genera anche il client Prisma)
npm run dev         # sviluppo su http://localhost:3000
npm run typecheck   # controllo TypeScript
npm run lint        # ESLint (regole Next.js)
npm run build       # build di produzione
npm start           # avvio in produzione
npm run db:generate # rigenera il client Prisma dopo modifiche a prisma/schema.prisma
```

Deploy sul server: `node deploy.js` (installa, compila e riavvia il processo PM2 `vbsm`).

> Su Windows `prisma generate` non può sovrascrivere il motore Prisma mentre il sito è in esecuzione: se `npm ci` fallisce con `EPERM`, fermare PM2 (`pm2 stop vbsm`), ripetere e riavviare.

## Modalità manutenzione

- **Sito intero**: creare il file `manutenzione.flag` nella root del progetto. Le pagine statiche leggono il flag in fase di build/rivalidazione, quindi dopo averlo creato o rimosso va rieseguita la build.
- **Torneo 24H**: gestito dall'area riservata (`/admin/torneo-24h`), che crea/rimuove `torneo-24h.flag`.

## Struttura

```
app/            pagine (App Router), API in app/api, robots.ts, sitemap.ts, not-found.tsx, error.tsx
components/     componenti condivisi (navigazione, footer, cookie banner) e components/ui
lib/            accesso dati (Prisma), autenticazione, rate limit, upload, SEO (seo.ts, site.ts)
prisma/         schema del database
```
