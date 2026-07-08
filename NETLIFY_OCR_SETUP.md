# Attivare l'OCR (Google Vision) su Netlify — tutto da browser

Il progetto ora include una **Netlify Function** (`netlify/functions/ocr-proxy.mjs`)
che fa da intermediario sicuro verso Google Cloud Vision: la API key resta
sul server di Netlify, non è mai visibile nel codice del sito.

## 1. Google Cloud Vision (una tantum)

1. Vai su https://console.cloud.google.com, crea/seleziona un progetto.
2. Abilita "Cloud Vision API" e collega un account di fatturazione
   (obbligatorio anche solo per usare la quota gratuita di 1.000 richieste/mese).
3. Crea una API key (Credenziali → Crea credenziali → Chiave API). In
   "Restrizioni API" limitala a "Cloud Vision API" soltanto.
4. Consigliato: imposta un budget/alert di spesa nella sezione Fatturazione.

## 2. Pubblicare la funzione su Netlify

Non serve nessun comando da terminale: la funzione è già dentro la cartella
del sito (`netlify/functions/ocr-proxy.mjs`) e viene pubblicata automaticamente
insieme al resto del sito, con lo stesso identico metodo che usi già oggi per
aggiornare MiPA (che tu faccia push su Git o un deploy manuale trascinando la
cartella su app.netlify.com).

Basta quindi fare un nuovo deploy del sito com'è ora, includendo anche i due
nuovi file (`netlify.toml` e la cartella `netlify/functions/`).

## 3. Impostare le variabili segrete (da browser)

1. Vai su https://app.netlify.com, apri il tuo sito.
2. **Site configuration → Environment variables → Add a variable**.
3. Aggiungi queste tre variabili (assicurati che lo scope includa "Functions"):
   - `GOOGLE_VISION_API_KEY` → la API key creata al punto 1
   - `APP_SHARED_TOKEN` → una stringa a caso scelta da te, es. `mipa2026xk93`
   - `ALLOWED_ORIGIN` → l'URL del tuo sito, es. `https://tuosito.netlify.app`
     (o il tuo dominio personalizzato, se lo usi)
4. Salva, poi fai un nuovo deploy (le variabili si applicano dal deploy successivo,
   non retroattivamente — su Netlify puoi anche premere "Trigger deploy → Deploy site"
   senza dover ricaricare nulla).

## 4. Collegare il frontend

In `app.js` c'è già:
```js
const OCR_PROXY_URL = '/api/ocr-proxy';   // percorso relativo, stesso sito: non toccare
const OCR_APP_TOKEN = 'CHANGE-ME';        // <-- sostituisci con la stessa stringa di APP_SHARED_TOKEN
```
Cambia solo `OCR_APP_TOKEN` con il valore scelto al punto 3, ripubblica il sito.

## Verifica

Dopo il deploy, apri `https://tuosito.netlify.app/api/ocr-proxy` da browser:
dovresti vedere un errore "Method not allowed" (è normale, la funzione accetta
solo richieste POST) — significa che è stata pubblicata correttamente.

## Se l'OCR online non funziona: checklist di diagnosi

1. **Estensione del file**: la function deve chiamarsi `ocr-proxy.mjs` (non `.js`).
   Senza un `package.json` con `"type": "module"`, Netlify potrebbe non
   interpretare correttamente la sintassi `export default` in un file `.js`
   semplice, e la function non parte per niente (errore silenzioso o 404/500
   su ogni richiesta). Se avevi ancora `ocr-proxy.js`, sostituiscilo con
   `ocr-proxy.mjs` (contenuto identico) e ripubblica.
2. **Verifica che la function compaia**: pannello Netlify → **Functions** →
   dovresti vedere `ocr-proxy` nell'elenco. Se non c'è, il file non è stato
   riconosciuto (percorso sbagliato, o problema al punto 1).
3. **Guarda i log della function**: pannello Netlify → Functions → ocr-proxy →
   scheda **Logs**. Qui trovi eventuali errori di esecuzione (es. variabili
   d'ambiente mancanti, chiamata a Google Vision fallita).
4. **Controlla le variabili d'ambiente**: Site configuration → Environment
   variables → devono esserci `GOOGLE_VISION_API_KEY` e `APP_SHARED_TOKEN`;
   verifica che lo scope di entrambe includa "Functions" e che sia stato
   fatto un nuovo deploy DOPO averle aggiunte (non si applicano retroattivamente).
5. **Controlla il token nel frontend**: in `app.js`, `OCR_APP_TOKEN` deve
   essere identico al valore di `APP_SHARED_TOKEN` su Netlify. Se non
   combaciano ottieni un errore 401.
6. **Nell'app**, quando l'OCR fallisce, nella schermata di revisione compare
   un blocco "Dettagli tecnici": aprilo, copia il testo esatto — indica lo
   status HTTP e una spiegazione mirata (401/404/502) di cosa controllare.

