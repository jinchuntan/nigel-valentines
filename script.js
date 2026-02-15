const openingScreen = document.getElementById("opening-screen");
const mainScreen = document.getElementById("main-screen");
const finalScreen = document.getElementById("final-screen");

const enterBtn = document.getElementById("enter-btn");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const buttonZone = document.getElementById("button-zone");

const noState = {
  currentX: null,
  currentY: null,
  targetX: null,
  targetY: null,
  rafId: null
};

function showScreen(screen) {
  [openingScreen, mainScreen, finalScreen].forEach((panel) => {
    panel.classList.remove("is-active");
  });
  screen.classList.add("is-active");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getNoBounds() {
  const zoneRect = buttonZone.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();
  const maxX = Math.max(8, zoneRect.width - noRect.width - 8);
  const maxY = Math.max(8, zoneRect.height - noRect.height - 8);
  return { zoneRect, noRect, maxX, maxY };
}

function setNoTarget(x, y) {
  const bounds = getNoBounds();
  noState.targetX = clamp(x, 8, bounds.maxX);
  noState.targetY = clamp(y, 8, bounds.maxY);
}

function seedNoState() {
  const bounds = getNoBounds();
  const left = parseFloat(noBtn.style.left);
  const top = parseFloat(noBtn.style.top);
  const fallbackX = bounds.noRect.left - bounds.zoneRect.left;
  const fallbackY = bounds.noRect.top - bounds.zoneRect.top;

  noState.currentX = Number.isFinite(left) ? left : clamp(fallbackX, 8, bounds.maxX);
  noState.currentY = Number.isFinite(top) ? top : clamp(fallbackY, 8, bounds.maxY);
  noState.targetX = noState.currentX;
  noState.targetY = noState.currentY;
}

function smoothNoMotion() {
  if (noState.currentX === null || noState.currentY === null) {
    seedNoState();
  }

  const deltaX = noState.targetX - noState.currentX;
  const deltaY = noState.targetY - noState.currentY;
  noState.currentX += deltaX * 0.34;
  noState.currentY += deltaY * 0.34;

  if (Math.abs(deltaX) < 0.2 && Math.abs(deltaY) < 0.2) {
    noState.currentX = noState.targetX;
    noState.currentY = noState.targetY;
  }

  noBtn.style.left = `${noState.currentX}px`;
  noBtn.style.top = `${noState.currentY}px`;
  noState.rafId = requestAnimationFrame(smoothNoMotion);
}

function ensureNoMotionLoop() {
  if (noState.rafId !== null) return;
  noState.rafId = requestAnimationFrame(smoothNoMotion);
}

function moveNoButtonRandomly() {
  const bounds = getNoBounds();
  const nextX = 8 + Math.random() * (bounds.maxX - 8);
  const nextY = 8 + Math.random() * (bounds.maxY - 8);
  setNoTarget(nextX, nextY);
}

function pushNoButtonAway(pointerX, pointerY) {
  const bounds = getNoBounds();
  const buttonX = noState.currentX ?? (bounds.noRect.left - bounds.zoneRect.left);
  const buttonY = noState.currentY ?? (bounds.noRect.top - bounds.zoneRect.top);

  const btnCenterX = bounds.zoneRect.left + buttonX + bounds.noRect.width / 2;
  const btnCenterY = bounds.zoneRect.top + buttonY + bounds.noRect.height / 2;

  const dx = btnCenterX - pointerX;
  const dy = btnCenterY - pointerY;
  const distance = Math.hypot(dx, dy);
  const triggerDistance = 190;

  if (distance > triggerDistance) return;

  const force = (triggerDistance - distance) / triggerDistance;
  const bump = 170 * Math.max(force, 0.32);

  const dirX = distance === 0 ? (Math.random() > 0.5 ? 1 : -1) : dx / distance;
  const dirY = distance === 0 ? (Math.random() > 0.5 ? 1 : -1) : dy / distance;

  setNoTarget(buttonX + dirX * bump, buttonY + dirY * bump);
}

function resetRosesAnimation() {
  const roses = document.querySelectorAll(".rose");
  roses.forEach((rose) => {
    rose.style.animation = "none";
    // Force reflow so animation reliably restarts each time "Yes" is clicked.
    void rose.offsetHeight;
    rose.style.animation = "";
  });
}

enterBtn.addEventListener("click", () => {
  showScreen(mainScreen);
  seedNoState();
  ensureNoMotionLoop();
  moveNoButtonRandomly();
});

yesBtn.addEventListener("click", () => {
  showScreen(finalScreen);
  resetRosesAnimation();
});

noBtn.addEventListener("mouseenter", moveNoButtonRandomly);
noBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  moveNoButtonRandomly();
});
noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  moveNoButtonRandomly();
});
noBtn.addEventListener("focus", () => {
  noBtn.blur();
  moveNoButtonRandomly();
});

buttonZone.addEventListener("pointermove", (event) => {
  pushNoButtonAway(event.clientX, event.clientY);
});

buttonZone.addEventListener("touchstart", () => {
  moveNoButtonRandomly();
}, { passive: true });

window.addEventListener("resize", () => {
  if (noState.currentX === null || noState.currentY === null) return;
  setNoTarget(noState.currentX, noState.currentY);
});
