#!/usr/bin/env python3
"""Replace Grapheine placeholder cards with Voltis portfolio content on static HTML exports."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Canonical list (Afrogarm once; aligns with chronological / All views)
RAW_WORKS: list[dict] = [
    {
        "title": "Wearhouse",
        "sector": "Fashion &amp; retail",
        "year": 2026,
        "href": "product-wearhouse.html",
        "img": "assets/portfolio/Wearhouse.svg",
        "alt": "Wearhouse",
        "excerpt": "Secondhand fashion marketplace - list, discover, and shop.",
    },
    {
        "title": "Afrogarm",
        "sector": "Fashion",
        "year": 2026,
        "href": "product-afrogarm.html",
        "img": "assets/portfolio/Afrogarm.png",
        "alt": "Afrogarm",
        "excerpt": "African fashion marketplace connecting designers with a global audience.",
    },
    {
        "title": "NotepadPro",
        "sector": "Productivity",
        "year": 2026,
        "href": "product-notepadpro.html",
        "img": "assets/portfolio/NotepadPro.svg",
        "alt": "NotepadPro",
        "excerpt": "Desktop thinking workspace - plain text, tasks, CSV, HTML preview, local-first.",
    },
    {
        "title": "Clipstack",
        "sector": "Productivity",
        "year": 2026,
        "href": "product-clipstack.html",
        "img": "assets/portfolio/Clipstack.svg",
        "alt": "Clipstack",
        "excerpt": "Clipboard manager with searchable history for snippets and URLs.",
    },
    {
        "title": "Pinnacle Transfer",
        "sector": "Productivity",
        "year": 2026,
        "href": "product-pinnacle-transfer.html",
        "img": "assets/portfolio/Pinnacle.svg",
        "alt": "Pinnacle Transfer",
        "excerpt": "Large creative handoffs - fast, intentional file transfers.",
    },
    {
        "title": "Bars",
        "sector": "Productivity",
        "year": 2026,
        "href": "product-bars.html",
        "img": "assets/portfolio/Bars.svg",
        "alt": "Bars",
        "excerpt": "Stats animation for presenting numbers with motion and clarity.",
    },
    {
        "title": "Voltis Labs games",
        "sector": "Games",
        "year": 2025,
        "href": "case-voltis-games.html",
        "img": "assets/portfolio/Frame%201171276187.svg",
        "alt": "Voltis Labs games",
        "excerpt": "Playful experiments that ship - Spinnersonic and more.",
    },
    {
        "title": "Pebble Cleaning",
        "sector": "Partners",
        "year": 2025,
        "href": "case-pebble-cleaning.html",
        "img": "assets/portfolio/Frame%201171276188.svg",
        "alt": "Pebble Cleaning",
        "excerpt": "External partner - visit Pebble Cleaning’s live site.",
    },
    {
        "title": "Spinnersonic",
        "sector": "Games",
        "year": 2025,
        "href": "case-spinnersonic-com.html",
        "img": "assets/portfolio/Spinnersonic.png",
        "alt": "Spinnersonic",
        "excerpt": "High-energy spinner game - modes, leaderboards, and multiplayer races.",
    },
    {
        "title": "Spinnersonic (web)",
        "sector": "Games",
        "year": 2024,
        "href": "case-spinnersonic-web.html",
        "img": "assets/portfolio/Spinnersonic%20Web.svg",
        "alt": "Spinnersonic (web)",
        "excerpt": "Web experience for Spinnersonic - racing, spinning, and casual play.",
    },
    {
        "title": "Voltis Labs Website",
        "sector": "Marketing",
        "year": 2023,
        "href": "case-voltislabs-website.html",
        "img": "assets/portfolio/Frame%201171276186.svg",
        "alt": "Voltis Labs Website",
        "excerpt": "voltislabs.com - products, updates, and responsible innovation.",
    },
    {
        "title": "VModel",
        "sector": "Creators",
        "year": 2022,
        "href": "product-vmodel.html",
        "img": "assets/portfolio/Frame%201171276190.svg",
        "alt": "VModel",
        "excerpt": "Creative careers - portfolios, bookings, and paid opportunities.",
    },
]

N_WORKS = len(RAW_WORKS)


def _work_li_slider(w: dict, *, fetchpriority: str | None = None) -> str:
    fp = f' fetchpriority="{fetchpriority}"' if fetchpriority else ""
    ov_imgs = (
        f'\t\t\t\t\t\t\t\t\t\t<img width="2560" height="1583" src="{w["img"]}" '
        f'class="attachment-size-7 size-size-7" alt="" loading="lazy" decoding="async" sizes="auto" />\n'
        f'\t\t\t\t\t\t\t\t\t\t<img width="2560" height="1583" src="{w["img"]}" '
        f'class="attachment-size-7 size-size-7" alt="" loading="lazy" decoding="async" sizes="auto" />'
    )
    return f"""<li class="work">
  <div class="work__container grid">
  <div class="work__thumbnail">
  <div class="media">
