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
   * Uniformise une valeur :
   * — passage en minuscules ;
   * — suppression des accents.
   */
  function normalise(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }


  /* =========================================================
     DÉTECTION DE L’ÉTAT DU SUJET
     ========================================================= */

  /**
   * Détermine l’état du sujet grâce aux informations
   * natives fournies par ForumActif.
   */
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
     *
     * Un sujet peut être à la fois nouveau et verrouillé :
     * dans ce cas, on conserve visuellement le verrou.
     */
    if (
      /lock|locked|verrou|verrouille|ferme|closed/.test(
        source
      )
    ) {
      return "locked";
    }

    /*
     * Sujet populaire ou actif.
     */
    if (
      /hot|popular|populaire|chaud|flame/.test(
        source
      )
    ) {
      return "hot";
    }

    /*
     * Sujet contenant un nouveau message.
     */
    if (
      /unread|new|nouveau|nouveaux|non[-_ ]?lu/.test(
        source
      )
    ) {
      return "new";
    }

    /*
     * État par défaut : sujet déjà lu.
     */
    return "read";
  }


  /* =========================================================
     DÉTECTION DES ANNONCES ET NOTES
     ========================================================= */

  /**
   * Détermine la nature d’une transmission prioritaire :
   * — annonce globale ;
   * — annonce ;
   * — note ;
   * — autre sujet prioritaire.
   */
  function detectPriority(topic) {
    const folderAlt =
      topic.dataset.topicFolderAlt || "";

    const folderImage =
      topic.dataset.topicFolderImage || "";

    const source = normalise(
      folderAlt + " " + folderImage
    );

    if (
      /global/.test(source)
    ) {
      return {
        label: "Annonce globale",
        meta: "Priorité absolue"
      };
    }

    if (
      /announce|annonce/.test(source)
    ) {
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

  /**
   * ForumActif génère le véritable lien vers le dernier message
   * dans la variable LAST_POST_IMG.
   *
   * Le template conserve ce lien dans :
   *
   * .utppTL_nativeLastPost
   *
   * Cette fonction récupère son adresse et l’applique uniquement
   * à la flèche :
   *
   * .utppTL_lastReplyGo
   *
   * Le conteneur .utppTL_lastReply reste volontairement un div,
   * afin d’éviter d’imbriquer plusieurs liens HTML.
   */
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
      nativeLastPostLink.getAttribute("href");

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

  /**
   * Crée l’icône Lucide correspondant à l’état détecté.
   */
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

    /*
     * L’état est enregistré sur la carte pour le CSS :
     *
     * data-topic-state="new"
     * data-topic-state="read"
     * data-topic-state="hot"
     * data-topic-state="locked"
     */
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
     INFORMATIONS DES TRANSMISSIONS PRIORITAIRES
     ========================================================= */

  function enhancePriority(topic) {
    /*
     * Cette fonction ne concerne que les cartes présentes
     * dans la section des annonces et notes.
     */
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

    /*
     * Le script s’arrête silencieusement s’il n’est pas
     * exécuté sur une liste de sujets.
     */
    if (!pages.length) {
      return;
    }

    pages.forEach(function (page) {
      initialisePage(page);
    });

    /*
     * Lucide doit intervenir après l’insertion dynamique
     * des icônes d’état.
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
