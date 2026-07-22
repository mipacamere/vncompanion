/* ═══════════════════════════════════════════
   Via Nazionale Guest Companion — Vanilla JS
   No external dependencies
═══════════════════════════════════════════ */

// ── State ──────────────────────────────────
const state = {
  page: 'home',
  section: 'info',
  lang: localStorage.getItem('vianaz_lang') || 'en',
  isOnline: navigator.onLine,
  images: JSON.parse(localStorage.getItem('vianaz_images') || '[]'),
  docsSent: JSON.parse(localStorage.getItem('vianaz_docssent') || 'false'),
  docPhase: 'capture', // 'capture' | 'processing' | 'review' | 'list'
  schedine: JSON.parse(localStorage.getItem('vianaz_schedine') || '[]'), // ospiti già aggiunti alla pratica corrente
  ocrFields: null,     // bozza del guest in corso di revisione (prima di "Aggiungi alla lista")
  ocrRaw: '',
  ocrError: null,
  ocrErrorDetail: '',  // dettaglio tecnico dell'ultimo errore Vision, per diagnosi
  showTxtPreview: false,
  sendStatus: 'idle', // 'idle' | 'sending' | 'sent' | 'error'
  sendErrorDetail: '',
  disclaimerReturnPhase: 'capture',
  showPast: false,
  installPrompt: null,
  installDismissed: false,
  showIOSHint: false,
};

