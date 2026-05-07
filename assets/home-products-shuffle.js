/**
 * Home-only (`#home-products`): spring cords + cursor repulsion, idle icon drift,
 * carousel shuffle reorder, and card drag physics.
 *
 * Detached from the products catalog (`products-spring-icons.js`), which scopes
 * `.vl-products-grid-wrap` on `page-id-products`.
 *
 * Tiles use full-bleed dark plates in SVG/PNG — see home-products-banner.css for framing.
 */
document.addEventListener("DOMContentLoaded", function () {
  var grid = document.querySelector("#home-products .vl-home-products-grid");
  if (!grid) return;

  var cards = Array.from(grid.children);
  if (cards.length < 2) return;

  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Stronger travel than legacy link-repulse (~17px) so the cord reads clearly. */
  var REPEL_RADIUS = 172;
  var REPEL_MAX = 36;
  var REPEL_EXP = 1.12;
  var SPRING_STIFF = 0.48;
  var SPRING_DAMP = 0.8;

  var dragState = {
    activeCard: null,
    pointerId: null,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
    currentX: 0,
    currentY: 0,
  };

  function ensureSpringDom(link) {
    if (link.querySelector(".vl-home-product-thumb-spring")) return null;
    var img = link.querySelector(".vl-home-product-card__icon");
    if (!img) return null;

    img.setAttribute("draggable", "false");

    var root = document.createElement("div");
    root.className = "vl-home-product-thumb-spring";
    root.setAttribute("aria-hidden", "true");

    var svgNs = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("class", "vl-home-product-thumb-spring__svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("focusable", "false");

    var line = document.createElementNS(svgNs, "line");
    line.setAttribute("class", "vl-home-product-thumb-spring__line");
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);

    var mass = document.createElement("div");
    mass.className = "vl-home-product-thumb-spring__mass";

    link.insertBefore(root, img);
    root.appendChild(svg);
    root.appendChild(mass);
    mass.appendChild(img);

    return {
      thumb: link,
      line: line,
      mass: mass,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      tx: 0,
      ty: 0,
    };
  }

  /** @type {Array<ReturnType<typeof ensureSpringDom> & NonNullable<unknown>>} */
  var springEntries = [];

  cards.forEach(function (card, idx) {
    card.style.order = String(idx);
    card.style.willChange = "transform";
    var link = card.querySelector(".vl-home-product-card__link");
    var img = card.querySelector(".vl-home-product-card__icon");

    var entry = !reduceMotion && link && img ? ensureSpringDom(link) : null;

    iconSetup(img);

    if (entry) springEntries.push(entry);
  });

  function iconSetup(icon) {
    if (!icon) return;
    if (!reduceMotion) {
      icon.classList.add("vl-home-icon-drift");
      icon.style.animationDuration = (5.5 + Math.random() * 3.5).toFixed(2) + "s";
      icon.style.animationDelay = (-Math.random() * 4).toFixed(2) + "s";
    }
    icon.style.opacity = "1";
    icon.style.visibility = "visible";
    icon.style.display = "block";
  }

  /** Set when spring hub initialises; called after drag so cords catch up fluidly */
  var resumeSpringAfterDrag = function () {};

  if (!reduceMotion && springEntries.length) {
    grid.classList.add("vl-home-products-grid--spring-icons");

    var hub = {
      active: false,
      px: 0,
      py: 0,
      raf: 0,
    };

    function repelTarget(px, py, thumb) {
      var br = thumb.getBoundingClientRect();
      var cx = br.left + br.width * 0.5;
      var cy = br.top + br.height * 0.5;
      var dx = cx - px;
      var dy = cy - py;
      var dist = Math.hypot(dx, dy);
      var eps = 0.5;
      if (dist <= eps || dist >= REPEL_RADIUS) return { x: 0, y: 0 };

      var inv = REPEL_RADIUS - dist;
      var falloff = Math.pow(inv / REPEL_RADIUS, REPEL_EXP);
      var nx = dx / dist;
      var ny = dy / dist;
      return {
        x: nx * REPEL_MAX * falloff,
        y: ny * REPEL_MAX * falloff,
      };
    }

    function tickEntry(entry, px, py) {
      var away = px < -90000 || py < -90000;
      var t = away
        ? { x: 0, y: 0 }
        : repelTarget(px, py, entry.thumb);

      entry.tx = t.x;
      entry.ty = t.y;

      entry.vx += (entry.tx - entry.x) * SPRING_STIFF;
      entry.vy += (entry.ty - entry.y) * SPRING_STIFF;
      entry.vx *= SPRING_DAMP;
      entry.vy *= SPRING_DAMP;
      entry.x += entry.vx;
      entry.y += entry.vy;

      var lim = REPEL_MAX * 1.2;
      entry.x = Math.max(-lim, Math.min(lim, entry.x));
      entry.y = Math.max(-lim, Math.min(lim, entry.y));

      if (
        Math.abs(entry.tx - entry.x) < 0.05 &&
        Math.abs(entry.ty - entry.y) < 0.05 &&
        Math.abs(entry.vx) < 0.03 &&
        Math.abs(entry.vy) < 0.03 &&
        Math.abs(entry.x) < 0.08 &&
        Math.abs(entry.y) < 0.08
      ) {
        entry.x = entry.y = entry.vx = entry.vy = 0;
      }

      entry.mass.style.transform =
        "translate3d(calc(-50% + " +
        entry.x.toFixed(2) +
        "px), calc(-50% + " +
        entry.y.toFixed(2) +
        "px), 0)";

      var w = entry.thumb.clientWidth || 1;
      var h = entry.thumb.clientHeight || 1;
      var ox = entry.x + w * 0.5;
      var oy = entry.y + h * 0.5;
      entry.line.setAttribute("x1", String(w * 0.5));
      entry.line.setAttribute("y1", String(h * 0.5));
      entry.line.setAttribute("x2", String(Math.max(0, Math.min(w, ox))));
      entry.line.setAttribute("y2", String(Math.max(0, Math.min(h, oy))));
    }

    function run() {
      hub.raf = 0;
      var px = hub.active ? hub.px : -99999;
      var py = hub.active ? hub.py : -99999;

      var i;
      if (dragState.activeCard) {
        px = -99999;
        py = -99999;
      }

      for (i = 0; i < springEntries.length; i++) {
        tickEntry(springEntries[i], px, py);
      }

      var more = false;
      for (i = 0; i < springEntries.length; i++) {
        var e = springEntries[i];
        if (
          Math.abs(e.x) > 0.1 ||
          Math.abs(e.y) > 0.1 ||
          Math.abs(e.vx) > 0.03 ||
          Math.abs(e.vy) > 0.03
        ) {
          more = true;
          break;
        }
      }

      if (hub.active || more) {
        if (!hub.raf) hub.raf = window.requestAnimationFrame(run);
      }
    }

    function requestSpringTick() {
      if (!hub.raf) hub.raf = window.requestAnimationFrame(run);
    }

    grid.addEventListener(
      "pointerenter",
      function (e) {
        hub.active = true;
        hub.px = e.clientX;
        hub.py = e.clientY;
        requestSpringTick();
      },
      { passive: true },
    );

    grid.addEventListener(
      "pointermove",
      function (e) {
        if (!hub.active) return;
        hub.px = e.clientX;
        hub.py = e.clientY;
        requestSpringTick();
      },
      { passive: true },
    );

    grid.addEventListener(
      "pointerleave",
      function () {
        hub.active = false;
        hub.px = -99999;
        hub.py = -99999;
        requestSpringTick();
      },
      { passive: true },
    );

    hub.active = false;
    hub.px = -99999;
    hub.py = -99999;
    requestSpringTick();

    resumeSpringAfterDrag = requestSpringTick;
  }

  function resetSpringOffsets() {
    if (reduceMotion || !springEntries.length) return;
    springEntries.forEach(function (entry) {
      entry.x =
        entry.y =
        entry.vx =
        entry.vy =
        entry.tx =
        entry.ty =
          0;
      entry.mass.style.transform =
        "translate3d(-50%, -50%, 0)";
      var w = entry.thumb.clientWidth || 1;
      var h = entry.thumb.clientHeight || 1;
      entry.line.setAttribute("x1", String(w * 0.5));
      entry.line.setAttribute("y1", String(h * 0.5));
      entry.line.setAttribute("x2", String(w * 0.5));
      entry.line.setAttribute("y2", String(h * 0.5));
    });
  }

  function getTranslateXY(card) {
    var tr = card.style.transform || "";
    var match = tr.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
    if (!match) return { x: 0, y: 0 };
    return { x: Number(match[1]) || 0, y: Number(match[2]) || 0 };
  }

  function onPointerMove(event) {
    if (!dragState.activeCard || event.pointerId !== dragState.pointerId) return;

    dragState.currentX = dragState.baseX + (event.clientX - dragState.startX);
    dragState.currentY = dragState.baseY + (event.clientY - dragState.startY);

    dragState.activeCard.style.transition = "none";
    dragState.activeCard.style.transform =
      "translate(" + dragState.currentX + "px, " + dragState.currentY + "px)";
  }

  function endDrag(event) {
    if (!dragState.activeCard || event.pointerId !== dragState.pointerId) return;

    var card = dragState.activeCard;
    card.classList.remove("is-dragging");
    card.style.transition = "transform 520ms cubic-bezier(.2, .85, .25, 1)";
    card.style.transform = "translate(0, 0)";

    try {
      card.releasePointerCapture(dragState.pointerId);
    } catch (e) {}

    dragState.activeCard = null;
    dragState.pointerId = null;

    resumeSpringAfterDrag();
  }

  cards.forEach(function (card) {
    card.addEventListener("pointerdown", function (event) {
      if (dragState.activeCard) return;
      resetSpringOffsets();
      dragState.activeCard = card;
      dragState.pointerId = event.pointerId;
      dragState.startX = event.clientX;
      dragState.startY = event.clientY;

      var base = getTranslateXY(card);
      dragState.baseX = base.x;
      dragState.baseY = base.y;
      dragState.currentX = base.x;
      dragState.currentY = base.y;

      card.classList.add("is-dragging");
      card.style.willChange = "transform";
      try {
        card.setPointerCapture(event.pointerId);
      } catch (e) {}
      event.preventDefault();
    });
  });

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", endDrag, { passive: true });
  window.addEventListener("pointercancel", endDrag, { passive: true });

  function shuffleOrders() {
    var firstRects = new Map();
    cards.forEach(function (card) {
      firstRects.set(card, card.getBoundingClientRect());
    });

    var order = cards.map(function (_, i) {
      return i;
    });
    for (var ri = order.length - 1; ri > 0; ri--) {
      var j = Math.floor(Math.random() * (ri + 1));
      var tmp = order[ri];
      order[ri] = order[j];
      order[j] = tmp;
    }

    cards.forEach(function (card, idx) {
      card.style.order = String(order[idx]);
    });

    window.requestAnimationFrame(function () {
      cards.forEach(function (card) {
        var last = card.getBoundingClientRect();
        var fr = firstRects.get(card);
        if (!fr) return;

        var dx = fr.left - last.left;
        var dy = fr.top - last.top;

        card.style.transition = "none";
        card.style.transform = "translate(" + dx + "px, " + dy + "px)";
      });

      window.requestAnimationFrame(function () {
        cards.forEach(function (card) {
          if (dragState.activeCard === card) return;
          card.style.transition =
            "transform 1900ms cubic-bezier(.22, 1, .36, 1)";
          card.style.transform = "translate(0, 0)";
        });
      });
    });
  }

  window.setTimeout(shuffleOrders, 250);
  window.setInterval(shuffleOrders, 2200);

  cards.forEach(function (card) {
    card.style.opacity = "1";
    card.style.visibility = "visible";
  });
});
