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

  /**
   * Uniformise une chaîne afin de faciliter la détection :
   * - passage en minuscules ;
   * - suppression des accents.
   */
  function normalise(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }


  /**
   * Détermine l’état visuel d’un sujet grâce :
   * - au texte alternatif de son icône ForumActif ;
   * - à l’adresse de son image de dossier.
   */
  function detectTopicState(topic) {
    const folderAlt = topic.dataset.topicFolderAlt || "";
    const folderImage = topic.dataset.topicFolderImage || "";

    const source = normalise(folderAlt + " " + folderImage);

    /*
     * L’état verrouillé est testé en premier :
     * une icône peut représenter un sujet nouveau ET verrouillé.
     */
    if (/lock|locked|verrou|ferme|closed/.test(source)) {
      return "locked";
    }

    /*
     * Puis les sujets populaires.
     */
    if (/hot|popular|populaire|chaud|flame/.test(source)) {
      return "hot";
    }

    /*
     * Puis les sujets contenant de nouveaux messages.
     */
    if (/unread|new|nouveau|nouveaux|non[-_ ]?lu/.test(source)) {
      return "new";
    }

    return "read";
  }


  /**
   * Détermine la nature d’une transmission prioritaire.
   */
  function detectPriority(topic) {
    const source = normalise(topic.dataset.topicFolderAlt || "");

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

    if (/sticky|post[-_ ]?it|note/.test(source)) {
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
     DERNIER MESSAGE
     ========================================================= */

  /**
   * ForumActif fournit le véritable lien du dernier message dans
   * LAST_POST_IMG. Celui-ci est conservé dans .utppTL_nativeLastPost,
   * puis transféré sur toute la carte du dernier message.
   */
  function enhanceLastReply(topic) {
    const nativeLastPostLink = topic.querySelector(
      ".utppTL_nativeLastPost a"
    );

    const lastReplyLink = topic.querySelector(
      ".utppTL_lastReply"
    );

    if (
      nativeLastPostLink &&
      lastReplyLink &&
      nativeLastPostLink.href
    ) {
      lastReplyLink.href = nativeLastPostLink.href;
    }
  }


  /* =========================================================
     ÉTAT D’UN SUJET
     ========================================================= */

  function enhanceTopic(topic) {
    const stateName = detectTopicState(topic);
    const state = TOPIC_STATES[stateName];

    const stateElement = topic.querySelector(
      ".utppTL_topicState"
    );

    /*
     * Enregistre l’état détecté sur la carte.
     * Le CSS peut ensuite utiliser :
     *
     * [data-topic-state="new"]
     * [data-topic-state="read"]
     * [data-topic-state="hot"]
     * [data-topic-state="locked"]
     */
    topic.dataset.topicState = stateName;

    /*
     * Remplace visuellement l’image native par une icône Lucide.
     */
    if (stateElement) {
      stateElement.innerHTML =
        '<i data-lucide="' + state.icon + '"></i>';

      stateElement.setAttribute(
        "aria-label",
        state.label
      );

      stateElement.setAttribute(
        "title",
        state.label
      );

      stateElement.removeAttribute("aria-hidden");
    }

    /*
     * Les informations de priorité ne concernent que les cartes
     * placées dans la section des annonces et notes.
     */
    if (topic.closest(".utppTL_featuredGrid")) {
      const priority = detectPriority(topic);

      const priorityLabel = topic.querySelector(
        "[data-utpptl-priority-label]"
      );

      const priorityMeta = topic.querySelector(
        "[data-utpptl-priority-meta]"
      );

      if (priorityLabel) {
        priorityLabel.textContent = priority.label;
      }

      if (priorityMeta) {
        priorityMeta.textContent = priority.meta;
      }
    }

    enhanceLastReply(topic);
  }


  /* =========================================================
     SECTIONS VIDES
     ========================================================= */

  /**
   * Masque automatiquement une section lorsqu’elle ne contient
   * ni sujet ni message « aucun sujet ».
   */
  function cleanEmptySections(page) {
    const sections = page.querySelectorAll(
      "[data-utpptl-section]"
    );

    sections.forEach(function (section) {
      const hasTopic = section.querySelector(
        ".utppTL_topicCard"
      );

      const hasEmptyMessage = section.querySelector(
        ".utppTL_noTopics"
      );

      if (!hasTopic && !hasEmptyMessage) {
        section.hidden = true;
      }
    });
  }


  /* =========================================================
     ICÔNES LUCIDE
     ========================================================= */

  function renderLucideIcons() {
    if (
      window.lucide &&
      typeof window.lucide.createIcons === "function"
    ) {
      window.lucide.createIcons();
    }
  }


  /* =========================================================
     INITIALISATION D’UNE PAGE
     ========================================================= */

  function initialisePage(page) {
    const topics = page.querySelectorAll(
      ".utppTL_topicCard"
    );

    topics.forEach(function (topic) {
      enhanceTopic(topic);
    });

    cleanEmptySections(page);
  }


  /* =========================================================
     INITIALISATION GÉNÉRALE
     ========================================================= */

  function initialiseTopicLists() {
    const pages = document.querySelectorAll(
      "[data-utpptl-page]"
    );

    if (!pages.length) {
      return;
    }

    pages.forEach(function (page) {
      initialisePage(page);
    });

    /*
     * Lucide est lancé après la création dynamique de toutes
     * les icônes d’état.
     */
    renderLucideIcons();
  }


  /* =========================================================
     LANCEMENT
     ========================================================= */

  if (document.readyState === "loading") {
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
