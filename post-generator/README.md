# Generatore post partite (`/admin/post`)

Crea i post dei risultati (1080×1350) con la grafica VBSM e li pubblica su Instagram.
Si apre da **Area admin → Post partite** e funziona anche da telefono.

## Come si usa

1. **Squadra**: scegli la squadra VBSM e se ha giocato in casa o in trasferta. Campionato, nome sul post, colore e sponsor si compilano da soli.
2. **Partita**: compaiono le gare giocate da quella squadra, prese da `/api/fipav`. Se il campionato ha un altro nome nei risultati, usa **Abbina campionato**. C'è anche l'inserimento a mano.
3. **Avversario e risultato**: se la squadra è in archivio il logo si mette da solo, altrimenti la colleghi a una squadra esistente o ne crei una nuova.
4. **Foto**: con il mouse la trascini per inquadrarla e usi la rotella per lo zoom. Al telefono la sposti con un dito e la ingrandisci con due.

Poi puoi:
- **Scarica**: salva il PNG;
- **Copia**: copia l'immagine negli appunti (computer);
- **Condividi**: apre il menu di condivisione del telefono, da cui scegli Instagram. La didascalia viene copiata negli appunti;
- **Instagram**: pubblica direttamente con l'API.

Ctrl+V incolla un'immagine: diventa la foto, oppure lo sponsor o il logo se il mouse è sopra quella zona.

## File

```
post-generator/        interfaccia (app.js, markup.js, post.css), disegno del post (render.js), grafica, font, configurazione iniziale
app/admin/post/        pagina admin che monta il generatore
app/api/post/*         API: configurazione, caricamento loghi/sponsor, proxy loghi, grafica, Instagram
lib/post-generator.ts  percorsi e funzioni comuni lato server
```

I dati sono fuori dal progetto e quindi sopravvivono ai deploy. La cartella è `POST_DATA_DIR`, di default accanto agli upload: `C:\VBSM\storage\post-generator`. Contiene:
- `config.json`: squadre, sponsor, archivio avversari, abbinamenti, colori, hashtag. Al primo avvio si parte da `post-generator/default-config.json`;
- `file/`: loghi e sponsor caricati;
- `cache-loghi/`: loghi dei risultati FIPAV già scaricati;
- `instagram.json`: il token di Instagram. Resta sul server e non arriva mai al browser.

Leggere i dati richiede il login, modificarli il ruolo admin.

## Instagram

Instagram scarica l'immagine da un URL pubblico. Durante la pubblicazione il JPG viene servito per pochi secondi da `/api/post/instagram/img/<token-casuale>.jpg` e poi eliminato.
L'indirizzo usato è `NEXT_PUBLIC_SITE_URL`. Si può cambiare con `POST_PUBLIC_URL`, per esempio per fare prove in locale con un tunnel.

Configurazione, una volta sola:

1. L'account Instagram VBSM deve essere **professionale** (Business o Creator).
2. Su https://developers.facebook.com, con il tuo profilo Facebook personale, crea un'app con il caso d'uso Instagram e scegli **API setup with Instagram login**.
3. In *Ruoli → Tester di Instagram* aggiungi l'account VBSM. Poi, dall'app di Instagram, accetta l'invito: Impostazioni → App e siti web.
4. Premi **Generate token** accanto all'account, copia il token e incollalo nella finestra Instagram del generatore, poi premi **Collega**.

Il token dura 60 giorni e si rinnova da solo. La versione dell'API si può cambiare con `INSTAGRAM_API_VERSION` (default `v26.0`).

## Font

I numeri grandi usano **Yearbook Solid** e la categoria **Paalalabas Condensed**, se sono installati sul dispositivo. Sono font di Canva e non sono inclusi.
Se mancano, le cifre vengono disegnate con una replica vettoriale e la categoria usa League Gothic, già incluso.
