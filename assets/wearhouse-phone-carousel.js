/**
 * Wearhouse hero phone carousel + Animate UI-style tilt on the handset block.
 *
 * Tilt primitive (defaults): https://animate-ui.com/docs/primitives/effects/tilt
 * Port: maxTilt 10°, parent perspective 800px, spring-ish easing via damped follow.
 */
document.addEventListener("DOMContentLoaded", function () {
  var carousels = Array.prototype.slice.call(
    document.querySelectorAll(".vl-wh-phone-carousel"),
  );
  if (!carousels.length) return;

  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var maxTilt = 10;

  /** Damped pointer-follow (similar role to Motion spring stiffness/damping). */
  function initTilt(link, viewport) {
    var targetRx = 0;
    var targetRy = 0;
    var rx = 0;
    var ry = 0;
    var rafId = null;
    var damping = 0.16;

    function setTransform() {
      viewport.style.transform =
        "rotateX(" + rx.toFixed(3) + "deg) rotateY(" + ry.toFixed(3) + "deg)";
    }

    function normFromPointer(clientX, clientY) {
      var r = viewport.getBoundingClientRect();
      if (!r.width || !r.height) return { nx: 0, ny: 0 };
      var nx = ((clientX - r.left) / r.width - 0.5) * 2;
      var ny = ((clientY - r.top) / r.height - 0.5) * 2;
      return {
        nx: Math.max(-1, Math.min(1, nx)),
        ny: Math.max(-1, Math.min(1, ny)),
      };
    }

    function tick() {
      rx += (targetRx - rx) * damping;
      ry += (targetRy - ry) * damping;
      setTransform();
      var errX = Math.abs(targetRx - rx);
      var errY = Math.abs(targetRy - ry);
      if (errX > 0.035 || errY > 0.035) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        rx = targetRx;
        ry = targetRy;
        setTransform();
        rafId = null;
      }
    }

    function schedule() {
      if (rafId == null) rafId = window.requestAnimationFrame(tick);
    }

    function onMove(ev) {
      var p = normFromPointer(ev.clientX, ev.clientY);
      targetRx = -p.ny * maxTilt;
      targetRy = p.nx * maxTilt;
      schedule();
    }

    function reset() {
      targetRx = 0;
      targetRy = 0;
      schedule();
    }

    link.addEventListener("pointermove", onMove, { passive: true });
    link.addEventListener("pointerleave", reset, false);
    link.addEventListener("pointercancel", reset, false);

    setTransform();
  }

  carousels.forEach(function (root) {
    var slides = Array.prototype.slice.call(
      root.querySelectorAll(".vl-wh-phone-carousel__slide"),
    );
    if (!slides.length) return;

    var link = root.querySelector(".vl-wh-phone-carousel__phone-link");
    var viewport = root.querySelector(".vl-wh-phone-carousel__viewport");

    if (!prefersReducedMotion && link && viewport)
      initTilt(link, viewport);

    var index = 0;
    var paused = false;
    var autoMs = 4500;

    function render() {
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });
    }

    function go(dir) {
      index = (index + dir + slides.length) % slides.length;
      render();
    }

    root.addEventListener("mouseenter", function () {
      paused = true;
    });
    root.addEventListener("mouseleave", function () {
      paused = false;
    });

    if (!prefersReducedMotion) {
      window.setInterval(function () {
        if (!paused) go(1);
      }, autoMs);
    }

    render();
  });
});
