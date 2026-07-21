# Attivare l'invio automatico via email — tutto da browser

Il progetto include una seconda Netlify Function (`netlify/functions/send-guest-data.mjs`)
che invia automaticamente il file JSON degli ospiti alla tua email, tramite Resend
(https://resend.com). L'utente tocca un bottone nell'app — nessun download, nessun
cambio di app, nessun allegato da aggiungere a mano.

## 1. Crea un account Resend (gratuito)

1. Vai su https://resend.com e registrati.
2. Il piano gratuito include una soglia mensile ampia, più che sufficiente per un
   B&B/hotel di dimensioni medie (qualche centinaio di email/mese).
3. Vai su **API Keys** nel pannello e crea una nuova chiave. Copiala (inizia con `re_`).

## 2. (Consigliato) Verifica un dominio tuo

Senza verificare un dominio, puoi comunque inviare email usando come mittente
`onboarding@resend.dev` — funziona, ma è pensato per i test e potrebbe finire più
facilmente in spam. Se hai un dominio (es. quello del sito), in Resend vai su
**Domains → Add Domain** e segui le istruzioni per aggiungere i record DNS
(richiede accesso al pannello DNS del tuo dominio). Una volta verificato, potrai
usare un mittente tipo `noreply@tuodominio.it`.

Se non hai un dominio a disposizione ora, va bene comunque partire con
`onboarding@resend.dev` e cambiarlo più avanti.

## 3. Imposta le variabili su Netlify

Pannello Netlify → il tuo sito → **Site configuration → Environment variables**,
aggiungi (o verifica che ci siano già, per `APP_SHARED_TOKEN`):

- `RESEND_API_KEY` → la chiave copiata al punto 1
- `SENDER_EMAIL` → `onboarding@resend.dev` (oppure il tuo indirizzo dopo aver verificato
  il dominio, es. `noreply@tuodominio.it`)
- `RECIPIENT_EMAIL` → l'indirizzo email dove vuoi ricevere i dati ospiti (il tuo)
- `APP_SHARED_TOKEN` → deve già esistere da quando hai configurato l'OCR; questa
  function la riusa per lo stesso motivo (evitare che qualcun altro usi il tuo invio email)

Dopo averle salvate, rifai un deploy del sito (le variabili si applicano dal deploy
successivo).

## Come funziona nell'app

Nella schermata "Ospiti di questa pratica", il bottone principale è **"Invia
automaticamente (email)"**: chiama la function, che manda subito l'email con il JSON
allegato a `RECIPIENT_EMAIL`. Se per qualche motivo fallisce (rete assente, chiave
non configurata, ecc.), l'app mostra un avviso con i dettagli tecnici e offre due
alternative: condividere su WhatsApp (con allegato automatico se il browser lo
supporta) o scaricare semplicemente il file.

## Nota sui costi

Resend: piano gratuito con soglia mensile ampia, nessuna carta di credito richiesta
per iniziare. Netlify Functions: incluse nel piano gratuito fino a un volume di
richieste molto più alto di quanto un singolo hotel possa generare.
