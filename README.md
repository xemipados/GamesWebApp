# 🎉 Party Games

App per giochi da fare in compagnia, accessibile da telefono via GitHub Pages.

---

## Struttura del progetto

```
party-games/
├── index.html              
├── css/
│   └── style.css           
└── js/
    ├── games-registry.js   
    └── app.js              
```

---

## Come modificare i contenuti

Apri **`js/games-registry.js`** in VS Code.

### Aggiungere domande al Quiz

```js
"Generale": [
  "Quanti pianeti ha il sistema solare?",
  "La tua nuova domanda qui...",   // ← aggiungi così
],
```

### Aggiungere una categoria al Quiz

```js
const QUIZ_CATEGORIES = {
  "Generale": [ ... ],
  "Sport": [                        // ← nuova categoria
    "Chi ha vinto i Mondiali 2022?",
    "Quanti giocatori ha una squadra di calcio?",
  ],
};
```

### Aggiungere prompt alle Parole

Stesso principio: apri `WORDS_CATEGORIES` e aggiungi stringhe o nuove modalità.

---

## Pubblicare su GitHub Pages (una volta sola)

1. Vai su [github.com](https://github.com) → **New repository**
2. Nome: `party-games` → crea pubblico
3. Carica tutti i file (trascina nella pagina del repo, oppure usa Git)
4. Vai in **Settings → Pages → Branch: main → Save**
5. Dopo ~1 minuto l'app è live su:
   ```
   https://TUONOME.github.io/party-games
   ```
6. Salva quel link come segnalibro sul telefono → **aggiungi alla schermata home**

### Aggiornare dopo modifiche

Basta caricare i file aggiornati su GitHub (trascina e "Commit changes") — si aggiorna automaticamente in pochi secondi.

---

## Aggiungere un nuovo gioco

1. **Registra il gioco** in `js/games-registry.js`:
   ```js
   const GAMES_REGISTRY = [
     { id: "quiz",  icon: "🎯", title: "Quiz",   description: "...", screen: "quiz"  },
     { id: "words", icon: "💬", title: "Parole", description: "...", screen: "words" },
     { id: "mygame", icon: "🎲", title: "Il mio gioco", description: "...", screen: "mygame" }, // ← nuovo
   ];
   ```
2. **Aggiungi la schermata HTML** in `index.html` (copia il blocco di un gioco esistente e adattalo)
3. **Aggiungi la logica JS** in `js/app.js` (o in un file separato `js/games/mygame.js`)

---

## Testare in locale (senza GitHub)

Apri semplicemente `index.html` nel browser — funziona tutto offline,  
non serve nessun server Python o Node.
