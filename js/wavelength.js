/* =============================================
   PARTY GAMES — js/wavelength.js
   Mini versione di Wavelength a squadre
   ============================================= */

const WAVELENGTH_SPECTRA = [
  ['Molto caldo', 'Molto freddo'],
  ['Molto facile', 'Molto difficile'],
  ['Molto rumoroso', 'Molto silenzioso'],
  ['Molto utile', 'Molto inutile'],
  ['Molto elegante', 'Molto tamarro'],
  ['Molto salutare', 'Molto malsano'],
  ['Molto noioso', 'Molto divertente'],
  ['Molto economico', 'Molto costoso'],
  ['Molto reale', 'Molto finto'],
  ['Molto innocuo', 'Molto pericoloso'],
  ['Molto comune', 'Molto raro'],
  ['Molto romantico', 'Per niente romantico']
];

const wavelengthState = {
  players: [],
  roundsToPlay: 8,
  round: 1,
  teams: [],
  currentTeamIndex: 0,
  currentSpectrum: null,
  secretValue: 50,
  secretRangeMin: 40,
  secretRangeMax: 60,
  guessValue: 50,
  phase: 'setup'
};

function snapWavelengthToStep(value) {
  return Math.max(0, Math.min(100, Math.round((Number(value) || 0) / 5) * 5));
}

function renderWavelengthStacks() {
  const stacks = document.querySelectorAll('.wavelength-stack');
  stacks.forEach(stack => {
    const interactive = stack.classList.contains('interactive');
    stack.innerHTML = '';

    for (let value = 100; value >= 0; value -= 5) {
      const layer = document.createElement('button');
      layer.type = 'button';
      layer.className = 'wavelength-layer';
      layer.dataset.value = String(value);
      layer.setAttribute('aria-label', `Livello ${value}%`);

      if (interactive) {
        layer.onclick = () => updateWavelengthGuess(value);
      } else {
        layer.disabled = true;
        layer.tabIndex = -1;
      }

      stack.appendChild(layer);
    }
  });

  updateWavelengthStackHighlights();
}

function setStackLayerHighlight(stack, value, className) {
  if (!stack) return;

  stack.querySelectorAll('.wavelength-layer').forEach(layer => {
    const isMatch = Number.parseInt(layer.dataset.value, 10) === value;
    layer.classList.toggle(className, isMatch);
  });
}

function updateWavelengthStackHighlights() {
  const guessStack = document.querySelector('#wavelength-guess-track .wavelength-stack');
  const briefStack = document.querySelector('#wavelength-brief .wavelength-stack');
  const revealStack = document.querySelector('#wavelength-result .wavelength-stack');

  setStackLayerHighlight(guessStack, wavelengthState.guessValue, 'selected');

  [briefStack, revealStack].forEach(stack => {
    if (!stack) return;
    stack.querySelectorAll('.wavelength-layer').forEach(layer => {
      const value = Number.parseInt(layer.dataset.value, 10);
      const inRange = value >= wavelengthState.secretRangeMin && value <= wavelengthState.secretRangeMax;
      layer.classList.toggle('target-range', inRange);
      layer.classList.toggle('target-center', value === wavelengthState.secretValue);
    });
  });

  setStackLayerHighlight(revealStack, wavelengthState.guessValue, 'revealed-guess');
}

function setWavelengthRounds(rounds) {
  wavelengthState.roundsToPlay = rounds;
  [6, 8, 10].forEach(value => {
    const btn = document.getElementById('wavelength-rounds-' + value);
    if (btn) btn.classList.toggle('active', value === rounds);
  });
}

function buildWavelengthTeams() {
  const shuffled = [...wavelengthState.players].sort(() => Math.random() - 0.5);
  const teams = [
    { name: 'Squadra Aurora', players: [], score: 0, clueIndex: 0 },
    { name: 'Squadra Tramonto', players: [], score: 0, clueIndex: 0 }
  ];

  shuffled.forEach((name, index) => {
    teams[index % 2].players.push(name);
  });

  // Garantisce almeno 1 player per team con 2+ giocatori.
  if (!teams[1].players.length && teams[0].players.length > 1) {
    teams[1].players.push(teams[0].players.pop());
  }

  wavelengthState.teams = teams;
}

function getWavelengthCurrentTeam() {
  return wavelengthState.teams[wavelengthState.currentTeamIndex] || null;
}

function getWavelengthCurrentCluegiver(team) {
  if (!team || !team.players.length) return '—';
  const idx = team.clueIndex % team.players.length;
  return team.players[idx];
}

function renderWavelengthScoreboard() {
  const container = document.getElementById('wavelength-scoreboard');
  if (!container) return;

  container.innerHTML = wavelengthState.teams.map((team, index) => `
    <div class="wavelength-team-chip ${index === wavelengthState.currentTeamIndex ? 'active' : ''}">
      <span>${team.name}</span>
      <strong>${team.score}</strong>
    </div>
  `).join('');
}

