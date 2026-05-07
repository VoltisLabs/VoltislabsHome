#!/usr/bin/env python3
"""Generate inner HTML pages for VoltislabsHome (copy from voltislabs.com sources)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRODUCTS_HTML = ROOT / "products.html"

TEXT = PRODUCTS_HTML.read_text(encoding="utf-8")

HEAD = TEXT.split("<body", 1)[0]
HEADER_BLOCK = TEXT[TEXT.index("<header class=\"header\">") : TEXT.index("<main>")]
FOOTER_AND_REST = TEXT[TEXT.index("<footer") :]

NAV_PRODUCTS_DESKTOP = """<li  class="navigation__item "><a  class="navigation__link" href="portfolio.html" >Portfolio</a></li><li  class="navigation__item navigation__item--active"><a  class="navigation__link" href="products.html">Products</a></li>"""

NAV_PORTFOLIO_DESKTOP = """<li  class="navigation__item navigation__item--active"><a  class="navigation__link" href="portfolio.html" >Portfolio</a></li><li  class="navigation__item "><a  class="navigation__link" href="products.html">Products</a></li>"""

FOOTER_NAV_PRODUCTS = NAV_PRODUCTS_DESKTOP.replace("portfolio.html\" >", "portfolio.html\" >")  # same
# Footer uses slightly different spacing - extract from products footer first nav block
FOOTER_PRODUCTS = """<li  class="navigation__item "><a  class="navigation__link" href="portfolio.html" >Portfolio</a></li><li  class="navigation__item navigation__item--active"><a  class="navigation__link" href="products.html">Products</a></li>"""

FOOTER_PORTFOLIO = """<li  class="navigation__item navigation__item--active"><a  class="navigation__link" href="portfolio.html" >Portfolio</a></li><li  class="navigation__item "><a  class="navigation__link" href="products.html">Products</a></li>"""


def build_head(title: str) -> str:
    h = HEAD
    h = re.sub(r"<title>[^<]*</title>", f"<title>{title}</title>", h, count=1)
    if "vl-inner-page.css" not in h:
        h = h.replace(
            "<link rel='stylesheet' href='assets/site-wide.css'",
            "<link rel='stylesheet' href='assets/site-wide.css' type='text/css' media='all' />\n<link rel='stylesheet' href='assets/vl-inner-page.css'",
        )
        # site-wide already has type media - avoid duplicate
        h = h.replace(
            "<link rel='stylesheet' href='assets/site-wide.css' type='text/css' media='all' />\n<link rel='stylesheet' href='assets/vl-inner-page.css' type='text/css' media='all' />\n<link rel='stylesheet' href='assets/products-page.css'",
            "<link rel='stylesheet' href='assets/site-wide.css' type='text/css' media='all' />\n<link rel='stylesheet' href='assets/vl-inner-page.css' type='text/css' media='all' />\n<link rel='stylesheet' href='assets/products-page.css'",
        )
    # If replace failed, insert before grapheine-main closing - simpler insert after products-page
    if "vl-inner-page.css" not in h:
        h = h.replace(
            "<link rel='stylesheet' href='assets/products-page.css' type='text/css' media='all' />",
            "<link rel='stylesheet' href='assets/products-page.css' type='text/css' media='all' />\n<link rel='stylesheet' href='assets/vl-inner-page.css' type='text/css' media='all' />",
        )
    return h


def patch_header(portfolio_nav: bool) -> str:
    nav_in = NAV_PORTFOLIO_DESKTOP if portfolio_nav else NAV_PRODUCTS_DESKTOP
    blk = HEADER_BLOCK
    blk = blk.replace(NAV_PRODUCTS_DESKTOP, nav_in, 2)
    return blk


def patch_footer(portfolio_nav: bool) -> str:
    f = FOOTER_AND_REST
    f = f.replace(FOOTER_PRODUCTS, FOOTER_PORTFOLIO if portfolio_nav else FOOTER_PRODUCTS, 1)
    return f


def wrap_main(kicker: str, headline_html: str, body: str) -> str:
    return f"""<main>

<div>

<header class="hero  ">
    <div class="grid hero__content">
        <p pos="row" pos-s="row" class="hero__title">{kicker}</p>
        <h1 pos="5-12" pos-s="row" class="hero__description">{headline_html}</h1>
    </div>
</header>
    <div>
<section class="section section-wysiwyg">
    <div class="grid">
        <div class="grid subgrid section-wysiwyg__container" pos="row">
            <div pos="5-12" pos-s="row" class="text vl-inner">
{body}
            </div>
        </div>
    </div>
