#!/usr/bin/env python3
"""Prepare the two photo cutouts used by "Ronaldo vs Jesus".

  python3 scripts/prepare-ronaldo-cutouts.py

public/assets/ronaldo/jorge-jesus-source.png -> public/assets/ronaldo/jorge-jesus.png
public/assets/ronaldo/ronaldo-source.png     -> public/assets/ronaldo/ronaldo.png

Both sources are already background-removed (transparent PNGs), so the only
steps are crops:
  • Jorge Jesus: head and shoulders (the source already is), margins trimmed.
    No background, signage or text remains in it.
  • Ronaldo: cropped above the shirt hem (drops the kit-maker mark), keeping
    him and his applauding hands; margins trimmed.
No flipping, resizing, recolouring or retouching: faces are left as shot.
"""
from pathlib import Path

from PIL import Image

DIR = Path(__file__).resolve().parent.parent / "public/assets/ronaldo"


def trim(im: Image.Image) -> Image.Image:
    return im.crop(im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())


def jesus() -> Image.Image:
    return trim(Image.open(DIR / "jorge-jesus-source.png").convert("RGBA"))


def ronaldo() -> Image.Image:
    im = Image.open(DIR / "ronaldo-source.png").convert("RGBA")
    # The hem mark sits at y≈680–700 of the 585×780 source.
    return trim(im.crop((0, 0, im.width, 660)))


for name, fn in (("jorge-jesus.png", jesus), ("ronaldo.png", ronaldo)):
    out = fn()
    out.save(DIR / name, optimize=True)
    print(f"{name}: {out.width}x{out.height} (aspect {out.width / out.height:.4f})")
