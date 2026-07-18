(function () {
  "use strict";

  const RANDOM_ICONS = [
    "sparkles",
    "orbit",
    "flame",
    "zap",
    "ghost",
    "gem",
    "moon-star",
    "rocket",
    "bot",
    "skull",
    "wand-sparkles",
    "scan-eye"
  ];

  function setRandomTitleIcons() {
    document
      .querySelectorAll("[data-random-lucide]")
      .forEach(function (element) {
        const randomIndex = Math.floor(
          Math.random() * RANDOM_ICONS.length
        );

        element.setAttribute(
          "data-lucide",
          RANDOM_ICONS[randomIndex]
        );
      });
  }

  function enhancePaginations() {
    document
      .querySelectorAll(".utppVB_pages")
      .forEach(function (pagination) {
        if (
          pagination.dataset.paginationReady === "true"
        ) {
          return;
        }

        const currentPage =
          pagination.querySelector("strong");

        if (!currentPage) {
          return;
        }

        const currentNumber =
          currentPage.textContent.trim();

        const pageList =
          document.createElement("div");

        const currentLabel =
          document.createElement("div");

        const label =
          document.createElement("span");

        const number =
          document.createElement("span");

        pageList.className =
          "utppVB_pages__list";

        currentLabel.className =
          "utppVB_pages__current";

        label.className =
          "utppVB_pages__label";

        number.className =
          "utppVB_pages__number";

        label.textContent = "Page actuelle";
        number.textContent = currentNumber;

        currentLabel.setAttribute(
          "aria-label",
          "Page actuelle : " + currentNumber
        );

        currentLabel.append(label, number);

        while (pagination.firstChild) {
          pageList.appendChild(
            pagination.firstChild
          );
        }

        pagination.append(
          currentLabel,
          pageList
        );

        pagination.dataset.paginationReady =
          "true";
      });
  }

  function normalizeText(value) {
    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function updateWatchTopicStates() {
    document
      .querySelectorAll(".utppVB_watchtopicBG")
      .forEach(function (watchBlock) {
        const watchLink =
          watchBlock.querySelector("a");

        if (!watchLink) {
          return;
        }

        const linkText = normalizeText(
          watchLink.textContent
        );

        const linkHref = (
          watchLink.getAttribute("href") || ""
        ).toLowerCase();

        const isWatching =
          linkText.includes("arreter") ||
          linkText.includes("ne plus surveiller") ||
          linkText.includes("stop watching") ||
          linkHref.includes("unwatch");

        watchBlock.classList.toggle(
          "is-watching",
          isWatching
        );

        watchLink.setAttribute(
          "aria-pressed",
          String(isWatching)
        );
      });
  }

  function renderLucideIcons() {

    if (
      window.lucide &&
      typeof window.lucide.createIcons === "function"
    ) {
      window.lucide.createIcons();
    }
  }

  function initTopicTools() {
    setRandomTitleIcons();
    enhancePaginations();
    updateWatchTopicStates();
    renderLucideIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initTopicTools,
      { once: true }
    );
  } else {
    initTopicTools();
  }
})();