// ── Translations ────────────────────────────
const allT = {
  en: {
    back: 'Back', openMaps: 'Open in Maps', bookWa: 'Book via WhatsApp',
    offline: 'You are offline — some content may not load.',
    install: { title: 'Install Via Nazionale App', sub: 'Add to your home screen for quick access', btn: 'Install', dismiss: 'Dismiss', iosStep1: '1. Tap the Share button in Safari (□↑)', iosStep2: '2. Scroll down and tap "Add to Home Screen"' },
    tabs: { info:'Structure Info', philosophy:'Our Philosophy', contacts:'Contacts', directions:'Getting Around', map:'Interactive Map', breakfast:'Daily Itinerary', bookServices:'Book Services', events:'City Events', museums:'Museums & Monuments', beach:'Take Me to the Beach', roomGuide:'Back to My Room', checkout:'Check Out', recipes:'No-Cook Recipes', schedine:'Guest documents / Alloggiati Web' },
    home: { greeting:'Welcome to Via Nazionale 🌿', sub:'Your digital concierge in San Filippo del Mela', checkinNew:'Guest documents / Alloggiati Web', checkinNewDesc:'Add guests and send the registration file', checkinDone:'I already checked in', checkinDoneDesc:'Go directly to the app' },
    dash: { welcome:'Via Nazionale Companion', sub:'What can we help you with?' },
    upload: { title:'Guest documents / Alloggiati Web', dropText:'Tap to add photos', dropSub:'Passport, ID card or driving licence', remove:'Remove', attachNote:'Please attach the photos manually', sendWa:'Send via WhatsApp', waMsg:'Hello! Please find attached the guest registration file (schedine alloggiati). Thank you!', continue:'Continue to property info', sent:'Documents sent ✓',
      ocrButton:'Extract data (OCR)', ocrProcessing:'Reading your documents…', ocrErrorMsg:"Couldn't reach the online OCR service. Please fill in all fields manually.",
      techDetailsToggle:'Technical details',
      reviewTitle:'Check the guest data', reviewSub:'Please verify and complete every field before adding this guest — data is captured exactly as it appears on the document.',
      sectionStay:'Stay', sectionAnagrafica:'Personal data', sectionNascita:'Place of birth & citizenship', sectionDocumento:'Identity document',
      fDocType:'Document type', fSurname:'Surname', fGivenNames:'First name(s)', fNumber:'Document number', fDob:'Date of birth',
      fSesso:'Sex', fTipoAlloggiato:'Guest type', fDataArrivo:'Arrival date', fDataPartenza:'Departure date',
      fStatoNascita:'Birth country', fComuneNascita:'Place of birth', fProvinciaNascita:'Province of birth (2-letter code, Italy only)', fCittadinanza:'Nationality', fLuogoRilascio:'Place document was issued',
      ocrConfidenceLabel:'OCR confidence',
      confirmAdd:'Add guest to the list', backToPhotos:'Back to photos', backToList:'Back to guest list',
      listTitle:'Guests in this booking', listEmpty:'No guests added yet.', addGuestBtn:'Add a guest',
      showPreview:'Preview JSON file', hidePreview:'Hide preview',
      sendAutoBtn:'Send automatically (Google Sheet)', sending:'Sending…', sentAutomatically:'Sent ✓',
      sendErrorMsg:"Couldn't write to Google Sheet automatically. Try WhatsApp or download the file below.", downloadBtn:'Download file',

      validationTitle:'Please complete these fields before continuing:', yesterday:'yesterday', today:'today', tomorrow:'tomorrow',
      disclaimerShort:'Photos are processed by a third-party OCR service: your data will be handled by that third party and results may contain errors. If you would rather avoid this, proceed with manual entry instead.',
      disclaimerLinkText:'Read more', disclaimerBack:'Back to guest entry',
      manualEntryBtn:'Fill in manually (no photos, no OCR)',
      downloadedManualMsg:'File downloaded. Send it with whichever tool you prefer: WhatsApp, Telegram, email, or another app.',
      disclaimer: {
        title:'How your data is handled',
        paragraphs:[
          "When you use automatic data extraction (OCR), the photos you take are sent to Google Cloud Vision, a third-party service, to read the text on the document. Google processes them only to return the result and, per its stated policy, does not use them to train its models.",
          "Once you confirm a guest and choose to send the data, it is transmitted to the property either automatically (written directly into a Google Sheet via the Google Sheets API) or, if you choose that option, shared directly via WhatsApp from your device, or downloaded as a file for you to send however you prefer.",
          "Automatic extraction is a convenience, not a guarantee: OCR results can contain errors, especially with damaged, glare-affected, or unusually formatted documents. Every field is always shown to you for review and must be checked and corrected before adding a guest — the app will not let you proceed if required fields are empty.",
          "By choosing to use automatic OCR extraction, you accept that the document photo will be processed by the third-party service described above, and that you are responsible for verifying the accuracy of every field before it is sent. If you would rather not use this feature, you can fill in all fields by hand instead — no photo is taken or sent anywhere in that case.",
          "Data entered in this app is kept only on your device (in the browser's local storage) until you choose to send it, and is cleared when you use the checkout function.",
        ],
      },
    },
    info: { general:'General Info', contacts:'Contacts', address:'Address', phone:'Phone', whatsapp:'Chat on WhatsApp', checkin:'3:00 PM – 10:00 PM', checkout:'By 10:30 AM', wifiConnect:'Connect to WiFi' },
    itinerary: { desc:'Discover the best of the city with this carefully planned itinerary. Explore must-see attractions and enjoy local experiences.', btn:'Explore Milazzo' },
    map: { title:'Milazzo Interactive Map', desc:'Highlights, landmarks and hidden gems.', openMaps:'Open in Google Maps' },
    beach: { desc:'Navigate directly to the nearest beach — crystal-clear Tyrrhenian waters await.', btnTitle:'Take me to the beach', btnSub:'Opens Google Maps · Navigation' },
    room: { desc:'Let us guide you back to Via Nazionale.', btnTitle:'Navigate to Via Nazionale', btnSub:'Opens Google Maps · Turn-by-turn' },
    co: { desc1:'Thank you for staying with us! Before you leave, please:', steps:['Leave all keys inside the room.','Gather all personal belongings, including chargers and electronics.','Check the room for any items left behind.','Settle any outstanding payments including the city tax.'], note:'If you forget anything, we offer a mail-back service (charges apply).', desc2:'Once ready, tap the button below to notify us. Thank you!', btn:'Complete Check-Out' },
    events: { desc:'Events in Milazzo and surroundings — updated regularly.', showPast:'Show past events', hidePast:'Hide past events', noUpcoming:'No upcoming events. Check back soon!' },
    philosophy: ['To welcome without leaving a trace: that is where everything begins. In the heart of Milazzo, where the rhythm of the city meets the sea, we imagined a space capable of blending naturally and discreetly into the urban fabric, offering a comfortable and authentic stay.','All our rooms — junior suites — are crafted down to the last detail: natural light, soundproofing, efficient systems that minimise waste. Generous, balanced spaces designed for genuine, deep well-being, built on quality and harmony.','Sustainability is a concrete choice, lived every day with real commitment. We have eliminated single-use plastic and disposable paper, provide free drinking water and use only energy from renewable sources. In this way, we contribute to a truly responsible hospitality.','Being in the centre means discovering the city authentically. We are working to promote soft mobility such as cycling, with dedicated itineraries and maps to help you navigate easily and reduce your environmental footprint.','We believe in a hospitality where responsibility and comfort merge without compromise. We have already thought of everything: guests do not need to do anything differently or adopt any particular eco-conscious behaviour. They can simply relax and enjoy their holiday, while we act discreetly to minimise our impact. What remains is the memory of a light, authentic and mindful journey — with a minimal footprint on the environment and a positive mark within oneself.'],
    dir: {
      arriving: 'Arriving', leaving: 'Leaving San Filippo del Mela',
      arrivalModes: [
        { icon:'directions_car', color:'#8a1f1f', title:'By Car', desc:'Take the A20 motorway "Milazzo" exit: the property is about a 1-minute drive from the exit, at Via Archi Nazionale 16, San Filippo del Mela. Free parking available nearby.' },
        { icon:'train', color:'#0284c7', title:'By Train', desc:'The nearest station is Milazzo; from there, we recommend a taxi (about 10 minutes) to reach the property.' },
        { icon:'directions_bus', color:'#d97706', title:'By Bus', desc:'From Catania airport or other locations, get off at the Milazzo bus station and continue by taxi to Via Archi Nazionale, San Filippo del Mela (about 10 minutes).' }
      ],
      departureModes: [
        { icon:'directions_car', color:'#8a1f1f', title:'By Car', desc:'From the property it takes about 1 minute to join the A20 motorway toward Messina (Catania) or Palermo.' },
        { icon:'directions_bus', color:'#d97706', title:'By Bus to Messina', desc:'Check schedules for GiuntaBus and AST (Azienda Siciliana Trasporti) from the Milazzo bus station for daily connections to Messina.' },
        { icon:'train', color:'#0284c7', title:'By Train', desc:'Take a taxi to Milazzo station (about 10 minutes) for train connections.' },
        { icon:'flight', color:'#7c3aed', title:'To Catania Airport', desc:'Direct bus connections from Milazzo to Catania airport — check schedules at the bus station.' }
      ]
    },
    services: [
      { emoji:'🚲', title:'Bike Rental', price:'From €10 / day', note:'Explore Milazzo on two wheels — city bikes and e-bikes available.', waText:'Hello, I would like to book a bike rental.' },
      { emoji:'🤿', title:'Scuba Diving', price:'From €60 / person', note:'Book 24h in advance. Crystal-clear waters of the Tyrrhenian await.', waText:'Hello, I would like to book a scuba diving experience.' },
      { emoji:'⛵', title:'Aeolian Islands Tour (2-3 islands)', price:'From €40 / person', note:'Book with Navisal or Tarnav. Day trips to Lipari, Stromboli, Vulcano and more.', waText:'Hello, I would like information about the Aeolian Islands tour.' },
      { emoji:'🛥️', title:'Private Aeolian Islands Tour', price:'From €100 / person', note:'Exclusive private boat tour. Customisable itinerary.', waText:'Hello, I would like to book a private Aeolian Islands tour.' }
    ]
  },
  it: {
    back: 'Indietro', openMaps: 'Apri in Maps', bookWa: 'Prenota via WhatsApp',
    offline: 'Sei offline — alcuni contenuti potrebbero non caricarsi.',
    install: { title: 'Installa app Via Nazionale', sub: 'Aggiungila alla schermata home', btn: 'Installa', dismiss: 'Ignora', iosStep1: '1. Tocca il pulsante Condividi in Safari (□↑)', iosStep2: '2. Scorri e tocca "Aggiungi alla schermata Home"' },
    tabs: { info:'Info Struttura', philosophy:'La Nostra Filosofia', contacts:'Contatti', directions:'Raggiungere/Lasciare la Struttura', map:'Mappa Interattiva', breakfast:'Itinerario Giornaliero', bookServices:'Prenota Servizi', events:'Eventi in Città', museums:'Musei e Monumenti', beach:'Portami alla Spiaggia', roomGuide:'Riportami alla Camera', checkout:'Check-Out', recipes:'Ricette No-Cook', schedine:'Documenti ospiti / Schedine Alloggiati' },
    home: { greeting:'Benvenuto a Via Nazionale 🌿', sub:'Il tuo concierge digitale a San Filippo del Mela', checkinNew:'Documenti ospiti / Schedine Alloggiati', checkinNewDesc:"Aggiungi gli ospiti e invia il file di registrazione", checkinDone:'Ho già fatto il check-in', checkinDoneDesc:"Vai direttamente all'app" },
    dash: { welcome:'Via Nazionale Companion', sub:'Come possiamo aiutarti?' },
    upload: { title:"Documenti ospiti / Alloggiati Web", dropText:'Tocca per aggiungere foto', dropSub:"Passaporto, carta d'identità o patente", remove:'Rimuovi', attachNote:"Si prega di allegare le foto manualmente", sendWa:"Invia tramite WhatsApp", waMsg:"Buongiorno! In allegato il file per la registrazione ospiti (schedine alloggiati). Grazie!", continue:'Continua alle info sulla struttura', sent:'Documenti inviati ✓',
      ocrButton:'Estrai dati (OCR)', ocrProcessing:'Lettura dei documenti in corso…', ocrErrorMsg:"Non è stato possibile raggiungere il servizio OCR online. Compila tutti i campi manualmente.",
      techDetailsToggle:'Dettagli tecnici',
      reviewTitle:'Controlla i dati dell\'ospite', reviewSub:'Verifica e completa ogni campo prima di aggiungere questo ospite: i dati vengono acquisiti così come compaiono sul documento.',
      sectionStay:'Soggiorno', sectionAnagrafica:'Dati anagrafici', sectionNascita:'Nascita e cittadinanza', sectionDocumento:'Documento di riconoscimento',
      fDocType:'Tipo documento', fSurname:'Cognome', fGivenNames:'Nome/i', fNumber:'Numero documento', fDob:'Data di nascita',
      fSesso:'Sesso', fTipoAlloggiato:'Tipo ospite', fDataArrivo:'Data di arrivo', fDataPartenza:'Data di partenza',
      fStatoNascita:'Stato di nascita', fComuneNascita:'Luogo di nascita', fProvinciaNascita:'Provincia di nascita (sigla, solo se nato in Italia)', fCittadinanza:'Cittadinanza', fLuogoRilascio:'Luogo di rilascio del documento',
      ocrConfidenceLabel:'Affidabilità OCR',
      confirmAdd:'Aggiungi ospite alla lista', backToPhotos:'Torna alle foto', backToList:'Torna alla lista ospiti',
      listTitle:'Ospiti di questa pratica', listEmpty:'Nessun ospite ancora aggiunto.', addGuestBtn:'Aggiungi un ospite',
      showPreview:'Anteprima file JSON', hidePreview:'Nascondi anteprima',
      sendAutoBtn:'Invia automaticamente (Google Sheet)', sending:'Invio in corso…', sentAutomatically:'Inviato ✓',
      sendErrorMsg:'Non è stato possibile scrivere automaticamente su Google Sheet. Prova con WhatsApp o scarica il file qui sotto.', downloadBtn:'Scarica il file',

      validationTitle:'Completa questi campi prima di continuare:', yesterday:'ieri', today:'oggi', tomorrow:'domani',
      disclaimerShort:'Le foto vengono elaborate da un servizio OCR di terze parti: i tuoi dati saranno trattati da terzi e il risultato può contenere errori. Se preferisci evitarlo, procedi con l\'inserimento manuale.',
      disclaimerLinkText:'Scopri di più', disclaimerBack:'Torna all\'inserimento ospite',
      manualEntryBtn:'Compila manualmente (senza foto né OCR)',
      downloadedManualMsg:'File scaricato. Invialo con lo strumento che preferisci: WhatsApp, Telegram, email o un\'altra app.',
      disclaimer: {
        title:'Come vengono trattati i tuoi dati',
        paragraphs:[
          "Quando usi l'estrazione automatica dei dati (OCR), le foto che scatti vengono inviate a Google Cloud Vision, un servizio di terze parti, per leggere il testo sul documento. Google le elabora solo per restituire il risultato e, secondo la sua policy dichiarata, non le usa per addestrare i propri modelli.",
          "Una volta confermato un ospite e scelto di inviare i dati, questi vengono trasmessi alla struttura in automatico (scritti direttamente in un Google Sheet tramite le API di Google Sheets) oppure, se scegli questa opzione, condivisi direttamente su WhatsApp dal tuo dispositivo, o scaricati come file da inviare come preferisci.",
          "L'estrazione automatica è una comodità, non una garanzia: i risultati dell'OCR possono contenere errori, specialmente con documenti danneggiati, con riflessi di luce o con formati insoliti. Ogni campo ti viene sempre mostrato per la revisione e va controllato e corretto prima di aggiungere un ospite — l'app non ti lascia proseguire se mancano campi obbligatori.",
          "Scegliendo di usare l'estrazione automatica OCR, accetti che la foto del documento venga elaborata dal servizio di terze parti sopra descritto, e sei responsabile della verifica dell'esattezza di ogni campo prima dell'invio. Se preferisci non usare questa funzione, puoi compilare tutti i campi a mano: in quel caso nessuna foto viene scattata né inviata da nessuna parte.",
          "I dati inseriti in questa app restano solo sul tuo dispositivo (nella memoria locale del browser) finché non scegli di inviarli, e vengono cancellati quando usi la funzione di checkout.",
        ],
      },
    },
    info: { general:'Informazioni Generali', contacts:'Contatti', address:'Indirizzo', phone:'Telefono', whatsapp:'Chatta su WhatsApp', checkin:'15:00 – 22:00', checkout:'Entro le 10:30', wifiConnect:'Connetti al WiFi' },
    itinerary: { desc:'Scopri il meglio della città con questo itinerario giornaliero ben pianificato.', btn:'Esplora Milazzo' },
    map: { title:'Mappa Interattiva di Milazzo', desc:'Attrazioni, monumenti e gemme nascoste.', openMaps:'Apri in Google Maps' },
    beach: { desc:'Naviga direttamente alla spiaggia più vicina — acque cristalline del Tirreno ti aspettano.', btnTitle:'Portami alla spiaggia', btnSub:'Apre Google Maps · Navigazione' },
    room: { desc:'Lasciati guidare verso Via Nazionale.', btnTitle:'Naviga verso Via Nazionale', btnSub:'Apre Google Maps · Indicazioni' },
    co: { desc1:'Grazie per aver soggiornato da noi! Prima di partire, ti preghiamo di:', steps:['Lascia tutte le chiavi nella camera.','Raccogli tutti i tuoi oggetti personali, compresi caricabatterie ed elettroniche.','Controlla accuratamente la camera per eventuali oggetti dimenticati.','Regola tutti i pagamenti in sospeso, inclusa la tassa di soggiorno.'], note:'Se dimentichi qualcosa, offriamo un servizio di rispedizione (con costi aggiuntivi).', desc2:'Una volta pronto, tocca il pulsante qui sotto per avvisarci. Grazie!', btn:'Completa Check-Out' },
    events: { desc:'Prossimi eventi a Milazzo e dintorni — aggiornati regolarmente.', showPast:'Mostra eventi precedenti', hidePast:'Nascondi eventi precedenti', noUpcoming:'Nessun evento in programma. Ricontrolla presto!' },
    philosophy: ["Accogliere senza lasciare traccia: da qui nasce tutto. Nel cuore di Milazzo, dove il ritmo della città incontra il mare, abbiamo immaginato uno spazio capace di integrarsi in modo naturale e discreto nel contesto urbano, offrendo un'esperienza di soggiorno confortevole e autentica.","Tutte le nostre camere, junior suite, sono curate nei minimi dettagli: luce naturale, insonorizzazione, impianti efficienti che riducono gli sprechi. Spazi ampi ed equilibrati, pensati per un benessere autentico e profondo, fatto di qualità e armonia.","La sostenibilità è una scelta concreta, vissuta ogni giorno con impegno reale. Abbiamo eliminato plastica monouso e carta usa e getta, offriamo acqua potabile gratuita e usiamo solo energia da fonti rinnovabili. Così, contribuiamo a un'ospitalità veramente responsabile.","Essere in centro significa scoprire la città in modo autentico. Stiamo lavorando per promuovere la mobilità dolce come la bicicletta, con itinerari e mappe dedicate per orientarsi facilmente e ridurre l'impatto ambientale.","Crediamo in un'ospitalità dove responsabilità e comfort si fondono senza compromessi. Abbiamo già pensato a tutto: l'ospite non deve fare nulla di diverso, né adottare atteggiamenti responsabili. Può semplicemente rilassarsi e godersi la vacanza, mentre noi agiamo in modo discreto per minimizzare l'impatto. Quello che resta è il ricordo di un viaggio leggero, autentico e consapevole — con un'impronta minima sull'ambiente e un segno positivo dentro di sé."],
    dir: {
      arriving: 'Arrivare', leaving: 'Lasciare San Filippo del Mela',
      arrivalModes: [
        { icon:'directions_car', color:'#8a1f1f', title:'In Auto', desc:"Esci all'uscita autostradale A20 \"Milazzo\": la struttura si trova a circa 1 minuto d'auto dallo svincolo, in Via Archi Nazionale 16, San Filippo del Mela. Parcheggio libero disponibile in zona." },
        { icon:'train', color:'#0284c7', title:'In Treno', desc:"La stazione più vicina è quella di Milazzo; da lì raggiungi la struttura in taxi (circa 10 minuti)." },
        { icon:'directions_bus', color:'#d97706', title:'In Autobus', desc:"Dall'aeroporto di Catania o da altre località, scendi alla fermata di Milazzo (autostazione) e prosegui in taxi fino a Via Archi Nazionale, San Filippo del Mela (circa 10 minuti)." }
      ],
      departureModes: [
        { icon:'directions_car', color:'#8a1f1f', title:'In Auto', desc:"Dalla struttura basta circa 1 minuto per immettersi sull'A20 direzione Messina (Catania) o Palermo." },
        { icon:'directions_bus', color:'#d97706', title:'In Autobus (verso Messina)', desc:'Consulta gli orari di GiuntaBus e AST (Azienda Siciliana Trasporti) dall\'autostazione di Milazzo per le corse giornaliere verso Messina.' },
        { icon:'train', color:'#0284c7', title:'In Treno', desc:'Raggiungi in taxi la stazione di Milazzo (circa 10 minuti) per i collegamenti ferroviari.' },
        { icon:'flight', color:'#7c3aed', title:'Aeroporto di Catania', desc:"Collegamenti diretti in autobus da Milazzo all'aeroporto di Catania — controlla gli orari in autostazione." }
      ]
    },
    services: [
      { emoji:'🚲', title:'Noleggio Biciclette', price:'Da €10 / giorno', note:'Esplora Milazzo in bici — city bike ed e-bike disponibili.', waText:'Ciao, vorrei noleggiare una bicicletta.' },
      { emoji:'🤿', title:'Immersioni Subacquee', price:'Da €60 / persona', note:"Prenota 24h in anticipo. Le acque cristalline del Tirreno ti aspettano.", waText:"Ciao, vorrei prenotare un'immersione." },
      { emoji:'⛵', title:'Tour Isole Eolie (2-3 isole)', price:'Da €40 / persona', note:'Prenota con Navisal o Tarnav. Gite a Lipari, Stromboli, Vulcano e altro.', waText:'Ciao, vorrei informazioni sul tour delle Isole Eolie.' },
      { emoji:'🛥️', title:'Tour Privato Isole Eolie', price:'Da €100 / persona', note:'Tour in barca privata. Itinerario personalizzabile.', waText:'Ciao, vorrei prenotare un tour privato alle Isole Eolie.' }
    ]
  },
  fr: {
    back:'Retour', openMaps:'Ouvrir dans Maps', bookWa:'Réserver via WhatsApp',
    offline:"Vous êtes hors ligne — certains contenus peuvent ne pas se charger.",
    install:{ title:"Installer l'app Via Nazionale", sub:"Ajoutez-la à votre écran d'accueil", btn:'Installer', dismiss:'Ignorer', iosStep1:"1. Appuyez sur le bouton Partager dans Safari (□↑)", iosStep2:"2. Faites défiler et appuyez sur \"Sur l'écran d'accueil\"" },
    tabs:{ info:'Infos Structure', philosophy:'Notre Philosophie', contacts:'Contacts', directions:"Arriver/Quitter la Structure", map:'Carte Interactive', breakfast:'Itinéraire du Jour', bookServices:'Réserver Services', events:'Événements en Ville', museums:'Musées et Monuments', beach:'Emmène-moi à la Plage', roomGuide:'Retour à ma Chambre', checkout:'Check-Out', recipes:'Recettes Sans Cuisson', schedine:'Documents des clients / Alloggiati Web' },
    home:{ greeting:'Bienvenue à Via Nazionale 🌿', sub:'Votre concierge digital à San Filippo del Mela', checkinNew:'Documents des clients / Alloggiati Web', checkinNewDesc:'Ajoutez vos clients et envoyez le fichier d\'enregistrement', checkinDone:'Je suis déjà enregistré', checkinDoneDesc:"Accéder directement à l'app" },
    dash:{ welcome:'Via Nazionale Companion', sub:'Comment pouvons-nous vous aider ?' },
    upload:{ title:"Documents des clients / Alloggiati Web", dropText:'Appuyez pour ajouter des photos', dropSub:"Passeport, carte d'identité ou permis de conduire", remove:'Supprimer', attachNote:"Veuillez joindre les photos manuellement", sendWa:"Envoyer via WhatsApp", waMsg:"Bonjour ! Voici en pièce jointe le fichier d'enregistrement des clients (schedine alloggiati). Merci !", continue:"Continuer vers les infos de l'hébergement", sent:'Documents envoyés ✓',
      ocrButton:'Extraire les données (OCR)', ocrProcessing:'Lecture de vos documents…', ocrErrorMsg:"Impossible de joindre le service OCR en ligne. Veuillez remplir tous les champs manuellement.",
      techDetailsToggle:'Détails techniques',
      reviewTitle:'Vérifiez les données du client', reviewSub:"Veuillez vérifier et compléter chaque champ avant d'ajouter ce client — les données sont saisies telles qu'elles apparaissent sur le document.",
      sectionStay:'Séjour', sectionAnagrafica:'Données personnelles', sectionNascita:'Lieu de naissance et nationalité', sectionDocumento:"Pièce d'identité",
      fDocType:'Type de document', fSurname:'Nom de famille', fGivenNames:'Prénom(s)', fNumber:'Numéro du document', fDob:'Date de naissance',
      fSesso:'Sexe', fTipoAlloggiato:"Type d'hôte", fDataArrivo:"Date d'arrivée", fDataPartenza:'Date de départ',
      fStatoNascita:'Pays de naissance', fComuneNascita:'Lieu de naissance', fProvinciaNascita:'Province de naissance (code à 2 lettres, Italie uniquement)', fCittadinanza:'Nationalité', fLuogoRilascio:'Lieu de délivrance du document',
      ocrConfidenceLabel:'Fiabilité OCR',
      confirmAdd:'Ajouter le client à la liste', backToPhotos:'Retour aux photos', backToList:'Retour à la liste des clients',
      listTitle:'Clients de cette réservation', listEmpty:'Aucun client ajouté pour le moment.', addGuestBtn:'Ajouter un client',
      showPreview:'Aperçu du fichier JSON', hidePreview:"Masquer l'aperçu",
      sendAutoBtn:'Envoyer automatiquement (Google Sheet)', sending:'Envoi en cours…', sentAutomatically:'Envoyé ✓',
      sendErrorMsg:"Impossible d'écrire automatiquement dans Google Sheet. Essayez WhatsApp ou téléchargez le fichier ci-dessous.", downloadBtn:'Télécharger le fichier',

      validationTitle:'Veuillez compléter ces champs avant de continuer :', yesterday:'hier', today:"aujourd'hui", tomorrow:'demain',
      disclaimerShort:"Les photos sont traitées par un service OCR tiers : vos données seront traitées par ce tiers et le résultat peut contenir des erreurs. Si vous préférez éviter cela, procédez à la saisie manuelle.",
      disclaimerLinkText:'En savoir plus', disclaimerBack:'Retour à la saisie du client',
      manualEntryBtn:'Remplir manuellement (sans photo ni OCR)',
      downloadedManualMsg:"Fichier téléchargé. Envoyez-le avec l'outil de votre choix : WhatsApp, Telegram, e-mail ou une autre application.",
      disclaimer: {
        title:'Comment vos données sont traitées',
        paragraphs:[
          "Lorsque vous utilisez l'extraction automatique des données (OCR), les photos que vous prenez sont envoyées à Google Cloud Vision, un service tiers, pour lire le texte du document. Google les traite uniquement pour renvoyer le résultat et, selon sa politique déclarée, ne les utilise pas pour entraîner ses modèles.",
          "Une fois qu'un client est confirmé et que vous choisissez d'envoyer les données, celles-ci sont transmises à l'établissement soit automatiquement (écrites directement dans un Google Sheet via l'API Google Sheets), soit, si vous choisissez cette option, partagées directement via WhatsApp depuis votre appareil, ou téléchargées sous forme de fichier à envoyer comme vous préférez.",
          "L'extraction automatique est une commodité, pas une garantie : les résultats de l'OCR peuvent contenir des erreurs, en particulier avec des documents endommagés, avec des reflets ou de format inhabituel. Chaque champ vous est toujours présenté pour vérification et doit être contrôlé et corrigé avant d'ajouter un client — l'application ne vous laisse pas continuer si des champs obligatoires sont vides.",
          "En choisissant d'utiliser l'extraction OCR automatique, vous acceptez que la photo du document soit traitée par le service tiers décrit ci-dessus, et vous êtes responsable de la vérification de l'exactitude de chaque champ avant son envoi. Si vous préférez ne pas utiliser cette fonction, vous pouvez remplir tous les champs à la main : dans ce cas, aucune photo n'est prise ni envoyée nulle part.",
          "Les données saisies dans cette application restent uniquement sur votre appareil (dans la mémoire locale du navigateur) jusqu'à ce que vous choisissiez de les envoyer, et sont effacées lorsque vous utilisez la fonction de check-out.",
        ],
      },
    },
    info:{ general:'Informations Générales', contacts:'Contacts', address:'Adresse', phone:'Téléphone', whatsapp:'Chat sur WhatsApp', checkin:'15h00 – 22h00', checkout:'Avant 10h30', wifiConnect:'Se connecter au WiFi' },
    itinerary:{ desc:'Découvrez le meilleur de la ville grâce à cet itinéraire soigneusement planifié.', btn:'Explorer Milazzo' },
    map:{ title:'Carte Interactive de Milazzo', desc:'Attractions, monuments et joyaux cachés.', openMaps:'Ouvrir dans Google Maps' },
    beach:{ desc:'Naviguez directement vers la plage la plus proche — des eaux cristallines vous attendent.', btnTitle:'Emmène-moi à la plage', btnSub:'Ouvre Google Maps · Navigation' },
    room:{ desc:"Laissez-nous vous guider jusqu'à Via Nazionale.", btnTitle:'Naviguer vers Via Nazionale', btnSub:'Ouvre Google Maps · Itinéraire' },
    co:{ desc1:'Merci pour votre séjour ! Avant de partir, veuillez :', steps:["Laissez toutes les clés dans la chambre.","Rassemblez toutes vos affaires personnelles, y compris chargeurs et électroniques.","Vérifiez soigneusement la chambre pour tout objet oublié.","Réglez tous les paiements en attente, y compris la taxe de séjour."], note:'Si vous oubliez quelque chose, nous proposons un service de renvoi (frais applicables).', desc2:'Une fois prêt, appuyez sur le bouton ci-dessous pour nous prévenir. Merci !', btn:'Finaliser le Check-Out' },
    events:{ desc:'Événements à Milazzo et environs — mis à jour régulièrement.', showPast:'Afficher les événements passés', hidePast:'Masquer les événements passés', noUpcoming:'Aucun événement à venir. Revenez bientôt !' },
    philosophy:["Accueillir sans laisser de trace : c'est là que tout commence. Au cœur de Milazzo, où le rythme de la ville rencontre la mer, nous avons imaginé un espace capable de s'intégrer naturellement et discrètement dans le tissu urbain, offrant un séjour confortable et authentique.","Toutes nos chambres — junior suites — sont soignées dans les moindres détails : lumière naturelle, isolation phonique, systèmes efficaces qui minimisent le gaspillage. Des espaces généreux et équilibrés conçus pour un vrai bien-être profond, fondé sur la qualité et l'harmonie.","La durabilité est un choix concret, vécu chaque jour avec un engagement réel. Nous avons éliminé le plastique à usage unique et le papier jetable, proposons de l'eau potable gratuite et utilisons uniquement de l'énergie issue de sources renouvelables. Ainsi, nous contribuons à une hospitalité véritablement responsable.","Être au centre, c'est découvrir la ville authentiquement. Nous travaillons à promouvoir la mobilité douce comme le vélo, avec des itinéraires et des cartes dédiés pour se repérer facilement et réduire son empreinte environnementale.","Nous croyons en une hospitalité où responsabilité et confort fusionnent sans compromis. Nous avons déjà tout prévu : les hôtes n'ont rien à faire différemment ni à adopter de comportements éco-responsables particuliers. Ils peuvent simplement se détendre et profiter de leurs vacances, tandis que nous agissons discrètement pour minimiser notre impact. Ce qui reste, c'est le souvenir d'un voyage léger, authentique et conscient — avec une empreinte minimale sur l'environnement et une marque positive en soi."],
    dir:{ arriving:'Arrivée', leaving:'Quitter San Filippo del Mela', arrivalModes:[{icon:'directions_car',color:'#8a1f1f',title:'En Voiture',desc:"Prenez la sortie d'autoroute A20 « Milazzo » : l'hébergement se trouve à environ 1 minute de route de la sortie, Via Archi Nazionale 16, San Filippo del Mela. Parking gratuit à proximité."},{icon:'train',color:'#0284c7',title:'En Train',desc:"La gare la plus proche est celle de Milazzo ; de là, nous recommandons un taxi (environ 10 minutes) pour rejoindre l'hébergement."},{icon:'directions_bus',color:'#d97706',title:'En Bus',desc:"Depuis l'aéroport de Catane ou d'autres localités, descendez à la gare routière de Milazzo et poursuivez en taxi jusqu'à Via Archi Nazionale, San Filippo del Mela (environ 10 minutes)."}], departureModes:[{icon:'directions_car',color:'#8a1f1f',title:'En Voiture',desc:"Depuis l'hébergement, il suffit d'environ 1 minute pour rejoindre l'A20 en direction de Messine (Catane) ou Palerme."},{icon:'directions_bus',color:'#d97706',title:'En Bus (vers Messine)',desc:'Vérifiez les horaires de GiuntaBus et AST depuis la gare routière de Milazzo pour les liaisons journalières vers Messine.'},{icon:'train',color:'#0284c7',title:'En Train',desc:"Prenez un taxi jusqu'à la gare de Milazzo (environ 10 minutes) pour les correspondances ferroviaires."},{icon:'flight',color:'#7c3aed',title:"Aéroport de Catane",desc:"Liaisons directes en bus de Milazzo vers l'aéroport de Catane — vérifiez les horaires à la gare routière."}] },
    services:[{emoji:'🚲',title:'Location de vélos',price:'À partir de €10 / jour',note:'Explorez Milazzo à vélo — vélos urbains et électriques disponibles.',waText:'Bonjour, je voudrais louer un vélo.'},{emoji:'🤿',title:'Plongée sous-marine',price:'À partir de €60 / pers.',note:'Réservez 24h à l\'avance. Des eaux cristallines vous attendent.',waText:'Bonjour, je voudrais réserver une plongée.'},{emoji:'⛵',title:'Tour îles Éoliennes (2-3 îles)',price:'À partir de €40 / pers.',note:'Réservez via Navisal ou Tarnav. Excursions à Lipari, Stromboli, Vulcano.',waText:'Bonjour, je voudrais des infos sur le tour des îles Éoliennes.'},{emoji:'🛥️',title:'Tour privé îles Éoliennes',price:'À partir de €100 / pers.',note:'Croisière privée. Itinéraire personnalisable.',waText:'Bonjour, je voudrais réserver un tour privé aux îles Éoliennes.'}]
  },
  es: {
    back:'Volver', openMaps:'Abrir en Maps', bookWa:'Reservar por WhatsApp',
    offline:'Estás sin conexión — algunos contenidos pueden no cargarse.',
    install:{ title:'Instalar app Via Nazionale', sub:'Añadir a tu pantalla de inicio', btn:'Instalar', dismiss:'Ignorar', iosStep1:'1. Toca el botón Compartir en Safari (□↑)', iosStep2:'2. Desplázate y toca "Añadir a la pantalla de inicio"' },
    tabs:{ info:'Info del Alojamiento', philosophy:'Nuestra Filosofía', contacts:'Contactos', directions:'Llegar/Salir del Alojamiento', map:'Mapa Interactivo', breakfast:'Itinerario Diario', bookServices:'Reservar Servicios', events:'Eventos en la Ciudad', museums:'Museos y Monumentos', beach:'Llévame a la Playa', roomGuide:'Volver a Mi Habitación', checkout:'Check-Out', recipes:'Recetas Sin Cocinar', schedine:'Documentos de huéspedes / Alloggiati Web' },
    home:{ greeting:'Bienvenido a Via Nazionale 🌿', sub:'Tu conserje digital en San Filippo del Mela', checkinNew:'Documentos de huéspedes / Alloggiati Web', checkinNewDesc:'Añade huéspedes y envía el archivo de registro', checkinDone:'Ya hice el check-in', checkinDoneDesc:'Ir directamente a la app' },
    dash:{ welcome:'Via Nazionale Companion', sub:'¿En qué podemos ayudarte?' },
    upload:{ title:'Documentos de huéspedes / Alloggiati Web', dropText:'Toca para añadir fotos', dropSub:'Pasaporte, DNI o carnet de conducir', remove:'Eliminar', attachNote:"Por favor adjunte las fotos manualmente", sendWa:"Enviar por WhatsApp", waMsg:"¡Hola! Adjunto el archivo de registro de huéspedes (schedine alloggiati). ¡Gracias!", continue:'Continuar a info del alojamiento', sent:'Documentos enviados ✓',
      ocrButton:'Extraer datos (OCR)', ocrProcessing:'Leyendo tus documentos…', ocrErrorMsg:"No se pudo contactar con el servicio OCR en línea. Completa todos los campos manualmente.",
      techDetailsToggle:'Detalles técnicos',
      reviewTitle:'Revisa los datos del huésped', reviewSub:'Verifica y completa cada campo antes de añadir a este huésped — los datos se capturan tal como aparecen en el documento.',
      sectionStay:'Estancia', sectionAnagrafica:'Datos personales', sectionNascita:'Lugar de nacimiento y nacionalidad', sectionDocumento:'Documento de identidad',
      fDocType:'Tipo de documento', fSurname:'Apellido', fGivenNames:'Nombre(s)', fNumber:'Número de documento', fDob:'Fecha de nacimiento',
      fSesso:'Sexo', fTipoAlloggiato:'Tipo de huésped', fDataArrivo:'Fecha de llegada', fDataPartenza:'Fecha de salida',
      fStatoNascita:'País de nacimiento', fComuneNascita:'Lugar de nacimiento', fProvinciaNascita:'Provincia de nacimiento (código de 2 letras, solo Italia)', fCittadinanza:'Nacionalidad', fLuogoRilascio:'Lugar de expedición del documento',
      ocrConfidenceLabel:'Fiabilidad del OCR',
      confirmAdd:'Añadir huésped a la lista', backToPhotos:'Volver a las fotos', backToList:'Volver a la lista de huéspedes',
      listTitle:'Huéspedes de esta reserva', listEmpty:'Aún no se han añadido huéspedes.', addGuestBtn:'Añadir un huésped',
      showPreview:'Vista previa del archivo JSON', hidePreview:'Ocultar vista previa',
      sendAutoBtn:'Enviar automáticamente (Google Sheet)', sending:'Enviando…', sentAutomatically:'Enviado ✓',
      sendErrorMsg:"No se pudo escribir automáticamente en Google Sheet. Prueba con WhatsApp o descarga el archivo debajo.", downloadBtn:'Descargar archivo',

      validationTitle:'Completa estos campos antes de continuar:', yesterday:'ayer', today:'hoy', tomorrow:'mañana',
      disclaimerShort:'Las fotos son procesadas por un servicio OCR de terceros: tus datos serán tratados por ese tercero y el resultado puede contener errores. Si prefieres evitarlo, continúa con la introducción manual.',
      disclaimerLinkText:'Saber más', disclaimerBack:'Volver a la entrada del huésped',
      manualEntryBtn:'Rellenar manualmente (sin fotos ni OCR)',
      downloadedManualMsg:'Archivo descargado. Envíalo con la herramienta que prefieras: WhatsApp, Telegram, correo electrónico u otra aplicación.',
      disclaimer: {
        title:'Cómo se tratan tus datos',
        paragraphs:[
          "Cuando usas la extracción automática de datos (OCR), las fotos que tomas se envían a Google Cloud Vision, un servicio de terceros, para leer el texto del documento. Google las procesa solo para devolver el resultado y, según su política declarada, no las usa para entrenar sus modelos.",
          "Una vez confirmado un huésped y elegido enviar los datos, estos se transmiten al alojamiento de forma automática (escritos directamente en una Google Sheet mediante la API de Google Sheets) o, si eliges esa opción, se comparten directamente por WhatsApp desde tu dispositivo, o se descargan como archivo para que lo envíes como prefieras.",
          "La extracción automática es una comodidad, no una garantía: los resultados del OCR pueden contener errores, especialmente con documentos dañados, con reflejos o con formatos poco habituales. Cada campo se te muestra siempre para su revisión y debe comprobarse y corregirse antes de añadir a un huésped — la app no te deja continuar si faltan campos obligatorios.",
          "Al elegir usar la extracción automática por OCR, aceptas que la foto del documento sea procesada por el servicio de terceros descrito anteriormente, y eres responsable de verificar la exactitud de cada campo antes de su envío. Si prefieres no usar esta función, puedes rellenar todos los campos a mano: en ese caso no se toma ni se envía ninguna foto a ningún sitio.",
          "Los datos introducidos en esta app se guardan solo en tu dispositivo (en el almacenamiento local del navegador) hasta que decidas enviarlos, y se borran cuando usas la función de checkout.",
        ],
      },
    },
    info:{ general:'Información General', contacts:'Contactos', address:'Dirección', phone:'Teléfono', whatsapp:'Chat en WhatsApp', checkin:'15:00 – 22:00', checkout:'Antes de las 10:30', wifiConnect:'Conectar al WiFi' },
    itinerary:{ desc:'Descubre lo mejor de la ciudad con este itinerario cuidadosamente planificado.', btn:'Explorar Milazzo' },
    map:{ title:'Mapa Interactivo de Milazzo', desc:'Atracciones, monumentos y joyas ocultas.', openMaps:'Abrir en Google Maps' },
    beach:{ desc:'Navega directamente a la playa más cercana — aguas cristalinas del Tirreno te esperan.', btnTitle:'Llévame a la playa', btnSub:'Abre Google Maps · Navegación' },
    room:{ desc:'Déjanos guiarte de vuelta a Via Nazionale.', btnTitle:'Navegar a Via Nazionale', btnSub:'Abre Google Maps · Ruta' },
    co:{ desc1:'¡Gracias por tu estancia! Antes de salir, por favor:', steps:['Deja todas las llaves dentro de la habitación.','Recoge todos tus objetos personales, incluyendo cargadores y electrónicos.','Revisa la habitación por si olvidaste algo.','Liquida cualquier pago pendiente, incluyendo la tasa turística.'], note:'Si olvidas algo, ofrecemos servicio de reenvío por correo (con cargo).', desc2:'Cuando estés listo, pulsa el botón para avisarnos. ¡Gracias!', btn:'Completar Check-Out' },
    events:{ desc:'Eventos en Milazzo y alrededores — actualizados regularmente.', showPast:'Mostrar eventos pasados', hidePast:'Ocultar eventos pasados', noUpcoming:'No hay eventos próximos. ¡Vuelve pronto!' },
    philosophy:['Acoger sin dejar huella: ahí empieza todo. En el corazón de Milazzo, donde el ritmo de la ciudad se encuentra con el mar, imaginamos un espacio capaz de integrarse de forma natural y discreta en el tejido urbano, ofreciendo una estancia cómoda y auténtica.','Todas nuestras habitaciones —junior suites— están cuidadas hasta el último detalle: luz natural, insonorización, sistemas eficientes que minimizan el desperdicio. Espacios generosos y equilibrados diseñados para un bienestar genuino y profundo, basado en la calidad y la armonía.','La sostenibilidad es una elección concreta, vivida cada día con verdadero compromiso. Hemos eliminado el plástico de un solo uso y el papel desechable, ofrecemos agua potable gratuita y utilizamos únicamente energía de fuentes renovables. Así contribuimos a una hospitalidad verdaderamente responsable.','Estar en el centro significa descubrir la ciudad de forma auténtica. Trabajamos para promover la movilidad suave como el ciclismo, con itinerarios y mapas dedicados para navegar fácilmente y reducir la huella ambiental.','Creemos en una hospitalidad donde responsabilidad y comodidad se fusionan sin compromisos. Ya hemos pensado en todo: los huéspedes no necesitan hacer nada diferente ni adoptar ningún comportamiento especial. Pueden simplemente relajarse y disfrutar de sus vacaciones, mientras actuamos discretamente para minimizar nuestro impacto. Lo que queda es el recuerdo de un viaje ligero, auténtico y consciente — con una huella mínima en el entorno y una marca positiva en uno mismo.'],
    dir:{ arriving:'Llegada', leaving:'Salir de San Filippo del Mela', arrivalModes:[{icon:'directions_car',color:'#8a1f1f',title:'En Coche',desc:'Toma la salida de autopista A20 "Milazzo": el alojamiento está a aproximadamente 1 minuto en coche de la salida, en Via Archi Nazionale 16, San Filippo del Mela. Aparcamiento gratuito cerca.'},{icon:'train',color:'#0284c7',title:'En Tren',desc:'La estación más cercana es la de Milazzo; desde allí recomendamos un taxi (unos 10 minutos) para llegar al alojamiento.'},{icon:'directions_bus',color:'#d97706',title:'En Autobús',desc:'Desde el aeropuerto de Catania u otros lugares, baja en la estación de autobuses de Milazzo y continúa en taxi hasta Via Archi Nazionale, San Filippo del Mela (unos 10 minutos).'}], departureModes:[{icon:'directions_car',color:'#8a1f1f',title:'En Coche',desc:'Desde el alojamiento basta aproximadamente 1 minuto para incorporarse a la A20 en dirección a Mesina (Catania) o Palermo.'},{icon:'directions_bus',color:'#d97706',title:'En Autobús (a Mesina)',desc:'Consulta los horarios de GiuntaBus y AST desde la estación de autobuses de Milazzo para las conexiones diarias a Mesina.'},{icon:'train',color:'#0284c7',title:'En Tren',desc:'Toma un taxi hasta la estación de Milazzo (unos 10 minutos) para las conexiones ferroviarias.'},{icon:'flight',color:'#7c3aed',title:'Aeropuerto de Catania',desc:'Conexiones directas en autobús desde Milazzo al aeropuerto de Catania — consulta los horarios en la estación de autobuses.'}] },
    services:[{emoji:'🚲',title:'Alquiler de Bicicletas',price:'Desde €10 / día',note:'Explora Milazzo en bicicleta — bicis urbanas y eléctricas disponibles.',waText:'Hola, me gustaría alquilar una bicicleta.'},{emoji:'🤿',title:'Buceo',price:'Desde €60 / persona',note:'Reserva con 24h de antelación. Aguas cristalinas te esperan.',waText:'Hola, me gustaría reservar una experiencia de buceo.'},{emoji:'⛵',title:'Tour islas Eolias (2-3 islas)',price:'Desde €40 / persona',note:'Reserva con Navisal o Tarnav. Excursiones a Lipari, Stromboli, Vulcano.',waText:'Hola, me gustaría información sobre el tour de las islas Eolias.'},{emoji:'🛥️',title:'Tour privado islas Eolias',price:'Desde €100 / persona',note:'Barco privado exclusivo. Itinerario personalizable.',waText:'Hola, me gustaría reservar un tour privado a las islas Eolias.'}]
  },
  de: {
    back:'Zurück', openMaps:'In Maps öffnen', bookWa:'Per WhatsApp buchen',
    offline:'Sie sind offline — einige Inhalte werden möglicherweise nicht geladen.',
    install:{ title:'Via Nazionale App installieren', sub:'Zum Home-Bildschirm hinzufügen', btn:'Installieren', dismiss:'Schließen', iosStep1:'1. Tippen Sie auf die Teilen-Schaltfläche in Safari (□↑)', iosStep2:'2. Scrollen Sie und tippen Sie auf "Zum Home-Bildschirm"' },
    tabs:{ info:'Unterkunftsinfos', philosophy:'Unsere Philosophie', contacts:'Kontakte', directions:'An- und Abreise', map:'Interaktive Karte', breakfast:'Tagesausflug', bookServices:'Services buchen', events:'Stadtveranstaltungen', museums:'Museen & Denkmäler', beach:'Bring mich zum Strand', roomGuide:'Zurück zu meinem Zimmer', checkout:'Check-Out', recipes:'Rezepte Ohne Kochen', schedine:'Gästedokumente / Alloggiati Web' },
    home:{ greeting:'Willkommen bei Via Nazionale 🌿', sub:'Ihr digitaler Concierge in San Filippo del Mela', checkinNew:'Gästedokumente / Alloggiati Web', checkinNewDesc:'Gäste hinzufügen und die Registrierungsdatei senden', checkinDone:'Ich habe bereits eingecheckt', checkinDoneDesc:'Direkt zur App' },
    dash:{ welcome:'Via Nazionale Companion', sub:'Wie können wir Ihnen helfen?' },
    upload:{ title:'Gästedokumente / Alloggiati Web', dropText:'Tippen, um Fotos hinzuzufügen', dropSub:'Reisepass, Personalausweis oder Führerschein', remove:'Entfernen', attachNote:'Bitte fügen Sie die Fotos manuell bei', sendWa:'Über WhatsApp senden', waMsg:'Guten Tag! Anbei die Registrierungsdatei der Gäste (schedine alloggiati). Danke!', continue:'Weiter zu den Unterkunftsinfos', sent:'Dokumente gesendet ✓',
      ocrButton:'Daten extrahieren (OCR)', ocrProcessing:'Ihre Dokumente werden gelesen…', ocrErrorMsg:'Der Online-OCR-Dienst konnte nicht erreicht werden. Bitte füllen Sie alle Felder manuell aus.',
      techDetailsToggle:'Technische Details',
      reviewTitle:'Gästedaten prüfen', reviewSub:'Bitte überprüfen und vervollständigen Sie jedes Feld, bevor Sie diesen Gast hinzufügen — die Daten werden genau so erfasst, wie sie auf dem Dokument stehen.',
      sectionStay:'Aufenthalt', sectionAnagrafica:'Persönliche Daten', sectionNascita:'Geburtsort & Staatsangehörigkeit', sectionDocumento:'Ausweisdokument',
      fDocType:'Dokumenttyp', fSurname:'Nachname', fGivenNames:'Vorname(n)', fNumber:'Dokumentennummer', fDob:'Geburtsdatum',
      fSesso:'Geschlecht', fTipoAlloggiato:'Gästetyp', fDataArrivo:'Ankunftsdatum', fDataPartenza:'Abreisedatum',
      fStatoNascita:'Geburtsland', fComuneNascita:'Geburtsort', fProvinciaNascita:'Geburtsprovinz (2-Buchstaben-Code, nur Italien)', fCittadinanza:'Staatsangehörigkeit', fLuogoRilascio:'Ausstellungsort des Dokuments',
      ocrConfidenceLabel:'OCR-Zuverlässigkeit',
      confirmAdd:'Gast zur Liste hinzufügen', backToPhotos:'Zurück zu den Fotos', backToList:'Zurück zur Gästeliste',
      listTitle:'Gäste dieser Buchung', listEmpty:'Noch keine Gäste hinzugefügt.', addGuestBtn:'Gast hinzufügen',
      showPreview:'JSON-Datei-Vorschau', hidePreview:'Vorschau ausblenden',
      sendAutoBtn:'Automatisch senden (Google Sheet)', sending:'Wird gesendet…', sentAutomatically:'Gesendet ✓',
      sendErrorMsg:'Automatisches Schreiben in Google Sheet fehlgeschlagen. Versuchen Sie WhatsApp oder laden Sie die Datei unten herunter.', downloadBtn:'Datei herunterladen',

      validationTitle:'Bitte vervollständigen Sie diese Felder, bevor Sie fortfahren:', yesterday:'gestern', today:'heute', tomorrow:'morgen',
      disclaimerShort:'Die Fotos werden von einem OCR-Dienst eines Drittanbieters verarbeitet: Ihre Daten werden von diesem Dritten verarbeitet, und das Ergebnis kann Fehler enthalten. Wenn Sie dies vermeiden möchten, nutzen Sie stattdessen die manuelle Eingabe.',
      disclaimerLinkText:'Mehr erfahren', disclaimerBack:'Zurück zur Gästeeingabe',
      manualEntryBtn:'Manuell ausfüllen (ohne Fotos, ohne OCR)',
      downloadedManualMsg:'Datei heruntergeladen. Senden Sie sie mit dem Tool Ihrer Wahl: WhatsApp, Telegram, E-Mail oder einer anderen App.',
      disclaimer: {
        title:'Wie mit Ihren Daten umgegangen wird',
        paragraphs:[
          'Wenn Sie die automatische Datenextraktion (OCR) verwenden, werden die aufgenommenen Fotos an Google Cloud Vision gesendet, einen Drittanbieterdienst, um den Text auf dem Dokument zu lesen. Google verarbeitet sie nur, um das Ergebnis zurückzugeben, und nutzt sie laut eigener Richtlinie nicht zum Training seiner Modelle.',
          'Sobald ein Gast bestätigt und der Versand der Daten gewählt wurde, werden diese entweder automatisch an die Unterkunft übermittelt (direkt in ein Google Sheet über die Google Sheets API geschrieben) oder, falls Sie diese Option wählen, direkt über WhatsApp von Ihrem Gerät aus geteilt, oder als Datei heruntergeladen, um sie nach Belieben zu versenden.',
          'Die automatische Extraktion ist eine Komfortfunktion, keine Garantie: OCR-Ergebnisse können Fehler enthalten, besonders bei beschädigten, spiegelnden oder ungewöhnlich formatierten Dokumenten. Jedes Feld wird Ihnen stets zur Überprüfung angezeigt und muss vor dem Hinzufügen eines Gastes kontrolliert und korrigiert werden — die App lässt Sie nicht fortfahren, wenn Pflichtfelder leer sind.',
          'Mit der Nutzung der automatischen OCR-Extraktion akzeptieren Sie, dass das Dokumentenfoto vom oben beschriebenen Drittanbieterdienst verarbeitet wird, und Sie sind dafür verantwortlich, die Richtigkeit jedes Feldes vor dem Versand zu überprüfen. Wenn Sie diese Funktion lieber nicht nutzen möchten, können Sie alle Felder manuell ausfüllen — in diesem Fall wird kein Foto aufgenommen oder irgendwohin gesendet.',
          'In dieser App eingegebene Daten werden nur auf Ihrem Gerät gespeichert (im lokalen Speicher des Browsers), bis Sie sich für den Versand entscheiden, und werden gelöscht, wenn Sie die Check-out-Funktion nutzen.',
        ],
      },
    },
    info:{ general:'Allgemeine Informationen', contacts:'Kontakte', address:'Adresse', phone:'Telefon', whatsapp:'WhatsApp Chat', checkin:'15:00 – 22:00 Uhr', checkout:'Bis 10:30 Uhr', wifiConnect:'Mit WLAN verbinden' },
    itinerary:{ desc:'Entdecken Sie das Beste der Stadt mit diesem sorgfältig geplanten Reiseverlauf.', btn:'Milazzo erkunden' },
    map:{ title:'Interaktive Karte von Milazzo', desc:'Sehenswürdigkeiten, Wahrzeichen und versteckte Schätze.', openMaps:'In Google Maps öffnen' },
    beach:{ desc:'Navigieren Sie direkt zum nächsten Strand — kristallklares Tyrrhenisches Meer wartet.', btnTitle:'Bring mich zum Strand', btnSub:'Öffnet Google Maps · Navigation' },
    room:{ desc:'Lassen Sie uns Sie zurück zu Via Nazionale führen.', btnTitle:'Zu Via Nazionale navigieren', btnSub:'Öffnet Google Maps · Wegbeschreibung' },
    co:{ desc1:'Vielen Dank für Ihren Aufenthalt! Bevor Sie abreisen, beachten Sie bitte:', steps:['Lassen Sie alle Zimmerschlüssel im Zimmer.','Sammeln Sie alle persönlichen Gegenstände, einschließlich Ladegeräte.','Überprüfen Sie das Zimmer sorgfältig auf vergessene Gegenstände.','Begleichen Sie alle offenen Zahlungen, einschließlich der Kurtaxe.'], note:'Sollten Sie etwas vergessen haben, bieten wir einen Rücksendeservice an (Gebühren fallen an).', desc2:'Wenn Sie bereit sind, tippen Sie auf die Schaltfläche unten. Danke!', btn:'Check-Out abschließen' },
    events:{ desc:'Veranstaltungen in Milazzo und Umgebung — regelmäßig aktualisiert.', showPast:'Vergangene Events anzeigen', hidePast:'Vergangene Events ausblenden', noUpcoming:'Derzeit keine bevorstehenden Veranstaltungen. Schauen Sie bald wieder vorbei!' },
    philosophy:['Willkommen heißen, ohne Spuren zu hinterlassen: das ist der Ausgangspunkt von allem. Im Herzen von Milazzo, wo der Stadtrhythmus auf das Meer trifft, haben wir uns einen Raum vorgestellt, der sich auf natürliche und diskrete Weise in das städtische Gefüge einfügt und einen komfortablen, authentischen Aufenthalt bietet.','Alle unsere Zimmer — Junior-Suiten — sind bis ins kleinste Detail gepflegt: natürliches Licht, Schalldämmung, effiziente Anlagen, die Verschwendung reduzieren. Großzügige, ausgewogene Räume, die auf echtes und tiefes Wohlbefinden ausgerichtet sind, das aus Qualität und Harmonie besteht.','Nachhaltigkeit ist eine konkrete Wahl, die jeden Tag mit echtem Engagement gelebt wird. Wir haben Einwegplastik und Einwegpapier eliminiert, bieten kostenloses Trinkwasser an und nutzen ausschließlich Energie aus erneuerbaren Quellen. So leisten wir einen Beitrag zu einer wirklich verantwortungsvollen Gastfreundschaft.','Im Stadtzentrum zu sein bedeutet, die Stadt auf authentische Weise zu entdecken. Wir arbeiten daran, sanfte Mobilität wie das Fahrrad zu fördern, mit eigenen Routen und Karten, um sich leicht zu orientieren und die Umweltbelastung zu reduzieren.','Wir glauben an eine Gastfreundschaft, bei der Verantwortung und Komfort ohne Kompromisse verschmelzen. Wir haben bereits an alles gedacht: Der Gast muss nichts anderes tun oder besondere umweltbewusste Verhaltensweisen annehmen. Er kann sich einfach entspannen und seinen Urlaub genießen, während wir diskret handeln, um unseren Einfluss zu minimieren. Was bleibt, ist die Erinnerung an eine leichte, authentische und bewusste Reise — mit einem minimalen Fußabdruck auf der Umwelt und einem positiven Zeichen in sich selbst.'],
    dir:{ arriving:'Anreise', leaving:'Abreise aus San Filippo del Mela', arrivalModes:[{icon:'directions_car',color:'#8a1f1f',title:'Mit dem Auto',desc:'Nehmen Sie die Autobahnausfahrt A20 „Milazzo": Die Unterkunft liegt etwa 1 Autominute von der Ausfahrt entfernt, in der Via Archi Nazionale 16, San Filippo del Mela. Kostenlose Parkplätze in der Nähe.'},{icon:'train',color:'#0284c7',title:'Mit dem Zug',desc:'Der nächstgelegene Bahnhof ist Milazzo; von dort empfehlen wir ein Taxi (ca. 10 Minuten) zur Unterkunft.'},{icon:'directions_bus',color:'#d97706',title:'Mit dem Bus',desc:'Vom Flughafen Catania oder anderen Orten steigen Sie am Busbahnhof Milazzo aus und fahren mit dem Taxi weiter zur Via Archi Nazionale, San Filippo del Mela (ca. 10 Minuten).'}], departureModes:[{icon:'directions_car',color:'#8a1f1f',title:'Mit dem Auto',desc:'Von der Unterkunft aus erreichen Sie die A20 Richtung Messina (Catania) oder Palermo in etwa 1 Minute.'},{icon:'directions_bus',color:'#d97706',title:'Mit dem Bus (nach Messina)',desc:'Prüfen Sie die Fahrpläne von GiuntaBus und AST ab dem Busbahnhof Milazzo für tägliche Verbindungen nach Messina.'},{icon:'train',color:'#0284c7',title:'Mit dem Zug',desc:'Nehmen Sie ein Taxi zum Bahnhof Milazzo (ca. 10 Minuten) für Zugverbindungen.'},{icon:'flight',color:'#7c3aed',title:'Flughafen Catania',desc:'Direkte Busverbindungen von Milazzo zum Flughafen Catania — Fahrpläne am Busbahnhof prüfen.'}] },
    services:[{emoji:'🚲',title:'Fahrradverleih',price:'Ab €10 / Tag',note:'Erkunden Sie Milazzo per Rad — Stadtfahrräder und E-Bikes verfügbar.',waText:'Hallo, ich möchte ein Fahrrad mieten.'},{emoji:'🤿',title:'Tauchen',price:'Ab €60 / Person',note:'24h im Voraus buchen. Kristallklares Wasser wartet.',waText:'Hallo, ich möchte einen Tauchgang buchen.'},{emoji:'⛵',title:'Äolische Inseln Tour (2-3 Inseln)',price:'Ab €40 / Person',note:'Bei Navisal oder Tarnav buchen.',waText:'Hallo, ich möchte Infos zur Äolischen Inseln Tour.'},{emoji:'🛥️',title:'Private Äolische Inseln Tour',price:'Ab €100 / Person',note:'Privat-Bootstour mit anpassbarem Reiseprogramm.',waText:'Hallo, ich möchte eine private Tour zu den Äolischen Inseln buchen.'}]
  },
  zh: {
    back:'返回', openMaps:'在地图中打开', bookWa:'通过WhatsApp预订',
    offline:'您处于离线状态 — 部分内容可能无法加载。',
    install:{ title:'安装Via Nazionale应用', sub:'添加到主屏幕以便快速访问', btn:'安装', dismiss:'忽略', iosStep1:'1. 在Safari中点击分享按钮 (□↑)', iosStep2:'2. 滚动并点击"添加到主屏幕"' },
    tabs:{ info:'结构信息', philosophy:'我们的理念', contacts:'联系方式', directions:'到达/离开住宿', map:'互动地图', breakfast:'每日行程', bookServices:'预订服务', events:'城市活动', museums:'博物馆与古迹', beach:'带我去海滩', roomGuide:'回到我的房间', checkout:'退房', recipes:'免煮食谱', schedine:'客人证件 / Alloggiati Web' },
    home:{ greeting:'欢迎来到Via Nazionale 🌿', sub:'您在圣菲利波德梅拉的数字礼宾', checkinNew:'客人证件 / Alloggiati Web', checkinNewDesc:'添加客人信息并发送登记文件', checkinDone:'我已经办理了入住', checkinDoneDesc:'直接进入应用' },
    dash:{ welcome:'Via Nazionale Companion', sub:'我们能为您做什么？' },
    upload:{ title:'客人证件 / Alloggiati Web', dropText:'点击添加照片', dropSub:'护照、身份证或驾照', remove:'删除', attachNote:'请手动附上照片', sendWa:'通过WhatsApp发送', waMsg:'您好！附件为客人登记文件（schedine alloggiati）。谢谢！', continue:'继续查看住宿信息', sent:'文件已发送 ✓',
      ocrButton:'提取数据（OCR）', ocrProcessing:'正在读取您的证件…', ocrErrorMsg:'无法连接在线OCR服务，请手动填写所有字段。',
      techDetailsToggle:'技术细节',
      reviewTitle:'核对客人信息', reviewSub:'请在添加此客人之前核对并补全每个字段——数据按证件上显示的内容录入。',
      sectionStay:'住宿信息', sectionAnagrafica:'个人信息', sectionNascita:'出生地与国籍', sectionDocumento:'身份证件',
      fDocType:'证件类型', fSurname:'姓', fGivenNames:'名', fNumber:'证件号码', fDob:'出生日期',
      fSesso:'性别', fTipoAlloggiato:'客人类型', fDataArrivo:'到达日期', fDataPartenza:'离开日期',
      fStatoNascita:'出生国家', fComuneNascita:'出生地', fProvinciaNascita:'出生省份（两字母代码，仅限意大利）', fCittadinanza:'国籍', fLuogoRilascio:'证件签发地',
      ocrConfidenceLabel:'OCR识别可信度',
      confirmAdd:'将客人添加到列表', backToPhotos:'返回照片', backToList:'返回客人列表',
      listTitle:'本次预订的客人', listEmpty:'尚未添加任何客人。', addGuestBtn:'添加客人',
      showPreview:'预览JSON文件', hidePreview:'隐藏预览',
      sendAutoBtn:'自动发送（Google Sheet）', sending:'发送中…', sentAutomatically:'已发送 ✓',
      sendErrorMsg:'无法自动写入Google Sheet。请尝试WhatsApp，或在下方下载文件。', downloadBtn:'下载文件',

      validationTitle:'请在继续前完成以下字段：', yesterday:'昨天', today:'今天', tomorrow:'明天',
      disclaimerShort:'照片将由第三方OCR服务处理：您的数据将由该第三方处理，结果可能包含错误。如果您希望避免这种情况，请改用手动录入。',
      disclaimerLinkText:'了解更多', disclaimerBack:'返回客人信息录入',
      manualEntryBtn:'手动填写（不拍照，不使用OCR）',
      downloadedManualMsg:'文件已下载。请使用您喜欢的方式发送：WhatsApp、Telegram、邮件或其他应用。',
      disclaimer: {
        title:'您的数据如何被处理',
        paragraphs:[
          '当您使用自动数据提取（OCR）功能时，您拍摄的照片会被发送至第三方服务Google Cloud Vision以读取证件上的文字。谷歌仅为返回识别结果而处理这些照片，并根据其declared政策不会用于训练其模型。',
          '当您确认一位客人的信息并选择发送数据后，数据会自动传输给住宿方（通过Google Sheets API直接写入Google Sheet），或者，如果您选择该选项，可直接通过您设备上的WhatsApp分享，或下载为文件后按您喜欢的方式发送。',
          '自动提取是一项便利功能，而非保证：OCR识别结果可能包含错误，尤其是在证件损坏、反光或格式不常见的情况下。每个字段都会始终显示给您核对，且必须在添加客人前检查并更正——如果必填字段为空，应用将不允许继续。',
          '选择使用自动OCR提取功能，即表示您同意证件照片将由上述第三方服务处理，并且您有责任在发送前核实每个字段的准确性。如果您不想使用此功能，也可以手动填写所有字段——在这种情况下，不会拍摄或发送任何照片。',
          '在本应用中输入的数据仅保存在您的设备上（浏览器本地存储），直至您选择发送，并会在您使用退房功能时被清除。',
        ],
      },
    },
    info:{ general:'一般信息', contacts:'联系方式', address:'地址', phone:'电话', whatsapp:'WhatsApp聊天', checkin:'下午3:00 – 晚上10:00', checkout:'上午10:30前', wifiConnect:'连接WiFi' },
    itinerary:{ desc:'通过这个精心规划的行程，发现城市的最佳景点。', btn:'探索米拉佐' },
    map:{ title:'米拉佐互动地图', desc:'景点、地标和隐藏宝藏。', openMaps:'在谷歌地图中打开' },
    beach:{ desc:'直接导航到最近的海滩 — 清澈的第勒尼安海水等待着您。', btnTitle:'带我去海滩', btnSub:'打开谷歌地图 · 导航' },
    room:{ desc:'让我们引导您回到Via Nazionale。', btnTitle:'导航到Via Nazionale', btnSub:'打开谷歌地图 · 路线' },
    co:{ desc1:'感谢您选择入住！离开前，请注意：', steps:['将所有钥匙留在房间内。','收拾所有个人物品，包括充电器和电子设备。','仔细检查房间，确保没有遗漏任何物品。','结清所有未付款项，包括城市税。'], note:'如果遗忘了物品，我们提供邮寄返回服务（需额外付费）。', desc2:'准备好后，点击下方按钮通知我们。谢谢！', btn:'完成退房' },
    events:{ desc:'米拉佐及周边活动 — 定期更新。', showPast:'显示过去的活动', hidePast:'隐藏过去的活动', noUpcoming:'目前没有即将举行的活动。请稍后再查看！' },
    philosophy:['接待客人，不留痕迹：一切由此而生。在米拉佐的心脏地带，城市的节奏与大海相遇，我们构想了一个能够自然、低调地融入城市肌理的空间，为宾客提供舒适而真实的住宿体验。','我们所有的房间——精品套房——都精心打磨每一处细节：自然采光、隔音设计、高效节能系统。宽敞、平衡的空间，旨在提供由品质与和谐构成的真实而深层的舒适感。','可持续发展是一种具体的选择，每天以真正的承诺去践行。我们已消除一次性塑料和一次性纸制品，提供免费饮用水，并仅使用可再生能源。由此，我们为真正负责任的待客之道作出贡献。','身处市中心意味着真实地探索这座城市。我们正致力于推广骑自行车等温和出行方式，配有专属路线和地图，方便导航并减少环境影响。','我们相信一种责任与舒适无妥协融合的待客之道。我们已经为您考虑好了一切：宾客无需做任何不同的事，也无需采取任何特别的环保行为。只需放松身心，享受假期，而我们则悄然行动，将影响降至最低。留下的是一段轻盈、真实而有意识的旅行记忆。'],
    dir:{ arriving:'到达', leaving:'离开圣菲利波德梅拉', arrivalModes:[{icon:'directions_car',color:'#8a1f1f',title:'驾车',desc:'从A20高速公路"米拉佐"出口下高速：住宿距出口约1分钟车程，地址为Via Archi Nazionale 16, San Filippo del Mela。附近有免费停车位。'},{icon:'train',color:'#0284c7',title:'乘火车',desc:'最近的车站是米拉佐站；从那里我们建议乘出租车（约10分钟）前往住宿地点。'},{icon:'directions_bus',color:'#d97706',title:'乘巴士',desc:'从卡塔尼亚机场或其他地点，在米拉佐巴士站下车，然后乘出租车前往Via Archi Nazionale, San Filippo del Mela（约10分钟）。'}], departureModes:[{icon:'directions_car',color:'#8a1f1f',title:'驾车',desc:'从住宿地点出发，约1分钟即可驶入A20高速公路，前往墨西拿（卡塔尼亚方向）或巴勒莫。'},{icon:'directions_bus',color:'#d97706',title:'乘巴士（前往墨西拿）',desc:'请查看从米拉佐巴士站出发的GiuntaBus和AST时刻表，了解前往墨西拿的每日班次。'},{icon:'train',color:'#0284c7',title:'乘火车',desc:'乘出租车前往米拉佐火车站（约10分钟）以换乘火车。'},{icon:'flight',color:'#7c3aed',title:'卡塔尼亚机场',desc:'从米拉佐有直达卡塔尼亚机场的巴士 — 请在巴士站查看时刻表。'}] },
    services:[{emoji:'🚲',title:'自行车租赁',price:'每天起价€10',note:'骑车探索米拉佐 — 提供城市自行车和电动车。',waText:'您好，我想租一辆自行车。'},{emoji:'🤿',title:'水肺潜水',price:'每人起价€60',note:'提前24小时预订。清澈的海水等待着您。',waText:'您好，我想预订一次潜水体验。'},{emoji:'⛵',title:'埃奥利安群岛之旅（2-3个岛）',price:'每人起价€40',note:'通过Navisal或Tarnav预订。',waText:'您好，我想了解埃奥利安群岛之旅的信息。'},{emoji:'🛥️',title:'埃奥利安群岛私人游',price:'每人起价€100',note:'私人游船之旅，可定制行程。',waText:'您好，我想预订埃奥利安群岛私人游。'}]
  },
  ru: {
    back:'Назад', openMaps:'Открыть в Maps', bookWa:'Забронировать через WhatsApp',
    offline:'Вы не в сети — некоторые материалы могут не загрузиться.',
    install:{ title:'Установить приложение Via Nazionale', sub:'Добавьте на главный экран', btn:'Установить', dismiss:'Закрыть', iosStep1:'1. Нажмите кнопку «Поделиться» в Safari (□↑)', iosStep2:'2. Прокрутите вниз и нажмите «На экран "Домой"»' },
    tabs:{ info:'Информация об объекте', philosophy:'Наша Философия', contacts:'Контакты', directions:'Приехать/Уехать из места проживания', map:'Интерактивная карта', breakfast:'Дневной маршрут', bookServices:'Забронировать услуги', events:'Городские мероприятия', museums:'Музеи и памятники', beach:'Отвези меня на пляж', roomGuide:'Обратно в мой номер', checkout:'Выезд', recipes:'Рецепты Без Готовки', schedine:'Документы гостей / Alloggiati Web' },
    home:{ greeting:'Добро пожаловать в Via Nazionale 🌿', sub:'Ваш цифровой консьерж в Сан-Филиппо-дель-Мела', checkinNew:'Документы гостей / Alloggiati Web', checkinNewDesc:'Добавьте гостей и отправьте файл регистрации', checkinDone:'Я уже зарегистрирован', checkinDoneDesc:'Перейти прямо в приложение' },
    dash:{ welcome:'Via Nazionale Companion', sub:'Чем мы можем вам помочь?' },
    upload:{ title:'Документы гостей / Alloggiati Web', dropText:'Нажмите, чтобы добавить фото', dropSub:'Паспорт, удостоверение личности или водительские права', remove:'Удалить', attachNote:'Пожалуйста, прикрепите фотографии вручную', sendWa:'Отправить через WhatsApp', waMsg:'Добрый день! Во вложении файл регистрации гостей (schedine alloggiati). Спасибо!', continue:'Перейти к информации о размещении', sent:'Документы отправлены ✓',
      ocrButton:'Извлечь данные (OCR)', ocrProcessing:'Идёт распознавание документов…', ocrErrorMsg:'Не удалось подключиться к онлайн-сервису OCR. Заполните все поля вручную.',
      techDetailsToggle:'Технические детали',
      reviewTitle:'Проверьте данные гостя', reviewSub:'Пожалуйста, проверьте и заполните каждое поле перед добавлением гостя — данные вносятся точно так, как указаны в документе.',
      sectionStay:'Проживание', sectionAnagrafica:'Личные данные', sectionNascita:'Место рождения и гражданство', sectionDocumento:'Документ, удостоверяющий личность',
      fDocType:'Тип документа', fSurname:'Фамилия', fGivenNames:'Имя (имена)', fNumber:'Номер документа', fDob:'Дата рождения',
      fSesso:'Пол', fTipoAlloggiato:'Тип гостя', fDataArrivo:'Дата заезда', fDataPartenza:'Дата выезда',
      fStatoNascita:'Страна рождения', fComuneNascita:'Место рождения', fProvinciaNascita:'Провинция рождения (код из 2 букв, только для Италии)', fCittadinanza:'Гражданство', fLuogoRilascio:'Место выдачи документа',
      ocrConfidenceLabel:'Достоверность OCR',
      confirmAdd:'Добавить гостя в список', backToPhotos:'Вернуться к фото', backToList:'Вернуться к списку гостей',
      listTitle:'Гости этого бронирования', listEmpty:'Гости ещё не добавлены.', addGuestBtn:'Добавить гостя',
      showPreview:'Предпросмотр файла JSON', hidePreview:'Скрыть предпросмотр',
      sendAutoBtn:'Отправить автоматически (Google Sheet)', sending:'Отправка…', sentAutomatically:'Отправлено ✓',
      sendErrorMsg:'Не удалось автоматически записать в Google Sheet. Попробуйте WhatsApp или скачайте файл ниже.', downloadBtn:'Скачать файл',

      validationTitle:'Пожалуйста, заполните эти поля перед продолжением:', yesterday:'вчера', today:'сегодня', tomorrow:'завтра',
      disclaimerShort:'Фотографии обрабатываются сторонним сервисом OCR: ваши данные будут обработаны этой третьей стороной, и результат может содержать ошибки. Если вы предпочитаете этого избежать, воспользуйтесь ручным вводом.',
      disclaimerLinkText:'Подробнее', disclaimerBack:'Вернуться к вводу данных гостя',
      manualEntryBtn:'Заполнить вручную (без фото и OCR)',
      downloadedManualMsg:'Файл скачан. Отправьте его удобным способом: WhatsApp, Telegram, email или другим приложением.',
      disclaimer: {
        title:'Как обрабатываются ваши данные',
        paragraphs:[
          'При использовании автоматического извлечения данных (OCR) сделанные вами фотографии отправляются в Google Cloud Vision, сторонний сервис, для распознавания текста на документе. Google обрабатывает их только для возврата результата и, согласно заявленной политике, не использует их для обучения своих моделей.',
          'После подтверждения гостя и выбора отправки данных они передаются объекту размещения либо автоматически (записываются напрямую в Google Sheet через API Google Sheets), либо, если вы выберете этот вариант, передаются напрямую через WhatsApp с вашего устройства, либо скачиваются в виде файла для отправки удобным вам способом.',
          'Автоматическое извлечение — это удобство, а не гарантия: результаты OCR могут содержать ошибки, особенно при повреждённых, бликующих или нестандартно оформленных документах. Каждое поле всегда показывается вам для проверки и должно быть проверено и исправлено перед добавлением гостя — приложение не позволит продолжить, если обязательные поля не заполнены.',
          'Выбирая автоматическое извлечение через OCR, вы соглашаетесь с тем, что фото документа будет обработано указанным выше сторонним сервисом, и вы несёте ответственность за проверку точности каждого поля перед отправкой. Если вы предпочитаете не использовать эту функцию, вы можете заполнить все поля вручную — в этом случае никакое фото не делается и никуда не отправляется.',
          'Данные, введённые в этом приложении, хранятся только на вашем устройстве (в локальном хранилище браузера) до тех пор, пока вы не решите их отправить, и удаляются при использовании функции выезда.',
        ],
      },
    },
    info:{ general:'Общая информация', contacts:'Контакты', address:'Адрес', phone:'Телефон', whatsapp:'Чат в WhatsApp', checkin:'15:00 – 22:00', checkout:'До 10:30', wifiConnect:'Подключиться к WiFi' },
    itinerary:{ desc:'Откройте для себя лучшее в городе с этим тщательно спланированным маршрутом.', btn:'Исследовать Милаццо' },
    map:{ title:'Интерактивная карта Милаццо', desc:'Достопримечательности, памятники и скрытые жемчужины.', openMaps:'Открыть в Google Maps' },
    beach:{ desc:'Навигация прямо до ближайшего пляжа — кристально чистые воды Тирренского моря ждут вас.', btnTitle:'Отвези меня на пляж', btnSub:'Открывает Google Maps · Навигация' },
    room:{ desc:'Позвольте нам проводить вас обратно в Via Nazionale.', btnTitle:'Навигация к Via Nazionale', btnSub:'Открывает Google Maps · Маршрут' },
    co:{ desc1:'Спасибо, что выбрали нас! Перед отъездом, пожалуйста:', steps:['Оставьте все ключи в номере.','Соберите все личные вещи, включая зарядные устройства и электронику.','Тщательно проверьте номер на наличие забытых вещей.','Урегулируйте все незакрытые платежи, включая туристический налог.'], note:'Если вы что-то забыли, мы предлагаем услугу возврата по почте (взимается дополнительная плата).', desc2:'Когда будете готовы, нажмите кнопку ниже. Спасибо!', btn:'Завершить выезд' },
    events:{ desc:'Мероприятия в Милаццо и окрестностях — регулярно обновляется.', showPast:'Показать прошедшие события', hidePast:'Скрыть прошедшие события', noUpcoming:'На данный момент предстоящих мероприятий нет. Заглядывайте позже!' },
    philosophy:['Принимать гостей, не оставляя следов: с этого начинается всё. В самом сердце Милаццо, где ритм города встречается с морем, мы представили пространство, способное естественно и ненавязчиво вписаться в городскую ткань, предлагая комфортный и аутентичный отдых.','Все наши номера — категории «junior suite» — продуманы до мельчайших деталей: естественный свет, звукоизоляция, эффективные системы, сокращающие расход ресурсов. Просторные, сбалансированные пространства, созданные для подлинного и глубокого комфорта.','Устойчивое развитие — это конкретный выбор, который мы реализуем каждый день с реальной ответственностью. Мы полностью отказались от одноразового пластика и одноразовой бумаги, предлагаем бесплатную питьевую воду и используем исключительно энергию из возобновляемых источников.','Находиться в центре города — значит открывать его аутентично. Мы работаем над тем, чтобы продвигать мягкие виды передвижения, такие как велосипед.','Мы верим в гостеприимство, где ответственность и комфорт сливаются без компромиссов. Мы уже всё продумали: гостю не нужно ничего делать иначе. Он может просто расслабиться и наслаждаться отдыхом, пока мы ненавязчиво действуем, чтобы свести к минимуму наше воздействие.'],
    dir:{ arriving:'Прибытие', leaving:'Отъезд из Сан-Филиппо-дель-Мела', arrivalModes:[{icon:'directions_car',color:'#8a1f1f',title:'На автомобиле',desc:'Съезжайте с автострады A20 на съезде «Milazzo»: объект находится примерно в 1 минуте езды от съезда, по адресу Via Archi Nazionale 16, San Filippo del Mela. Рядом есть бесплатная парковка.'},{icon:'train',color:'#0284c7',title:'На поезде',desc:'Ближайшая станция — Милаццо; оттуда мы рекомендуем такси (около 10 минут) до объекта размещения.'},{icon:'directions_bus',color:'#d97706',title:'На автобусе',desc:'Из аэропорта Катании или других мест выйдите на автовокзале Милаццо и продолжите на такси до Via Archi Nazionale, San Filippo del Mela (около 10 минут).'}], departureModes:[{icon:'directions_car',color:'#8a1f1f',title:'На автомобиле',desc:'От объекта размещения потребуется около 1 минуты, чтобы выехать на автостраду A20 в направлении Мессины (Катания) или Палермо.'},{icon:'directions_bus',color:'#d97706',title:'На автобусе (в Мессину)',desc:'Проверьте расписание GiuntaBus и AST от автовокзала Милаццо для ежедневных рейсов в Мессину.'},{icon:'train',color:'#0284c7',title:'На поезде',desc:'Возьмите такси до станции Милаццо (около 10 минут) для железнодорожных пересадок.'},{icon:'flight',color:'#7c3aed',title:'Аэропорт Катании',desc:'Прямые автобусные рейсы из Милаццо в аэропорт Катании — уточняйте расписание на автовокзале.'}] },
    services:[{emoji:'🚲',title:'Прокат велосипедов',price:'От €10 / день',note:'Исследуйте Милаццо на велосипеде — городские велосипеды и электровелосипеды.',waText:'Здравствуйте, я хотел бы арендовать велосипед.'},{emoji:'🤿',title:'Дайвинг',price:'От €60 / человек',note:'Бронируйте за 24 часа. Кристально чистые воды ждут вас.',waText:'Здравствуйте, я хотел бы забронировать погружение.'},{emoji:'⛵',title:'Тур по Эолийским островам',price:'От €40 / человек',note:'Бронируйте через Navisal или Tarnav.',waText:'Здравствуйте, я хотел бы информацию о туре на Эолийские острова.'},{emoji:'🛥️',title:'Частный тур по Эолийским островам',price:'От €100 / человек',note:'Частная прогулка на лодке. Настраиваемый маршрут.',waText:'Здравствуйте, я хотел бы забронировать частный тур на Эолийские острова.'}]
  }
};

