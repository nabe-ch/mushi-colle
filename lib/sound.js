'use client';

// 電子音（チップチューン風）を、Web Audio APIでその場で合成する（ピクセリウムの lib/sound.js と同じ方式）。
// 音声ファイルは使わない。ブラウザは最初の操作まで音を止めるため、最初の操作の瞬間に再開する。
// BGMは、AudioContextが動いている間だけ、少し先まで予約する方式（開始遅れ・重複を防ぐ）

let audioCtx = null;
let masterGain = null;
let muted = false;
let currentTrack = null;
let loopTimer = null;
let activeOscillators = [];
let nextNoteTime = 0;
let noteIndex = 0;

const MASTER_VOLUME = 0.25;
const LOOKAHEAD_SEC = 0.8;
const SCHEDULER_INTERVAL_MS = 100;

function unlockOnGesture() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
}

function getContext() {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = muted ? 0 : MASTER_VOLUME;
    masterGain.connect(audioCtx.destination);
    for (const ev of ['pointerdown', 'touchend', 'click']) {
      document.addEventListener(ev, unlockOnGesture, { passive: true });
    }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

export function setMuted(next) {
  muted = next;
  if (masterGain) masterGain.gain.value = muted ? 0 : MASTER_VOLUME;
}

export function isMuted() {
  return muted;
}

function note(ctx, freq, start, duration, type, peak, track) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(start);
  osc.stop(start + duration + 0.02);
  if (track) {
    activeOscillators.push(osc);
    osc.onended = () => {
      activeOscillators = activeOscillators.filter((o) => o !== osc);
    };
  }
}

const N = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, C6: 1046.5,
};

// 連打のたびに鳴る、短い「トン」
export function playTick() {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  note(ctx, 220, t, 0.05, 'square', 0.35);
}

// 叩いた瞬間の重い音（強さが高いほど、少し長く）
export function playHit(level) {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  note(ctx, 110, t, 0.18 + level * 0.03, 'triangle', 0.9);
  note(ctx, 70, t, 0.25, 'square', 0.5);
}

// 虫を捕まえた音（上がる2音）
export function playCatch() {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  note(ctx, N.E5, t, 0.1, 'square', 0.4);
  note(ctx, N.G5, t + 0.08, 0.14, 'square', 0.4);
}

// 新種の音（明るい上昇アルペジオ）
export function playNew() {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  note(ctx, N.C5, t, 0.12, 'triangle', 0.5);
  note(ctx, N.E5, t + 0.1, 0.12, 'triangle', 0.5);
  note(ctx, N.G5, t + 0.2, 0.12, 'triangle', 0.5);
  note(ctx, N.C6, t + 0.3, 0.4, 'triangle', 0.55);
}

// 図鑑コンプリートのファンファーレ（上がるアルペジオ＋最後の和音）
export function playFanfare() {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  note(ctx, N.C5, t, 0.16, 'triangle', 0.5);
  note(ctx, N.E5, t + 0.14, 0.16, 'triangle', 0.5);
  note(ctx, N.G5, t + 0.28, 0.16, 'triangle', 0.5);
  note(ctx, N.C6, t + 0.42, 0.9, 'triangle', 0.6);
  note(ctx, N.G5, t + 0.42, 0.9, 'square', 0.25);
  note(ctx, N.E5, t + 0.42, 0.9, 'square', 0.2);
}

// ハンマーを買った音
export function playBuy() {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  note(ctx, N.G4, t, 0.08, 'square', 0.4);
  note(ctx, N.C5, t + 0.07, 0.08, 'square', 0.4);
  note(ctx, N.E5, t + 0.14, 0.2, 'square', 0.4);
}

// 月が現れる音：低く重い「ババーン」（2連続の重低音＋ノイズ）
export function playMoonAppear() {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  const boom = (start, f, dur, peak) => {
    note(ctx, f, start, dur, 'sine', peak);
    note(ctx, f * 2, start, dur * 0.6, 'triangle', peak * 0.5);
    note(ctx, f * 0.5, start, dur, 'square', peak * 0.25);
  };
  boom(t, 65, 0.7, 1.0);
  boom(t + 0.3, 49, 1.6, 1.0);
  // ノイズ（どーんという響き）
  const len = Math.floor(ctx.sampleRate * 0.9);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 260;
  const gain = ctx.createGain();
  gain.gain.value = 1.4;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  src.start(t + 0.3);
}

// ボタンのタップ音
export function playTap() {
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  note(ctx, 880, t, 0.06, 'square', 0.4);
  note(ctx, 1320, t + 0.045, 0.05, 'square', 0.3);
}

// BGM：明るい長調のアルペジオ（C→F→G→C）。三角波でやさしく
const BGM = [
  N.C4, N.E4, N.G4, N.E4,
  N.F4, N.A4, N.C5, N.A4,
  N.G4, N.B4, N.D5, N.B4,
  N.C4, N.E4, N.G4, N.E4,
];
const NOTE_SEC = 0.36;

function schedulerTick() {
  const ctx = audioCtx;
  if (!ctx || !currentTrack) return;
  if (ctx.state !== 'running') {
    ctx.resume().catch(() => {});
    nextNoteTime = 0;
    return;
  }
  if (nextNoteTime < ctx.currentTime) nextNoteTime = ctx.currentTime + 0.05;
  while (nextNoteTime < ctx.currentTime + LOOKAHEAD_SEC) {
    note(ctx, BGM[noteIndex % BGM.length], nextNoteTime, NOTE_SEC * 0.9, 'triangle', 0.28, true);
    nextNoteTime += NOTE_SEC;
    noteIndex += 1;
  }
}

export function startBgm() {
  if (currentTrack) return;
  if (!getContext()) return;
  currentTrack = 'main';
  noteIndex = 0;
  nextNoteTime = 0;
  schedulerTick();
  loopTimer = setInterval(schedulerTick, SCHEDULER_INTERVAL_MS);
}

export function stopBgm() {
  currentTrack = null;
  if (loopTimer) clearInterval(loopTimer);
  loopTimer = null;
  if (audioCtx) {
    const stopAt = audioCtx.currentTime + 0.05;
    for (const osc of activeOscillators) {
      try {
        osc.stop(stopAt);
      } catch {
        // すでに停止済みなら何もしない
      }
    }
  }
  activeOscillators = [];
}
