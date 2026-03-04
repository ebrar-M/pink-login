// ---------- Helpers ----------
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// ---------- Elements ----------
const pupils = [...document.querySelectorAll(".pupil")];
const eyes = [...document.querySelectorAll(".eye")];
const scene = document.getElementById("scene");
const parallaxItems = [...document.querySelectorAll(".parallax")];

const loginBtn = document.getElementById("loginBtn");
const form = document.getElementById("loginForm");
const email = document.getElementById("email");
const emailHint = document.getElementById("emailHint");
const pw = document.getElementById("password");
const pwError = document.getElementById("pwError");
const togglePw = document.getElementById("togglePw");

// ---------- Config / State ----------
const MAX_PUPIL = 7;
const PARALLAX_MAX = 10;

let overrideTarget = null; // button hover target
let isShy = false;         // password focus state

// ---------- Password show/hide ----------
togglePw.addEventListener("click", () => {
  const isPw = pw.type === "password";
  pw.type = isPw ? "text" : "password";
  togglePw.textContent = isPw ? "🙈" : "👁️";
});

// ---------- Form validation (simple) ----------
const isEmailValid = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

email.addEventListener("input", () => {
  if (!email.value) emailHint.textContent = "";
  else emailHint.textContent = isEmailValid(email.value) ? "ok" : "hmm";
});

pw.addEventListener("input", () => {
  if (!pw.value) pwError.textContent = "";
  else if (pw.value.length < 6) pwError.textContent = "Şifre en az 6 karakter olsun.";
  else pwError.textContent = "";
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const okEmail = isEmailValid(email.value);
  const okPw = pw.value.length >= 6;

  if (!okEmail) {
    email.focus();
    emailHint.textContent = "email?";
  }
  if (!okPw) {
    pw.focus();
    pwError.textContent = "Şifre en az 6 karakter olsun.";
  }

  if (okEmail && okPw) {
    blinkAll(2);
    loginBtn.textContent = "Logged in ✓";
    setTimeout(() => (loginBtn.textContent = "Log in"), 1200);
  }
});

// ---------- Shy mode (password focus) ----------
pw.addEventListener("focus", () => {
  isShy = true;
  scene.classList.add("shy");
});

pw.addEventListener("blur", () => {
  isShy = false;
  scene.classList.remove("shy");
});

// ---------- Eyes follow target ----------
function updateEyes(mx, my) {
  pupils.forEach((pupil) => {
    const eye = pupil.parentElement;
    const rect = eye.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = mx - cx;
    const dy = my - cy;

    const angle = Math.atan2(dy, dx);

    const dist = Math.min(Math.hypot(dx, dy), 140);
    const strength = (dist / 140) * MAX_PUPIL;

    const x = Math.cos(angle) * strength;
    const y = Math.sin(angle) * strength;

    pupil.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  });
}

// ---------- Parallax ----------
function updateParallax(mx, my) {
  const rect = scene.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const nx = clamp((mx - cx) / (rect.width / 2), -1, 1);
  const ny = clamp((my - cy) / (rect.height / 2), -1, 1);

  parallaxItems.forEach((el) => {
    const depth = Number(el.dataset.depth || 0.1);
    const x = nx * PARALLAX_MAX * depth;
    const y = ny * PARALLAX_MAX * depth;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });
}

// ---------- Mouse move handler ----------
document.addEventListener("mousemove", (e) => {
  // shy modda gözler takip etmesin (CSS zaten arkaya baktırıyor)
  if (!isShy) {
    const mx = overrideTarget?.x ?? e.clientX;
    const my = overrideTarget?.y ?? e.clientY;
    updateEyes(mx, my);
  }

  // parallax her zaman çalışsın (shy modda bile titreme üstüne hafif hareket)
  updateParallax(e.clientX, e.clientY);
});

// ---------- Look at login button on hover (only if not shy) ----------
function setOverrideToElement(el) {
  const r = el.getBoundingClientRect();
  overrideTarget = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

loginBtn.addEventListener("mouseenter", () => {
  if (isShy) return;
  setOverrideToElement(loginBtn);
});
loginBtn.addEventListener("mousemove", () => {
  if (isShy) return;
  setOverrideToElement(loginBtn);
});
loginBtn.addEventListener("mouseleave", () => {
  overrideTarget = null;
});

// ---------- Random blinking ----------
function blinkOnce() {
  eyes.forEach((eye) => eye.classList.add("blink"));
  setTimeout(() => eyes.forEach((eye) => eye.classList.remove("blink")), 140);
}

function blinkAll(times = 1) {
  let i = 0;
  const run = () => {
    blinkOnce();
    i++;
    if (i < times) setTimeout(run, 180);
  };
  run();
}

function scheduleBlink() {
  const t = 1600 + Math.random() * 3200;
  setTimeout(() => {
    const double = Math.random() < 0.18;
    blinkAll(double ? 2 : 1);
    scheduleBlink();
  }, t);
}
scheduleBlink();