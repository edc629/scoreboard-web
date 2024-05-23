var noSleep = new NoSleep(true);
const defaultMaxScore = 21;
var currentScores = { A: { s: 0, w: 0 }, B: { s: 0, w: 0 } };
var currentMaxScore = defaultMaxScore;
var prevField = null;
var currentField = null;
var currentGameIndex = 0;
var currentGameHistory = [{ A: { d: 0, p: [2, 1] }, B: { d: 0, p: [2, 1] } }];
var resetTimeoutHandle = null;

function updateMenu() {
  var undo = document.getElementById("undo");
  if (currentGameIndex > 0) {
    undo.classList.remove("inactive");
  } else {
    undo.classList.add("inactive");
  }
  var redo = document.getElementById("redo");
  if (currentGameIndex == (currentGameHistory.length - 1)) {
    redo.classList.add("inactive");
  } else {
    redo.classList.remove("inactive");
  }
}

function updateField(field) {
  prevField = currentField;
  if (prevField) {
    prevField.classList.remove("active");
  }
  currentField = document.getElementById(field);
  currentField.classList.add("active");
  updateMenu();
}

function updatePlayer(game) {
  var fieldAL = document.getElementById("field-a-l");
  fieldAL.innerText = game.A.p[0];
  var fieldAR = document.getElementById("field-a-r");
  fieldAR.innerText = game.A.p[1];
  var fieldBL = document.getElementById("field-b-l");
  fieldBL.innerText = game.B.p[0];
  var fieldBR = document.getElementById("field-b-r");
  fieldBR.innerText = game.B.p[1];
}

function updateScore(data) {
  var scorea = document.getElementById("score-a");
  scorea.innerText = String(data.A.s).padStart(2, '0');
  var scoreb = document.getElementById("score-b");
  scoreb.innerText = String(data.B.s).padStart(2, '0');
  var wina = document.getElementById("win-a");
  wina.innerText = String(data.A.w).padStart(2, '0');
  var winb = document.getElementById("win-b");
  winb.innerText = String(data.B.w).padStart(2, '0');
}

function resetGame() {
  currentScores.A.s = 0;
  currentScores.B.s = 0;
  currentGameIndex = 0;
  currentGameHistory = [{ A: { d: 0, p: [2, 1] }, B: { d: 0, p: [2, 1] } }];
  currentMaxScore = defaultMaxScore;
}

function shiftGame(v) {
  var currentGame = null;
  if (v < 0) {
    if (currentGameIndex == 0)
      return;
    currentGame = currentGameHistory[currentGameIndex];
    currentScores.A.s -= currentGame.A.d;
    currentScores.B.s -= currentGame.B.d;
    currentGameIndex--;
    currentGame = currentGameHistory[currentGameIndex];
  } else {
    if (currentGameIndex == (currentGameHistory.length - 1))
      return;
    currentGameIndex++;
    currentGame = currentGameHistory[currentGameIndex];
    currentScores.A.s += currentGame.A.d;
    currentScores.B.s += currentGame.B.d;
  }
  updateScore(currentScores);
  if (currentGame.A.d > 0) {
    updateField(currentScores.A.s % 2 == 0 ? "field-a-r" : "field-a-l");
  } else {
    updateField(currentScores.B.s % 2 == 0 ? "field-b-r" : "field-b-l");
  }
  updatePlayer(currentGame);
}

function checkScore(scores, game) {
  if (scores.A.s == currentMaxScore || scores.B.s == currentMaxScore) {
    resetGame();
    updateScore(scores);
    updateField(scores.A.w < scores.B.w ? "field-a-r" : "field-b-r");
    updatePlayer(currentGameHistory[currentGameIndex]);
  }
  else {
    if (scores.A.s == scores.B.s) {
      if (scores.A.s >= 20) {
        currentMaxScore = scores.A.s + 2;
      }
      if (scores.A.s == 0) {
        updateField(scores.A.w < scores.B.w ? "field-a-r" : "field-b-r");
      } else {
        if (game.A.d > 0) {
          updateField(scores.A.s % 2 == 0 ? "field-a-r" : "field-a-l");
        } else {
          updateField(scores.B.s % 2 == 0 ? "field-b-r" : "field-b-l");
        }
      }
    } else {
      if (game.A.d > 0) {
        updateField(scores.A.s % 2 == 0 ? "field-a-r" : "field-a-l");
      } else {
        updateField(scores.B.s % 2 == 0 ? "field-b-r" : "field-b-l");
      }
    }
    updatePlayer(game);
  }
  localStorage.setItem("scores", JSON.stringify(scores));
}

