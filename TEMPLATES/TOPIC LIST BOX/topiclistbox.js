(function () {
  "use strict";

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

  /*
   * Indique si un sujet doit rejoindre la section
   * « Transmissions prioritaires ».
   *
   * La séparation principale est effectuée grâce au marqueur produit
   * par BEGIN table_sticky. Cette fonction sert uniquement de secours
   * si ForumActif retire ou déplace ce marqueur.
   */
  function isPriorityTopic(topic) {
    const folderAlt = topic.getAttribute("data-topic-folder-alt") || "";
    const folderImage = topic.getAttribute("data-topic-folder-image") || "";
    const combinedValue = (folderAlt + " " + folderImage).toLowerCase();

    return /annonce|announce|global|note|sticky|post[\s_-]?it/.test(
      combinedValue
    );
  }

  /*
   * Répartit les sujets produits par ForumActif entre :
   *
   * - les annonces et notes ;
   * - les sujets ordinaires.
   *
   * Les cartes sont d’abord générées dans un conteneur neutre.
   * Le marqueur table_sticky indique le passage des annonces
   * aux sujets ordinaires.
   */
  function organiseTopicCards(page) {
    const featuredTarget = page.querySelector(
      "[data-utpptl-featured-target]"
    );

    const topicsTarget = page.querySelector(
      "[data-utpptl-topics-target]"
    );

    const featuredSection = featuredTarget
      ? featuredTarget.closest(".utppTL_featuredSection")
      : null;

    const topicsSection = topicsTarget
      ? topicsTarget.closest(".utppTL_topicsSection")
      : null;

    const sources = page.querySelectorAll(
      "[data-utpptl-topic-source]"
    );

    if (!featuredTarget || !topicsTarget || !sources.length) {
      return;
    }

    sources.forEach(function (source) {
      const children = Array.from(source.children);
      const hasBoundary = children.some(function (child) {
        return child.matches("[data-utpptl-sticky-boundary]");
      });

      let ordinaryTopicsStarted = !hasBoundary;

      children.forEach(function (child) {
        if (child.matches("[data-utpptl-sticky-boundary]")) {
          ordinaryTopicsStarted = true;
          child.remove();
          return;
        }

        if (child.matches(".utppTL_noTopics")) {
          topicsTarget.appendChild(child);
          return;
        }

        if (!child.matches("[data-topic-state]")) {
          return;
        }

        /*
         * Si le marqueur table_sticky existe, sa position détermine
         * directement la destination de la carte.
         */
        if (hasBoundary) {
          if (ordinaryTopicsStarted) {
            topicsTarget.appendChild(child);
          } else {
            featuredTarget.appendChild(child);
          }

          return;
        }

        /*
         * Solution de secours si ForumActif a supprimé le marqueur.
         */
        if (isPriorityTopic(child)) {
          featuredTarget.appendChild(child);
        } else {
          topicsTarget.appendChild(child);
        }
      });

      source.remove();
    });

    if (featuredSection) {
      featuredSection.hidden =
        featuredTarget.querySelectorAll("[data-topic-state]").length === 0;
    }

    if (topicsSection) {
      const topicCount =
        topicsTarget.querySelectorAll("[data-topic-state]").length;

      const emptyMessage = topicsTarget.querySelector(".utppTL_noTopics");

      topicsSection.hidden = topicCount === 0 && !emptyMessage;
    }
  }

  /*
   * Détermine l’état visuel du sujet à partir des informations
   * transmises par ForumActif.
   */
  function detectTopicState(topic) {
    const declaredState = topic.getAttribute("data-topic-state");

    if (
      declaredState &&
      Object.prototype.hasOwnProperty.call(TOPIC_STATES, declaredState)
    ) {
      return declaredState;
    }

    const folderAlt = topic.getAttribute("data-topic-folder-alt") || "";
    const folderImage = topic.getAttribute("data-topic-folder-image") || "";

    const stateSource = (
      folderAlt +
      " " +
      folderImage
    ).toLowerCase();

    if (
      /lock|locked|verrou|verrouill|clos|closed/.test(stateSource)
    ) {
      return "locked";
    }

    if (
      /hot|popular|populaire|chaud/.test(stateSource)
    ) {
      return "hot";
    }

    if (
      /new|nouveau|nouveaux|unread|non[\s_-]?lu/.test(stateSource)
    ) {
      return "new";
    }

    return "read";
  }

  /*
   * Installe l’icône correspondant à l’état de chaque sujet.
   */
  function enhanceTopicStates(page) {
    const topics = page.querySelectorAll("[data-topic-state]");

    topics.forEach(function (topic) {
      const stateName = detectTopicState(topic);
      const state = TOPIC_STATES[stateName] || TOPIC_STATES.read;
      const stateElement = topic.querySelector(".utppTL_topicState");

      topic.setAttribute("data-topic-state", stateName);

      if (!stateElement) {
        return;
      }

      stateElement.innerHTML =
        '<i data-lucide="' + state.icon + '"></i>';

      stateElement.setAttribute("aria-label", state.label);
      stateElement.setAttribute("title", state.label);
      stateElement.removeAttribute("aria-hidden");
    });
  }

  /*
   * Personnalise le libellé supérieur des annonces et des notes.
   */
  function enhancePriorityTopics(page) {
    const featuredTopics = page.querySelectorAll(
      ".utppTL_featuredGrid [data-topic-state]"
    );

    featuredTopics.forEach(function (topic, index) {
      const label = topic.querySelector(".utppTL_featuredLabel");
      const transmission = topic.querySelector(
        ".utppTL_featuredBody > small"
      );

      const folderAlt = (
        topic.getAttribute("data-topic-folder-alt") || ""
      ).toLowerCase();

      if (label) {
        const labelTitle = label.querySelector("span");
        const labelSubtitle = label.querySelector("i");

        if (labelTitle) {
          if (/global/.test(folderAlt)) {
            labelTitle.textContent = "Annonce globale";
          } else if (/note|sticky|post[\s_-]?it/.test(folderAlt)) {
            labelTitle.textContent = "Note du forum";
          } else {
            labelTitle.textContent = "Transmission prioritaire";
          }
        }

        if (labelSubtitle) {
          if (topic.dataset.topicState === "locked") {
            labelSubtitle.textContent = "À conserver";
          } else if (/global/.test(folderAlt)) {
            labelSubtitle.textContent = "Priorité absolue";
          } else {
            labelSubtitle.textContent = "À consulter";
          }
        }
      }

      if (transmission) {
        const number = String(index + 1).padStart(3, "0");

        transmission.textContent =
          "Transmission " + number + " · forum";
      }
    });
  }

  /*
   * Rend toute la zone « dernier message » accessible sans produire
   * de lien imbriqué, ce qui serait invalide lorsque ForumActif ajoute
   * déjà un lien autour du nom du membre.
   */
  function enhanceLastReplies(page) {
    const replies = page.querySelectorAll(".utppTL_lastReply");

    replies.forEach(function (reply) {
      const destination = reply.querySelector(".utppTL_lastReplyGo");

      if (!destination) {
        return;
      }

      const href = destination.getAttribute("href");

      if (!href || href === "#") {
        return;
      }

      reply.setAttribute("role", "link");
      reply.setAttribute("tabindex", "0");
      reply.setAttribute("data-last-reply-url", href);

      reply.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          return;
        }

        window.location.href = href;
      });

      reply.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        if (event.target.closest("a")) {
          return;
        }

        event.preventDefault();
        window.location.href = href;
      });
    });
  }

  /*
   * Lance Lucide uniquement si la bibliothèque est bien disponible.
   */
  function renderLucideIcons() {
    if (
      window.lucide &&
      typeof window.lucide.createIcons === "function"
    ) {
      window.lucide.createIcons();
    }
  }

  function initialisePage(page) {
    organiseTopicCards(page);
    enhanceTopicStates(page);
    enhancePriorityTopics(page);
    enhanceLastReplies(page);
    renderLucideIcons();
  }

  function initTopicList() {
    const pages = document.querySelectorAll(".utppTL_page");

    if (!pages.length) {
      return;
    }

    pages.forEach(function (page) {
      initialisePage(page);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTopicList, {
      once: true
    });
  } else {
    initTopicList();
  }
})();