\t\t\t\t\t\t\t\t\t<img{fp} width="2560" height="1583" src="{w["img"]}" class="" alt="{w["alt"]}" loading="lazy" sizes="auto" decoding="async" />\t\t\t\t  </div>

  <div class="work__thumbnail-over" aria-hidden="true">
{ov_imgs}\t\t\t\t\t\t\t\t  </div>
  </div>

  <a
  class="work__link"
  href="{w["href"]}"
  aria-label="{w["title"].replace('"', '&quot;')}"
  >
  <h3 class="work__title">{w["title"]}</h3>
  <span class="work__sector">{w["sector"]}</span>
  </a>


\t\t  <div class="work__excerpt"><p>{w["excerpt"]}</p>
</div>
\t\t  </div>
</li>
"""


def _work_li_flat(w: dict) -> str:
    ov_imgs = (
        f'\t\t\t\t\t\t\t\t\t\t<img width="2560" height="1583" src="{w["img"]}" '
        f'class="attachment-size-7 size-size-7" alt="" loading="lazy" decoding="async" sizes="auto" />\n'
        f'\t\t\t\t\t\t\t\t\t\t<img width="2560" height="1583" src="{w["img"]}" '
        f'class="attachment-size-7 size-size-7" alt="" loading="lazy" decoding="async" sizes="auto" />'
    )
    return f"""<li class="work">
  <div class="work__container grid">
  <div class="work__thumbnail">
  <div class="media">
\t\t\t\t\t\t\t\t\t<img width="2560" height="1583" src="{w["img"]}" class="" alt="{w["alt"]}" loading="lazy" sizes="auto" decoding="async" />\t\t\t\t  </div>

  <div class="work__thumbnail-over" aria-hidden="true">
{ov_imgs}\t\t\t\t\t\t\t\t  </div>
  </div>

  <a
  class="work__link"
  href="{w["href"]}"
  aria-label="{w["title"].replace('"', '&quot;')}"
  >
  <h3 class="work__title">{w["title"]}</h3>
  <span class="work__sector">{w["sector"]}</span>
  </a>


\t\t  <div class="work__excerpt"><p>{w["excerpt"]}</p>
</div>
\t\t  </div>
</li>
"""


def _archive_row(w: dict) -> str:
    label = w["title"].replace('"', "&quot;")
    return f"""<li class="archive-row grid subgrid" pos="row">
  <div class="work__container grid subgrid" pos="row">
  <a
  pos="1-3"
  pos-s="1-4"
  class="archive-row__link"
  href="{w["href"]}"
  >
  <h3 class="archive-row__title">{w["title"]}</h3>
  </a>

  <span pos="6-8" class="archive-row__sector">
  {w["sector"]}  </span>


  <span pos="10-12" pos-s="5-8" class="archive-row__year">{w["year"]}</span>

  <div class="archive-row__image">

