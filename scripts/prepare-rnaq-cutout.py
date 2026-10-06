#!/usr/bin/env python3
"""Prepare the RNAQ photo cutout used by Scene 2 of "Five Thousand Plates".

  python3 scripts/prepare-rnaq-cutout.py

public/assets/rnaq/rnaq-portrait.png  (source, left untouched)
  -> public/assets/rnaq/rnaq-cutout.png

Steps: background removal only if the source isn't already transparent
(needs `pip install rembg`), crop off the chair posts/seat at the bottom
corners (everything below CHAIR_CROP_Y), trim empty margins. No flipping,
resizing, retouching or sharpening: the face is left exactly as shot.
"""
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/assets/rnaq/rnaq-portrait.png"
OUT = ROOT / "public/assets/rnaq/rnaq-cutout.png"
# Chair pieces start at y≈815 (right post) / y≈826 (left post) in the 1263×902 source.
CHAIR_CROP_Y = 810

im = Image.open(SRC).convert("RGBA")
alpha = np.array(im)[..., 3]
if (alpha < 10).mean() < 0.2:
    from rembg import remove  # only needed for photos with a background

    im = remove(im).convert("RGBA")

im = im.crop((0, 0, im.width, min(CHAIR_CROP_Y, im.height)))
bbox = im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
im = im.crop(bbox)
im.save(OUT, optimize=True)
print(f"{OUT.relative_to(ROOT)}: {im.width}x{im.height}")
