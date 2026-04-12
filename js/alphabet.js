/* =============================================
   PARTY GAMES — js/alphabet.js
   Gioco dell'Alfabeto a turni con timer
   ============================================= */

/* ─────────────────────────────────────────────
   ✏️  CATEGORIE PREDEFINITE
   Aggiungi o modifica le categorie qui sotto.
   ───────────────────────────────────────────── */
const ALPHABET_CATEGORIES = [
  "Oggetti che trovi in frigo",
  "Cose che usi in estate",
  "Cantanti",
  "Attori / Attrici",
  "Animali",
  "Paesi del mondo",
  "Cibi e bevande",
  "Sport",
  "Professioni",
  "Film famosi",
  "Cose che trovi in un supermercato",
  "Marchi di automobili",
  "Nomi di persona",
  "Oggetti in cucina",
  "Cose che fanno rumore"
];

/* ─── Costanti ─── */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CIRCUMFERENCE = 2 * Math.PI * 34; // raggio 34 come in SVG

/* ─── Stato del gioco ─── */
const alphabetState = {
  players:        [],   // tutti i giocatori aggiunti
  alivePlayers:   [],   // giocatori ancora in gara
  eliminated:     [],   // giocatori eliminati (in ordine)
  scores:         {},   // lettere usate per giocatore (non usato per classifica, ma utile)
  currentTurn:    0,    // indice in alivePlayers
  usedLetters:    new Set(),
  selectedLetter: null,
  timerSeconds:   15,
  timerLeft:      15,
  timerInterval:  null,
  cat:            null,
};

/* ─────────────────────────────────────────────
   SETUP
   ───────────────────────────────────────────── */

function redrawAlphabetCategory() {
  if (!ALPHABET_CATEGORIES.length) {
    alphabetState.cat = null;
    return;
  }
  const randomCat = ALPHABET_CATEGORIES[Math.floor(Math.random() * ALPHABET_CATEGORIES.length)];
  alphabetState.cat = randomCat;
  const current = document.getElementById('alphabet-current-cat');
  if (current) current.textContent = randomCat;
}

function setCustomAlphabetCategory() {
  const input = document.getElementById('alphabet-custom-cat');
  const val = input.value.trim();
  if (!val) return;
  alphabetState.cat = val;
  const current = document.getElementById('alphabet-current-cat');
  if (current) current.textContent = val;
  input.value = '';
}

function setTimer(seconds) {
  alphabetState.timerSeconds = seconds;
  document.querySelectorAll('.timer-btn').forEach(b => {
    b.classList.toggle('active', b.textContent === seconds + 's');
  });
}

// Override di openGame per alphabet (la funzione in app.js chiama buildPills
// che non sa di ALPHABET_CATEGORIES, quindi intercettiamo qui)
const _origOpenGame = typeof window.openGame === 'function' ? window.openGame : null;
window.openGame = function openGameAlphabet(id) {
  if (id === 'alphabet') {
    openScreen('alphabet');
    document.getElementById('alphabet-setup').style.display = 'block';
    document.getElementById('alphabet-game').style.display  = 'none';
    document.getElementById('alphabet-end').style.display   = 'none';
    // Reset giocatori del gioco (mantieni la lista ma svuota stato partita)
    alphabetState.alivePlayers  = [];
    alphabetState.eliminated    = [];
    alphabetState.usedLetters   = new Set();
    alphabetState.selectedLetter = null;
    alphabetState.currentTurn   = 0;
    clearInterval(alphabetState.timerInterval);
    redrawAlphabetCategory();
    renderPlayerTags('alphabet');
  } else if (_origOpenGame) {
    _origOpenGame(id);
  }
};

/* ─────────────────────────────────────────────
   INIZIO PARTITA
   ───────────────────────────────────────────── */
function startAlphabet() {
  if (alphabetState.players.length < 2) {
    alert('Aggiungi almeno 2 giocatori!');
    return;
  }
  if (!alphabetState.cat) {
    redrawAlphabetCategory();
  }

  alphabetState.alivePlayers = [...alphabetState.players];
  alphabetState.eliminated   = [];
  alphabetState.usedLetters  = new Set();
  alphabetState.selectedLetter = null;
  alphabetState.currentTurn  = 0;

  document.getElementById('alphabet-setup').style.display = 'none';
  document.getElementById('alphabet-game').style.display  = 'block';
  document.getElementById('alphabet-end').style.display   = 'none';
  document.getElementById('alphabet-cat-badge').textContent = alphabetState.cat;
  document.getElementById('eliminated-section').style.display = 'none';

  renderLettersGrid();
  renderAlivePlayers();
  startTurn();
}

