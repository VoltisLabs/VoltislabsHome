/**
 * Product detail rail: intentional portfolio/catalog graphic by default; hover (or keyboard focus)
 * swaps to another product’s artwork at random.
 */
(function () {
  /** Keep in sync with products grid / portfolio filenames (paths relative to site root). */
  var VL_PRODUCT_RAIL_POOL = [
    {
      slug: "bars",
      src: "assets/portfolio/Bars.svg",
      name: "Bars",
    },
    {
      slug: "clipstack",
      src: "assets/portfolio/Clipstack.svg",
      name: "Clipstack",
    },
    {
      slug: "notepadpro",
      src: "assets/portfolio/NotepadPro.svg",
      name: "NotepadPro",
    },
    {
      slug: "pinnacle-transfer",
      src: "assets/portfolio/Pinnacle.svg",
      name: "Pinnacle Transfer",
    },
    {
      slug: "wearhouse",
      src: "assets/portfolio/Wearhouse.svg",
      name: "Wearhouse",
    },
    {
      slug: "spinnersonic",
      src: "assets/portfolio/Spinnersonic Web.svg",
      name: "Spinnersonic",
    },
    {
      slug: "vmodel",
      src: "assets/voltislabs-public/image/vmodel-icon.png",
      name: "VModel",
    },
    {
      slug: "pony",
      src: "assets/voltislabs-public/image/ponylogo.png",
      name: "PONY",
    },
    {
      slug: "afrogarm",
      src: "assets/voltislabs-public/image/Frame.jpg",
      name: "Afrogarm",
    },
    {
      slug: "outfeatz",
      src: "assets/voltislabs-public/image/outfeatz.png",
      name: "Outfeatz",
    },
    {
      slug: "loyalty-bot",
      src: "assets/voltislabs-public/image/loyalty_bot.jpg",
      name: "Loyalty Bot",
    },
  ];

  function metaBySlug(slug) {
    for (var i = 0; i < VL_PRODUCT_RAIL_POOL.length; i++) {
      if (VL_PRODUCT_RAIL_POOL[i].slug === slug) return VL_PRODUCT_RAIL_POOL[i];
    }
    return null;
  }

  function pickRandomOther(slug) {
    var others = VL_PRODUCT_RAIL_POOL.filter(function (e) {
      return e.slug !== slug;
    });
    if (!others.length) return null;
    return others[Math.floor(Math.random() * others.length)];
  }

  function bindRail(root) {
    var slug = root.getAttribute("data-vl-product-slug");
    if (!slug) return;

    var primary = metaBySlug(slug);
    if (!primary) return;

    var img = root.querySelector(".vl-product-detail-rail__img");
    if (!img) return;

    if (img.getAttribute("src") !== primary.src) {
      img.src = primary.src;
    }
    img.alt = primary.name + " — portfolio artwork";
    root.setAttribute(
      "aria-label",
      primary.name +
        ". Hover or press Enter to glimpse another Voltis Labs product.",
    );

    var savedSrc = primary.src;
    var savedAlt = img.alt;

    var reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) return;

    function revert() {
      root.removeAttribute("data-vl-rail-hover");
      if (img.getAttribute("src") !== savedSrc) {
        img.src = savedSrc;
        img.alt = savedAlt;
      }
    }

    function peek() {
      var pick = pickRandomOther(slug);
      if (!pick) return;
      root.setAttribute("data-vl-rail-hover", "1");
      var probe = new Image();
      probe.onload = function () {
        img.src = pick.src;
        img.alt = pick.name + " — portfolio artwork preview";
      };
      probe.onerror = function () {
        revert();
      };
      probe.src = pick.src;
    }

    root.addEventListener("mouseenter", peek);
    root.addEventListener("mouseleave", revert);

    root.addEventListener(
      "focusin",
      function () {
        peek();
      },
      true,
    );
    root.addEventListener(
      "focusout",
      function () {
        revert();
      },
      true,
    );
  }

  function init() {
    document.querySelectorAll("[data-vl-product-rail]").forEach(bindRail);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