</section>
</div>

</div>

</main>
"""


PAGES: list[tuple[str, str, str, str, str, bool]] = [
    (
        "product-afrogarm.html",
        "Afrogarm - Voltis Labs",
        "Fashion",
        """Afrogarm<br><span style="color:#ff2b2b">African fashion marketplace</span>""",
        r"""<h2>What is Afrogarm?</h2>
<p class="p1">Afrogarm is the global marketplace where African fashion comes to life. We connect talented designers, artisans, and fashion houses from across the African continent with customers around the world, creating a seamless bridge between creativity and opportunity.</p>
<p class="p1">Through Afrogarm, authentic, high-quality garments and accessories find their way from the hands of passionate creators to the wardrobes of style-conscious individuals everywhere.</p>
<p class="p1"><strong>Our mission goes beyond commerce.</strong> We aim to celebrate Africa’s rich cultural heritage, its bold modern expressions, and its future-forward vision of fashion. Every piece you discover on Afrogarm carries a story - of craftsmanship, innovation, and identity - woven into fabric, stitched into detail, and expressed through bold colour and design.</p>
<p class="p1">You may be seeking timeless traditional wear or contemporary African street style, or exclusive handmade accessories; Afrogarm offers a curated experience that honours authenticity while embracing modern style. Here, fashion is not just worn, it’s lived, celebrated, and shared with the world.</p>
<h2>What makes Afrogarm different?</h2>
<h3>Authentic African talent</h3>
<p class="p1">Every item is crafted or curated by African designers, telling real stories through fabric, colour, and form.</p>
<h3>Curated collections</h3>
<p class="p1">Shop handpicked collections from emerging brands, master artisans, and fashion houses that are shaping the future of African style.</p>
<h3>Global access</h3>
<p class="p1">Wherever you are, Afrogarm brings Africa’s vibrant fashion culture straight to your wardrobe.</p>
<h3>Empowering creators</h3>
<p class="p1">We believe in building lasting opportunities for African entrepreneurs by giving them a platform to reach global markets.</p>
<h3>Unique, limited pieces</h3>
<p class="p1">Many designs you’ll find on Afrogarm are exclusive, limited edition, or handmade - perfect for those who value individuality.</p>
<h2>Why shop African fashion?</h2>
<p class="p1">African fashion represents a dynamic blend of tradition, innovation, and self-expression. By choosing Afrogarm, you’re supporting skilled artisans, celebrating cultural diversity, and making a powerful style statement rooted in creativity and pride. Afrogarm is also part of Voltis Labs’ vision to create platforms that connect creativity and opportunity. We’re proud to champion Africa’s rising talent and share it with the world.</p>
<h2>The Afrogarm experience</h2>
<ul>
<li><strong>User-friendly platform</strong> - Easily navigate through categories, filter preferences, and find exactly what you're looking for.</li>
<li><strong>Secure transactions</strong> - Shop with confidence knowing that your payments are protected.</li>
<li><strong>Worldwide shipping</strong> - Reliable delivery services to bring your chosen pieces from Africa to your doorstep.</li>
<li><strong>Customer support</strong> - Our dedicated team is here to assist you with any inquiries or concerns.</li>
</ul>
<h2>Join our community</h2>
<p class="p1">Become part of a growing community that celebrates African fashion and culture. Follow us on social media, share your Afrogarm looks, and stay updated on the latest trends and exclusive offers.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--primary" style="background:#ff2b2b;color:#fff;border-color:#ff2b2b" href="https://www.afrogarm.com" target="_blank" rel="noopener noreferrer">Visit afrogarm.com</a>
<a class="vl-inner__cta a--ghost" href="https://www.instagram.com/afrogarm" target="_blank" rel="noopener noreferrer">Instagram</a>
<a class="vl-inner__cta a--ghost" href="products.html">All products</a>
</div>""",
        False,
    ),
    (
        "product-vmodel.html",
        "VModel - Voltis Labs",
        "Creators",
        """VModel<br><span style="color:#ff2b2b">Your creative career, your way</span>""",
        r"""<h2>What is VModel?</h2>