/* ─────────────────────────────────────────────
   TURNO
   ───────────────────────────────────────────── */
function startTurn() {
  const alive = alphabetState.alivePlayers;
  if (alive.length === 0) { endGame('Tutti eliminati!'); return; }

  alphabetState.currentTurn = alphabetState.currentTurn % alive.length;
  const currentPlayer = alive[alphabetState.currentTurn];

  document.getElementById('alphabet-player-name').textContent = currentPlayer;
  alphabetState.selectedLetter = null;
  renderLettersGrid();
  updateAlphabetSelectionView();
  renderAlivePlayers();

  // Abilita bottoni
  document.getElementById('btn-said').disabled = true;
  document.getElementById('btn-said').style.opacity = '0.4';
  document.getElementById('btn-skip').disabled = false;

  startTimer();
}

function startTimer() {
  clearInterval(alphabetState.timerInterval);
  alphabetState.timerLeft = alphabetState.timerSeconds;
  updateTimerUI();

  alphabetState.timerInterval = setInterval(() => {
    alphabetState.timerLeft--;
    updateTimerUI();
    if (alphabetState.timerLeft <= 0) {
      clearInterval(alphabetState.timerInterval);
      playerFailed('timeout');
    }
  }, 1000);
}

function updateTimerUI() {
  const t = alphabetState.timerLeft;
  const total = alphabetState.timerSeconds;
  document.getElementById('timer-display').textContent = t;

  const ring = document.getElementById('ring-fg');
  const offset = CIRCUMFERENCE * (1 - t / total);
  ring.style.strokeDashoffset = offset;
  ring.classList.toggle('danger', t <= 5);
}

/* ─────────────────────────────────────────────
   AZIONI GIOCATORE
   ───────────────────────────────────────────── */

// Il giocatore tocca una lettera dalla griglia
function selectLetter(letter) {
  if (alphabetState.usedLetters.has(letter)) return;
  alphabetState.selectedLetter = letter;
  renderLettersGrid();
  updateAlphabetSelectionView();

  // Abilita "Detto!"
  document.getElementById('btn-said').disabled = false;
  document.getElementById('btn-said').style.opacity = '1';
}

// ✓ Ha detto la parola
function playerSaid() {
  if (!alphabetState.selectedLetter) return;
  clearInterval(alphabetState.timerInterval);

  alphabetState.usedLetters.add(alphabetState.selectedLetter);
  alphabetState.selectedLetter = null;

  renderLettersGrid();
  updateAlphabetSelectionView();

  // Controlla se le lettere sono finite
  const remaining = ALPHABET.filter(l => !alphabetState.usedLetters.has(l));
  if (remaining.length === 0) {
    endGame('Tutte le lettere sono state usate!');
    return;
  }

  // Passa al prossimo giocatore
  alphabetState.currentTurn = (alphabetState.currentTurn + 1) % alphabetState.alivePlayers.length;
  startTurn();
}

// ✗ Timeout: elimina il giocatore. Pulsante: torna alla griglia senza eliminare.
function playerFailed(source = 'button') {
  if (source !== 'timeout') {
    if (!alphabetState.selectedLetter) return;

    alphabetState.selectedLetter = null;
    renderLettersGrid();
    updateAlphabetSelectionView();

    document.getElementById('btn-said').disabled = true;
    document.getElementById('btn-said').style.opacity = '0.4';
    return;
  }

  clearInterval(alphabetState.timerInterval);

  const alive = alphabetState.alivePlayers;
  const failedPlayer = alive[alphabetState.currentTurn % alive.length];

  alphabetState.selectedLetter = null;
  updateAlphabetSelectionView();

  // Elimina il giocatore
  alphabetState.eliminated.push(failedPlayer);
  alphabetState.alivePlayers = alive.filter(p => p !== failedPlayer);

  // Mostra sezione eliminati
  renderEliminatedPlayers();
  document.getElementById('eliminated-section').style.display = 'block';

  // Se rimane 1 solo → fine
  if (alphabetState.alivePlayers.length <= 1) {
    endGame(alphabetState.alivePlayers.length === 1
      ? `${alphabetState.alivePlayers[0]} è l'ultimo rimasto!`
      : 'Tutti eliminati!');
    return;
  }

  // Aggiusta indice turno (non incrementare, il prossimo è già al posto giusto)
  alphabetState.currentTurn = alphabetState.currentTurn % alphabetState.alivePlayers.length;
  startTurn();
}

/* ─────────────────────────────────────────────
   FINE PARTITA
   ───────────────────────────────────────────── */
