/* =============================================
   PARTY GAMES — app.js
   Logica principale dell'app.
   Di solito non serve modificare questo file.
   ============================================= */

/* ─── Stato globale ─── */
const state = {
  words: {
    players: [],
    scores: {},
    cat: null,
    prompts: [],
    promptIndex: 0,
    teamMode: 'manual',
    teamCount: 2,
    manualAssignments: {},
    teams: [],
    teamTurnIndex: [],
    currentTeamIndex: 0,
    turnSeconds: 60,
    turnLeft: 60,
    turnInterval: null,
    turnDeadline: 0,
    passesUsed: 0,
    turnRecap: [],
    recapData: null,
    gameExhausted: false,
    useDice: false,
    turnRule: null,
    turnDuration: 60,
    singleGuessMember: null
  }
};

/* ─── Utility ─── */
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

const WORDS_TIMER_CIRCUMFERENCE = 2 * Math.PI * 48;

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

  if (game === 'words' && state.words.teamMode === 'random') {
    state.words.teams = [];
  }

  renderPlayerTags(game);
}

function removePlayer(game, name) {
  state[game].players = state[game].players.filter(p => p !== name);
  delete state[game].scores[name];

  if (game === 'words') {
    delete state.words.manualAssignments[name];
    if (state.words.teamMode === 'random') {
      state.words.teams = [];
    }
  }

  renderPlayerTags(game);
}

function renderPlayerTags(game) {
  const container = document.getElementById(game + '-players-tags');
  container.innerHTML = state[game].players.map(p =>
    `<span class="player-tag">${p}
      <button onclick="removePlayer('${game}','${p}')">×</button>
    </span>`
  ).join('');

  if (game === 'words') renderWordsTeamBuilder();
}