<p class="p1">VModel is the go-to platform for models, photographers, stylists, makeup artists, and brands looking to connect, collaborate, and create without limits. Whether you're an aspiring model trying to land your first gig, a seasoned photographer building your brand, or a creative director scouting the perfect talent for a campaign, VModel streamlines the process - so you can focus on what truly matters: your craft.</p>
<p class="p1">This isn’t just another job board. VModel is a dynamic ecosystem where creativity meets opportunity. It’s built for freelancers, professionals, and emerging talents who want to take control of their careers, build meaningful collaborations, and get paid securely for their work, all in one place.</p>
<p class="p1"><strong>Find work that matches your skills and style:</strong> Tired of endless searching? With VModel's intelligent job-matching system, you’ll discover job opportunities tailored to your profile, experience, and interests. Whether you’re looking for runway gigs, editorial shoots, brand campaigns, commercial projects, or artistic collaborations, our platform helps you connect with the right opportunities fast.</p>
<p class="p1"><strong>Book and get booked seamlessly.</strong> Forget the hassle of back-and-forth emails, unverified contacts, and confusing contracts. VModel simplifies the booking process, ensuring secure, direct communication between talent and clients. Whether you’re a model accepting a shoot request or a brand hiring a team for a campaign, everything happens smoothly within the platform.</p>
<h2>Get paid safely and on time</h2>
<p class="p1">Say goodbye to unpaid invoices and sketchy payment processes. VModel's built-in secure payment system ensures that funds are held safely and released once the job is completed. No more chasing payments or worrying about getting scammed - just clear, transparent transactions that protect both talent and clients.</p>
<h2>Create and build your professional reputation</h2>
<p class="p1">Your work should speak for itself - and on VModel, it does. Build a professional profile that showcases your portfolio, experience, and unique style. Let brands and clients see your best work at a glance, helping you stand out in a competitive industry.</p>
<h2>Collaborate without limits</h2>
<p class="p1">Creativity thrives on collaboration, and VModel makes it easy to connect with like-minded professionals worldwide. Whether you’re a photographer looking for models, a stylist searching for the right makeup artist, or a brand assembling the perfect creative team, VModel’s tools help you bring your vision to life.</p>
<h2>Who is VModel for?</h2>
<h3>Models</h3>
<p class="p1">Break free from traditional agency constraints. Whether you're new to modeling or an established professional, VModel helps you get discovered, apply for gigs, and work with top brands on your terms.</p>
<h3>Photographers</h3>
<p class="p1">No more waiting for the right connections - VModel puts you directly in touch with models, stylists, and brands. Whether you're shooting high fashion, commercial work, or personal projects, finding the right talent has never been easier.</p>
<h3>Stylists and makeup artists</h3>
<p class="p1">Your artistry deserves to be seen. VModel connects you with models, photographers, and brands looking for creative professionals to bring their vision to life.</p>
<h3>Brands and creative directors</h3>
<p class="p1">Need talent for your next campaign? VModel makes scouting effortless. Browse profiles, review portfolios, and book professionals instantly, all in one secure, streamlined platform.</p>
<h2>Why VModel?</h2>
<p class="p1"><strong>Empowering creators.</strong> The creative industry has changed. Traditional agencies and networks no longer control who gets booked and who doesn’t. VModel puts the power back in your hands, giving you the tools, connections, and freedom to grow your career on your own terms.</p>
<p class="p1">With recent updates, you can add more diverse content types to your portfolio, including high-quality images, videos, detailed descriptions, and process notes. Organise your work into categories so clients can navigate your expertise.</p>
<p class="p1"><strong>No middlemen, no delays - just pure creative collaboration.</strong> We believe that creators should own their careers and keep their earnings. With VModel, you don’t need an agent or third-party negotiator to land work. You control your rates, your gigs, and your collaborations.</p>
<p class="p1"><strong>A platform that grows with you.</strong> Whether you’re just starting out or an industry veteran, VModel evolves with your career as you gain experience and expand your network.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--primary" style="background:#ff2b2b;color:#fff;border-color:#ff2b2b" href="https://vmodelapp.com" target="_blank" rel="noopener noreferrer">Visit vmodelapp.com</a>
<a class="vl-inner__cta a--ghost" href="products.html">All products</a>
</div>""",
        False,
    ),
    (
        "product-wearhouse.html",
        "Wearhouse - Voltis Labs",
        "Fashion",
        """Wearhouse<br><span style="color:#ff2b2b">Secondhand fashion marketplace</span>""",
        r"""<p class="p1"><strong>Wearhouse: a new era of secondhand fashion.</strong> Fashion is more than just clothing - it’s a reflection of personality, creativity, and individuality. But the way we consume fashion has changed drastically. Overproduction, impulse shopping, and short-lived trends have created a wasteful cycle where clothes are discarded faster than ever before. At Wearhouse, we’re flipping the script.</p>