// ── Events data ─────────────────────────────
const EVENTS = [
  { year:2026, month:4,  day:24, emoji:'🎨', titles:{en:'Art Exhibition (Pione)',it:'Mostra d Arte (Mostra di Pione)'}, descs:{en:'Palazzo D Amico · 24–30 April',it:'Palazzo D Amico · 24–30 aprile'} },
  { year:2026, month:4,  day:26, emoji:'🎶', titles:{en:'Parish Choirs Concert',it:'Esibizione Cori Parrocchiali'}, descs:{en:'Santuario San Francesco di Paola · 19:30',it:'Santuario di San Francesco di Paola · 19:30'} },
  { year:2026, month:4,  day:29, emoji:'⚓', titles:{en:'Maritime Arts Museum Opening',it:'Inaugurazione Museo delle Arti Marinare'}, descs:{en:'Localita Vaccarella · 18:00',it:'Localita Vaccarella · 18:00'} },
  { year:2026, month:5,  day:2,  emoji:'🎭', titles:{en:'Beauty and the Beast Musical',it:'La Bella e la Bestia - L amore oltre le apparenze'}, descs:{en:'Teatro Trifiletti',it:'Teatro Trifiletti'} },
  { year:2026, month:5,  day:3,  emoji:'⛪', titles:{en:'Procession of San Francesco di Paola (I)',it:'Prima processione di San Francesco di Paola'}, descs:{en:'City streets · Religious procession',it:'Vie cittadine · Processione religiosa'} },
  { year:2026, month:5,  day:8,  emoji:'🎵', titles:{en:'La Dolce Vita degli anni 50 e 60',it:'Concerto La Dolce Vita degli anni 50 e 60'}, descs:{en:'Teatro Trifiletti · 20:30',it:'Teatro Trifiletti · 20:30'} },
  { year:2026, month:5,  day:10, emoji:'⛵', titles:{en:'Procession of San Francesco di Paola (II)',it:'Seconda processione e corteo di barche di San Francesco'}, descs:{en:'City streets and sea · Religious boat procession',it:'Vie cittadine e mare · Processione in barca'} },
  { year:2026, month:5,  day:17, emoji:'🎭', titles:{en:'Enrico Guarneri — Quaranta ma non li Dimostra!',it:'Enrico Guarneri in Quaranta... ma non li Dimostra!'}, descs:{en:'Teatro Trifiletti · 21:00',it:'Teatro Trifiletti · 21:00'} },
  { year:2026, month:5,  day:24, emoji:'🗳️', titles:{en:'Local Administrative Elections',it:'Elezioni Amministrative'}, descs:{en:'Polling stations across the city · 24–25 May',it:'Sedi elettorali cittadine · 24–25 maggio'} },
  { year:2026, month:6,  day:20, emoji:'🌊', titles:{en:'Saperi di Mare (2nd edition)',it:'Saperi di Mare - secondo evento'}, descs:{en:'Localita Vaccarella',it:'Localita Vaccarella'} },
  { year:2026, month:7,  day:11, emoji:'🥾', titles:{en:'Reopening: Tre Pietrazze Nature Trail',it:'Riapertura sentiero naturalistico Tre Pietrazze'}, descs:{en:'Area Marina Protetta Capo Milazzo · 19:00',it:'Area Marina Protetta Capo Milazzo · 19:00'} },
  { year:2026, month:7,  day:13, emoji:'🎭', titles:{en:'Uno Nessuno Centomila — Enrico Lo Verso',it:'Uno, Nessuno, Centomila con Enrico Lo Verso'}, descs:{en:'Atrio del Carmine · 13–14 July',it:'Atrio del Carmine · 13–14 luglio'} },
  { year:2026, month:8,  day:29, emoji:'🎤', titles:{en:'Massimo Ranieri — Tutti i sogni ancora in volo',it:'Massimo Ranieri in Tutti i sogni ancora in volo'}, descs:{en:'Castello di Milazzo · 21:00',it:'Castello di Milazzo · 21:00'} },
];

