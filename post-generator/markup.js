// Struttura HTML del generatore di post (montata da app/admin/post/page.tsx)
export const MARKUP = `
<div class="app">
    <aside class="panel">
      <header class="brand">
        <img src="/api/post/assets/loghi/vbsm.png" alt="" />
        <div class="brand-text">
          <h1>Matchday</h1>
          <p>Post risultati · Volleyball San Martino</p>
        </div>
        <a class="back-link" href="/admin"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>Admin</a>
      </header>
      <div class="panel-scroll">
        <!-- 1. SQUADRA VBSM -->
        <section class="step" id="stepTeam">
          <div class="step-head">
            <span class="num">1</span>
            <h2>Squadra</h2>
          </div>
          <div class="team-grid" id="teamGrid"></div>
          <div class="team-card" id="teamCard">
            <div class="team-card-main">
              <div class="team-card-title" id="tcTitle">—</div>
              <div class="team-card-sub" id="tcSub"></div>
            </div>
            <div class="team-card-sponsor" id="tcSponsor" data-paste="sponsor" title="Ctrl+V qui sopra per incollare un nuovo sponsor"></div>
            <button class="icon-btn" id="toggleDetails" title="Modifica nome, colore e sponsor">
              <svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/></svg>
            </button>
          </div>
          <div class="pill-toggle" id="lato">
            <button data-v="casa"><svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>In casa</button>
            <button data-v="fuori"><svg viewBox="0 0 24 24"><path d="M3 12h13M12 7l5 5-5 5M20 4v16"/></svg>In trasferta</button>
          </div>
          <div class="details" id="vbsmDetails" hidden>
            <label class="field">
              <span class="lbl">Titolo del post</span>
              <input id="categoria" type="text" />
            </label>
            <label class="field">
              <span class="lbl">Nome squadra sul post</span>
              <textarea id="vbsmLines" rows="2" spellcheck="false"></textarea>
            </label>
            <div class="field">
              <span class="lbl">Colore</span>
              <div class="pill-toggle small" id="genere">
                <button data-v="femminile"><i class="dot" style="background:var(--viola)"></i>Femminile</button>
                <button data-v="maschile"><i class="dot" style="background:var(--giallo)"></i>Maschile / Misto</button>
              </div>
            </div>
            <div class="field" data-paste="sponsor">
              <span class="lbl">Sponsor <em class="kbd-hint">Ctrl+V per incollarne uno nuovo</em></span>
              <div class="row">
                <div class="select"><select id="sponsor"></select></div>
                <button class="btn" id="uploadSponsor">Nuovo</button>
              </div>
              <div class="row slider-row">
                <span class="lbl">Dimensione</span>
                <input type="range" id="sponsorScale" min="50" max="150" value="100" />
              </div>
            </div>
            <button class="btn block accent-outline" id="saveDefaults">Salva per questa squadra</button>
          </div>
        </section>
        <!-- 2. PARTITA -->
        <section class="step" id="stepMatch">
          <div class="step-head">
            <span class="num">2</span>
            <h2>Partita</h2>
            <button class="icon-btn" id="refresh" title="Riscarica i risultati">
              <svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>
            </button>
          </div>
          <div id="matches" class="matches"></div>
          <div class="match-foot">
            <div class="status" id="matchesStatus"></div>
            <button class="link-btn" id="champLink" hidden>Abbina campionato</button>
          </div>
          <button class="btn block ghost-dashed" id="manual">
            <svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Partita non in elenco · inserisci a mano
          </button>
        </section>
        <!-- 3. AVVERSARIO E RISULTATO -->
        <section class="step" id="stepOpp">
          <div class="step-head">
            <span class="num">3</span>
            <h2>Avversario e risultato</h2>
          </div>
          <div class="opp-card" data-paste="logo" title="Ctrl+V qui sopra per incollare il logo">
            <button class="opp-logo" id="oppLogoBtn" title="Cambia logo / collega all'archivio">
              <img id="oppLogo" alt="" />
              <svg class="ph" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/></svg>
            </button>
            <div class="opp-main">
              <input id="oppName" type="text" placeholder="Nome squadra avversaria" spellcheck="false" autocomplete="off" />
              <div id="oppStatus" class="badge"></div>
            </div>
          </div>
          <div class="opp-actions">
            <button class="btn" id="oppLink"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>Cerca nell'archivio</button>
            <button class="btn" id="oppCreate"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Crea nuova</button>
          </div>
          <div class="two-col">
            <label class="field">
              <span class="lbl">Nome sul post</span>
              <textarea id="oppLines" rows="2" spellcheck="false"></textarea>
            </label>
            <div class="field">
              <span class="lbl">Dimensione logo</span>
              <input type="range" id="oppScale" min="40" max="160" value="100" />
            </div>
          </div>
          <div class="sets-box">
            <div class="sets-top">
              <span class="lbl">Parziali</span>
              <div class="scoreline" id="scoreLabel"></div>
            </div>
            <div class="sets-grid" id="setsGrid">
              <div class="sg-head"></div>
              <div class="sg-head"><img src="/api/post/assets/loghi/vbsm.png" alt="" /><span>VBSM</span></div>
              <div class="sg-head"><img id="setsOppLogo" alt="" /><span id="setsOppName">Avversari</span></div>
            </div>
            <div class="row">
              <button class="btn small" id="addSet">+ Set</button>
              <button class="btn small" id="removeSet">− Set</button>
            </div>
          </div>
        </section>
        <!-- 4. FOTO -->
        <section class="step" id="stepPhoto">
          <div class="step-head">
            <span class="num">4</span>
            <h2>Foto</h2>
          </div>
          <label class="drop" id="drop" data-paste="photo">
            <input type="file" id="photoInput" accept="image/*" hidden />
            <img id="photoThumb" alt="" hidden />
            <span class="drop-text" id="dropText">
              <svg viewBox="0 0 24 24"><path d="M4 16l4-4 3 3 5-5 4 4M4 4h16v16H4z"/></svg>
              <b>Trascina la foto qui</b>
              <small>oppure clicca · Ctrl+V per incollare</small>
            </span>
          </label>
          <div id="photoTools" hidden>
            <div class="row slider-row">
              <span class="lbl">Zoom</span>
              <input type="range" id="zoom" min="100" max="300" value="100" />
              <button class="btn small" id="centerPhoto">Centra</button>
            </div>
            <p class="hint">Trascina la foto nell'anteprima per inquadrarla · rotella per lo zoom</p>
          </div>
        </section>
      </div>
    </aside>
    <main class="stage">
      <div class="m-header">
        <img src="/api/post/assets/loghi/vbsm.png" alt="" />
        <b>Matchday</b>
        <a class="back-link" href="/admin"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>Admin</a>
      </div>
      <div class="canvas-wrap">
        <canvas id="canvas" width="1080" height="1350"></canvas>
      </div>
      <p class="canvas-hint">Trascina la foto con un dito per inquadrarla · due dita per lo zoom</p>
      <div class="toolbar">
        <span class="file-hint" id="fileHint"></span>
        <button class="btn desktop-only" id="copy"><svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg>Copia</button>
        <button class="btn mobile-only" id="share" hidden><svg viewBox="0 0 24 24"><path d="M12 15V3M7 8l5-5 5 5M5 13v7h14v-7"/></svg>Condividi</button>
        <button class="btn ig-btn" id="igOpen"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>Instagram</button>
        <button class="btn primary" id="save"><svg viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>Scarica</button>
      </div>
    </main>
  </div>
  <!-- Archivio squadre avversarie -->
  <dialog id="archive">
    <div class="dlg">
      <header>
        <h3>Archivio squadre</h3>
        <input type="search" id="archiveSearch" placeholder="Cerca per nome…" />
        <button class="icon-btn" id="archiveClose" title="Chiudi"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </header>
      <p class="hint dlg-sub" id="archiveFor"></p>
      <div class="logo-grid" id="archiveGrid"></div>
      <footer>
        <button class="btn" id="archiveNew"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>Crea nuova squadra</button>
      </footer>
    </div>
  </dialog>
  <!-- Abbinamento squadra VBSM ↔ campionato scaricato -->
  <dialog id="champDlg">
    <div class="dlg">
      <header>
        <h3>Abbina campionato</h3>
        <input type="search" id="champSearch" placeholder="Cerca campionato o squadra…" />
        <button class="icon-btn" id="champClose" title="Chiudi"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </header>
      <p class="hint dlg-sub" id="champFor"></p>
      <div class="champ-list" id="champList"></div>
    </div>
  </dialog>
  <!-- Pubblica su Instagram -->
  <dialog id="igDlg">
    <div class="dlg">
      <header>
        <span class="ig-mark"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg></span>
        <h3>Pubblica su Instagram</h3>
        <span class="ig-account" id="igAccount"></span>
        <button class="icon-btn" id="igClose" title="Chiudi"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </header>
      <div class="ig-body">
        <img class="ig-preview" id="igPreview" alt="" />
        <div class="ig-side">
          <!-- configurazione (una volta sola) -->
          <div class="ig-setup" id="igSetup" hidden>
            <div class="ig-check" id="igCheckAccount">
              <span class="ig-dot"></span>
              <div>
                <b>Account Instagram</b>
                <p class="hint">Account professionale (Business o Creator) e token da un'app Meta con il permesso <code>instagram_business_content_publish</code>. I passaggi sono in <code>post-generator/README.md</code>.</p>
                <div class="row"><input type="text" id="igToken" placeholder="Incolla qui l'access token" autocomplete="off" spellcheck="false" /><button class="btn" id="igConnect">Collega</button></div>
              </div>
            </div>
          </div>
          <label class="field">
            <span class="lbl">Didascalia <em class="kbd-hint" id="igCount"></em></span>
            <textarea id="igCaption" rows="8" spellcheck="true"></textarea>
          </label>
          <label class="field">
            <span class="lbl">Hashtag fissi</span>
            <input type="text" id="igHashtags" spellcheck="false" />
          </label>
          <ol class="ig-steps" id="igSteps" hidden>
            <li data-f="preparazione">Preparo l'immagine</li>
            <li data-f="caricamento">Instagram scarica l'immagine</li>
            <li data-f="pubblicazione">Pubblico il post</li>
            <li data-f="fatto">Pubblicato</li>
          </ol>
          <div class="ig-result" id="igResult"></div>
        </div>
      </div>
      <footer>
        <button class="btn" id="igManual" title="Copia la didascalia, scarica l'immagine e apre Instagram">Copia didascalia e apri Instagram</button>
        <button class="btn primary" id="igPublish"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>Pubblica ora</button>
      </footer>
    </div>
  </dialog>
  <!-- Nuovo sponsor -->
  <dialog id="sponsorDlg">
    <form class="dlg" method="dialog" id="sponsorForm">
      <header><h3>Nuovo sponsor</h3></header>
      <div class="dlg-body">
        <label class="field">
          <span class="lbl">Nome dello sponsor</span>
          <input type="text" id="sponsorName" required />
        </label>
        <div class="field">
          <span class="lbl">Immagine</span>
          <label class="drop compact">
            <input type="file" id="sponsorInput" accept="image/*" hidden />
            <img id="sponsorPreview" class="preview-img" alt="" />
            <span class="drop-text"><b>Scegli, trascina o incolla (Ctrl+V) l'immagine</b><small id="sponsorHint">PNG con sfondo trasparente, se possibile</small></span>
          </label>
          <div class="bg-editor" id="sponsorEditor" hidden>
            <div class="bg-preview-wrap"><canvas class="bg-preview" width="520" height="260"></canvas><span class="bg-preview-tag">anteprima sul post</span></div>
            <div class="bg-controls">
              <label class="check-row"><input type="checkbox" class="bg-on" /> <span>Aggiungi sfondo</span><input type="color" class="bg-color" value="#ffffff" title="Colore dello sfondo" /></label>
              <div class="row slider-row"><span class="lbl">Margine</span><input type="range" class="bg-pad" min="0" max="40" value="12" /></div>
              <div class="row slider-row"><span class="lbl">Angoli</span><input type="range" class="bg-radius" min="0" max="50" value="10" /></div>
            </div>
          </div>
        </div>
        <label class="check-row"><input type="checkbox" id="sponsorAssign" checked /> <span>Usalo come sponsor fisso di <b id="sponsorTeamName">questa squadra</b></span></label>
      </div>
      <footer>
        <button type="button" class="btn" id="sponsorCancel">Annulla</button>
        <button type="submit" class="btn primary" id="sponsorOk">Aggiungi sponsor</button>
      </footer>
    </form>
  </dialog>
  <!-- Nuova squadra avversaria -->
  <dialog id="createDlg">
    <form class="dlg" method="dialog" id="createForm">
      <header>
        <h3>Nuova squadra</h3>
      </header>
      <div class="dlg-body">
        <label class="field">
          <span class="lbl">Nome della squadra / società</span>
          <input type="text" id="createName" required />
        </label>
        <div class="field">
          <span class="lbl">Logo</span>
          <label class="drop compact">
            <input type="file" id="createFile" accept="image/*" hidden />
            <img id="createPreview" class="preview-img" alt="" />
            <span class="drop-text"><b>Scegli, trascina o incolla (Ctrl+V) il logo</b><small id="createHint"></small></span>
          </label>
          <div class="bg-editor" id="createEditor" hidden>
            <div class="bg-preview-wrap"><canvas class="bg-preview" width="520" height="260"></canvas><span class="bg-preview-tag">anteprima sul post</span></div>
            <div class="bg-controls">
              <label class="check-row"><input type="checkbox" class="bg-on" /> <span>Aggiungi sfondo</span><input type="color" class="bg-color" value="#ffffff" title="Colore dello sfondo" /></label>
              <div class="row slider-row"><span class="lbl">Margine</span><input type="range" class="bg-pad" min="0" max="40" value="12" /></div>
              <div class="row slider-row"><span class="lbl">Angoli</span><input type="range" class="bg-radius" min="0" max="50" value="10" /></div>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <button type="button" class="btn" id="createCancel">Annulla</button>
        <button type="submit" class="btn primary" id="createOk">Salva in archivio</button>
      </footer>
    </form>
  </dialog>
  <div class="toast" id="toast"></div>
`
