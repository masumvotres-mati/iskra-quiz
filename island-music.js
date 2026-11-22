"use strict";

const islandMelody = [
  72, 0, 76, 79, 74, 0, 72, 67,
  69, 0, 72, 76, 74, 0, 69, 67,
  72, 76, 79, 0, 81, 79, 76, 72,
  74, 0, 71, 67, 72, 0, 0, 0,
];
const island2Scores = [
  { melody: [74, 0, 69, 0, 76, 78, 76, 0, 71, 0, 74, 0, 78, 76, 71, 0,
    69, 73, 76, 0, 78, 76, 73, 69, 71, 0, 69, 0, 66, 0, 0, 0], roots: [50, 55, 57, 50], beat: .34 },
  { melody: [67, 71, 74, 0, 76, 74, 71, 69, 67, 0, 64, 67, 69, 0, 71, 0,
    72, 76, 79, 76, 74, 72, 69, 0, 71, 74, 78, 74, 71, 69, 67, 0], roots: [43, 48, 50, 43], beat: .26 },
  { melody: [72, 76, 79, 84, 83, 79, 76, 0, 77, 81, 84, 81, 79, 77, 74, 0,
    76, 79, 83, 86, 84, 83, 79, 76, 74, 77, 79, 83, 84, 0, 0, 0], roots: [48, 53, 55, 48], beat: .29 },
];
let islandMusicStage = 0;
let islandMusicTimer;
let islandMusicOutput;
let islandMusicStep = 0;
let islandMusicNext = 0;
let islandMusicPhraseStage = 0;
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
      const secondIsland = !document.getElementById("island2").hidden;
      if (islandMusicStep % 8 === 0) islandMusicPhraseStage = islandMusicStage;
      const score = secondIsland ? island2Scores[islandMusicPhraseStage] : { melody: islandMelody, roots: [48, 53, 55, 48], beat: .3 };
      const step = islandMusicStep % score.melody.length;
      const melody = score.melody[step];
      const root = score.roots[Math.floor(step / 8)];
      if (melody && (secondIsland || islandMusicStage > 0 || step % 2 === 0)) {
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
      islandMusicNext += score.beat;
    }
  } catch (error) {
    stopIslandMusic();
    notifyCourse("Nie udało się odtworzyć muzyki wyspy. Pozostałe funkcje gry są dostępne.");
  }
}

function updateIslandMusic() {
  const active = ["island", "island2"].some((id) => !document.getElementById(id).hidden);
  if (courseState.muted || document.hidden || !active) {
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
