// "Five Thousand Plates" narration, split into on-screen caption chunks.
// `at` is seconds from the START OF THE SCENE. A chunk stays up until the next
// chunk (or the end of the scene). Wrap words in *stars* to highlight them gold.
// Captions use the voiceover text verbatim, so they double as the VO script.
// The video is silent: timings are estimates (~150 wpm) for a later voiceover.
import type { ScriptLine } from "../lib/timeline";

export const PLATES_SCRIPT = {
  hook: [
    { at: 0.3, text: "*One man.*" },
    { at: 1.3, text: "*One day.*" },
    { at: 2.4, text: "*Five thousand plates.*" },
    { at: 4.4, text: "Ghana has been arguing about this for over a year." },
    { at: 8.4, text: "So today, we're *doing the math.*" },
  ],
  who: [
    { at: 0.3, text: "This is Richard Nii Armah Quaye, *RNAQ.*" },
    { at: 3.6, text: "Born in *Jamestown.*" },
    { at: 5.6, text: "By his own story, he sold *akpeteshie,*" },
    { at: 8.6, text: "travelled abroad, and worked in a kitchen" },
    { at: 11.2, text: "*washing plates.*" },
    { at: 12.8, text: "He says he made his first million *by 27.*" },
    { at: 16.4, text: "At *40,* a Bugatti, a private jet," },
    { at: 19.4, text: "and one of the biggest birthday parties Ghana has ever seen." },
  ],
  claim: [
    { at: 0.3, text: "It was one line in his story that set Ghana off:" },
    { at: 3.8, text: "*five thousand plates a day.*" },
    { at: 6.4, text: "People went online and started *calculating.*" },
    { at: 9.6, text: "Then, on *The Delay Show,* he doubled down." },
    { at: 13.4, text: "He said it *wasn't exaggerated,*" },
    { at: 15.6, text: "and that 5,000 was actually him being *conservative.*" },
  ],
  math: [
    { at: 0.3, text: "So let's *check.*" },
    { at: 1.8, text: "Say he worked an *8-hour shift.*" },
    { at: 4.4, text: "Five thousand plates divided by eight hours" },
    { at: 7.4, text: "is *625 plates an hour.*" },
    { at: 10.0, text: "That's *one plate every six seconds.*" },
    { at: 13.4, text: "*No break.* No toilet. No phone." },
    { at: 16.4, text: "For eight hours straight." },
    { at: 18.6, text: "Even on a *12-hour shift,*" },
    { at: 21.0, text: "that's still a plate every *nine seconds.*" },
    { at: 24.4, text: "Try washing even *one plate* in six seconds at home." },
  ],
  defence: [
    { at: 0.3, text: "But here's *his side.*" },
    { at: 2.2, text: "He says big hotels in the UK" },
    { at: 4.4, text: "can host *thousands of guests* at once," },
    { at: 7.4, text: "and plates aren't just for eating." },
    { at: 10.0, text: "They're used in *food prep* too." },
    { at: 12.4, text: "Think about it." },
    { at: 13.8, text: "*Imagine* a hotel with *1,000 guests.*" },
    { at: 16.6, text: "*Three meals* a day. *Two plates* each." },
    { at: 19.8, text: "That's already *6,000 plates.*" },
    { at: 22.4, text: "In *one day.*" },
  ],
  twist: [
    { at: 0.3, text: "And most big hotel kitchens" },
    { at: 2.0, text: "don't wash plates one by one in a sink." },
    { at: 5.0, text: "They use *industrial conveyor machines.*" },
    { at: 8.2, text: "You load a full rack, it rolls through," },
    { at: 11.0, text: "and it comes out *clean.*" },
    { at: 12.8, text: "So 'washing 5,000 plates' might not mean *scrubbing.*" },
    { at: 16.4, text: "It might mean keeping that *machine fed* all day." },
  ],
  verdict: [
    { at: 0.3, text: "So is it *possible?*" },
    { at: 1.8, text: "By hand in a sink, it's *hard to believe.*" },
    { at: 5.0, text: "In a busy hotel kitchen with machines, *maybe.*" },
    { at: 8.4, text: "Either way, from Jamestown to a private jet," },
    { at: 11.2, text: "the man knows how to *tell a story.*" },
    { at: 13.6, text: "So what do you think?" },
    { at: 15.0, text: "*Possible,* or *no way?*" },
    { at: 16.8, text: "Tell us in the *comments.*" },
  ],
} satisfies Record<string, ScriptLine[]>;
