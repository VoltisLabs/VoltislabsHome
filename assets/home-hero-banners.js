document.addEventListener("DOMContentLoaded", function () {
  var root = document.getElementById("vl-home-main-slider");
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll(".vl-home-main-slider__slide"));
  if (slides.length < 2) return;

  var dotsRoot = root.querySelector(".vl-home-main-slider__dots");
  if (!dotsRoot) return;

  var autoMs = 3800;
  var index = Math.max(0, slides.findIndex(function (s) { return s.classList.contains("is-active"); }));
  var timer = null;
  var dots = [];

  // Preload declared slides to avoid first-cycle flash.
  slides.forEach(function (slide) {
    var src = slide.getAttribute("src");
    if (!src) return;
    var img = new Image();
    img.src = src;
  });

  function setActiveDot(activeIndex) {
    dots.forEach(function (dot, i) {
      var on = i === activeIndex;
      dot.classList.toggle("is-active", on);
      dot.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function render(nextIndex) {
    index = ((nextIndex % slides.length) + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
      slide.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
    setActiveDot(index);
  }

  function go(dir) {
    render(index + dir);
  }

  function restartTimer() {
    if (timer) window.clearInterval(timer);
    timer = window.setInterval(function () {
      go(1);
    }, autoMs);
  }

  slides.forEach(function (_, i) {
    var dot = document.createElement("button");
    dot.type = "button";
    dot.className = "vl-home-main-slider__dot";
    dot.setAttribute("aria-label", "Show banner " + (i + 1));
    dot.setAttribute("aria-pressed", "false");
    dot.addEventListener("click", function () {
      render(i);
      restartTimer();
    });
    dotsRoot.appendChild(dot);
    dots.push(dot);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) return;
    restartTimer();
  });
  window.addEventListener("focus", restartTimer);

  render(index);
  restartTimer();
});