<p class="p1">Wearhouse isn’t just another resale platform. We’re redefining secondhand fashion by making it simpler, smarter, and more rewarding for both buyers and sellers. We believe in quality over quantity, sustainability over waste, and individuality over mass production.</p>
<p class="p1">Every piece of clothing has a story, and we’re here to help it continue - through new owners, new styles, and new possibilities.</p>
<p class="p1">Wearhouse is a secondhand fashion marketplace designed for style-conscious, sustainability-minded shoppers. It offers a seamless platform to buy and sell preloved clothing and accessories with ease. From everyday essentials to designer pieces, users can list items, grade their condition, create profiles, and manage their wardrobes in a way that feels modern, intuitive, and community-driven.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--primary" style="background:#ff2b2b;color:#fff;border-color:#ff2b2b" href="https://mywearhouse.co.uk" target="_blank" rel="noopener noreferrer">Visit mywearhouse.co.uk</a>
<a class="vl-inner__cta a--ghost" href="products.html">All products</a>
</div>""",
        False,
    ),
    (
        "product-spinnersonic.html",
        "Spinnersonic - Voltis Labs",
        "Games",
        """Spinnersonic<br><span style="color:#ff2b2b">Spin fast. Spin fierce. Spin legendary.</span>""",
        r"""<p class="p1">Spinnersonic is a high-energy fidget spinner game built for mobile and web. With multiple game modes - including multiplayer races, leaderboard challenges, and relaxed free play - it offers a fresh, dynamic take on casual gaming. Players can race, customise spinners, track spin miles, and even compete in reverse-style races where being slow is the way to win.</p>
<p class="p1"><strong>This isn’t just a race - it’s a legacy.</strong></p>
<p class="p1">In the world of Spinnersonic, every hero carries a spark - speed, power, heart, and a hunger to win. Choose your champion from a roster of racers, commanders, tech wizards, and more.</p>
<p class="p1"><strong>Legends aren’t born, they’re spun.</strong></p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--primary" style="background:#ff2b2b;color:#fff;border-color:#ff2b2b" href="https://spinnersonic.com" target="_blank" rel="noopener noreferrer">Open Spinnersonic.com</a>
<a class="vl-inner__cta a--ghost" href="products.html">All products</a>
</div>""",
        False,
    ),
    (
        "product-outfeatz.html",
        "Outfeatz - Voltis Labs",
        "Fashion",
        """Outfeatz<br><span style="color:#ff2b2b">Curate your style, your way</span>""",
        r"""<p class="p1"><strong>Outfeatz - curate your style, your way.</strong> Turn your outfits into stunning digital galleries.</p>
<p class="p1">Outfeatz is a creative styling tool that turns outfit photos into clean, background-free cut-outs. Users can upload pictures, remove the background instantly, and build customised digital galleries of their looks. With the ability to tag brands, create themed collections, and organise their wardrobe visually, Outfeatz empowers users to curate their fashion in a way that’s personal, expressive, and digitally organised.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--ghost" href="products.html">All products</a>
</div>""",
        False,
    ),
    (
        "product-loyalty-bot.html",
        "Loyalty Bot - Voltis Labs",
        "Teams",
        """Loyalty Bot<br><span style="color:#ff2b2b">Discord accountability for remote teams</span>""",
        r"""<p class="p1"><strong>Keep your team sharp, on time, and accountable.</strong></p>
<p class="p1">Loyalty Bot is a productivity and moderation tool built specifically for teams who run their work life on Discord. Loyalty Bot helps you track break times, monitor lateness, and hold everyone to the same standard - fairly, automatically, and without micromanagement.</p>
<p class="p1">Loyalty Bot is a productivity-focused Discord bot built to help remote teams stay accountable and on time. Designed for digital workspaces that use Discord as their primary hub, Loyalty Bot tracks break times, monitors lateness, and applies custom consequences such as salary deductions or logged infractions.</p>
<p class="p1">Loyalty Bot acts as a quiet but firm supervisor, keeping your team aligned without constant manual checks. It integrates smoothly into your team's daily workflow, offering a subtle but effective layer of structure to how your team collaborates.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--ghost" href="products.html">All products</a>
</div>""",
        False,
    ),
    (
        "product-pony.html",
        "PONY - Voltis Labs",
        "Lifestyle",
        """PONY<br><span style="color:#ff2b2b">Match on shared passions</span>""",
        r"""<p class="p1">In our community, dating isn't about swiping endlessly. We believe the strongest relationships begin with shared passions - whether that's music, food, pets, fitness, or films. When you join, you select your core interests, and we match you with people who vibe with the same.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--primary" style="background:#ff2b2b;color:#fff;border-color:#ff2b2b" href="https://myponyapp.com/" target="_blank" rel="noopener noreferrer">Visit myponyapp.com</a>
