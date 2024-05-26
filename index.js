var noSleep = new NoSleep(true);
const defaultMaxScore = 21;
var currentScores = { A: { s: 0, w: 0 }, B: { s: 0, w: 0 } };
var currentMaxScore = defaultMaxScore;
var prevField = null;
var currentField = null;
var currentGameIndex = 0;
var currentGameHistory = [{ A: { d: 0, p: [2, 1] }, B: { d: 0, p: [2, 1] } }];
var resetTimeoutHandle = null;
var currentVolume = "off";

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

function updateField(cls) {
  prevField = currentField;
  if (prevField) {
    for (var i = 0; i < prevField.length; i++) {
      prevField[i].classList.remove("active");
    }
  }
  currentField = document.getElementsByClassName(cls);
  for (var i = 0; i < currentField.length; i++) {
    currentField[i].classList.add("active");
  }
  updateMenu();
}

function updatePlayer(game) {
  var fieldAL = document.getElementsByClassName("player a l");
  for (var i = 0; i < fieldAL.length; i++) {
    fieldAL[i].innerText = game.A.p[0];
  }
  var fieldAR = document.getElementsByClassName("player a r");
  for (var i = 0; i < fieldAR.length; i++) {
    fieldAR[i].innerText = game.A.p[1];
  }
  var fieldBL = document.getElementsByClassName("player b l");
  for (var i = 0; i < fieldBL.length; i++) {
    fieldBL[i].innerText = game.B.p[0];
  }
  var fieldBR = document.getElementsByClassName("player b r");
  for (var i = 0; i < fieldBR.length; i++) {
    fieldBR[i].innerText = game.B.p[1];
  }
}

function updateScore(data) {
  var scorea = document.getElementsByClassName("score a");
  for (var i = 0; i < scorea.length; i++) {
    scorea[i].innerText = String(data.A.s).padStart(2, '0');
  }
  var scoreb = document.getElementsByClassName("score b");
  for (var i = 0; i < scoreb.length; i++) {
    scoreb[i].innerText = String(data.B.s).padStart(2, '0');
  }
  var wina = document.getElementsByClassName("win a");
  for (var i = 0; i < wina.length; i++) {
    wina[i].innerText = String(data.A.w).padStart(2, '0');
  }
  var winb = document.getElementsByClassName("win b");
  for (var i = 0; i < winb.length; i++) {
    winb[i].innerText = String(data.B.w).padStart(2, '0');
  }
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
    updateField(currentScores.A.s % 2 == 0 ? "player a r" : "player a l");
  } else {
    updateField(currentScores.B.s % 2 == 0 ? "player b r" : "player b l");
  }
  updatePlayer(currentGame);
}

