/**
 * "White scroll" zone: optionally switch the viewport to white background + dark text
 * while scrolled away from hero/footer (home keeps extra cues for flagship sections).
 *
 * Toggle is duplicated in the header markup on the homepage; other pages get the same
 * controls injected here so localStorage preference applies site-wide.
 *
 * Preference persists site-wide. Articles (blog listing and posts) omit this control
 * entirely so the navbar stays clean there; preference still applies elsewhere.
 */
(function () {
  var STORAGE = "vlWhiteScrollMiddle";
  var LEGACY = "vlScrollEffectsEnabled";

  function migrate() {
    try {
      if (
        localStorage.getItem(STORAGE) === null &&
        localStorage.getItem(LEGACY) !== null
      ) {
        localStorage.setItem(STORAGE, localStorage.getItem(LEGACY));
      }
    } catch (eIgnore) {}
  }

  function buildToggleButton(isMobile) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = isMobile
      ? "vl-scroll-effects-toggle-mobile"
      : "vl-scroll-effects-toggle";
    btn.className = isMobile
      ? "vl-scroll-toggle vl-scroll-toggle--mobile"
      : "vl-scroll-toggle";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute(
      "aria-label",
      "White scroll background while scrolling",
    );
    var icon = document.createElement("span");
    icon.className = "vl-scroll-toggle__icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "\u25D0";
    var label = document.createElement("span");
    label.className = "vl-scroll-toggle__label";
    label.textContent = "White scroll";
    btn.appendChild(icon);
    btn.appendChild(label);
    return btn;
  }

  /**
   * Mirrors `home.html`: desktop toggle after main nav; mobile toggle after mobile nav.
   */
  function ensureScrollToggleButtons() {
    var container = document.querySelector(".header .header__container");
    if (
      container &&
      !document.getElementById("vl-scroll-effects-toggle")
    ) {
      container.appendChild(buildToggleButton(false));
    }
    var mobilePanel = document.querySelector(".header__navigation-mobile");
    if (
      mobilePanel &&
      !document.getElementById("vl-scroll-effects-toggle-mobile")
    ) {
      mobilePanel.appendChild(buildToggleButton(true));
    }
  }

  /** Default ON unless user turned it off explicitly. */
  function readEnabled() {
    migrate();
    try {
      var v = localStorage.getItem(STORAGE);
      if (v === "0") return false;
      if (v === "1") return true;
    } catch (eIgnore) {}
    return true;
  }

  function writeEnabled(on) {
    try {
      localStorage.setItem(STORAGE, on ? "1" : "0");
    } catch (eIgnore) {}
  }

  document.addEventListener("DOMContentLoaded", function () {
    var body = document.body;
    if (!body) return;

    var noToggleArticles =
      body.classList.contains("vl-blog-page") ||
      body.classList.contains("vl-article-post");

    if (!noToggleArticles) {
      ensureScrollToggleButtons();
    } else {
      body.classList.remove("vl-theme-middle");
      return;
    }

    var footer = document.querySelector("footer");
    var homeProducts = document.getElementById("home-products");
    var isHome = body.classList.contains("home");

    migrate();
    var enabled = readEnabled();
    var ticking = false;

    var desktopBtn = document.getElementById("vl-scroll-effects-toggle");
    var mobileBtn = document.getElementById("vl-scroll-effects-toggle-mobile");

    function syncScrollEffectBodyClass() {
      /* `html.--light` is scrubbed by Graphene/GSAP independently of `vl-theme-middle`.
       * This class forces the dark `.switch` palette so the header toggle actually turns off the white fade. */
      body.classList.toggle("vl-white-scroll-disabled", !enabled);
    }

    function wireToggleButtons(on) {
      [desktopBtn, mobileBtn].forEach(function (btn) {
        if (!btn) return;
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.setAttribute(
          "aria-label",
          on ? "Disable white scroll background" : "Enable white scroll background",
        );
        btn.setAttribute("title", on ? "White scroll: on" : "White scroll: off");
      });
      var lbl =
        desktopBtn &&
        desktopBtn.querySelector(".vl-scroll-toggle__label");
      if (lbl) lbl.textContent = "White scroll";
      var lm =
        mobileBtn &&
        mobileBtn.querySelector(".vl-scroll-toggle__label");
      if (lm) lm.textContent = "White scroll";
    }

    function updateThemeZone() {
      ticking = false;

      if (!enabled) {
        body.classList.remove("vl-theme-middle");
        return;
      }

      if (isHome) {
        var nearHeader =
          window.scrollY < Math.max(140, window.innerHeight * 0.18);
        var nearFooter = false;
        if (footer) {
          var footerTop = footer.getBoundingClientRect().top;
          nearFooter =
            footerTop <
            window.innerHeight + Math.max(36, window.innerHeight * 0.06);
        }
        var withinProducts = false;
        if (homeProducts) {
          var productsRect = homeProducts.getBoundingClientRect();
          withinProducts =
            productsRect.bottom > 0 &&
            productsRect.top < window.innerHeight;
        }
        var useMiddle =
          (!nearHeader && !nearFooter) || withinProducts;
        body.classList.toggle("vl-theme-middle", useMiddle);
        return;
      }

      var nearHdr =
        window.scrollY < Math.max(100, window.innerHeight * 0.12);
      var nearFt = false;
      if (footer) {
        var ft = footer.getBoundingClientRect().top;
        nearFt = ft < window.innerHeight + 48;
      }
      body.classList.toggle(
        "vl-theme-middle",
        !nearHdr && !nearFt,
      );
    }

    function schedule() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateThemeZone);
    }

    wireToggleButtons(enabled);
    syncScrollEffectBodyClass();

    function setPreference(nextOn) {
      enabled = !!nextOn;
      writeEnabled(enabled);
      wireToggleButtons(enabled);
      syncScrollEffectBodyClass();
      updateThemeZone();
      window.dispatchEvent(new CustomEvent("vl-white-scroll-changed"));
    }

    [desktopBtn, mobileBtn].forEach(function (btn) {
      if (!btn) return;
      btn.addEventListener("click", function () {
        setPreference(!enabled);
      });
    });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("vl-white-scroll-changed", schedule);

    updateThemeZone();
  });
})();
