# Capybara Playbook

A complete, responsive ten-page illustrated book: front cover, eight interior pages, and back cover. The original PNG artwork is copied byte-for-byte into `assets/`; the approved sequence and source checksums are recorded in `assets/pages.json`.

Open `index.html` directly, or serve this directory with `python3 -m http.server 4187 --bind 127.0.0.1` and visit http://127.0.0.1:4187. Previous/next buttons, left/right keys, Home/End, swiping, page dots, and a thumbnail picker navigate the book. Reduced-motion preferences are respected. The PDF is for printing; play in the web book. The eight interior pages support movable pieces and activities. Wide screens show two-page spreads; phones show one page at a time. Sound on/off is always available and remembered, with sound initially off. Play state is saved locally; each activity has a Put back button. Sound effects are synthesized locally with Web Audio.

The portable illustrated PDF is `output/pdf/capybara-playbook.pdf`. It contains the same ten full images in order, with no cropping, added text, blank pages, or game instructions. PDF bookmarks name each page.

## GitHub Pages

This directory is a static site with relative URLs and no build step or external dependencies. Published from the `main` branch root using GitHub Pages at https://aryarao1.github.io/capybara-playbook/. Repository: https://github.com/aryarao1/capybara-playbook.

## Rebuild PDF

Run `scripts/assemble.py` with Python, Pillow, and ReportLab. It uses the approved local assets. Optionally set `CAPYBARA_SOURCE` to the original image directory to recopy the source PNGs. Keep `assets/pages.json` and `pages.js` with the site.

## Checks

Run `node tests/rules.cjs` and `node tests/board.cjs` to verify opposite-end trophy routes, dice allowances, alternating turns, own-end hazard resets, either winner, replay and mouse/touch scene handlers. Run `node tests/bedroom.cjs` and `node tests/sounds.cjs` for bedroom and mute regressions. Browser verification covers drag/drop, coloring/reset, dress-up, sound preference persistence, and desktop/phone layouts.
