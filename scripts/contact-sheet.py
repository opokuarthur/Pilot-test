#!/usr/bin/env python3
"""Tile preview stills into one labelled contact sheet for quick review.
  python3 scripts/contact-sheet.py out/sheet.png <png> [<png> ...]
Optional env: COLS (default 5), WIDTH (tile width, default 300)."""
import os
import re
import sys

from PIL import Image, ImageDraw

out, files = sys.argv[1], sys.argv[2:]
cols = int(os.environ.get("COLS", 5))
tw = int(os.environ.get("WIDTH", 300))
ims = [Image.open(f).convert("RGB") for f in files]
th = int(tw * ims[0].height / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * (th + 22)), (0, 0, 0))
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * tw, (i // cols) * (th + 22)
    sheet.paste(im.resize((tw, th)), (x, y + 22))
    m = re.search(r"-f(\d+)\.png$", f)
    d.text((x + 4, y + 4), f"f{m.group(1) if m else i}", fill=(255, 255, 0))
sheet.save(out)
print(out)
