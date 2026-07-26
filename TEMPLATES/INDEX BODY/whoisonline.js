(function () {
  "use strict";

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, {
        once: true
      });
      return;
    }

    callback();
  }

  function readNumber(selector, root) {
    const searchRoot = root || document;
    const element = searchRoot.querySelector(selector);

    if (!element) {
      return null;
    }

    const digits = element.textContent.replace(/[^\d]/g, "");

    return digits ? Number(digits) : null;
  }

  function writeNumber(selector, value) {
    const element = document.querySelector(selector);

    if (!element || !Number.isFinite(value)) {
      return;
    }

    element.textContent = new Intl.NumberFormat("fr-FR").format(value);
  }

  /*
   * Répare la structure lorsque Forumactif sort certains blocs
   * de leur colonne d'origine.
   */
  function repairStructure() {
    const layout = document.querySelector(".utppQE_layout");
    const left = document.querySelector(".utppQE_left");
    const center = document.querySelector(".utppQE_center");
    const right = document.querySelector(".utppQE_right");

    if (!layout || !left || !center || !right) {
      return false;
    }

    const centerChildren = [
      document.querySelector("#utppQE_actionTarget"),
      document.querySelector(".utppQE_cityVisual"),
      document.querySelector(".utppQE_groups")
    ];

    centerChildren.forEach(function (element) {
      if (element) {
        center.appendChild(element);
      }
    });

    /*
     * On replace ensuite les trois colonnes dans le bon ordre.
     * appendChild déplace les éléments sans les dupliquer.
     */
    [left, center, right].forEach(function (element) {
      layout.appendChild(element);
    });

    return true;
  }

  /*
   * Crée une carte de groupe complète.
   */
  function createGroupCard(group) {
    const card = document.createElement("a");
    const number = document.createElement("span");
    const title = document.createElement("strong");
    const description = document.createElement("i");

    card.className =
      "utppQE_group utppQE_group--" + group.modifier;

    card.dataset.utppqeGroup = group.key;
    card.href = "/groups";

    number.textContent = group.number;
    title.textContent = group.title;
    description.textContent = group.description;

    card.appendChild(number);
    card.appendChild(title);
    card.appendChild(description);

    return card;
  }

  /*
   * Forumactif peut conserver le texte des groupes tout en supprimant
   * leurs balises et leurs classes. Dans ce cas, on les reconstruit.
   */
  function ensureGroupCards() {
    const container = document.querySelector(".utppQE_groups");

    if (!container) {
      return false;
    }

    const currentCards =
      container.querySelectorAll(".utppQE_group");

    if (currentCards.length === 4) {
      return true;
    }

    const groups = [
      {
        modifier: "one",
        key: "citadins",
        number: "01",
        title: "Citadins",
        description: "Ceux qui ont encore une adresse."
      },
      {
        modifier: "two",
        key: "furtifs",
        number: "02",
        title: "Furtifs",
        description: "Ceux que personne ne voit venir."
      },
      {
        modifier: "three",
        key: "vagabonds",
        number: "03",
        title: "Vagabonds",
        description: "Ceux que la route refuse de garder."
      },
      {
        modifier: "four",
        key: "autorites",
        number: "04",
        title: "Autorités",
        description: "Ceux qui prétendent tenir les murs."
      }
    ];

    const fragment = document.createDocumentFragment();

    groups.forEach(function (group) {
      fragment.appendChild(createGroupCard(group));
    });

    container.replaceChildren(fragment);

    return true;
  }

  /*
   * Déplace les liens Forumactif dans la barre située
   * au-dessus de l'image centrale.
   */
  function moveActions() {
    const source =
      document.querySelector("#utppQE_actionSource");

    const target =
      document.querySelector("#utppQE_actionTarget");

    if (!source || !target) {
      return;
    }

    target.appendChild(source);
  }

  /*
   * Relance Lucide lorsque la bibliothèque est disponible.
   */
  function refreshLucide() {
    let attempts = 0;

    const render = function () {
      attempts += 1;

      if (
        window.lucide &&
        typeof window.lucide.createIcons === "function"
      ) {
        window.lucide.createIcons();
        return;
      }

      if (attempts < 20) {
        window.setTimeout(render, 250);
      }
    };

    render();
  }

  /*
   * Récupération des statistiques Forumactif.
   */
  function getStatistics(root) {
    const searchRoot = root || document;

    const users =
      readNumber(".mod-stats-users strong", searchRoot) ??
      readNumber("#utppQE_nativeUsers", searchRoot);

    const posts =
      readNumber(".mod-stats-posts strong", searchRoot) ??
      readNumber("#utppQE_nativePosts", searchRoot);

    const topics =
      readNumber(".mod-stats-topics strong", searchRoot);

    return {
      users: users,
      posts: posts,
      topics: topics
    };
  }

  function displayStatistics(statistics) {
    const users = statistics.users;
    const posts = statistics.posts;
    const topics = statistics.topics;

    writeNumber("#utppQE_totalUsers", users);
    writeNumber("#utppQE_totalPosts", posts);
    writeNumber("#utppQE_totalTopics", topics);

    const memberNumber =
      document.querySelector("#utppQE_memberNumber");

    if (memberNumber && Number.isFinite(users)) {
      memberNumber.textContent =
        String(users).padStart(4, "0");
    }

    return Number.isFinite(topics);
  }

  /*
   * Si le widget n'est pas encore présent dans le DOM courant,
   * on analyse également le HTML brut de l'accueil.
   */
  async function fetchStatisticsFromRawIndex() {
    try {
      const response = await fetch("/", {
        credentials: "same-origin",
        cache: "no-store"
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();

      const rawDocument =
        new DOMParser().parseFromString(html, "text/html");

      return getStatistics(rawDocument);
    } catch (error) {
      return null;
    }
  }

  async function hydrateStatisticsWhenAvailable() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const currentStatistics = getStatistics(document);

      if (displayStatistics(currentStatistics)) {
        return;
      }

      if (attempt === 0 || attempt === 10) {
        const fetchedStatistics =
          await fetchStatisticsFromRawIndex();

        if (
          fetchedStatistics &&
          displayStatistics(fetchedStatistics)
        ) {
          return;
        }
      }

      await new Promise(function (resolve) {
        window.setTimeout(resolve, 500);
      });
    }
  }

  /*
   * Vérifie qu'un lien conduit bien vers un profil Forumactif.
   */
  function isProfileLink(link) {
    try {
      const url = new URL(link.href, location.origin);

      return /^\/u\d+\/?$/.test(url.pathname);
    } catch (error) {
      return false;
    }
  }

  /*
   * Nettoie la variable du dernier membre pour ne garder
   * que le lien vers son profil.
   */
  function simplifyNewestUser() {
    const container =
      document.querySelector("#newest_user");

    if (!container) {
      return;
    }

    const profileLink = Array
      .from(container.querySelectorAll("a[href]"))
      .find(isProfileLink);

    if (profileLink) {
      container.replaceChildren(profileLink);
    }
  }

  /*
   * Nettoie les listes de membres générées par Forumactif.
   */
  function simplifyProfileList(selector, emptyMessage) {
    const container = document.querySelector(selector);

    if (!container) {
      return;
    }

    const profileLinks = Array
      .from(container.querySelectorAll("a[href]"))
      .filter(isProfileLink);

    if (!profileLinks.length) {
      if (!container.textContent.trim()) {
        container.textContent = emptyMessage;
      }

      return;
    }

    const fragment = document.createDocumentFragment();

    profileLinks.forEach(function (link, index) {
      if (index > 0) {
        fragment.appendChild(
          document.createTextNode(", ")
        );
      }

      fragment.appendChild(link);
    });

    container.replaceChildren(fragment);
  }

  function simplifyForumactifContent() {
    simplifyNewestUser();

    simplifyProfileList(
      "#logged_in_user_list",
      "La ville semble déserte."
    );

    simplifyProfileList(
      ".utppQE_recentNames",
      "Aucun passage enregistré récemment."
    );
  }

  /*
   * Uniformise les noms des groupes afin de pouvoir comparer :
   * "Autorités" et "autorites", par exemple.
   */
  function normalizeName(value) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  /*
   * Relie les cartes recréées aux véritables groupes Forumactif.
   */
  function connectGroupLinks() {
    const source =
      document.querySelector("#utppQE_groupLegendSource");

    if (!source) {
      return;
    }

    const legendLinks = Array.from(
      source.querySelectorAll("a[href]")
    );

    const cards = document.querySelectorAll(
      "[data-utppqe-group]"
    );

    cards.forEach(function (card) {
      const expectedName = normalizeName(
        card.dataset.utppqeGroup || ""
      );

      const matchingLink = legendLinks.find(function (link) {
        const linkName = normalizeName(link.textContent);

        return linkName.includes(expectedName);
      });

      if (!matchingLink) {
        card.setAttribute("aria-disabled", "true");
        return;
      }

      card.href = matchingLink.href;
      card.removeAttribute("aria-disabled");

      const coloredElement =
        matchingLink.querySelector("[style*='color']") ||
        matchingLink;

      const groupColor =
        coloredElement.style.color ||
        window.getComputedStyle(coloredElement).color;

      if (groupColor) {
        card.style.setProperty(
          "--utppQE_groupColor",
          groupColor
        );
      }
    });

    /*
     * La légende native n'est plus nécessaire une fois
     * les véritables liens récupérés.
     */
    source.remove();
  }

  /*
   * Heure réelle de Philadelphie.
   */
  function updatePhiladelphiaTime() {
    const metaTime =
      document.querySelector("#utppQE_phillyTime");

    const visualTime =
      document.querySelector("#utppQE_visualTime");

    if (!metaTime && !visualTime) {
      return;
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const update = function () {
      const philadelphiaTime = formatter
        .format(new Date())
        .replace(/\s/g, " ")
        .toUpperCase();

      if (metaTime) {
        metaTime.textContent =
          "Philadelphie, " + philadelphiaTime;
      }

      if (visualTime) {
        visualTime.textContent =
          philadelphiaTime.replace(/\s[AP]M$/, "");
      }
    };

    update();

    window.setInterval(update, 60000);
  }

  /*
   * Image de secours si Pinterest refuse l'affichage externe.
   */
  function secureCityImage() {
    const image =
      document.querySelector(".utppQE_cityVisual > img");

    if (!image) {
      return;
    }

    const fallback =
      "https://placehold.co/520x260/5b2b20/d8cbc4" +
      "?text=Philadelphia";

    const useFallback = function () {
      if (image.src === fallback) {
        return;
      }

      image.src = fallback;
    };

    image.addEventListener("error", useFallback, {
      once: true
    });

    if (image.complete && image.naturalWidth === 0) {
      useFallback();
    }
  }

  /*
   * Initialisation générale du QEEL.
   */
  onReady(function () {
    const qeel =
      document.querySelector(".utppQE_qeel");

    if (
      !qeel ||
      qeel.dataset.utppqeReady === "true"
    ) {
      return;
    }

    qeel.dataset.utppqeReady = "true";

    /*
     * L'ordre est important :
     * 1. réparation du DOM ;
     * 2. reconstruction des groupes ;
     * 3. déplacement et hydratation du contenu.
     */
    repairStructure();
    ensureGroupCards();
    moveActions();
    hydrateStatisticsWhenAvailable();
    simplifyForumactifContent();
    connectGroupLinks();
    updatePhiladelphiaTime();
    secureCityImage();
    refreshLucide();
  });
})();