function setWavelengthPhase(phase) {
  wavelengthState.phase = phase;

  const brief = document.getElementById('wavelength-brief');
  const guess = document.getElementById('wavelength-guess');
  const result = document.getElementById('wavelength-result');
  const end = document.getElementById('wavelength-end');

  if (brief) brief.style.display = phase === 'brief' ? 'block' : 'none';
  if (guess) guess.style.display = phase === 'guess' ? 'block' : 'none';
  if (result) result.style.display = phase === 'result' ? 'block' : 'none';
  if (end) end.style.display = phase === 'end' ? 'block' : 'none';
}

function placeMarker(elementId, value) {
  const marker = document.getElementById(elementId);
  if (!marker) return;
  marker.style.bottom = Math.max(0, Math.min(100, value)) + '%';
}

function startWavelengthRound() {
  if (wavelengthState.round > wavelengthState.roundsToPlay) {
    endWavelengthGame();
    return;
  }

  const team = getWavelengthCurrentTeam();
  if (!team) return;

  const cluegiver = getWavelengthCurrentCluegiver(team);
  const spectrum = WAVELENGTH_SPECTRA[Math.floor(Math.random() * WAVELENGTH_SPECTRA.length)];
  // Centro scelto in modo da avere sempre una finestra completa di 5 strati (±10%).
  const secret = (Math.floor(Math.random() * 17) * 5) + 10;

  wavelengthState.currentSpectrum = spectrum;
  wavelengthState.secretValue = secret;
  wavelengthState.secretRangeMin = secret - 10;
  wavelengthState.secretRangeMax = secret + 10;
  wavelengthState.guessValue = 50;

  const currentTeamEl = document.getElementById('wavelength-current-team');
  const turnInfoEl = document.getElementById('wavelength-turn-info');
  const secretText = document.getElementById('wavelength-secret-value');
  const guessValue = document.getElementById('wavelength-guess-value');

  if (currentTeamEl) currentTeamEl.textContent = `${team.name} · Round ${wavelengthState.round}/${wavelengthState.roundsToPlay}`;
  if (turnInfoEl) turnInfoEl.textContent = `Suggeritore: ${cluegiver}`;
  document.querySelectorAll('.js-wavelength-left').forEach(el => {
    el.textContent = spectrum[0];
  });
  document.querySelectorAll('.js-wavelength-right').forEach(el => {
    el.textContent = spectrum[1];
  });
  if (secretText) {
    secretText.textContent = `Intervallo segreto: ${wavelengthState.secretRangeMin}% - ${wavelengthState.secretRangeMax}%`;
  }
  if (guessValue) guessValue.textContent = '50%';

  placeMarker('wavelength-secret-marker', secret);
  placeMarker('wavelength-guess-marker', 50);
  placeMarker('wavelength-reveal-secret', secret);
  placeMarker('wavelength-reveal-guess', 50);
  updateWavelengthStackHighlights();

  renderWavelengthScoreboard();
  setWavelengthPhase('brief');
}

function updateWavelengthGuess(value) {
  wavelengthState.guessValue = snapWavelengthToStep(value);

  const label = document.getElementById('wavelength-guess-value');
  if (label) label.textContent = `${wavelengthState.guessValue}%`;

  placeMarker('wavelength-guess-marker', wavelengthState.guessValue);
  updateWavelengthStackHighlights();
}

function nudgeWavelengthGuess(delta) {
  updateWavelengthGuess(wavelengthState.guessValue + delta);
}

function setWavelengthGuessFromClick(event) {
  const track = document.getElementById('wavelength-guess-track');
  if (!track) return;

  const rect = track.getBoundingClientRect();
  const offsetFromBottom = rect.bottom - event.clientY;
  const ratio = offsetFromBottom / rect.height;
  const value = snapWavelengthToStep(Math.round(ratio * 100));
  updateWavelengthGuess(value);
}

function goToWavelengthGuess() {
  setWavelengthPhase('guess');
}

function getWavelengthPoints(distance) {
  if (distance <= 5) return 4;
  if (distance <= 10) return 3;
  if (distance <= 18) return 2;
  if (distance <= 25) return 1;
  return 0;
}

function revealWavelengthRound() {
  const team = getWavelengthCurrentTeam();
  if (!team) return;

  const distance = Math.abs(wavelengthState.secretValue - wavelengthState.guessValue);
  const points = getWavelengthPoints(distance);
  team.score += points;

  const result = document.getElementById('wavelength-result-text');
  if (result) {
    result.innerHTML = `Intervallo <strong>${wavelengthState.secretRangeMin}% - ${wavelengthState.secretRangeMax}%</strong> (centro <strong>${wavelengthState.secretValue}%</strong>), guess <strong>${wavelengthState.guessValue}%</strong>.<br>Distanza dal centro: <strong>${distance}</strong> · Punti: <strong>+${points}</strong>`;
  }

  placeMarker('wavelength-reveal-secret', wavelengthState.secretValue);
  placeMarker('wavelength-reveal-guess', wavelengthState.guessValue);
  updateWavelengthStackHighlights();

  renderWavelengthScoreboard();
  setWavelengthPhase('result');
}

