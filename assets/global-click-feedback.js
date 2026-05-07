/**
 * Static site port of Animate UI `<Click>` (ring variant by default).
 * Fires expanding feedback only on non-interactive hits (plain text / empty chrome).
 *
 * Docs: https://animate-ui.com/docs/primitives/effects/click
 */
(function () {
  if (!document.documentElement.addEventListener) return;

  var INTERACTIVE =
    [
      'a[href]',
      'area[href]',
      'audio[controls]',
      'button:not([disabled])',
      'input:not([disabled]):not([type="hidden"])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      'summary',
      'label',
      'canvas',
      'video',
      'iframe',
      '[role="button"]',
      '[role="link"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="tab"]',
      '[role="switch"]',
      '[role="slider"]',
      '[role="spinbutton"]',
      '[role="option"]',
      '[role="menuitem"]',
      '[role="combobox"]',
      '[role="menuitemcheckbox"]',
      '[role="menuitemradio"]',
      '[role="textbox"]',
      '[contenteditable="true"]',
      '[onclick]',
    ].join(',');

  var mq =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
  var REDUCED = mq && mq.matches;

  /** Opt out (or opt children out) via data-vl-click-effect="off" on an ancestor. */
  function isSuppressedAncestors(el) {
    try {
      return !!(el.closest && el.closest("[data-vl-click-effect=\"off\"]"));
    } catch (e) {
      return false;
    }
  }

  /** Click landed on-or inside-an intentional control or media surface. */
  function hitInteractiveSubtree(el) {
    if (!el || el.nodeType !== 1) return false;
    try {
      if (el.closest(INTERACTIVE)) return true;
      if (el.closest(".vl-home-product-card")) return true;
      if (
        typeof el.closest === "function" &&
        el.closest("[data-vl-animate-code-block]")
      )
        return true;
    } catch (e) {}
    var t = el.getAttribute && el.getAttribute("tabindex");
    if (t !== null && t !== "") {
      var n = parseInt(String(t).trim(), 10);
      if (!isNaN(n) && n >= 0) return true;
    }
    return false;
  }

  function spawnRing(clientX, clientY) {
    if (REDUCED) return;

    var ring = document.createElement("span");
    ring.className = "vl-global-click-feedback";
    ring.setAttribute("aria-hidden", "true");
    ring.style.left = Math.round(clientX) + "px";
    ring.style.top = Math.round(clientY) + "px";

    document.body.appendChild(ring);

    var remove = function () {
      ring.removeEventListener("transitionend", remove);
      if (ring.parentNode) ring.parentNode.removeChild(ring);
    };

    ring.addEventListener("transitionend", remove, false);
    window.setTimeout(remove, 900);
    window.requestAnimationFrame(function () {
      ring.classList.add("vl-global-click-feedback--pulse");
    });
  }

  document.documentElement.addEventListener(
    "pointerdown",
    function (ev) {
      if (ev.defaultPrevented) return;
      if (typeof ev.button === "number" && ev.button !== 0 && ev.pointerType !== "touch")
        return;
      if (ev.pointerType === "touch" && ev.isPrimary === false) return;
      var t = ev.target;
      if (!t || t.nodeType !== 1) return;
      if (isSuppressedAncestors(t)) return;
      if (hitInteractiveSubtree(t)) return;
      spawnRing(ev.clientX, ev.clientY);
    },
    { passive: true, capture: false },
  );
})();
