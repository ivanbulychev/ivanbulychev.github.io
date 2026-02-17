// ======= JAPA COUNTER =======
let count = 0;
let round = 1;

const countEl = document.getElementById("current-count");
const roundEl = document.getElementById("current-round");
const roundsSelect = document.getElementById("rounds");
const plusBtn = document.getElementById("plus");
const resetBtn = document.getElementById("reset");
const updateFooter = document.getElementById("update-footer");

function updateDisplay() {
  countEl.textContent = count;
  roundEl.textContent = round;
}

function checkDone() {
  const maxRounds = parseInt(roundsSelect.value, 10);
  if (round > maxRounds) {
    plusBtn.disabled = true;
    roundEl.textContent = maxRounds;
    countEl.textContent = 108;
    return true;
  } else {
    plusBtn.disabled = false;
    return false;
  }
}

plusBtn.addEventListener("click", () => {
  count++;
  if (count > 108) {
    count = 1;
    round++;
  }
  updateDisplay();
  checkDone();
});

resetBtn.addEventListener("click", () => {
  count = 0;
  round = 1;
  updateDisplay();
  plusBtn.disabled = false;
});

// ======= SERVICE WORKER =======
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").then(reg => {

    // Обновление найдено
    reg.onupdatefound = () => {
      const newWorker = reg.installing;

      newWorker.onstatechange = () => {
        if (newWorker.state === "installed") {
          // Если уже есть контролирующий SW → значит есть обновление
          if (navigator.serviceWorker.controller) {
            const p = document.createElement("p");
            p.innerHTML = 'Доступна <a id="update-app">новая версия</a>';
            updateFooter.appendChild(p);

            const link = document.getElementById("update-app");
            link.addEventListener("click", (e) => {
              e.preventDefault();
              newWorker.postMessage({ action: "skipWaiting" });
            });
          }
        }
      };
    };
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}
