(function () {
  "use strict";

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function readNumber(selector) {
    const element = document.querySelector(selector);

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

  function moveActions() {
    const source = document.querySelector("#utppQE_actionSource");
    const target = document.querySelector("#utppQE_actionTarget");

    if (!source || !target) {
      return;
    }

    target.appendChild(source);
  }

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

  function hydrateStatistics() {
    const users =
      readNumber(".mod-stats-users strong") ??
      readNumber("#utppQE_nativeUsers");

    const posts =
      readNumber(".mod-stats-posts strong") ??
      readNumber("#utppQE_nativePosts");

    const topics = readNumber(".mod-stats-topics strong");

    writeNumber("#utppQE_totalUsers", users);
    writeNumber("#utppQE_totalPosts", posts);
    writeNumber("#utppQE_totalTopics", topics);

    const memberNumber = document.querySelector("#utppQE_memberNumber");

    if (memberNumber && Number.isFinite(users)) {
      memberNumber.textContent = String(users).padStart(4, "0");
    }

    return Number.isFinite(topics);
  }

  function hydrateStatisticsWhenAvailable() {
    let attempts = 0;

    const hydrate = function () {
      attempts += 1;

      const topicsFound = hydrateStatistics();

      if (!topicsFound && attempts < 40) {
        window.setTimeout(hydrate, 250);
      }
    };

    hydrate();
  }

  function isProfileLink(link) {
    try {
      return /^\/u\d+\/?$/.test(
        new URL(link.href, location.origin).pathname
      );
    } catch (error) {
      return false;
    }
  }

  function simplifyNewestUser() {
    const container = document.querySelector("#newest_user");

    if (!container) {
      return;
    }

    const profileLink = Array.from(
      container.querySelectorAll("a[href]")
    ).find(isProfileLink);

    if (profileLink) {
      container.replaceChildren(profileLink);
    }
  }

  function simplifyProfileList(selector, emptyMessage) {
    const container = document.querySelector(selector);

    if (!container) {
      return;
    }

    const profileLinks = Array.from(
      container.querySelectorAll("a[href]")
    ).filter(isProfileLink);

    if (!profileLinks.length) {
      if (!container.textContent.trim()) {
        container.textContent = emptyMessage;
      }

      return;
    }

    const fragment = document.createDocumentFragment();

    profileLinks.forEach(function (link, index) {
      if (index > 0) {
        fragment.appendChild(document.createTextNode(", "));
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

  function normalizeName(value) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function connectGroupLinks() {
    const source = document.querySelector(
      "#utppQE_groupLegendSource"
    );

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
        return normalizeName(link.textContent).includes(expectedName);
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

    source.remove();
  }

  function updatePhiladelphiaTime() {
    const metaTime = document.querySelector(
      "#utppQE_phillyTime"
    );

    const visualTime = document.querySelector(
      "#utppQE_visualTime"
    );

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
        visualTime.textContent = philadelphiaTime.replace(
          /\s[AP]M$/,
          ""
        );
      }
    };

    update();
    window.setInterval(update, 60000);
  }

  onReady(function () {
    const qeel = document.querySelector(".utppQE_qeel");

    if (!qeel || qeel.dataset.utppqeReady === "true") {
      return;
    }

    qeel.dataset.utppqeReady = "true";

    moveActions();
    hydrateStatisticsWhenAvailable();
    simplifyForumactifContent();
    connectGroupLinks();
    updatePhiladelphiaTime();
    refreshLucide();
  });
})();
