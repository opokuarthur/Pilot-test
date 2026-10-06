// Narration, split into on-screen caption chunks.
// `at` is seconds from the START OF THE SCENE. A chunk stays up until the next
// chunk (or the end of the scene). Wrap words in *stars* to highlight them gold.
// Captions use the voiceover text verbatim, so they double as the VO script.
export type ScriptLine = { at: number; text: string };

export const SCRIPT: Record<string, ScriptLine[]> = {
  coldOpen: [
    { at: 0.3, text: "You put in *500 cedis.*" },
    { at: 2.4, text: "The app shows you've made *2,000.*" },
    { at: 4.6, text: "You tap *withdraw...* and nothing." },
    { at: 7.4, text: "*Pending.* Pending. Pending." },
    { at: 10.6, text: "If this happened to you this year," },
    { at: 12.8, text: "you're *not alone.*" },
  ],
  yepbit: [
    { at: 0.3, text: "*YepBit* looked like a real crypto exchange." },
    { at: 4.4, text: "Charts, profits, a community." },
    { at: 8.0, text: "Then in July, Ghana's *SEC* warned the public:" },
    { at: 12.2, text: "YepBit is *not licensed.*" },
    { at: 15.4, text: "Days later, investors started reporting the same thing." },
    { at: 20.4, text: "Withdrawals *frozen.*" },
  ],
  cwpc: [
    { at: 0.3, text: "Then came *CWPC.*" },
    { at: 2.4, text: "You probably didn't hear about it from an ad." },
    { at: 6.3, text: "You heard about it from a *friend,*" },
    { at: 9.0, text: "a *family member,* someone you *trust.*" },
    { at: 12.6, text: "That's how it *spread.*" },
    { at: 15.2, text: "Now reports say *thousands of Ghanaians*" },
    { at: 18.6, text: "may have lost *millions of cedis,*" },
    { at: 21.2, text: "and the SEC is bringing in" },
    { at: 22.8, text: "the *Cyber Security Authority.*" },
  ],
  list: [
    { at: 0.3, text: "And it's not just *two apps.*" },
    { at: 3.2, text: "The SEC has named *23 platforms*" },
    { at: 6.4, text: "operating in Ghana *without a licence.*" },
  ],
  twist: [
    { at: 0.3, text: "But here's the thing." },
    { at: 2.4, text: "Ghana has *seen this movie* before." },
    { at: 5.6, text: "In *2018,* Menzgold." },
    { at: 9.4, text: "Thousands of people *locked out* of their money." },
    { at: 13.8, text: "The case is *still in court* today." },
    { at: 17.4, text: "Before that, in *2015:* DKM." },
    { at: 21.4, text: "Nearly *a hundred thousand* claims." },
    { at: 24.8, text: "Over *five hundred million* cedis." },
    { at: 28.8, text: "Different names." },
    { at: 31.0, text: "*Same story.*" },
  ],
  ponzi: [
    { at: 0.3, text: "It's called a *Ponzi scheme.*" },
    { at: 3.0, text: "Your 'profit' isn't *profit.*" },
    { at: 6.0, text: "It's the money of the *next person who joined.*" },
    { at: 11.2, text: "It works..." },
    { at: 13.2, text: "until new people *stop coming.*" },
    { at: 17.2, text: "Then the last people in" },
    { at: 19.6, text: "*lose everything.*" },
  ],
  redFlags: [
    { at: 0.3, text: "So before you invest:" },
    { at: 2.0, text: "if the returns are *guaranteed* and too high, *run.*" },
    { at: 6.4, text: "If you earn by *bringing people in,* *run.*" },
    { at: 10.4, text: "If it's not *licensed by the SEC,* *run.*" },
    { at: 14.4, text: "Check first, and the SEC has a *free line* for that." },
    { at: 19.0, text: "Because somewhere right now," },
    { at: 21.0, text: "someone is about to tap *'withdraw.'*" },
    { at: 23.0, text: "And it's going to say... *pending.*" },
  ],
};