<a class="vl-inner__cta a--ghost" href="products.html">All products</a>
</div>""",
        False,
    ),
    (
        "product-pinnacle-transfer.html",
        "Pinnacle Transfer - Voltis Labs",
        "Productivity",
        """Pinnacle Transfer<br><span style="color:#ff2b2b">Large files without the friction</span>""",
        r"""<p class="p1">Pinnacle Transfer is built for teams who move large files daily - design exports, video cuts, audio stems, and campaign assets - without fighting attachment limits or scattered drive links. It keeps transfers fast and intentional so collaborators spend less time waiting and more time shipping.</p>
<p class="p1">Whether you are handing off to a remote editor or syncing work between machines, Pinnacle Transfer focuses on a smooth, dependable handoff experience that fits naturally into a creative workflow.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--ghost" href="products.html">All products</a>
</div>""",
        False,
    ),
    (
        "product-clipstack.html",
        "Clipstack - Voltis Labs",
        "Productivity",
        """Clipstack<br><span style="color:#ff2b2b">Your clipboard, organised</span>""",
        r"""<p class="p1">Clipstack is a clipboard manager for people who live in copy-and-paste - developers, writers, support leads, and anyone juggling URLs, snippets, and boilerplate all day. Stack what you copy, search your history, and paste the right item in seconds instead of re-fetching tabs or retyping the same text.</p>
<p class="p1">It turns a chaotic stream of temporary clips into an organised, recallable library so your context stays with you across apps and sessions.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--ghost" href="products.html">All products</a>
</div>""",
        False,
    ),
    (
        "product-bars.html",
        "Bars - Voltis Labs",
        "Productivity",
        """Bars<br><span style="color:#ff2b2b">Stats animation with impact</span>""",
        r"""<p class="p1">Bars is a Voltis Labs productivity experiment for presenting numbers with motion, clarity, and visual impact - ideal for dashboards, decks, and landing pages where metrics should feel alive without distracting from the story.</p>
<p class="p1">Stats animation for presenting numbers with motion, clarity, and visual impact.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--ghost" href="products.html">All products</a>
</div>""",
        False,
    ),
    (
        "product-notepadpro.html",
        "NotepadPro - Voltis Labs",
        "Productivity",
        """NotepadPro<br><span style="color:#ff2b2b">Desktop thinking workspace</span>""",
        r"""<p class="p1">NotepadPro is a desktop thinking workspace from Voltis Labs - plain text, tasks, CSV, HTML preview, and a local-first mindset so you can draft, structure, and preview without fighting the tool.</p>
<p class="p1">Desktop thinking workspace - plain text, tasks, CSV, HTML preview, local-first.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--ghost" href="products.html">All products</a>
</div>""",
        False,
    ),
    (
        "case-voltislabs-website.html",
        "Voltis Labs website - Voltis Labs",
        "Portfolio",
        """Marketing site<br><span style="color:#ff2b2b">voltislabs.com</span>""",
        r"""<p class="p1"><strong>Responsible innovation.</strong> At Voltis Labs, we innovate with purpose and responsibility - crafting technology that enhances lives while considering its long-term impact on people and the planet.</p>
<p class="p1">We believe in building technology that empowers, disrupts, and transforms - always with a thoughtful approach to its risks and rewards.</p>
<p class="p1"><strong>Voltis Labs</strong> ships software people use every day - productivity tools, fashion and retail, lifestyle apps, games, and social products. The public site brings together product stories, updates, and ways to connect with the team.</p>
<p class="p1">We treat every release as a system: a clear proposition, consistent UI patterns, and code your team can extend. Design and engineering stay in one loop from prototype to production.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--primary" style="background:#ff2b2b;color:#fff;border-color:#ff2b2b" href="https://voltislabs.com" target="_blank" rel="noopener noreferrer">Open voltislabs.com</a>
<a class="vl-inner__cta a--ghost" href="portfolio.html">Back to portfolio</a>
</div>""",
        True,
    ),
    (
        "case-spinnersonic-web.html",
        "Spinnersonic (web) - Voltis Labs",
        "Games",
        """Spinnersonic on the web<br><span style="color:#ff2b2b">Racing, spinning, casual play</span>""",
        r"""<p class="p1">Spinnersonic on the web delivers the same high-energy spinner gameplay in the browser - quick sessions, multiplayer energy, and the same “spin fast, spin fierce” attitude as the native experience.</p>