function getScoreInfo() {
  var scores = localStorage.getItem("scores");
  if (scores) {
    currentScores = JSON.parse(scores);
  }
  var history = localStorage.getItem("history");
  if (history) {
    currentGameHistory = JSON.parse(history);
    currentGameIndex = currentGameHistory.length - 1;
    var currentGame = currentGameHistory[currentGameIndex];
    var isTeamA = (currentGameHistory[currentGameIndex].A.d > 0);
    if (isTeamA) {
      updateField(currentScores.A.s % 2 == 0 ? "field-a-r" : "field-a-l", currentGame);
    } else {
      updateField(currentScores.B.s % 2 == 0 ? "field-b-r" : "field-b-l", currentGame);
    }
  }
  updateScore(currentScores);
  checkScore(currentScores, currentGameHistory[currentGameIndex]);
}

function pushGameHistory(game) {
  currentGameHistory.push(structuredClone(game));
  localStorage.setItem("history", JSON.stringify(currentGameHistory));
  currentGameIndex++;
}

function increaseScore(id) {
  if (currentScores.A.s == 99 || currentScores.B.s == 99 || currentScores.A.w == 99 || currentScores.B.w == 99)
    return;
  if (currentGameIndex != (currentGameHistory.length - 1)) {
    currentGameHistory = currentGameHistory.slice(0, currentGameIndex + 1);
  }
  var currentGame = structuredClone(currentGameHistory[currentGameIndex]);
  var isTeamA = (currentGame.A.d > 0);
  switch (id) {
    case "score-a":
      currentScores.A.s += 1;
      if (currentScores.A.s == currentMaxScore)
        currentScores.A.w += 1;
      currentGame.A.d = 1;
      currentGame.B.d = 0;
      if (isTeamA) { currentGame.A.p.reverse(); }
      break;
    case "score-b":
      currentScores.B.s += 1;
      if (currentScores.B.s == currentMaxScore)
        currentScores.B.w += 1;
      currentGame.A.d = 0;
      currentGame.B.d = 1;
      if (!isTeamA) { currentGame.B.p.reverse(); }
      break;
  }
  pushGameHistory(currentGame);
  updateScore(currentScores);
  checkScore(currentScores, currentGame);
}

function resetAllGames() {
  currentScores = { A: { s: 0, w: 0 }, B: { s: 0, w: 0 } };
  resetGame();
  updateScore(currentScores);
  checkScore(currentScores, currentGameHistory[currentGameIndex]);
  localStorage.removeItem("history");
}

document.addEventListener("readystatechange", () => {
  if (document.readyState == "complete") {
    document.addEventListener('click', function enableNoSleep() {
      document.removeEventListener('click', enableNoSleep, false);
      noSleep.enable();
    }, false);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (e) => {
      if (e.data == "installed") {
        window.location.reload();
      }
    });
    navigator.serviceWorker.register("/scoreboard-web/sw.min.js");
  }
  getScoreInfo();
  var scores = document.getElementsByClassName("score");
  for (var i = 0; i < scores.length; i++) {
    scores[i].addEventListener("click", (e) => {
      increaseScore(e.target.id);
    });
  }
  var reset = document.getElementById("reset");
  var eventDown = "mousedown";
  var eventUp = "mouseup";
  if ('ontouchstart' in window) {
    eventDown = "touchstart";
    eventUp = "touchend";
  }
  reset.addEventListener(eventDown, (e) => {
    resetTimeoutHandle = setTimeout(resetAllGames, 3000);
  });
  reset.addEventListener(eventUp, (e) => {
    if (resetTimeoutHandle) {
      clearTimeout(resetTimeoutHandle);
      resetTimeoutHandle = null;
    }
  });
  var reload = document.getElementById("reload");
  reload.addEventListener("click", (e) => {
    navigator.serviceWorker.controller.postMessage("delete-cache");
  });
  var undo = document.getElementById("undo");
  undo.addEventListener("click", (e) => {
    shiftGame(-1);
  });
  var redo = document.getElementById("redo");
  redo.addEventListener("click", (e) => {
    shiftGame(1);
  });
});
