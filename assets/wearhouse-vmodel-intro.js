/**
 * Wearhouse + VModel combined work row: default VModel copy beside the banner;
 * hovering the Wearhouse thumbnail shows Wearhouse preview; tabs / focus /
 * click switch panes. Leaving the tile resets to VModel.
 */
(function () {
  function setPane(work, pane) {
    var intro = work.querySelector(".vl-work-vmodel-intro");
    if (!intro) return;
    intro.dataset.introPane = pane;

    intro.querySelectorAll("[data-intro-tab]").forEach(function (btn) {
      var active = btn.getAttribute("data-intro-tab") === pane;
      btn.setAttribute("aria-selected", active ? "true" : "false");
      btn.classList.toggle("is-active", active);
    });

    intro.querySelectorAll(".vl-work-vmodel-intro__pane").forEach(function (el) {
      var active = el.getAttribute("data-intro-pane") === pane;
      el.classList.toggle("is-intro-active", active);
      el.setAttribute("aria-hidden", active ? "false" : "true");
    });
  }

  function bind(work) {
    var intro = work.querySelector(".vl-work-vmodel-intro");
    var thumb = work.querySelector(".work__thumbnail");
    if (!intro || !thumb) return;

    setPane(work, "vmodel");

    function onWearhouse() {
      setPane(work, "wearhouse");
    }

    thumb.addEventListener("mouseenter", onWearhouse);
    thumb.addEventListener("touchstart", onWearhouse, { passive: true });

    work.addEventListener("mouseleave", function (e) {
      var next = e.relatedTarget;
      if (next && work.contains(next)) return;
      setPane(work, "vmodel");
    });

    intro.querySelectorAll("[data-intro-tab]").forEach(function (btn) {
      var target = btn.getAttribute("data-intro-tab");
      if (!target) return;

      btn.addEventListener("mouseenter", function () {
        setPane(work, target);
      });
      btn.addEventListener("focus", function () {
        setPane(work, target);
      });
      btn.addEventListener("click", function () {
        setPane(work, target);
      });
    });
  }

  document
    .querySelectorAll(".work.work--wearhouse-vmodel-intro")
    .forEach(bind);
})();