const MONTHS_LONG = {
  en:['January','February','March','April','May','June','July','August','September','October','November','December'],
  it:['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
  fr:['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  es:['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  de:['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
  zh:['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  ru:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
};
const MONTHS_SHORT = {
  en:['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
  it:['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC'],
  fr:['JAN','FÉV','MAR','AVR','MAI','JUN','JUL','AOÛ','SEP','OCT','NOV','DÉC'],
  es:['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'],
  de:['JAN','FEB','MÄR','APR','MAI','JUN','JUL','AUG','SEP','OKT','NOV','DEZ'],
  zh:['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
  ru:['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'],
};


// ── Recipes data ────────────────────────────
const RECIPES = {
  en: [
    { emoji:"🥗", title:"Panzanella", time:"15 min", servings:"2",
      ingredients:["200g stale bread, torn into chunks","3 ripe tomatoes, diced","1 cucumber, sliced","half a red onion, thinly sliced","Fresh basil leaves","4 tbsp extra-virgin olive oil","2 tbsp red wine vinegar","Salt and pepper"],
      steps:["Soak the bread in cold water for 5 minutes, then squeeze out excess water and crumble into a large bowl.","Add tomatoes, cucumber and onion. Toss gently.","Dress with olive oil, vinegar, salt and pepper.","Add fresh basil and let rest 10 minutes before serving."] },
    { emoji:"🧀", title:"Caprese Classica", time:"5 min", servings:"2",
      ingredients:["250g fresh mozzarella, sliced","3 ripe tomatoes, sliced","Fresh basil leaves","3 tbsp extra-virgin olive oil","Flaked sea salt","Black pepper"],
      steps:["Alternate slices of mozzarella and tomato on a plate.","Tuck basil leaves between slices.","Drizzle generously with olive oil, season with salt and pepper. Serve immediately."] },
    { emoji:"🐟", title:"Tuna and Cannellini Bean Salad", time:"10 min", servings:"2",
      ingredients:["1 can (160g) tuna in olive oil","1 can (400g) cannellini beans, drained","Half a red onion, thinly sliced","Juice of half a lemon","3 tbsp extra-virgin olive oil","Fresh parsley","Salt and pepper"],
      steps:["Drain and rinse the beans. Drain the tuna.","Combine beans, tuna and onion in a bowl.","Dress with lemon juice, olive oil, salt and pepper.","Finish with chopped parsley and toss gently."] },
    { emoji:"🥑", title:"Avocado and Burrata Bowl", time:"10 min", servings:"2",
      ingredients:["2 ripe avocados, sliced","1 burrata (250g)","Cherry tomatoes, halved","Rocket leaves","3 tbsp olive oil","Juice of half a lemon","Flaked salt","Chilli flakes (optional)"],
      steps:["Arrange rocket on a plate as a base.","Place sliced avocado and cherry tomatoes around the plate.","Tear the burrata open in the centre.","Dress with olive oil, lemon juice, flaked salt and chilli flakes."] },
    { emoji:"🫙", title:"Smoked Salmon and Cream Cheese Bites", time:"10 min", servings:"2",
      ingredients:["150g smoked salmon","150g cream cheese","4 slices rye bread or crackers","Capers","Fresh dill","Juice of half a lemon","Black pepper"],
      steps:["Spread cream cheese generously on bread or crackers.","Lay slices of smoked salmon on top.","Add a few capers and fresh dill sprigs.","Finish with a squeeze of lemon and black pepper."] },
    { emoji:"🥙", title:"Greek Wrap with Tzatziki and Veggies", time:"15 min", servings:"2",
      ingredients:["2 flatbreads or pita","200g ready-made tzatziki","1 cucumber, sliced","2 tomatoes, sliced","Half a red onion, cut in rings","100g feta, crumbled","Kalamata olives","Fresh mint"],
      steps:["Lay the flatbread flat and spread a generous layer of tzatziki.","Add cucumber, tomato and onion rings.","Crumble feta on top and add olives and mint.","Roll up tightly or fold and serve."] },
    { emoji:"🍱", title:"Japanese-Style Rice Bowl", time:"15 min", servings:"2",
      ingredients:["250g pre-cooked rice, room temperature","1 can (160g) tuna in oil","2 tbsp soy sauce","1 tbsp sesame oil","1 tsp rice vinegar","1 sheet nori, cut into strips","Sesame seeds","Spring onion, sliced"],
      steps:["Mix tuna with soy sauce, sesame oil and rice vinegar.","Place rice in a bowl and top with the tuna mix.","Garnish with sesame seeds, spring onion and strips of nori.","Drizzle with a little extra soy sauce if desired."] },
    { emoji:"🫒", title:"Antipasto Misto Board", time:"10 min", servings:"4",
      ingredients:["100g prosciutto or salami","100g mixed olives","100g sun-dried tomatoes in oil","100g artichoke hearts (jarred)","100g aged pecorino or Parmigiano, sliced","Crusty bread or grissini","Fresh basil"],
      steps:["Arrange all ingredients on a large board or plate.","Place olives and sun-dried tomatoes in small bowls.","Fold or roll the cured meats for presentation.","Serve with bread or grissini and a drizzle of the tomato oil."] },
    { emoji:"🍉", title:"Watermelon, Feta and Mint Salad", time:"10 min", servings:"2",
      ingredients:["500g watermelon, cubed","100g feta, crumbled","Small bunch fresh mint","2 tbsp extra-virgin olive oil","Juice of 1 lime","Pinch of black pepper"],
      steps:["Place watermelon cubes in a large bowl.","Crumble feta over the top.","Tear mint leaves and scatter over.","Dress with olive oil, lime juice and pepper. Toss gently and serve cold."] },
    { emoji:"🍫", title:"Tiramisu in a Glass", time:"20 min + 1h chill", servings:"4",
      ingredients:["250g mascarpone","3 tbsp icing sugar","200ml cold espresso or strong coffee","Savoiardi biscuits (ladyfingers)","2 tbsp dark rum or Marsala (optional)","Unsweetened cocoa powder"],
      steps:["Beat mascarpone with icing sugar until smooth and creamy.","Mix cold coffee with rum (if using) in a shallow bowl.","Quickly dip each savoiardo into the coffee (1-2 seconds per side) and layer in the bottom of a glass.","Spread a layer of mascarpone cream over the biscuits.","Repeat: biscuits then cream. Finish with cream on top.","Dust generously with cocoa powder. Refrigerate at least 1 hour before serving."] },
  ],
  it: [
    { emoji:"🥗", title:"Panzanella", time:"15 min", servings:"2",
      ingredients:["200g pane raffermo spezzettato","3 pomodori maturi a dadini","1 cetriolo a rondelle","mezza cipolla rossa a fettine sottili","Foglie di basilico fresco","4 cucchiai di olio extravergine di oliva","2 cucchiai di aceto di vino rosso","Sale e pepe"],
      steps:["Ammollare il pane in acqua fredda per 5 minuti, strizzarlo bene e sbriciolare in una ciotola grande.","Aggiungere pomodori, cetriolo e cipolla. Mescolare delicatamente.","Condire con olio, aceto, sale e pepe.","Aggiungere basilico fresco e lasciare riposare 10 minuti."] },
    { emoji:"🧀", title:"Caprese Classica", time:"5 min", servings:"2",
      ingredients:["250g mozzarella fresca a fette","3 pomodori maturi a fette","Foglie di basilico fresco","3 cucchiai di olio extravergine di oliva","Sale grosso","Pepe nero"],
      steps:["Alternare fette di mozzarella e pomodoro su un piatto.","Inserire foglie di basilico tra le fette.","Condire generosamente con olio, sale e pepe. Servire subito."] },
    { emoji:"🐟", title:"Insalata di Tonno e Cannellini", time:"10 min", servings:"2",
      ingredients:["1 lattina da 160g di tonno sott olio","1 lattina da 400g di cannellini scolati","mezza cipolla rossa a fettine","succo di mezzo limone","3 cucchiai di olio extravergine","Prezzemolo fresco","Sale e pepe"],
      steps:["Scolare e risciacquare i fagioli. Scolare il tonno.","Unire fagioli, tonno e cipolla in una ciotola.","Condire con succo di limone, olio, sale e pepe.","Aggiungere il prezzemolo tritato e mescolare delicatamente."] },
    { emoji:"🥑", title:"Bowl Avocado e Burrata", time:"10 min", servings:"2",
      ingredients:["2 avocado maturi a fette","1 burrata da 250g","Pomodorini dimezzati","Rucola","3 cucchiai di olio di oliva","succo di mezzo limone","Sale in fiocchi","Peperoncino in scaglie facoltativo"],
      steps:["Disporre la rucola sul piatto come base.","Aggiungere fette di avocado e pomodorini.","Aprire la burrata al centro.","Condire tutto con olio, succo di limone, sale in fiocchi e peperoncino."] },
    { emoji:"🫙", title:"Salmone Affumicato e Formaggio Spalmabile", time:"10 min", servings:"2",
      ingredients:["150g di salmone affumicato","150g di formaggio spalmabile tipo Philadelphia","4 fette di pane di segale o cracker","Capperi","Aneto fresco","succo di mezzo limone","Pepe nero"],
      steps:["Spalmare generosamente il formaggio sul pane o sui cracker.","Adagiare il salmone affumicato sopra.","Aggiungere qualche cappero e rametti di aneto.","Completare con succo di limone e pepe nero."] },
    { emoji:"🥙", title:"Wrap Greco con Tzatziki e Verdure", time:"15 min", servings:"2",
      ingredients:["2 piadine o pita","200g di tzatziki gia pronto","1 cetriolo a fette","2 pomodori a fette","mezza cipolla rossa ad anelli","100g di feta sbriciolata","Olive Kalamata","Menta fresca"],
      steps:["Stendere la piadina e spalmare uno strato generoso di tzatziki.","Aggiungere cetriolo, pomodoro e anelli di cipolla.","Sbriciolare la feta sopra e aggiungere olive e menta.","Arrotolare ben stretto o piegare e servire."] },
    { emoji:"🍱", title:"Ciotola di Riso in Stile Giapponese", time:"15 min", servings:"2",
      ingredients:["250g di riso precotto a temperatura ambiente","1 lattina da 160g di tonno sott olio","2 cucchiai di salsa di soia","1 cucchiaio di olio di sesamo","1 cucchiaino di aceto di riso","1 foglio di alga nori a striscioline","Semi di sesamo","Cipollotto a rondelle"],
      steps:["Mescolare il tonno con salsa di soia, olio di sesamo e aceto di riso.","Mettere il riso in una ciotola e adagiare il mix di tonno sopra.","Guarnire con semi di sesamo, cipollotto e striscioline di nori.","Aggiungere un filo di salsa di soia extra se si desidera."] },
    { emoji:"🫒", title:"Tagliere di Antipasto Misto", time:"10 min", servings:"4",
      ingredients:["100g di prosciutto crudo o salame","100g di olive miste","100g di pomodori secchi sott olio","100g di cuori di carciofo in barattolo","100g di pecorino stagionato o Parmigiano a scaglie","Pane croccante o grissini","Basilico fresco"],
      steps:["Disporre tutti gli ingredienti su un tagliere grande.","Sistemare olive e pomodori secchi in piccole ciotole.","Arrotolare o piegare i salumi per la presentazione.","Servire con pane o grissini e un filo dell olio dei pomodori."] },
    { emoji:"🍉", title:"Insalata di Anguria, Feta e Menta", time:"10 min", servings:"2",
      ingredients:["500g di anguria a cubetti","100g di feta sbriciolata","Mazzetto di menta fresca","2 cucchiai di olio extravergine","Succo di 1 lime","Un pizzico di pepe nero"],
      steps:["Tagliare l anguria a cubetti e metterla in una ciotola grande.","Sbriciolare la feta sopra.","Strappare le foglie di menta e distribuirle.","Condire con olio, succo di lime e un pizzico di pepe. Servire fredda."] },
    { emoji:"🍫", title:"Tiramisu nel Bicchiere", time:"20 min + 1h riposo", servings:"4",
      ingredients:["250g di mascarpone","3 cucchiai di zucchero a velo","200ml di caffe espresso freddo","Savoiardi","2 cucchiai di rum o Marsala facoltativo","Cacao amaro in polvere"],
      steps:["Montare il mascarpone con lo zucchero a velo fino a ottenere una crema liscia.","Mescolare il caffe freddo con il rum (se usato) in un piatto fondo.","Inzuppare brevemente ogni savoiardo nel caffe (1-2 secondi) e posizionarlo sul fondo del bicchiere.","Spalmare uno strato di crema di mascarpone.","Ripetere: biscotti poi crema. Finire con la crema in cima.","Spolverare con cacao amaro. Refrigerare almeno 1 ora."] },
  ],
  fr: [
    { emoji:"\ud83e\udd57", title:"Panzanella", time:"15 min", servings:"2",
      ingredients:["200g de pain rassis emietee","3 tomates mures en des","1 concombre en rondelles","la moitie d un oignon rouge emince","Feuilles de basilic frais","4 c.a.s. huile olive vierge extra","2 c.a.s. vinaigre de vin rouge","Sel et poivre"],
      steps:["Tremper le pain 5 min eau froide, bien essorer, emietter dans un saladier.","Ajouter tomates, concombre et oignon. Melanger delicatement.","Assaisonner huile, vinaigre, sel, poivre.","Ajouter basilic, reposer 10 minutes."] },
    { emoji:"\ud83e\uddc0", title:"Caprese Classique", time:"5 min", servings:"2",
      ingredients:["250g mozzarella fraiche en tranches","3 tomates mures en tranches","Feuilles de basilic frais","3 c.a.s. huile olive vierge extra","Fleur de sel","Poivre noir"],
      steps:["Alterner mozzarella et tomate sur une assiette.","Glisser basilic entre les tranches.","Arroser d huile, saler et poivrer. Servir immediatement."] },
    { emoji:"\ud83d\udc1f", title:"Salade Thon et Haricots Blancs", time:"10 min", servings:"2",
      ingredients:["1 boite 160g thon a l huile","1 boite 400g haricots cannellini egouttees","Demi oignon rouge emince","Jus de citron","3 c.a.s. huile olive","Persil frais","Sel et poivre"],
      steps:["Egoutter et rincer haricots. Egoutter le thon.","Melanger haricots, thon et oignon dans un saladier.","Assaisonner citron, huile, sel, poivre.","Terminer avec le persil hache."] },
    { emoji:"\ud83e\udd51", title:"Bowl Avocat et Burrata", time:"10 min", servings:"2",
      ingredients:["2 avocats murs en tranches","1 burrata 250g","Tomates cerises coupees en deux","Roquette","3 c.a.s. huile olive","Jus de citron","Fleur de sel","Flocons de piment facultatif"],
      steps:["Disposer la roquette dans l assiette.","Ajouter avocat et tomates cerises.","Deposer la burrata ouverte au centre.","Assaisonner huile, citron, sel, piment."] },
    { emoji:"\ud83e\udeb9", title:"Saumon Fume et Fromage Frais", time:"10 min", servings:"2",
      ingredients:["150g saumon fume","150g fromage frais type Philadelphia","4 tranches pain de seigle ou crackers","Capres","Aneth frais","Jus de citron","Poivre noir"],
      steps:["Tartiner fromage generosement sur pain ou crackers.","Deposer le saumon fume par-dessus.","Ajouter capres et aneth frais.","Finir avec jus de citron et poivre noir."] },
    { emoji:"\ud83e\udd59", title:"Wrap Grec Tzatziki et Legumes", time:"15 min", servings:"2",
      ingredients:["2 galettes ou pitas","200g tzatziki pret","1 concombre en tranches","2 tomates en tranches","Demi oignon rouge en rondelles","100g feta emiettee","Olives Kalamata","Menthe fraiche"],
      steps:["Etaler la galette et tartiner de tzatziki.","Ajouter concombre, tomate, oignon.","Emietter feta, ajouter olives et menthe.","Rouler bien serre et servir."] },
    { emoji:"\ud83c\udf71", title:"Bowl de Riz Style Japonais", time:"15 min", servings:"2",
      ingredients:["250g riz precuit temperature ambiante","1 boite 160g thon a l huile","2 c.a.s. sauce soja","1 c.a.s. huile de sesame","1 c.a.c. vinaigre de riz","1 feuille nori en lanieres","Graines sesame","Ciboulette emincee"],
      steps:["Melanger thon, sauce soja, huile sesame, vinaigre riz.","Deposer riz dans un bol, garnir avec melange thon.","Parsemer sesame, ciboulette, nori.","Ajouter filet sauce soja si desire."] },
    { emoji:"\ud83e\uded2", title:"Plateau Antipasto Misto", time:"10 min", servings:"4",
      ingredients:["100g jambon cru ou salami","100g olives melangees","100g tomates sechees a l huile","100g coeurs artichaut en bocal","100g pecorino ou Parmigiano en copeaux","Pain croustillant ou grissini","Basilic frais"],
      steps:["Disposer tous les ingredients sur un grand plateau.","Mettre olives et tomates sechees dans petits bols.","Rouler ou plier charcuteries pour la presentation.","Servir avec pain, grissini et filet d huile."] },
    { emoji:"\ud83c\udf49", title:"Salade Pasteque Feta et Menthe", time:"10 min", servings:"2",
      ingredients:["500g pasteque en cubes","100g feta emiettee","Petit bouquet menthe fraiche","2 c.a.s. huile olive vierge extra","Jus de 1 citron vert","Pincee de poivre noir"],
      steps:["Placer cubes pasteque dans un saladier.","Emietter feta par-dessus.","Effeuiller la menthe et parsemer.","Assaisonner huile, jus citron vert, poivre. Servir frais."] },
    { emoji:"\ud83c\udf6b", title:"Tiramisu en Verrine", time:"20 min + 1h frigo", servings:"4",
      ingredients:["250g mascarpone","3 c.a.s. sucre glace","200ml espresso froid","Biscuits savoiardi","2 c.a.s. rhum ou Marsala facultatif","Cacao en poudre non sucre"],
      steps:["Battre mascarpone avec sucre glace jusqu a creme lisse.","Melanger cafe froid avec rhum dans assiette creuse.","Tremper brievement chaque biscuit cafe (1-2 sec) et deposer dans le verre.","Etaler couche creme mascarpone.","Repeter couches. Terminer par de la creme.","Saupoudrer cacao. Refrigerer au moins 1 heure."] },
  ],
  es: [
    { emoji:"\ud83e\udd57", title:"Panzanella", time:"15 min", servings:"2",
      ingredients:["200g pan duro troceado","3 tomates maduros en dados","1 pepino en rodajas","media cebolla roja en juliana","Hojas de albahaca fresca","4 cdas. aceite de oliva virgen extra","2 cdas. vinagre de vino tinto","Sal y pimienta"],
      steps:["Remojar pan agua fria 5 min, escurrir bien, desmenuzar en bol grande.","Anadir tomates, pepino, cebolla. Mezclar.","Alinar aceite, vinagre, sal, pimienta.","Anadir albahaca, reposar 10 minutos."] },
    { emoji:"\ud83e\uddc0", title:"Caprese Clasica", time:"5 min", servings:"2",
      ingredients:["250g mozzarella fresca en lonchas","3 tomates maduros en lonchas","Hojas de albahaca fresca","3 cdas. aceite de oliva virgen extra","Sal en escamas","Pimienta negra"],
      steps:["Alternar lonchas mozzarella y tomate en un plato.","Colocar albahaca entre las lonchas.","Rociar aceite, sal, pimienta. Servir inmediato."] },
    { emoji:"\ud83d\udc1f", title:"Ensalada de Atun y Alubias Blancas", time:"10 min", servings:"2",
      ingredients:["1 lata 160g atun en aceite","1 lata 400g alubias blancas escurridas","Media cebolla roja en juliana","Zumo de medio limon","3 cdas. aceite de oliva","Perejil fresco","Sal y pimienta"],
      steps:["Escurrir y enjuagar alubias. Escurrir atun.","Mezclar alubias, atun y cebolla en bol.","Alinar zumo limon, aceite, sal, pimienta.","Terminar con perejil picado."] },
    { emoji:"\ud83e\udd51", title:"Bowl de Aguacate y Burrata", time:"10 min", servings:"2",
      ingredients:["2 aguacates maduros en laminas","1 burrata 250g","Tomates cherry partidos","Rucula","3 cdas. aceite de oliva","Zumo medio limon","Sal en escamas","Copos guindilla opcional"],
      steps:["Disponer rucula en el plato.","Anadir aguacate y tomates cherry.","Romper la burrata en el centro.","Alinar aceite, limon, sal, guindilla."] },
    { emoji:"\ud83e\udeb9", title:"Salmon Ahumado y Queso Crema", time:"10 min", servings:"2",
      ingredients:["150g salmon ahumado","150g queso crema tipo Philadelphia","4 rebanadas pan centeno o crackers","Alcaparras","Eneldo fresco","Zumo medio limon","Pimienta negra"],
      steps:["Untar queso crema sobre pan o crackers.","Colocar salmon ahumado encima.","Anadir alcaparras y eneldo fresco.","Terminar zumo limon y pimienta negra."] },
    { emoji:"\ud83e\udd59", title:"Wrap Griego con Tzatziki y Verduras", time:"15 min", servings:"2",
      ingredients:["2 panes pita o flatbreads","200g tzatziki ya preparado","1 pepino en rodajas","2 tomates en rodajas","Media cebolla roja en aros","100g feta desmenuzado","Aceitunas Kalamata","Menta fresca"],
      steps:["Extender pita y untar capa generosa tzatziki.","Anadir pepino, tomate, aros cebolla.","Desmenuzar feta, anadir aceitunas y menta.","Enrollar bien o doblar y servir."] },
    { emoji:"\ud83c\udf71", title:"Bol de Arroz Estilo Japones", time:"15 min", servings:"2",
      ingredients:["250g arroz precocinado temperatura ambiente","1 lata 160g atun en aceite","2 cdas. salsa de soja","1 cda. aceite de sesamo","1 cdita. vinagre de arroz","1 hoja nori en tiras","Semillas de sesamo","Cebolleta en rodajas"],
      steps:["Mezclar atun con soja, aceite sesamo, vinagre arroz.","Poner arroz en bol, colocar mezcla atun encima.","Decorar sesamo, cebolleta, tiras nori.","Anadir mas salsa soja si se desea."] },
    { emoji:"\ud83e\uded2", title:"Tabla de Antipasto Misto", time:"10 min", servings:"4",
      ingredients:["100g jamon serrano o salami","100g aceitunas variadas","100g tomates secos en aceite","100g corazones alcachofa en tarro","100g pecorino curado o Parmigiano en laminas","Pan crujiente o palitos","Albahaca fresca"],
      steps:["Disponer todos ingredientes sobre tabla grande.","Poner aceitunas y tomates secos en cuencos.","Doblar o enrollar embutidos para presentacion.","Servir con pan, palitos y aceite de los tomates."] },
    { emoji:"\ud83c\udf49", title:"Ensalada de Sandia Feta y Menta", time:"10 min", servings:"2",
      ingredients:["500g sandia en cubos","100g feta desmenuzado","Manojo menta fresca","2 cdas. aceite de oliva virgen extra","Zumo de 1 lima","Pizca pimienta negra"],
      steps:["Colocar cubos sandia en bol grande.","Desmenuzar feta por encima.","Rasgar hojas menta y distribuir.","Alinar aceite, zumo lima, pimienta. Servir frio."] },
    { emoji:"\ud83c\udf6b", title:"Tiramisu en Vaso", time:"20 min + 1h nevera", servings:"4",
      ingredients:["250g mascarpone","3 cdas. azucar glas","200ml espresso frio","Bizcochos de soletilla","2 cdas. ron o Marsala opcional","Cacao en polvo sin azucar"],
      steps:["Batir mascarpone con azucar glas hasta crema lisa.","Mezclar cafe frio con ron en plato hondo.","Mojar brevemente cada bizcocho en cafe (1-2 seg) y colocar en fondo del vaso.","Extender capa crema mascarpone.","Repetir capas. Terminar con crema.","Espolvorear cacao. Refrigerar al menos 1 hora."] },
  ],
  de: [
    { emoji:"\ud83e\udd57", title:"Panzanella", time:"15 Min", servings:"2",
      ingredients:["200g altbackenes Brot zerrissen","3 reife Tomaten gewuerfelt","1 Gurke in Scheiben","halbe rote Zwiebel geschnitten","Frische Basilikumblaetter","4 EL natives Olivenoel extra","2 EL Rotweinessig","Salz und Pfeffer"],
      steps:["Brot 5 Min in kaltem Wasser einweichen, ausdruecken, kruemeln.","Tomaten, Gurke, Zwiebel hinzufuegen. Vermischen.","Olivenoel, Essig, Salz, Pfeffer abschmecken.","Basilikum hinzufuegen, 10 Min ruhen lassen."] },
    { emoji:"\ud83e\uddc0", title:"Caprese Klassisch", time:"5 Min", servings:"2",
      ingredients:["250g frische Mozzarella in Scheiben","3 reife Tomaten in Scheiben","Frische Basilikumblaetter","3 EL natives Olivenoel extra","Meersalzflocken","Schwarzer Pfeffer"],
      steps:["Mozzarella und Tomaten abwechselnd auf Teller anrichten.","Basilikum zwischen die Scheiben legen.","Mit Olivenoel betraeufeln, salzen, pfeffern. Sofort servieren."] },
    { emoji:"\ud83d\udc1f", title:"Thunfisch-Bohnen-Salat", time:"10 Min", servings:"2",
      ingredients:["1 Dose 160g Thunfisch in Oel","1 Dose 400g Cannellini-Bohnen abgetropft","Halbe rote Zwiebel geschnitten","Saft halber Zitrone","3 EL Olivenoel","Frische Petersilie","Salz und Pfeffer"],
      steps:["Bohnen abspielen, abtropfen. Thunfisch abgiessen.","Bohnen, Thunfisch, Zwiebel in Schuessel.","Mit Zitronensaft, Oel, Salz, Pfeffer abschmecken.","Mit Petersilie garnieren."] },
    { emoji:"\ud83e\udd51", title:"Avocado und Burrata Bowl", time:"10 Min", servings:"2",
      ingredients:["2 reife Avocados in Scheiben","1 Burrata 250g","Kirschtomaten halbiert","Rucola","3 EL Olivenoel","Saft halber Zitrone","Meersalzflocken","Chiliflocken optional"],
      steps:["Rucola als Basis auf Teller anrichten.","Avocadoscheiben und Kirschtomaten verteilen.","Burrata in der Mitte aufreissen.","Mit Oel, Zitrone, Salz, Chili wuerzen."] },
    { emoji:"\ud83e\udeb9", title:"Raeucherlachs und Frischkaese", time:"10 Min", servings:"2",
      ingredients:["150g Raeucherlachs","150g Frischkaese","4 Scheiben Roggenbrot oder Cracker","Kapern","Frischer Dill","Saft halber Zitrone","Schwarzer Pfeffer"],
      steps:["Frischkaese grosszuegig auf Brot oder Cracker streichen.","Raeucherlachsscheiben darauflegen.","Kapern und Dillzweige hinzufuegen.","Mit Zitronensaft und Pfeffer abschliessen."] },
    { emoji:"\ud83e\udd59", title:"Griechischer Wrap Tzatziki und Gemuese", time:"15 Min", servings:"2",
      ingredients:["2 Fladenbrote oder Pitas","200g fertiger Tzatziki","1 Gurke in Scheiben","2 Tomaten in Scheiben","Halbe rote Zwiebel in Ringen","100g Feta zerbruemelt","Kalamata-Oliven","Frische Minze"],
      steps:["Fladenbrot mit Tzatziki bestreichen.","Gurke, Tomate, Zwiebelringe hinzufuegen.","Feta darueber kruemeln, Oliven und Minze.","Aufrollen oder zusammenfalten und servieren."] },
    { emoji:"\ud83c\udf71", title:"Reisschuessel Japanisch", time:"15 Min", servings:"2",
      ingredients:["250g vorgekochter Reis Zimmertemperatur","1 Dose 160g Thunfisch in Oel","2 EL Sojasosse","1 EL Sesamoel","1 TL Reisessig","1 Blatt Nori in Streifen","Sesamsamen","Fruehlingszwiebel"],
      steps:["Thunfisch mit Sojasosse, Sesamoel, Reisessig mischen.","Reis in Schuessel geben, Thunfisch belegen.","Mit Sesam, Fruehlingszwiebel, Nori garnieren.","Nach Wunsch Sojasosse darueber."] },
    { emoji:"\ud83e\uded2", title:"Antipasto-Platte", time:"10 Min", servings:"4",
      ingredients:["100g Parmaschinken oder Salami","100g gemischte Oliven","100g getrocknete Tomaten in Oel","100g Artischockenherzen aus Glas","100g Pecorino oder Parmigiano gehobelt","Brot oder Grissini","Frisches Basilikum"],
      steps:["Alle Zutaten auf grossem Brett anrichten.","Oliven und Tomaten in kleinen Schaeelchen.","Aufschnitt rollen oder falten.","Mit Brot, Grissini und Tomatenoel servieren."] },
    { emoji:"\ud83c\udf49", title:"Wassermelone Feta und Minze Salat", time:"10 Min", servings:"2",
      ingredients:["500g Wassermelone in Wuerfeln","100g Feta zerbruemelt","Kleiner Bund frische Minze","2 EL natives Olivenoel extra","Saft 1 Limette","Prise schwarzer Pfeffer"],
      steps:["Wassermelone in Schuessel geben.","Feta darueber kruemeln.","Minzblaetter zupfen und verteilen.","Oel, Limettensaft, Pfeffer hinzufuegen. Kalt servieren."] },
    { emoji:"\ud83c\udf6b", title:"Tiramisu im Glas", time:"20 Min + 1h Kuehlschrank", servings:"4",
      ingredients:["250g Mascarpone","3 EL Puderzucker","200ml kalter Espresso","Loeffelbiskuits Savoiardi","2 EL Rum oder Marsala optional","Ungesuesstetes Kakaopulver"],
      steps:["Mascarpone mit Puderzucker glatt ruehren.","Kaffee mit Rum in Teller mischen.","Biskuit kurz in Kaffee (1-2 Sek) tauchen, in Glas legen.","Schicht Mascarponecreme darueber.","Lagen wiederholen. Mit Creme abschliessen.","Mit Kakao bestaeuben. 1 Stunde kuehlen."] },
  ],
};

// ── Places / Museums data (with categories) ─────────────
const PLACES = {
  cats: {
    en: ["Museums & Exhibition Centres", "Natural Parks & Trails", "Monuments & Archaeological Sites"],
    it: ["Musei e Centri Espositivi", "Parchi Naturali e Sentieri", "Monumenti e Siti Archeologici"],
    fr: ["Musées et Centres d Exposition", "Parcs Naturels et Sentiers", "Monuments et Sites Archeologiques"],
    es: ["Museos y Centros de Exposicion", "Parques Naturales y Senderos", "Monumentos y Sitios Arqueologicos"],
    de: ["Museen und Ausstellungszentren", "Naturparks und Wanderwege", "Monumente und Archaologische Statten"],
    zh: ["博物馆与展览中心", "自然公园与步道", "纪念碑与考古遗址"],
    ru: ["Muzei i Vystavochnye Centry", "Prirodnye Parki i Marshruty", "Pamyatniki i Arkheologicheskie Pamyatniki"],
  },
  items: [
    // ── MUSEI E CENTRI ESPOSITIVI ─────────────────
    { cat:0, emoji:"🏛️", title:"Antiquarium Domenico Ryolo",
      descs:{ en:"Housed in a former Bourbon women's prison on Via Risorgimento. Archaeological collections from the Milazzo area.", it:"Ospitato in un ex carcere femminile borbonico in Via Risorgimento. Collezioni archeologiche del territorio milazzese.", fr:"Ancien prison bourbonienne. Collections archéologiques.", es:"Antiguo presidio borbónico. Colecciones arqueológicas.", de:"Ehemaliges bourbonisches Frauengefaengnis. Archaeologische Sammlungen.", zh:"前波旁女子监狱，收藏米拉佐地区考古文物。", ru:"Byvsheya burbonskaya tyurma. Arkheologicheskie kollektsii." },
      link:"https://maps.app.goo.gl/7afrShpiQ7XnY1Vz5" },
    { cat:0, emoji:"⚓", title:"MuMa — Museo del Mare",
      descs:{ en:"Inside Milazzo Castle (Bastione di Santa Maria). Houses the skeleton of a sperm whale and maritime collections.", it:"Nel Castello di Milazzo (Bastione di Santa Maria). Contiene lo scheletro di un capodoglio e collezioni marittime.", fr:"Dans le Château de Milazzo. Squelette de cachalot et collections maritimes.", es:"En el Castillo de Milazzo. Esqueleto de cachalote y colecciones marítimas.", de:"Im Kastell von Milazzo. Pottwal-Skelett und maritime Sammlungen.", zh:"米拉佐城堡内，馆藏抹香鲸骨架和海洋文物。", ru:"V zamke Milazzo. Skelet kashalota i morskie kollektsii." },
      link:"https://maps.app.goo.gl/sBjJGJT8u4E9hD8M6" },
    { cat:0, emoji:"🐟", title:"Museo della Tonnara",
      descs:{ en:"Museum dedicated to the traditions and history of tuna fishing in Milazzo.", it:"Museo dedicato alle tradizioni e alla storia della pesca del tonno a Milazzo.", fr:"Musée dédié aux traditions de la pêche au thon.", es:"Museo dedicado a las tradiciones de la pesca del atún.", de:"Museum der Thunfisch-Fischereitradition.", zh:"专注于金枪鱼捕捞传统与历史的博物馆。", ru:"Muzey posvyashchen traditsiyam lova tunca." },
      link:"https://maps.app.goo.gl/Zj3VvJN8Rv4fP9wRA" },
    { cat:0, emoji:"🚢", title:"Museo delle Arti Marinare",
      descs:{ en:"Inaugurated April 2026 at Localita Vaccarella. Dedicated to maritime arts and crafts of the area.", it:"Inaugurato ad aprile 2026 a Localita Vaccarella. Dedicato alle arti marinare del territorio.", fr:"Inauguré en avril 2026. Dédié aux arts maritimes de la région.", es:"Inaugurado en abril 2026. Dedicado a las artes marineras.", de:"Im April 2026 eroeffnet. Maritimes Kunsthandwerk.", zh:"2026年4月新开放，展示当地海洋艺术与工艺。", ru:"Otkryt v aprele 2026. Posvyashchen morskim iskusstvam." },
      link:"https://maps.app.goo.gl/VaccarellaMuseo" },
    { cat:0, emoji:"👁️", title:"IllusionVille",
      descs:{ en:"Interactive museum of optical illusions — fun for all ages.", it:"Museo interattivo delle illusioni ottiche — divertimento per tutte le età.", fr:"Musée interactif des illusions d optique.", es:"Museo interactivo de ilusiones ópticas.", de:"Interaktives Museum fuer optische Illusionen.", zh:"互动视觉错觉博物馆，老少皆宜。", ru:"Interaktivnyy muzey opticheskikh illyuziy." },
      link:"https://maps.app.goo.gl/IllusionVilleMilazzo" },

    // ── PARCHI NATURALI E SENTIERI ─────────────────
    { cat:1, emoji:"🌊", title:"Area Marina Protetta Capo Milazzo",
      descs:{ en:"Protected marine area covering the entire Capo Milazzo promontory. Swimming, snorkelling, diving.", it:"Area marina protetta che comprende l intero promontorio di Capo Milazzo. Nuoto, snorkeling, immersioni.", fr:"Zone marine protégée. Baignade, snorkeling, plongée.", es:"Área marina protegida. Natación, snorkel, buceo.", de:"Meeresschutzgebiet. Schwimmen, Schnorcheln, Tauchen.", zh:"受保护的海洋区域，涵盖整个卡波米拉佐海角。游泳、浮潜、潜水。", ru:"Okhranyaemaya morskaya zona. Plavanie, snorkeling, dayvink." },
      link:"https://maps.app.goo.gl/CapoMilazzoAMP" },
    { cat:1, emoji:"🌀", title:"Piscina di Venere",
      descs:{ en:"A natural seawater basin at the very tip of Capo Milazzo — one of Sicily's most spectacular natural pools.", it:"Bacino d acqua naturale sulla punta estrema di Capo Milazzo — una delle piscine naturali piu spettacolari della Sicilia.", fr:"Bassin d eau naturelle à la pointe de Capo Milazzo.", es:"Cuenca de agua natural en la punta de Capo Milazzo.", de:"Natuerliches Wasserbecken an der Spitze von Capo Milazzo.", zh:"位于卡波米拉佐最顶端的天然海水池，西西里岛最壮观的天然水池之一。", ru:"Prirodnyy bassejn v samom konce mysa Capo Milazzo." },
      link:"https://maps.app.goo.gl/PiscinaDiVenere" },
    { cat:1, emoji:"🥾", title:"Sentiero Tre Pietrazze",
      descs:{ en:"Nature trail recently restored within the AMP. Scenic coastal walk with sea views.", it:"Percorso naturalistico recentemente riaperto e valorizzato all interno dell AMP. Passeggiata costiera panoramica.", fr:"Sentier naturel récemment rouvert dans la réserve marine.", es:"Sendero natural recientemente reabierto dentro del AMP.", de:"Naturweg kuerzlich wieder eroeffnet im Meeresschutzgebiet.", zh:"近期在海洋保护区内重新开放的自然步道，沿海全景散步。", ru:"Prirodnyy marshrut, nedavno vossozdannyy v AMP." },
      link:"https://maps.app.goo.gl/TrePietrazze" },

    // ── MONUMENTI E SITI ARCHEOLOGICI ─────────────────
    { cat:2, emoji:"🏰", title:"La Cittadella Fortificata — Castello di Milazzo",
      descs:{ en:"The largest fortified complex in Sicily, containing the Duomo Antico, the Benedictine Monastery and the Palazzo Svevo.", it:"Il piu grande complesso fortificato della Sicilia, contenente il Duomo Antico, il Monastero delle Benedettine e il Palazzo Svevo.", fr:"Le plus grand complexe fortifié de Sicile.", es:"El mayor complejo fortificado de Sicilia.", de:"Groesstes Festungsanlage Siziliens.", zh:"西西里岛最大的防御建筑群，内含古大教堂、本笃会修道院和斯瓦比亚宫。", ru:"Krupneyshiy ukreplenyy kompleks Sitsilii." },
      link:"https://maps.app.goo.gl/CastelloMilazzo" },
    { cat:2, emoji:"🏯", title:"Forte dei Castriciani",
      descs:{ en:"Historic 19th-century coastal fort overlooking the Tyrrhenian Sea, part of Milazzo's military heritage.", it:"Forte ottocentesco affacciato sul Mar Tirreno, parte del patrimonio militare di Milazzo.", fr:"Fort côtier du XIXe siècle dominant la mer Tyrrhénienne.", es:"Fuerte costero del siglo XIX con vistas al mar Tirreno.", de:"Historisches Kuestenfestung aus dem 19. Jahrhundert.", zh:"19世纪海岸堡垒，俯瞰第勒尼安海，是米拉佐军事遗产的一部分。", ru:"Istoricheskiy beregovoy fort XIX veka." },
      link:"https://maps.app.goo.gl/TorriMilazzo" },
    { cat:2, emoji:"🏛️", title:"Palazzo D'Amico",
      descs:{ en:"Historic palazzo of the Marchesi D Amico on Lungomare Garibaldi — one of Milazzo's finest 19th-century buildings.", it:"Storico palazzo dei Marchesi D Amico sul Lungomare Garibaldi — uno dei piu bei palazzi ottocenteschi di Milazzo.", fr:"Palazzo des Marchesi D Amico sur le Lungomare Garibaldi.", es:"Palazzo de los Marchesi D Amico en el Lungomare Garibaldi.", de:"Historischer Palazzo der Marchesi D Amico am Lungomare Garibaldi.", zh:"达米科侯爵宫，位于加里波第海滨大道，是米拉佐最精美的19世纪建筑之一。", ru:"Istoricheskiy palazzo na Lungomare Garibaldi." },
      link:"https://maps.app.goo.gl/xnryArmggp9F5YfYA" },
    { cat:2, emoji:"🏢", title:"Palazzo del Governatore",
      descs:{ en:"Historic Governor's Palace in the city centre. Note: the building is not accessible to the public.", it:"Storico Palazzo del Governatore nel centro cittadino. Nota: il palazzo non è accessibile al pubblico.", fr:"Palais du Gouverneur dans le centre-ville. Note : le bâtiment n est pas accessible au public.", es:"Histórico Palacio del Gobernador. Nota: el edificio no es accesible al público.", de:"Historischer Gouverneurspalast im Stadtzentrum. Hinweis: nicht oeffentlich zugaenglich.", zh:"市中心历史悠久的总督宫。注意：建筑不对公众开放。", ru:"Istoricheskiy dvorets gubernatora. Primechanie: zdanie nedostupno dlya publiki." },
      link:"https://maps.app.goo.gl/jTCgQwU1YcX67gSN9" },
    { cat:2, emoji:"⛪", title:"Santuario di San Francesco di Paola",
      descs:{ en:"Sanctuary dedicated to the patron saint of Milazzo, dating back to the 15th century.", it:"Santuario dedicato al patrono di Milazzo, risalente al XV secolo.", fr:"Sanctuaire dédié au saint patron de Milazzo, datant du XVe siècle.", es:"Santuario dedicado al patrón de Milazzo, del siglo XV.", de:"Heiligtum des Stadtpatrons, aus dem 15. Jahrhundert.", zh:"供奉米拉佐守护神的圣殿，可追溯至15世纪。", ru:"Svyatilishche pokrovitelya Milazzo, XV vek." },
      link:"https://maps.app.goo.gl/zBsvsSRv7MYRAqaH7" },
    { cat:2, emoji:"⛪", title:"Chiesa Madre di Santo Stefano Protomartire",
      descs:{ en:"The Mother Church of Milazzo, dedicated to Saint Stephen the Protomartyr.", it:"La Chiesa Madre di Milazzo, dedicata a Santo Stefano Protomartire.", fr:"L église mère de Milazzo, dédiée à Saint Étienne Protomartyr.", es:"La iglesia madre de Milazzo, dedicada a San Esteban Protomártir.", de:"Die Mutterkirche von Milazzo, dem heiligen Stephan gewidmet.", zh:"米拉佐主教堂，供奉第一位殉道者圣斯蒂芬。", ru:"Materinskaya cerkov Milazzo, posvyashchennaya Svyatomu Stefanu." },
      link:"https://maps.app.goo.gl/XBTS9KhThCPoTFb69" },
    { cat:2, emoji:"🪨", title:"Santuario di Sant'Antonio di Capo Milazzo",
      descs:{ en:"Rock sanctuary carved into the cliff at the tip of Capo Milazzo — a unique place of worship with dramatic sea views.", it:"Santuario rupestre scavato nella roccia sulla punta di Capo Milazzo — luogo di culto unico con vista mozzafiato sul mare.", fr:"Sanctuaire rupestre taillé dans la falaise à la pointe de Capo Milazzo.", es:"Santuario rupestre tallado en el acantilado en la punta de Capo Milazzo.", de:"In den Fels gehauenes Heiligtum an der Spitze von Capo Milazzo.", zh:"凿入米拉佐海角悬崖的岩石圣殿，俯瞰壮阔海景。", ru:"Skalnoe svyatilishche na myse Capo Milazzo." },
      link:"https://maps.app.goo.gl/zsTeVkwV15pnEHNA9" },
    { cat:2, emoji:"🕍", title:"Chiesa di Santa Maria Maggiore",
      descs:{ en:"Church of Santa Maria Maggiore, one of the oldest religious buildings in Milazzo.", it:"Chiesa di Santa Maria Maggiore, uno degli edifici religiosi piu antichi di Milazzo.", fr:"Église de Santa Maria Maggiore, l un des plus anciens édifices religieux de Milazzo.", es:"Iglesia de Santa María Maggiore, uno de los edificios religiosos más antiguos de Milazzo.", de:"Kirche Santa Maria Maggiore, eines der aeltesten Kirchengebaeude Milazzos.", zh:"圣玛利亚大教堂，米拉佐最古老的宗教建筑之一。", ru:"Cerkov Santa Maria Maggiore, odno iz drevneyshikh religioznykh zdaniy Milazzo." },
      link:"https://maps.app.goo.gl/ewD1BZthxWvgj4o2A" },
    { cat:2, emoji:"⛪", title:"Chiesa di San Rocco",
      descs:{ en:"Church of San Rocco, a beloved place of worship in the heart of Milazzo.", it:"Chiesa di San Rocco, luogo di culto molto amato nel cuore di Milazzo.", fr:"Église de San Rocco, lieu de culte bien-aimé au coeur de Milazzo.", es:"Iglesia de San Rocco, un querido lugar de culto en el corazón de Milazzo.", de:"Kirche San Rocco, beliebte Kirche im Herzen von Milazzo.", zh:"圣罗科教堂，米拉佐市中心深受喜爱的礼拜场所。", ru:"Cerkov San Rocco, lyubimoe mesto bogosluzheniya v serdce Milazzo." },
      link:"https://maps.app.goo.gl/uGRxt2SED8NuVP7v6" },
    { cat:2, emoji:"🗽", title:"Statua della Libertà",
      descs:{ en:"Milazzo's own Statue of Liberty, a local icon on the seafront.", it:"La Statua della Libertà di Milazzo, icona locale sul lungomare.", fr:"La Statue de la Liberté de Milazzo, icône locale sur le front de mer.", es:"La Estatua de la Libertad de Milazzo, icono local en el paseo marítimo.", de:"Milazzos eigene Freiheitsstatue am Meeresfront.", zh:"米拉佐版自由女神像，海滨地标。", ru:"Statua della Liberta Milazzo, mestnyy simvol na naberezhnoy." },
      link:"https://maps.app.goo.gl/KaQKUZga8BYetsAo7" },
    { cat:2, emoji:"🪖", title:"Monumento a Luigi Rizzo",
      descs:{ en:"Monument to Luigi Rizzo, the Milazzo-born naval hero of World War I.", it:"Monumento a Luigi Rizzo, eroe navale della Prima Guerra Mondiale, nativo di Milazzo.", fr:"Monument à Luigi Rizzo, héros naval de la Première Guerre mondiale, natif de Milazzo.", es:"Monumento a Luigi Rizzo, héroe naval de la Primera Guerra Mundial nacido en Milazzo.", de:"Denkmal fuer Luigi Rizzo, Marineheld des Ersten Weltkriegs aus Milazzo.", zh:"路易吉·里佐纪念碑，纪念这位出生于米拉佐的一战海军英雄。", ru:"Pamyatnik Luigi Rizzo, morskomu geroyu Pervoy mirovoy vojny." },
      link:"https://maps.app.goo.gl/EHRPjxDcVtfBn1J78" },
    { cat:2, emoji:"⛲", title:"Fontana del Mela",
      descs:{ en:"The Mela Fountain, a historic fountain and meeting point in the city.", it:"La Fontana del Mela, fontana storica e punto di incontro della città.", fr:"La Fontaine du Mela, fontaine historique et point de rencontre de la ville.", es:"La Fuente del Mela, fuente histórica y punto de encuentro de la ciudad.", de:"Der Mela-Brunnen, historischer Brunnen und Treffpunkt der Stadt.", zh:"梅拉喷泉，城市历史喷泉与著名聚集地。", ru:"Fontan Mela, istoricheskiy fontan i mesto vstrecht goroda." },
      link:"" },
  ],
};

// ── Helpers ─────────────────────────────────
function t() { return allT[state.lang] || allT.en; }

// ══════════════════════════════════════════════
// Configurazione struttura (per l'export JSON)
// ══════════════════════════════════════════════
const STRUCTURE_NAME = 'B&B Via Nazionale'; // <-- personalizza col nome reale della struttura
const STRUCTURE_CODE = 'DA_COMPLETARE';      // <-- TODO: inserisci il codice struttura Alloggiati Web di Via Nazionale (diverso da quello di MiPA!)
const STRUCTURE_CIN = 'DA_COMPLETARE'; // <-- TODO: inserisci il CIN (Codice Identificativo Nazionale) di Via Nazionale (diverso da quello di MiPA!)

// ══════════════════════════════════════════════
// Ospiti — validazione leggera
// ══════════════════════════════════════════════
// Qui NON si generano codici né si valida secondo il tracciato Alloggiati Web: i dati
// vengono acquisiti così come compaiono sul documento ed esportati in JSON grezzo; la
// conversione nel formato ufficiale avviene in un'altra app. La validazione si limita
// quindi ai campi minimi perché l'export abbia senso.
function validateGuest(g) {
  const errors = [];
  const dateRe = /^\d{2}\/\d{2}\/\d{4}$/;

  // Soggiorno
  if (!dateRe.test(g.stay.arrivalDate || '')) errors.push('Data di arrivo mancante o non valida');
  if (!dateRe.test(g.stay.departureDate || '')) errors.push('Data di partenza mancante o non valida');
  if (g.stay.arrivalDate && g.stay.departureDate && g.stay.arrivalDate === g.stay.departureDate) {
    errors.push('La data di partenza non può coincidere con quella di arrivo');
  }
  if (!g.stay.guestType) errors.push('Tipo alloggiato mancante');

  // Dati anagrafici
  if (!g.personal.lastName) errors.push('Cognome mancante');
  if (!g.personal.firstName) errors.push('Nome mancante');
  if (g.personal.gender !== 'M' && g.personal.gender !== 'F') errors.push('Sesso mancante');
  if (!dateRe.test(g.personal.birthDate || '')) errors.push('Data di nascita mancante o non valida');

  // Nascita e cittadinanza — luogo e provincia di nascita si trovano solo sui documenti
  // italiani (formato "Comune (PR)"): per i documenti esteri non è richiesto inserirli,
  // quindi non bloccano l'avanzamento se lo Stato di nascita non è l'Italia.
  if (!g.personal.birthCountry) errors.push('Stato di nascita mancante');
  if (g.personal.birthCountry === 'ITALIA' && !g.personal.birthPlace) errors.push('Comune di nascita mancante (obbligatorio se nato in Italia)');
  if (g.personal.birthCountry === 'ITALIA' && !g.personal.birthProvince) errors.push('Provincia di nascita mancante (obbligatoria se nato in Italia)');
  if (!g.personal.nationality) errors.push('Cittadinanza mancante');

  // Documento
  if (!g.document.type) errors.push('Tipo documento mancante');
  if (!g.document.number) errors.push('Numero documento mancante');
  if (!g.document.issuePlace) errors.push('Luogo di rilascio del documento mancante');

  return errors;
}

// ══════════════════════════════════════════════
// Export JSON cumulativo
// ══════════════════════════════════════════════
function buildExportJson() {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    structure: { name: STRUCTURE_NAME, code: STRUCTURE_CODE, cin: STRUCTURE_CIN },
    guests: state.schedine.map(g => ({
      id: g.id,
      document: { ...g.document },
      personal: { ...g.personal },
      stay: { ...g.stay },
    })),
  };
}

function exportFilename() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return 'export_alloggiati_' + yyyy + mm + dd + '.json';
}



// ── OCR documenti ────────────────────────────
// La funzione OCR gira come Netlify Function nello stesso sito (netlify/functions/ocr-proxy.mjs),
// quindi il percorso è relativo: nessun dominio esterno, nessun problema di CORS.
const OCR_PROXY_URL = '/api/ocr-proxy';
const OCR_APP_TOKEN = 'vianazionale2026xyz93'; // deve combaciare con la variabile APP_SHARED_TOKEN su Netlify

// Migliora la leggibilità della foto per l'OCR: scala di grigi + stiramento del contrasto.
function preprocessImage(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        d[i] = d[i + 1] = d[i + 2] = gray;
      }
      let min = 255, max = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] < min) min = d[i];
        if (d[i] > max) max = d[i];
      }
      const range = Math.max(1, max - min);
      for (let i = 0; i < d.length; i += 4) {
        const v = (d[i] - min) * 255 / range;
        d[i] = d[i + 1] = d[i + 2] = v;
      }
      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => resolve(dataUrl); // in caso di errore usa l'originale
    img.src = dataUrl;
  });
}

