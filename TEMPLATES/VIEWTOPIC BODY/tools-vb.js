/**
 * UTPPVB — Outils des pages de sujet Forumactif
 *
 * - Icône Lucide aléatoire du titre
 * - Pagination enrichie
 * - État de surveillance
 * - Participants avec tooltips
 * - Masquage du bloc avec un seul participant
 * - Réponse rapide moderne
 */

(function () {
  "use strict";


  /* ==================================================
     CONFIGURATION
     ================================================== */

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


  const QUICK_REPLY_COPY = {
    eyebrow: "Discussion",
    title: "Écrire une réponse",
    subtitle: "Partagez votre message avec la communauté.",
    placeholder: "Écrivez votre réponse…",
    preview: "Aperçu",
    send: "Envoyer"
  };


  /* ==================================================
     NORMALISATION DU TEXTE
     ================================================== */

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }


  /* ==================================================
     ICÔNE ALÉATOIRE DU TITRE
     ================================================== */

  function setRandomTitleIcons() {
    const elements = document.querySelectorAll(
      "[data-random-lucide]"
    );


    elements.forEach(function (element) {
      const randomIndex = Math.floor(
        Math.random() * RANDOM_ICONS.length
      );

      element.setAttribute(
        "data-lucide",
        RANDOM_ICONS[randomIndex]
      );
    });
  }


  /* ==================================================
     PAGINATION
     ================================================== */

  function enhancePaginations() {
    const paginations = document.querySelectorAll(
      ".utppVB_pages"
    );


    paginations.forEach(function (pagination) {
      /*
       * Empêche une double transformation.
       */

      if (
        pagination.dataset.paginationReady === "true"
      ) {
        return;
      }


      /*
       * Forumactif place normalement la page actuelle
       * dans une balise <strong>.
       */

      const currentPage =
        pagination.querySelector("strong");


      if (!currentPage) {
        return;
      }


      const currentNumber =
        currentPage.textContent.trim();


      const pageList =
        document.createElement("div");

      const currentBlock =
        document.createElement("div");

      const label =
        document.createElement("span");

      const number =
        document.createElement("span");


      pageList.className =
        "utppVB_pages__list";

      currentBlock.className =
        "utppVB_pages__current";

      label.className =
        "utppVB_pages__label";

      number.className =
        "utppVB_pages__number";


      label.textContent =
        "Page actuelle";

      number.textContent =
        currentNumber;


      currentBlock.setAttribute(
        "aria-label",
        "Page actuelle : " + currentNumber
      );


      currentBlock.append(
        label,
        number
      );


      /*
       * Déplace la pagination générée par Forumactif
       * sans recréer ni casser ses liens.
       */

      while (pagination.firstChild) {
        pageList.appendChild(
          pagination.firstChild
        );
      }


      pagination.append(
        currentBlock,
        pageList
      );


      pagination.dataset.paginationReady =
        "true";
    });
  }


  /* ==================================================
     SURVEILLANCE DU SUJET
     ================================================== */

  function updateWatchTopicStates() {
    const watchBlocks = document.querySelectorAll(
      ".utppVB_watchtopicBG"
    );


    watchBlocks.forEach(function (watchBlock) {
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


      /*
       * Si Forumactif propose d’arrêter la surveillance,
       * cela signifie que le sujet est actuellement suivi.
       */

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


  /* ==================================================
     PARTICIPANTS DU SUJET
     ================================================== */

  function enhanceTopicParticipants() {
    const participants = document.querySelector(
      ".sub-header-buttons__right"
    );


    /*
     * Arrêt si le bloc n’existe pas ou s’il a
     * déjà été transformé.
     */

    if (
      !participants ||
      participants.dataset.participantsReady === "true"
    ) {
      return;
    }


    /*
     * Forumactif génère chaque membre dans :
     *
     * <div class="poster" title="Pseudo">
     *   <a href="/profil"></a>
     * </div>
     */

    const posters = participants.querySelectorAll(
      ".posts-users-list > .poster"
    );


    /*
     * Si une seule personne participe au sujet,
     * masque complètement le bloc.
     */

    if (posters.length <= 1) {
      participants.hidden = true;

      participants.dataset.participantsReady =
        "true";

      return;
    }


    /*
     * Masque le compteur natif :
     * “2 participants”, “3 participants”, etc.
     */

    const nativeCount = participants.querySelector(
      ".poster-count"
    );


    if (nativeCount) {
      nativeCount.hidden = true;
    }


    /* --------------------------------------------------
       CRÉATION DU TOOLTIP
       -------------------------------------------------- */

    /*
     * Un seul tooltip est créé dans <body>.
     * Il ne pourra pas être coupé par un overflow
     * provenant du template Forumactif.
     */

    let tooltip = document.querySelector(
      "#utppVB-participant-tooltip"
    );


    if (!tooltip) {
      tooltip =
        document.createElement("div");


      tooltip.id =
        "utppVB-participant-tooltip";

      tooltip.className =
        "utppVB_participant-tooltip";


      tooltip.setAttribute(
        "role",
        "tooltip"
      );


      tooltip.hidden = true;


      document.body.appendChild(
        tooltip
      );
    }


    /* --------------------------------------------------
       AFFICHAGE DU TOOLTIP
       -------------------------------------------------- */

    function showTooltip(poster) {
      const participantName =
        poster.dataset.participantName;


      if (!participantName) {
        return;
      }


      tooltip.textContent =
        participantName;

      tooltip.hidden =
        false;


      tooltip.classList.remove(
        "is-visible",
        "is-below"
      );


      /*
       * Attend que le navigateur calcule les dimensions
       * du tooltip avant de le positionner.
       */

      requestAnimationFrame(function () {
        const posterRect =
          poster.getBoundingClientRect();

        const tooltipRect =
          tooltip.getBoundingClientRect();


        const gap = 10;
        const edge = 8;


        /*
         * Centre horizontalement le tooltip.
         */

        let left =
          posterRect.left +
          posterRect.width / 2 -
          tooltipRect.width / 2;


        /*
         * Empêche le tooltip de sortir de l’écran.
         */

        left = Math.max(
          edge,
          Math.min(
            left,
            window.innerWidth -
            tooltipRect.width -
            edge
          )
        );


        /*
         * Position normale : au-dessus de l’avatar.
         */

        let top =
          posterRect.top -
          tooltipRect.height -
          gap;


        /*
         * S’il manque de la place au-dessus,
         * positionne le tooltip sous l’avatar.
         */

        if (top < edge) {
          top =
            posterRect.bottom +
            gap;

          tooltip.classList.add(
            "is-below"
          );
        }


        tooltip.style.left =
          left + "px";

        tooltip.style.top =
          top + "px";


        tooltip.classList.add(
          "is-visible"
        );
      });
    }


    /* --------------------------------------------------
       MASQUAGE DU TOOLTIP
       -------------------------------------------------- */

    function hideTooltip() {
      tooltip.classList.remove(
        "is-visible",
        "is-below"
      );


      /*
       * Laisse le temps à la transition CSS
       * de se terminer avant de masquer l’élément.
       */

      window.setTimeout(function () {
        if (
          !tooltip.classList.contains(
            "is-visible"
          )
        ) {
          tooltip.hidden =
            true;
        }
      }, 180);
    }


    /* --------------------------------------------------
       PRÉPARATION DES AVATARS
       -------------------------------------------------- */

    posters.forEach(function (poster) {
      const participantName = (
        poster.getAttribute("title") || ""
      ).trim();


      /*
       * Ignore un avatar sans pseudo exploitable.
       */

      if (!participantName) {
        return;
      }


      const profileLink =
        poster.querySelector("a");


      /*
       * Copie le pseudo dans un attribut personnalisé
       * utilisé par le tooltip.
       */

      poster.dataset.participantName =
        participantName;


      /*
       * Supprime le tooltip natif du navigateur.
       */

      poster.removeAttribute(
        "title"
      );


      /* Souris */

      poster.addEventListener(
        "mouseenter",
        function () {
          showTooltip(
            poster
          );
        }
      );


      poster.addEventListener(
        "mouseleave",
        hideTooltip
      );


      /* Navigation au clavier */

      poster.addEventListener(
        "focusin",
        function () {
          showTooltip(
            poster
          );
        }
      );


      poster.addEventListener(
        "focusout",
        hideTooltip
      );


      /*
       * Accessibilité du lien de profil.
       */

      if (profileLink) {
        if (
          !profileLink.getAttribute(
            "aria-label"
          )
        ) {
          profileLink.setAttribute(
            "aria-label",
            participantName
          );
        }


        profileLink.setAttribute(
          "aria-describedby",
          tooltip.id
        );
      } else {
        /*
         * Si aucun lien n’est généré, rend l’avatar
         * accessible au clavier.
         */

        poster.setAttribute(
          "tabindex",
          "0"
        );


        poster.setAttribute(
          "aria-label",
          participantName
        );


        poster.setAttribute(
          "aria-describedby",
          tooltip.id
        );
      }
    });


    /*
     * Active la présentation CSS.
     */

    participants.classList.add(
      "utppVB_participants-ready"
    );


    participants.dataset.participantsReady =
      "true";
  }


  /* ==================================================
     ANCIEN TITRE “RÉPONSE RAPIDE”
     ================================================== */

  function hideLegacyQuickReplyTitle(quickReply) {
    const parent =
      quickReply.parentElement;


    if (!parent) {
      return;
    }


    /*
     * Recherche les différents formats de titre
     * susceptibles d’être générés par Forumactif.
     */

    const possibleTitles = parent.querySelectorAll(
      [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        ".h1",
        ".h2",
        ".h3",
        ".h4",
        ".page-title",
        ".topic-title"
      ].join(",")
    );


    possibleTitles.forEach(function (element) {
      const position =
        element.compareDocumentPosition(
          quickReply
        );


      /*
       * Vérifie que le titre est placé avant
       * le formulaire.
       */

      const isBeforeQuickReply = Boolean(
        position &
        Node.DOCUMENT_POSITION_FOLLOWING
      );


      if (!isBeforeQuickReply) {
        return;
      }


      /*
       * Supprime les accents et la ponctuation finale.
       */

      const normalizedTitle = normalizeText(
        element.textContent
      )
        .replace(
          /[\s:：\-–—]+$/g,
          ""
        )
        .trim();


      const isQuickReplyTitle =
        normalizedTitle === "reponse rapide" ||
        normalizedTitle === "quick reply";


      if (isQuickReplyTitle) {
        element.classList.add(
          "utppVB_quickreply-legacy-title"
        );
      }
    });
  }


  /* ==================================================
     RÉPONSE RAPIDE MODERNE
     ================================================== */

  function enhanceQuickReply() {
    const quickReply = document.querySelector(
      "#quick_reply"
    );


    /*
     * Arrêt si le formulaire n’existe pas
     * ou s’il a déjà été transformé.
     */

    if (
      !quickReply ||
      quickReply.dataset.quickReplyReady === "true"
    ) {
      return;
    }


    const editorContent = quickReply.querySelector(
      "#textarea_content"
    );


    if (!editorContent) {
      return;
    }


    /*
     * Masque l’ancien titre “Réponse rapide:”.
     */

    hideLegacyQuickReplyTitle(
      quickReply
    );


    /* --------------------------------------------------
       CRÉATION DE L’EN-TÊTE
       -------------------------------------------------- */

    const header =
      document.createElement("header");

    const icon =
      document.createElement("span");

    const heading =
      document.createElement("span");

    const eyebrow =
      document.createElement("span");

    const title =
      document.createElement("span");

    const subtitle =
      document.createElement("span");


    header.className =
      "utppVB_quickreply-head";

    icon.className =
      "utppVB_quickreply-icon";

    heading.className =
      "utppVB_quickreply-heading";

    eyebrow.className =
      "utppVB_quickreply-eyebrow";

    title.className =
      "utppVB_quickreply-title";

    subtitle.className =
      "utppVB_quickreply-subtitle";


    icon.setAttribute(
      "aria-hidden",
      "true"
    );


    icon.innerHTML =
      '<i data-lucide="message-circle-more"></i>';


    eyebrow.textContent =
      QUICK_REPLY_COPY.eyebrow;

    title.textContent =
      QUICK_REPLY_COPY.title;

    subtitle.textContent =
      QUICK_REPLY_COPY.subtitle;


    heading.append(
      eyebrow,
      title,
      subtitle
    );


    header.append(
      icon,
      heading
    );


    /*
     * Place l’en-tête avant SCEditor.
     */

    quickReply.insertBefore(
      header,
      editorContent
    );


    /* --------------------------------------------------
       BOUTONS
       -------------------------------------------------- */

    const previewButton = quickReply.querySelector(
      'input[type="submit"][name="preview"]'
    );

    const sendButton = quickReply.querySelector(
      'input[type="submit"][name="post"]'
    );


    const actions = sendButton
      ? sendButton.closest("div")
      : null;


    if (previewButton) {
      previewButton.value =
        QUICK_REPLY_COPY.preview;


      previewButton.classList.add(
        "utppVB_quickreply-preview"
      );
    }


    if (sendButton) {
      sendButton.value =
        QUICK_REPLY_COPY.send;


      sendButton.classList.add(
        "utppVB_quickreply-send"
      );
    }


    /*
     * Retire les styles inline du bloc des boutons.
     */

    if (
      actions &&
      actions.parentElement === quickReply
    ) {
      actions.classList.add(
        "utppVB_quickreply-actions"
      );


      actions.removeAttribute(
        "style"
      );
    }


    /* --------------------------------------------------
       PLACEHOLDER
       -------------------------------------------------- */

    const editorTextareas = quickReply.querySelectorAll(
      ".sceditor-container textarea"
    );


    editorTextareas.forEach(function (textarea) {
      textarea.setAttribute(
        "placeholder",
        QUICK_REPLY_COPY.placeholder
      );


      textarea.setAttribute(
        "aria-label",
        QUICK_REPLY_COPY.title
      );
    });


    quickReply.dataset.quickReplyReady =
      "true";
  }


  /* ==================================================
     RENDU DES ICÔNES LUCIDE
     ================================================== */

  function renderLucideIcons() {
    /*
     * Évite une erreur si Lucide n’est pas chargé
     * sur une page particulière.
     */

    if (
      window.lucide &&
      typeof window.lucide.createIcons === "function"
    ) {
      window.lucide.createIcons();
    }
  }


  /* ==================================================
     INITIALISATION GÉNÉRALE
     ================================================== */

  function initTopicTools() {
    setRandomTitleIcons();
    enhancePaginations();
    updateWatchTopicStates();
    enhanceTopicParticipants();
    enhanceQuickReply();
    renderLucideIcons();
  }


  /*
   * Fonctionne avec ou sans l’attribut defer.
   */

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