function nextWavelengthRound() {
  const team = getWavelengthCurrentTeam();
  if (team && team.players.length) {
    team.clueIndex = (team.clueIndex + 1) % team.players.length;
  }

  wavelengthState.currentTeamIndex = (wavelengthState.currentTeamIndex + 1) % wavelengthState.teams.length;
  wavelengthState.round += 1;
  startWavelengthRound();
}

function endWavelengthGame() {
  const endTitle = document.getElementById('wavelength-winner');
  const scores = document.getElementById('wavelength-final-scores');

  const ordered = [...wavelengthState.teams].sort((a, b) => b.score - a.score);
  const top = ordered[0];
  const second = ordered[1];

  if (endTitle) {
    if (top && second && top.score === second.score) {
      endTitle.textContent = 'Pareggio perfetto!';
    } else {
      endTitle.textContent = `${top ? top.name : 'Squadra'} vince!`;
    }
  }

  if (scores) {
    scores.innerHTML = ordered.map(team => `
      <div class="wavelength-score-row">
        <span>${team.name}</span>
        <strong>${team.score} pt</strong>
      </div>
    `).join('');
  }

  renderWavelengthScoreboard();
  setWavelengthPhase('end');
}

function startWavelength() {
  if (wavelengthState.players.length < 2) {
    alert('Aggiungi almeno 2 giocatori!');
    return;
  }

  buildWavelengthTeams();
  wavelengthState.round = 1;
  wavelengthState.currentTeamIndex = 0;

  const setup = document.getElementById('wavelength-setup');
  const game = document.getElementById('wavelength-game');
  if (setup) setup.style.display = 'none';
  if (game) game.style.display = 'block';

  startWavelengthRound();
}

/* --- Integrazione con app globale: openGame/addPlayer/remove/render tags --- */
const _origWavelengthOpenGame = typeof window.openGame === 'function' ? window.openGame : null;
window.openGame = function openGameWavelength(id) {
  if (id === 'wavelength') {
    openScreen('wavelength');

    const setup = document.getElementById('wavelength-setup');
    const game = document.getElementById('wavelength-game');
    if (setup) setup.style.display = 'block';
    if (game) game.style.display = 'none';

    wavelengthState.round = 1;
    wavelengthState.currentTeamIndex = 0;
    wavelengthState.teams = [];
    setWavelengthRounds(wavelengthState.roundsToPlay);
    renderPlayerTags('wavelength');
  } else if (_origWavelengthOpenGame) {
    _origWavelengthOpenGame(id);
  }
};

const _origWavelengthAddPlayer = typeof window.addPlayer === 'function' ? window.addPlayer : null;
const _origWavelengthRemovePlayer = typeof window.removePlayer === 'function' ? window.removePlayer : null;
const _origWavelengthRenderTags = typeof window.renderPlayerTags === 'function' ? window.renderPlayerTags : null;

window.renderPlayerTags = function renderPlayerTagsWavelength(game) {
  if (game === 'wavelength') {
    const container = document.getElementById('wavelength-players-tags');
    if (!container) return;

    container.innerHTML = wavelengthState.players.map(name => `
      <span class="player-tag">${name}
        <button onclick="removePlayer('wavelength','${name}')">×</button>
      </span>
    `).join('');
  } else if (_origWavelengthRenderTags) {
    _origWavelengthRenderTags(game);
  }
};

window.addPlayer = function addPlayerWavelength(game) {
  if (game === 'wavelength') {
    const input = document.getElementById('wavelength-player-input');
    if (!input) return;

    const name = input.value.trim();
    if (!name) return;

    if (!wavelengthState.players.includes(name)) {
      wavelengthState.players.push(name);
    }

    input.value = '';
    renderPlayerTags('wavelength');
  } else if (_origWavelengthAddPlayer) {
    _origWavelengthAddPlayer(game);
  }
};

window.removePlayer = function removePlayerWavelength(game, name) {
  if (game === 'wavelength') {
    wavelengthState.players = wavelengthState.players.filter(player => player !== name);
    renderPlayerTags('wavelength');
  } else if (_origWavelengthRemovePlayer) {
    _origWavelengthRemovePlayer(game, name);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('wavelength-player-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') addPlayer('wavelength');
    });
  }

  setWavelengthRounds(wavelengthState.roundsToPlay);
  renderWavelengthStacks();
});