<p class="p1">Spinnersonic is a high-energy fidget spinner game built for mobile and web. With multiple game modes - including multiplayer races, leaderboard challenges, and relaxed free play - players can race, customise spinners, track spin miles, and compete in reverse-style races where being slow wins.</p>
<p class="p1"><strong>Legends aren’t born, they’re spun.</strong></p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--primary" style="background:#ff2b2b;color:#fff;border-color:#ff2b2b" href="https://spinnersonic.com" target="_blank" rel="noopener noreferrer">Visit Spinnersonic.com</a>
<a class="vl-inner__cta a--ghost" href="product-spinnersonic.html">Product page</a>
<a class="vl-inner__cta a--ghost" href="portfolio.html">Back to portfolio</a>
</div>""",
        True,
    ),
    (
        "case-voltis-games.html",
        "Voltis Labs games - Voltis Labs",
        "Games",
        """Voltis Labs games<br><span style="color:#ff2b2b">Playful experiments that ship</span>""",
        r"""<p class="p1">Voltis Labs builds games and playful products alongside our productivity and marketplace work. Our games focus on tight loops, memorable characters, and modes you can enjoy in short sessions - from competitive spins to relaxed practice.</p>
<p class="p1"><strong>Spinnersonic</strong> is our flagship casual game: high-energy spinner races, multiplayer modes, leaderboards, and customisation. It represents how we approach games - bold motion, readable UI, and mechanics that are easy to pick up and hard to put down.</p>
<p class="p1">New titles and experiments follow the same bar: performance on real devices, respectful monetisation where it applies, and design that respects player time.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--primary" style="background:#ff2b2b;color:#fff;border-color:#ff2b2b" href="https://spinnersonic.com" target="_blank" rel="noopener noreferrer">Play Spinnersonic</a>
<a class="vl-inner__cta a--ghost" href="portfolio.html">Back to portfolio</a>
</div>""",
        True,
    ),
    (
        "case-pebble-cleaning.html",
        "Pebble Cleaning - Voltis Labs",
        "Partners",
        """Pebble Cleaning<br><span style="color:#ff2b2b">External project</span>""",
        r"""<p class="p1">This portfolio entry highlights <strong>Pebble Cleaning</strong> - a partner project promoted from the Voltis Labs portfolio. The live experience lives on Pebble Cleaning’s own website.</p>
<p class="p1 vl-inner__note">If you manage this brand, replace the button URL below with the canonical Pebble Cleaning site if it differs.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--primary" style="background:#ff2b2b;color:#fff;border-color:#ff2b2b" href="https://pebblecleaning.com" target="_blank" rel="noopener noreferrer">Visit Pebble Cleaning</a>
<a class="vl-inner__cta a--ghost" href="portfolio.html">Back to portfolio</a>
</div>""",
        True,
    ),
    (
        "case-spinnersonic-com.html",
        "Spinnersonic.com - Voltis Labs",
        "Games",
        """Spinnersonic<br><span style="color:#ff2b2b">Official site</span>""",
        r"""<p class="p1">Open the official Spinnersonic experience at <strong>Spinnersonic.com</strong> - gameplay, updates, and downloads as published by the product team.</p>
<div class="vl-inner__cta">
<a class="vl-inner__cta a--primary" style="background:#ff2b2b;color:#fff;border-color:#ff2b2b" href="https://spinnersonic.com" target="_blank" rel="noopener noreferrer">Go to Spinnersonic.com</a>
<a class="vl-inner__cta a--ghost" href="portfolio.html">Back to portfolio</a>
</div>""",
        True,
    ),
]


def main() -> None:
    for fname, title, kicker, hl, body, port_nav in PAGES:
        head = build_head(title)
        hdr = patch_header(port_nav)
        foot = patch_footer(port_nav)
        main_html = wrap_main(kicker, hl, body)
        full = (
            head
            + '\n<body class="wp-singular page-template-default page wp-theme-Voltis Labs switch">\n'
            + hdr
            + main_html
            + foot
        )
        out = ROOT / fname
        out.write_text(full, encoding="utf-8")
        print("Wrote", out.relative_to(ROOT))


if __name__ == "__main__":
    main()
