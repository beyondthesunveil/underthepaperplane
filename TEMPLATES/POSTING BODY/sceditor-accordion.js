(function () {
  "use strict";

  function normalizeText(value) {
    return (value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  /*
   * Récupère l’intitulé natif de Forumactif lorsque
   * celui-ci se trouve à l’extérieur de #postingbox.
   */
  function enhancePostingHeader() {
    const postingBox = document.querySelector(
      "#postingbox"
    );

    if (
      !postingBox ||
      postingBox.dataset.headerReady === "true"
    ) {
      return;
    }

    const internalHeading = postingBox.querySelector(
      "h1, h2, h3, .utppPB_postingHeader"
    );

    /*
     * Si le titre existe déjà dans #postingbox,
     * on lui ajoute simplement notre classe.
     */
    if (internalHeading) {
      internalHeading.classList.add(
        "utppPB_postingHeader"
      );

      postingBox.dataset.headerReady = "true";

      return;
    }

    /*
     * Sinon, on cherche le titre natif placé avant
     * le formulaire par Forumactif.
     */
    const possibleHeadings = Array.from(
      document.querySelectorAll(
        [
          "h1",
          "h2",
          "h3",
          ".page-title",
          ".topic-title"
        ].join(",")
      )
    ).filter(function (element) {
      if (postingBox.contains(element)) {
        return false;
      }

      const position =
        element.compareDocumentPosition(postingBox);

      const isBeforePostingBox = Boolean(
        position & Node.DOCUMENT_POSITION_FOLLOWING
      );

      const text = normalizeText(
        element.textContent
      );

      return (
        isBeforePostingBox &&
        (
          text.includes("poster") ||
          text.includes("repondre") ||
          text.includes("nouveau sujet") ||
          text.includes("editer")
        )
      );
    });

    /*
     * On prend le titre correspondant le plus proche
     * du formulaire.
     */
    const nativeHeading =
      possibleHeadings[possibleHeadings.length - 1];

    if (!nativeHeading) {
      postingBox.dataset.headerReady = "true";

      return;
    }

    const header =
      document.createElement("h3");

    header.className =
      "utppPB_postingHeader";

    header.textContent =
      nativeHeading.textContent.trim();

    /*
     * On masque l’ancien titre sans le supprimer,
     * puis on place le nouveau dans #postingbox.
     */
    nativeHeading.classList.add(
      "utppPB_postingHeaderLegacy"
    );

    postingBox.insertBefore(
      header,
      postingBox.firstChild
    );

    postingBox.dataset.headerReady = "true";
  }

  /*
   * Transforme la boîte native des smileys
   * en accordéon horizontal accessible.
   */
  function initSmileyAccordion() {
    const smileyBox = document.querySelector(
      "#postingbox #smiley-box"
    );

    const smileyContainer =
      smileyBox &&
      smileyBox.querySelector(
        "#smileyContainer"
      );

    if (
      !smileyBox ||
      !smileyContainer ||
      smileyBox.dataset.accordionReady === "true"
    ) {
      return;
    }

    if (!smileyContainer.id) {
      smileyContainer.id =
        "smileyContainer";
    }

    const toggle =
      document.createElement("button");

    toggle.type = "button";

    toggle.className =
      "utppPB_smileyToggle";

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );

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
     * L’accordéon est toujours fermé au chargement.
     */
    smileyBox.classList.remove(
      "is-open"
    );

    smileyBox.insertBefore(
      toggle,
      smileyContainer
    );

    smileyBox.dataset.accordionReady =
      "true";

    toggle.addEventListener(
      "click",
      function () {
        const isOpen =
          smileyBox.classList.toggle(
            "is-open"
          );

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
      }
    );
  }

  /*
   * Convertit les balises data-lucide en SVG.
   */
  function renderLucideIcons() {
    if (
      window.lucide &&
      typeof window.lucide.createIcons === "function"
    ) {
      window.lucide.createIcons();
    }
  }

  function initPostingEditor() {
    enhancePostingHeader();
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
