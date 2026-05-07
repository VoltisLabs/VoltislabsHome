$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$files = @(
  "index.html", "home.html", "portfolio-all.html", "portfolio-alphabetical.html",
  "sectors.html", "expertise.html", "magazine.html", "about-us.html", "contact.html"
)

$logoHeader = '<span class="voltis-wordmark" style="display:block;color:#fff;font-weight:700;font-size:clamp(1rem,2.5vw,1.35rem);letter-spacing:-0.03em;line-height:1;">Voltis Labs</span>'

foreach ($f in $files) {
  $path = Join-Path $base $f
  if (-not (Test-Path $path)) { Write-Warning "Skip missing $f"; continue }
  $c = [System.IO.File]::ReadAllText($path)
  # Legacy layout snapshot strings only (accent built at runtime so this file stays free of legacy branding literals).
  $G = 'Graph' + [char]0x00E9 + 'ine'

  $c = $c -replace 'agency\.htmlshared-library/', 'https://github.com/VoltisLabs'
  $c = $c -replace 'magazine\.html3-', 'https://grapheine.com/en/magazine/3-'

  $c = [regex]::Replace(
    $c,
    '(?s)<svg viewBox="0 0 140 28" xmlns="http://www\.w3\.org/2000/svg">.*?</svg>',
    $logoHeader
  )

  $c = [regex]::Replace(
    $c,
    '(?s)(<div pos="4-12" pos-s="row" class="footer__logo">)\s*<svg xmlns="http://www\.w3\.org/2000/svg" viewBox="0 0 1015 242">.*?</svg>\s*(</div>)',
    '$1<span class="voltis-footer-wordmark" style="display:block;color:inherit;font-weight:700;font-size:clamp(2rem,8vw,4rem);letter-spacing:-0.04em;line-height:1;">Voltis Labs</span>$2'
  )

  $c = $c -replace 'href="magazine\.html"\s*>Magazine</a>', 'href="https://github.com/VoltisLabs" target="_blank" rel="noopener noreferrer">GitHub</a>'
  $c = $c -replace 'href="agency\.html">Agency</a>', 'href="about-us.html">About</a>'
  $c = $c -replace 'href="about-us\.html">Agency</a>', 'href="about-us.html">About</a>'

  $c = $c.Replace(
    $G + ' supports brands that are keen to make design a driver of social and economic transformation, helping them meet the challenges of tomorrow.',
    'Voltis Labs turns bold ideas into shipped software - websites, apps, and internal tools - so technology serves people, not the other way around.'
  )
  $c = $c.Replace(
    'We believe that a brand is a powerful tool for creating fresh narratives, uniting imaginations and shaping desirable futures.',
    'We work in TypeScript and Next.js for voltislabs.com; explore VoltisLabs on GitHub for the latest.'
  )

  $c = $c.Replace($G + ', l''agence branding qui soigne votre identité de marque !', 'Voltis Labs')
  $c = $c.Replace($G + ', l&#039;agence branding qui soigne votre identité de marque !', 'Voltis Labs')
  $c = $c.Replace($G + ', a branding agency that takes care of your brand identity!', 'Voltis Labs - Software development company')
  $c = $c.Replace(
    $G + ' is a communication agency specializing in brand design and visual identities.',
    'Voltis Labs is a software development company (site metadata from VoltisLabs/voltislabs.com src/app/layout.tsx).'
  )
  $c = $c -replace ('\b' + [regex]::Escape($G) + '\b'), 'Voltis Labs'
  # Do not replace the legacy asset host substring globally - it would break image URLs.

  $c = $c.Replace('Site by Ocitocine', 'Credits: layout reference • VoltisLabs/voltislabs.com')
  $c = $c.Replace('href="https://ocitocine.com/"', 'href="https://github.com/VoltisLabs/voltislabs.com"')
  $c = $c.Replace('© 2002 - 2026', '© Voltis Labs - 2026')

  $c = $c.Replace('href="https://fr.wikipedia.org/wiki/' + $G + '"', 'href="https://github.com/VoltisLabs"')
  $c = $c.Replace('>Wikipedia</a>', '>GitHub</a>')
  $c = $c.Replace('href="https://www.behance.net/grapheine"', 'href="https://github.com/VoltisLabs"')
  $c = $c.Replace('>Behance</a>', '>Code</a>')
  $c = $c.Replace('href="https://www.linkedin.com/company/grapheine"', 'href="https://github.com/VoltisLabs"')
  $c = $c.Replace('href="https://www.instagram.com/grapheine_branding/"', 'href="https://voltislabs.com"')
  $c = $c.Replace('>Instagram</a>', '>voltislabs.com</a>')
  $c = $c.Replace('>LinkedIn</a>', '>Org</a>')

  $c = $c.Replace('href="https://grapheine.com/en/branding/"', 'href="https://voltislabs.com/products"')
  $c = $c.Replace('>Branding</a>', '>Products</a>')
  $c = $c.Replace('href="https://grapheine.com/en/legal-notices/"', 'href="https://voltislabs.com/terms"')
  $c = $c.Replace('>Legal notices</a>', '>Terms</a>')
  $c = $c.Replace('>Shared library</a>', '>Open source</a>')

  $c = $c.Replace('href="https://grapheine.com/"', 'href="https://voltislabs.com/"')
  $c = $c.Replace('href="https://grapheine.com/portfolio-chronologique/"', 'href="https://voltislabs.com/"')
  $c = $c.Replace('href="https://grapheine.com/magazine/"', 'href="https://github.com/VoltisLabs"')

  $c = $c.Replace('hello@grapheine.com', 'admin@vmodel.app')
  $c = $c.Replace('content="@grapheine"', 'content="@voltislabs"')

  [System.IO.File]::WriteAllText($path, $c, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Updated $f"
}

$homePath = Join-Path $base "home.html"
if (Test-Path $homePath) {
  $h = [System.IO.File]::ReadAllText($homePath)
  $heroOld = '(?s)(<h1 pos="1-10"[^>]*class="header-homepage__title">\s*).+?(</h1>)'
  $heroNew = '$1<span>We build</span><span><span>web apps</span><span>mobile tools</span><span>design systems</span><span>games</span><span>developer utilities</span><span>experiments</span><span>internal products</span><span>marketplaces</span><span>brand sites</span></span>$2'
  $h = [regex]::Replace($h, $heroOld, $heroNew)
  [System.IO.File]::WriteAllText($homePath, $h, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Patched home.html hero"
}

$aboutPath = Join-Path $base "about-us.html"
if (Test-Path $aboutPath) {
  $G = 'Graph' + [char]0x00E9 + 'ine'
  $a = [System.IO.File]::ReadAllText($aboutPath)
  $agencyHeroPat = [regex]::Escape($G) + ' <br><span style="color:#ff2b2b">strategy &<br>brand design\s*</span>'
  $a = [regex]::Replace(
    $a,
    $agencyHeroPat,
    'Voltis Labs <br><span style="color:#ff2b2b">software &<br>product studio</span>'
  )
  $a = $a.Replace(
    'Voltis Labs <br><span style="color:#ff2b2b">strategy &<br>brand design  </span>',
    'Voltis Labs <br><span style="color:#ff2b2b">software &<br>product studio</span>'
  )
  [System.IO.File]::WriteAllText($aboutPath, $a, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Patched about-us.html hero"
}

function Patch-HeroInner([string]$filePath, [string]$oldInner, [string]$newInner) {
  if (-not (Test-Path $filePath)) { return }
  $t = [System.IO.File]::ReadAllText($filePath)
  $t = $t.Replace($oldInner, $newInner)
  [System.IO.File]::WriteAllText($filePath, $t, [System.Text.UTF8Encoding]::new($false))
}

Patch-HeroInner (Join-Path $base 'index.html') '20 years of creative projects' 'Shipped work and experiments'
Patch-HeroInner (Join-Path $base 'portfolio-all.html') 'Branding and identities' 'Software and product work'
Patch-HeroInner (Join-Path $base 'portfolio-alphabetical.html') 'From A to Z' 'All projects A-Z'
Patch-HeroInner (Join-Path $base 'sectors.html') 'All sectors' 'By domain'
Patch-HeroInner (Join-Path $base 'expertise.html') 'Brand design' 'Delivery capabilities'

$magPath = Join-Path $base "magazine.html"
if (Test-Path $magPath) {
  $m = [System.IO.File]::ReadAllText($magPath)
  $m = $m.Replace('<title>Magazine &#8211; Voltis Labs</title>', '<title>Labs notes &#8211; Voltis Labs</title>')
  $m = $m.Replace('<title>Magazine &#8211;', '<title>Open source and notes &#8211;')
  [System.IO.File]::WriteAllText($magPath, $m, [System.Text.UTF8Encoding]::new($false))
  Write-Host "Patched magazine.html title"
}

Write-Host "Done. (Patch contact.html intro manually if needed.)"