// Chiama la Netlify Function che a sua volta interroga Google Cloud Vision.
// In caso di errore, salva un dettaglio tecnico leggibile in state.ocrErrorDetail
// (mostrato nella UI dietro "Dettagli tecnici") invece di un generico fallimento silenzioso.
async function callVisionOCR(dataUrl) {
  let res;
  try {
    res = await fetch(OCR_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-App-Token': OCR_APP_TOKEN },
      body: JSON.stringify({ image: dataUrl }),
    });
  } catch (networkErr) {
    const detail = 'Rete: impossibile raggiungere ' + OCR_PROXY_URL + ' (' + networkErr.message + ')';
    console.warn(detail);
    state.ocrErrorDetail = detail;
    throw networkErr;
  }
  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    const detail = 'HTTP ' + res.status + ' da ' + OCR_PROXY_URL + (bodyText ? ' — ' + bodyText.slice(0, 300) : '')
      + (res.status === 401 ? ' (probabile disallineamento tra OCR_APP_TOKEN e APP_SHARED_TOKEN)' : '')
      + (res.status === 404 ? ' (funzione non trovata: verifica che netlify.toml e netlify/functions/ocr-proxy.mjs siano stati pubblicati)' : '')
      + (res.status === 502 ? ' (la funzione ha risposto ma la chiamata a Google Vision è fallita: verifica GOOGLE_VISION_API_KEY e la fatturazione del progetto Google Cloud)' : '');
    console.warn('Vision proxy error:', detail);
    state.ocrErrorDetail = detail;
    throw new Error(detail);
  }
  const json = await res.json();
  state.ocrErrorDetail = '';
  return { text: json.text || '', confidence: typeof json.confidence === 'number' ? json.confidence : null };
}

