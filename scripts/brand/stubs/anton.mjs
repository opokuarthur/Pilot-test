// Stand-in for @remotion/google-fonts/Anton when rendering brand SVGs in
// Node: the SVG export outlines the text, so no font loading is needed.
export const loadFont = () => ({ fontFamily: "Anton" });
