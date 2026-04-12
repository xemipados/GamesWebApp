/* =============================================
   PARTY GAMES — games-registry.js
   
   ✏️  QUI puoi:
     - Aggiungere domande / prompt
     - Aggiungere categorie
     - Aggiungere nuovi giochi (vedi istruzioni in fondo)
   ============================================= */


/* ─────────────────────────────────────────────
   QUIZ — domande per categoria
   Aggiungi domande aggiungendo stringhe all'array.
   ───────────────────────────────────────────── */
const QUIZ_CATEGORIES = {

  "Generale": [
    "Quanti pianeti ha il sistema solare?",
    "Qual è la capitale dell'Australia?",
    "Chi ha scritto la Divina Commedia?",
    "In che anno è caduto il Muro di Berlino?",
    "Qual è l'oceano più grande del mondo?",
    "Quanti giorni ha un anno bisestile?",
    "Qual è il simbolo chimico dell'oro?",
    "Quanti lati ha un esagono?",
    "Qual è il paese più grande del mondo per superficie?",
    "Qual è l'animale terrestre più veloce?"
  ],

  "Cultura": [
    "Chi ha dipinto la Cappella Sistina?",
    "In quale paese è nata la pizza?",
    "Chi ha scritto Romeo e Giulietta?",
    "Qual è lo strumento simbolo del jazz?",
    "In quale città si trova il Colosseo?",
    "Chi ha composto la Quinta Sinfonia?",
    "In quale museo si trova la Gioconda?",
    "Qual è il romanzo più venduto di tutti i tempi?"
  ],

  "Cinema": [
    "Chi ha diretto Schindler's List?",
    "Quale film ha vinto l'Oscar 2020 come miglior film?",
    "In quale film appare la frase 'Io sono tuo padre'?",
    "Chi interpreta James Bond per la prima volta al cinema?",
    "Qual è il film d'animazione Disney del 1994 con un leone protagonista?",
    "In quale anno è uscito il primo film di Harry Potter?"
  ],

  "Scienza": [
    "Qual è l'elemento più abbondante nell'universo?",
    "Quante ossa ha il corpo umano adulto?",
    "Cosa studia la sismologia?",
    "Qual è la velocità della luce nel vuoto?",
    "Chi ha formulato la teoria della relatività?",
    "Qual è il pianeta più vicino al Sole?",
    "Come si chiama il processo con cui le piante producono energia?"
  ]

};


/* ─────────────────────────────────────────────
   PAROLE — prompt per modalità
   ───────────────────────────────────────────── */
const WORDS_CATEGORIES = {

  "Taboo": [
    "Fai indovinare 'MARE' senza dire: acqua, spiaggia, sole, pesce, onda",
    "Fai indovinare 'PIZZA' senza dire: forno, mozzarella, pomodoro, tonda, italiana",
    "Fai indovinare 'COMPUTER' senza dire: schermo, tastiera, internet, digitale, tecnologia",
    "Fai indovinare 'FORESTA' senza dire: alberi, verde, animali, natura, bosco",
    "Fai indovinare 'LUNA' senza dire: notte, stelle, spazio, rotonda, cielo",
    "Fai indovinare 'TRENO' senza dire: rotaie, vagone, viaggio, veloce, stazione",
    "Fai indovinare 'GATTO' senza dire: pelo, zampe, miao, animale, domestico"
  ],

  "Descrivi": [
    "Descrivi come ti sentiresti dentro una lavatrice in funzione",
    "Descrivi il colore rosso a qualcuno che non ha mai visto",
    "Descrivi il profumo della pioggia usando solo metafore culinarie",
    "Descrivi come cammina un pinguino senza fare nessun gesto",
    "Descrivi il silenzio usando solo parole che evocano suoni",
    "Descrivi il sapore del limone come se fosse una persona",
    "Descrivi il lunedì mattina come se fosse un film horror"
  ],

  "Storia collettiva": [
    "Inizia una storia con: 'Quella mattina il postino portò una busta nera...'",
    "Inizia una storia con: 'Nessuno sapeva che sotto la pizzeria c'era...'",
    "Inizia una storia con: 'Il semaforo era verde da tre giorni di fila...'",
    "Inizia una storia con: 'La nonna aprì il cassetto e trovò...'",
    "Inizia una storia con: 'L'ultimo autobus era partito, ma lei non era sola...'",
    "Inizia una storia con: 'La mappa era sbagliata. O forse no...'"
  ]

};


/* ─────────────────────────────────────────────
   REGISTRO GIOCHI — card nella home
   Per aggiungere un nuovo gioco:
   1. Aggiungi un oggetto qui sotto
   2. Crea il file games/nomefile.js
   3. Aggiungi <script src="games/nomefile.js"> in index.html
   ───────────────────────────────────────────── */
const GAMES_REGISTRY = [
  {
    id: "words",
    icon: "🚫",
    title: "Taboo",
    description: "Parola da indovinare con parole proibite",
    screen: "words"
  },
  {
    id: "alphabet",           
    icon: "🔤",
    title: "Alfabeto",
    description: "Una parola per lettera, prima che scada il timer",
    screen: "alphabet"
  }
  // Aggiungi altri giochi qui...
];
