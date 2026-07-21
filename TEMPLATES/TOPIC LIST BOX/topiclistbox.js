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
   * Uniformise une chaîne :
   * — passage en minuscules ;
   * — suppression des accents.
   */
  function normalise(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }


  /**
   * Détermine l’état visuel d’un sujet à partir des
   * informations natives transmises par ForumActif.
   */
  function detectTopicState(topic) {
    const folderAlt = topic.dataset.topicFolderAlt || "";
    const folderImage = topic.dataset.topicFolderImage || "";

    const source = normalise(
      folderAlt + " " + folderImage
    );

    /*
     * L’état verrouillé est prioritaire.
     */
    if (
      /lock|locked|verrou|ferme|closed/.test(source)
    ) {
      return "locked";
    }

    /*
     * Sujet populaire.
     */
    if (
      /hot|popular|populaire|chaud|flame/.test(source)
    ) {
      return "hot";
    }

    /*
     * Sujet contenant un nouveau message.
     */
    if (
      /unread|new|nouveau|nouveaux|non[-_ ]?lu/.test(source)
    ) {
      return "new";
    }

    /*
     * État par défaut.
     */
    return "read";
  }


  /**
   * Détermine le type d’annonce ou de note.
   */
  function detectPriority(topic) {
    const folderAlt =
      topic.dataset.topicFolderAlt || "";

    const source = normalise(folderAlt);

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
     LIEN DU DERNIER MESSAGE
     ========================================================= */

  /**
   * LAST_POST_IMG contient le véritable lien vers le dernier
   * message. Le template le conserve dans un élément masqué.
   *
   * Cette fonction récupère ce lien pour l’appliquer à toute
   * la zone du dernier message.
   */
  function enhanceLastReply(topic) {
    const nativeLastPostLink =
      topic.querySelector(
        ".utppTL_nativeLastPost a"
      );

    const lastReplyLink =
      topic.querySelector(
        ".utppTL_lastReply"
      );

    if (
      nativeLastPostLink &&
      lastReplyLink &&
      nativeLastPostLink.href
    ) {
      lastReplyLink.href =
        nativeLastPostLink.href;
    }
  }


  /* =========================================================
     AMÉLIORATION D’UN SUJET
     ========================================================= */

  function enhanceTopic(topic) {
    const stateName =
      detectTopicState(topic);

    const state =
      TOPIC_STATES[stateName];

    const stateElement =
      topic.querySelector(
        ".utppTL_topicState"
      );

    /*
     * Inscrit l’état détecté sur la carte.
     *
     * Résultat possible :
     *
     * data-topic-state="new"
     * data-topic-state="read"
     * data-topic-state="hot"
     * data-topic-state="locked"
     */
    topic.dataset.topicState =
      stateName;

    /*
     * Création de l’icône Lucide.
     */
    if (stateElement) {
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

    /*
     * Les informations de priorité sont appliquées
     * uniquement aux annonces et aux notes.
     */
    if (
      topic.closest(
        ".utppTL_featuredGrid"
      )
    ) {
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

    /*
     * Application du véritable lien du dernier message.
     */
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

    /*
     * Le script s’arrête silencieusement lorsqu’il ne se trouve
     * pas sur une page contenant une liste de sujets.
     */
    if (!pages.length) {
      return;
    }

    pages.forEach(function (page) {
      initialisePage(page);
    });

    /*
     * Lucide est lancé après la création dynamique
     * de toutes les icônes.
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
