/**
 * Home sectors list: accent follows page scroll (one item at a time).
 * Theme CSS: .section-sectors__item--active + .section-sectors__list:not(.section-sectors__list--over)
 * Pointer or focus inside the list adds .section-sectors__list--over so hover/focus overrides scroll.
 */
document.addEventListener("DOMContentLoaded", function () {
  if (!document.body.classList.contains("home")) return;

  var sectionRoot = document.querySelector(".section-works-homepage");
  var list = document.querySelector(".section-works-homepage .section-sectors .section-sectors__list");
  if (!list) return;

  var items = Array.from(list.querySelectorAll(":scope > .section-sectors__item"));
  if (items.length < 2) return;

  function sectorScrollProgress(y) {
    if (!sectionRoot) {
      var docEl = document.documentElement;
      var maxY = Math.max(1, docEl.scrollHeight - window.innerHeight);
      return Math.min(1, Math.max(0, y / maxY));
    }

    var vh = window.innerHeight || 1;
    var rect = sectionRoot.getBoundingClientRect();
    var top = rect.top + y;
    var bottom = top + rect.height;

    // Map the full accent sweep to "this section crosses the viewport" (not entire page scroll).
    // t=0: section top meets bottom of viewport; t=1: section has fully scrolled past (bottom at viewport top).
    var startScroll = top - vh;
    var endScroll = bottom;
    var span = Math.max(1, endScroll - startScroll);
    var t = (y - startScroll) / span;
    return Math.min(1, Math.max(0, t));
  }

  function activeIndexFromScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    var t = sectorScrollProgress(y);
    return Math.min(items.length - 1, Math.floor(t * items.length));
  }

  function applyScrollActive() {
    var idx = activeIndexFromScroll();
    items.forEach(function (li, i) {
      li.classList.toggle("section-sectors__item--active", i === idx);
    });
  }

  var scrollScheduled = false;
  function onScrollOrResize() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(function () {
      scrollScheduled = false;
      applyScrollActive();
    });
  }

  list.addEventListener(
    "pointerenter",
    function () {
      list.classList.add("section-sectors__list--over");
    },
    { passive: true }
  );

  list.addEventListener(
    "pointerleave",
    function () {
      list.classList.remove("section-sectors__list--over");
    },
    { passive: true }
  );

  list.addEventListener("focusin", function () {
    list.classList.add("section-sectors__list--over");
  });

  list.addEventListener("focusout", function (e) {
    if (!list.contains(e.relatedTarget)) {
      list.classList.remove("section-sectors__list--over");
    }
  });

  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize, { passive: true });
  applyScrollActive();
});
