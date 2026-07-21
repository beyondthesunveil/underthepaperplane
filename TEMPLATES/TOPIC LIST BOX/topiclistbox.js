(function () {
  "use strict";

  /* =========================================================
     CONFIGURATION DES ÉTATS
     ========================================================= */

  const TOPIC_STATES = {
    new: {
      icon: "sparkles",
      label: "Nouveau message"
    },

    read: {
      icon: "mail-open",
      label: "Aucun nouveau message"
    },

    hot: {
      icon: "flame",
      label: "Sujet populaire"
    },

    locked: {
      icon: "lock-keyhole",
      label: "Sujet verrouillé"
    }
  };


  /* =========================================================
     OUTILS
     ========================================================= */

  function normalise(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }


  /* =========================================================
     DÉTECTION DE L’ÉTAT
     ========================================================= */

  function detectTopicState(topic) {
    const folderAlt =
      topic.dataset.topicFolderAlt || "";

    const folderImage =
      topic.dataset.topicFolderImage || "";

    const source = normalise(
      folderAlt + " " + folderImage
    );

    /*
     * L’état verrouillé est prioritaire.
     */
    if (
      /lock|locked|verrou|verrouille|ferme|closed/.test(
        source
      )
    ) {
      return "locked";
    }

    /*
     * Sujet populaire.
     */
    if (
      /hot|popular|populaire|chaud|flame/.test(
        source
      )
    ) {
      return "hot";
    }

    /*
     * Nouveau message.
     */
    if (
      /unread|new|nouveau|nouveaux|non[-_ ]?lu/.test(
        source
      )
    ) {
      return "new";
    }

    return "read";
  }


  /* =========================================================
     DÉTECTION DES ANNONCES ET NOTES
     ========================================================= */

  function detectPriority(topic) {
    const folderAlt =
      topic.dataset.topicFolderAlt || "";

    const folderImage =
      topic.dataset.topicFolderImage || "";

    const source = normalise(
      folderAlt + " " + folderImage
    );

    if (/global/.test(source)) {
      return {
        label: "Annonce globale",
        meta: "Priorité absolue"
      };
    }

    if (/announce|annonce/.test(source)) {
      return {
        label: "Annonce du forum",
        meta: "Prioritaire"
      };
    }

    if (
      /sticky|post[-_ ]?it|note/.test(source)
    ) {
      return {
        label: "Note du forum",
        meta: "À conserver"
      };
    }

    return {
      label: "Transmission prioritaire",
      meta: "À consulter"
    };
  }


  /* =========================================================
     LIEN DU DERNIER MESSAGE
     ========================================================= */

  function enhanceLastReply(topic) {
    const nativeLastPostLink =
      topic.querySelector(
        ".utppTL_nativeLastPost a"
      );

    const lastReplyGo =
      topic.querySelector(
        ".utppTL_lastReplyGo"
      );

    if (
      !nativeLastPostLink ||
      !lastReplyGo
    ) {
      return;
    }

    const nativeHref =
      nativeLastPostLink.getAttribute(
        "href"
      );

    if (nativeHref) {
      lastReplyGo.setAttribute(
        "href",
        nativeHref
      );
    }
  }


  /* =========================================================
     ICÔNE D’ÉTAT
     ========================================================= */

  function enhanceTopicState(topic) {
    const stateName =
      detectTopicState(topic);

    const state =
      TOPIC_STATES[stateName] ||
      TOPIC_STATES.read;

    const stateElement =
      topic.querySelector(
        ".utppTL_topicState"
      );

    topic.dataset.topicState =
      stateName;

    if (!stateElement) {
      return;
    }

    stateElement.innerHTML =
      '<i data-lucide="' +
      state.icon +
      '"></i>';

    stateElement.setAttribute(
      "aria-label",
      state.label
    );

    stateElement.setAttribute(
      "title",
      state.label
    );

    stateElement.removeAttribute(
      "aria-hidden"
    );
  }


  /* =========================================================
     INFORMATIONS DE PRIORITÉ
     ========================================================= */

  function enhancePriority(topic) {
    if (
      !topic.closest(
        ".utppTL_featuredGrid"
      )
    ) {
      return;
    }

    const priority =
      detectPriority(topic);

    const priorityLabel =
      topic.querySelector(
        "[data-utpptl-priority-label]"
      );

    const priorityMeta =
      topic.querySelector(
        "[data-utpptl-priority-meta]"
      );

    if (priorityLabel) {
      priorityLabel.textContent =
        priority.label;
    }

    if (priorityMeta) {
      priorityMeta.textContent =
        priority.meta;
    }
  }


  /* =========================================================
     AMÉLIORATION D’UNE CARTE
     ========================================================= */

  function enhanceTopic(topic) {
    enhanceTopicState(topic);
    enhancePriority(topic);
    enhanceLastReply(topic);
  }


  /* =========================================================
     ICÔNES LUCIDE
     ========================================================= */

  function renderLucideIcons() {
    if (
      window.lucide &&
      typeof window.lucide.createIcons ===
        "function"
    ) {
      window.lucide.createIcons();
    }
  }


  /* =========================================================
     INITIALISATION D’UNE PAGE
     ========================================================= */

  function initialisePage(page) {
    const topics =
      page.querySelectorAll(
        ".utppTL_topicCard"
      );

    topics.forEach(function (topic) {
      enhanceTopic(topic);
    });
  }


  /* =========================================================
     INITIALISATION GÉNÉRALE
     ========================================================= */

  function initialiseTopicLists() {
    const pages =
      document.querySelectorAll(
        "[data-utpptl-page]"
      );

    if (!pages.length) {
      return;
    }

    pages.forEach(function (page) {
      initialisePage(page);
    });

    /*
     * Lucide est lancé après la création
     * dynamique des icônes.
     */
    renderLucideIcons();
  }


  /* =========================================================
     LANCEMENT
     ========================================================= */

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseTopicLists,
      {
        once: true
      }
    );
  } else {
    initialiseTopicLists();
  }
})();
