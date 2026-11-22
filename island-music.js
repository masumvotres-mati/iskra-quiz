"use strict";

const islandMelody = [
  72, 0, 76, 79, 74, 0, 72, 67,
  69, 0, 72, 76, 74, 0, 69, 67,
  72, 76, 79, 0, 81, 79, 76, 72,
  74, 0, 71, 67, 72, 0, 0, 0,
];
let islandMusicStage = 0;
let islandMusicTimer;
let islandMusicOutput;
let islandMusicStep = 0;
let islandMusicNext = 0;
const islandMusicNotes = new Set();

function stopIslandMusic() {
  window.clearInterval(islandMusicTimer);
  islandMusicTimer = undefined;
  if (islandMusicOutput && soundContext) {
    islandMusicOutput.gain.setTargetAtTime(0, soundContext.currentTime, 0.02);
  }
  for (const note of islandMusicNotes) note.stop();
  islandMusicNotes.clear();
}

function islandMusicTone(midi, start, duration, volume, type) {
  const note = soundContext.createOscillator();
  const envelope = soundContext.createGain();
  note.type = type;
  note.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), start);
  envelope.gain.setValueAtTime(0, start);
  envelope.gain.linearRampToValueAtTime(volume, start + 0.015);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  note.connect(envelope);
  envelope.connect(islandMusicOutput);
  note.addEventListener("ended", () => {
    islandMusicNotes.delete(note);
    note.disconnect();
    envelope.disconnect();
  }, { once: true });
  note.start(start);
  islandMusicNotes.add(note);
  note.stop(start + duration + 0.02);
}

function scheduleIslandMusic() {
  if (!soundContext || soundContext.state !== "running") return;
  try {
    if (islandMusicNext < soundContext.currentTime - 0.3) islandMusicNext = soundContext.currentTime + 0.03;
    while (islandMusicNext < soundContext.currentTime + 0.18) {
      const step = islandMusicStep % islandMelody.length;
      const melody = islandMelody[step];
      const root = [48, 53, 55, 48][Math.floor(step / 8)];
      if (melody && (islandMusicStage > 0 || step % 2 === 0)) {
        islandMusicTone(melody, islandMusicNext, 0.34, 0.022, "triangle");
      }
      if (step % 4 === 0) islandMusicTone(root, islandMusicNext, 0.8, 0.018, "sine");
      if (islandMusicStage > 0 && step % 4 === 2) {
        islandMusicTone(root + 19, islandMusicNext, 0.27, 0.009, "sine");
      }
      if (islandMusicStage === 2 && melody && step % 4 === 0) {
        islandMusicTone(melody + 12, islandMusicNext, 0.48, 0.009, "sine");
      }
      islandMusicStep += 1;
      islandMusicNext += 0.3;
    }
  } catch (error) {
    stopIslandMusic();
    notifyCourse("Nie udało się odtworzyć muzyki wyspy. Pozostałe funkcje gry są dostępne.");
  }
}

function updateIslandMusic() {
  if (courseState.muted || document.hidden || document.getElementById("island").hidden) {
    stopIslandMusic();
    return;
  }
  if (islandMusicTimer !== undefined) return;
  const context = getSoundContext();
  if (!context) return;
  try {
    if (!islandMusicOutput) {
      islandMusicOutput = context.createGain();
      islandMusicOutput.connect(soundOutput);
    }
    islandMusicOutput.gain.setTargetAtTime(0.6, context.currentTime, 0.08);
    islandMusicStep = 0;
    islandMusicNext = context.currentTime + 0.03;
    islandMusicTimer = window.setInterval(scheduleIslandMusic, 100);
    scheduleIslandMusic();
  } catch (error) {
    stopIslandMusic();
    notifyCourse("Muzyka wyspy jest niedostępna. Możesz grać dalej bez podkładu.");
  }
}

function setIslandMusicStage(stage) {
  islandMusicStage = stage;
  updateIslandMusic();
}

document.addEventListener("iskra-screen-change", updateIslandMusic);
document.addEventListener("iskra-sound-change", updateIslandMusic);
document.addEventListener("visibilitychange", updateIslandMusic);
