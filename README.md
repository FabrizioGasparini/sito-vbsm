# Sito Volleyball San Martino

Sito ufficiale della società sportiva Volleyball San Martino: squadre, calendario FIPAV, news, gallerie, sponsor e area riservata di amministrazione.

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
- Archivio dei file caricati: Cloudflare R2 (vedi [Archivio su Cloudflare R2](#archivio-su-cloudflare-r2)) oppure, senza configurazione R2, la cartella esterna `C:\VBSM\storage\uploads` servita su `/uploads`

## Configurazione

Copiare `.env.example` in `.env` e compilare tutti i valori. Il file `.env` **non deve mai essere committato**.

| Variabile | Descrizione |
| --- | --- |
| `DATABASE_URL` | Connessione MySQL per Prisma |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenziali amministratore |
| `VIEWER_USERNAME` / `VIEWER_PASSWORD` | Secondo profilo di accesso, opzionale |
| `JWT_SECRET` | Segreto di firma dei token, almeno 32 caratteri casuali |
| `NEXT_PUBLIC_SITE_URL` | URL pubblico (canonical, sitemap, Open Graph). Default `https://volleyballsanmartino.it` |
| `UPLOAD_DIR` | Cartella degli upload quando R2 non è configurato. Default `C:\VBSM\storage\uploads` |
| `FIPAV_SEASON_YEAR` | Opzionale: forza l'anno della stagione per il calendario FIPAV |
| `POST_DATA_DIR` | Opzionale: cartella dati del generatore di post (default: `post-generator` accanto a `UPLOAD_DIR`) |
| `POST_PUBLIC_URL` | Opzionale: URL pubblico da cui Instagram scarica le immagini (default `NEXT_PUBLIC_SITE_URL`) |
| `INSTAGRAM_API_VERSION` | Opzionale: versione dell'API di Instagram (default `v26.0`) |
| `R2_ACCOUNT_ID` | Cloudflare R2: ID dell'account (oppure `R2_ENDPOINT` completo, es. per la giurisdizione UE) |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | Cloudflare R2: chiavi di un token API "Object Read & Write" limitato ai due bucket |
| `R2_PUBLIC_BUCKET` | Bucket pubblico per upload, cartelle delle stagioni, loghi e pdf. Se manca, restano su disco (`UPLOAD_DIR` e `public/`) |
| `R2_PRIVATE_BUCKET` | Bucket privato per i dati del generatore di post (contiene il token Instagram). Se manca, restano in `POST_DATA_DIR` |
| `STORAGE_DIR` | Opzionale, solo per `npm run storage:migrate`: cartella dell'archivio da copiare (default: la cartella che contiene `UPLOAD_DIR`) |
| `NEXT_PUBLIC_MEDIA_URL` | Dominio pubblico del bucket pubblico, es. `https://media.vbsm.it`. Va impostato **prima** di `npm run build` |

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

## Archivio su Cloudflare R2

Il codice in `lib/storage.ts` legge e salva i file su R2 quando i bucket sono configurati, altrimenti su disco. Nel bucket pubblico le chiavi coincidono con i percorsi del sito:

| Cartella in `C:\VBSM\storage` | Percorso sul sito e chiave su R2 |
| --- | --- |
| `uploads` | `/uploads/…` (immagini caricate dall'admin) |
| `2025-26` (e ogni cartella stagione `AAAA-AA`) | `/images/2025-26/…` (pagine, squadre, sponsor, gallerie) |
| `loghi` | `/images/loghi/…` |
| `pdfs` | `/pdfs/…` |
| `post-generator` | bucket **privato**, chiavi `post-generator/…` |

Nel database gli indirizzi restano relativi (es. `/uploads/<file>`): con `NEXT_PUBLIC_MEDIA_URL` impostato `lib/media.ts` li trasforma in indirizzi del dominio dei media, e gli stessi percorsi richiesti al sito reindirizzano lì. Gallerie e foto delle squadre vengono elencate direttamente dal bucket (l'elenco delle foto delle squadre resta in memoria 5 minuti).

1. Dashboard Cloudflare → **R2** → crea due bucket, ad esempio `vbsm-media` (pubblico) e `vbsm-private` (privato).
2. `vbsm-media` → **Settings → Custom Domains** → collega un sottodominio, ad esempio `media.vbsm.it`. **Non** rendere pubblico `vbsm-private`.
3. **R2 → Manage API tokens** → crea un token "Object Read & Write" limitato ai due bucket e copia Access Key ID e Secret Access Key.
   Su `vbsm-media` → **Settings → CORS policy** consenti `GET` dall'origine `https://volleyballsanmartino.it`: serve alle miniature dei video delle gallerie, che vengono disegnate nel browser.
4. Sul server aggiungi al `.env` le variabili `R2_*` e `NEXT_PUBLIC_MEDIA_URL` (tabella sopra).
5. Copia i file esistenti: `npm run storage:migrate -- --dry-run` per vedere cosa verrà copiato, poi `npm run storage:migrate`. I file locali non vengono cancellati e lo script si può rilanciare.
6. `node deploy.js` (la build deve vedere `NEXT_PUBLIC_MEDIA_URL`), poi di nuovo `npm run storage:migrate` per copiare quanto caricato nel frattempo.

Per tornare su disco basta togliere le variabili `R2_*` e `NEXT_PUBLIC_MEDIA_URL` e rifare la build (i file caricati su R2 nel frattempo vanno riscaricati a mano).

Le immagini aggiunte a mano nelle cartelle dell'archivio (nuove foto di squadra, gallerie, sponsor) vanno caricate sul bucket: dalla dashboard di Cloudflare oppure copiandole in `C:\VBSM\storage` e rilanciando `npm run storage:migrate`, che copia solo i file nuovi o modificati. Restano in `public/` solo i file fuori da quelle cartelle (es. `/images/placeholder.svg`).

## Modalità manutenzione

Creare il file `manutenzione.flag` nella root del progetto. Le pagine statiche leggono il flag in fase di build/rivalidazione, quindi dopo averlo creato o rimosso va rieseguita la build.

## Struttura

```
app/            pagine (App Router), API in app/api, robots.ts, sitemap.ts, not-found.tsx, error.tsx
components/     componenti condivisi (navigazione, footer, cookie banner) e components/ui
lib/            accesso dati (Prisma), autenticazione, rate limit, upload e archivio (storage.ts), SEO (seo.ts, site.ts)
scripts/        script una tantum (copia dei file su R2)
prisma/         schema del database
post-generator/ generatore dei post partite (/admin/post), vedi post-generator/README.md
```
