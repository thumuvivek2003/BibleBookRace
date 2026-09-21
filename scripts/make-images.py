#!/usr/bin/env python3
"""
Generates the derived image files in public/ from the source art in src/assets/.

Why three places:
  src/assets/            the original art, kept as the source of truth.
  src/assets/generated/  trimmed, resized copies the app imports through
                         src/assets/imgs.js. The originals carry a white
                         surround that would show as a white slab in the dark
                         themes, and 1254px is far more than the screen needs.
  public/                files something outside the bundle asks for by name:
                         browser favicons, the iOS home-screen icon, and the
                         link-preview card crawlers fetch.

Run after changing either source image:

    python3 scripts/make-images.py

Requires Pillow (pip install Pillow). Not part of `npm run build` - the outputs
are committed, so a plain checkout builds without Python.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / 'src/assets/MainPage.webp'
ICON = ROOT / 'src/assets/Icon.webp'
OUT = ROOT / 'public'
GENERATED = ROOT / 'src/assets/generated'

SENTINEL = (255, 0, 255)


def trim_surround(path):
    """Drop the white border and turn the rounded corners transparent.

    A flood fill from the corners is used rather than a whiteness threshold:
    the illustration has white clouds and cream lettering inside it, which a
    threshold would punch holes in.
    """
    image = Image.open(path).convert('RGB')
    image = image.crop(image.convert('L').point(lambda v: 0 if v > 244 else 255).getbbox())

    probe = image.copy()
    for corner in [
        (0, 0),
        (probe.width - 1, 0),
        (0, probe.height - 1),
        (probe.width - 1, probe.height - 1),
    ]:
        ImageDraw.floodfill(probe, corner, SENTINEL, thresh=30)

    alpha = Image.new('L', image.size, 255)
    alpha.putdata([0 if px == SENTINEL else 255 for px in list(probe.getdata())])
    alpha = alpha.filter(ImageFilter.GaussianBlur(1.2))

    image.putalpha(alpha)
    return image


def social_card(width=1200, height=630, pad=16):
    """1.91:1 link preview.

    The art is square, so the sides are filled with a blurred copy of the art
    itself. A flat slab or a white frame makes a shared link look like a
    screenshot; this reads as one picture.
    """
    art = trim_surround(ART)

    scale = max(width / art.width, height / art.height)
    cover = art.convert('RGB').resize(
        (round(art.width * scale), round(art.height * scale)), Image.LANCZOS
    )
    left, top = (cover.width - width) // 2, (cover.height - height) // 2
    card = cover.crop((left, top, left + width, top + height)).filter(ImageFilter.GaussianBlur(38))
    card = ImageEnhance.Brightness(card).enhance(0.92)

    size = height - pad * 2
    scaled = art.resize((size, size), Image.LANCZOS)
    card.paste(scaled, ((width - size) // 2, pad), scaled)

    # JPEG, not WebP: every crawler reads it, and the file is small anyway.
    card.save(OUT / 'social-card.jpg', 'JPEG', quality=86, optimize=True, progressive=True)
    return 'social-card.jpg'


def save_png(image, path):
    """Palette-quantise the bigger icons.

    A full-colour PNG of this artwork is ~300 KB; the gradients survive a
    256-colour palette fine at icon sizes, and the file drops by two thirds.
    """
    if max(image.size) >= 128:
        # FASTOCTREE is the only quantiser Pillow allows for images with alpha.
        image.convert('RGBA').quantize(colors=255, method=Image.FASTOCTREE).save(path, optimize=True)
    else:
        image.save(path, optimize=True)


def icons():
    """Browser and home-screen icons."""
    icon = trim_surround(ICON)
    written = []

    for size in (32, 192, 512):
        name = f'favicon-{size}.png'
        save_png(icon.resize((size, size), Image.LANCZOS), OUT / name)
        written.append(name)

    # iOS ignores transparency and composites onto black, so the home-screen
    # icon gets an opaque background sampled from the artwork itself.
    backdrop = icon.convert('RGB').resize((1, 1)).getpixel((0, 0))
    apple = Image.new('RGB', (180, 180), backdrop)
    scaled = icon.resize((180, 180), Image.LANCZOS)
    apple.paste(scaled, (0, 0), scaled)
    save_png(apple, OUT / 'apple-touch-icon.png')
    written.append('apple-touch-icon.png')

    return written


def in_app():
    """Trimmed, screen-sized copies for the app itself.

    Transparent corners so the art sits on any of the five themes, and small
    enough that the landing page is not a megabyte of hero image.
    """
    written = []
    for source, name, size in ((ART, 'hero.webp', 900), (ICON, 'mark.webp', 256)):
        image = trim_surround(source)
        image.resize((size, size), Image.LANCZOS).save(
            GENERATED / name, 'WEBP', quality=88, method=6
        )
        written.append(name)
    return written


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    GENERATED.mkdir(parents=True, exist_ok=True)

    for name in [social_card(), *icons()]:
        print(f'  wrote public/{name}  ({(OUT / name).stat().st_size // 1024} KB)')
    for name in in_app():
        print(f'  wrote src/assets/generated/{name}  ({(GENERATED / name).stat().st_size // 1024} KB)')
