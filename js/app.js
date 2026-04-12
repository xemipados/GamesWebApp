/* =============================================
   PARTY GAMES — app.js
   Logica principale dell'app.
   Di solito non serve modificare questo file.
   ============================================= */

/* ─── Stato globale ─── */
const state = {
  quiz:  { players: [], scores: {}, cat: null, questions: [], qIndex: 0 },
  words: { players: [], scores: {}, cat: null, prompts:   [], turn: 0, promptIndex: 0 }
};

/* ─── Utility ─── */
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function goHome() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-home').classList.add('active');
}

function openScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

/* ─── Generazione home ─── */
function buildHome() {
  const grid = document.getElementById('game-grid');
  grid.innerHTML = '';

  GAMES_REGISTRY.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `<div class="icon">${game.icon}</div><h3>${game.title}</h3><p>${game.description}</p>`;
    card.onclick = () => openGame(game.id);
    grid.appendChild(card);
  });

  // Card "aggiungi"
  const add = document.createElement('div');
  add.className = 'game-card add-card';
  add.innerHTML = `<div class="icon">＋</div><h3>Aggiungi</h3><p>Nuovo gioco</p>`;
  add.onclick = () => alert('Apri games-registry.js in VS Code per aggiungere nuovi giochi!');
  grid.appendChild(add);
}

/* ─── Giocatori ─── */
function addPlayer(game) {
  const input = document.getElementById(game + '-player-input');
  const name = input.value.trim();
  if (!name) return;
  if (!state[game].players.includes(name)) {
    state[game].players.push(name);
    state[game].scores[name] = 0;
  }
  input.value = '';
  renderPlayerTags(game);
}

function removePlayer(game, name) {
  state[game].players = state[game].players.filter(p => p !== name);
  delete state[game].scores[name];
  renderPlayerTags(game);
}

function renderPlayerTags(game) {
  const container = document.getElementById(game + '-players-tags');
  container.innerHTML = state[game].players.map(p =>
    `<span class="player-tag">${p}
      <button onclick="removePlayer('${game}','${p}')">×</button>
    </span>`
  ).join('');
}

// Enter su input aggiunge giocatore
document.addEventListener('DOMContentLoaded', () => {
  ['quiz', 'words'].forEach(game => {
    const input = document.getElementById(game + '-player-input');
    if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') addPlayer(game); });

    const customCatInput = document.getElementById(game + '-custom-cat');
    if (customCatInput) {
      customCatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') setCustomCategory(game);
      });
    }
  });
});

/* ─── Categoria random/redraw/custom ─── */
function getCategoriesByGame(game) {
  return game === 'quiz' ? Object.keys(QUIZ_CATEGORIES) : Object.keys(WORDS_CATEGORIES);
}

function redrawCategory(game) {
  const categories = getCategoriesByGame(game);
  if (!categories.length) {
    state[game].cat = null;
    return;
  }
  const randomCat = categories[Math.floor(Math.random() * categories.length)];
  state[game].cat = randomCat;
  const current = document.getElementById(game + '-current-cat');
  if (current) current.textContent = randomCat;
}

function setCustomCategory(game) {
  const input = document.getElementById(game + '-custom-cat');
  const val = input.value.trim();
  if (!val) return;
  state[game].cat = val;
  const current = document.getElementById(game + '-current-cat');
  if (current) current.textContent = val;
  input.value = '';
}

function getCategoryItems(game) {
  const source = game === 'quiz' ? QUIZ_CATEGORIES : WORDS_CATEGORIES;
  const selected = state[game].cat;
  if (selected && source[selected]) return source[selected];

  return Object.values(source).flat();
}

/* ─────────────────────────────────────────────
   QUIZ
   ───────────────────────────────────────────── */
function openGame(id) {
  openScreen(id);
  // reset setup
  if (id === 'quiz') {
    document.getElementById('quiz-setup').style.display = 'block';
    document.getElementById('quiz-game').style.display  = 'none';
    redrawCategory('quiz');
  }
  if (id === 'words') {
    document.getElementById('words-setup').style.display = 'block';
    document.getElementById('words-game').style.display  = 'none';
    redrawCategory('words');
  }
}

