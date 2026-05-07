/**
 * Animate UI-style code block demo.
 * - About: types a small React sample (parity with upstream).
 * - Home (`data-vl-home-boot-demo`): Voltimicro launcher (+ optional lead comments); hero headline is static product copy managed here, not merged with About.
 */
(function () {
  var DEMO_CODE =
    "'use client';\n" +
    "\n" +
    "type P = { text: string };\n" +
    "\n" +
    "export function Hint(props: P) {\n" +
    "  return <p>{props.text}</p>;\n" +
    "}\n";

  /**
   * Homepage Voltimicro cycle: headline stays shipping/product framing (independent from About page).
   */
  var HOME_SLIDE_RESTART_MS = 16500;

  var HOME_LAUNCH_CODE =
    "/**\n" +
    " * Tiny launcher for the homepage demo.\n" +
    " * Boot, wait, show the live stage.\n" +
    " */\n" +
    "async function voltimicroBoot() {\n" +
    '  console.log("[vm] self-test OK");\n' +
    "  await sleep(18);\n" +
    '  console.log("[vm] load modules");\n' +
    "  await Promise.resolve();\n" +
    '  return { ok: true, channel: "foreground" };\n' +
    "}\n" +
    "\n" +
    "voltimicroBoot().then((handoff) => {\n" +
    '  console.log("[vm] handoff:", handoff.channel);\n' +
    "});\n";

  /** Primary line stays "Ship…"; extras only rotate headline if carousel runs (prefs). */
  var HOME_TAGLINE_SLIDES = [
    {
      headlineHtml:
        'Ship products people<br /><span class="vl-home-hero__accent">use every day.</span>',
      launchSubtitle: "welcome",
      codeLead:
        "/**\n * Ship useful apps. Clear UX.\n * Try the demo below.\n */\n",
    },
  ];

  function homeSlideCode(slideIx) {
    var meta = homeSlideMeta(slideIx);
    var lead = meta.codeLead ? String(meta.codeLead) : "";
    return lead + HOME_LAUNCH_CODE;
  }

  function homeSlideMeta(ix) {
    var n = HOME_TAGLINE_SLIDES.length || 1;
    return HOME_TAGLINE_SLIDES[((ix % n) + n) % n];
  }

  /** Sync the left-column hero headline with the carousel slide (trusted HTML only). */
  function applyHomeHeroHeadline(ix) {
    var el = document.querySelector(".vl-home-hero__headline");
    if (!el) return;
    el.innerHTML = homeSlideMeta(ix).headlineHtml;
  }

  function scheduleHomeSlideLoop(root, preEl, codeEl, launchEl, session) {
    if (session.loopAdvanceTimer) {
      window.clearTimeout(session.loopAdvanceTimer);
      session.loopAdvanceTimer = null;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    session.loopAdvanceTimer = window.setTimeout(function () {
      session.loopAdvanceTimer = null;
      if (session.aborting) return;
      session.slideIndex =
        ((session.slideIndex + 1) % HOME_TAGLINE_SLIDES.length +
          HOME_TAGLINE_SLIDES.length) %
        HOME_TAGLINE_SLIDES.length;
      restartHomeDemoFromCode(root, preEl, codeEl, launchEl, session);
    }, HOME_SLIDE_RESTART_MS);
  }

  var ABOUT_DURATION_MS = 12000;
  var ABOUT_STAGGER_MS = 420;
  /** Text-only swap for `.hero__description` after the code demo (matches homepage hero subline tone). */
  var ABOUT_HERO_FINAL_HTML =
    'Thoughtfully crafted apps<br /><span style="color:#ff2b2b">Ship clear. Ship often.</span>';

  /** ~same perceived pace as About block for similar length code */
  function homeTypingDuration(codeLen) {
    var ratio = DEMO_CODE.length / ABOUT_DURATION_MS;
    return Math.max(8500, Math.min(15500, codeLen / ratio));
  }

  if (!document.querySelectorAll || !window.matchMedia) return;

  function initAboutBlock(root, blockIndex) {
    if (root.hasAttribute("data-vl-home-boot-demo")) return;

    var baseDelay =
      typeof blockIndex === "number"
        ? 350 + blockIndex * ABOUT_STAGGER_MS
        : 350;

    var codeEl = root.querySelector("[data-vl-animate-code]");
    if (!codeEl) return;

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    var heroDesc = document.querySelector(
      ".vl-agency-about .hero .hero__description",
    );

    /** After DEMO_CODE typed: animate “execute”, hold “…” for 2s, then swap headline copy. */
    function runAboutExecuteThenRevealHero(onDone) {
      if (reducedMotion || !heroDesc) {
        if (typeof onDone === "function") onDone();
        return;
      }

      var execLine = "\n\nexecute";
      var ei = 0;
      var msExec = 42;

      function stepExecute() {
        if (ei > execLine.length) {
          codeEl.textContent = DEMO_CODE + execLine;
          window.setTimeout(function () {
            codeEl.textContent = DEMO_CODE + execLine + "...";
            window.setTimeout(function () {
              heroDesc.innerHTML = ABOUT_HERO_FINAL_HTML;
              if (typeof onDone === "function") onDone();
            }, 2000);
          }, 80);
          return;
        }
        codeEl.textContent = DEMO_CODE + execLine.slice(0, ei);
        ei += 1;
        window.setTimeout(stepExecute, msExec);
      }

      window.setTimeout(stepExecute, 120);
    }

    function finish() {
      root.setAttribute("data-done", "true");
      root.setAttribute("data-vl-phase", "code");
      codeEl.textContent = DEMO_CODE;
      runAboutExecuteThenRevealHero(function () {
        root.setAttribute("data-vl-about-headline-phase", "final");
      });
    }

    function start() {
      root.setAttribute("data-done", "false");
      root.removeAttribute("data-vl-about-headline-phase");
      if (reducedMotion) {
        root.setAttribute("data-done", "true");
        root.setAttribute("data-vl-phase", "code");
        codeEl.textContent = DEMO_CODE;
        return;
      }

      var len = DEMO_CODE.length;
      var msPerChar = len > 0 ? ABOUT_DURATION_MS / len : ABOUT_DURATION_MS;
      var startAt = Date.now();

      function tick() {
        var elapsed = Date.now() - startAt;
        var n = Math.min(len, Math.floor(elapsed / msPerChar));
        codeEl.textContent = DEMO_CODE.slice(0, n);
        if (n >= len) {
          finish();
          return;
        }
        window.requestAnimationFrame(tick);
      }

      window.requestAnimationFrame(tick);
    }

    if (reducedMotion) {
      root.setAttribute("data-done", "true");
      root.setAttribute("data-vl-phase", "code");
      codeEl.textContent = DEMO_CODE;
      return;
    }

    window.setTimeout(start, baseDelay);
  }

  function appendBootLine(container, text, className) {
    var div = document.createElement("div");
    div.className = className || "vl-boot-line";
    div.textContent = text;
    container.appendChild(div);
  }

  var FLOPPY_LS_KEY = "vl-floppy-ball-hi-v1";
  var FLOPPY_TOP = 10;

  function floppyLoadScores() {
    try {
      var raw = localStorage.getItem(FLOPPY_LS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr)
        ? arr.filter(function (e) {
            return (
              e &&
              typeof e.initials === "string" &&
              typeof e.score === "number"
            );
          })
        : [];
    } catch (err) {
      return [];
    }
  }

  function floppySaveScores(list) {
    try {
      list.sort(function (a, b) {
        return b.score - a.score;
      });
      var trimmed = list.slice(0, FLOPPY_TOP);
      localStorage.setItem(FLOPPY_LS_KEY, JSON.stringify(trimmed));
      return trimmed;
    } catch (err) {
      return list;
    }
  }

  function floppyQualifies(score) {
    if (score < 1) return false;
    var list = floppyLoadScores();
    if (list.length < FLOPPY_TOP) return true;
    return score > list[list.length - 1].score;
  }

  /** World pixel size - fixed logical canvas (stage scales visually, no layout jump). */
  var FLAPPY_W = 288;
  var FLAPPY_H = 360;

  function svgIcon(paths, attrs) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    if (attrs)
      Object.keys(attrs).forEach(function (k) {
        svg.setAttribute(k, attrs[k]);
      });
    for (var p = 0; p < paths.length; p++) {
      var path = document.createElementNS(ns, "path");
      path.setAttribute("d", paths[p]);
      path.setAttribute(
        "fill",
        attrs && attrs.fillNone ? "none" : "currentColor",
      );
      if (attrs && attrs.stroke) {
        path.setAttribute("stroke", "currentColor");
        path.setAttribute("stroke-width", attrs.strokeWidth || "2");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("fill", "none");
      }
      svg.appendChild(path);
    }
    return svg;
  }

  function toolbarIconButton(className, label, iconSvgFactory) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = className;
    btn.setAttribute("aria-label", label);
    btn.appendChild(iconSvgFactory());
    return btn;
  }

  function populateLaunchToolbar(launchEl, welcomeText, onRestartTyping) {
    var bar = launchEl.querySelector(".vl-launch-demo__toolbar--top");
    if (!bar) bar = launchEl.querySelector(".vl-launch-demo__toolbar");
    if (!bar) return { gamesSlot: null };

    bar.innerHTML = "";

    var welcomeEl = document.createElement("span");
    welcomeEl.className = "vl-launch-demo__welcome";
    welcomeEl.textContent = welcomeText;

    var actions = document.createElement("span");
    actions.className = "vl-launch-demo__toolbar-actions";

    var gamesSlot = document.createElement("span");
    gamesSlot.className = "vl-launch-demo__games-slot";

    var refreshBtn = toolbarIconButton(
      "vl-launch-demo__bare-icon vl-launch-demo__bare-icon--refresh",
      "Restart code demo from the beginning",
      function () {
        return svgIcon(
          [
            "M23 4v6h-6",
            "M1 20v-6h6",
            "M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15",
          ],
          { stroke: true, strokeWidth: "2" },
        );
      },
    );
    refreshBtn.addEventListener("click", function () {
      onRestartTyping();
    });

    actions.appendChild(gamesSlot);
    actions.appendChild(refreshBtn);
    bar.appendChild(welcomeEl);
    bar.appendChild(actions);

    return { gamesSlot: gamesSlot };
  }

  function populateLaunchBottomChrome(launchEl) {
    var bar = launchEl.querySelector(".vl-launch-demo__toolbar--bottom");
    if (!bar) return;
    bar.innerHTML = "";
    bar.removeAttribute("aria-hidden");
    var status = document.createElement("span");
    status.className = "vl-launch-demo__footer-status";
    status.textContent = "voltimicro runtime";
    bar.appendChild(status);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlightPlainCodeSegment(seg) {
    if (!seg) return "";
    var escaped = escapeHtml(seg);
    var kw = escaped.replace(
      /\b(import|export|from|type|async|await|function|return|Promise|resolve|voltimicro|sleep|console|log|then|new|setTimeout|true|false|null|undefined)\b/g,
      '<span class="vl-code-hl-kw">$&</span>',
    );
    return kw.replace(
      /\b(\d+)\b/g,
      '<span class="vl-code-hl-num">$1</span>',
    );
  }

  /** Syntax highlight for the homepage launcher snippet (strings, block doc, // comments, then keywords). */
  function colorizeHomeCode(raw) {
    if (!raw) return "";
    var out = "";
    var i = 0;
    var n = raw.length;

    while (i < n) {
      if (raw.slice(i, i + 2) === "/*") {
        var dc = raw.indexOf("*/", i + 2);
        var endDc = dc === -1 ? n : dc + 2;
        out +=
          '<span class="vl-code-hl-doc">' +
          escapeHtml(raw.slice(i, endDc)) +
          "</span>";
        i = endDc;
        continue;
      }
      if (raw.slice(i, i + 2) === "//") {
        var nl = raw.indexOf("\n", i);
        var endL = nl === -1 ? n : nl + 1;
        out +=
          '<span class="vl-code-hl-comment">' +
          escapeHtml(raw.slice(i, endL)) +
          "</span>";
        i = endL;
        continue;
      }
      if (raw[i] === '"') {
        var j = i + 1;
        while (j < n) {
          if (raw[j] === "\\") {
            j += 2;
            continue;
          }
          if (raw[j] === '"') break;
          j++;
        }
        var endS = Math.min(j + 1, n);
        out +=
          '<span class="vl-code-hl-str">' +
          escapeHtml(raw.slice(i, endS)) +
          "</span>";
        i = endS;
        continue;
      }
      var nextSpec = n;
      var kk = raw.indexOf("/*", i);
      if (kk !== -1) nextSpec = Math.min(nextSpec, kk);
      kk = raw.indexOf("//", i);
      if (kk !== -1) nextSpec = Math.min(nextSpec, kk);
      kk = raw.indexOf('"', i);
      if (kk !== -1) nextSpec = Math.min(nextSpec, kk);
      out += highlightPlainCodeSegment(raw.slice(i, nextSpec));
      i = nextSpec;
    }
    return out;
  }

  function buildHomeTypingTimeline(full) {
    /** @type {{ snap?: number; wait?: number }[]} */
    var out = [];
    var n = full.length;
    var vm = full.indexOf("voltimicroBoot") !== -1;
    for (var ii = 1; ii <= n; ii++) {
      out.push({ snap: ii });
      if (ii >= 2 && full.slice(ii - 2, ii) === "*/") {
        out.push({ wait: vm ? 120 : 90 });
      }
      var ch = full[ii - 1];
      if (ch === "\n" && ii < n) {
        out.push({ wait: vm ? 48 : 72 });
      }
    }
    return out;
  }

  function mountMiniFlappy(parentEl, reducedMotionBoot, toolbarGamesSlot) {
    var useBareToolbarIcons = !!toolbarGamesSlot;

    var wrap = document.createElement("div");
    wrap.className = "vl-mini-floppy";
    wrap.setAttribute("role", "application");
    wrap.setAttribute(
      "aria-label",
      "Floppy Ball - tap, click, or Space to bounce. Pause: Escape. Top toolbar: leaderboard and fullscreen.",
    );

    var bar = null;

    var hud = document.createElement("div");
    hud.className = "vl-mini-floppy__footer-hud";
    hud.setAttribute("aria-live", "polite");
    hud.setAttribute("aria-atomic", "true");

    var stage = document.createElement("div");
    stage.className = "vl-mini-floppy__stage";

    var canvas = document.createElement("canvas");
    canvas.className = "vl-mini-floppy__canvas";
    canvas.setAttribute(
      "aria-label",
      "Floppy Ball playfield - tap or Space to flap.",
    );
    canvas.setAttribute("tabindex", "0");

    var iconBtnClassBase = useBareToolbarIcons
      ? "vl-launch-demo__bare-icon"
      : "vl-mini-floppy__icon-btn";

    var pauseBtn = toolbarIconButton(
      "vl-mini-floppy__icon-btn vl-mini-floppy__icon-btn--corner",
      "Pause game (Escape)",
      function () {
        return svgIcon(
          ["M6 5h4v14H6V5zm8 0h4v14h-4V5"],
          {},
        );
      },
    );

    var fsBtn = toolbarIconButton(
      iconBtnClassBase,
      "Fullscreen the game area",
      function () {
        return svgIcon(
          [
            "M8 4H6a2 2 0 0 0-2 2v2m12-4h2a2 2 0 0 1 2 2v2M8 20H6a2 2 0 0 1-2-2v-2m12 4h2a2 2 0 0 0 2-2v-2",
          ],
          { stroke: true, strokeWidth: "1.5" },
        );
      },
    );

    var closeFsBtn = toolbarIconButton(
      iconBtnClassBase +
        (useBareToolbarIcons
          ? " vl-launch-demo__bare-icon--exit-fs"
          : " vl-mini-floppy__icon-btn--exit-fs"),
      "Exit fullscreen",
      function () {
        return svgIcon(
          ["M6 18L18 6M6 6l12 12"],
          { stroke: true, strokeWidth: "1.75" },
        );
      },
    );
    closeFsBtn.hidden = true;
    closeFsBtn.setAttribute("aria-hidden", "true");

    var hiBtn = toolbarIconButton(
      iconBtnClassBase,
      "Top 10 scores",
      function () {
        return svgIcon(
          ["M12 17l3 2-1-3.5 2.5-2.2-3 .2z", "M4 21h16"],
          { stroke: true, strokeWidth: "1.5" },
        );
      },
    );

    hiBtn.disabled = false;
    pauseBtn.setAttribute("aria-pressed", "false");

    if (toolbarGamesSlot) {
      toolbarGamesSlot.appendChild(closeFsBtn);
      toolbarGamesSlot.appendChild(hiBtn);
      toolbarGamesSlot.appendChild(fsBtn);
    } else {
      bar = document.createElement("div");
      bar.className = "vl-mini-floppy__game-bar vl-mini-floppy__top-bar";
      bar.setAttribute("aria-label", "Floppy Ball top toolbar");
      bar.appendChild(closeFsBtn);
      bar.appendChild(fsBtn);
      bar.appendChild(hiBtn);
      wrap.appendChild(bar);
    }

    var brandEl = document.createElement("div");
    brandEl.className = "vl-mini-floppy__stage-brand";
    brandEl.textContent = "by Voltis Labs";

    var cornerBar = document.createElement("div");
    cornerBar.className = "vl-mini-floppy__corner-bar";
    cornerBar.setAttribute("aria-label", "In-game controls");

    stage.appendChild(canvas);
    stage.appendChild(brandEl);
    cornerBar.appendChild(pauseBtn);
    stage.appendChild(cornerBar);
    wrap.appendChild(stage);

    wrap.appendChild(hud);
    parentEl.appendChild(wrap);

    var overlays = document.createElement("div");
    overlays.className = "vl-mini-floppy__overlays";
    stage.appendChild(overlays);

    var dpr = typeof window.devicePixelRatio === "number" ? window.devicePixelRatio : 1;
    var ctx = canvas.getContext("2d");

    var reducedMotion = reducedMotionBoot;

    var G = reducedMotion ? 0.42 : 0.48;
    var FLAP = reducedMotion ? -6.9 : -7.55;
    var PIPE_SPEED = reducedMotion ? 2.05 : 2.45;
    var PIPE_GAP = 112;
    var PIPE_W = 44;
    var PIPE_HORIZONTAL_GAP = 158;
    var BIRD_X = FLAPPY_W * 0.28;
    var BIRD_R = 12;
    var groundY = FLAPPY_H - 22;

    /** @type {'idle' | 'splash' | 'playing' | 'dying' | 'dead' | 'paused'} */
    var phase = "idle";
    var splashT0 = 0;
    var deathT0 = 0;
    var deathSx = BIRD_X;
    var deathSy = FLAPPY_H / 2;
    /** @type {{ x:number,y:number,vx:number,vy:number,r:number,life:number, color:string }[]} */
    var splatDots = [];

    var birdY = FLAPPY_H / 2;
    var vy = 0;
    /** @type {{ x: number, gapY: number, scored: boolean }[]} */
    var pipes = [];
    var score = 0;
    var frame = 0;
    var rafId = null;
    var ro = null;

    function isWrapFullscreen() {
      return (
        document.fullscreenElement === wrap ||
        document.webkitFullscreenElement === wrap ||
        document.msFullscreenElement === wrap
      );
    }

    function requestWrapFullscreen() {
      var req =
        wrap.requestFullscreen ||
        wrap.webkitRequestFullscreen ||
        wrap.msRequestFullscreen;
      if (!req) return;
      try {
        req.call(wrap, { navigationUI: "hide" });
      } catch (errTry) {
        try {
          req.call(wrap);
        } catch (errIgnore) {}
      }
    }

    function exitDocumentFullscreen() {
      var ex =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.msExitFullscreen;
      if (ex) {
        try {
          ex.call(document);
        } catch (errIgnore) {}
      }
    }

    function syncFullscreenUi() {
      var on = isWrapFullscreen();
      wrap.classList.toggle("vl-mini-floppy--fullscreen", on);
      closeFsBtn.hidden = !on;
      closeFsBtn.setAttribute("aria-hidden", on ? "false" : "true");
      fsBtn.hidden = on;
      fsBtn.setAttribute("aria-hidden", on ? "true" : "false");
      window.setTimeout(resize, 0);
    }

    function setHud(text) {
      hud.textContent = text;
    }

    function resize() {
      var sw =
        typeof stage.clientWidth === "number" && stage.clientWidth >= 48
          ? stage.clientWidth
          : FLAPPY_W;
      var maxW = sw;
      var worldScale = maxW / FLAPPY_W;
      if (isWrapFullscreen()) {
        worldScale = Math.min(worldScale * 1.14, 4.25);
      }
      canvas.style.width = maxW + "px";
      canvas.style.height = Math.round(FLAPPY_H * worldScale) + "px";
      canvas.width = Math.max(1, Math.round(maxW * dpr));
      canvas.height = Math.max(1, Math.round(FLAPPY_H * worldScale * dpr));
      ctx.setTransform(dpr * worldScale, 0, 0, dpr * worldScale, 0, 0);
      drawWorld();
    }

    function rndGapY() {
      var pad = 64;
      return pad + Math.random() * (FLAPPY_H - PIPE_GAP - 2 * pad);
    }

    function resetGame() {
      birdY = FLAPPY_H / 2;
      vy = 0;
      pipes = [{ x: FLAPPY_W + 72, gapY: rndGapY(), scored: false }];
      score = 0;
      frame = 0;
      splatDots = [];
    }

    function spawnSplat(px, py) {
      var hues = ["#d4e875", "#c8eb6a", "#e8dc5f", "#9fd97a"];
      for (var i = 0; i < 14; i++) {
        var ang = (Math.PI * 2 * i) / 14 + Math.random() * 0.9;
        var sp = 1.8 + Math.random() * 4.8;
        splatDots.push({
          x: px,
          y: py,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - (Math.random() * 3 + 1),
          r: 1.8 + Math.random() * 3,
          life: 1,
          color: hues[i % hues.length],
        });
      }
    }

    function beginDying() {
      phase = "dying";
      deathT0 = Date.now();
      deathSx = BIRD_X;
      deathSy = birdY;
      spawnSplat(BIRD_X, birdY + BIRD_R * 0.2);
      if (rafId == null) {
        rafId = window.requestAnimationFrame(loop);
      }
    }

    function finishDying() {
      phase = "dead";
      setHud(
        floppyQualifies(score)
          ? "Top 10! Enter initials below or tap restart."
          : "Game over - score " +
              score +
              ". Tap the playfield or Space to retry.",
      );
      if (floppyQualifies(score)) {
        ensureHiEntry(score);
      } else {
        removeHiModal();
      }
      updateHiPanelIfOpen();
      rafId = null;
      drawWorld();
    }

    var hiModal = null;

    function removeHiModal() {
      if (hiModal && hiModal.parentNode) {
        hiModal.parentNode.removeChild(hiModal);
      }
      hiModal = null;
    }

    function ensureHiEntry(finalScore) {
      removeHiModal();
      var panel = document.createElement("div");
      panel.className = "vl-mini-floppy__hi-entry";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-modal", "true");
      panel.setAttribute("aria-label", "Save high score");

      var ttl = document.createElement("div");
      ttl.className = "vl-mini-floppy__hi-entry-title";
      ttl.textContent = "Nice run - ranked top 10!";

      var row = document.createElement("div");
      row.className = "vl-mini-floppy__hi-entry-row";

      var inpId = "vl-floppy-init-" + String(Date.now());
      var lab = document.createElement("label");
      lab.className = "vl-mini-floppy__hi-entry-label";
      lab.textContent = "Initials";
      lab.setAttribute("for", inpId);

      var input = document.createElement("input");
      input.id = inpId;
      input.className = "vl-mini-floppy__hi-entry-input";
      input.setAttribute("maxlength", "3");
      input.setAttribute(
        "pattern",
        "[A-Za-z]{1,3}",
      );
      input.setAttribute(
        "placeholder",
        "ABC",
      );
      input.autocomplete = "off";

      var saveBtn = document.createElement("button");
      saveBtn.type = "button";
      saveBtn.className = "vl-mini-floppy__hi-entry-save";
      saveBtn.textContent = "Save";

      row.appendChild(lab);
      row.appendChild(input);
      panel.appendChild(ttl);
      panel.appendChild(row);
      panel.appendChild(saveBtn);
      overlays.appendChild(panel);
      hiModal = panel;

      function saveScore() {
        var raw = input.value.trim().toUpperCase().replace(/[^A-Z]/g, "");
        if (raw.length < 1) {
          raw = "VL";
        }
        raw = raw.slice(0, 3);
        var list = floppyLoadScores().concat([
          { initials: raw, score: finalScore },
        ]);
        floppySaveScores(list);
        removeHiModal();
        setHud(
          "Saved as " +
            raw +
            " · score " +
            finalScore +
            ". Tap playfield or Space to retry.",
        );
        updateHiPanelIfOpen();
      }

      saveBtn.addEventListener("click", saveScore);
      input.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") {
          ev.preventDefault();
          saveScore();
        }
      });
      window.setTimeout(function () {
        input.focus();
      }, 50);
    }

    var scoresPanel = null;

    function updateHiPanelIfOpen() {
      if (!scoresPanel || !scoresPanel.isConnected) return;
      scoresPanel.innerHTML = "";
      var head = document.createElement("div");
      head.className = "vl-mini-floppy__sheet-title";
      head.textContent = "Floppy Ball - top scores";
      var list = floppyLoadScores();
      var ul = document.createElement("ol");
      ul.className = "vl-mini-floppy__scores-list";
      for (var i = 0; i < FLOPPY_TOP; i++) {
        var li = document.createElement("li");
        li.className = "vl-mini-floppy__scores-row";
        if (list[i]) {
          var ini = document.createElement("span");
          ini.textContent = list[i].initials;
          var sc = document.createElement("strong");
          sc.textContent = String(list[i].score);
          li.appendChild(ini);
          li.appendChild(sc);
        } else {
          li.textContent = "-";
        }
        ul.appendChild(li);
      }
      var closeHint = document.createElement("button");
      closeHint.type = "button";
      closeHint.className = "vl-mini-floppy__sheet-close";
      closeHint.textContent = "Close";
      closeHint.addEventListener("click", function () {
        removeScoresPanel();
      });
      scoresPanel.appendChild(head);
      scoresPanel.appendChild(ul);
      scoresPanel.appendChild(closeHint);
    }

    function removeScoresPanel() {
      if (scoresPanel && scoresPanel.parentNode) {
        scoresPanel.parentNode.removeChild(scoresPanel);
      }
      scoresPanel = null;
      hiBtn.setAttribute("aria-pressed", "false");
    }

    hiBtn.addEventListener("click", function () {
      if (scoresPanel) {
        removeScoresPanel();
        return;
      }
      scoresPanel = document.createElement("div");
      scoresPanel.className = "vl-mini-floppy__scores-sheet";
      scoresPanel.setAttribute("role", "dialog");
      scoresPanel.setAttribute("aria-modal", "true");
      overlays.appendChild(scoresPanel);
      hiBtn.setAttribute("aria-pressed", "true");
      updateHiPanelIfOpen();
    });

    function setPauseUi(isPaused) {
      pauseBtn.innerHTML = "";
      if (isPaused) {
        phase = "paused";
        pauseBtn.setAttribute("aria-pressed", "true");
        pauseBtn.setAttribute("aria-label", "Resume game (Escape)");
        pauseBtn.appendChild(
          svgIcon(
            ["M8 6l10 6-10 6V6z"],
            {},
          ),
        );
      } else {
        phase = "playing";
        pauseBtn.setAttribute("aria-pressed", "false");
        pauseBtn.setAttribute("aria-label", "Pause game (Escape)");
        pauseBtn.appendChild(
          svgIcon(
            ["M6 5h4v14H6V5zm8 0h4v14h-4V5"],
            {},
          ),
        );
        if (rafId == null) rafId = window.requestAnimationFrame(loop);
      }
    }

    function togglePause() {
      if (phase !== "playing" && phase !== "paused") return;
      setPauseUi(phase === "playing");
      drawWorld();
    }

    pauseBtn.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (phase !== "playing" && phase !== "paused") return;
      setPauseUi(phase === "playing");
      drawWorld();
    });

    fsBtn.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (!isWrapFullscreen()) {
        requestWrapFullscreen();
      }
    });

    closeFsBtn.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      if (isWrapFullscreen()) exitDocumentFullscreen();
    });

    function onDocKeydown(ev) {
      if (ev.key !== "Escape") return;
      if (!wrap.isConnected) return;
      if (isWrapFullscreen()) {
        return;
      }
      var ae = document.activeElement;
      if (hiModal && hiModal.contains(ae)) return;
      if (scoresPanel) {
        ev.preventDefault();
        removeScoresPanel();
        return;
      }
      if (!wrap.contains(ae)) return;
      if (phase === "playing" || phase === "paused") {
        ev.preventDefault();
        togglePause();
      }
    }

    document.addEventListener("keydown", onDocKeydown, false);

    function syncPauseAvailability() {
      var on = phase === "playing" || phase === "paused";
      pauseBtn.disabled = !on;
      pauseBtn.style.opacity = on ? "1" : "0.45";
    }

    function flap() {
      if (phase === "idle") {
        phase = "splash";
        splashT0 = Date.now();
        resetGame();
        setHud("Score: 0");
        removeHiModal();
        if (rafId == null) rafId = window.requestAnimationFrame(loop);
        return;
      }
      if (phase === "splash") {
        return;
      }
      if (phase === "dead") {
        phase = "idle";
        removeHiModal();
        setHud("Tap playfield or Space for Floppy Ball");
        syncPauseAvailability();
        drawWorld();
        return;
      }
      if (phase === "paused") {
        return;
      }
      if (phase === "playing") {
        vy = FLAP;
      }
    }

    function hitGroundOrCeiling() {
      return birdY - BIRD_R < 6 || birdY + BIRD_R > FLAPPY_H - 8;
    }

    function pipeCollision(p) {
      var topH = p.gapY - PIPE_GAP / 2;
      var botY = p.gapY + PIPE_GAP / 2;
      var cx = BIRD_X;
      var cy = birdY;
      var inX = cx + BIRD_R > p.x && cx - BIRD_R < p.x + PIPE_W;
      if (!inX) return false;
      return cy - BIRD_R < topH || cy + BIRD_R > botY;
    }

    function drawBall(cx, cy, r, squashX, squashY) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(squashX, squashY);
      ctx.translate(-cx, -cy);
      ctx.fillStyle = "#d4e875";
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(30, 40, 30, 0.55)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#1a2018";
      ctx.beginPath();
      ctx.arc(cx + 4, cy - r * 0.25, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawGroundDecor() {
      var groundH = 22;
      ctx.fillStyle = "#182225";
      ctx.fillRect(0, FLAPPY_H - groundH, FLAPPY_W, groundH);
      ctx.strokeStyle = "rgba(120, 200, 140, 0.22)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, FLAPPY_H - groundH);
      ctx.lineTo(FLAPPY_W, FLAPPY_H - groundH);
      ctx.stroke();
      ctx.fillStyle = "rgba(80, 190, 120, 0.12)";
      for (var s = 0; s < 6; s++) {
        var ox = ((frame * 0.4 + s * 52) % (FLAPPY_W + 40)) - 40;
        ctx.fillRect(ox, FLAPPY_H - groundH - 8, 28, 5);
      }
    }

    function drawWorld() {
      ctx.save();
      ctx.fillStyle = "#0d1112";
      ctx.fillRect(0, 0, FLAPPY_W, FLAPPY_H);
      drawGroundDecor();

      if (phase === "playing" || phase === "paused" || phase === "dying" || phase === "dead") {
        ctx.fillStyle = "#2a4a3a";
        if (phase === "paused") {
          ctx.globalAlpha = 0.92;
        }
        for (var i = 0; i < pipes.length; i++) {
          var p = pipes[i];
          var topH = p.gapY - PIPE_GAP / 2;
          var botY = p.gapY + PIPE_GAP / 2;
          ctx.fillRect(p.x, 0, PIPE_W, Math.max(0, topH));
          ctx.fillRect(p.x, botY, PIPE_W, FLAPPY_H - botY);
          ctx.strokeStyle = "rgba(120, 220, 150, 0.45)";
          ctx.lineWidth = 2;
          ctx.strokeRect(p.x, 0, PIPE_W, Math.max(0, topH));
          ctx.strokeRect(p.x, botY, PIPE_W, FLAPPY_H - botY);
        }
        ctx.globalAlpha = 1;
      }

      ctx.textAlign = "center";

      if (phase === "idle") {
        drawBall(FLAPPY_W / 2, FLAPPY_H * 0.52, BIRD_R, 1, 1);
        ctx.fillStyle = "rgba(248, 248, 240, 0.9)";
        ctx.font = "600 18px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("Floppy Ball", FLAPPY_W / 2, FLAPPY_H * 0.32);
        ctx.font = "500 13px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = "rgba(248, 248, 240, 0.6)";
        ctx.fillText(
          "Tap or Space - splash bounce, then dodge the gates",
          FLAPPY_W / 2,
          FLAPPY_H * 0.76,
        );
      }

      if (phase === "splash") {
        var bounce = reducedMotion ? 12 : Math.abs(Math.sin((Date.now() - splashT0) / 145)) * 46;
        var by =
          FLAPPY_H - 22 - BIRD_R - 4 - bounce;
        ctx.fillStyle = "rgba(248, 248, 240, 0.9)";
        ctx.font = "600 17px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("Floppy Ball", FLAPPY_W / 2, FLAPPY_H * 0.32);
        drawBall(FLAPPY_W / 2, by, BIRD_R, 1 + bounce * 0.0045, 1 - bounce * 0.003);

        ctx.font = "500 11px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = "rgba(248, 248, 240, 0.5)";
        ctx.fillText(
          bounce > 8 ? "Get ready..." : "...",
          FLAPPY_W / 2,
          FLAPPY_H * 0.2,
        );
      }

      if (phase === "playing" || phase === "paused") {
        drawBall(BIRD_X, birdY, BIRD_R, 1, 1);
      }

      if (phase === "dying" || phase === "dead") {
        var elapsed = phase === "dying" ? Date.now() - deathT0 : 500;
        var squ = Math.min(1, elapsed / 220);
        var sx = 1 + squ * 0.95;
        var sy = Math.max(0.14, 1 - squ * 0.92);
        drawBall(deathSx, Math.min(deathSy, groundY - BIRD_R * sy - 4), BIRD_R, sx, sy);
      }

      for (var sd = 0; sd < splatDots.length; sd++) {
        var d = splatDots[sd];
        ctx.fillStyle = d.color;
        ctx.globalAlpha = Math.max(0, d.life * 0.85);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (phase === "paused") {
        ctx.fillStyle = "rgba(6, 8, 10, 0.55)";
        ctx.fillRect(0, 0, FLAPPY_W, FLAPPY_H);
        ctx.fillStyle = "rgba(248, 248, 240, 0.95)";
        ctx.font = "600 24px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("Paused", FLAPPY_W / 2, FLAPPY_H * 0.45);
      }

      if (phase === "dead") {
        ctx.fillStyle = "rgba(248, 248, 240, 0.92)";
        ctx.font = "600 17px ui-sans-serif, system-ui, sans-serif";
        ctx.fillText("Score " + score, FLAPPY_W / 2, FLAPPY_H * 0.42);
        ctx.font = "500 11px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = "rgba(248, 248, 240, 0.62)";
        ctx.fillText(
          "Tap playfield or Space to restart",
          FLAPPY_W / 2,
          FLAPPY_H * 0.53,
        );
      }

      ctx.restore();
      syncPauseAvailability();
    }

    function step() {
      if (phase === "splash") {
        frame++;
        if (Date.now() - splashT0 > (reducedMotion ? 400 : 1950)) {
          phase = "playing";
          setHud("Score: 0");
        }
        return;
      }

      if (phase === "dying") {
        frame++;
        var dt = (Date.now() - deathT0) / (reducedMotion ? 600 : 480);
        for (var ix = splatDots.length - 1; ix >= 0; ix--) {
          var dd = splatDots[ix];
          dd.x += dd.vx * 1.05;
          dd.y += dd.vy;
          dd.vy += 0.35;
          dd.life *= 0.92;
          if (dd.life < 0.08) splatDots.splice(ix, 1);
        }
        if (dt >= 1 || splatDots.length === 0) {
          finishDying();
          return;
        }
        return;
      }

      if (phase !== "playing") return;
      frame++;
      vy += G;
      birdY += vy;

      for (var j = 0; j < pipes.length; j++) {
        pipes[j].x -= PIPE_SPEED;
      }

      if (pipes.length && pipes[0].x + PIPE_W < -8) {
        pipes.shift();
      }

      var rightmost = pipes[pipes.length - 1];
      if (!rightmost || rightmost.x < FLAPPY_W - 52) {
        pipes.push({
          x: rightmost ? rightmost.x + PIPE_HORIZONTAL_GAP : FLAPPY_W + 72,
          gapY: rndGapY(),
          scored: false,
        });
      }

      for (var k = 0; k < pipes.length; k++) {
        var pk = pipes[k];
        if (!pk.scored && pk.x + PIPE_W < BIRD_X - BIRD_R) {
          pk.scored = true;
          score++;
          setHud("Score: " + score);
        }
      }

      if (hitGroundOrCeiling()) {
        beginDying();
        return;
      }
      for (var c = 0; c < pipes.length; c++) {
        if (pipeCollision(pipes[c])) {
          beginDying();
          return;
        }
      }
    }

    function loop() {
      step();
      drawWorld();
      if (phase === "playing" || phase === "splash" || phase === "dying") {
        rafId = window.requestAnimationFrame(loop);
      } else {
        rafId = null;
      }
    }

    function ensureAnimLoop() {
      if (
        (phase === "playing" ||
          phase === "splash" ||
          phase === "dying") &&
        rafId == null
      ) {
        rafId = window.requestAnimationFrame(loop);
      }
    }

    canvas.addEventListener("pointerdown", function (ev) {
      if (overlayBlocksPointer(ev.target)) return;
      ev.preventDefault();
      canvas.focus();
      flap();
      ensureAnimLoop();
      if (phase === "idle" || phase === "dead") drawWorld();
    });

    function overlayBlocksPointer(el) {
      if (!el || !el.closest) return false;
      if (el.closest(".vl-mini-floppy__hi-entry")) return true;
      if (el.closest(".vl-mini-floppy__scores-sheet")) return true;
      return false;
    }

    canvas.addEventListener(
      "keydown",
      function (e) {
        if (e.code === "Space" || e.key === " ") {
          e.preventDefault();
          flap();
          ensureAnimLoop();
          if (phase === "idle" || phase === "dead") drawWorld();
        }
      },
      true,
    );

    var onFullscreenEvent = function () {
      syncFullscreenUi();
      window.setTimeout(resize, 80);
    };
    document.addEventListener("fullscreenchange", onFullscreenEvent);
    document.addEventListener("webkitfullscreenchange", onFullscreenEvent);

    setHud("Tap playfield or Space for Floppy Ball");
    pauseBtn.disabled = true;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(resize);
      ro.observe(stage);
    }
    resize();
    drawWorld();
    syncFullscreenUi();

    return function destroy() {
      removeHiModal();
      removeScoresPanel();
      document.removeEventListener("keydown", onDocKeydown, false);
      document.removeEventListener("fullscreenchange", onFullscreenEvent);
      document.removeEventListener("webkitfullscreenchange", onFullscreenEvent);
      if (rafId != null) window.cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      if (
        document.fullscreenElement === wrap ||
        document.webkitFullscreenElement === wrap ||
        document.msFullscreenElement === wrap
      ) {
        exitDocumentFullscreen();
      }
    };
  }

  function clearHomeTypingPump(session) {
    if (session.typingTimer != null) {
      window.clearTimeout(session.typingTimer);
      session.typingTimer = null;
    }
    if (session.typingRaf != null) {
      window.cancelAnimationFrame(session.typingRaf);
      session.typingRaf = null;
    }
  }

  function driveHomeCodeTyping(
    session,
    codeEl,
    snippet,
    reducedMotionPref,
    onComplete,
  ) {
    clearHomeTypingPump(session);

    if (reducedMotionPref) {
      codeEl.innerHTML = colorizeHomeCode(snippet);
      var tidRm = window.setTimeout(function () {
        var ix = session.bootTimeouts.indexOf(tidRm);
        if (ix !== -1) session.bootTimeouts.splice(ix, 1);
        session.typingTimer = null;
        onComplete();
      }, 120);
      session.typingTimer = tidRm;
      session.bootTimeouts.push(tidRm);
      return;
    }

    var duration = homeTypingDuration(snippet.length);
    var timeline = buildHomeTypingTimeline(snippet);
    var snapSteps = timeline.filter(function (e) {
      return e.snap != null;
    }).length;
    var waitSum = timeline.reduce(function (acc, e) {
      return acc + (e.wait || 0);
    }, 0);
    var snapBudget = duration - waitSum;
    if (snapBudget < 520) snapBudget = 520;
    var msPerSnap = snapSteps > 0 ? snapBudget / snapSteps : 32;

    var stepIx = 0;

    function pumpTyping() {
      if (session.aborting) return;
      if (stepIx >= timeline.length) {
        clearHomeTypingPump(session);
        codeEl.innerHTML = colorizeHomeCode(snippet);
        onComplete();
        return;
      }
      var ev = timeline[stepIx++];
      if (ev.wait != null) {
        session.typingTimer = window.setTimeout(pumpTyping, ev.wait);
        return;
      }
      if (ev.snap != null) {
        codeEl.innerHTML = colorizeHomeCode(snippet.slice(0, ev.snap));
        session.typingTimer = window.setTimeout(pumpTyping, msPerSnap);
      }
    }

    pumpTyping();
  }

  function resetBootOverlayVisuals(launchEl) {
    var overlay = launchEl.querySelector(".vl-launch-boot-overlay");
    var logEl = launchEl.querySelector(".vl-animate-code-block__launch-log");
    var bootBtn = launchEl.querySelector(".vl-boot-start-btn");
    var pixelFill = launchEl.querySelector(".vl-boot-pixel-fill");
    if (overlay) overlay.removeAttribute("hidden");
    if (logEl) logEl.innerHTML = "";
    if (bootBtn) {
      bootBtn.hidden = true;
      bootBtn.onclick = null;
    }
    if (pixelFill) {
      pixelFill.classList.remove("vl-boot-pixel-fill--animate");
      pixelFill.style.animation = "none";
      pixelFill.style.width = "0%";
      void pixelFill.offsetWidth;
      pixelFill.style.removeProperty("animation");
    }
  }

  function setLaunchMain(stageEl, reducedMotionBoot, session) {
    stageEl.innerHTML = "";
    var undo = mountMiniFlappy(
      stageEl,
      reducedMotionBoot,
      session.toolbarGamesSlot,
    );
    session.gameDestroy = undo;
  }

  function runHomeBootSequence(
    root,
    preEl,
    codeEl,
    launchEl,
    logEl,
    mainEl,
    reducedMotion,
    session,
  ) {
    mainEl.innerHTML = "";
    session.clearBootTimeouts();

    var bootBtn = launchEl.querySelector(".vl-boot-start-btn");
    var bootOverlay = launchEl.querySelector(".vl-launch-boot-overlay");
    var pixelFill = launchEl.querySelector(".vl-boot-pixel-fill");

    if (!bootBtn || !bootOverlay || !pixelFill || !logEl) {
      setLaunchMain(mainEl, reducedMotion, session);
      scheduleHomeSlideLoop(root, preEl, codeEl, launchEl, session);
      return;
    }

    logEl.innerHTML = "";
    bootBtn.hidden = true;
    bootBtn.onclick = null;
    pixelFill.classList.remove("vl-boot-pixel-fill--animate");
    pixelFill.style.width = "0%";

    bootOverlay.removeAttribute("hidden");

    var stepsBoot = [
      "[boot] self-test......... OK",
      "[boot] loading runtime modules",
      "[boot] handoff to foreground",
      "program starting",
      "[boot] floppy ball ready",
    ];

    function wait(ms, fn) {
      var id = window.setTimeout(function () {
        var idx = session.bootTimeouts.indexOf(id);
        if (idx !== -1) session.bootTimeouts.splice(idx, 1);
        fn();
      }, ms);
      session.bootTimeouts.push(id);
    }

    function finishBootAndMount() {
      if (session.aborting) return;
      logEl.innerHTML = "";
      bootBtn.hidden = true;
      bootBtn.onclick = null;
      bootOverlay.setAttribute("hidden", "");
      setLaunchMain(mainEl, reducedMotion, session);
      scheduleHomeSlideLoop(root, preEl, codeEl, launchEl, session);
    }

    function onStartClick() {
      finishBootAndMount();
    }

    function showStartButton() {
      if (session.aborting) return;
      bootBtn.hidden = false;
      bootBtn.onclick = onStartClick;
    }

    function appendLinesSequential(lines, ix) {
      if (session.aborting) return;
      if (ix >= lines.length) {
        showStartButton();
        return;
      }
      var delay = reducedMotion ? 0 : ix === 0 ? 100 : 280;
      wait(delay, function () {
        if (session.aborting) return;
        appendBootLine(logEl, lines[ix]);
        appendLinesSequential(lines, ix + 1);
      });
    }

    function afterPixelSweep() {
      if (session.aborting) return;
      if (reducedMotion) {
        stepsBoot.forEach(function (s) {
          appendBootLine(logEl, s);
        });
        showStartButton();
        return;
      }
      appendLinesSequential(stepsBoot, 0);
    }

    if (reducedMotion) {
      pixelFill.style.width = "100%";
      wait(140, afterPixelSweep);
      return;
    }

    var pixelHandled = false;
    var fallbackTid = null;

    function finishPixel() {
      if (pixelHandled || session.aborting) return;
      pixelHandled = true;
      if (fallbackTid != null) {
        window.clearTimeout(fallbackTid);
        var fi = session.bootTimeouts.indexOf(fallbackTid);
        if (fi !== -1) session.bootTimeouts.splice(fi, 1);
      }
      afterPixelSweep();
    }

    fallbackTid = window.setTimeout(finishPixel, 2000);
    session.bootTimeouts.push(fallbackTid);

    pixelFill.addEventListener(
      "animationend",
      function () {
        finishPixel();
      },
      { once: true },
    );
    window.requestAnimationFrame(function () {
      if (session.aborting) return;
      pixelFill.classList.add("vl-boot-pixel-fill--animate");
    });
  }

  function stopSessionTimers(session) {
    session.aborting = true;
    if (session.loopAdvanceTimer != null) {
      window.clearTimeout(session.loopAdvanceTimer);
      session.loopAdvanceTimer = null;
    }
    session.clearBootTimeouts();
    clearHomeTypingPump(session);
    if (typeof session.gameDestroy === "function") {
      session.gameDestroy();
    }
    session.gameDestroy = null;
    session.toolbarGamesSlot = null;
  }

  function restartHomeDemoFromCode(root, preEl, codeEl, launchEl, session) {
    if (session.loopAdvanceTimer != null) {
      window.clearTimeout(session.loopAdvanceTimer);
      session.loopAdvanceTimer = null;
    }
    if (typeof session.gameDestroy === "function") {
      session.gameDestroy();
      session.gameDestroy = null;
    }
    codeEl.innerHTML = "";
    root.setAttribute("data-done", "false");
    root.setAttribute("data-vl-phase", "code");

    resetBootOverlayVisuals(launchEl);
    var mainClear = launchEl.querySelector(".vl-animate-code-block__launch-main");
    if (mainClear) mainClear.innerHTML = "";

    preEl.removeAttribute("hidden");
    launchEl.setAttribute("hidden", "");

    session.aborting = false;
    runHomeCodeTyping(root, preEl, codeEl, launchEl, session);
  }

  function runHomeCodeTyping(root, preEl, codeEl, launchEl, session) {
    var reducedMotionPref = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    applyHomeHeroHeadline(session.slideIndex);

    root.setAttribute("data-done", "false");
    root.setAttribute("data-vl-phase", "code");

    function armMorphAfterTyping() {
      var pauseMs = reducedMotionPref ? 0 : 450;
      var tid = window.setTimeout(function () {
        var ix = session.bootTimeouts.indexOf(tid);
        if (ix !== -1) session.bootTimeouts.splice(ix, 1);
        if (session.aborting) return;
        morphToLaunch(
          root,
          preEl,
          codeEl,
          launchEl,
          reducedMotionPref,
          session,
        );
      }, pauseMs);
      session.bootTimeouts.push(tid);
    }

    function beginVoltimicroPhase() {
      if (session.aborting) return;
      var launchSnippet = homeSlideCode(session.slideIndex);
      driveHomeCodeTyping(
        session,
        codeEl,
        launchSnippet,
        reducedMotionPref,
        function () {
          if (session.aborting) return;
          armMorphAfterTyping();
        },
      );
    }

    preEl.removeAttribute("hidden");
    launchEl.setAttribute("hidden", "");

    beginVoltimicroPhase();
  }

  function morphToLaunch(
    root,
    preEl,
    codeEl,
    launchEl,
    reducedMotion,
    session,
  ) {
    var launchSnippet = homeSlideCode(session.slideIndex);
    codeEl.innerHTML = colorizeHomeCode(launchSnippet);
    root.setAttribute("data-done", "true");
    root.setAttribute("data-vl-phase", "launch");

    preEl.setAttribute("hidden", "");
    launchEl.removeAttribute("hidden");

    var logEl = launchEl.querySelector(".vl-animate-code-block__launch-log");
    var mainEl = launchEl.querySelector(".vl-animate-code-block__launch-main");

    if (!logEl || !mainEl) return;

    if (typeof session.gameDestroy === "function") {
      session.gameDestroy();
      session.gameDestroy = null;
    }

    var toolbarParts = populateLaunchToolbar(
      launchEl,
      homeSlideMeta(session.slideIndex).launchSubtitle,
      function () {
        stopSessionTimers(session);
        restartHomeDemoFromCode(root, preEl, codeEl, launchEl, session);
      },
    );
    session.toolbarGamesSlot =
      toolbarParts && toolbarParts.gamesSlot ? toolbarParts.gamesSlot : null;

    populateLaunchBottomChrome(launchEl);

    window.requestAnimationFrame(function () {
      session.aborting = false;
      runHomeBootSequence(
        root,
        preEl,
        codeEl,
        launchEl,
        logEl,
        mainEl,
        reducedMotion,
        session,
      );
    });
  }

  function initHomeBootBlock(root, blockIndex) {
    var codeEl = root.querySelector("[data-vl-animate-code]");
    var preEl = root.querySelector(".vl-animate-code-block__pre");
    var launchEl = root.querySelector(".vl-animate-code-block__launch");
    if (!codeEl || !preEl || !launchEl) {
      return;
    }

    var session = {
      aborting: false,
      slideIndex: 0,
      loopAdvanceTimer: null,
      typingRaf: null,
      typingTimer: null,
      bootTimeouts: [],
      gameDestroy: null,
      toolbarGamesSlot: null,
      clearBootTimeouts: function () {
        this.bootTimeouts.forEach(function (id) {
          clearTimeout(id);
        });
        this.bootTimeouts = [];
      },
    };

    var baseDelay =
      typeof blockIndex === "number"
        ? 350 + blockIndex * ABOUT_STAGGER_MS
        : 350;

    window.setTimeout(function () {
      runHomeCodeTyping(root, preEl, codeEl, launchEl, session);
    }, baseDelay);
  }

  document
    .querySelectorAll("[data-vl-animate-code-block]")
    .forEach(function (root, i) {
      if (root.hasAttribute("data-vl-home-boot-demo")) {
        initHomeBootBlock(root, i);
      } else {
        initAboutBlock(root, i);
      }
    });
})();
