/**
 * Lightweight pointer tilt (perspective rotate) on mission ship slider & portfolio thumbnails.
 * Skipped when prefers-reduced-motion or coarse pointer / touch-first.
 */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    if (
      window.matchMedia &&
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    var maxDeg = 7;

    function bind(el) {
      if (!el || el.getAttribute("data-vl-hover-tilt") === "bound") return;
      el.setAttribute("data-vl-hover-tilt", "bound");
      el.style.transformStyle = "preserve-3d";
      el.style.transition = "transform 0.18s ease-out";

      function reset() {
        el.style.transform = "";
      }

      function onMove(e) {
        var rect = el.getBoundingClientRect();
        if (rect.width < 24 || rect.height < 24) return;
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        var rx = -py * 2 * maxDeg;
        var ry = px * 2 * maxDeg;
        el.style.transform =
          "perspective(960px) rotateX(" +
          rx.toFixed(2) +
          "deg) rotateY(" +
          ry.toFixed(2) +
          "deg)";
      }

      el.addEventListener("pointerenter", reset);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", reset);
      el.addEventListener("pointercancel", reset);
    }

    document.querySelectorAll(".vl-ship-slider").forEach(bind);
    document
      .querySelectorAll(".post-type-archive-work .work__thumbnail")
      .forEach(bind);
  });
})();
