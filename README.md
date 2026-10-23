# archives.iradgov.org

Site of the **State Archives of Irad** (Talas, University Street, on the TSU campus since 1997), a government
subdomain of iradgov.org in the Irad alternate-reality project. The site itself is fully in-world; this README is not.
Lore source: the lore skill's `canon.md` ("State Archives fonds" section and the events the exhibitions touch).

Domain: `archives.iradgov.org` (`CNAME`, unchanged). DNS: a CNAME `archives` → `mjsbroadbent.github.io` in the
iradgov.org zone. GitHub Pages: branch `main`, root.

## Structure

No build step. Plain HTML pages with the English text inline; `assets/site.js` draws the header, menu and footer,
switches language and renders the data-driven parts.

- Pages: `index.html`, `fonds.html` (guide to the fonds), `reading-room.html` (rules, seat plan, booking form),
  `copies.html` (three-step copy request ending at the stamped addressed envelope), `genealogy.html` (sanjyra desk,
  waiting-time estimator), `exhibitions.html`, `exhibition.html?id=<id>`, `closed-shelf.html` (records under
  classification review, request register), `about.html` (history, legal deposit, Toponymic Section, contact),
  `404.html`.
- `assets/i18n.js`: `ui` (interface strings, en/ir/ru) and `pages` (Iradi and Russian for every `data-i18n` key; the
  English stays in the HTML). A missing Iradi key falls back to the English: long texts (rules lists, history,
  exhibition captions, fond descriptions) are in English and Russian only. Language is remembered in
  `localStorage` `archives_lang`; `?lang=ru` / `?lang=ir` also work.
- `assets/facsimile.js`: every document facsimile is drawn in SVG (paper grain, foxing, folds, typescript, hands,
  rubber stamps, the Archives' violet foliation stamp). `FAX.render(id)` returns the SVG; ids: `firman`, `tribute`,
  `inventory1876`, `flightlist`, `returnlist`, `telegram1916`, `report1956`, `minutes1956`, `curfew1956`, `decree1`,
  `bread1992`, `notebook1992`, `ratification1992`, `act1993`, `cert2001`, `cutseal2006`, `successors`. Handwriting
  is Marck Script (pre-reform ѣ is drawn as ђ, which Marck has); printed pre-1917 forms use Old Standard TT.
- `assets/img/`: seal and emblem art copied from the wiki images and iradgov (Seal of the Territory, Iradi SSR
  emblem, State Emblem monochrome, the Office of the Governor's roundel), used as ink or embossed impressions via
  SVG filters. `assets/state-emblem.svg` / `state-emblem-160.png` (masthead) come from iradgov.
- Look: warm grey paper, archive-box buff, ink blue `#1f3a5c`/`#132841`, stamp red `#b03a2c`; Vollkorn (display),
  Fira Sans (text), IBM Plex Mono (references, typescript). Kept apart from iradgov's crimson and the Bank of Irad's
  green and gold.
- Forms send nothing anywhere and store nothing: booking always answers "no free places this month", the copy
  request ends at the stamped-addressed-envelope instruction, the review register gives a register number.
- External requests: Google Fonts and the analytics snippet (GoatCounter + GA, same as every site). Nothing else.

## Data

- `data/fonds.json`: `fonds[]` with `n`, `period` (`early`, `soviet`, `since1992`), `dates` (canon dates exactly),
  `opisi`, `units`, `access` (`open`, `rule30`, `partial`, `review`), optional `exhibition` id, `title`
  (en/ir/ru), `desc` (en/ru). `collections[]` for the sound collection and legal deposit. Add a fond only if canon
  has it; cite a fond only for years inside its dates.
- `data/exhibitions.json`: `exhibitions[]` with `id`, `fonds`, `since` (first shown), `title`/`sub` (en/ir/ru),
  `intro` (en/ru), `items[]`: `fx` (a facsimile id), `ref` (`f`, `op`, `d`, `l`), `title`, `date`, `caption`, `text`
  (transcription/translation, en/ru). To add an item, add a drawing to `assets/facsimile.js` (see the helpers
  `shell`, `lines`, `stampRound`, `stampRect`, `sig`, `archStamp`, `sealImg`) and an item here; add new
  exhibitions to `sitemap.xml`.
- `data/closed.json`: the records under classification review (closed shelf).
- `data/fees.json`: copy section services and fees (som), `certification` fee.

## Rules that matter here

Fond 108 (Alimbekov's 1992 papers) shows only working documents of the Provisional Government. The 2007
privatisation files and ISEZ internal records are only ever "subject to classification review". No real living
people; Baker appears only in the treaty's name.

## Checking

`python3 -m http.server` here and look at every page in all three languages at 1366 and 390 px. No console errors,
no horizontal scroll, no requests other than own files, Google Fonts and analytics.
