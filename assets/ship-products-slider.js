document.addEventListener("DOMContentLoaded", function () {
  var roots = Array.prototype.slice.call(document.querySelectorAll(".vl-ship-slider"));
  if (!roots.length) return;

  roots.forEach(function (root) {
    bindShipSlider(root);
  });

  function bindShipSlider(root) {
    var slides = Array.prototype.slice.call(
      root.querySelectorAll(".vl-ship-slider__slide"),
    );
    if (!slides.length) return;

    if (slides.length < 2) {
      slides[0].style.transform = "translate3d(0,0,0)";
      slides[0].style.opacity = "1";
      slides[0].style.visibility = "visible";
      slides[0].classList.add("is-active");
      slides[0].setAttribute("aria-hidden", "false");
      return;
    }

    var i = 0;
    var intervalMs = 4800;
    var dur = 620;
    var eased = "cubic-bezier(.22,1,.36,1)";
    var reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var paused = false;
    var busy = false;

    var dirs = [
      { enter: [-100, 0], exit: [100, 0] },
      { enter: [100, 0], exit: [-100, 0] },
      { enter: [0, -100], exit: [0, 100] },
      { enter: [0, 100], exit: [0, -100] },
    ];

    function trans(on) {
      return on ? "transform " + dur + "ms " + eased : "none";
    }

    function pickDir() {
      return dirs[Math.floor(Math.random() * dirs.length)];
    }

    function init() {
      slides.forEach(function (s, j) {
        var on = j === 0;
        s.style.transition = "none";
        s.style.transform = on ? "translate3d(0,0,0)" : "translate3d(110%,0,0)";
        s.style.opacity = on ? "1" : "0";
        s.style.visibility = on ? "visible" : "hidden";
        s.style.zIndex = on ? "2" : "0";
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-hidden", on ? "false" : "true");
      });
      void root.offsetWidth;
      slides.forEach(function (s) {
        if (!reduced) s.style.transition = trans(true);
      });
    }

    function advance() {
      if (busy) return;
      busy = true;
      var oldS = slides[i];
      var next = (i + 1) % slides.length;
      var newS = slides[next];
      var d = pickDir();

      newS.style.transition = "none";
      newS.style.transform = "translate3d(" + d.enter[0] + "%," + d.enter[1] + "%,0)";
      newS.style.opacity = "1";
      newS.style.visibility = "visible";
      newS.style.zIndex = "3";

      oldS.style.zIndex = "2";

      void root.offsetWidth;

      newS.style.transition = trans(true);
      oldS.style.transition = trans(true);

      newS.style.transform = "translate3d(0,0,0)";
      oldS.style.transform = "translate3d(" + d.exit[0] + "%," + d.exit[1] + "%,0)";

      window.setTimeout(function () {
        oldS.style.transition = "none";
        oldS.style.opacity = "0";
        oldS.style.visibility = "hidden";
        oldS.style.zIndex = "0";
        oldS.classList.remove("is-active");
        oldS.setAttribute("aria-hidden", "true");

        newS.style.zIndex = "2";
        newS.classList.add("is-active");
        newS.setAttribute("aria-hidden", "false");

        window.setTimeout(function () {
          if (!reduced) {
            oldS.style.transition = trans(true);
            newS.style.transition = trans(true);
          }
        }, 20);

        i = next;
        busy = false;
      }, dur + 50);
    }

    root.addEventListener("mouseenter", function () {
      paused = true;
    });
    root.addEventListener("mouseleave", function () {
      paused = false;
    });

    init();

    if (reduced) return;

    window.setInterval(function () {
      if (!paused) advance();
    }, intervalMs);
  }
});
