/**
 * Newspaper-style sections: edition appearance (Light / Dark / Auto).
 * Preference in localStorage; Auto follows prefers-color-scheme.
 * Articles page also toggles html/body canvas for seamless overscroll (full page).
 */
document.addEventListener("DOMContentLoaded", function () {
  var STORAGE_KEY = "vlNotebookEditionTone";
  var roots = document.querySelectorAll("[data-news-edition]");
  if (!roots.length) return;

  var prefersDarkMq = window.matchMedia("(prefers-color-scheme: dark)");

  function readStored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === "light" || v === "dark" || v === "system") return v;
    } catch (e) {}
    return "system";
  }

  function writeStored(v) {
    try {
      localStorage.setItem(STORAGE_KEY, v);
    } catch (e) {}
  }

  function effectiveFromStored(stored) {
    if (stored === "dark") return "dark";
    if (stored === "light") return "light";
    return prefersDarkMq.matches ? "dark" : "light";
  }

  function labelForStored(stored) {
    if (stored === "light") return "Light";
    if (stored === "dark") return "Dark";
    return "Auto";
  }

  function apply(stored) {
    var eff = effectiveFromStored(stored);

    roots.forEach(function (root) {
      root.setAttribute("data-news-tone", stored);
      root.setAttribute("data-news-effective", eff);
    });

    var isBlogPage = document.body.classList.contains("vl-blog-page");
    document.body.classList.toggle("vl-news-dark", isBlogPage && eff === "dark");
    document.documentElement.classList.toggle("vl-news-root-dark", isBlogPage && eff === "dark");

    document.querySelectorAll("[data-news-tone-cycle] .vl-news-tone__label").forEach(function (el) {
      el.textContent = labelForStored(stored);
    });

    document.querySelectorAll("[data-news-tone-cycle]").forEach(function (btn) {
      btn.setAttribute(
        "aria-label",
        "Articles edition: " +
          labelForStored(stored) +
          ". Cycle light, dark, or auto."
      );
      btn.setAttribute("title", "Edition: " + labelForStored(stored));
    });
  }

  var stored = readStored();
  apply(stored);

  document.querySelectorAll("[data-news-tone-cycle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cur = readStored();
      var next = cur === "system" ? "light" : cur === "light" ? "dark" : "system";
      writeStored(next);
      apply(next);
    });
  });

  prefersDarkMq.addEventListener("change", function () {
    if (readStored() === "system") apply("system");
  });
});
