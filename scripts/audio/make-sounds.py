#!/usr/bin/env python3
"""Synthesize the channel's original background music bed and transition
whoosh (no samples, no licences needed). Requires numpy + ffmpeg.

  python3 scripts/audio/make-sounds.py

public/audio/bed-soft-unfold.mp3  ~150 s soft, slightly suspenseful lo-fi
                                  documentary bed in A minor, 72 BPM:
                                  warm pad, gentle plucked arpeggio, soft
                                  sub bass, light tape hiss, long reverb.
                                  Loops cleanly every 4 bars.
public/audio/whoosh.mp3           0.6 s airy whoosh for whip-pan transitions.

Deterministic (fixed random seed), so re-running gives identical files.
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent.parent / "public/audio"
rng = np.random.default_rng(7)

BPM = 72
BEAT = 60 / BPM
BAR = 4 * BEAT
LENGTH = 150.0

# Am – Fmaj7 – C – G/B (voicings around A3–E5), roots for the sub bass.
CHORDS = [
    (["A3", "C4", "E4", "B4"], "A1"),
    (["F3", "A3", "C4", "E4"], "F1"),
    (["C4", "E4", "G4", "D5"], "C2"),
    (["B3", "D4", "G4", "A4"], "G1"),
]
NOTES = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}


def hz(name: str) -> float:
    return 440.0 * 2 ** ((NOTES[name[0]] + 12 * (int(name[-1]) - 4)) / 12)


def lowpass(x: np.ndarray, cutoff: float) -> np.ndarray:
    """One-pole low-pass, run twice for a gentle 12 dB/oct slope."""
    a = np.exp(-2 * np.pi * cutoff / SR)
    for _ in range(2):
        y = np.empty_like(x)
        acc = 0.0
        b = 1 - a
        for i in range(0, len(x), 4096):  # blockwise loop keeps it fast enough
            blk = x[i:i + 4096]
            out = np.empty_like(blk)
            for j, v in enumerate(blk):
                acc = b * v + a * acc
                out[j] = acc
            y[i:i + 4096] = out
        x = y
    return x


def envelope(n: int, attack: float, release: float) -> np.ndarray:
    t = np.arange(n) / SR
    env = np.minimum(1, t / attack) * np.minimum(1, (n / SR - t) / release)
    return np.clip(env, 0, 1)


def pad_voice(f: float, dur: float) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    v = np.zeros(n)
    for detune in (-0.06, 0.0, 0.07):  # slightly detuned triangles = warm chorus
        ph = 2 * np.pi * f * (1 + detune / 100) * t + rng.uniform(0, 6.28)
        v += (2 / np.pi) * np.arcsin(np.sin(ph))
    v += 0.35 * np.sin(2 * np.pi * f * 2 * t)  # soft octave shimmer
    trem = 1 + 0.08 * np.sin(2 * np.pi * 0.18 * t + rng.uniform(0, 6.28))
    return v * trem * envelope(n, 1.2, 1.6)


def pluck(f: float, dur: float = 1.6) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) + 0.08 * np.sin(2 * np.pi * 3 * f * t)
    return tone * np.exp(-t * 3.2) * np.minimum(1, t / 0.004)


def reverb(x: np.ndarray, seconds: float = 2.6, mix: float = 0.35) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 6.9 / seconds)
    ir = lowpass(ir, 5000) if n < 200000 else ir
    ir /= np.sqrt((ir ** 2).sum())
    size = 1 << int(np.ceil(np.log2(len(x) + n)))
    wet = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)[: len(x)]
    return (1 - mix) * x + mix * wet * 3


def write(path: Path, stereo: np.ndarray) -> None:
    wav = path.with_suffix(".wav")
    data = (np.clip(stereo, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.T.copy().tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "192k", str(path)], check=True)
    wav.unlink()
    print(path.relative_to(path.parent.parent.parent))


def bed() -> np.ndarray:
    n = int(LENGTH * SR)
    pad = np.zeros(n)
    arp = np.zeros(n)
    sub = np.zeros(n)
    bars = int(np.ceil(LENGTH / BAR))
    for b in range(bars):
        notes, root = CHORDS[b % 4]
        start = int(b * BAR * SR)
        # Pad: whole bar, overlapping tails for smooth chord changes.
        for name in notes:
            v = pad_voice(hz(name), BAR + 1.2)
            end = min(n, start + len(v))
            pad[start:end] += v[: end - start] * 0.11
        # Sub bass: soft sine on the root.
        v = np.sin(2 * np.pi * hz(root) * np.arange(int(BAR * SR)) / SR) * envelope(int(BAR * SR), 0.3, 0.6)
        end = min(n, start + len(v))
        sub[start:end] += v[: end - start] * 0.16
        # Arpeggio: 8ths, chord tones up an octave, from bar 2, sparser every 4th bar.
        if b >= 1:
            pattern = [0, 2, 1, 3, 2, 1, 3, 2] if b % 4 != 3 else [0, None, 2, None, 1, None, 3, None]
            for k, idx in enumerate(pattern):
                if idx is None:
                    continue
                f = hz(notes[idx]) * 2
                s = start + int(k * BEAT / 2 * SR)
                v = pluck(f) * (0.09 if k % 2 == 0 else 0.065)
                end = min(n, s + len(v))
                arp[s:end] += v[: end - s]
    mono_pad = lowpass(pad, 1800)
    hiss = lowpass(rng.standard_normal(n), 6000) * 0.004
    left = reverb(mono_pad + arp * 0.9 + hiss, mix=0.4) + sub
    right = reverb(mono_pad * 0.97 + arp * 1.0 + np.roll(hiss, 1234), mix=0.42) + sub
    stereo = np.stack([left, right])
    # Gentle fade in/out so it can start/stop anywhere without clicks.
    stereo *= envelope(n, 1.5, 3.0)
    return stereo / np.abs(stereo).max() * 0.7


def whoosh() -> np.ndarray:
    dur = 0.6
    n = int(dur * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    # Sweep a resonant band-pass upward: approximate with two low-passes and a moving mix.
    lo = lowpass(noise, 600)
    hi = lowpass(noise, 3500) - lowpass(noise, 900)
    sweep = np.clip(t / dur, 0, 1)
    body = lo * (1 - sweep) + hi * sweep * 1.6
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    mono = body * env
    pan = np.clip(t / dur, 0, 1)  # moves left → right with the pan
    stereo = np.stack([mono * (1 - 0.5 * pan), mono * (0.5 + 0.5 * pan)])
    return stereo / np.abs(stereo).max() * 0.6


OUT.mkdir(parents=True, exist_ok=True)
write(OUT / "bed-soft-unfold.mp3", bed())
write(OUT / "whoosh.mp3", whoosh())
