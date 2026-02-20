let game = {
  players: [],
  scores: [],
  rounds: [],
  history: [],
  roundIndex: 0,
  dealerIndex: 0,
  phase: "bidding",
};

let bids = [];

/* ---------- STORAGE ---------- */

function saveGame() {
  localStorage.setItem("plumpGame", JSON.stringify(game));
}

function loadGame() {
  const saved = localStorage.getItem("plumpGame");
  if (!saved) return;
  game = JSON.parse(saved);
  document.getElementById("setup")?.classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  nextRound(true);
}
window.onload = loadGame;

/* ---------- MENU ---------- */

// Toggle hamburger-menu
function toggleMenu() {
  const overlay = document.getElementById("menuOverlay");
  if (overlay.style.display === "flex") {
    overlay.style.display = "none";
  } else {
    overlay.style.display = "flex";
  }
}

// Den här verkar inte funka.
// Klicka utanför panelen stänger menyn
overlay.addEventListener("click", (e) => {
  const panel = document.getElementById("menuPanel");
  if (!panel.contains(e.target)) {
    overlay.style.display = "none";
  }
});

function resetGame() {
  localStorage.removeItem("plumpGame");
  location.reload();
}

/* ---------- ROUNDS ---------- */

function createRounds(max = 10) {
  let r = [];
  for (let i = max; i >= 1; i--) r.push({ cards: i, dir: "⬇" });
  for (let i = 2; i <= max; i++) r.push({ cards: i, dir: "⬆" });
  return r;
}

/* ---------- SETUP ---------- */

function createPlayers() {
  const num = parseInt(document.getElementById("numPlayers").value);
  const c = document.getElementById("playerNames");
  c.innerHTML = "";
  for (let i = 0; i < num; i++) {
    c.innerHTML += `<input id="name${i}" placeholder="Spelare ${i + 1}">`;
  }
  c.innerHTML += `<button onclick="startGame(${num})">Starta spel</button>`;
}

function startGame(num) {
  game.players = [];
  game.scores = [];
  for (let i = 0; i < num; i++) {
    game.players.push(
      document.getElementById(`name${i}`).value || `Spelare ${i + 1}`,
    );
    game.scores.push(0);
  }
  game.rounds = createRounds();
  game.history = [];
  game.roundIndex = 0;
  game.dealerIndex = 0;
  document.getElementById("setup")?.remove();
  document.getElementById("game").classList.remove("hidden");
  nextRound();
}

/* ---------- ROUND ---------- */

function nextRound() {
  game.phase = "bidding";
  const btn = document.getElementById("continueBtn");
  btn.innerText = "Spara bud";

  const round = game.rounds[game.roundIndex];
  if (!round) {
    document.getElementById("roundBig").innerText = "🎉 KLART";
    return;
  }

  document.getElementById("roundBig").innerText =
    `${round.cards} KORT ${round.dir}`;
  document.getElementById("dealerInfo").innerText =
    `Given: ${game.players[game.dealerIndex]}`;

  const div = document.getElementById("bids");
  div.innerHTML = "";

  game.players.forEach((p, i) => {
    const row = document.createElement("div");
    row.className = "playerRow";

    const nameDiv = document.createElement("div");
    nameDiv.className = "playerName";
    nameDiv.innerText = p;

    const bidInput = document.createElement("input");
    bidInput.type = "number";
    bidInput.id = `bid${i}`;
    bidInput.min = 0;
    bidInput.max = round.cards;

    const resInput = document.createElement("input");
    resInput.type = "number";
    resInput.id = `res${i}`;
    resInput.disabled = true;
    resInput.min = 0;
    resInput.max = round.cards;

    row.appendChild(nameDiv);
    row.appendChild(bidInput);
    row.appendChild(resInput);

    div.appendChild(row);
  });

  updateScore();
  saveGame();
}

/* ---------- FLOW ---------- */

function continueRound() {
  const btn = document.getElementById("continueBtn");
  if (game.phase === "bidding") {
    saveBids();
    game.phase = "results";
    btn.innerText = "Rätta";
  } else {
    saveResults();
  }
  saveGame();
}

/* ---------- BIDS ---------- */

function saveBids() {
  bids = game.players.map(
    (_, i) => parseInt(document.getElementById(`bid${i}`).value) || 0,
  );
  game.players.forEach((_, i) => {
    document.getElementById(`bid${i}`).disabled = true;
    document.getElementById(`res${i}`).disabled = false;
  });
}

/* ---------- RESULTS ---------- */

function saveResults() {
  const results = game.players.map(
    (_, i) => parseInt(document.getElementById(`res${i}`).value) || 0,
  );
  const roundData = [];
  results.forEach((r, i) => {
    let pts = 0;
    if (r === bids[i]) {
      pts = 10 + r;
      game.scores[i] += pts;
    }
    roundData.push({
      name: game.players[i],
      bid: bids[i],
      got: r,
      points: pts,
    });
  });
  game.history.push({ round: game.rounds[game.roundIndex], data: roundData });
  game.roundIndex++;
  game.dealerIndex = (game.dealerIndex + 1) % game.players.length;
  nextRound();
}

/* ---------- SCORE ---------- */

function updateScore() {
  const b = document.getElementById("scoreboard");
  b.innerHTML = "";
  game.players.forEach((p, i) => {
    b.innerHTML += `<div>${p}: ${game.scores[i]}</div>`;
  });
}

/* ---------- HISTORY ---------- */

function showHistory() {
  document.getElementById("game").classList.add("hidden");
  const v = document.getElementById("historyView");
  v.classList.remove("hidden");
  const table = document.getElementById("historyTable");
  table.innerHTML = "";
  // skriv kolumnhuvuden
  table.innerHTML +=
    "<div style='display:flex; justify-content:space-around; font-weight:bold;'>";
  game.players.forEach((p) => {
    table.innerHTML += `<div>${p}</div>`;
  });
  table.innerHTML += "</div><hr style='border-color:#444'>";
  game.history.forEach((r, idx) => {
    table.innerHTML += `<div style='display:flex; justify-content:space-around;'>`;
    r.data.forEach((p) => {
      table.innerHTML += `<div>${p.bid}/${p.got} ${p.points}p</div>`;
    });
    table.innerHTML += "</div>";
  });
}

function closeHistory() {
  document.getElementById("historyView").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
}