function todayFormatted() {
  const d = new Date();
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

// Un giorno dopo oggi, come default ragionevole per la data di partenza.
function tomorrowFormatted() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

const GUEST_TYPE_OPTIONS = ['OSPITE SINGOLO', 'CAPO FAMIGLIA', 'CAPO GRUPPO', 'FAMILIARE', 'MEMBRO GRUPPO'];

// Elenco ufficiale degli stati (da stati.csv, 236 voci) e dei tipi documento (da
// documenti.csv, 95 voci): sono le uniche opzioni selezionabili nei relativi menu a
// tendina, così il testo salvato è sempre un valore ufficiale coerente, mai libero.
const STATI_LIST = [
  'AFGHANISTAN', 'ALBANIA', 'ALGERIA', 'ANDORRA',
  'ANGOLA', 'ANGUILLA (ISOLA)', 'ANTIGUA E BARBUDA', 'APOLIDE',
  'ARABIA SAUDITA', 'ARGENTINA', 'ARMENIA', 'AUSTRALIA',
  'AUSTRIA', 'AZERBAIGIAN', 'BAHAMAS', 'BAHREIN',
  'BANGLADESH', 'BARBADOS', 'BELGIO', 'BELIZE',
  'BENIN', 'BERMUDE', 'BHUTAN', 'BIELORUSSIA',
  'BOLIVIA', 'BOPHUTHATSWANA', 'BOSNIA ED ERZEGOVINA', 'BOTSWANA',
  'BRASILE', 'BRUNEI DARUSSALAM', 'BULGARIA', 'BURKINA FASO',
  'BURUNDI', 'CAMBOGIA', 'CAMERUN', 'CANADA',
  'CAPO VERDE', 'CAYMAN (ISOLE)', 'CECOSLOVACCHIA', 'CHRISTMAS',
  'CIAD', 'CILE', 'CINA', 'CIPRO',
  'COCOS', 'COLOMBIA', 'COMORE', 'CONGO',
  'COREA DEL NORD', 'COREA DEL SUD', 'COSTA D\'AVORIO', 'COSTA RICA',
  'CROAZIA', 'CUBA', 'DANIMARCA', 'DOMINICA',
  'ECUADOR', 'EGITTO', 'EL SALVADOR', 'EMIRATI ARABI UNITI',
  'ERITREA', 'ESTONIA', 'ETIOPIA', 'FAER OER',
  'FEDERAZIONE RUSSA', 'FIGI', 'FILIPPINE', 'FINLANDIA',
  'FRANCIA', 'GABON', 'GAMBIA', 'GEORGIA',
  'GEORGIA SUD E ISOLE SANDWICH AUSTRALI', 'GERMANIA', 'GHANA', 'GIAMAICA',
  'GIAPPONE', 'GIBUTI', 'GIORDANIA', 'GRECIA',
  'GRENADA', 'GROENLANDIA', 'GUADALUPA', 'GUAM',
  'GUATEMALA', 'GUAYANA FRANCESE', 'GUERNSEY', 'GUINEA',
  'GUINEA BISSAU', 'GUINEA EQUATORIALE', 'GUYANA', 'HAITI',
  'HONDURAS', 'HONG KONG', 'INDIA', 'INDONESIA',
  'IRAN', 'IRAQ', 'IRLANDA', 'ISLANDA',
  'ISOLE VERGINI', 'ISRAELE', 'ITALIA', 'KAZAKISTAN',
  'KENYA', 'KIRGHIZISTAN', 'KIRIBATI', 'KOSOVO',
  'KUWAIT', 'LA REUNION', 'LAOS', 'LESOTHO',
  'LETTONIA', 'LIBANO', 'LIBERIA', 'LIBIA',
  'LIECHTENSTEIN', 'LITUANIA', 'LUSSEMBURGO', 'MACAO',
  'MACEDONIA', 'MACEDONIA DEL NORD', 'MADAGASCAR', 'MALAWI',
  'MALAYSIA', 'MALDIVE', 'MALI', 'MALTA',
  'MALVINE', 'MAN', 'MAROCCO', 'MARSHALL',
  'MARTINICA', 'MAURITANIA', 'MAURIZIO', 'MAYOTTE',
  'MESSICO', 'MICRONESIA STATI FEDERALI', 'MOLDAVIA', 'MONACO',
  'MONGOLIA', 'MONTENEGRO', 'MONTSERRAT', 'MOZAMBICO',
  'MYANMAR-BIRMANIA', 'NAMIBIA', 'NAURU', 'NEPAL',
  'NICARAGUA', 'NIGER', 'NIGERIA', 'NORFOLK',
  'NORVEGIA', 'NUOVA CALEDONIA', 'NUOVA ZELANDA', 'OMAN',
  'PAESI BASSI', 'PAKISTAN', 'PALAU REPUBBLICA', 'PALESTINA',
  'PANAMA', 'PAPUASIA-N.GUINEA', 'PARAGUAY', 'PERU\'',
  'PITCAIRN', 'POLINESIA', 'POLONIA', 'PORTOGALLO',
  'PUERTO RICO', 'QATAR', 'REGNO UNITO', 'REPUBBLICA CECA',
  'REPUBBLICA CENTRAFRICANA', 'REPUBBLICA DEMOCRATICA DEL CONGO', 'REPUBBLICA DOMINICANA', 'REPUBBLICA SLOVACCA',
  'ROMANIA', 'RUANDA', 'S. CHRISTOPHER E NEVIS', 'S. VINCENT E GRENADINE',
  'SAHARA SPAGNOLO', 'SAINT LUCIA', 'SAINT PIERRE ET MIQUELON', 'SAINT VINCENT E GRENADINE',
  'SALOMONE', 'SAMOA', 'SAMOA AMERICANE', 'SAN MARINO',
  'SANT ELENA', 'SAO TOME\' E PRINCIPE', 'SENEGAL', 'SERBIA',
  'SEYCHELLES', 'SIERRA LEONE', 'SINGAPORE', 'SIRIA',
  'SLOVENIA', 'SOMALIA', 'SPAGNA', 'SRI LANKA (CEYLON)',
  'STATI UNITI D\'AMERICA', 'STATO DELLA CITTA\' DEL VATICANO', 'SUD SUDAN', 'SUDAFRICA',
  'SUDAN', 'SURINAME', 'SVEZIA', 'SVIZZERA',
  'SWAZILAND', 'TAGIKISTAN', 'TAIWAN', 'TANZANIA',
  'THAILANDIA', 'TIMOR', 'TOGO', 'TOKELAU',
  'TONGA', 'TRINIDAD E TOBAGO', 'TUNISIA', 'TURCHIA',
  'TURKMENISTAN', 'TURKS', 'TUVALU', 'UCRAINA',
  'UGANDA', 'UNGHERIA', 'URUGUAY', 'UZBEKISTAN',
  'VANUATU', 'VENEZUELA', 'VERGINI BRITANNICHE (ISOLE)', 'VIETNAM',
  'WALLIS', 'YEMEN', 'ZAMBIA', 'ZIMBABWE',
];

const DOCUMENTI_LIST = [
  'CARTA DI IDENTITA\'', 'CARTA ID. DIPLOMATICA', 'CARTA IDENTITA\' ELETTRONICA',
  'CERTIFICATO D\'IDENTITA\'', 'PASSAPORTO DI SERVIZIO', 'PASSAPORTO DIPLOMATICO',
  'PASSAPORTO ORDINARIO', 'PATENTE DI GUIDA', 'PATENTE NAUTICA',
  'PORTO D\'ARMI GUARDIE GIUR', 'PORTO D\'ARMI USO SPORTIVO', 'PORTO FUCILE DIF. PERSON.',
  'PORTO FUCILE USO CACCIA', 'PORTO PISTOLA DIF. PERSON', 'TES. ENTE NAZ. ASSIS.VOLO',
  'TES. FERROV. EX DEPUTATI', 'TES. FERROVIARIA DEPUTATI', 'TES. POSTE E TELECOMUNIC.',
  'TES. UNICO PER LA CAMERA', 'TES.DOGANALE RIL.MIN.FIN.', 'TESS. AG. E AG.SC. C.F.S.',
  'TESS. AGENTI/ASS.TI P.P.', 'TESS. AGENTI/ASS.TI P.S.', 'TESS. APP.TO AG.CUSTODIA',
  'TESS. APP.TO CARABINIERI', 'TESS. APP.TO FINANZIERE', 'TESS. APP.TO/VIG. URBANO',
  'TESS. APP.TO/VIG. VV.FF.', 'TESS. CONSIGLIO DI STATO', 'TESS. CORTE D\'APPELLO',
  'TESS. CORTE DEI CONTI', 'TESS. FERROV. SENATO', 'TESS. FUNZIONARI P.S.',
  'TESS. IDENTIF.TELECOM IT.', 'TESS. ISCR. ALBO MED/CHI.', 'TESS. ISCRIZ. ALBO ODONT.',
  'TESS. ISPETTORI P.P.', 'TESS. ISPETTORI P.S.', 'TESS. MEMBRO EQUIP. AEREO',
  'TESS. MILIT. M.M.', 'TESS. MILIT. TRUPPA SISMI', 'TESS. MILITARE E.I.',
  'TESS. MILITARE NATO', 'TESS. MILITARE TRUPPA A.M', 'TESS. MIN. AFFARI ESTERI',
  'TESS. MIN.BEN.E ATT.CULT.', 'TESS. MIN.PUBB.ISTRUZIONE', 'TESS. MINIST. TRASP/NAVIG',
  'TESS. MINISTERO DIFESA', 'TESS. MINISTERO FINANZE', 'TESS. MINISTERO GIUSTIZIA',
  'TESS. MINISTERO INTERNO', 'TESS. MINISTERO LAVORI PU', 'TESS. MINISTERO SANITA\'',
  'TESS. MINISTERO TESORO', 'TESS. ORDINE GIORNALISTI', 'TESS. PARLAMENTARI',
  'TESS. PERS. MAGISTRATI', 'TESS. POL. TRIB. G.D.F.', 'TESS. POLIZIA FEMMINILE',
  'TESS. PRES.ZA CONS. MIN.', 'TESS. PUBBLICA ISTRUZIONE', 'TESS. S.I.S.D.E.',
  'TESS. SOTT.LI AG.CUSTODIA', 'TESS. SOTT.LI G.D.F.', 'TESS. SOTT.LI VIG. URBANI',
  'TESS. SOTTUFF.LI VV.FF.', 'TESS. SOTTUFFICIALI A.M.', 'TESS. SOTTUFFICIALI CC',
  'TESS. SOTTUFFICIALI E.I.', 'TESS. SOTTUFFICIALI SISMI', 'TESS. SOTTUFICIALI C.F.S.',
  'TESS. SOTTUFICIALI M.M.', 'TESS. SOVRINTENDENTI P.P.', 'TESS. SOVRINTENDENTI P.S.',
  'TESS. UFF.LI AG.CUSTODIA', 'TESS. UFF.LI VIG.URBANI', 'TESS. UFFICIALE',
  'TESS. UFFICIALI A.M.', 'TESS. UFFICIALI C.F.S.', 'TESS. UFFICIALI E.I.',
  'TESS. UFFICIALI G.D.F.', 'TESS. UFFICIALI M.M.', 'TESS. UFFICIALI P.P.',
  'TESS. UFFICIALI P.S.', 'TESS. UFFICIALI SISMI', 'TESS. UFFICIALI VV.FF.',
  'TESS.ISCR. ALBO INGEGNERI', 'TESS.ISCR.ALBO ARCHITETTI', 'TESS.MIN.POLIT.AGRIC.FOR.',
  'TESSERA DELL\'ORDINE NOTAI', 'TESSERA ISCR. ALBO AVVOC.', 'TESSERA RICONOSC. D.I.A.',
  'TESSERA U.N.U.C.I.', 'TITOLO VIAGGIO RIF.POLIT.',
];

// Mappa dei codici MRZ (alpha-3, quelli stampati sulla riga leggibile a macchina dei
// passaporti/CIE) verso il nome ufficiale nella tabella Stati — verificata a mano contro
// stati.csv per i paesi più comuni. Per i codici non presenti qui, si usa il confronto
// testuale generico (findBestMatch) come piano B.
const MRZ_ALPHA3_TO_STATO = {
  ITA: 'ITALIA', FRA: 'FRANCIA', DEU: 'GERMANIA', ESP: 'SPAGNA', GBR: 'REGNO UNITO',
  USA: "STATI UNITI D'AMERICA", CHE: 'SVIZZERA', AUT: 'AUSTRIA', BEL: 'BELGIO',
  NLD: 'PAESI BASSI', PRT: 'PORTOGALLO', POL: 'POLONIA', ROU: 'ROMANIA',
  RUS: 'FEDERAZIONE RUSSA', UKR: 'UCRAINA', GRC: 'GRECIA', IRL: 'IRLANDA',
  SWE: 'SVEZIA', NOR: 'NORVEGIA', DNK: 'DANIMARCA', FIN: 'FINLANDIA',
  CHN: 'CINA', JPN: 'GIAPPONE', BRA: 'BRASILE', CAN: 'CANADA', AUS: 'AUSTRALIA',
  MEX: 'MESSICO', ARG: 'ARGENTINA', IND: 'INDIA', MAR: 'MAROCCO', TUN: 'TUNISIA',
  ALB: 'ALBANIA', HRV: 'CROAZIA', SRB: 'SERBIA', HUN: 'UNGHERIA', BGR: 'BULGARIA',
  TUR: 'TURCHIA', BLR: 'BIELORUSSIA',
  // Restanti Stati membri UE/SEE (codici MRZ alpha-3 ICAO) — carte d'identità e
  // passaporti UE usano tutti lo stesso standard MRZ, quindi bastano i codici corretti
  // perché il resto del parsing (TD1/TD3) funzioni automaticamente per ogni paese.
  CYP: 'CIPRO', CZE: 'REPUBBLICA CECA', EST: 'ESTONIA', LVA: 'LETTONIA',
  LTU: 'LITUANIA', LUX: 'LUSSEMBURGO', MLT: 'MALTA', SVK: 'REPUBBLICA SLOVACCA',
  SVN: 'SLOVENIA', ISL: 'ISLANDA', LIE: 'LIECHTENSTEIN',
};

// Titoli con cui le carte d'identità dei paesi UE si presentano (lingua nazionale),
// usati per riconoscere il tipo di documento nel percorso generico senza MRZ leggibile.
// Elenco paesi di riferimento: identity-cards.net.
const EU_ID_CARD_TITLES = [
  "carte d'identité", 'documento nacional de identidad',
  'cartão de cidadão', 'personalausweis', 'identiteitskaart', 'dowód osobisty',
  'személyazonosító igazolvány', 'občanský průkaz', 'občiansky preukaz',
  'osebna izkaznica', 'asmens tapatybės kortelė', 'personas apliecība',
  'isikutunnistus', 'karta tożsamości', 'identity card',
];

// Titoli con cui la patente di guida si presenta nelle varie lingue UE — tutte le patenti
// UE seguono lo stesso modello (Direttiva 2006/126/CE), quindi il documento fisico è
// sostanzialmente identico in tutta l'Unione: cambia solo la lingua dell'intestazione.
const EU_DRIVING_LICENCE_TITLES = [
  'permis de conduire', 'führerschein', 'rijbewijs', 'körkort', 'kørekort',
  'ajokortti', 'carta de condução', 'permiso de conducción', 'prawo jazdy',
  'vezetői engedély', 'řidičský průkaz', 'vodičský preukaz', 'vozniško dovoljenje',
  'vairuotojo pažymėjimas', 'vadītāja apliecība', 'juhiluba',
];


// Confronto testuale approssimato: toglie accenti/punteggiatura e confronta in maiuscolo.
function normalizeForMatch(s) {
  return (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9 ]/g, '').trim();
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Trova nella lista ufficiale la voce che più somiglia al testo letto dall'OCR: prova prima
// corrispondenza esatta, poi prefisso/contenuto, infine distanza di Levenshtein entro una
// soglia ragionevole. Restituisce '' se non trova nulla di abbastanza simile (l'operatore
// sceglierà a mano dal menu).
function findBestMatch(text, list) {
  if (!text) return '';
  const norm = normalizeForMatch(text);
  if (!norm) return '';
  const exact = list.find(item => normalizeForMatch(item) === norm);
  if (exact) return exact;
  const starts = list.find(item => {
    const n = normalizeForMatch(item);
    return n.startsWith(norm) || norm.startsWith(n);
  });
  if (starts) return starts;
  const includes = list.find(item => {
    const n = normalizeForMatch(item);
    return n.includes(norm) || norm.includes(n);
  });
  if (includes) return includes;
  let best = '', bestDist = Infinity;
  for (const item of list) {
    const d = levenshtein(norm, normalizeForMatch(item));
    if (d < bestDist) { bestDist = d; best = item; }
  }
  const threshold = Math.max(2, Math.floor(norm.length * 0.35));
  return bestDist <= threshold ? best : '';
}

// Stato/nazionalità: prova prima la mappa MRZ (codici alpha-3 come "ITA", "FRA"...),
// poi il confronto testuale generico (utile per il percorso senza MRZ, dove l'OCR legge
// direttamente un nome per esteso).
function matchStato(text) {
  if (!text) return '';
  const code = text.trim().toUpperCase();
  if (MRZ_ALPHA3_TO_STATO[code]) return MRZ_ALPHA3_TO_STATO[code];
  return findBestMatch(text, STATI_LIST);
}

function matchDocumento(text) {
  if (!text) return '';
  if (DOCUMENTI_LIST.includes(text)) return text;
  return findBestMatch(text, DOCUMENTI_LIST);
}

// Guest "vuoto", nella stessa forma annidata dell'export JSON finale: acquisiamo i dati
// così come compaiono sul documento, senza convertirli in codici — la conversione nel
// tracciato ufficiale Alloggiati Web avviene in un'altra app.
function emptyGuestDraft() {
  return {
    id: 'guest-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    document: { type: '', number: '', issuePlace: '', ocrConfidence: null },
    personal: { lastName: '', firstName: '', gender: '', birthDate: '', birthPlace: '', birthProvince: '', birthCountry: '', nationality: '' },
    stay: { arrivalDate: todayFormatted(), departureDate: tomorrowFormatted(), guestType: 'OSPITE SINGOLO' },
  };
}

// Traduce il risultato grezzo dell'OCR (extractFieldsFromText) in una bozza di ospite
// pronta per la revisione manuale — riportando i valori così come letti sul documento,
// senza alcuna conversione in codice. Solo i campi che l'OCR può davvero leggere vengono
// precompilati; il resto (arrivo, partenza, luogo nascita se non riconosciuto, ecc.) resta
// da compilare o verificare a mano.
// Uniforma qualunque data letta dall'OCR al formato gg/mm/aaaa, indipendentemente dal
// separatore stampato sul documento originale (i documenti italiani spesso usano i punti:
// "31.12.2028" anziché "31/12/2028").
function normalizeDateStr(s) {
  if (!s) return '';
  const m = s.trim().match(/^(\d{2})[.\-\/](\d{2})[.\-\/](\d{4})$/);
  return m ? m[1] + '/' + m[2] + '/' + m[3] : s.trim();
}

function ocrResultToGuestDraft(ocrResult, confidence) {
  const draft = emptyGuestDraft();
  draft.personal.lastName = (ocrResult.surname || '').trim();
  draft.personal.firstName = (ocrResult.givenNames || '').trim();
  draft.personal.birthDate = normalizeDateStr(ocrResult.dob);
  draft.personal.gender = ocrResult.sex || '';
  // Cittadinanza/stato di nascita: l'OCR può leggere un codice MRZ a 3 lettere ("ITA")
  // o un nome per esteso — in entrambi i casi cerchiamo la voce più vicina nella tabella
  // ufficiale Stati, così il menu a tendina si preseleziona da solo; l'operatore corregge
  // se il risultato non è quello giusto.
  draft.personal.nationality = matchStato(ocrResult.nationality);
  if (ocrResult.comuneNascita) {
    draft.personal.birthPlace = ocrResult.comuneNascita;
    draft.personal.birthProvince = ocrResult.provinciaNascita || '';
    draft.personal.birthCountry = 'ITALIA'; // il formato "Comune (PR)" compare solo su documenti italiani
  } else if (ocrResult.nationality) {
    // Nessun indizio di nascita in Italia: come suggerimento di partenza usiamo la stessa
    // corrispondenza della cittadinanza (spesso coincidono, ma l'operatore verifica sempre).
    draft.personal.birthCountry = matchStato(ocrResult.nationality);
  }

  draft.document.type = matchDocumento(ocrResult.docType);
  draft.document.number = ocrResult.number || '';
  if (ocrResult.luogoRilascio) draft.document.issuePlace = ocrResult.luogoRilascio;
  if (typeof confidence === 'number') draft.document.ocrConfidence = Math.round(confidence * 100) / 100;

  return draft;
}

// Imposta un valore in un campo annidato (es. "document.number", "personal.lastName")
// senza mai chiamare render(): evita di perdere il focus/cursore mentre si digita.
function setNestedField(obj, path, value) {
  const [group, key] = path.split('.');
  if (!obj[group]) obj[group] = {};
  obj[group][key] = value;
}

function updateGuestField(path, value) {
  if (!state.ocrFields) state.ocrFields = emptyGuestDraft();
  setNestedField(state.ocrFields, path, value);
}

// Converte una data MRZ 'YYMMDD' in 'DD/MM/YYYY' (euristica sul secolo: >30 -> 1900+, altrimenti 2000+)
function formatMrzDate(yymmdd) {
  if (!/^\d{6}$/.test(yymmdd)) return '';
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const mm = yymmdd.slice(2, 4), dd = yymmdd.slice(4, 6);
  const yyyy = yy > 30 ? 1900 + yy : 2000 + yy;
  return dd + '/' + mm + '/' + yyyy;
}

function splitMrzNames(namesPart) {
  const clean = namesPart.replace(/<+$/, '');
  const [surname = '', given = ''] = clean.split('<<');
  return {
    surname: surname.replace(/</g, ' ').trim(),
    givenNames: given.replace(/</g, ' ').trim(),
  };
}

// Passaporto (TD3): due righe da 44 caratteri
function parseTD3(line1, line2) {
  const country = line1.substr(2, 3).replace(/</g, '');
  const { surname, givenNames } = splitMrzNames(line1.substr(5));
  const number = line2.substr(0, 9).replace(/</g, '').trim();
  const nationality = line2.substr(10, 3).replace(/</g, '');
  const dob = formatMrzDate(line2.substr(13, 6));
  const sex = line2.substr(20, 1) === 'F' ? 'F' : (line2.substr(20, 1) === 'M' ? 'M' : '');
  const expiry = formatMrzDate(line2.substr(21, 6));
  return { docType: 'PASSAPORTO ORDINARIO', country, surname, givenNames, number, nationality, sex, dob, expiry };
}

// Carta d'identità elettronica (TD1): tre righe da 30 caratteri
function parseTD1(line1, line2, line3) {
  const country = line1.substr(2, 3).replace(/</g, '');
  const number = line1.substr(5, 9).replace(/</g, '').trim();
  const dob = formatMrzDate(line2.substr(0, 6));
  const sex = line2.substr(7, 1) === 'F' ? 'F' : (line2.substr(7, 1) === 'M' ? 'M' : '');
  const expiry = formatMrzDate(line2.substr(8, 6));
  const nationality = line2.substr(15, 3).replace(/</g, '');
  const { surname, givenNames } = splitMrzNames(line3);
  return { docType: "CARTA IDENTITA' ELETTRONICA", country, surname, givenNames, number, nationality, sex, dob, expiry };
}

// Fallback generico: cerca etichette note (multi-lingua) riga per riga nel testo OCR grezzo.
// Parole che indicano che il testo "catturato" è in realtà un'altra etichetta stampata
// sul documento (es. intestazioni bilingue "Cognome/Surname"), non il dato vero e proprio.
const GENERIC_LABEL_WORDS = [
  'cognome', 'surname', 'nom', 'nome', 'name', 'given', 'prénom', 'first',
  'data', 'date', 'nascita', 'birth', 'naissance', 'nazionalit', 'nationality',
  'documento', 'document', 'numero', 'number', 'scadenza', 'expiry', 'sesso', 'sex',
  'luogo', 'place', 'rilascio', 'issue', 'residenza', 'residence',
  'comune', 'municipality', 'emissione', 'issuing',
  // Altre lingue UE (etichette che possono comparire sui documenti di altri Stati membri)
  'achternaam', 'voornaam', 'geboorte', 'geboortedatum', 'nationaliteit',
  'apelido', 'nascimento', 'nacionalidade', 'apellido', 'nacimiento', 'nacionalidad',
  'nachname', 'vorname', 'geburtsdatum', 'staatsangehörigkeit', 'geburtsort',
  'nazwisko', 'imię', 'urodzenia', 'obywatelstwo',
  'efternamn', 'förnamn', 'födelsedatum', 'medborgarskap',
  'efternavn', 'fornavn', 'fødselsdato', 'statsborgerskab',
  'sukunimi', 'etunimi', 'syntymäaika', 'kansalaisuus',
  'příjmení', 'jméno', 'narození', 'státní příslušnost',
  'priezvisko', 'meno', 'narodenia', 'štátna príslušnosť',
  'priimek', 'ime', 'rojstva', 'državljanstvo',
  'pavardė', 'vardas', 'gimimo', 'pilietybė',
  'uzvārds', 'vārds', 'dzimšanas', 'pilsonība',
  'perekonnanimi', 'eesnimi', 'sünniaeg', 'kodakondsus',
  'vezetéknév', 'keresztnév', 'születési', 'állampolgárság',
];

function looksLikeAnotherLabel(str) {
  const low = str.toLowerCase();
  return GENERIC_LABEL_WORDS.some(w => low.includes(w));
}

// Cerca un'etichetta (con confini di parola, per evitare falsi positivi tipo "nome"
// dentro "cognome") e restituisce il valore associato: prima prova sulla stessa riga,
// altrimenti sulla riga successiva (utile quando etichetta e valore sono su righe diverse,
// come "LUOGO E DATA DI NASCITA" seguito, sulla riga sotto, dal vero valore).
function findLabelValue(lines, labels) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const label of labels) {
      const hasLabel = new RegExp('\\b' + label + '\\b', 'i').test(line);
      if (!hasLabel) continue;
      const sameLine = line.match(new RegExp('\\b' + label + '\\b\\s*[:\\-/]?\\s*(.{2,40})$', 'i'));
      if (sameLine && sameLine[1] && !looksLikeAnotherLabel(sameLine[1])) {
        return sameLine[1].trim();
      }
      // L'etichetta è presente ma sulla stessa riga non c'è un valore utilizzabile
      // (riga finita, o quel che segue è un'altra etichetta): prova la riga successiva.
      if (lines[i + 1] && !looksLikeAnotherLabel(lines[i + 1])) {
        return lines[i + 1].trim();
      }
    }
  }
  return '';
}

