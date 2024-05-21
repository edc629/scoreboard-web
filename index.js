const defaultMaxScore = 21;
var currentScores = { A: { s: 0, w: 0 }, B: { s: 0, w: 0 } };
var currentMaxScore = defaultMaxScore;

function checkScore(data) {
  if (data.A.s == currentMaxScore || data.B.s == currentMaxScore) {
    if (data.A.s == currentMaxScore)
      data.A.w += 1;
    if (data.B.s == currentMaxScore)
      data.B.w += 1;
    data.A.s = 0;
    data.B.s = 0;
    currentMaxScore = defaultMaxScore;
    updateScore(data);
  }
  else if (data.A.s == data.B.s && data.A.s >= 20) {
    currentMaxScore = data.A.s + 2;
  }
  localStorage.setItem("scores", JSON.stringify(data));
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

function getScoreInfo() {
  var scores = localStorage.getItem("scores");
  if (!scores) {
    localStorage.setItem("scores", JSON.stringify(currentScores));
  } else {
    currentScores = JSON.parse(scores);
  }
  updateScore(currentScores);
  checkScore(currentScores);
}

function increaseScore(id) {
  switch (id) {
    case "score-a":
      currentScores.A.s += 1;
      updateScore(currentScores);
      checkScore(currentScores);
      break;
    case "score-b":
      currentScores.B.s += 1;
      updateScore(currentScores);
      checkScore(currentScores);
      break;
  }
}

function decreaseScore(id) {
  switch (id) {
    case "de-score-a":
      if (currentScores.A.s > 0) {
        currentScores.A.s -= 1;
        updateScore(currentScores);
        checkScore(currentScores);
      }
      break;
    case "de-score-b":
      if (currentScores.B.s > 0) {
        currentScores.B.s -= 1;
        updateScore(currentScores);
        checkScore(currentScores);
      }
      break;
  }
}

window.addEventListener("load", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/scoreboard-web/sw.min.js").then((r) => {
      if (r.installing) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    });
  }
  getScoreInfo();
  var scores = document.getElementsByClassName("score");
  for (var i = 0; i < scores.length; i++) {
    scores[i].addEventListener("click", (e) => {
      increaseScore(e.target.id);
    });
  }
  var descores = document.getElementsByClassName("de-score");
  for (var i = 0; i < descores.length; i++) {
    descores[i].addEventListener("click", (e) => {
      decreaseScore(e.target.id);
    });
  }
});
