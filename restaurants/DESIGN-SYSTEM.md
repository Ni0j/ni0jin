# sēzn design system

Scope: the restaurant home, menu, and contact pages in `restaurants/`. The Venti and Monta Tea case pages keep their existing stylesheet and are not part of this replacement. The five styles below are the complete character-style set for the three service pages. A font, size, weight, line-height, slant, or text-color change counts as a new style; layout and borders do not.

## Character styles

| Style | Exact treatment | Where it appears |
|---|---|---|
| 1. Handwritten voice | Caflisch Script Pro Light (`300`, normal), `1.75rem / 1.3`, paper ink `#343630` | Wordmark; home statement and important standalone lines; menu title; tally title; selector and ticket titles; contact title. Display size on the site: `1.75rem` (28px at the normal root size). |
| 2. Section strip | Instrument Sans Regular, `.875rem / 1.45`, light paper `#ede8dd` | Number and title in each dark menu section strip. |
| 3. Reading text | Instrument Sans Regular, `.875rem / 1.55`, paper ink `#343630` | Body copy; service and add-on names; labels and entered form text; ordinary rule summaries. |
| 4. Fine print | Instrument Sans Regular, `.75rem / 1.45`, graphite `#5e6259` | Brand byline; navigation; paper metadata; table column names and item numbers; quote labels; collapsed service content; secondary notes; errors; tally lines and mobile selection summary; ticket fields; footer. |
| 5. Human emphasis and actions | Instrument Sans Italic, `.875rem / 1.55`, paper ink `#343630` | Words emphasized inside copy; every text CTA/button/link, including the bell button and `Details`. Actions are underlined and have no arrow, filled background, or capsule outline. |

The five definitions live in `sezn.css` as `--type-display`, `--type-bar`, `--type-body`, `--type-detail`, and `--type-action`. Caflisch Script Pro loads through the Adobe Fonts kit `https://use.typekit.net/bvb3wfk.css` on the home, menu, and contact pages, with a sans-serif fallback. Instrument Sans is imported with an Arial fallback. The visual check mark is an SVG path, not a font glyph; it does not create a sixth character style. The client PDF is a canvas-rendered print representation with title-case labels and its own print-size mapping in `menu/menu.js`.

The visible wordmark draws the script `e` and places its macron with CSS so the letter itself cannot disappear in the font's accented-glyph rendering. The link's accessible name and ordinary copy retain the conventional spelling `sēzn`.

## Color palette

| Color | Value | Where it appears |
|---|---|---|
| Table | `#cbc8be` | Outside the paper sheet. |
| Paper | `#e7e2d6` | Main sheet and page theme color. |
| Light paper | `#ede8dd` | Detached tally and expanded selector/ticket paper. |
| Paper ink | `#343630` | Reading text, section strips, hard rules, focus outlines, input error borders. |
| Graphite | `#5e6259` | Fine print, column heads, notes, and field-level feedback. |
| Rule | `#989b91` | Table lines, paper edge, dividers, and input borders. |
| Pencil | `#727168` | Hand-drawn SVG check mark and checkbox outline. |

`assets/paper-grain.svg` adds a low-opacity procedural fiber texture to the table and paper surfaces; it is not a photographic asset. `assets/pencil-cursor.svg` is applied across the service pages only for precise pointer devices. Its graphite tip is the cursor hotspot at `8 29`, so the visible tip and actual click agree. Touch screens keep their native cursor behavior. A translucent ink tint is used only behind column headings; white is reserved for print output. Update the matching PDF canvas colors in `menu/menu.js` when changing the palette.

## Layout rule

The home and menu share one paper edge, the same dark section strips, ruled columns, numbered choices, and underline-only actions. The menu sheet is deliberately narrower than the home sheet so it reads as a restaurant order form. The add-on and intake controls remain native checkbox/radio/input elements beneath the printed appearance.

No public service or add-on prices appear in the home, order sheet, tally, email, or ticket. Every selection receives a scope review and written quote before invoicing. The menu sheet enters with a restrained paper-turn animation; the existing reduced-motion rule removes the movement when requested.