function startQuiz() {
  if (state.quiz.players.length < 1) { alert('Aggiungi almeno un giocatore!'); return; }
  if (!state.quiz.cat) redrawCategory('quiz');
  const cat = state.quiz.cat || 'Misto';
  state.quiz.questions = shuffle(getCategoryItems('quiz'));
  state.quiz.qIndex = 0;
  Object.keys(state.quiz.scores).forEach(k => state.quiz.scores[k] = 0);

  document.getElementById('quiz-setup').style.display = 'none';
  document.getElementById('quiz-game').style.display  = 'block';
  document.getElementById('quiz-cat-badge').textContent = cat;

  renderQuestion();
}

function renderQuestion() {
  const qs = state.quiz.questions;
  const btn = document.querySelector('#quiz-game .btn-next');

  if (state.quiz.qIndex >= qs.length) {
    document.getElementById('quiz-question').textContent = '🏁 Fine delle domande! Guarda i punteggi finali.';
    document.getElementById('quiz-progress').textContent  = 'Fine';
    btn.textContent = 'Rigioca';
    btn.onclick = () => openGame('quiz');
  } else {
    document.getElementById('quiz-question').textContent  = qs[state.quiz.qIndex];
    document.getElementById('quiz-progress').textContent  = `Domanda ${state.quiz.qIndex + 1} / ${qs.length}`;
    btn.textContent = 'Prossima domanda →';
    btn.onclick = nextQuestion;
  }
  renderScores('quiz');
}

function nextQuestion() {
  state.quiz.qIndex++;
  renderQuestion();
}

/* ─────────────────────────────────────────────
   PAROLE
   ───────────────────────────────────────────── */
function startWords() {
  if (state.words.players.length < 1) { alert('Aggiungi almeno un giocatore!'); return; }
  if (!state.words.cat) redrawCategory('words');
  const cat = state.words.cat || 'Misto';
  state.words.prompts      = shuffle(getCategoryItems('words'));
  state.words.turn         = 0;
  state.words.promptIndex  = 0;
  Object.keys(state.words.scores).forEach(k => state.words.scores[k] = 0);

  document.getElementById('words-setup').style.display = 'none';
  document.getElementById('words-game').style.display  = 'block';
  document.getElementById('words-mode-badge').textContent = cat;

  renderWords();
}

function renderWords() {
  const prompts = state.words.prompts;
  const players = state.words.players;
  const currentPlayer = players[state.words.turn % players.length];
  const btn = document.querySelector('#words-game .btn-next');

  document.getElementById('words-player-name').textContent = currentPlayer;

  if (state.words.promptIndex >= prompts.length) {
    document.getElementById('words-prompt').textContent = '🏁 Prompt finiti! Guarda i punteggi.';
    btn.textContent = 'Rigioca';
    btn.onclick = () => openGame('words');
  } else {
    document.getElementById('words-prompt').textContent = prompts[state.words.promptIndex];
    btn.textContent = 'Prossimo turno →';
    btn.onclick = nextWords;
  }
  renderScores('words');
}

function nextWords() {
  state.words.turn++;
  state.words.promptIndex++;
  renderWords();
}

/* ─── Punteggi (condiviso) ─── */
function renderScores(game) {
  const container = document.getElementById(game + '-scores');
  const scores = state[game].scores;
  container.innerHTML = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([name, score]) => `
      <div class="player-row">
        <span>${name}</span>
        <div class="score-controls">
          <button class="score-btn" onclick="changeScore('${game}','${name}',-1)">−</button>
          <span class="score-val">${score}</span>
          <button class="score-btn" onclick="changeScore('${game}','${name}',1)">+</button>
        </div>
      </div>
    `).join('');
}

function changeScore(game, name, delta) {
  state[game].scores[name] = Math.max(0, (state[game].scores[name] || 0) + delta);
  renderScores(game);
}

/* ─── Init ─── */
buildHome();