\t\t\t\t\t\t<img width="2560" height="1583" src="{w["img"]}" class="attachment-size-7 size-size-7" alt="{w["alt"]}" loading="lazy" decoding="async" sizes="auto" />\t\t  </div>
  </div>
</li>
"""


def build_alphabetical_index_html() -> str:
    alpha = sorted(RAW_WORKS, key=lambda x: x["title"].lower())
    from itertools import groupby

    buckets: list[tuple[str, list]] = []
    for letter, grp in groupby(alpha, key=lambda x: x["title"][0].upper()):
        buckets.append((letter, list(grp)))
    parts: list[str] = ['  <section class="archive-index">\n  <ol class="archive-index__list">\n']
    for letter, items in buckets:
        parts.append(
            f'\t\t  <li class="works-index__letter grid">\n'
            f'  <h5 pos="1-2" pos-s="row" class="works-index__title">{letter}</h5>\n'
            f'  <ol class="subgrid grid" pos="3-12" pos-s="row">\n'
        )
        for w in items:
            parts.append(_archive_row(w))
        parts.append("  </ol>\n</li>\n")
    parts.append("\t\t</ol>\n</section>\n")
    return "".join(parts)


def slider_block(title: str, works: list[dict], *, first_priority: bool = False) -> str:
    lines = [
        '\t\t\t  <section>',
        '\t\t\t\t\t<div class="slider">',
        '  <div class="grid">',
        f'  <h2 pos="1-7" pos-s="1-4" class="slider__title">{title}</h2>',
        "  ",
        '  <div pos="8-12" pos-s="5-6" class="slider__link">',
        '  <a href="portfolio-all.html" target="">',
        f"  View all ({N_WORKS})  </a>",
        "  </div>",
        "  </div>",
        "",
        '  <div class="slider__slides">',
        '  <ol class="grid slider__list">',
    ]
    body = []
    for i, w in enumerate(works):
        fp = "high" if (first_priority and i == 0) else None
        body.append(_work_li_slider(w, fetchpriority=fp))
    lines.append("".join(body))
    lines.extend(
        [
            "  </ol>",
            "  </div>",
            "</div>  </section>",
            "\t\t\t\t\t",
        ]
    )
    return "\n".join(lines) + "\n"


def build_sectors_taxonomy_inner() -> str:
    meta = [
        ("Culture", [RAW_WORKS[i] for i in [11, 10, 5, 2]]),
        ("Territories", [RAW_WORKS[i] for i in [7, 4, 0, 1]]),
        ("Education", [RAW_WORKS[i] for i in [2, 3, 11, 10]]),
        ("Technology", [RAW_WORKS[i] for i in [2, 3, 4, 10]]),
        ("Consulting &amp; Services", [RAW_WORKS[i] for i in [4, 7, 3, 2]]),
        ("Industries", [RAW_WORKS[i] for i in [0, 1, 4, 10]]),
        ("Environment", [RAW_WORKS[i] for i in [9, 8, 6, 3]]),
        ("Sports &amp; Health", [RAW_WORKS[i] for i in [8, 9, 6, 5]]),
        ("Gastronomy", [RAW_WORKS[i] for i in [0, 1, 7, 11]]),
        ("Fashion &amp; Luxury", [RAW_WORKS[i] for i in [0, 1, 11, 6]]),
    ]
    parts = []
    for idx, (title, works) in enumerate(meta):
        parts.append(slider_block(title, works, first_priority=(idx == 0)))
    return "".join(parts)


def build_expertise_taxonomy_inner() -> str:
    meta = [
        ("Delivery capabilities", [RAW_WORKS[i] for i in [4, 10, 2, 3]]),
        ("Naming", [RAW_WORKS[i] for i in [0, 1, 11, 10]]),
        ("Typography", [RAW_WORKS[i] for i in [5, 2, 10, 3]]),
        ("Illustration", [RAW_WORKS[i] for i in [6, 7, 8, 9]]),
        ("Motion design", [RAW_WORKS[i] for i in [5, 8, 6, 9]]),
        ("Digital", [RAW_WORKS[i] for i in [9, 10, 2, 3]]),
        ("Print", [RAW_WORKS[i] for i in [2, 4, 3, 5]]),
        ("Signage", [RAW_WORKS[i] for i in [7, 4, 0, 1]]),
        ("Podcast", [RAW_WORKS[i] for i in [10, 11, 7, 6]]),
    ]
    parts = []
    for idx, (title, works) in enumerate(meta):
        parts.append(slider_block(title, works, first_priority=(idx == 0)))
    return "".join(parts)


def replace_between(text: str, start_marker: str, end_marker: str, new_middle: str) -> str:
    s = text.index(start_marker)
    e = text.index(end_marker, s)
    # new_middle includes its own closing tags; drop the original end_marker
    return text[:s] + new_middle + text[e + len(end_marker) :]


def patch_portfolio_all(text: str) -> str:
    start = '\t<section class="works">\n  <ul class="grid works__list">\n'
    end = "\n  </ul>\n</section>"
    s = text.index(start) + len(start)
    e = text.index(end, s)
    inner = "\n".join(_work_li_flat(w) for w in RAW_WORKS) + "\n"
    return text[:s] + inner + text[e:]


def main() -> None:
    alphabetical_path = ROOT / "portfolio-alphabetical.html"
    tα = alphabetical_path.read_text(encoding="utf-8")
    tα = replace_between(
        tα,
        '<section class="archive-index">',
        "</section>",
        build_alphabetical_index_html(),
    )
    tα = re.sub(
        r"<link rel=\"preload\"[^>]*grapheine\.com[^>]*>",
        '<link rel="preload" as="image" href="assets/portfolio/Wearhouse.svg" fetchpriority="high">',
        tα,
        count=1,
    )
    alphabetical_path.write_text(tα, encoding="utf-8")

    pall = (ROOT / "portfolio-all.html").read_text(encoding="utf-8")
    pall = patch_portfolio_all(pall)
    pall = re.sub(
        r"<link rel=\"preload\"[^>]*grapheine\.com[^>]*>",
        '<link rel="preload" as="image" href="assets/portfolio/Wearhouse.svg" fetchpriority="high">',
        pall,
        count=1,
    )
    (ROOT / "portfolio-all.html").write_text(pall, encoding="utf-8")

    def patch_taxonomy(path: Path, inner: str) -> None:
        raw = path.read_text(encoding="utf-8")
        marker = '  <div class="archive-taxonomy__list">'
        ms = raw.index(marker)
        after_open = ms + len(marker)
        while after_open < len(raw) and raw[after_open] in " \t\n\r":
            after_open += 1
        close_block = "\n\t\t\t\t\t  </div>\n</div>\n\n</main>"
        ce = raw.rindex(close_block, after_open)
        new_raw = (
            raw[:after_open]
            + "\n\t\t\t"
            + inner.rstrip("\n")
            + "\n\t\t\t\t\t  </div>\n</div>\n\n</main>"
            + raw[ce + len(close_block) :]
        )
        raw = new_raw
        raw = re.sub(
            r"<link rel=\"preload\"[^>]*grapheine\.com[^>]*>",
            '<link rel="preload" as="image" href="assets/portfolio/Wearhouse.svg" fetchpriority="high">',
            raw,
            count=1,
        )
        path.write_text(raw, encoding="utf-8")

    patch_taxonomy(ROOT / "sectors.html", build_sectors_taxonomy_inner())
    patch_taxonomy(ROOT / "expertise.html", build_expertise_taxonomy_inner())
    print("Patched portfolio-alphabetical, portfolio-all, sectors, expertise.")


if __name__ == "__main__":
    main()
