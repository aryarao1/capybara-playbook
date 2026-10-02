# Capybara Playbook

A complete, responsive ten-page illustrated book: front cover, eight interior pages, and back cover. The original PNG artwork is copied byte-for-byte into `assets/`; the approved sequence and source checksums are recorded in `assets/pages.json`.

Open `index.html` directly, or serve this directory with `python3 -m http.server 4187 --bind 127.0.0.1` and visit http://127.0.0.1:4187. Previous/next buttons, left/right keys, Home/End, swiping, page dots, and a thumbnail picker navigate the book. Reduced-motion preferences are respected. The PDF download works offline. Artwork is static; gameplay will be added separately.

The portable illustrated PDF is `output/pdf/capybara-playbook.pdf`. It contains the same ten full images in order, with no cropping, added text, blank pages, or game instructions. PDF bookmarks name each page.

## GitHub Pages

This directory is a static site with relative URLs and no build step or external dependencies. Published from the `main` branch root using GitHub Pages at https://aryarao1.github.io/capybara-playbook/. Repository: https://github.com/aryarao1/capybara-playbook.

## Rebuild PDF

Run `scripts/assemble.py` with Python, Pillow, and ReportLab. It uses the approved local assets. Optionally set `CAPYBARA_SOURCE` to the original image directory to recopy the source PNGs. Keep `assets/pages.json` and `pages.js` with the site.
