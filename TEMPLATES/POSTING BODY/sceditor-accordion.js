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
   * Masque les versions natives du titre qui possèdent
   * exactement le même texte que notre belle entête.
   */
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
      .forEach(function (heading) {
        const belongsToReference =
          heading === referenceHeading ||
          referenceHeading.contains(heading) ||
          heading.closest(
            ".utppPB_postingHeader"
          ) === referenceHeading;

        const isCompactElement =
          heading.children.length <= 1;

        const headingText = normalizeText(
          heading.textContent
        );

        if (
          !belongsToReference &&
          isCompactElement &&
          headingText === referenceText
        ) {
          heading.classList.add(
            "utppPB_postingHeaderLegacy"
          );
        }
      });
  }

  /*
   * Surveille les titres que Forumactif pourrait
   * injecter après le chargement initial.
   */
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

  /*
   * Récupère ou reconstruit la grande entête
   * du formulaire Forumactif.
   */
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

    /*
     * Si un titre se trouve déjà dans #postingbox,
     * on le transforme directement.
     */
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

    /*
     * Sinon, on recherche l’intitulé natif situé
     * avant le formulaire.
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

  /*
   * Transforme la boîte native des émoticônes
   * en accordéon horizontal.
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

    /*
     * L’accordéon est toujours refermé
     * au chargement de la page.
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
   * Ajoute le compteur de caractères et de mots.
   */
  function initEditorCounters() {
    const postingBox = document.querySelector(
      "#postingbox"
    );

    const messageBox =
      postingBox &&
      postingBox.querySelector(
        "#message-box"
      );

    if (
      !messageBox ||
      messageBox.dataset.countersReady ===
        "true"
    ) {
      return;
    }

    const counters =
      document.createElement("div");

    counters.className =
      "utppPB_editorStats";

    counters.setAttribute(
      "aria-live",
      "polite"
    );

    counters.setAttribute(
      "aria-atomic",
      "true"
    );

    counters.innerHTML =
      '<span class="utppPB_editorStat">' +
        '<strong data-character-count>0</strong> ' +
        '<span data-character-label>caractères</span>' +
      "</span>" +

      '<span class="utppPB_editorStat">' +
        '<strong data-word-count>0</strong> ' +
        '<span data-word-label>mots</span>' +
      "</span>";

    messageBox.appendChild(counters);

    messageBox.dataset.countersReady =
      "true";

    const characterCount =
      counters.querySelector(
        "[data-character-count]"
      );

    const characterLabel =
      counters.querySelector(
        "[data-character-label]"
      );

    const wordCount =
      counters.querySelector(
        "[data-word-count]"
      );

    const wordLabel =
      counters.querySelector(
        "[data-word-label]"
      );

    /*
     * Évite d’attacher plusieurs fois les mêmes
     * événements aux éléments de SCEditor.
     */
    const boundEditors =
      new WeakSet();

    function updateCounters(text) {
      const value =
        String(text || "");

      const words =
        value.trim().match(/\S+/g);

      const characters =
        value.length;

      const totalWords =
        words ? words.length : 0;

      characterCount.textContent =
        String(characters);

      characterLabel.textContent =
        characters === 1
          ? "caractère"
          : "caractères";

      wordCount.textContent =
        String(totalWords);

      wordLabel.textContent =
        totalWords === 1
          ? "mot"
          : "mots";
    }

    /*
     * Connexion au mode source de SCEditor.
     */
    function bindTextarea(textarea) {
      if (boundEditors.has(textarea)) {
        return;
      }

      boundEditors.add(textarea);

      textarea.addEventListener(
        "input",
        function () {
          updateCounters(
            textarea.value
          );
        }
      );
    }

    /*
     * Connexion au mode visuel de SCEditor.
     */
    function bindIframe(iframe) {
      if (boundEditors.has(iframe)) {
        return;
      }

      function connectIframeBody() {
        try {
          const body =
            iframe.contentDocument &&
            iframe.contentDocument.body;

          if (
            !body ||
            boundEditors.has(body)
          ) {
            return;
          }

          boundEditors.add(body);

          body.addEventListener(
            "input",
            function () {
              updateCounters(
                body.innerText ||
                body.textContent ||
                ""
              );
            }
          );

          updateCounters(
            body.innerText ||
            body.textContent ||
            ""
          );
        } catch (error) {
          /*
           * Si l’iframe est inaccessible,
           * le compteur source reste disponible.
           */
        }
      }

      boundEditors.add(iframe);

      iframe.addEventListener(
        "load",
        connectIframeBody
      );

      connectIframeBody();
    }

    /*
     * Recherche et connecte les éléments créés
     * dynamiquement par SCEditor.
     */
    function connectEditors() {
      messageBox
        .querySelectorAll("textarea")
        .forEach(bindTextarea);

      messageBox
        .querySelectorAll("iframe")
        .forEach(bindIframe);

      const visibleTextarea =
        Array.from(
          messageBox.querySelectorAll(
            "textarea"
          )
        ).find(function (textarea) {
          return (
            window
              .getComputedStyle(textarea)
              .display !== "none"
          );
        });

      if (visibleTextarea) {
        updateCounters(
          visibleTextarea.value
        );
      }
    }

    connectEditors();

    /*
     * SCEditor peut être construit après notre JS :
     * on surveille donc l’arrivée de ses éléments.
     */
    const observer =
      new MutationObserver(
        connectEditors
      );

    observer.observe(messageBox, {
      childList: true,
      subtree: true
    });
  }

  /*
   * Conversion des icônes Lucide en SVG.
   */
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
    initEditorCounters();
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
