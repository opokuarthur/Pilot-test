#!/usr/bin/env python3
"""Forced-align a voiceover to a video's caption script, to sync captions and
scene timings to the real narration (works offline: pocketsphinx ships its
own English model).

  pip install pocketsphinx           # once (a venv is fine)
  python3 scripts/voiceover/align.py <voiceover.mp3> <script.ts> <out.words.json>

<script.ts> is a caption script like src/config/script.ts (scene keys with
{ at, text } chunks). Output: one entry per spoken word with its caption
chunk index and start/end seconds, plus a per-chunk summary printed to stdout.
Words the model's dictionary doesn't know (brand names, numbers) are spelled
phonetically via PRONOUNCE below; extend it for new videos.
"""
import difflib
import json
import os
import re
import subprocess
import sys

from pocketsphinx import Decoder, get_model_path

# Spoken forms for words not in the CMU dictionary (or written as digits).
PRONOUNCE = {
    "500": "five hundred", "2,000": "two thousand", "23": "twenty three", "2018": "twenty eighteen", "2015": "twenty fifteen",
    "yepbit": "yep bit", "cwpc": "c w p c", "sec": "s e c", "dkm": "d k m", "menzgold": "mens gold",
    "cedis": "see this", "ghanaians": "ghana ions", "licence": "license",
}


def chunks_from_script(path):
    src = open(path, encoding="utf8").read()
    out, scene = [], None
    for m in re.finditer(r'^\s*(\w+): \[|\{ at: ([\d.]+), text: "((?:[^"\\]|\\.)*)" \}', src, re.M):
        if m.group(1):
            scene = m.group(1)
        else:
            out.append({"scene": scene, "text": m.group(3)})
    return out


def words_of(text):
    out = []
    for w in text.replace("*", "").replace("’", "'").lower().split():
        w = w.replace("...", "").strip(".,:;!?\"'")
        if w:
            out.extend(PRONOUNCE.get(w, w).split())
    return out


def main(audio, script, out_path):
    chunks = chunks_from_script(script)
    seq = [(i, w) for i, c in enumerate(chunks) for w in words_of(c["text"])]
    vocab = {l.split()[0].split("(")[0] for l in open(os.path.join(get_model_path(), "en-us", "cmudict-en-us.dict"), encoding="utf8")}
    oov = sorted({w for _, w in seq if w not in vocab})
    if oov:
        sys.exit(f"Add these to PRONOUNCE: {oov}")
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", audio, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], check=True, capture_output=True).stdout
    dec = Decoder(samprate=16000, beam=1e-120, wbeam=1e-100, pbeam=1e-120, maxhmmpf=-1)
    dec.set_align_text(" ".join(w for _, w in seq))
    dec.start_utt()
    dec.process_raw(raw, full_utt=True)
    dec.end_utt()
    got = [(s.word.split("(")[0], s.start_frame / 100, (s.end_frame + 1) / 100) for s in dec.seg() if s.word not in ("<s>", "</s>", "<sil>", "[NOISE]")]
    sm = difflib.SequenceMatcher(a=[w for _, w in seq], b=[w for w, _, _ in got], autojunk=False)
    res = []
    for blk in sm.get_matching_blocks():
        for k in range(blk.size):
            ci, w = seq[blk.a + k]
            _, s0, e0 = got[blk.b + k]
            res.append({"chunk": ci, "word": w, "start": s0, "end": e0})
    json.dump(res, open(out_path, "w"), indent=0)
    print(f"aligned {len(res)} of {len(seq)} words")
    first = {}
    for r in res:
        first.setdefault(r["chunk"], r["start"])
    for i, c in enumerate(chunks):
        print(f"{first.get(i, float('nan')):7.2f}  {c['scene']:10s} {c['text']}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
