let count = 0;
let round = 1;

const countEl = document.getElementById("current-count");
const roundEl = document.getElementById("current-round");
const roundsSelect = document.getElementById("rounds");

document.getElementById("plus").addEventListener("click", () => {
    count++;

    if (count >= 108) {
        count = 0;
        round++;
    }

    countEl.textContent = count;
    roundEl.textContent = round;
});

document.getElementById("reset").addEventListener("click", () => {
    count = 0;
    round = 1;
    countEl.textContent = 0;
    roundEl.textContent = 1;
});

// PWA
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
}
