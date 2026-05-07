#!/usr/bin/env python3
"""One-off batch updates to the global HTML footer."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]

IG_SVG = (
    '<svg class="footer__social-ig-svg" xmlns="http://www.w3.org/2000/svg" '
    'width="14" height="14" viewBox="0 0 24 24" fill="none" '
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" '
    'stroke-linejoin="round" aria-hidden="true">'
    '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>'
    '<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>'
    '<line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>'
)

NEW_NAV = (
    '<nav class="navigation navigation--bottom"><ul class="navigation__list">'
    '<li class="navigation__item"><a class="navigation__link" target="_blank" '
    'href="https://github.com/VoltisLabs" rel="noopener noreferrer">GitHub</a></li>'
    '<li class="navigation__item"><a class="navigation__link" '
    'href="home.html">Home</a></li>'
    '<li class="navigation__item"><a class="navigation__link footer__social-ig" '
    'target="_blank" href="https://instagram.com/voltislabs" rel="noopener noreferrer" '
    'aria-label="Voltis Labs on Instagram">' + IG_SVG + '</a></li>'
    '</ul></nav>'
)

CREDITS = re.compile(
    r"<div class=\"navigation navigation--bottom\">\s*"
    r"<div class=\"navigation__list\">\s*"
    r"<div class=\"navigation__item\">\s*"
    r"<a class=\"navigation__link\" href=\"https://github\.com/VoltisLabs/voltislabs\.com\""
    r'[^>]*>\s*.*?Credits:.*?</a>\s*'
    r"</div>\s*</div>\s*</div>",
    re.DOTALL,
)

BOTTOM_NAV = re.compile(
    r'<nav class="navigation navigation--bottom"><ul class="navigation__list">'
    r'<li\s+class="navigation__item\s*"><a\s+class="navigation__link"\s+target="_blank"\s+'
    r'href="https://github\.com/VoltisLabs"\s+rel="rel=&quot;noreferrer&quot;"\s*>GitHub</a></li>'
    r'<li\s+class="navigation__item\s*"><a\s+class="navigation__link"\s+target="_blank"\s+'
    r'href="https://github\.com/VoltisLabs"\s+rel="rel=&quot;noreferrer&quot;"\s*>Code</a></li>'
    r'<li\s+class="navigation__item\s*"><a\s+class="navigation__link"\s+target="_blank"\s+'
    r'href="https://github\.com/VoltisLabs"\s+rel="rel=&quot;noreferrer&quot;"\s*>Org</a></li>'
    r'<li\s+class="navigation__item\s*"><a\s+class="navigation__link"\s+target="_blank"\s+'
    r'href="https://voltislabs\.com"\s+rel="rel=&quot;noreferrer&quot;"\s*>voltislabs\.com</a></li>'
    r'</ul></nav>',
)

OPEN_SOURCE_LI = re.compile(
    r'<li\s+class="navigation__item\s*"><a\s+class="navigation__link"\s+'
    r'href="https://github\.com/VoltisLabs"\s*>\s*Open source\s*</a></li>'
)

COPYRIGHT = re.compile(
    r"<span class=\"footer__copyright\">© 2002 - 2026</span>",
    re.MULTILINE,
)


def main() -> None:
    count = 0
    html_files = sorted(
        p
        for p in ROOT.glob("*.html")
        if p.is_file() and not p.name.startswith("_ref")
    )
    if not html_files:
        sys.exit("No *.html")

    for path in html_files:
        text = path.read_text(encoding="utf-8")
        original = text
        text = COPYRIGHT.sub('<span class="footer__copyright">2026 Voltis Labs</span>', text)
        text = OPEN_SOURCE_LI.sub("", text)
        text = CREDITS.sub("", text)
        text = BOTTOM_NAV.sub(NEW_NAV, text)
        if text != original:
            path.write_text(text, encoding="utf-8")
            count += 1
            print("updated:", path.relative_to(ROOT))

    print("done,", count, "files")


if __name__ == "__main__":
    main()
