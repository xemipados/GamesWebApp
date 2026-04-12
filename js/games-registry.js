/* =============================================
   PARTY GAMES — games-registry.js
   
   ✏️  QUI puoi:
     - Aggiungere domande / prompt
     - Aggiungere categorie
     - Aggiungere nuovi giochi (vedi istruzioni in fondo)
   ============================================= */

/* ─────────────────────────────────────────────
  TABOO — prompt per modalità
  ───────────────────────────────────────────── */
const WORDS_CATEGORIES = {

  "Taboo": [
    "Fai indovinare 'MARE' senza dire: acqua, spiaggia, sole, pesce, onda",
    "Fai indovinare 'PIZZA' senza dire: forno, mozzarella, pomodoro, tonda, italiana",
    "Fai indovinare 'COMPUTER' senza dire: schermo, tastiera, internet, digitale, tecnologia",
    "Fai indovinare 'FORESTA' senza dire: alberi, verde, animali, natura, bosco",
    "Fai indovinare 'LUNA' senza dire: notte, stelle, spazio, rotonda, cielo",
    "Fai indovinare 'TRENO' senza dire: rotaie, vagone, viaggio, veloce, stazione",
    "Fai indovinare 'GATTO' senza dire: pelo, zampe, miao, animale, domestico",
    "Fai indovinare 'MUSICA' senza dire: suono, canzone, strumento, ascoltare, ritmo",
    "Fai indovinare 'LIBRO' senza dire: pagine, leggere, copertina, storia, biblioteca",
    "Fai indovinare 'SOLE' senza dire: caldo, luce, giorno, cielo, stella",
    "Fai indovinare 'SCUOLA' senza dire: studenti, insegnante, classe, compiti, edificio",
    "Fai indovinare 'BICICLETTA' senza dire: pedali, ruote, casco, strada, sport",
    "Fai indovinare 'TELEFONO' senza dire: chiamata, messaggio, schermo, smartphone, numero",
    "Fai indovinare 'CANE' senza dire: abbaia, coda, animale, domestico, fedele",
    "Fai indovinare 'AEREO' senza dire: volo, cielo, pilota, ali, aeroporto",
    "Fai indovinare 'GHIACCIO' senza dire: freddo, acqua, solido, congelato, cubetto",
    "Fai indovinare 'OROLOGIO' senza dire: tempo, ore, minuti, polso, lancette",
    "Fai indovinare 'LIBRO' senza dire: pagine, leggere, storia, copertina, autore",
    "Fai indovinare 'CIOCCOLATO' senza dire: dolce, cacao, marrone, tavoletta, zucchero",
    "Fai indovinare 'MONTAGNA' senza dire: alta, neve, scalare, vetta, roccia",
    "Fai indovinare 'AUTOMOBILE' senza dire: motore, ruote, guidare, strada, benzina",
    "Fai indovinare 'FIORE' senza dire: petali, profumo, pianta, colore, giardino",
    "Fai indovinare 'OCCHIALI' senza dire: vista, lenti, vedere, montatura, naso",
    "Fai indovinare 'CITTÀ' senza dire: edifici, strade, persone, traffico, urbano",
    "Fai indovinare 'FILOSOFIA' senza dire: pensiero, teoria, sapere, Platone, riflessione",
    "Fai indovinare 'DEMOCRAZIA' senza dire: voto, popolo, governo, elezioni, politica",
    "Fai indovinare 'ECOSISTEMA' senza dire: ambiente, natura, animali, equilibrio, habitat",
    "Fai indovinare 'PSICOLOGIA' senza dire: mente, comportamento, emozioni, cervello, terapia",
    "Fai indovinare 'INFLAZIONE' senza dire: prezzi, economia, aumento, denaro, costo",
    "Fai indovinare 'ALGORITMO' senza dire: codice, istruzioni, computer, calcolo, programma",
    "Fai indovinare 'ASTRONOMIA' senza dire: stelle, pianeti, spazio, universo, telescopio",
    "Fai indovinare 'MITOLOGIA' senza dire: dei, leggenda, antica, Zeus, storia",
    "Fai indovinare 'ARCHITETTURA' senza dire: edifici, progettazione, costruzione, design, urbano",
    "Fai indovinare 'ENERGIA' senza dire: forza, elettricità, potenza, lavoro, movimento",
    "Fai indovinare 'IDENTITÀ' senza dire: persona, carattere, nome, individuale, sé",
    "Fai indovinare 'STRATEGIA' senza dire: piano, obiettivo, tattica, decisione, gioco",
    "Fai indovinare 'TECNOLOGIA' senza dire: innovazione, digitale, strumenti, progresso, elettronica",
    "Fai indovinare 'COMUNICAZIONE' senza dire: parlare, messaggio, linguaggio, informazione, dialogo",
    "Fai indovinare 'GLOBALIZZAZIONE' senza dire: mondo, economia, connessione, scambi, internazionale",
    "Fai indovinare 'ACQUA' senza dire: bere, trasparente, mare, liquido, sete",
    "Fai indovinare 'TEMPO' senza dire: ore, minuti, passato, futuro, orologio",
    "Fai indovinare 'OMBRELLO' senza dire: pioggia, bagnato, aprire, acqua, temporale",
    "Fai indovinare 'SPECCHIO' senza dire: riflesso, guardarsi, vetro, immagine, bagno",
    "Fai indovinare 'SEGRETO' senza dire: nascondere, dire, confidenza, silenzio, rivelare",
    "Fai indovinare 'FUOCO' senza dire: caldo, bruciare, fiamma, rosso, incendio",
    "Fai indovinare 'SOGNO' senza dire: dormire, notte, immaginare, occhi, realtà",
    "Fai indovinare 'CHIAVE' senza dire: porta, aprire, serratura, chiudere, casa",
    "Fai indovinare 'OMBRA' senza dire: sole, scuro, luce, figura, terra",
    "Fai indovinare 'VOCE' senza dire: parlare, suono, bocca, sentire, urlare",
    "Fai indovinare 'ARIA' senza dire: respirare, vento, ossigeno, invisibile, cielo",
    "Fai indovinare 'RUMORE' senza dire: suono, forte, sentire, silenzio, orecchie",
    "Fai indovinare 'MENTE' senza dire: pensare, cervello, idee, testa, memoria",
    "Fai indovinare 'PAURA' senza dire: spavento, terrore, ansia, brividi, scappare",
    "Fai indovinare 'FORTUNA' senza dire: caso, vincere, sorte, destino, gioco",
    "Fai indovinare 'ACQUA MINERALE' senza dire: bere, bottiglia, gas, naturale, sorgente",
    "Fai indovinare 'COLPO DI FULMINE' senza dire: amore, improvviso, innamorarsi, subito, emozione",
    "Fai indovinare 'BUCO NERO' senza dire: spazio, gravità, luce, universo, inghiottire",
    "Fai indovinare 'EFFETTO DOMINO' senza dire: cadere, catena, conseguenza, fila, reazione",
    "Fai indovinare 'CARTA CARBONE' senza dire: copiare, duplicare, scrivere, foglio, ricalcare",
    "Fai indovinare 'FILO CONDUTTORE' senza dire: collegamento, tema, unire, logica, discorso",
    "Fai indovinare 'TESTA TRA LE NUVOLE' senza dire: distratto, sognare, pensare, assente, fantasia",
    "Fai indovinare 'ZONA D'OMBRA' senza dire: luce, scuro, nascondere, visibile, segreto",
    "Fai indovinare 'PUNTO DI SVOLTA' senza dire: cambiamento, momento, decisione, importante, svolgere",
    "Fai indovinare 'ARMA A DOPPIO TAGLIO' senza dire: rischio, pericolo, vantaggio, svantaggio, conseguenza",
    "Fai indovinare 'MEMORIA DI FERRO' senza dire: ricordare, mente, dimenticare, forte, ricordo",
    "Fai indovinare 'CANE SCIOLTO' senza dire: libero, indipendente, gruppo, solo, regole",
    "Fai indovinare 'FUMO NEGLI OCCHI' senza dire: ingannare, vedere, illusione, trucco, confondere",
    "Fai indovinare 'TEMPO SCADUTO' senza dire: finito, orologio, limite, termine, ritardo",
    "Fai indovinare 'VOCE FUORI CAMPO' senza dire: film, narratore, parlare, scena, audio",
    "Fai indovinare 'PASSIONE' senza dire: fuoco, amore, sentimento, intenso, desiderio",
    "Fai indovinare 'TENSIONE' senza dire: nervoso, elettrico, ansia, attesa, pressione",
    "Fai indovinare 'BRIVIDO' senza dire: freddo, pelle, emozione, paura, sensazione",
    "Fai indovinare 'SCIENZA' senza dire: scuola, biologia, chimica, Einstein, studio",
    "Fai indovinare 'PREVISIONE' senza dire: indovino, indovinare, vedere, prevedere, futuro",
    "Fai indovinare 'TSUNAMI' senza dire: tempesta, onda, oceano, distruzione, acqua",
    "Fai indovinare 'INQUINAMENTO' senza dire: aria, automobile, industrie, ecosistema, ambiente",
    "Fai indovinare 'REGISTA' senza dire: Spielberg, film, Hollywood, cinema, dirigere",
    "Fai indovinare 'ATTORE' senza dire: Jim Carrey, recitare, cinema, film, palco",
    "Fai indovinare 'INSONNIA' senza dire: dormire, sonnifero, amore, sonnambulo, notte",
    "Fai indovinare 'SONNIFERO' senza dire: dormire, letto, M. Monroe, stanco, farmaco",
    "Fai indovinare 'RUSSARE' senza dire: dormire, rumore, letto, naso, notte",
    "Fai indovinare 'SVEGLIA' senza dire: orologio, mattina, telefono, ora, suonare",
    "Fai indovinare 'AUMENTARE' senza dire: crescere, tasse, maggiore, quantità, salire",
    "Fai indovinare 'AUSTRALIANO' senza dire: continente, canguro, isola, Sydney, oceano",
    "Fai indovinare 'BEST SELLER' senza dire: libro, vendere, primo, classifica, successo",
    "Fai indovinare 'BISTECCA' senza dire: carne, cotta, Firenze, al sangue, grigliare",
    "Fai indovinare 'BLOODY MARY' senza dire: vodka, pomodoro, cocktail, limone, bevanda",
    "Fai indovinare 'CASA' senza dire: famiglia, paese, cucina, abitare, edificio",
    "Fai indovinare 'TRENO' senza dire: viaggio, binario, biglietto, stazione, rotaie",
    "Fai indovinare 'BICI' senza dire: ruote, parco, veloce, pedalare, strada",
    "Fai indovinare 'UOMO' senza dire: donna, bambino, adulto, persona, maschio",
    "Fai indovinare 'DONNA' senza dire: uomo, bambina, adulta, persona, femmina",
    "Fai indovinare 'SCUOLA' senza dire: studiare, libro, matita, insegnante, classe",
    "Fai indovinare 'RAGAZZO' senza dire: scuola, bambino, adulto, giovane, persona",
    "Fai indovinare 'ETÀ' senza dire: anni, vecchio, giovane, tempo, numero",
    "Fai indovinare 'PAESE' senza dire: origine, nato, venire, nazione, luogo",
    "Fai indovinare 'BUONGIORNO' senza dire: ciao, salve, buonasera, mattina, saluto",
    "Fai indovinare 'NOME' senza dire: chiamarsi, Luca, Paola, persona, identità",
    "Fai indovinare 'INDIRIZZO' senza dire: via, strada, abitare, casa, luogo",
    "Fai indovinare 'MATRIMONIO' senza dire: nozze, connubio, rito, cerimonia, sposarsi",
    "Fai indovinare 'SPOSA' senza dire: moglie, coniuge, fidanzata, promessa, compagna",
    "Fai indovinare 'LUNA DI MIELE' senza dire: viaggio, nozze, vacanza, relax, partire",
    "Fai indovinare 'BOUQUET' senza dire: mazzo, fiori, composizione, floreale, lancio",
    "Fai indovinare 'BOMBONIERE' senza dire: confetti, regalo, ricordo, pensierino, presente",
    "Fai indovinare 'PROMESSE' senza dire: giuramento, impegno, voto, scrivere, scambio",
    "Fai indovinare 'SPOSO' senza dire: marito, coniuge, fidanzato, promesso, compagno",
    "Fai indovinare 'CONFETTI' senza dire: bomboniere, mandorle, dolcetti, ripieni, gusti",
    "Fai indovinare 'ADDIO AL NUBILATO' senza dire: festa, futura, sposa, spogliarello, amiche",
    "Fai indovinare 'GIN TONIC' senza dire: gin, tonica, limone, ghiaccio, cocktail",
    "Fai indovinare 'SPRITZ' senza dire: aperol, prosecco, arancione, aperitivo, sottovento",
    "Fai indovinare 'MOJITO' senza dire: rum, menta, lime, zucchero, cubetti",
    "Fai indovinare 'MARGARITA' senza dire: tequila, sale, lime, bicchiere, cocktail",
    "Fai indovinare 'NEGRONI' senza dire: bitter, vermouth, gin, rosso, aperitivo",
    "Fai indovinare 'CARBONARA' senza dire: pasta, uova, guanciale, pecorino, Roma",
    "Fai indovinare 'TIRAMISÙ' senza dire: dolce, caffè, mascarpone, savoiardi, cacao",
    "Fai indovinare 'GELATO' senza dire: freddo, cono, gusto, estate, crema",
    "Fai indovinare 'ESPRESSO' senza dire: caffè, tazzina, bar, amaro, bere",
    "Fai indovinare 'CAPPUCCINO' senza dire: latte, schiuma, caffè, colazione, tazza",
    "Fai indovinare 'APERITIVO' senza dire: bere, amici, sera, snack, bar",
    "Fai indovinare 'DISCOTECA' senza dire: musica, ballare, notte, luci, dj",
    "Fai indovinare 'VACANZA' senza dire: viaggio, relax, ferie, partire, mare",
    "Fai indovinare 'RISTORANTE' senza dire: mangiare, tavolo, menu, cameriere, locale",
    "Fai indovinare 'SPIAGGIA' senza dire: sabbia, mare, sole, ombrellone, estate",
    "Fai indovinare 'FEDEZ' senza dire: rapper, Chiara, Ferragni, social, musica",
    "Fai indovinare 'CHIARA FERRAGNI' senza dire: influencer, moda, Fedez, Instagram, imprenditrice",
    "Fai indovinare 'SFERA EBBASTA' senza dire: trap, rapper, musica, capelli, concerti",
    "Fai indovinare 'SANREMO' senza dire: festival, canzoni, Rai, cantanti, gara",
    "Fai indovinare 'RAI' senza dire: televisione, canali, pubblico, Italia, programma",
    "Fai indovinare 'MEDIASET' senza dire: televisione, Canale 5, Italia, privato, programmi",
    "Fai indovinare 'STRISCIA LA NOTIZIA' senza dire: tg, satira, veline, Canale 5, servizio"
  ],

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
    icon: "💬",
    title: "Taboo",
    description: "Fai indovinare la parola senza usare i termini proibiti",
    screen: "words"
  },
  {
    id: "alphabet",           // ← AGGIUNGI QUESTO BLOCCO
    icon: "🔤",
    title: "Alfabeto",
    description: "Una parola per lettera, prima che scada il timer",
    screen: "alphabet"
  },
  {
    id: "wavelength",
    icon: "📡",
    title: "Wavelength",
    description: "Dai un indizio e trova la posizione segreta sulla scala",
    screen: "wavelength"
  }
  // Aggiungi altri giochi qui...
];
