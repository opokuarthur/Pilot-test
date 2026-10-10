# Voiceover script for ElevenLabs

**Withdrawal Pending: Ghana's Ponzi Problem** · target length 2:40

Paste each scene block into ElevenLabs as **its own generation**, so you end up with 7 clips (`scene1.mp3` … `scene7.mp3`). There are three reasons:
- ElevenLabs can start speeding up or glitching when one generation contains lots of pause tags.
- If one line comes out wrong, you only regenerate that scene.
- Each clip lines up with the start of its scene in the video, which makes syncing easy.

## How the script is marked up
- `<break time="1.0s" />` is a silent pause. The pauses are timed so each line lands when its caption and visuals appear. ElevenLabs allows pauses of up to 3 seconds.
- `...` gives a short, natural hesitation for suspense.
- Numbers are written as words (e.g. "twenty-three"), so the voice can't read them wrongly.
- Acronyms are written as letters: **S.E.C.**, **C.W.P.C.**, **D.K.M.** If the voice says "sec" as a word, change it to `S-E-C` and regenerate.

## Suggested settings
Check these against the current ElevenLabs options.
- **Model:** Multilingual v2 (or another model that supports `<break>` tags). Eleven v3 uses its own audio tags instead of `<break>`; if you use v3, replace each break with `...` or a pause tag and listen back.
- **Voice:** a calm, serious documentary voice. To keep a Ghanaian accent, pick a Ghanaian or West African voice from the Voice Library, or clone your own voice.
- **Stability** about 45–55%, **Similarity** about 75%, **Style** 0–15%, **Speed** about 0.95.

---

## Scene 1 — Cold open (0:00–0:15)
*Tone: quiet, close, slightly frustrated. The three "Pending"s get flatter each time.*
```
You put in five hundred cedis. <break time="0.3s" /> The app shows you've made... two thousand. <break time="0.6s" /> You tap withdraw... <break time="0.5s" /> and nothing. <break time="1.0s" /> Pending. <break time="0.6s" /> Pending. <break time="0.6s" /> Pending. <break time="1.2s" /> If this happened to you this year, <break time="0.3s" /> you're not alone. <break time="1.0s" />
```

## Scene 2 — YepBit (0:15–0:40)
*Tone: upbeat at first, then the turn on "Then in July". Let "frozen" hang.*
```
YepBit looked like a real crypto exchange. <break time="1.2s" /> Charts, <break time="0.3s" /> profits, <break time="0.3s" /> a community. <break time="1.2s" /> Then in July, Ghana's S.E.C. warned the public: <break time="0.8s" /> YepBit is not licensed. <break time="1.5s" /> Days later, investors started reporting the same thing. <break time="1.5s" /> Withdrawals... frozen. <break time="3.0s" />
```

## Scene 3 — CWPC (0:40–1:05)
*Tone: warm and personal on "friend… family… trust", then serious.*
```
Then came C.W.P.C. <break time="1.0s" /> You probably didn't hear about it from an ad. <break time="0.6s" /> You heard about it from a friend, <break time="0.4s" /> a family member, <break time="0.3s" /> someone you trust. <break time="1.0s" /> That's how it spread. <break time="1.0s" /> Now reports say thousands of Ghanaians <break time="0.2s" /> may have lost millions of cedis, <break time="0.4s" /> and the S.E.C. is bringing in the Cyber Security Authority. <break time="1.0s" />
```

## Scene 4 — The list (1:05–1:15)
*Tone: matter-of-fact, punchy. Stress "twenty-three".*
```
And it's not just two apps. <break time="0.6s" /> The S.E.C. has named twenty-three platforms <break time="0.3s" /> operating in Ghana without a licence. <break time="1.5s" />
```

## Scene 5 — The twist (1:15–1:50)
*Tone: storyteller. Slow down for the history, and land "Same story" heavily.*
```
But here's the thing. <break time="0.6s" /> Ghana has seen this movie before. <break time="1.0s" /> In twenty eighteen... <break time="0.4s" /> Menzgold. <break time="2.0s" /> Thousands of people locked out of their money. <break time="1.2s" /> The case is still in court today. <break time="1.2s" /> Before that, in twenty fifteen: <break time="0.4s" /> D.K.M. <break time="1.8s" /> Nearly a hundred thousand claims. <break time="1.5s" /> Over five hundred million cedis. <break time="2.0s" /> Different names. <break time="1.2s" /> Same story. <break time="3.0s" />
```

## Scene 6 — How it works (1:50–2:15)
*Tone: explaining, then ominous. "lose everything" is the lowest, slowest line.*
```
It's called a Ponzi scheme. <break time="0.8s" /> Your "profit" isn't profit. <break time="1.2s" /> It's the money of the next person who joined. <break time="1.5s" /> It works... <break time="1.2s" /> until new people stop coming. <break time="1.8s" /> Then the last people in... <break time="0.6s" /> lose everything. <break time="3.0s" />
```

## Scene 7 — Red flags + ending (2:15–2:40)
*Tone: direct and urgent on each "run", then hushed for the ending. The final "pending" is almost a whisper.*
```
So before you invest: <break time="0.4s" /> if the returns are guaranteed and too high, <break time="0.2s" /> run. <break time="0.8s" /> If you earn by bringing people in, <break time="0.2s" /> run. <break time="0.8s" /> If it's not licensed by the S.E.C., <break time="0.2s" /> run. <break time="0.8s" /> Check first, and the S.E.C. has a free line for that. <break time="1.2s" /> Because somewhere right now, <break time="0.4s" /> someone is about to tap "withdraw." <break time="0.6s" /> And it's going to say... <break time="1.0s" /> pending.
```

---

## After generating
Send the clips back (7 scene files, or one combined file). Each clip will be placed at the start of its scene. The video will then be retimed to the real voice: captions on the spoken words, and taps, slams and the collapse on their beats, with music ducked under the voice if you add a music track.
