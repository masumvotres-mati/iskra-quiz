"use strict";

let soundContext;
let soundOutput;

const soundPatterns = {
  click: { notes: [650], duration: 0.035, spacing: 0, volume: 0.025 },
  correct: { notes: [523.25, 659.25, 783.99], duration: 0.14, spacing: 0.065, volume: 0.045 },
  incorrect: { notes: [293.66, 261.63], duration: 0.14, spacing: 0.09, volume: 0.03 },
  streak: { notes: [659.25, 783.99, 1046.5], duration: 0.18, spacing: 0.075, volume: 0.045 },
  complete: { notes: [523.25, 659.25, 783.99, 1046.5], duration: 0.24, spacing: 0.09, volume: 0.045 },
  finish: { notes: [523.25, 659.25], duration: 0.18, spacing: 0.08, volume: 0.035 },
  "island-place": { notes: [392, 523.25], duration: 0.1, spacing: 0.055, volume: 0.025 },
  "island-grow": { notes: [659.25, 880], duration: 0.16, spacing: 0.07, volume: 0.035 },
  "island-signal": { notes: [1046.5, 1318.51, 1046.5], duration: 0.1, spacing: 0.08, volume: 0.025 },
  "island-notice": { notes: [587.33, 880], duration: .12, spacing: .09, volume: .025 },
  "island-effort": { notes: [196, 220, 196], duration: .075, spacing: .11, volume: .023 },
  "island-splash": { notes: [1174.66, 783.99, 523.25], duration: .075, spacing: .045, volume: .022 },
  "island-discover": { notes: [659.25, 987.77, 1318.51], duration: .16, spacing: .09, volume: .027 },
  "island2-level": { notes: [392, 659.25, 1046.5], duration: .3, spacing: .065, volume: .04, wave: "triangle", overtone: .16 },
  "island2-max": { notes: [523.25, 783.99, 1046.5, 1318.51], duration: .38, spacing: .055, volume: .044, wave: "triangle", overtone: .18 },
  "island2-touch": { notes: [293.66], duration: .065, spacing: 0, volume: .018 },
};

function updateSoundControl() {
  const button = document.getElementById("sound-toggle");
  button.textContent = courseState.muted ? "♪ ×" : "♪";
  button.setAttribute("aria-label", courseState.muted ? "Włącz dźwięki" : "Wycisz dźwięki");
  button.setAttribute("aria-pressed", String(!courseState.muted));
  if (soundOutput) soundOutput.gain.setTargetAtTime(courseState.muted ? 0 : 1, soundContext.currentTime, 0.01);
  document.dispatchEvent(new Event("iskra-sound-change"));
}

function getSoundContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    notifyCourse("Ta przeglądarka nie obsługuje dźwięków quizu.");
    return null;
  }
  try {
    if (!soundContext) {
      soundContext = new AudioContextClass();
      soundOutput = soundContext.createGain();
      soundOutput.connect(soundContext.destination);
    }
    if (soundContext.state === "suspended") {
      soundContext.resume().catch(() => notifyCourse("Nie udało się włączyć dźwięku. Sprawdź ustawienia przeglądarki."));
    }
    return soundContext;
  } catch (error) {
    notifyCourse("Dźwięk jest niedostępny. Możesz nadal korzystać z quizu bez dźwięku.");
    return null;
  }
}

function playSound(kind) {
  if (courseState.muted) return;
  const pattern = soundPatterns[kind];
  if (!pattern) {
    notifyCourse("Nie rozpoznano efektu dźwiękowego.");
    return;
  }
  if (!getSoundContext()) return;
  try {
    pattern.notes.forEach((frequency, index) => {
      const start = soundContext.currentTime + index * pattern.spacing;
      const voices = pattern.overtone ? [1, pattern.overtone] : [1];
      voices.forEach((strength, voice) => {
        const oscillator = soundContext.createOscillator();
        const volume = soundContext.createGain();
        oscillator.type = voice ? "sine" : pattern.wave || "sine";
        oscillator.frequency.setValueAtTime(frequency * (voice ? 2 : 1), start);
        volume.gain.setValueAtTime(0, start);
        volume.gain.linearRampToValueAtTime(pattern.volume * strength, start + 0.006);
        volume.gain.exponentialRampToValueAtTime(0.001, start + pattern.duration);
        oscillator.connect(volume);
        volume.connect(soundOutput);
        oscillator.addEventListener("ended", () => {
          oscillator.disconnect();
          volume.disconnect();
        }, { once: true });
        oscillator.start(start);
        oscillator.stop(start + pattern.duration + 0.01);
      });
    });
  } catch (error) {
    notifyCourse("Dźwięk jest niedostępny. Możesz nadal korzystać z quizu bez dźwięku.");
  }
}

document.getElementById("sound-toggle").addEventListener("click", () => {
  courseState.muted = !courseState.muted;
  saveCourseState();
  updateSoundControl();
  playSound("click");
});
document.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("button") : null;
  if (button && !button.disabled && button.id !== "sound-toggle" && !button.matches(".answer-select, .timeline-place, [data-feedback-sound]")) {
    if (button.id === "next" && !document.getElementById("results").hidden) return;
    if (button.id === "timeline-next" && !document.getElementById("timeline-results").hidden) return;
    playSound("click");
  }
});
updateSoundControl();
