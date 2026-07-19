(function () {
  "use strict";

  function initSmileyAccordion() {
    const smileyBox = document.querySelector(
      "#postingbox #smiley-box"
    );

    const smileyContainer =
      smileyBox &&
      smileyBox.querySelector("#smileyContainer");

    if (
      !smileyBox ||
      !smileyContainer ||
      smileyBox.dataset.accordionReady === "true"
    ) {
      return;
    }

    if (!smileyContainer.id) {
      smileyContainer.id = "smileyContainer";
    }

    const toggle = document.createElement("button");

    toggle.type = "button";
    toggle.className = "utppPB_smileyToggle";

    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute(
      "aria-controls",
      smileyContainer.id
    );
    toggle.setAttribute(
      "aria-label",
      "Ouvrir les émoticônes"
    );

    toggle.innerHTML =
      '<span class="utppPB_smileyToggleIcon" aria-hidden="true">' +
        '<i data-lucide="smile-plus"></i>' +
      "</span>" +
      '<span class="utppPB_smileyToggleText">' +
        "Émotions" +
      "</span>" +
      '<span class="utppPB_smileyToggleArrow" aria-hidden="true">' +
        '<i data-lucide="chevron-right"></i>' +
      "</span>";

    /*
     * L’accordéon revient toujours à son état fermé
     * lors du chargement de la page.
     */
    smileyBox.classList.remove("is-open");

    smileyBox.insertBefore(
      toggle,
      smileyContainer
    );

    smileyBox.dataset.accordionReady = "true";

    toggle.addEventListener("click", function () {
      const isOpen =
        smileyBox.classList.toggle("is-open");

      toggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      toggle.setAttribute(
        "aria-label",
        isOpen
          ? "Fermer les émoticônes"
          : "Ouvrir les émoticônes"
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

  function initPostingEditor() {
    initSmileyAccordion();
    renderLucideIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initPostingEditor,
      { once: true }
    );
  } else {
    initPostingEditor();
  }
})();
