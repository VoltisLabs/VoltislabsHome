/**
 * Products catalog: spring-damped hover on icons (parity with homepage cursor repulsion,
 * inspired by Animate UI Spring — spring mass + SVG cord behind the glyph).
 *
 * Not React: duplicates the UX of SpringProvider + Spring + SpringElement in plain DOM.
 */
(function () {
  if (!document.body || !document.body.classList.contains("page-id-products")) {
    return;
  }

  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** Smaller catalog travel than a broad marketing grid (denser layouts). */
  var REPEL_RADIUS = 118;
  var REPEL_MAX = 13;
  var REPEL_EXP = 1.18;
  var SPRING_STIFF = 0.38;
  var SPRING_DAMP = 0.84;

  function ensureSpringDom(thumb) {
    if (thumb.querySelector(".vl-product-thumb-spring")) return null;
    var img = thumb.querySelector(".vl-product-card__thumb-img");
    if (!img) return null;

    img.setAttribute("draggable", "false");

    var root = document.createElement("div");
    root.className = "vl-product-thumb-spring";
    root.setAttribute("aria-hidden", "true");

    var svgNs = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("class", "vl-product-thumb-spring__svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("focusable", "false");
    var line = document.createElementNS(svgNs, "line");
    line.setAttribute("class", "vl-product-thumb-spring__line");
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);

    var mass = document.createElement("div");
    mass.className = "vl-product-thumb-spring__mass";

    thumb.insertBefore(root, img);
    root.appendChild(svg);
    root.appendChild(mass);
    mass.appendChild(img);

    return { root: root, line: line, mass: mass, thumb: thumb };
  }

  function repelTarget(px, py, thumb) {
    var br = thumb.getBoundingClientRect();
    var cx = br.left + br.width * 0.5;
    var cy = br.top + br.height * 0.5;
    var dx = cx - px;
    var dy = cy - py;
    var dist = Math.hypot(dx, dy);
    var eps = 0.5;
    if (dist <= eps || dist >= REPEL_RADIUS) {
      return { x: 0, y: 0 };
    }
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
    var t = repelTarget(px, py, entry.thumb);
    entry.tx = t.x;
    entry.ty = t.y;

    entry.vx += (entry.tx - entry.x) * SPRING_STIFF;
    entry.vy += (entry.ty - entry.y) * SPRING_STIFF;
    entry.vx *= SPRING_DAMP;
    entry.vy *= SPRING_DAMP;
    entry.x += entry.vx;
    entry.y += entry.vy;

    var lim = REPEL_MAX * 1.08;
    entry.x = Math.max(-lim, Math.min(lim, entry.x));
    entry.y = Math.max(-lim, Math.min(lim, entry.y));

    if (
      Math.abs(entry.tx - entry.x) < 0.04 &&
      Math.abs(entry.ty - entry.y) < 0.04 &&
      Math.abs(entry.vx) < 0.02 &&
      Math.abs(entry.vy) < 0.02 &&
      Math.abs(entry.x) < 0.06 &&
      Math.abs(entry.y) < 0.06
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

  document.addEventListener("DOMContentLoaded", function () {
    if (reduceMotion) return;

    var grids = document.querySelectorAll(".vl-products-grid-wrap .vl-products-grid");
    if (!grids.length) return;

    /** @type {Array<{ thumb: HTMLElement, mass: HTMLElement, line: SVGLineElement, x: number, y: number, vx: number, vy: number, tx: number, ty: number }>} */
    var entries = [];

    grids.forEach(function (grid) {
      grid.querySelectorAll(".vl-product-card").forEach(function (card) {
        var thumb = card.querySelector(".vl-product-card__thumb");
        if (!thumb) return;
        var dom = ensureSpringDom(thumb);
        if (!dom) return;
        entries.push({
          thumb: thumb,
          mass: dom.mass,
          line: dom.line,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          tx: 0,
          ty: 0,
        });
      });
    });

    if (!entries.length) return;

    /** @type {{ active: boolean, px: number, py: number, raf: number }} */
    var hub = {
      active: false,
      px: 0,
      py: 0,
      raf: 0,
    };

    function run() {
      hub.raf = 0;
      var px = hub.active ? hub.px : -99999;
      var py = hub.active ? hub.py : -99999;
      for (var i = 0; i < entries.length; i++) {
        tickEntry(entries[i], px, py);
      }
      var more = false;
      for (var j = 0; j < entries.length; j++) {
        var e = entries[j];
        if (
          Math.abs(e.x) > 0.08 ||
          Math.abs(e.y) > 0.08 ||
          Math.abs(e.vx) > 0.02 ||
          Math.abs(e.vy) > 0.02
        ) {
          more = true;
          break;
        }
      }
      if (hub.active || more) {
        if (!hub.raf) hub.raf = window.requestAnimationFrame(run);
      }
    }

    function requestTick() {
      if (!hub.raf) hub.raf = window.requestAnimationFrame(run);
    }

    grids.forEach(function (grid) {
      grid.classList.add("vl-products-grid--spring-icons");
      grid.addEventListener(
        "pointerenter",
        function (e) {
          hub.active = true;
          hub.px = e.clientX;
          hub.py = e.clientY;
          requestTick();
        },
        { passive: true },
      );
      grid.addEventListener(
        "pointermove",
        function (e) {
          if (!hub.active) return;
          hub.px = e.clientX;
          hub.py = e.clientY;
          requestTick();
        },
        { passive: true },
      );
      grid.addEventListener(
        "pointerleave",
        function () {
          hub.active = false;
          hub.px = -99999;
          hub.py = -99999;
          requestTick();
        },
        { passive: true },
      );
    });

    /** Let spring settle after pointer leaves (targets go to zero). */
    hub.active = false;
    hub.px = -99999;
    hub.py = -99999;
    requestTick();
  });
})();
