(function () {
  "use strict";

  function normalizeText(value) {
    return (value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function hideDuplicatePostingHeadings(
    referenceHeading,
    postingBox
  ) {
    const referenceText = normalizeText(
      referenceHeading.textContent
    );

    if (!referenceText) {
      return;
    }

    const searchRoot =
      postingBox.parentElement ||
      document.body;

    searchRoot
      .querySelectorAll("*")
      .forEach(function (element) {
        const belongsToReference =
          element === referenceHeading ||
          referenceHeading.contains(element) ||
          element.closest(
            ".utppPB_postingHeader"
          ) === referenceHeading;

        const isCompactElement =
          element.children.length <= 1;

        const elementText = normalizeText(
          element.textContent
        );

        if (
          !belongsToReference &&
          isCompactElement &&
          elementText === referenceText
        ) {
          element.classList.add(
            "utppPB_postingHeaderLegacy"
          );
        }
      });
  }

  function watchForDuplicatePostingHeadings(
    referenceHeading,
    postingBox
  ) {
    if (
      !window.MutationObserver ||
      postingBox.dataset
        .headerObserverReady === "true"
    ) {
      return;
    }

    let scheduled = false;

    const searchRoot =
      postingBox.parentElement ||
      document.body;

    const observer =
      new MutationObserver(function () {
        if (scheduled) {
          return;
        }

        scheduled = true;

        window.requestAnimationFrame(
          function () {
            hideDuplicatePostingHeadings(
              referenceHeading,
              postingBox
            );

            scheduled = false;
          }
        );
      });

    observer.observe(searchRoot, {
      childList: true,
      subtree: true
    });

    postingBox.dataset.headerObserverReady =
      "true";
  }

  function enhancePostingHeader() {
    const postingBox = document.querySelector(
      "#postingbox"
    );

    if (
      !postingBox ||
      postingBox.dataset.headerReady ===
        "true"
    ) {
      return;
    }

    const internalHeading =
      postingBox.querySelector(
        [
          "h1",
          "h2",
          "h3",
          ".utppPB_postingHeader"
        ].join(",")
      );

    if (internalHeading) {
      internalHeading.classList.add(
        "utppPB_postingHeader"
      );

      hideDuplicatePostingHeadings(
        internalHeading,
        postingBox
      );

      watchForDuplicatePostingHeadings(
        internalHeading,
        postingBox
      );

      postingBox.dataset.headerReady =
        "true";

      return;
    }

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
        element.compareDocumentPosition(
          postingBox
        );

      const isBeforePostingBox = Boolean(
        position &
          Node.DOCUMENT_POSITION_FOLLOWING
      );

      const text = normalizeText(
        element.textContent
      );

      const isPostingHeading =
        text.includes("poster") ||
        text.includes("repondre") ||
        text.includes("nouveau sujet") ||
        text.includes("editer");

      return (
        isBeforePostingBox &&
        isPostingHeading
      );
    });

    const nativeHeading =
      possibleHeadings[
        possibleHeadings.length - 1
      ];

    if (!nativeHeading) {
      postingBox.dataset.headerReady =
        "true";

      return;
    }

    const header =
      document.createElement("h3");

    header.className =
      "utppPB_postingHeader";

    header.textContent =
      nativeHeading.textContent.trim();

    nativeHeading.classList.add(
      "utppPB_postingHeaderLegacy"
    );

    postingBox.insertBefore(
      header,
      postingBox.firstChild
    );

    hideDuplicatePostingHeadings(
      header,
      postingBox
    );

    watchForDuplicatePostingHeadings(
      header,
      postingBox
    );

    postingBox.dataset.headerReady =
      "true";
  }

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
      smileyBox.dataset.accordionReady ===
        "true"
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

  function renderLucideIcons() {
    if (
      window.lucide &&
      typeof window.lucide.createIcons ===
        "function"
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
