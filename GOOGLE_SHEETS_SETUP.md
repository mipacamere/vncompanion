# Attivare la scrittura automatica su Google Sheets — tutto da browser

Il progetto include una Netlify Function (`netlify/functions/append-guest-sheet.mjs`)
che scrive automaticamente una riga per ogni ospite nel tuo Google Sheet, usando
l'account di servizio che hai già creato. Nessun invio manuale, nessun allegato.

## 1. Condividi il foglio con l'account di servizio (se non l'hai già fatto)

Apri il tuo Google Sheet, tasto **Condividi**, e aggiungi come **Editor** questo indirizzo:

```
alloggiati-sheets-writer@portale-alloggiati-sheets.iam.gserviceaccount.com
```

Senza questo passaggio la scrittura fallirà con un errore di permessi, anche se le
credenziali sono corrette.

## 2. Imposta le variabili su Netlify

Pannello Netlify → il tuo sito → **Site configuration → Environment variables**,
aggiungi:

- `GOOGLE_SHEET_ID` → `1oEk6HSN6N4fSN2qNZ9qT_WGE1kmlUVgT1Sth_z2VfAY`
  (l'ID è già estratto dal link che mi hai mandato)
- `GOOGLE_SHEET_NAME` → `Sheet1`
- `GOOGLE_SA_EMAIL` → `alloggiati-sheets-writer@portale-alloggiati-sheets.iam.gserviceaccount.com`
- `GOOGLE_SA_PRIVATE_KEY` → il valore del campo `private_key` dal file JSON che hai
  scaricato da Google Cloud (quello che inizia con `-----BEGIN PRIVATE KEY-----`).
  **Incollalo così com'è**, comprese le sequenze `\n`: la funzione le converte da sola
  in vere andate a capo. Non serve nessuna modifica manuale al testo.
- `APP_SHARED_TOKEN` → deve già esistere da quando hai configurato l'OCR; questa
  function la riusa per lo stesso motivo (evitare che qualcun altro scriva sul tuo foglio)

Dopo averle salvate, rifai un deploy del sito (le variabili si applicano dal deploy
successivo).

## Colonne scritte nel foglio

Il foglio deve avere queste 17 colonne, in quest'ordine esatto (A→Q). L'ordine centrale
(dalla C alla P) segue **esattamente** il tracciato ufficiale Alloggiati Web, sezione 12
del manuale — non è una scelta arbitraria, è l'ordine con cui la Polizia di Stato descrive
i campi della schedina:

| Col. | Nome colonna | Origine dato |
|---|---|---|
| A | `id` | numero progressivo, generato dalla function continuando dall'ultimo ID già presente nel foglio |
| B | `struttura_id` | `ME006995` (fisso, configurato in `app.js`) |
| C | `tipo_alloggiato` | dal soggiorno (es. "OSPITE SINGOLO") |
| D | `data_arrivo` | dal soggiorno |
| E | `permanenza` | **calcolata automaticamente** come differenza in notti tra arrivo e partenza (il tracciato vuole un numero di giorni, non una seconda data) |
| F | `cognome` | dati anagrafici |
| G | `nome` | dati anagrafici |
| H | `sesso` | dati anagrafici |
| I | `data_nascita` | dati anagrafici |
| J | `comune_nascita` | solo se nato in Italia |
| K | `provincia_nascita` | sigla, solo se nato in Italia |
| L | `stato_nascita` | sempre valorizzato |
| M | `cittadinanza` | dalla tabella Stati |
| N | `tipo_documento` | dalla tabella Documenti |
| O | `numero_documento` | dal documento |
| P | `luogo_rilascio` | dal documento |
| Q | `data_scansione` | data e ora dell'invio, generata automaticamente |

**Sull'ID progressivo**: prima di scrivere, la function legge la colonna A per trovare il
numero più alto già presente e continua da lì (es. se l'ultima riga ha `id=42`, il prossimo
ospite inviato riceverà `43`, `44`, ecc. se sono più di uno nella stessa pratica). Se il
foglio è vuoto, si parte da 1. Nota: se due invii avvenissero nello stesso istante esatto
da due dispositivi diversi, in teoria potrebbero generarsi ID duplicati — scenario molto
improbabile per un singolo B&B, ma segnalo la cosa per completezza.

**Non viene scritta la `data_partenza`** come colonna a sé: il tracciato ufficiale non la
prevede, vuole solo il numero di notti (colonna `permanenza`), quindi la calcoliamo noi
dalle due date che l'operatore sceglie nell'app.

## Verifica

Dopo il deploy, prova ad aggiungere un ospite di prova nell'app e premi "Invia
automaticamente (Google Sheet)": dovresti vedere comparire una nuova riga nel foglio
in pochi secondi. Se qualcosa non va, il pulsante "Dettagli tecnici" nella schermata
mostra l'errore esatto restituito da Google.