function checkScore(scores, game) {
  if (scores.A.s == currentMaxScore || scores.B.s == currentMaxScore) {
    var whistle = document.getElementById("whistle-blow");
    if (whistle && currentVolume == "up") { whistle.play(); }
    resetGame();
    updateScore(scores);
    updateField(scores.A.w < scores.B.w ? "player a r" : "player b r");
    updatePlayer(currentGameHistory[currentGameIndex]);
  }
  else {
    if (scores.A.s == scores.B.s) {
      if (scores.A.s >= 20) {
        currentMaxScore = scores.A.s + 2;
      }
      if (scores.A.s == 0) {
        updateField(scores.A.w < scores.B.w ? "player a r" : "player b r");
      } else {
        if (game.A.d > 0) {
          updateField(scores.A.s % 2 == 0 ? "player a r" : "player a l");
        } else {
          updateField(scores.B.s % 2 == 0 ? "player b r" : "player b l");
        }
      }
    } else {
      if (game.A.d > 0) {
        updateField(scores.A.s % 2 == 0 ? "player a r" : "player a l");
      } else {
        updateField(scores.B.s % 2 == 0 ? "player b r" : "player b l");
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
  var volume = localStorage.getItem("volume");
  if (volume) {
    currentVolume = volume;
    document.getElementById("volume").innerText = "volume_" + currentVolume;
  }
  var history = localStorage.getItem("history");
  if (history) {
    currentGameHistory = JSON.parse(history);
    currentGameIndex = currentGameHistory.length - 1;
    var currentGame = currentGameHistory[currentGameIndex];
    var isTeamA = (currentGameHistory[currentGameIndex].A.d > 0);
    if (isTeamA) {
      updateField(currentScores.A.s % 2 == 0 ? "player a r" : "player a l", currentGame);
    } else {
      updateField(currentScores.B.s % 2 == 0 ? "player b r" : "player b l", currentGame);
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

function increaseScore(target) {
  if (currentScores.A.s == 99 || currentScores.B.s == 99 || currentScores.A.w == 99 || currentScores.B.w == 99)
    return;
  if (currentGameIndex != (currentGameHistory.length - 1)) {
    currentGameHistory = currentGameHistory.slice(0, currentGameIndex + 1);
  }
  var currentGame = structuredClone(currentGameHistory[currentGameIndex]);
  var isTeamA = (currentGame.A.d > 0);
  if ((typeof (target) == "object" && target.classList.contains("a")) || target == "a") {
    currentScores.A.s += 1;
    if (currentScores.A.s == currentMaxScore)
      currentScores.A.w += 1;
    currentGame.A.d = 1;
    currentGame.B.d = 0;
    if (isTeamA) { currentGame.A.p.reverse(); }
  } else if ((typeof (target) == "object" && target.classList.contains("b")) || target == "b") {
    currentScores.B.s += 1;
    if (currentScores.B.s == currentMaxScore)
      currentScores.B.w += 1;
    currentGame.A.d = 0;
    currentGame.B.d = 1;
    if (!isTeamA) { currentGame.B.p.reverse(); }
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

function toggleVolume(target) {
  if (target == null) target = document.getElementById("volume");
  currentVolume = currentVolume == "up" ? "off" : "up";
  target.innerText = "volume_" + currentVolume;
  localStorage.setItem("volume", currentVolume);
}

function waitForResetAllGames() {
  if (resetTimeoutHandle != null) return;
  resetTimeoutHandle = setTimeout(resetAllGames, 3000);
}

function cancelResetAllGames() {
  if (resetTimeoutHandle) {
    clearTimeout(resetTimeoutHandle);
    resetTimeoutHandle = null;
  }
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
  var enableServiceWorker = window.location.search.indexOf("nocache=1") == -1 && "serviceWorker" in navigator;
  if (enableServiceWorker) {
    navigator.serviceWorker.addEventListener("message", (e) => {
      if (e.data == "installed") {
        window.location.reload();
      }
    });
    navigator.serviceWorker.register("/scoreboard-web/sw.min.js");
  }
  getScoreInfo();
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case ",":
        shiftGame(-1);
        break;
      case ".":
        shiftGame(1);
        break;
      case "Delete":
        waitForResetAllGames();
        break;
      case "V":
      case "v":
        toggleVolume();
        break;
      case "B":
      case "b":
        increaseScore("a");
        break;
      case "R":
      case "r":
        increaseScore("b");
        break;
    }
  });
  document.addEventListener("keyup", (e) => {
    if (e.key == "Delete") {
      cancelResetAllGames();
    }
  });
  var scores = document.getElementsByClassName("score");
  for (var i = 0; i < scores.length; i++) {
    scores[i].addEventListener("click", (e) => {
      increaseScore(e.target);
    });
  }
  var reset = document.getElementById("reset");
  var eventDown = "mousedown";
  var eventUp = "mouseup";
  if ('ontouchstart' in window) {
    eventDown = "touchstart";
    eventUp = "touchend";
  }
  reset.addEventListener(eventDown, waitForResetAllGames);
  reset.addEventListener(eventUp, cancelResetAllGames);
  var reload = document.getElementById("reload");
  reload.addEventListener("click", (e) => {
    if (enableServiceWorker) {
      navigator.serviceWorker.controller.postMessage("delete-cache");
    }
  });
  var undo = document.getElementById("undo");
  undo.addEventListener("click", (e) => {
    shiftGame(-1);
  });
  var redo = document.getElementById("redo");
  redo.addEventListener("click", (e) => {
    shiftGame(1);
  });
  var volume = document.getElementById("volume");
  volume.addEventListener("click", (e) => {
    toggleVolume(e.target);
  });
});