// Riconosce il formato tipico delle carte d'identità italiane:
// "COMUNE (PR) gg.mm.aaaa" oppure "gg/mm/aaaa". Lavora riga per riga (non sull'intero
// testo) per evitare che lo spazio bianco della regex "ingoi" righe precedenti non
// correlate attraverso gli a-capo.
function extractItalianBirthLine(lines) {
  for (const line of lines) {
    const m = line.match(/([A-ZÀ-Ú][A-ZÀ-Ú'\s]{1,30}?)\s*\(\s*([A-Z]{2})\s*\)\s*(\d{2})[.\/](\d{2})[.\/](\d{4})/i);
    if (m) return { comune: m[1].trim(), provincia: m[2].toUpperCase(), dob: m[3] + '/' + m[4] + '/' + m[5] };
  }
  return null;
}

// Il sesso spesso condivide la riga/colonna con un'altra informazione (es. "SESSO STATURA"
// seguito da "M 180" = sesso + altezza): cerchiamo un token isolato M/F entro poche righe
// dopo l'etichetta, invece di fidarci ciecamente di quel che segue sulla stessa riga.
function extractSesso(lines) {
  for (let i = 0; i < lines.length; i++) {
    if (/\bsesso\b|\bsex\b/i.test(lines[i])) {
      for (let j = i; j < Math.min(i + 4, lines.length); j++) {
        const m = lines[j].match(/\b([MF])\b/);
        if (m) return m[1].toUpperCase();
      }
    }
  }
  return '';
}

// Riconosce il tipo di documento dal testo libero (percorso generico, senza MRZ) e
// restituisce direttamente l'etichetta ufficiale della tabella Documenti.
function detectDocType(text) {
  const low = text.toLowerCase();
  if (low.includes('patente nautica')) return 'PATENTE NAUTICA';
  if (low.includes('patente') || low.includes('driving licence') || low.includes('driver')) return 'PATENTE DI GUIDA';
  // Patente UE straniera: stesso modello della patente italiana (Direttiva 2006/126/CE),
  // cambia solo la lingua dell'intestazione stampata sul documento.
  if (EU_DRIVING_LICENCE_TITLES.some(title => low.includes(title))) return 'PATENTE DI GUIDA';
  if (low.includes('porto d\'armi') || low.includes('porto darmi')) return "PORTO D'ARMI GUARDIE GIUR";
  if (low.includes('passaporto') || low.includes('passport') || low.includes('reisepass') || low.includes('passeport') || low.includes('pasaporte')) return 'PASSAPORTO ORDINARIO';
  if (low.includes('elettronica') && (low.includes('identit') || low.includes('identity'))) return "CARTA IDENTITA' ELETTRONICA";
  if (low.includes('identit') || low.includes('identity card')) return "CARTA DI IDENTITA'";
  // Carta d'identità di un altro paese UE: riconosciuta dal titolo nella lingua nazionale.
  if (EU_ID_CARD_TITLES.some(title => low.includes(title))) return "CARTA DI IDENTITA'";
  return '';
}

function genericExtract(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const find = (labels) => findLabelValue(lines, labels);

  const result = {
    docType: detectDocType(text),
    surname: find([
      'cognome', 'surname', 'nom', 'apellido', 'nachname', 'achternaam', 'apelido',
      'nazwisko', 'efternamn', 'efternavn', 'sukunimi', 'příjmení', 'priezvisko',
      'priimek', 'pavardė', 'uzvārds', 'perekonnanimi', 'vezetéknév',
    ]),
    givenNames: find([
      'nome', 'given name', 'prénom', 'first name', 'nombre', 'vorname', 'voornaam',
      'nome próprio', 'imię', 'förnamn', 'fornavn', 'etunimi', 'jméno', 'meno',
      'ime', 'vardas', 'vārds', 'eesnimi', 'keresztnév',
    ]),
    number: find(['numero documento', 'n\\.?\\s*documento', 'document no', 'passport no', 'n°', 'nr dokumentu', 'numer dokumentu']),
    nationality: find([
      'nazionalit[aà]', 'nationality', 'nacionalidad', 'staatsangehörigkeit', 'nationaliteit',
      'nacionalidade', 'obywatelstwo', 'medborgarskap', 'statsborgerskab', 'kansalaisuus',
      'státní příslušnost', 'štátna príslušnosť', 'državljanstvo', 'pilietybė',
      'pilsonība', 'kodakondsus', 'állampolgárság',
    ]),
    dob: find([
      'data di nascita', 'date of birth', 'geburtsdatum', 'fecha de nacimiento',
      'geboortedatum', 'data de nascimento', 'data urodzenia', 'födelsedatum',
      'fødselsdato', 'syntymäaika', 'datum narození', 'dátum narodenia',
      'datum rojstva', 'gimimo data', 'dzimšanas dat', 'sünniaeg', 'születési idő',
    ]),
    // Sulla carta d'identità italiana "COMUNE DI / MUNICIPALITY" indica il comune che ha
    // rilasciato il documento — è il nome del luogo di rilascio (il codice numerico resta
    // comunque da inserire a mano, serve la tabella ufficiale).
    luogoRilascio: find(['comune di', 'municipality']),
    comuneNascita: '', provinciaNascita: '',
  };

  result.sex = extractSesso(lines);

  // Formato italiano "Comune (PR) gg.mm.aaaa": se trovato, ha priorità perché più affidabile
  // della ricerca per etichette separate (e ci dà anche comune/provincia, che altrimenti
  // resterebbero sempre da inserire a mano).
  const birthLine = extractItalianBirthLine(lines);
  if (birthLine) {
    result.comuneNascita = birthLine.comune;
    result.provinciaNascita = birthLine.provincia;
    result.dob = birthLine.dob;
  }

  return result;
}

// Individua e interpreta la MRZ nel testo OCR; se non trovata, usa l'estrazione generica.
function extractFieldsFromText(text) {
  const candidateLines = text.split('\n')
    .map(l => l.replace(/\s+/g, '').toUpperCase())
    .filter(l => l.length >= 28 && l.length <= 46 && /^[A-Z0-9<]+$/.test(l));

  const td3Index = candidateLines.findIndex(l => l.length >= 43 && l.startsWith('P<'));
  if (td3Index >= 0 && candidateLines[td3Index + 1] && candidateLines[td3Index + 1].length >= 43) {
    try {
      return parseTD3(candidateLines[td3Index].padEnd(44, '<'), candidateLines[td3Index + 1].padEnd(44, '<'));
    } catch (e) { console.warn('Parsing TD3 fallito', e); }
  }

  for (let i = 0; i < candidateLines.length - 2; i++) {
    const [a, b, c] = [candidateLines[i], candidateLines[i + 1], candidateLines[i + 2]];
    if (a.length >= 29 && a.length <= 31 && b.length >= 29 && b.length <= 31 && c.length >= 29 && c.length <= 31) {
      try {
        return parseTD1(a.padEnd(30, '<'), b.padEnd(30, '<'), c.padEnd(30, '<'));
      } catch (e) { console.warn('Parsing TD1 fallito', e); }
    }
  }

  const emptyRaw = { docType: '', surname: '', givenNames: '', number: '', nationality: '', sex: '', dob: '', comuneNascita: '', provinciaNascita: '', luogoRilascio: '' };
  return { ...emptyRaw, ...genericExtract(text) };
}

async function runOCR() {
  state.docPhase = 'processing';
  state.ocrError = null;
  render();

  let combinedText = '';
  const confidences = [];

  try {
    // ── Google Cloud Vision (via proxy) — unico motore OCR ──
    for (const img of state.images) {
      const pre = await preprocessImage(img);
      const { text, confidence } = await callVisionOCR(pre);
      combinedText += '\n' + text;
      if (typeof confidence === 'number') confidences.push(confidence);
    }
  } catch (err) {
    console.warn('Vision OCR non disponibile:', err);
    state.ocrError = 'vision_failed';
    combinedText = '';
  }

  const avgConfidence = confidences.length ? confidences.reduce((a, b) => a + b, 0) / confidences.length : null;

  state.ocrRaw = combinedText;
  state.ocrFields = ocrResultToGuestDraft(extractFieldsFromText(combinedText), avgConfidence);
  state.docPhase = 'review';
  render();
}

// Aggiunge l'ospite in revisione alla lista della pratica corrente (persistita in localStorage)
// e torna alla schermata di acquisizione per un eventuale ospite successivo. A differenza di
// prima, qui non si può più "procedere comunque": se l'OCR non ha letto un campo (per
// qualsiasi motivo — non solo Vision irraggiungibile, anche un singolo dato illeggibile),
// l'operatore deve completarlo a mano prima di poter aggiungere l'ospite.
function addGuestToList() {
  const draft = state.ocrFields || emptyGuestDraft();
  const errors = validateGuest(draft);
  if (errors.length) {
    alert((t().upload.validationTitle || 'Completa questi campi prima di continuare:') + '\n\n- ' + errors.join('\n- '));
    return;
  }
  state.schedine.push(draft);
  localStorage.setItem('vianaz_schedine', JSON.stringify(state.schedine));
  state.ocrFields = null;
  state.images = [];
  localStorage.setItem('vianaz_images', JSON.stringify(state.images));
  state.docPhase = 'list';
  render();
}

function removeGuestFromList(id) {
  state.schedine = state.schedine.filter(g => g.id !== id);
  localStorage.setItem('vianaz_schedine', JSON.stringify(state.schedine));
  render();
}

function editGuestFromList(id) {
  const guest = state.schedine.find(g => g.id === id);
  if (!guest) return;
  state.ocrFields = JSON.parse(JSON.stringify(guest)); // copia profonda: niente riferimenti condivisi
  state.schedine = state.schedine.filter(g => g.id !== id);
  localStorage.setItem('vianaz_schedine', JSON.stringify(state.schedine));
  state.docPhase = 'review';
  render();
}

function downloadExportFile(file, filename) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildExportFile() {
  const content = JSON.stringify(buildExportJson(), null, 2);
  const filename = exportFilename();
  return { file: new File([content], filename, { type: 'application/json' }), filename };
}

// Invio automatico via Google Sheets: nessun download, nessun cambio app — i dati vengono
// scritti da un backend (Netlify Function + Google Sheets API) direttamente nel foglio
// condiviso, riga per riga, pronti per essere letti dall'altra app.
const SEND_PROXY_URL = '/api/append-guest-sheet';

async function sendAutomatically() {
  if (!state.schedine.length) return;
  state.sendStatus = 'sending';
  state.sendErrorDetail = '';
  render();

  try {
    const res = await fetch(SEND_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-App-Token': OCR_APP_TOKEN },
      body: JSON.stringify({ exportData: buildExportJson() }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error('HTTP ' + res.status + (detail ? ' — ' + detail.slice(0, 300) : ''));
    }
    state.sendStatus = 'sent';
    state.docsSent = true;
    localStorage.setItem('vianaz_docssent', 'true');
  } catch (err) {
    console.warn('Invio automatico fallito:', err);
    state.sendStatus = 'error';
    state.sendErrorDetail = err.message || String(err);
  }
  render();
}

// Riserva manuale: scarica semplicemente il file, senza tentare alcun invio.
function downloadOnly() {
  if (!state.schedine.length) return;
  const { file, filename } = buildExportFile();
  downloadExportFile(file, filename);
  alert(t().upload.downloadedManualMsg || 'File scaricato. Invialo con lo strumento che preferisci: WhatsApp, Telegram, email o un altro ancora.');
}

function menuItems() {
  const tabs = t().tabs;
  return [
    { id:'schedine',     icon:'badge',        color:'#334155', label:tabs.schedine,    sub: t().upload ? t().upload.title : '', external:true },
    { id:'info',         icon:'home',         color:'#8a1f1f', label:tabs.info,        sub: t().info ? t().info.general : '' },
    { id:'philosophy',   icon:'eco',          color:'#3d8c5e', label:tabs.philosophy,  sub:'Eco-friendly & sustainable' },
    { id:'directions',   icon:'navigation',   color:'#0284c7', label:tabs.directions,  sub:'How to arrive & depart' },
    { id:'map',          icon:'map',          color:'#7c3aed', label:tabs.map,         sub:'Interactive map of Milazzo' },
    { id:'breakfast',    icon:'explore',      color:'#d97706', label:tabs.breakfast,   sub:'Discover the best of Milazzo' },
    { id:'bookServices', icon:'sailing',      color:'#0891b2', label:tabs.bookServices,sub:'Bikes, dives, tours & more' },
    { id:'events',       icon:'celebration',  color:'#db2777', label:tabs.events,      sub:'Concerts, festivals & markets' },
    { id:'museums',      icon:'museum',       color:'#b45309', label:tabs.museums,     sub:'Culture & history of Milazzo' },
    { id:'beach',        icon:'beach_access', color:'#0369a1', label:tabs.beach,       sub:'Crystal clear waters await' },
    { id:'recipes',      icon:'restaurant_menu', color:'#c2410c', label:tabs.recipes,     sub:'10 no-cook recipes' },
    { id:'roomGuide',    icon:'king_bed',     color:'#9333ea', label:tabs.roomGuide,   sub:'Navigate back to Via Nazionale' },
    { id:'checkout',     icon:'logout',       color:'#dc2626', label:tabs.checkout,    sub:'Instructions for departure' },
  ];
}

function mapEvent(e) {
  const l = state.lang;
  const fallback = (obj) => obj[l] || obj.it || obj.en || '';
  return { ...e, title: fallback(e.titles), desc: fallback(e.descs), monShort: (MONTHS_SHORT[l] || MONTHS_SHORT.en)[e.month - 1] };
}

function groupEvents(list, asc) {
  const groups = {};
  list.forEach(e => {
    const key = e.year + '-' + (e.month < 10 ? '0' + e.month : '' + e.month);
    if (!groups[key]) groups[key] = [];
    groups[key].push(mapEvent(e));
  });
  const keys = Object.keys(groups).sort((a,b) => asc ? a.localeCompare(b) : b.localeCompare(a));
  return keys.map(key => {
    const parts = key.split('-');
    const mo = parseInt(parts[1], 10);
    const yr = parseInt(parts[0], 10);
    const ml = MONTHS_LONG[state.lang] || MONTHS_LONG.en;
    return { key, monthName: ml[mo-1] + ' ' + yr, events: groups[key] };
  });
}

function todayLabel() {
  const l = state.lang;
  const today = new Date(); today.setHours(0,0,0,0);
  const locales = {en:'en-GB',it:'it-IT',fr:'fr-FR',es:'es-ES',de:'de-DE',zh:'zh-CN',ru:'ru-RU'};
  const labels = {en:'Today is',it:'Oggi è',fr:"Aujourd'hui c'est le",es:'Hoy es',de:'Heute ist',zh:'今天是',ru:'Сегодня'};
  return (labels[l]||labels.en) + ' ' + today.toLocaleDateString(locales[l]||'en-GB', {weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (c == null) return;
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  });
  return el;
}

function ms(icon, outline) {
  return h('span', { className: 'ms' + (outline ? ' ms-outline' : '') }, icon);
}

function langSelect() {
  const sel = h('select', { className: 'lang-select' },
    h('option', { value:'en' }, '🇬🇧 English'),
    h('option', { value:'it' }, '🇮🇹 Italiano'),
    h('option', { value:'fr' }, '🇫🇷 Français'),
    h('option', { value:'es' }, '🇪🇸 Español'),
    h('option', { value:'de' }, '🇩🇪 Deutsch'),
    h('option', { value:'zh' }, '🇨🇳 中文'),
    h('option', { value:'ru' }, '🇷🇺 Русский'),
  );
  sel.value = state.lang;
  sel.addEventListener('change', e => { state.lang = e.target.value; localStorage.setItem('vianaz_lang', state.lang); render(); });
  return sel;
}

// ── Navigation ───────────────────────────────
function navigate(page, section) {
  state.page = page;
  if (section) state.section = section;
  localStorage.setItem('vianaz_page', page);
  window.scrollTo(0, 0);
  render();
}

// ── Actions ──────────────────────────────────
function connectWifi() {
  const ssid = 'B&B Via Nazionale', pwd = 'BBViaNazionale!16';
  window.location.href = 'wifi:S:' + ssid + ';T:WPA;P:' + pwd + ';;';
  if (navigator.clipboard) navigator.clipboard.writeText('SSID: ' + ssid + '\nPassword: ' + pwd);
}

function doCheckout() {
  localStorage.clear();
  state.images = [];
  state.docsSent = false;
  state.docPhase = 'capture';
  state.schedine = [];
  state.ocrFields = null;
  state.ocrRaw = '';
  state.ocrError = null;
  state.ocrErrorDetail = '';
  state.showTxtPreview = false;
  navigate('home');
  alert(t().co ? t().co.btn : 'Thank you!');
}

function installApp() {
  if (state.installPrompt) {
    state.installPrompt.prompt();
    state.installPrompt.userChoice.then(() => { state.installPrompt = null; render(); });
  } else {
    state.showIOSHint = true;
    render();
  }
}

// ── File upload ──────────────────────────────
function onFiles(files) {
  Array.from(files).forEach(f => {
    const reader = new FileReader();
    reader.onload = ev => {
      state.images.push(ev.target.result);
      localStorage.setItem('vianaz_images', JSON.stringify(state.images));
      render();
    };
    reader.readAsDataURL(f);
  });
}

function removeImage(i) {
  state.images.splice(i, 1);
  localStorage.setItem('vianaz_images', JSON.stringify(state.images));
  if (state.images.length === 0) { state.docPhase = 'capture'; state.ocrFields = null; }
  render();
}

// ── Render helpers ───────────────────────────
function renderOfflineBar() {
  if (state.isOnline) return null;
  return h('div', { className: 'offline-bar' }, ms('wifi_off', false), ' ', (t().offline || 'You are offline.'));
}

function renderInstallBanner() {
  if (state.installDismissed) return null;
  const banner = h('div', { className: 'install-banner' },
    h('div', { className: 'install-banner-icon' }, ms('install_mobile')),
    h('div', { className: 'install-banner-text' },
      h('div', { className: 'install-banner-title' }, t().install.title),
      h('div', { className: 'install-banner-sub' }, t().install.sub),
    ),
    h('button', { className: 'install-banner-btn', onClick: installApp }, t().install.btn),
    h('button', { className: 'install-banner-close', onClick: () => { state.installDismissed = true; render(); } }, ms('close', true)),
  );
  return banner;
}

function renderSidebar() {
  if (state.page !== 'dashboard' && state.page !== 'section') return null;
  const items = menuItems();
  return h('aside', { className: 'sidebar' },
    h('div', { className: 'sidebar-header' },
      h('div', { className: 'sidebar-logo' }, 'Via Nazionale'),
      h('div', { className: 'sidebar-sub' }, 'Guest Companion · San Filippo del Mela'),
      h('div', { className: 'sidebar-lang' }, langSelect()),
    ),
    h('nav', { className: 'sidebar-nav' },
      ...items.map(item => {
        const btn = h('button', {
          className: 'sidebar-item' + (state.page === 'section' && state.section === item.id ? ' active' : ''),
          onClick: () => navigate('section', item.id)
        },
          h('div', { className: 'sidebar-item-icon', style: { background: item.color } }, ms(item.icon)),
          h('span', { className: 'sidebar-item-label' }, item.label),
        );
        return btn;
      })
    ),
    h('div', { className: 'sidebar-footer' }, 'Via Nazionale · Via Archi Nazionale 16, San Filippo del Mela (ME)'),
  );
}

// ── Page renders ─────────────────────────────
function renderHome() {
  const tr = t();
  const wrap = h('div', { className: 'page' },
    h('div', { className: 'toolbar toolbar-home' },
      h('div', { className: 'toolbar-row' },
        h('div', {},
          h('div', { className: 'toolbar-title' }, 'Via Nazionale'),
          h('div', { className: 'toolbar-subtitle' }, 'Guest Companion · San Filippo del Mela'),
        ),
        langSelect(),
      )
    ),
    h('div', { className: 'home-content', style: (!state.installDismissed ? 'padding-bottom:100px' : '') },
      h('div', { className: 'home-greeting' }, tr.home.greeting),
      h('div', { className: 'home-sub' }, tr.home.sub),
      h('div', { className: 'checkin-card' },
        h('button', { className: 'checkin-option', onClick: openSchedineFlow },
          h('div', { className: 'checkin-icon', style: { background: '#8a1f1f' } }, ms('upload_file')),
          h('div', { className: 'checkin-text' },
            h('div', { className: 'checkin-title' }, tr.home.checkinNew),
            h('div', { className: 'checkin-desc' }, tr.home.checkinNewDesc),
          ),
          ms('chevron_right', true),
        ),
        h('button', { className: 'checkin-option', onClick: () => navigate('dashboard') },
          h('div', { className: 'checkin-icon', style: { background: '#0284c7' } }, ms('login')),
          h('div', { className: 'checkin-text' },
            h('div', { className: 'checkin-title' }, tr.home.checkinDone),
            h('div', { className: 'checkin-desc' }, tr.home.checkinDoneDesc),
          ),
          ms('chevron_right', true),
        ),
      ),
      state.showIOSHint ? h('div', { style: 'margin-top:16px;background:var(--surface);border-radius:var(--r-md);padding:16px;box-shadow:var(--shadow-xs)' },
        h('div', { style: 'font-size:14px;font-weight:700;color:var(--text-1);margin-bottom:10px;display:flex;align-items:center;gap:8px' },
          ms('install_mobile'), ' ', tr.install.title,
        ),
        h('div', { style: 'font-size:13px;color:var(--text-2);line-height:1.6' },
          tr.install.iosStep1, h('br', {}), tr.install.iosStep2,
        ),
        h('button', { onClick: () => { state.showIOSHint = false; render(); }, style: 'margin-top:12px;background:var(--bg);border:none;border-radius:var(--r-sm);padding:8px 14px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;color:var(--text-2)' }, tr.install.dismiss),
      ) : null,
    ),
    renderInstallBanner(),
  );
  return wrap;
}

function renderCaptureStep(tr) {
  const fileInput = h('input', { type: 'file', accept: 'image/*', multiple: '' });
  fileInput.style.display = 'none';
  fileInput.addEventListener('change', e => onFiles(e.target.files));

  const previews = state.images.length ? h('div', { className: 'preview-grid' },
    ...state.images.map((img, i) =>
      h('div', { className: 'preview-item' },
        h('img', { src: img, alt: 'doc ' + i }),
        h('div', { className: 'preview-item-footer' },
          h('button', { className: 'preview-remove', onClick: () => removeImage(i) }, tr.upload.remove),
        ),
      )
    )
  ) : null;

  const disclaimerNote = h('div', { className: 'disclaimer-note' },
    h('span', {}, tr.upload.disclaimerShort),
    h('button', { className: 'disclaimer-link', onClick: openDisclaimer }, tr.upload.disclaimerLinkText),
  );

  const ocrBtn = state.images.length ? h('button', {
    className: 'btn-wa', style: 'border:none;cursor:pointer;width:100%;', onClick: runOCR,
  }, ms('document_scanner'), ' ', tr.upload.ocrButton) : null;

  const manualBtn = h('button', {
    className: 'btn-secondary', onClick: startManualEntry,
  }, ms('edit_note'), ' ', tr.upload.manualEntryBtn);

  const backToList = state.schedine.length ? h('button', {
    className: 'btn-link', onClick: () => { state.docPhase = 'list'; render(); },
  }, tr.upload.backToList) : null;

  return [
    disclaimerNote,
    h('div', { className: 'upload-drop', onClick: () => fileInput.click() },
      h('span', { className: 'upload-drop-icon' }, '📸'),
      h('div', { className: 'upload-drop-text' }, tr.upload.dropText),
      h('div', { className: 'upload-drop-sub' }, tr.upload.dropSub),
      fileInput,
    ),
    previews,
    ocrBtn,
    manualBtn,
    backToList,
  ];
}

// Avvia una schedina vuota da compilare interamente a mano, senza foto né OCR: nessuna
// immagine viene inviata a Google Vision in questo percorso.
function startManualEntry() {
  state.ocrFields = emptyGuestDraft();
  state.ocrError = null;
  state.ocrErrorDetail = '';
  state.docPhase = 'review';
  render();
}

// Apre la pagina informativa completa, ricordando da dove si è arrivati per il tasto "indietro".
function openDisclaimer() {
  state.disclaimerReturnPhase = state.docPhase;
  state.docPhase = 'disclaimer';
  render();
}

function renderDisclaimerStep(tr) {
  const d = tr.upload.disclaimer;
  return [
    h('h2', { className: 'section-h2' }, d.title),
    h('div', { className: 'disclaimer-body' },
      ...d.paragraphs.map(p => h('p', {}, p)),
    ),
    h('button', {
      className: 'btn-wa', style: 'border:none;cursor:pointer;width:100%;',
      onClick: startManualEntry,
    }, ms('edit_note'), ' ', tr.upload.manualEntryBtn),
    h('button', {
      className: 'btn-link',
      onClick: () => { state.docPhase = state.disclaimerReturnPhase || 'capture'; render(); },
    }, tr.upload.disclaimerBack),
  ];
}

function renderProcessingStep(tr) {
  return [
    h('div', { className: 'ocr-processing' },
      h('div', { className: 'ocr-spinner' }),
      h('div', {}, tr.upload.ocrProcessing),
    ),
  ];
}

// ── Campi del form di revisione ospite ──
function guestField(tr, path, label, opts) {
  opts = opts || {};
  const [group, key] = path.split('.');
  const attrs = {
    className: 'field-input', type: opts.type || 'text',
    placeholder: opts.placeholder || '',
    value: (state.ocrFields && state.ocrFields[group] && state.ocrFields[group][key]) || '',
  };
  if (opts.list) attrs.list = opts.list;
  const input = h('input', attrs);
  input.addEventListener('input', e => updateGuestField(path, e.target.value));
  return h('div', { className: 'field-group' },
    h('label', { className: 'field-label' }, label),
    input,
    opts.hint ? h('div', { className: 'field-hint' }, opts.hint) : null,
  );
}

function guestSelect(tr, path, label, options) {
  const [group, key] = path.split('.');
  const select = h('select', { className: 'field-input' },
    ...options.map(o => h('option', { value: o.value }, o.label))
  );
  select.value = (state.ocrFields && state.ocrFields[group] && state.ocrFields[group][key]) || '';
  select.addEventListener('change', e => { updateGuestField(path, e.target.value); render(); });
  return h('div', { className: 'field-group' },
    h('label', { className: 'field-label' }, label),
    select,
  );
}

// Restituisce la data (gg/mm/aaaa) a "offset" giorni da oggi (0 = oggi, -1 = ieri, +1 = domani...).
function dateFromOffset(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
}

// Data di arrivo: solo oggi o ieri, mai altre date.
function arrivalDateField(tr) {
  const options = [
    { value: dateFromOffset(-1), label: dateFromOffset(-1) + ' — ' + tr.upload.yesterday },
    { value: dateFromOffset(0), label: dateFromOffset(0) + ' — ' + tr.upload.today },
  ];
  const current = (state.ocrFields && state.ocrFields.stay.arrivalDate) || '';
  const select = h('select', { className: 'field-input' },
    ...options.map(o => h('option', { value: o.value }, o.label))
  );
  select.value = options.some(o => o.value === current) ? current : dateFromOffset(0);
  select.addEventListener('change', e => {
    updateGuestField('stay.arrivalDate', e.target.value);
    // Se la partenza coincide ora con l'arrivo appena scelto, la spostiamo al giorno dopo.
    const dep = state.ocrFields.stay.departureDate;
    if (dep === e.target.value) updateGuestField('stay.departureDate', dateFromOffset(1));
    render();
  });
  return h('div', { className: 'field-group' },
    h('label', { className: 'field-label' }, tr.upload.fDataArrivo),
    select,
  );
}

// Data di partenza: da oggi fino a 30 giorni avanti, mai uguale alla data di arrivo scelta.
function departureDateField(tr) {
  const arrival = (state.ocrFields && state.ocrFields.stay.arrivalDate) || dateFromOffset(0);
  const options = [];
  for (let i = 0; i <= 30; i++) {
    const value = dateFromOffset(i);
    if (value === arrival) continue;
    const suffix = i === 0 ? ' — ' + tr.upload.today : i === 1 ? ' — ' + tr.upload.tomorrow : '';
    options.push({ value, label: value + suffix });
  }
  const current = (state.ocrFields && state.ocrFields.stay.departureDate) || '';
  const select = h('select', { className: 'field-input' },
    ...options.map(o => h('option', { value: o.value }, o.label))
  );
  select.value = options.some(o => o.value === current) ? current : options[0].value;
  select.addEventListener('change', e => { updateGuestField('stay.departureDate', e.target.value); render(); });
  return h('div', { className: 'field-group' },
    h('label', { className: 'field-label' }, tr.upload.fDataPartenza),
    select,
  );
}

function renderReviewStep(tr) {
  const errorNote = state.ocrError === 'vision_failed'
    ? h('div', { className: 'ocr-error-note' }, tr.upload.ocrErrorMsg)
    : null;
  const techDetail = state.ocrErrorDetail ? h('details', { className: 'tech-detail' },
    h('summary', {}, tr.upload.techDetailsToggle),
    h('div', { className: 'tech-detail-body' }, state.ocrErrorDetail),
  ) : null;

  const confidence = state.ocrFields && state.ocrFields.document ? state.ocrFields.document.ocrConfidence : null;
  const confidenceNote = (typeof confidence === 'number') ? h('div', { className: 'field-hint' },
    tr.upload.ocrConfidenceLabel + ': ' + Math.round(confidence * 100) + '%'
  ) : null;

  return [
    h('h2', { className: 'section-h2' }, tr.upload.reviewTitle),
    h('div', { className: 'field-sub' }, tr.upload.reviewSub),
    errorNote,
    techDetail,

    h('div', { className: 'field-section-title' }, tr.upload.sectionStay),
    arrivalDateField(tr),
    departureDateField(tr),
    guestSelect(tr, 'stay.guestType', tr.upload.fTipoAlloggiato, GUEST_TYPE_OPTIONS.map(v => ({ value: v, label: v }))),

    h('div', { className: 'field-section-title' }, tr.upload.sectionAnagrafica),
    guestField(tr, 'personal.lastName', tr.upload.fSurname),
    guestField(tr, 'personal.firstName', tr.upload.fGivenNames),
    guestSelect(tr, 'personal.gender', tr.upload.fSesso, [{ value: '', label: '—' }, { value: 'M', label: 'M' }, { value: 'F', label: 'F' }]),
    guestField(tr, 'personal.birthDate', tr.upload.fDob, { placeholder: 'gg/mm/aaaa' }),

    h('div', { className: 'field-section-title' }, tr.upload.sectionNascita),
    guestField(tr, 'personal.birthPlace', tr.upload.fComuneNascita),
    guestField(tr, 'personal.birthProvince', tr.upload.fProvinciaNascita, { placeholder: 'es. ME' }),
    guestSelect(tr, 'personal.birthCountry', tr.upload.fStatoNascita, [{ value: '', label: '—' }, ...STATI_LIST.map(v => ({ value: v, label: v }))]),
    guestSelect(tr, 'personal.nationality', tr.upload.fCittadinanza, [{ value: '', label: '—' }, ...STATI_LIST.map(v => ({ value: v, label: v }))]),

    h('div', { className: 'field-section-title' }, tr.upload.sectionDocumento),
    guestSelect(tr, 'document.type', tr.upload.fDocType, [{ value: '', label: '—' }, ...DOCUMENTI_LIST.map(v => ({ value: v, label: v }))]),
    guestField(tr, 'document.number', tr.upload.fNumber),
    guestField(tr, 'document.issuePlace', tr.upload.fLuogoRilascio),
    confidenceNote,

    h('button', { className: 'btn-wa', style: 'border:none;cursor:pointer;width:100%;', onClick: addGuestToList },
      ms('person_add'), ' ', tr.upload.confirmAdd),
    h('button', { className: 'btn-link', onClick: () => { state.docPhase = 'capture'; render(); } }, tr.upload.backToPhotos),
  ];
}

function renderGuestListStep(tr) {
  const rows = state.schedine.map(g => h('div', { className: 'guest-row' },
    h('div', { className: 'guest-row-info' },
      h('div', { className: 'guest-row-name' }, (g.personal.lastName || '—') + ' ' + (g.personal.firstName || '')),
      h('div', { className: 'guest-row-sub' }, g.stay.arrivalDate + ' → ' + g.stay.departureDate + ' · ' + g.stay.guestType),
    ),
    h('div', { className: 'guest-row-actions' },
      h('button', { className: 'guest-row-btn', onClick: () => editGuestFromList(g.id) }, ms('edit')),
      h('button', { className: 'guest-row-btn guest-row-btn-danger', onClick: () => removeGuestFromList(g.id) }, ms('delete')),
    ),
  ));

  const preview = state.showTxtPreview ? h('pre', { className: 'txt-preview' }, JSON.stringify(buildExportJson(), null, 2)) : null;

  let sendSection = null;
  if (state.schedine.length) {
    if (state.sendStatus === 'sending') {
      sendSection = h('div', { className: 'ocr-processing', style: 'padding:24px 20px;' },
        h('div', { className: 'ocr-spinner' }), h('div', {}, tr.upload.sending));
    } else {
      // Il pulsante di invio resta sempre disponibile, anche dopo un invio riuscito:
      // l'ospite potrebbe dover mandare altri documenti nella stessa pratica, oppure
      // essersi accorto di un errore nell'invio precedente e voler reinviare.
      sendSection = h('div', {},
        state.sendStatus === 'sent' ? h('div', { className: 'sent-badge' }, ms('check_circle'), ' ', tr.upload.sentAutomatically) : null,
        state.sendStatus === 'error' ? h('div', { className: 'ocr-error-note' }, tr.upload.sendErrorMsg) : null,
        state.sendErrorDetail ? h('details', { className: 'tech-detail' },
          h('summary', {}, tr.upload.techDetailsToggle),
          h('div', { className: 'tech-detail-body' }, state.sendErrorDetail),
        ) : null,
        h('button', { className: 'btn-wa', style: 'border:none;cursor:pointer;width:100%;', onClick: sendAutomatically },
          ms('forward_to_inbox'), ' ', tr.upload.sendAutoBtn),
        h('button', { className: 'btn-primary', style: 'background:var(--surface);color:var(--text-1);box-shadow:var(--shadow-xs);', onClick: downloadOnly },
          ms('download'), ' ', tr.upload.downloadBtn),
      );
    }
  }

  return [
    h('h2', { className: 'section-h2' }, tr.upload.listTitle),
    state.schedine.length ? h('div', { className: 'guest-list' }, ...rows)
      : h('div', { className: 'field-sub' }, tr.upload.listEmpty),
    h('button', { className: 'btn-primary', style: 'background:var(--surface);color:var(--text-1);box-shadow:var(--shadow-xs);', onClick: () => { state.docPhase = 'capture'; render(); } },
      ms('add_a_photo'), ' ', tr.upload.addGuestBtn),
    sendSection,
    state.schedine.length ? h('button', { className: 'btn-link', onClick: () => { state.showTxtPreview = !state.showTxtPreview; render(); } },
      state.showTxtPreview ? tr.upload.hidePreview : tr.upload.showPreview) : null,
    preview,
    h('button', { className: 'btn-primary', onClick: () => navigate('dashboard') },
      ms('arrow_forward'), ' ', tr.upload.continue,
    ),
  ];
}

function renderUpload() {
  const tr = t();
  let body;
  if (state.docPhase === 'processing') body = renderProcessingStep(tr);
  else if (state.docPhase === 'review') body = renderReviewStep(tr);
  else if (state.docPhase === 'list') body = renderGuestListStep(tr);
  else if (state.docPhase === 'disclaimer') body = renderDisclaimerStep(tr);
  else body = renderCaptureStep(tr);

  return h('div', { className: 'page' },
    h('div', { className: 'toolbar toolbar-section' },
      h('button', { className: 'back-btn', onClick: () => navigate('home') }, ms('chevron_left', true), ' ', tr.back),
      langSelect(),
    ),
    h('div', { className: 'upload-page' },
      state.docPhase === 'capture' ? h('h2', { className: 'section-h2' }, tr.upload.title) : null,
      ...body,
    ),
  );
}

// Punto d'ingresso dal menu: se c'è già una pratica in corso mostra la lista,
// altrimenti riparte dall'acquisizione foto.
function openSchedineFlow() {
  state.docPhase = state.schedine.length > 0 ? 'list' : 'capture';
  navigate('upload');
}

function renderDashboard() {
  const tr = t();
  const items = menuItems();
  return h('div', { className: 'page' },
    h('div', { className: 'toolbar toolbar-home', style: 'padding:50px 18px 22px' },
      h('div', { className: 'toolbar-row' },
        h('div', {},
          h('div', { className: 'toolbar-title' }, tr.dash.welcome),
          h('div', { className: 'toolbar-subtitle' }, tr.dash.sub),
        ),
        langSelect(),
      )
    ),
    h('div', { className: 'dashboard' },
      h('div', { className: 'menu' },
        ...items.map((item, i) =>
          h('button', {
            className: 'card',
            style: { '--i': i },
            onClick: () => item.external ? openSchedineFlow() : navigate('section', item.id),
          },
            h('div', { className: 'card-icon', style: { background: item.color } }, ms(item.icon)),
            h('div', { className: 'card-text' },
              h('div', { className: 'card-title' }, item.label),
              h('div', { className: 'card-sub' }, item.sub),
            ),
            h('div', { className: 'card-arrow' }, ms('chevron_right', true)),
          )
        )
      )
    ),
  );
}


// ── Event group helper ───────────────────────
function renderEventGroup(g, dimmed) {
  var cards = g.events.map(function(e) {
    var card = document.createElement('div');
    card.className = 'event-card';
    if (dimmed) card.style.opacity = '0.52';

    var dateEl = document.createElement('div');
    dateEl.className = 'event-date';
    var dayEl = document.createElement('div');
    dayEl.className = 'event-day';
    dayEl.textContent = e.day;
    var monEl = document.createElement('div');
    monEl.className = 'event-mon';
    monEl.textContent = e.monShort;
    dateEl.appendChild(dayEl);
    dateEl.appendChild(monEl);

    var infoEl = document.createElement('div');
    infoEl.className = 'event-info';
    var titleEl = document.createElement('div');
    titleEl.className = 'event-title';
    titleEl.textContent = e.emoji + ' ' + e.title;
    var descEl = document.createElement('div');
    descEl.className = 'event-desc';
    descEl.textContent = e.desc;
    infoEl.appendChild(titleEl);
    infoEl.appendChild(descEl);

    card.appendChild(dateEl);
    card.appendChild(infoEl);
    return card;
  });

  var wrap = document.createElement('div');
  wrap.className = 'month-group';
  var label = document.createElement('div');
  label.className = 'month-label';
  label.textContent = g.monthName;
  wrap.appendChild(label);
  cards.forEach(function(c) { wrap.appendChild(c); });
  return wrap;
}

function renderSectionContent() {
  const tr = t();
  const s = state.section;

  if (s === 'info') {
    return h('div', { className: 'section-body' },
      h('h2', { className: 'section-h2' }, tr.tabs.info),
      h('div', { className: 'wifi-card' },
        h('div', { className: 'wifi-kicker' }, 'WiFi'),
        h('div', { className: 'wifi-field' }, h('div', { className: 'wifi-field-label' }, 'Network'), h('div', { className: 'wifi-field-value' }, 'B&B Via Nazionale')),
        h('div', { className: 'wifi-field' }, h('div', { className: 'wifi-field-label' }, 'Password'), h('div', { className: 'wifi-field-value' }, 'BBViaNazionale!16')),
        h('button', { className: 'wifi-btn', onClick: connectWifi }, ms('wifi'), ' ', tr.info.wifiConnect),
      ),
      h('div', { className: 'section-group' },
        h('div', { className: 'section-group-label' }, tr.info.general),
        h('div', { className: 'section-row' },
          h('div', { className: 'row-icon', style: { background: '#8a1f1f' } }, ms('schedule')),
          h('div', {}, h('div', { className: 'row-label' }, 'Check-in'), h('div', { className: 'row-value' }, tr.info.checkin)),
        ),
        h('div', { className: 'section-row' },
          h('div', { className: 'row-icon', style: { background: '#0284c7' } }, ms('logout')),
          h('div', {}, h('div', { className: 'row-label' }, 'Check-out'), h('div', { className: 'row-value' }, tr.info.checkout)),
        ),
        h('div', { className: 'section-row' },
          h('div', { className: 'row-icon', style: { background: '#7c3aed' } }, ms('location_on')),
          h('div', {}, h('div', { className: 'row-label' }, tr.info.address), h('div', { className: 'row-value' }, 'Via Archi Nazionale 16, San Filippo del Mela (ME)')),
        ),
      ),
      h('div', { className: 'section-label' }, tr.info.contacts),
      h('div', { className: 'contact-list' },
        h('a', { className: 'contact-btn', href: 'tel:+393339201524' },
          h('div', { className: 'contact-btn-icon', style: { background: '#16a34a' } }, ms('call')),
          h('div', {}, h('div', { className: 'contact-btn-label' }, tr.info.phone), h('div', { className: 'contact-btn-value' }, '+39 333 920 1524')),
          ms('chevron_right', true),
        ),
        h('a', { className: 'contact-btn', href: 'mailto:DA_COMPLETARE@example.com' },
          h('div', { className: 'contact-btn-icon', style: { background: '#0284c7' } }, ms('mail')),
          h('div', {}, h('div', { className: 'contact-btn-label' }, 'Email'), h('div', { className: 'contact-btn-value' }, 'DA_COMPLETARE@example.com')),
          ms('chevron_right', true),
        ),
        h('a', { className: 'contact-btn', href: 'https://wa.me/393339201524', target: '_blank' },
          h('div', { className: 'contact-btn-icon', style: { background: '#25d366' } }, ms('chat')),
          h('div', {}, h('div', { className: 'contact-btn-label' }, 'WhatsApp'), h('div', { className: 'contact-btn-value' }, tr.info.whatsapp)),
          ms('chevron_right', true),
        ),
      ),
    );
  }

  if (s === 'philosophy') {
    return h('div', { className: 'section-body' },
      h('h2', { className: 'section-h2' }, tr.tabs.philosophy),
      h('div', { className: 'prose' }, ...tr.philosophy.map(para => h('p', {}, para))),
    );
  }

  if (s === 'directions') {
    return h('div', { className: 'section-body' },
      h('h2', { className: 'section-h2' }, tr.tabs.directions),
      h('div', { className: 'section-label' }, tr.dir.arriving),
      ...tr.dir.arrivalModes.map(d =>
        h('div', { className: 'dir-card' },
          h('div', { className: 'dir-card-head' },
            h('div', { className: 'dir-card-icon', style: { background: d.color } }, ms(d.icon)),
            h('div', { className: 'dir-card-title' }, d.title),
          ),
          h('div', { className: 'dir-card-body' }, d.desc),
        )
      ),
      h('div', { className: 'section-label', style: 'margin-top:22px' }, tr.dir.leaving),
      ...tr.dir.departureModes.map(d =>
        h('div', { className: 'dir-card' },
          h('div', { className: 'dir-card-head' },
            h('div', { className: 'dir-card-icon', style: { background: d.color } }, ms(d.icon)),
            h('div', { className: 'dir-card-title' }, d.title),
          ),
          h('div', { className: 'dir-card-body' }, d.desc),
        )
      ),
    );
  }

  if (s === 'map') {
    return h('div', { className: 'section-body', style: 'padding:18px 15px 0' },
      h('h2', { className: 'section-h2' }, tr.tabs.map),
      h('div', { className: 'map-card' },
        h('div', { className: 'map-card-head' },
          h('div', { className: 'map-card-title' }, tr.map.title),
          h('div', { className: 'map-card-desc' }, tr.map.desc),
        ),
        h('iframe', { className: 'map-iframe', src: 'https://www.google.com/maps/d/embed?mid=15vrvCbCRnWxkxZrUN1FkFf96XWx7sUyc&hl=it&ehbc=2E312F', allowfullscreen: '', loading: 'lazy' }),
        h('div', { className: 'map-card-foot' },
          h('a', { className: 'map-btn', href: 'https://www.google.com/maps/place/Via+San+Giovanni,+42+Milazzo', target: '_blank', style: 'background:var(--toolbar)' },
            ms('open_in_new'), ' ', tr.map.openMaps,
          ),
        ),
      ),
    );
  }

  if (s === 'breakfast') {
    return h('div', { className: 'section-body' },
      h('h2', { className: 'section-h2' }, tr.tabs.breakfast),
      h('p', { style: 'font-size:14px;color:var(--text-3);margin-bottom:20px;line-height:1.6' }, tr.itinerary.desc),
      h('a', { className: 'itinerary-cta', href: 'https://esploramilazzo.netlify.app/', target: '_blank' },
        ms('explore'), ' ', tr.itinerary.btn,
      ),
    );
  }

  if (s === 'bookServices') {
    return h('div', { className: 'section-body' },
      h('h2', { className: 'section-h2' }, tr.tabs.bookServices),
      ...tr.services.map(svc =>
        h('div', { className: 'service-card' },
          h('div', { className: 'service-card-top' },
            h('div', { className: 'service-emoji' }, svc.emoji),
            h('div', {},
              h('div', { className: 'service-title' }, svc.title),
              h('div', { className: 'service-price' }, svc.price),
              h('div', { className: 'service-note' }, svc.note),
            ),
          ),
          h('a', {
            className: 'service-wa',
            href: 'https://wa.me/393339201524?text=' + encodeURIComponent(svc.waText),
            target: '_blank',
          }, ms('chat'), ' ', tr.bookWa),
        )
      ),
    );
  }

  if (s === 'events') {
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var pastEvs   = EVENTS.filter(function(e) { return new Date(e.year, e.month - 1, e.day) < today; });
    var futureEvs = EVENTS.filter(function(e) { return new Date(e.year, e.month - 1, e.day) >= today; });
    var gPast   = groupEvents(pastEvs,   false);
    var gFuture = groupEvents(futureEvs, true);

    var page = document.createElement('div');
    page.className = 'section-body';

    // Titolo
    var h2 = document.createElement('h2');
    h2.className = 'section-h2';
    h2.textContent = tr.tabs.events;
    page.appendChild(h2);

    // Data di oggi
    var dateLabel = document.createElement('p');
    dateLabel.style.cssText = 'font-size:13px;color:var(--text-3);font-style:italic;margin-bottom:4px';
    dateLabel.textContent = todayLabel();
    page.appendChild(dateLabel);

    // Descrizione
    var desc = document.createElement('p');
    desc.style.cssText = 'font-size:14px;color:var(--text-3);margin-bottom:14px;line-height:1.6';
    desc.textContent = tr.events.desc;
    page.appendChild(desc);

    // ── Toggle eventi passati IN CIMA (prima degli upcoming) ──
    if (pastEvs.length > 0) {
      var pastSection = document.createElement('div');
      pastSection.style.marginBottom = '18px';

      var toggleBtn = document.createElement('button');
      toggleBtn.className = 'past-toggle';
      toggleBtn.innerHTML = (state.showPast ? '🙈' : '📅') + ' ' +
        (state.showPast ? tr.events.hidePast : tr.events.showPast + ' (' + pastEvs.length + ')');
      toggleBtn.addEventListener('click', function() {
        state.showPast = !state.showPast;
        render();
      });
      pastSection.appendChild(toggleBtn);

      if (state.showPast) {
        var hr = document.createElement('hr');
        hr.className = 'past-divider';
        hr.style.marginTop = '12px';
        pastSection.appendChild(hr);
        gPast.forEach(function(g) {
          pastSection.appendChild(renderEventGroup(g, true));
        });
        var hr2 = document.createElement('hr');
        hr2.className = 'past-divider';
        hr2.style.marginBottom = '8px';
        pastSection.appendChild(hr2);
      }

      page.appendChild(pastSection);
    }

    // ── Eventi futuri ──
    if (futureEvs.length > 0) {
      gFuture.forEach(function(g) {
        page.appendChild(renderEventGroup(g, false));
      });
    } else {
      var noEvt = document.createElement('p');
      noEvt.style.cssText = 'font-size:15px;color:var(--text-3);text-align:center;margin-top:32px';
      noEvt.textContent = tr.events.noUpcoming;
      page.appendChild(noEvt);
    }

    return page;
  }

  if (s === 'museums') {
    const lang = state.lang;
    const catNames = PLACES.cats[lang] || PLACES.cats.en;
    const L = (obj) => obj[lang] || obj.it || obj.en || '';
    const freeNote = { en:'Free entry every first Sunday of the month (national museums).', it:'Ingresso gratuito ogni prima domenica del mese (musei statali).', fr:'Entrée gratuite le premier dimanche du mois (musées nationaux).', es:'Entrada gratuita el primer domingo de mes (museos nacionales).', de:'Erster Sonntag im Monat kostenlos (nationale Museen).', zh:'每月第一个周日国家博物馆免费开放。', ru:'Besplatno pervoe voskresen e kazhdogo mesyatsa (gosudarstvennye muzei).' };
    const catColors = ['#0284c7','#16a34a','#b45309'];
    const catIcons  = ['museum','park','location_city'];
    return h('div', { className: 'section-body' },
      h('h2', { className: 'section-h2' }, tr.tabs.museums),
      h('p', { style: 'font-size:12px;color:var(--text-3);font-style:italic;margin-bottom:20px;line-height:1.5' }, L(freeNote)),
      ...[0,1,2].map(catIdx => {
        const catItems = PLACES.items.filter(p => p.cat === catIdx);
        return h('div', { style: 'margin-bottom:28px' },
          h('div', { style: 'display:flex;align-items:center;gap:8px;margin-bottom:10px' },
            h('div', { style: 'width:28px;height:28px;border-radius:8px;background:' + catColors[catIdx] + ';display:flex;align-items:center;justify-content:center' }, ms(catIcons[catIdx])),
            h('div', { style: 'font-size:13px;font-weight:700;color:var(--text-1);text-transform:uppercase;letter-spacing:.06em' }, catNames[catIdx]),
          ),
          ...catItems.map(m =>
            h('div', { className: 'monument-card' },
              h('div', { className: 'monument-head' },
                h('div', { className: 'monument-emoji' }, m.emoji),
                h('div', {},
                  h('div', { className: 'monument-title' }, m.title),
                ),
              ),
              h('div', { className: 'monument-desc' }, L(m.descs)),
              h('a', { className: 'monument-cta', href: m.link, target: '_blank' }, ms('map'), ' ', tr.openMaps),
            )
          ),
        );
      }),
    );
  }

  if (s === 'beach') {
    return h('div', { className: 'section-body' },
      h('h2', { className: 'section-h2' }, tr.tabs.beach),
      h('p', { style: 'font-size:14px;color:var(--text-3);margin-bottom:20px;line-height:1.6' }, tr.beach.desc),
      h('a', { className: 'nav-btn', href: 'https://maps.app.goo.gl/G46mBB57DWUAXYkQ6', target: '_blank', style: 'background:linear-gradient(135deg,#0891b2,#0e7490);box-shadow:0 4px 18px rgba(8,145,178,.28)' },
        h('span', { className: 'nav-btn-icon' }, '🏖️'),
        h('div', {}, h('div', { className: 'nav-btn-title' }, tr.beach.btnTitle), h('div', { className: 'nav-btn-sub' }, tr.beach.btnSub)),
        ms('chevron_right', true),
      ),
    );
  }

  if (s === 'roomGuide') {
    return h('div', { className: 'section-body' },
      h('h2', { className: 'section-h2' }, tr.tabs.roomGuide),
      h('p', { style: 'font-size:14px;color:var(--text-3);margin-bottom:20px;line-height:1.6' }, tr.room.desc),
      h('a', { className: 'nav-btn', href: 'https://www.google.com/maps/search/?api=1&query=Via+Archi+Nazionale+16+San+Filippo+del+Mela+ME', target: '_blank', style: 'background:var(--toolbar);box-shadow:0 4px 18px rgba(138,31,31,.28)' },
        h('span', { className: 'nav-btn-icon' }, '🏠'),
        h('div', {}, h('div', { className: 'nav-btn-title' }, tr.room.btnTitle), h('div', { className: 'nav-btn-sub' }, tr.room.btnSub)),
        ms('chevron_right', true),
      ),
    );
  }

  if (s === 'checkout') {
    return h('div', { className: 'section-body' },
      h('h2', { className: 'section-h2' }, tr.tabs.checkout),
      h('p', { style: 'font-size:14px;color:var(--text-2);line-height:1.65;margin-bottom:4px' }, tr.co.desc1),
      h('div', { className: 'checkout-steps' },
        ...tr.co.steps.map((step, i) =>
          h('div', { className: 'checkout-step' },
            h('div', { className: 'step-num' }, String(i + 1)),
            h('div', { className: 'step-text' }, step),
          )
        )
      ),
      h('div', { className: 'checkout-note' }, tr.co.note),
      h('p', { style: 'font-size:14px;color:var(--text-2);line-height:1.65;margin-bottom:16px' }, tr.co.desc2),
      h('button', { className: 'btn-danger', onClick: doCheckout }, ms('logout'), ' ', tr.co.btn),
    );
  }


  if (s === 'recipes') {
    var lang = state.lang;
    var recipeList = RECIPES[lang] || RECIPES.en;
    var labelsMap = {
      intro: { en:'Fresh, simple meals. No stove, no oven needed.', it:'Piatti freschi e semplici. Senza fornelli ne forno.', fr:'Repas frais et simples. Sans cuisiniere ni four.', es:'Comidas frescas y sencillas. Sin fogones ni horno.', de:'Frische einfache Gerichte. Ohne Herd und Ofen.', zh:'新鲜简单的餐食，无需炉灶或烤箱。', ru:'Svezhie prostye blyuda. Bez plity i dukhovki.' },
      ing:   { en:'Ingredients', it:'Ingredienti', fr:'Ingredients', es:'Ingredientes', de:'Zutaten', zh:'Ingredientes', ru:'Ingredienty' },
      meth:  { en:'Method', it:'Preparazione', fr:'Preparation', es:'Preparacion', de:'Zubereitung', zh:'Metodo', ru:'Prigotovlenie' },
      serv:  { en:'servings', it:'persone', fr:'portions', es:'porciones', de:'Portionen', zh:'persone', ru:'porcii' },
    };
    var L = function(obj) { return obj[lang] || obj.en; };
    return h('div', { className: 'section-body' },
      h('h2', { className: 'section-h2' }, tr.tabs.recipes),
      h('p', { style: 'font-size:13px;color:var(--text-3);margin-bottom:20px;line-height:1.6;font-style:italic' }, L(labelsMap.intro)),
      ...recipeList.map(function(recipe) {
        return h('div', { className: 'recipe-card' },
          h('div', { className: 'recipe-card-header' },
            h('span', { className: 'recipe-emoji' }, recipe.emoji),
            h('div', { className: 'recipe-meta' },
              h('div', { className: 'recipe-title' }, recipe.title),
              h('div', { className: 'recipe-meta-row' },
                h('span', { className: 'recipe-badge recipe-badge-time' }, recipe.time),
                h('span', { className: 'recipe-badge recipe-badge-servings' }, recipe.servings + ' ' + L(labelsMap.serv)),
              ),
            ),
          ),
          h('div', { className: 'recipe-section-label' }, L(labelsMap.ing)),
          h('ul', { className: 'recipe-ingredients' },
            ...recipe.ingredients.map(function(ing) { return h('li', {}, ing); })
          ),
          h('div', { className: 'recipe-section-label' }, L(labelsMap.meth)),
          h('ol', { className: 'recipe-steps' },
            ...recipe.steps.map(function(step) { return h('li', {}, step); })
          ),
        );
      }),
    );
  }

  return h('div', { className: 'section-body' }, 'Section not found');
}

function renderSection() {
  const tr = t();
  const items = menuItems();
  const currentItem = items.find(m => m.id === state.section);
  const label = currentItem ? currentItem.label : '';

  return h('div', { className: 'page' },
    h('div', { className: 'toolbar toolbar-section' },
      h('button', { className: 'back-btn', onClick: () => navigate('dashboard') }, ms('chevron_left', true), ' ', tr.back),
      langSelect(),
    ),
    h('div', { className: 'tablet-topbar', style: 'display:none' },
      h('div', { className: 'tablet-topbar-title' }, label),
    ),
    renderSectionContent(),
  );
}

// ── Main render ──────────────────────────────
function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const offlineBar = renderOfflineBar();
  if (offlineBar) app.appendChild(offlineBar);

  const sidebar = renderSidebar();
  if (sidebar) app.appendChild(sidebar);

  const mainWrapper = (state.page === 'dashboard' || state.page === 'section')
    ? h('div', { className: 'main-content' })
    : h('div', {});

  let pageContent;
  if (state.page === 'home') pageContent = renderHome();
  else if (state.page === 'upload') pageContent = renderUpload();
  else if (state.page === 'dashboard') pageContent = renderDashboard();
  else if (state.page === 'section') pageContent = renderSection();

  if (pageContent) mainWrapper.appendChild(pageContent);
  app.appendChild(mainWrapper);
}

// ── Bootstrap ────────────────────────────────
window.addEventListener('online',  () => { state.isOnline = true; render(); });
window.addEventListener('offline', () => { state.isOnline = false; render(); });
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  state.installPrompt = e;
  render();
});

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
if (isIOS && !isStandalone && !localStorage.getItem('vianaz_ios_hint_shown')) {
  state.showIOSHint = true;
  localStorage.setItem('vianaz_ios_hint_shown', '1');
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').catch(() => {});
}

render();
