// Background music: plays music/ballerina-song.mp3 softly on repeat.
// Browsers only allow sound after the visitor interacts, so it starts on the first tap/click/key.
(() => {
  // The MP3 itself is already made 10 dB quieter (iPhones ignore volume set in code).
  const VOLUME = 0.8; // extra softening on other devices (0–1)
  const btn = document.getElementById("music-btn");
  if (!btn) return;

  const audio = new Audio("music/ballerina-song.mp3");
  audio.loop = true;
  audio.preload = "none"; // don't download until it's needed
  audio.volume = 0;

  let playing = false;
  let muted = false;
  try { muted = localStorage.getItem("emma-music") === "off"; } catch {}

  let fadeTimer;
  function fadeTo(target, ms, done) {
    clearInterval(fadeTimer);
    const steps = 20;
    const delta = (target - audio.volume) / steps;
    let i = 0;
    fadeTimer = setInterval(() => {
      i++;
      audio.volume = Math.min(1, Math.max(0, audio.volume + delta));
      if (i >= steps) {
        clearInterval(fadeTimer);
        audio.volume = target;
        done?.();
      }
    }, ms / steps);
  }

  function play() {
    audio.play().then(() => {
      playing = true;
      updateBtn();
      fadeTo(VOLUME, 1500); // fade in
    }).catch(() => {
      playing = false;
      updateBtn();
    });
  }

  function pause() {
    playing = false;
    updateBtn();
    fadeTo(0, 400, () => audio.pause()); // fade out
  }

  function updateBtn() {
    btn.classList.toggle("on", playing);
    btn.setAttribute("aria-pressed", String(playing));
    btn.setAttribute("aria-label", playing ? "Turn music off" : "Turn music on");
    btn.textContent = playing ? "🎵" : "🔇";
  }

  btn.addEventListener("click", () => {
    const turnOn = !playing;
    if (turnOn) play();
    else pause();
    muted = !turnOn;
    try { localStorage.setItem("emma-music", turnOn ? "on" : "off"); } catch {}
  });

  // Start softly on the first interaction anywhere (unless they turned it off before)
  const events = ["pointerdown", "keydown", "touchend"];
  const start = (e) => {
    if (btn.contains(e.target)) return;
    events.forEach((ev) => removeEventListener(ev, start, true));
    if (!muted) play();
  };
  events.forEach((ev) => addEventListener(ev, start, true));

  // Pause when the tab/app is in the background, resume when back
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) audio.pause();
    else if (playing) audio.play().catch(() => {});
  });

  updateBtn();
})();