// Enter su input aggiunge giocatore
document.addEventListener('DOMContentLoaded', () => {
  ['words'].forEach(game => {
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
  return Object.keys(WORDS_CATEGORIES);
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
  const source = WORDS_CATEGORIES;
  const selected = state[game].cat;
  if (selected && source[selected]) return source[selected];

  return Object.values(source).flat();
}

/* ─── PAROLE / TABOO: squadre e turni ─── */
function getWordsTeamCount() {
  const playerCount = Math.max(state.words.players.length, 2);
  const desiredCount = Math.max(2, Number.parseInt(state.words.teamCount, 10) || 2);
  return Math.min(desiredCount, playerCount);
}

function makeWordTeams(count) {
  return Array.from({ length: count }, (_, index) => ({
    name: `Squadra ${index + 1}`,
    players: []
  }));
}

function updateWordsTeamModeButtons() {
  const manualBtn = document.getElementById('words-mode-manual-btn');
  const randomBtn = document.getElementById('words-mode-random-btn');
  if (manualBtn) manualBtn.classList.toggle('active', state.words.teamMode === 'manual');
  if (randomBtn) randomBtn.classList.toggle('active', state.words.teamMode === 'random');
}

function updateWordsDiceButtons() {
  const onBtn = document.getElementById('words-dice-on-btn');
  const offBtn = document.getElementById('words-dice-off-btn');
  if (onBtn) onBtn.classList.toggle('active', !!state.words.useDice);
  if (offBtn) offBtn.classList.toggle('active', !state.words.useDice);
}

function setWordsDiceEnabled(enabled) {
  state.words.useDice = !!enabled;
  updateWordsDiceButtons();
}

function setWordsTeamMode(mode) {
  state.words.teamMode = mode === 'random' ? 'random' : 'manual';
  if (state.words.teamMode === 'random') {
    randomizeWordsTeams();
  } else {
    renderWordsTeamBuilder();
  }
  updateWordsTeamModeButtons();
}

function setWordsTeamCount(value) {
  state.words.teamCount = Math.max(2, Number.parseInt(value, 10) || 2);
  if (state.words.teamMode === 'random') {
    randomizeWordsTeams();
  } else {
    renderWordsTeamBuilder();
  }
}

function setWordTeamForPlayer(player, teamValue) {
  state.words.manualAssignments[player] = teamValue;
}

function distributePlayersRandomly(teamCount) {
  const teams = makeWordTeams(teamCount);
  shuffle([...state.words.players]).forEach((player, index) => {
    teams[index % teamCount].players.push(player);
  });
  return teams;
}

function buildManualWordTeams(teamCount) {
  const teams = makeWordTeams(teamCount);
  const unassigned = [];

  state.words.players.forEach(player => {
    const assignedTeam = Number.parseInt(state.words.manualAssignments[player], 10);
    if (assignedTeam >= 1 && assignedTeam <= teamCount) {
      teams[assignedTeam - 1].players.push(player);
    } else {
      unassigned.push(player);
    }
  });

  unassigned.forEach(player => {
    let shortestTeamIndex = 0;
    for (let i = 1; i < teams.length; i++) {
      if (teams[i].players.length < teams[shortestTeamIndex].players.length) {
        shortestTeamIndex = i;
      }
    }
    teams[shortestTeamIndex].players.push(player);
    state.words.manualAssignments[player] = String(shortestTeamIndex + 1);
  });

  return teams;
}

function randomizeWordsTeams() {
  const teamCount = getWordsTeamCount();
  state.words.teamMode = 'random';
  state.words.teamCount = teamCount;
  state.words.teams = distributePlayersRandomly(teamCount);
  state.words.teamTurnIndex = state.words.teams.map(() => 0);
  state.words.currentTeamIndex = 0;
  renderWordsTeamBuilder();
  updateWordsTeamModeButtons();
}

function renderWordsTeamBuilder() {
  const container = document.getElementById('words-team-builder');
  const teamCountInput = document.getElementById('words-team-count');
  if (!container || !teamCountInput) return;

  const teamCount = getWordsTeamCount();
  teamCountInput.value = teamCount;

  if (!state.words.players.length) {
    container.innerHTML = '<p class="team-empty-note">Aggiungi almeno un giocatore per impostare le squadre.</p>';
    return;
  }

  if (state.words.teamMode === 'random') {
    const currentRoster = state.words.teams.flatMap(team => team.players);
    const rosterMatches = currentRoster.length === state.words.players.length && state.words.players.every(player => currentRoster.includes(player));
    if (!rosterMatches) {
      state.words.teams = distributePlayersRandomly(teamCount);
    }

    if (!state.words.teams.length) {
      state.words.teams = distributePlayersRandomly(teamCount);
    }

    container.innerHTML = state.words.teams.map(team => {
      const members = team.players.length ? team.players.join(', ') : 'Nessun giocatore';
      return `
        <div class="team-preview-card">
          <div class="team-preview-title">${team.name}</div>
          <div class="team-preview-members">${members}</div>
        </div>
      `;
    }).join('');
    return;
  }

  container.innerHTML = state.words.players.map(player => {
    const selectedTeam = state.words.manualAssignments[player] || '';
    const options = ['<option value="">Auto</option>']
      .concat(Array.from({ length: teamCount }, (_, index) => {
        const teamNumber = index + 1;
        return `<option value="${teamNumber}" ${String(teamNumber) === String(selectedTeam) ? 'selected' : ''}>Squadra ${teamNumber}</option>`;
      }))
      .join('');

    return `
      <div class="team-assign-row">
        <span class="player-tag">${player}</span>
        <select class="team-select" onchange='setWordTeamForPlayer(${JSON.stringify(player)}, this.value)'>
          ${options}
        </select>
      </div>
    `;
  }).join('');
}

function getNextActiveWordTeamIndex(startIndex = 0) {
  const teams = state.words.teams;
  if (!teams.length) return -1;

  for (let offset = 0; offset < teams.length; offset++) {
    const index = (startIndex + offset) % teams.length;
    if (teams[index].players.length > 0) return index;
  }

  return -1;
}

function getCurrentWordTurn() {
  const teamIndex = getNextActiveWordTeamIndex(state.words.currentTeamIndex);
  if (teamIndex === -1) return null;

  const team = state.words.teams[teamIndex];
  const playerIndex = state.words.teamTurnIndex[teamIndex] % team.players.length;

  return {
    teamIndex,
    team,
    playerIndex,
    player: team.players[playerIndex]
  };
}

function parseTabooPrompt(prompt) {
  const targetMatch = prompt.match(/['"]([^'"]+)['"]/);
  const forbiddenMatch = prompt.match(/senza dire:\s*(.+)$/i);
  const target = targetMatch ? targetMatch[1] : prompt;
  const forbidden = forbiddenMatch
    ? forbiddenMatch[1].split(',').map(text => text.trim()).filter(Boolean)
    : [];
  const instruction = prompt.replace(targetMatch ? targetMatch[0] : target, '').replace(/senza dire:.*/i, '').trim();

  return { target, forbidden, instruction };
}

function getWordsDiceRule(roll) {
  if (roll === 1) {
    return {
      type: 'double-time',
      message: 'Tempo raddoppiato: 2 minuti per questo turno.',
      duration: state.words.turnSeconds * 2,
      allTeamsCanScore: false,
      requireSingleMember: false
    };
  }

  if (roll === 2 || roll === 3) {
    return {
      type: 'classic',
      message: 'Turno classico: regole standard.',
      duration: state.words.turnSeconds,
      allTeamsCanScore: false,
      requireSingleMember: false
    };
  }

  if (roll === 4) {
    return {
      type: 'all-teams',
      message: 'Sfida aperta: possono indovinare i membri di tutte le squadre.',
      duration: state.words.turnSeconds,
      allTeamsCanScore: true,
      requireSingleMember: false
    };
  }

  return {
    type: 'single-member',
    message: 'Solo un membro della squadra può indovinare in questo turno.',
    duration: state.words.turnSeconds,
    allTeamsCanScore: false,
    requireSingleMember: true
  };
}

function hideWordsPreturn() {
  const panel = document.getElementById('words-preturn');
  const liveArea = document.getElementById('words-live-area');
  const timerWrap = document.querySelector('#words-game .words-timer-wrap');
  const tabooCard = document.querySelector('#words-game .taboo-card');
  const actions = document.querySelector('#words-game .words-actions');
  const allTeams = document.getElementById('words-all-teams-controls');

  if (panel) panel.style.display = 'none';
  if (liveArea) liveArea.style.display = 'block';
  if (timerWrap) timerWrap.style.display = 'block';
  if (tabooCard) tabooCard.style.display = 'flex';
  if (actions) actions.style.display = 'grid';
  if (allTeams && !(state.words.turnRule && state.words.turnRule.allTeamsCanScore)) {
    allTeams.style.display = 'none';
  }
}

function showWordsPreturn() {
  const panel = document.getElementById('words-preturn');
  const liveArea = document.getElementById('words-live-area');
  const timerWrap = document.querySelector('#words-game .words-timer-wrap');
  const tabooCard = document.querySelector('#words-game .taboo-card');
  const actions = document.querySelector('#words-game .words-actions');
  const allTeams = document.getElementById('words-all-teams-controls');
  const rollBtn = document.getElementById('words-roll-btn');
  const startBtn = document.getElementById('words-start-turn-btn');
  const result = document.getElementById('words-dice-result');
  const pickerWrap = document.getElementById('words-single-picker');
  const picker = document.getElementById('words-single-member-select');
  const currentTurn = getCurrentWordTurn();
  if (!panel || !liveArea || !rollBtn || !startBtn || !result || !pickerWrap || !picker || !currentTurn) return;

  liveArea.style.display = 'block';
  panel.style.display = 'block';
  if (timerWrap) timerWrap.style.display = 'none';
  if (tabooCard) tabooCard.style.display = 'none';
  if (actions) actions.style.display = 'none';
  if (allTeams) allTeams.style.display = 'none';
  result.textContent = 'Lancia il dado per scoprire la regola.';
  rollBtn.textContent = 'Lancia dado';
  rollBtn.onclick = rollWordsDice;
  startBtn.textContent = 'Inizia turno';
  startBtn.onclick = startConfiguredWordsTurn;
  state.words.turnRule = null;
  state.words.turnDuration = state.words.turnSeconds;
  state.words.singleGuessMember = currentTurn.player;

  pickerWrap.style.display = 'none';
  picker.innerHTML = currentTurn.team.players
    .map(player => `<option value="${player}">${player}</option>`)
    .join('');

  if (picker.value) {
    state.words.singleGuessMember = picker.value;
  }

  rollBtn.style.display = 'block';
  startBtn.style.display = 'none';
}

function prepareWordsTurn() {
  const currentTurn = getCurrentWordTurn();
  if (!currentTurn) {
    renderWords();
    return;
  }

  state.words.turnRecap = [];
  state.words.passesUsed = 0;
  state.words.turnDuration = state.words.turnSeconds;
  state.words.turnLeft = state.words.turnDuration;
  state.words.turnDeadline = Date.now() + (state.words.turnDuration * 1000);
  state.words.turnRule = {
    type: 'classic',
    message: 'Turno classico: regole standard.',
    duration: state.words.turnSeconds,
    allTeamsCanScore: false,
    requireSingleMember: false
  };
  state.words.singleGuessMember = currentTurn.player;

  if (state.words.useDice) {
    showWordsPreturn();
    return;
  }

  hideWordsPreturn();
  renderWords();
  startWordsTurnTimer();
}

function rollWordsDice() {
  const result = document.getElementById('words-dice-result');
  const rollBtn = document.getElementById('words-roll-btn');
  const startBtn = document.getElementById('words-start-turn-btn');
  const pickerWrap = document.getElementById('words-single-picker');
  const picker = document.getElementById('words-single-member-select');
  const currentTurn = getCurrentWordTurn();
  if (!result || !rollBtn || !startBtn || !pickerWrap || !picker || !currentTurn) return;

  const roll = Math.floor(Math.random() * 6) + 1;
  const rule = getWordsDiceRule(roll);
  state.words.turnRule = rule;
  state.words.turnDuration = rule.duration;
  state.words.turnLeft = state.words.turnDuration;
  state.words.turnDeadline = Date.now() + (state.words.turnDuration * 1000);

  result.textContent = `🎲 ${roll} · ${rule.message}`;

  if (rule.requireSingleMember) {
    pickerWrap.style.display = 'block';
    if (!picker.value) picker.value = currentTurn.player;
    state.words.singleGuessMember = picker.value;
  } else {
    pickerWrap.style.display = 'none';
    state.words.singleGuessMember = currentTurn.player;
  }

  rollBtn.style.display = 'none';
  startBtn.style.display = 'block';
}

function startConfiguredWordsTurn() {
  const picker = document.getElementById('words-single-member-select');
  if (state.words.turnRule && state.words.turnRule.requireSingleMember && picker) {
    state.words.singleGuessMember = picker.value || state.words.singleGuessMember;
  }

  hideWordsPreturn();
  renderWords();
  startWordsTurnTimer();
}

/* ─────────────────────────────────────────────
   QUIZ
   ───────────────────────────────────────────── */
function openGame(id) {
  openScreen(id);
  // reset setup
  if (id === 'words') {
    document.getElementById('words-setup').style.display = 'block';
    document.getElementById('words-game').style.display  = 'none';
    clearInterval(state.words.turnInterval);
    state.words.cat = 'Taboo';
    state.words.teamMode = 'manual';
    state.words.teamCount = 2;
    state.words.manualAssignments = {};
    state.words.teams = [];
    state.words.teamTurnIndex = [];
    state.words.currentTeamIndex = 0;
    state.words.turnSeconds = 60;
    state.words.turnLeft = 60;
    state.words.turnDeadline = 0;
    state.words.passesUsed = 0;
    state.words.turnRecap = [];
    state.words.recapData = null;
    state.words.gameExhausted = false;
    state.words.turnRule = null;
    state.words.turnDuration = state.words.turnSeconds;
    state.words.singleGuessMember = null;
    updateWordsTeamModeButtons();
    updateWordsDiceButtons();
    renderPlayerTags('words');
  }
}

/* ─────────────────────────────────────────────
   TABOO
   ───────────────────────────────────────────── */
function startWords() {
  if (state.words.players.length < 2) { alert('Aggiungi almeno 2 giocatori!'); return; }
  const diceOnBtn = document.getElementById('words-dice-on-btn');
  if (diceOnBtn) {
    state.words.useDice = diceOnBtn.classList.contains('active');
  }
  state.words.cat = 'Taboo';
  const cat = 'Taboo';

  state.words.prompts = shuffle([...(WORDS_CATEGORIES.Taboo || [])]);
  state.words.promptIndex = 0;
  state.words.turnSeconds = 60;
  state.words.turnLeft = 60;
  state.words.passesUsed = 0;
  state.words.turnRecap = [];
  state.words.recapData = null;
  state.words.gameExhausted = false;
  state.words.turnRule = null;
  state.words.turnDuration = state.words.turnSeconds;
  state.words.singleGuessMember = null;

  const teamCount = getWordsTeamCount();
  state.words.teamCount = teamCount;
  if (state.words.teamMode === 'random') {
    state.words.teams = distributePlayersRandomly(teamCount);
  } else {
    state.words.teams = buildManualWordTeams(teamCount);
  }

  state.words.teamTurnIndex = state.words.teams.map(() => 0);
  state.words.currentTeamIndex = getNextActiveWordTeamIndex(0);
  clearInterval(state.words.turnInterval);
  state.words.turnDeadline = Date.now() + (state.words.turnSeconds * 1000);

  state.words.scores = {};
  state.words.teams.forEach(team => {
    state.words.scores[team.name] = 0;
  });

  document.getElementById('words-setup').style.display = 'none';
  document.getElementById('words-game').style.display  = 'block';
  document.getElementById('words-team-badge').textContent = cat;
  document.getElementById('words-turn-recap').style.display = 'none';
  document.getElementById('words-live-area').style.display = 'none';

  prepareWordsTurn();
}

function renderWords() {
  const prompts = state.words.prompts;
  const currentTurn = getCurrentWordTurn();
  const prompt = prompts[state.words.promptIndex];
  const timerDisplayBig = document.getElementById('words-turn-timer-big');
  const ring = document.getElementById('words-ring-fg');
  const timerWrap = document.querySelector('.words-timer-wrap');
  const passDisplay = document.getElementById('words-pass-count');
  const turnLabel = document.getElementById('words-turn-label');
  const teamsControls = document.getElementById('words-all-teams-controls');
  const actionButtons = document.querySelectorAll('.words-action-btn');
  const canAct = !!currentTurn && state.words.promptIndex < prompts.length && !!prompt;
  const recapPanel = document.getElementById('words-turn-recap');
  const liveArea = document.getElementById('words-live-area');

  if (recapPanel) recapPanel.style.display = 'none';
  if (liveArea) liveArea.style.display = 'block';

  const effectiveDuration = Math.max(1, state.words.turnDuration || state.words.turnSeconds);
  const minutes = String(Math.floor(Math.max(0, state.words.turnLeft) / 60)).padStart(2, '0');
  const seconds = String(Math.max(0, state.words.turnLeft) % 60).padStart(2, '0');
  if (timerDisplayBig) timerDisplayBig.textContent = `${minutes}:${seconds}`;
  if (ring) {
    const offset = WORDS_TIMER_CIRCUMFERENCE * (1 - state.words.turnLeft / effectiveDuration);
    ring.style.strokeDasharray = `${WORDS_TIMER_CIRCUMFERENCE}`;
    ring.style.strokeDashoffset = `${offset}`;
    ring.classList.toggle('danger', state.words.turnLeft <= 10);
  }
  if (timerWrap) timerWrap.classList.toggle('critical', state.words.turnLeft <= 10 && canAct);
  if (passDisplay) passDisplay.textContent = `${state.words.passesUsed}/3`;
  actionButtons.forEach(button => { button.disabled = !canAct; });

  if (!currentTurn) {
    const wordEl = document.getElementById('words-taboo-word');
    const forbidEl = document.getElementById('words-forbidden-list');
    if (wordEl) wordEl.textContent = 'Nessun turno disponibile';
    if (forbidEl) forbidEl.innerHTML = '';
    clearInterval(state.words.turnInterval);
    return;
  }

  const teamBadge = document.getElementById('words-team-badge');
  const playerName = document.getElementById('words-player-name');
  if (teamBadge) teamBadge.textContent = currentTurn.team.name;
  if (playerName) playerName.textContent = currentTurn.player;

  const onlyOneMember = !!(state.words.turnRule && state.words.turnRule.requireSingleMember);
  const singleMemberName = state.words.singleGuessMember || currentTurn.player;
  if (turnLabel) {
    turnLabel.innerHTML = onlyOneMember
      ? `Indovina solo: <strong>${singleMemberName}</strong>`
      : `Turno di <strong>${currentTurn.player}</strong>`;
  }

  const allTeamsMode = !!(state.words.turnRule && state.words.turnRule.allTeamsCanScore);
  if (teamsControls) {
    if (allTeamsMode) {
      renderWordsAllTeamsControls();
      teamsControls.style.display = 'grid';
    } else {
      teamsControls.style.display = 'none';
      teamsControls.innerHTML = '';
    }
  }

  if (state.words.promptIndex >= prompts.length || !prompt) {
    const wordEl = document.getElementById('words-taboo-word');
    const forbidEl = document.getElementById('words-forbidden-list');
    if (wordEl) wordEl.textContent = '🏁 Prompt finiti!';
    if (forbidEl) forbidEl.innerHTML = '<div class="taboo-empty">Guarda i punteggi finali.</div>';
    clearInterval(state.words.turnInterval);
  } else {
    const parsed = parseTabooPrompt(prompt);
    const wordEl = document.getElementById('words-taboo-word');
    const forbidEl = document.getElementById('words-forbidden-list');
    if (wordEl) {
      wordEl.textContent = parsed.target;
    }
    if (forbidEl) {
      const html = parsed.forbidden.map(word =>
        `<span class="taboo-forbidden-item">${word}</span>`
      ).join('');
      forbidEl.innerHTML = html;
    }
  }

  updateWordsActionButtons();
}

function nextWords() {
  advanceWordsPrompt('guessed');
}

function startWordsTurnTimer() {
  clearInterval(state.words.turnInterval);
  state.words.turnInterval = setInterval(() => {
    const msLeft = state.words.turnDeadline - Date.now();
    state.words.turnLeft = Math.max(0, Math.ceil(msLeft / 1000));

    const timerDisplayBig = document.getElementById('words-turn-timer-big');
    const ring = document.getElementById('words-ring-fg');
    const timerWrap = document.querySelector('.words-timer-wrap');
    const minutes = String(Math.floor(state.words.turnLeft / 60)).padStart(2, '0');
    const seconds = String(state.words.turnLeft % 60).padStart(2, '0');
    if (timerDisplayBig) timerDisplayBig.textContent = `${minutes}:${seconds}`;
    if (ring) {
      const total = Math.max(1, state.words.turnDuration || state.words.turnSeconds);
      const offset = WORDS_TIMER_CIRCUMFERENCE * (1 - state.words.turnLeft / total);
      ring.style.strokeDasharray = `${WORDS_TIMER_CIRCUMFERENCE}`;
      ring.style.strokeDashoffset = `${offset}`;
      ring.classList.toggle('danger', state.words.turnLeft <= 10);
    }
    if (timerWrap) timerWrap.classList.toggle('critical', state.words.turnLeft <= 10);

    if (msLeft <= 0) {
      clearInterval(state.words.turnInterval);
      finishWordsTurn();
    }
  }, 100);
}

function renderWordsAllTeamsControls() {
  const container = document.getElementById('words-all-teams-controls');
  if (!container) return;

  container.innerHTML = `
    <div class="words-all-team-row">
      <span>Sfida aperta: possono indovinare tutti. Il punteggio si modifica solo nel recap turno.</span>
    </div>
  ` + Object.entries(state.words.scores)
    .map(([teamName, score]) => `
      <div class="words-all-team-row">
        <span>${teamName} <strong>(${score})</strong></span>
      </div>
    `).join('');
}

function updateWordsActionButtons() {
  const passBtn = document.getElementById('btn-pass');
  const passDisplay = document.getElementById('words-pass-count');
  if (!passBtn || !passDisplay) return;

  passBtn.classList.toggle('limit-reached', state.words.passesUsed >= 3);
  passBtn.textContent = state.words.passesUsed >= 3 ? 'Passo esaurito' : 'Passo';
  passDisplay.textContent = `${Math.max(0, 3 - state.words.passesUsed)}/3`;
}

function getCurrentWordsTarget() {
  const prompt = state.words.prompts[state.words.promptIndex];
  if (!prompt) return '—';
  const parsed = parseTabooPrompt(prompt);
  return parsed.target || prompt;
}

function advanceWordsPrompt(action) {
  const currentTurn = getCurrentWordTurn();
  if (!currentTurn) return;

  if (action === 'pass' && state.words.passesUsed >= 3) {
    return;
  }

  // Sospendi timer prima di modificare lo state
  clearInterval(state.words.turnInterval);

  if (action === 'guessed') {
    state.words.scores[currentTurn.team.name] = (state.words.scores[currentTurn.team.name] || 0) + 1;
  }

  if (action === 'buzz') {
    state.words.scores[currentTurn.team.name] = (state.words.scores[currentTurn.team.name] || 0) - 1;
  }

  if (action === 'pass') {
    state.words.passesUsed += 1;
  }

  state.words.turnRecap.push({
    word: getCurrentWordsTarget(),
    action
  });

  state.words.promptIndex += 1;

  if (state.words.promptIndex >= state.words.prompts.length) {
    state.words.gameExhausted = true;
    finishWordsTurn();
    return;
  }

  renderWords();
  
  // Riavvia timer
  startWordsTurnTimer();
}

function buzzWord() {
  advanceWordsPrompt('buzz');
}

function guessedWord() {
  advanceWordsPrompt('guessed');
}

function passWord() {
  advanceWordsPrompt('pass');
}

function finishWordsTurn() {
  const currentTurn = getCurrentWordTurn();
  if (!currentTurn) return;

  clearInterval(state.words.turnInterval);

  state.words.recapData = {
    teamName: currentTurn.team.name,
    playerName: currentTurn.player,
    items: [...state.words.turnRecap]
  };

  renderWordsTurnRecap();

  state.words.teamTurnIndex[currentTurn.teamIndex] = currentTurn.playerIndex + 1;
  state.words.currentTeamIndex = getNextActiveWordTeamIndex(currentTurn.teamIndex + 1);
  state.words.turnRecap = [];
  state.words.turnRule = null;
  state.words.singleGuessMember = null;

  if (state.words.currentTeamIndex === -1) {
    clearInterval(state.words.turnInterval);
  }
}

function renderWordsTurnRecap() {
  const recapPanel = document.getElementById('words-turn-recap');
  const liveArea = document.getElementById('words-live-area');
  const title = document.getElementById('words-recap-title');
  const list = document.getElementById('words-recap-list');
  const teamName = document.getElementById('words-recap-team-name');
  const teamScore = document.getElementById('words-recap-team-score');
  const data = state.words.recapData;
  if (!recapPanel || !liveArea || !title || !list || !teamName || !teamScore || !data) return;

  title.textContent = `${data.playerName} · ${data.teamName}`;
  teamName.textContent = data.teamName;
  teamScore.textContent = String(state.words.scores[data.teamName] ?? 0);

  if (!data.items.length) {
    list.innerHTML = '<div class="words-recap-item recap-pass">Nessuna parola gestita nel turno.</div>';
  } else {
    list.innerHTML = data.items.map(item => {
      let cls = 'recap-pass';
      let label = 'Passo';

      if (item.action === 'guessed') {
        cls = 'recap-guessed';
        label = 'Indovinata';
      }
      if (item.action === 'buzz') {
        cls = 'recap-buzz';
        label = 'Buzz';
      }

      return `<div class="words-recap-item ${cls}"><span>${item.word}</span><small>${label}</small></div>`;
    }).join('');
  }

  renderWordsRecapScores();

  liveArea.style.display = 'none';
  recapPanel.style.display = 'block';
}

function renderWordsRecapScores() {
  const container = document.getElementById('words-recap-scores');
  if (!container) return;

  container.innerHTML = Object.entries(state.words.scores)
    .sort((a, b) => b[1] - a[1])
    .map(([name, score]) => `
      <div class="words-recap-score-row">
        <span>${name}</span>
        <strong>${score}</strong>
      </div>
    `).join('');
}

function adjustWordsRecapScore(delta) {
  const data = state.words.recapData;
  if (!data) return;

  const team = data.teamName;
  state.words.scores[team] = (state.words.scores[team] || 0) + delta;

  const teamScore = document.getElementById('words-recap-team-score');
  if (teamScore) teamScore.textContent = String(state.words.scores[team]);

  renderWordsRecapScores();
}

function continueWordsTurn() {
  const recapPanel = document.getElementById('words-turn-recap');
  const liveArea = document.getElementById('words-live-area');
  if (recapPanel) recapPanel.style.display = 'none';
  if (liveArea) liveArea.style.display = 'block';

  state.words.recapData = null;

  if (state.words.gameExhausted || state.words.promptIndex >= state.words.prompts.length) {
    clearInterval(state.words.turnInterval);
    renderWords();
    return;
  }

  if (state.words.currentTeamIndex === -1) {
    clearInterval(state.words.turnInterval);
    renderWords();
    return;
  }

  prepareWordsTurn();
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