function endGame(reason) {
  clearInterval(alphabetState.timerInterval);

  document.getElementById('alphabet-game').style.display = 'none';
  document.getElementById('alphabet-end').style.display  = 'block';

  // Vincitore
  const winner = alphabetState.alivePlayers[0] || '—';
  document.getElementById('alphabet-winner').textContent =
    alphabetState.alivePlayers.length === 1 ? `Vince ${winner}!` : 'Partita terminata';
  document.getElementById('alphabet-end-reason').textContent = reason;

  // Classifica: alive (1°) + eliminati al contrario (ultimo eliminato = 2°, ecc.)
  const ranking = [
    ...alphabetState.alivePlayers,
    ...[...alphabetState.eliminated].reverse()
  ];

  const container = document.getElementById('alphabet-final-ranking');
  container.innerHTML = ranking.map((name, i) => `
    <div class="ranking-row">
      <span class="ranking-pos">${i + 1}°</span>
      <span>${name}</span>
      ${i === 0 ? '<span style="font-size:18px;">🏆</span>' : ''}
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────
   RENDER
   ───────────────────────────────────────────── */
function renderLettersGrid() {
  const grid = document.getElementById('letters-grid');
  grid.innerHTML = ALPHABET.map(letter => {
    let cls = 'letter-cell';
    if (alphabetState.usedLetters.has(letter)) cls += ' used';
    else if (alphabetState.selectedLetter === letter) cls += ' selected';
    return `<div class="${cls}" onclick="selectLetter('${letter}')">${letter}</div>`;
  }).join('');
}

function updateAlphabetSelectionView() {
  const grid = document.getElementById('letters-grid');
  const focus = document.getElementById('alphabet-selected-focus');
  const focusLetter = document.getElementById('alphabet-selected-letter');
  const actions = document.getElementById('alphabet-actions');
  const hasSelection = !!alphabetState.selectedLetter;

  if (hasSelection) {
    focusLetter.textContent = alphabetState.selectedLetter;
    grid.style.display = 'none';
    focus.style.display = 'flex';

    // Retrigger animazione pop ogni volta che una lettera entra in focus.
    focus.classList.remove('show');
    void focus.offsetWidth;
    focus.classList.add('show');

    actions.classList.add('zoomed');
    actions.classList.remove('zoomed-animate');
    void actions.offsetWidth;
    actions.classList.add('zoomed-animate');
  } else {
    grid.style.display = 'grid';
    focus.style.display = 'none';
    focus.classList.remove('show');
    actions.classList.remove('zoomed');
    actions.classList.remove('zoomed-animate');
  }
}

function renderAlivePlayers() {
  const container = document.getElementById('alphabet-active-players');
  const alive = alphabetState.alivePlayers;
  const currentIdx = alphabetState.currentTurn % (alive.length || 1);
  container.innerHTML = alive.map((name, i) => `
    <div class="alive-row ${i === currentIdx ? 'current' : ''}">
      <span>${i === currentIdx ? '▶ ' : ''}${name}</span>
    </div>
  `).join('');
}

function renderEliminatedPlayers() {
  const container = document.getElementById('alphabet-eliminated');
  container.innerHTML = alphabetState.eliminated.map(name =>
    `<span class="elim-row">✗ ${name}</span>`
  ).join('');
}

/* ─── Collega addPlayer al nuovo gioco ─── */
// app.js gestisce già addPlayer('alphabet') tramite alphabetState.players
// ma lo stato è separato, quindi usiamo lo stesso pattern ma con alphabetState
const _origAddPlayer = typeof window.addPlayer === 'function' ? window.addPlayer : null;
const _origRemovePlayer = typeof window.removePlayer === 'function' ? window.removePlayer : null;

window.addPlayer = function addPlayerAlphabet(game) {
  if (game === 'alphabet') {
    const input = document.getElementById('alphabet-player-input');
    const name = input.value.trim();
    if (!name) return;
    if (!alphabetState.players.includes(name)) {
      alphabetState.players.push(name);
    }
    input.value = '';
    renderPlayerTags('alphabet');
  } else if (_origAddPlayer) {
    _origAddPlayer(game);
  }
};

window.removePlayer = function removePlayerAlphabet(game, name) {
  if (game === 'alphabet') {
    alphabetState.players = alphabetState.players.filter(p => p !== name);
    renderPlayerTags('alphabet');
  } else if (_origRemovePlayer) {
    _origRemovePlayer(game, name);
  }
};

// Enter su input
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('alphabet-player-input');
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') addPlayer('alphabet'); });
  const customInput = document.getElementById('alphabet-custom-cat');
  if (customInput) customInput.addEventListener('keydown', e => { if (e.key === 'Enter') setCustomAlphabetCategory(); });
});
