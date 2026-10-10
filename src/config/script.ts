// Narration, split into on-screen caption chunks.
// `at` is seconds from the START OF THE SCENE. A chunk stays up until the next
// chunk (or the end of the scene). Wrap words in *stars* to highlight them gold.
// Captions use the voiceover text verbatim, so they double as the VO script.
// Timings are synced to the ElevenLabs voiceover (public/audio/withdrawal-pending-vo.mp3):
// each `at` is the moment the chunk's first word is spoken, minus 0.1 s, from the
// forced alignment in scripts/voiceover/ (see voiceover.words.json there).
import type { ScriptLine } from "../lib/timeline";

export const SCRIPT: Record<string, ScriptLine[]> = {
  coldOpen: [
    { at: 0.1, text: "You put in *500 cedis.*" },
    { at: 2.79, text: "The app shows you've made *2,000.*" },
    { at: 5.91, text: "You tap *withdraw...* and nothing." },
    { at: 9.93, text: "*Pending.* Pending. Pending." },
    { at: 14.04, text: "If this happened to you this year," },
    { at: 16.13, text: "you're *not alone.*" },
  ],
  yepbit: [
    { at: 0.26, text: "*YepBit* looked like a real crypto exchange." },
    { at: 3.02, text: "Charts, profits, a community." },
    { at: 6.46, text: "Then in July, Ghana's *SEC* warned the public:" },
    { at: 11.33, text: "YepBit is *not licensed.*" },
    { at: 14.2, text: "Days later, investors started reporting the same thing." },
    { at: 19.38, text: "Withdrawals *frozen.*" },
  ],
  cwpc: [
    { at: 0.26, text: "Then came *CWPC.*" },
    { at: 4.26, text: "You probably didn't hear about it from an ad." },
    { at: 7.7, text: "You heard about it from a *friend,*" },
    { at: 9.57, text: "a *family member,* someone you *trust.*" },
    { at: 12.2, text: "That's how it *spread.*" },
    { at: 14.34, text: "Now reports say *thousands of Ghanaians*" },
    { at: 16.78, text: "may have lost *millions of cedis,*" },
    { at: 19.11, text: "and the SEC is bringing in" },
    { at: 20.91, text: "the *Cyber Security Authority.*" },
  ],
  list: [
    { at: 0.24, text: "And it's not just *two apps.*" },
    { at: 2.07, text: "The SEC has named *23 platforms*" },
    { at: 4.87, text: "operating in Ghana *without a licence.*" },
  ],
  twist: [
    { at: 0.25, text: "But here's the thing." },
    { at: 1.66, text: "Ghana has *seen this movie* before." },
    { at: 3.88, text: "In *2018,* Menzgold." },
    { at: 6.92, text: "Thousands of people *locked out* of their money." },
    { at: 10.0, text: "The case is *still in court* today." },
    { at: 12.76, text: "Before that, in *2015:* DKM." },
    { at: 16.59, text: "Nearly *a hundred thousand* claims." },
    { at: 19.21, text: "Over *five hundred million* cedis." },
    { at: 22.47, text: "Different names." },
    { at: 23.86, text: "*Same story.*" },
  ],
  ponzi: [
    { at: 0.25, text: "It's called a *Ponzi scheme.*" },
    { at: 2.48, text: "Your 'profit' isn't *profit.*" },
    { at: 5.02, text: "It's the money of the *next person who joined.*" },
    { at: 7.59, text: "It works..." },
    { at: 8.7, text: "until new people *stop coming.*" },
    { at: 10.84, text: "Then the last people in" },
    { at: 12.13, text: "*lose everything.*" },
  ],
  redFlags: [
    { at: 0.25, text: "So before you invest:" },
    { at: 2.21, text: "if the returns are *guaranteed* and too high, *run.*" },
    { at: 5.88, text: "If you earn by *bringing people in,* *run.*" },
    { at: 8.94, text: "If it's not *licensed by the SEC,* *run.*" },
    { at: 13.24, text: "Check first, and the SEC has a *free line* for that." },
    { at: 17.98, text: "Because somewhere right now," },
    { at: 19.76, text: "someone is about to tap *'withdraw.'*" },
    { at: 22.46, text: "And it's going to say... *pending.*" },
  ],
};
