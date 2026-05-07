#!/usr/bin/env python3
"""Replace Grapheine banner strips on home.html with Portfolio → Years SVGs."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
path = ROOT / "home.html"
text = path.read_text(encoding="utf-8")

sectors_new = r'''<div class="section-sectors grid">
    <div class="grid subgrid section-sectors__container" pos="row">

        <div pos="1-6" pos-s="row" class="section-sectors__text">
            <div class="text">
                <p class="p2">Shipped work and experiments - the same preview art as <a href="portfolio.html">Portfolio → Years</a>. Follow any tile to product pages, case studies, or the full catalog.</p>
                <p class="p2"><a href="products.html">All products</a> · <a href="portfolio.html">Portfolio</a> · <a href="https://github.com/VoltisLabs" target="_blank" rel="noopener noreferrer">GitHub</a></p>
            </div>
        </div>
        <div class="grid subgrid" pos="row" pos-s="row">
            <div pos="1-6">
                <div class="section-sectors__thumbnails-container">
                    <div class="section-sectors__thumbnails">
                        <img width="2560" height="1583" src="assets/portfolio/Wearhouse.svg" alt="Wearhouse" loading="lazy" decoding="async" />
                        <img width="2560" height="1583" src="assets/portfolio/Afrogarm.png" alt="Afrogarm" loading="lazy" decoding="async" />
                        <img width="2560" height="1583" src="assets/portfolio/NotepadPro.svg" alt="NotepadPro" loading="lazy" decoding="async" />
                        <img width="2560" height="1583" src="assets/portfolio/Clipstack.svg" alt="Clipstack" loading="lazy" decoding="async" />
                        <img width="2560" height="1583" src="assets/portfolio/Pinnacle.svg" alt="Pinnacle Transfer" loading="lazy" decoding="async" />
                        <img width="2560" height="1583" src="assets/portfolio/Bars.svg" alt="Bars" loading="lazy" decoding="async" />
                    </div>
                    <div class="section-sectors__thumbnails">
                        <img width="2560" height="1583" src="assets/portfolio/Frame%201171276187.svg" alt="Voltis Labs games" loading="lazy" decoding="async" />
                        <img width="2560" height="1583" src="assets/portfolio/Frame%201171276188.svg" alt="Pebble Cleaning" loading="lazy" decoding="async" />
                        <img width="2560" height="1583" src="assets/portfolio/Spinnersonic.png" alt="Spinnersonic" loading="lazy" decoding="async" />
                        <img width="2560" height="1583" src="assets/portfolio/Spinnersonic%20Web.svg" alt="Spinnersonic (web)" loading="lazy" decoding="async" />
                        <img width="2560" height="1583" src="assets/portfolio/Frame%201171276186.svg" alt="Voltis Labs Website" loading="lazy" decoding="async" />
                        <img width="2560" height="1583" src="assets/portfolio/Frame%201171276190.svg" alt="VModel" loading="lazy" decoding="async" />
                    </div>
                </div>
            </div>
            <ul class="section-sectors__list" pos="7-12" pos-s="row">
                <li class="section-sectors__item"><a href="portfolio.html">Portfolio - Years</a></li>
                <li class="section-sectors__item"><a href="products.html#voltis-apps">Product catalog</a></li>
                <li class="section-sectors__item"><a href="product-wearhouse.html">Fashion &amp; retail</a></li>
                <li class="section-sectors__item"><a href="product-vmodel.html">Creators</a></li>
                <li class="section-sectors__item"><a href="case-voltis-games.html">Games</a></li>
                <li class="section-sectors__item"><a href="case-pebble-cleaning.html">Partners</a></li>
                <li class="section-sectors__item"><a href="case-voltislabs-website.html">Marketing site</a></li>
                <li class="section-sectors__item"><a href="https://github.com/VoltisLabs" target="_blank" rel="noopener noreferrer">Open source</a></li>
            </ul>
        </div>
    </div>
</div>'''

works_new = r'''<ol class="grid section-works-homepage__list">
        <li class="work">
    <div class="work__container grid">
        <div class="work__thumbnail">
            <div class="media">
                <img width="2560" height="1583" src="assets/portfolio/Frame%201171276190.svg" class="" alt="VModel" loading="lazy" decoding="async" />
            </div>
            <div class="work__thumbnail-over" aria-hidden="true"></div>
        </div>

        <a class="work__link" href="product-vmodel.html" aria-label="VModel">
            <h3 class="work__title">VModel</h3>
            <span class="work__sector">Creators</span>
        </a>
        <div class="work__excerpt"><p>Portfolios, verified profiles, and paid bookings for models, photographers, stylists, and brands.</p></div>
    </div>
</li>
<li class="work">
    <div class="work__container grid">
        <div class="work__thumbnail">
            <div class="media">
                <img width="2560" height="1583" src="assets/portfolio/Wearhouse.svg" class="" alt="Wearhouse" loading="lazy" decoding="async" />
            </div>
            <div class="work__thumbnail-over" aria-hidden="true"></div>
        </div>

        <a class="work__link" href="product-wearhouse.html" aria-label="Wearhouse">
            <h3 class="work__title">Wearhouse</h3>
            <span class="work__sector">Fashion &amp; retail</span>
        </a>
        <div class="work__excerpt"><p>Secondhand fashion marketplace - list, discover, and shop preloved pieces with a modern, community-driven experience.</p></div>
    </div>
</li>
<li class="work">
    <div class="work__container grid">
        <div class="work__thumbnail">
            <div class="media">
                <img width="2560" height="1583" src="assets/portfolio/Afrogarm.png" class="" alt="Afrogarm" loading="lazy" decoding="async" />
            </div>
            <div class="work__thumbnail-over" aria-hidden="true"></div>
        </div>

        <a class="work__link" href="product-afrogarm.html" aria-label="Afrogarm">
            <h3 class="work__title">Afrogarm</h3>
            <span class="work__sector">Fashion</span>
        </a>
        <div class="work__excerpt"><p>African fashion marketplace connecting designers and artisans with a global audience.</p></div>
    </div>
</li>
<li class="work">
    <div class="work__container grid">
        <div class="work__thumbnail">
            <div class="media">
                <img width="2560" height="1583" src="assets/portfolio/Spinnersonic.png" class="" alt="Spinnersonic" loading="lazy" decoding="async" />
            </div>
            <div class="work__thumbnail-over" aria-hidden="true"></div>
        </div>

        <a class="work__link" href="product-spinnersonic.html" aria-label="Spinnersonic">
            <h3 class="work__title">Spinnersonic</h3>
            <span class="work__sector">Games</span>
        </a>
        <div class="work__excerpt"><p>High-energy spinner races, multiplayer modes, and leaderboards for web and mobile.</p></div>
    </div>
</li>
<li class="work">
    <div class="work__container grid">
        <div class="work__thumbnail">
            <div class="media">
                <img width="2560" height="1583" src="assets/portfolio/Clipstack.svg" class="" alt="Clipstack" loading="lazy" decoding="async" />
            </div>
            <div class="work__thumbnail-over" aria-hidden="true"></div>
        </div>

        <a class="work__link" href="product-clipstack.html" aria-label="Clipstack">
            <h3 class="work__title">Clipstack</h3>
            <span class="work__sector">Productivity</span>
        </a>
        <div class="work__excerpt"><p>Clipboard history and search for snippets, URLs, and boilerplate across apps and sessions.</p></div>
    </div>
</li>
<li class="work">
    <div class="work__container grid">
        <div class="work__thumbnail">
            <div class="media">
                <img width="2560" height="1583" src="assets/portfolio/Pinnacle.svg" class="" alt="Pinnacle Transfer" loading="lazy" decoding="async" />
            </div>
            <div class="work__thumbnail-over" aria-hidden="true"></div>
        </div>

        <a class="work__link" href="product-pinnacle-transfer.html" aria-label="Pinnacle Transfer">
            <h3 class="work__title">Pinnacle Transfer</h3>
            <span class="work__sector">Productivity</span>
        </a>
        <div class="work__excerpt"><p>Large creative file handoffs without attachment limits or scattered drive links.</p></div>
    </div>
</li>
    </ol>'''

title_new = r'''<section class="grid section section-title">
    <div pos="2-12" pos-s="row" class="text">
        <p class="p2">Shipping software with <em>clear propositions</em>, <em>consistent UX</em>, and <em>code you can extend</em> - from prototype to production.</p>
    </div>
</section>'''

about_new = r'''<section class="section-about">
    <div class="grid">
        <div pos="7-12" pos-s="row" class="section-about__text text">
            <p class="p2">Voltis Labs is a software and product studio. We build apps people use daily - marketplaces, creator tools, games, and utilities - with pragmatic delivery and open collaboration on GitHub.</p>
            <p class="p2">Use this site for product stories and writing; the voltislabs.com repo on GitHub has implementation detail when you need to go deeper.</p>
        </div>

        <div pos="10-12" pos-s="row">
            <a class="section-about__link" href="about-us.html">About Voltis Labs</a>
        </div>
    </div>
</section>'''

# 1) section-sectors
m0 = '<div class="section-sectors grid">'
m1 = '<ol class="grid section-works-homepage__list">'
i0 = text.index(m0)
i1 = text.index(m1)
text = text[:i0] + sectors_new + "\n    " + text[i1:]

# 2) works list - re-find after mutation
ol_start = text.index('<ol class="grid section-works-homepage__list">')
footer_marker = '</ol>\n\n    <footer class="grid">'
ol_end = text.index(footer_marker, ol_start)
text = text[:ol_start] + works_new + text[ol_end + len('</ol>'):]

# 3) section-title
ts = '<section class="grid section section-title">'
te = '</section><section class="section-about">'
t0 = text.index(ts)
t1 = text.index(te, t0)
text = text[:t0] + title_new + text[t1:]

# 4) section-about - find again
as_mark = '<section class="section-about">'
# next section after about is news
ae = '</section>                <section class="section-news-homepage"'
a0 = text.index(as_mark)
a1 = text.index(ae, a0)
text = text[:a0] + about_new + text[a1:]

path.write_text(text, encoding="utf-8")
print("Patched", path)
