(() => {

  const NAVBAR_SELECTOR = ".utpp-headerNavbar";
  const GENERATED_SELECTOR = ".utpp-navigBar";


  /* ==========================================================================
     UTILITAIRES
     ========================================================================== */

  const normalize = (value) => {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  };


  const getPath = (link) => {
    const rawHref = link?.getAttribute("href") || "";

    try {
      const url = new URL(rawHref, window.location.origin);
      return `${url.pathname}${url.search}`.toLowerCase();
    } catch (e) {
      return rawHref.toLowerCase();
    }
  };


  const getCleanLabel = (element) => {
    if (!element) return "";

    const img = element.querySelector?.("img");

    return (
      element.getAttribute?.("title") ||
      img?.getAttribute("alt") ||
      element.textContent ||
      ""
    )
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };


  const normalizePath = (href) => {
    try {
      const url = new URL(href, window.location.origin);
      return url.pathname.toLowerCase();
    } catch (e) {
      return String(href || "").toLowerCase();
    }
  };


  const isHomePath = (path) => {
    return (
      path === "/" ||
      path === "/forum" ||
      path === "/forum.htm"
    );
  };


  /* ==========================================================================
     PROFIL
     ========================================================================== */

  const createProfile = () => {

    const data = window._userdata || {};

    const loggedIn =
      Number(data.session_logged_in) === 1;

    const userId =
      Number(data.user_id);

    const username =
      loggedIn && data.username
        ? data.username
        : "Invité";


    const profile =
      document.createElement("a");

    profile.className =
      "utpp-navProfile";

    profile.href =
      loggedIn && userId > 0
        ? `/u${userId}`
        : "/login";

    profile.setAttribute(
      "aria-label",
      loggedIn
        ? `Profil de ${username}`
        : "Connexion"
    );


    const avatar =
      document.createElement("span");

    avatar.className =
      "utpp-navProfileAvatar";


    if (loggedIn && data.avatar) {

      avatar.innerHTML =
        data.avatar;

    } else {

      const fallback =
        document.createElement("span");

      fallback.className =
        "utpp-navProfileFallback";

      fallback.textContent =
        "?";

      avatar.appendChild(
        fallback
      );

    }


    const openBracket =
      document.createElement("span");

    openBracket.className =
      "utpp-navProfileBracket";

    openBracket.textContent =
      "[";


    const name =
      document.createElement("span");

    name.className =
      "utpp-navProfileName";

    name.textContent =
      username;


    const closeBracket =
      document.createElement("span");

    closeBracket.className =
      "utpp-navProfileBracket";

    closeBracket.textContent =
      "]";


    profile.append(
      avatar,
      openBracket,
      name,
      closeBracket
    );


    return profile;
  };


  /* ==========================================================================
     RENOMMAGE
     ========================================================================== */

  const renameLink = (link) => {

    const rawHref =
      (link.getAttribute("href") || "")
        .toLowerCase();

    const href =
      getPath(link);

    const original =
      getCleanLabel(link);

    const text =
      normalize(original);


    let finalLabel =
      original;


    if (
      href === "/" ||
      href === "/forum" ||
      href === "/forum.htm" ||
      text === "accueil"
    ) {
      finalLabel =
        "home sweet home";
    }

    else if (
      href.startsWith("/memberlist") ||
      text === "membres"
    ) {
      finalLabel =
        "les habitants de philadelphie";
    }

    else if (
      href.startsWith("/profile") ||
      text === "profil"
    ) {
      finalLabel =
        "modifier son profil";
    }

    else if (
      href.startsWith("/privmsg") ||
      text === "messagerie"
    ) {
      finalLabel =
        "boîte aux lettres";
    }

    else if (
      rawHref.includes("logout=1") ||
      text.includes("déconnexion") ||
      text.includes("deconnexion")
    ) {
      finalLabel =
        "à la revoyure";
    }

    else if (
      href.startsWith("/groups") ||
      text === "groupes"
    ) {
      finalLabel =
        "groupes";
    }


    link.textContent =
      finalLabel;

    link.setAttribute(
      "title",
      finalLabel
    );

    link.setAttribute(
      "aria-label",
      finalLabel
    );

  };


  /* ==========================================================================
     ÉTAT ACTIF
     ========================================================================== */

  const setActiveLink = (link) => {

    const currentPath =
      window.location.pathname
        .toLowerCase();

    const linkPath =
      normalizePath(
        link.getAttribute("href")
      );


    const active =
      linkPath === currentPath ||

      (
        isHomePath(currentPath) &&
        isHomePath(linkPath)
      ) ||

      (
        currentPath.startsWith("/privmsg") &&
        linkPath.startsWith("/privmsg")
      ) ||

      (
        currentPath.startsWith("/profile") &&
        linkPath.startsWith("/profile")
      ) ||

      (
        currentPath.startsWith("/memberlist") &&
        linkPath.startsWith("/memberlist")
      ) ||

      (
        currentPath.startsWith("/groups") &&
        linkPath.startsWith("/groups")
      );


    link.classList.toggle(
      "utpp-activeLink",
      active
    );


    return active;
  };


  /* ==========================================================================
     SUJET COURANT
     ========================================================================== */

  const isTopicPage = () => {

    const path =
      window.location.pathname
        .toLowerCase();

    return /^\/t\d+(p\d+)?(?:-|$)/.test(path);
  };


  const getTopicTitle = () => {

    const selectors = [
      "h1.page-title",
      ".topic-title h1",
      ".topic-title",
      "h1"
    ];


    for (const selector of selectors) {

      const element =
        document.querySelector(selector);

      const text =
        getCleanLabel(element);

      if (text) {
        return text;
      }

    }


    return document.title
      .replace(/\s[-–—]\s.*$/, "")
      .replace(/\s+/g, " ")
      .trim();
  };


  const createContextLink = () => {

    if (!isTopicPage()) {
      return null;
    }


    const topicTitle =
      getTopicTitle();

    if (!topicTitle) {
      return null;
    }


    const context =
      document.createElement("a");

    context.className =
      "utpp-contextLink";

    context.href =
      window.location.href;

    context.textContent =
      topicTitle;

    context.setAttribute(
      "title",
      topicTitle
    );

    context.setAttribute(
      "aria-current",
      "page"
    );

    context.setAttribute(
      "aria-label",
      `Sujet actuel : ${topicTitle}`
    );


    return context;
  };


  /* ==========================================================================
     GROUPE DE NAVIGATION
     ========================================================================== */

  const createNavGroup = (
    label,
    links
  ) => {

    if (!links.length) {
      return null;
    }


    const group =
      document.createElement("div");

    group.className =
      "utpp-navGroup";


    const toggle =
      document.createElement("button");

    toggle.className =
      "utpp-navGroup-toggle";

    toggle.type =
      "button";

    toggle.setAttribute(
      "aria-expanded",
      "false"
    );


    const text =
      document.createElement("span");

    text.textContent =
      label;


    const icon =
      document.createElement("i");

    icon.setAttribute(
      "data-lucide",
      "chevron-down"
    );


    const panel =
      document.createElement("div");

    panel.className =
      "utpp-navGroup-panel";


    let containsActive =
      false;


    links.forEach((link) => {

      if (
        link.classList.contains(
          "utpp-activeLink"
        )
      ) {
        containsActive = true;
      }

      panel.appendChild(
        link
      );

    });


    if (containsActive) {
      group.classList.add(
        "has-active"
      );
    }


    toggle.append(
      text,
      icon
    );

    group.append(
      toggle,
      panel
    );


    return group;
  };


  /* ==========================================================================
     RECONSTRUIRE LA NAVIGATION
     ========================================================================== */

  const buildNavigation = (
    generated,
    searchTool
  ) => {

    if (
      generated.dataset
        .utppNavigationBuilt ===
        "true"
    ) {
      return;
    }


    const links =
      Array.from(
        generated.querySelectorAll(
          "a.mainmenu"
        )
      );


    if (!links.length) {
      return;
    }


    const homeLinks = [];
    const cityLinks = [];
    const accountLinks = [];
    const logoutLinks = [];
    const otherLinks = [];


    let searchHref =
      "/search";


    const ignoredPrefixes = [
      "/calendar",
      "/gallery",
      "/images",
      "/discover",
      "/faq"
    ];


    links.forEach((link) => {

      renameLink(link);
      setActiveLink(link);


      const href =
        getPath(link);

      const rawHref =
        (link.getAttribute("href") || "")
          .toLowerCase();

      const text =
        normalize(
          getCleanLabel(link)
        );


      if (
        ignoredPrefixes.some(
          prefix =>
            href.startsWith(prefix)
        )
      ) {
        return;
      }


      if (
        href.startsWith("/search")
      ) {

        searchHref =
          link.getAttribute("href") ||
          "/search";

        return;
      }


      if (
        isHomePath(
          normalizePath(
            link.getAttribute("href")
          )
        ) ||
        text === "home sweet home"
      ) {

        homeLinks.push(
          link
        );

        return;
      }


      if (
        href.startsWith("/memberlist") ||
        href.startsWith("/groups")
      ) {

        cityLinks.push(
          link
        );

        return;
      }


      if (
        href.startsWith("/profile") ||
        href.startsWith("/privmsg")
      ) {

        accountLinks.push(
          link
        );

        return;
      }


      if (
        rawHref.includes("logout=1") ||
        text.includes("revoyure") ||
        text.includes("déconnexion") ||
        text.includes("deconnexion")
      ) {

        logoutLinks.push(
          link
        );

        return;
      }


      otherLinks.push(
        link
      );

    });


    const primary =
      document.createElement("div");

    primary.className =
      "utpp-navPrimary";


    const profile =
      createProfile();


    primary.appendChild(
      profile
    );


    const context =
      createContextLink();


    if (context) {

      primary.appendChild(
        context
      );

    }


    homeLinks.forEach(
      link =>
        primary.appendChild(link)
    );


    const city =
      createNavGroup(
        "Philadelphie",
        cityLinks
      );


    if (city) {

      primary.appendChild(
        city
      );

    }


    const account =
      createNavGroup(
        "Mon compte",
        accountLinks
      );


    if (account) {

      primary.appendChild(
        account
      );

    }


    otherLinks.forEach(
      link =>
        primary.appendChild(link)
    );


    logoutLinks.forEach(
      link =>
        primary.appendChild(link)
    );


    generated.replaceChildren(
      primary
    );


    generated.dataset
      .utppNavigationBuilt =
        "true";


    const advanced =
      searchTool?.querySelector(
        ".utpp-searchAdvanced"
      );


    if (advanced) {

      advanced.href =
        searchHref;

    }

  };


  /* ==========================================================================
     MENUS AU CLIC
     ========================================================================== */

  const getDropdowns = () => {
    return document.querySelectorAll(
      ".utpp-navGroup, " +
      ".utpp-searchTool, " +
      ".utpp-controlCenter, " +
      ".utpp-switcher"
    );
  };


  const closeAllDropdowns = (
    except = null
  ) => {

    getDropdowns()
      .forEach((dropdown) => {

        if (
          except &&
          dropdown === except
        ) {
          return;
        }


        dropdown.classList.remove(
          "is-open"
        );


        dropdown
          .querySelector(
            ":scope > button"
          )
          ?.setAttribute(
            "aria-expanded",
            "false"
          );

      });

  };


  const bindDropdown = (
    dropdown
  ) => {

    if (!dropdown) {
      return;
    }


    if (
      dropdown.dataset
        .utppBound ===
        "true"
    ) {
      return;
    }


    const toggle =
      dropdown.querySelector(
        ":scope > button"
      );


    if (!toggle) {
      return;
    }


    dropdown.dataset.utppBound =
      "true";


    toggle.addEventListener(
      "click",
      (event) => {

        event.preventDefault();
        event.stopPropagation();


        const currentlyOpen =
          dropdown.classList
            .contains("is-open");


        closeAllDropdowns(
          dropdown
        );


        dropdown.classList.toggle(
          "is-open",
          !currentlyOpen
        );


        toggle.setAttribute(
          "aria-expanded",
          String(!currentlyOpen)
        );


        if (
          !currentlyOpen &&
          dropdown.classList.contains(
            "utpp-searchTool"
          )
        ) {

          setTimeout(() => {

            dropdown
              .querySelector(
                'input[type="search"]'
              )
              ?.focus();

          }, 30);

        }

      });

  };


  const bindDropdowns = () => {

    getDropdowns()
      .forEach(
        bindDropdown
      );

  };


  /* ==========================================================================
     SWITCHEROO — AVATAR COURANT
     ========================================================================== */

  const setupSwitcherAvatar = (
    navbar
  ) => {

    const switcheroo =
      navbar.querySelector(
        "#switcheroo"
      );


    const current =
      navbar.querySelector(
        ".utpp-switcher-current"
      );


    if (
      !switcheroo ||
      !current
    ) {
      return;
    }


    const setFallbackAvatar =
      () => {

        const data =
          window._userdata || {};


        if (!data.avatar) {
          return;
        }


        const temp =
          document.createElement("div");

        temp.innerHTML =
          data.avatar;


        const img =
          temp.querySelector("img");


        if (!img) {
          return;
        }


        current.innerHTML =
          "";


        current.appendChild(
          img.cloneNode(true)
        );

      };


    const updateCurrentAvatar =
      () => {

        const active =
          switcheroo.querySelector(
            '.switcheroo__squircle[data-action="switcheroo"].active'
          );


        const img =
          active?.querySelector(
            ".switcheroo__avatar img"
          );


        if (!img) {

          setFallbackAvatar();

          return;

        }


        current.innerHTML =
          "";


        const clone =
          img.cloneNode(true);


        clone.removeAttribute(
          "id"
        );


        clone.removeAttribute(
          "draggable"
        );


        current.appendChild(
          clone
        );

      };


    updateCurrentAvatar();


    if (
      switcheroo.dataset
        .utppAvatarObserver ===
        "true"
    ) {
      return;
    }


    const observer =
      new MutationObserver(
        updateCurrentAvatar
      );


    observer.observe(
      switcheroo,
      {
        childList: true,
        subtree: true
      }
    );


    switcheroo.dataset
      .utppAvatarObserver =
        "true";

  };


  /* ==========================================================================
     ÉVÉNEMENTS GLOBAUX
     ========================================================================== */

  const setupGlobalEvents = () => {

    if (
      document.documentElement
        .dataset
        .utppNavbarEvents ===
        "true"
    ) {
      return;
    }


    document.documentElement
      .dataset
      .utppNavbarEvents =
        "true";


    document.addEventListener(
      "click",
      (event) => {

        if (
          event.target.closest(
            ".utpp-navGroup, " +
            ".utpp-searchTool, " +
            ".utpp-controlCenter, " +
            ".utpp-switcher"
          )
        ) {
          return;
        }


        closeAllDropdowns();

      }
    );


    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key !== "Escape"
        ) {
          return;
        }


        closeAllDropdowns();

      }
    );

  };


  /* ==========================================================================
     BOOT
     ========================================================================== */

  const bootNavbar = () => {

    const navbar =
      document.querySelector(
        NAVBAR_SELECTOR
      );


    if (!navbar) {
      return;
    }


    const generated =
      navbar.querySelector(
        GENERATED_SELECTOR
      );


    const searchTool =
      navbar.querySelector(
        ".utpp-searchTool"
      );


    if (!generated) {
      return;
    }


    buildNavigation(
      generated,
      searchTool
    );


    bindDropdowns();


    setupSwitcherAvatar(
      navbar
    );


    setupGlobalEvents();


    if (
      window.lucide &&
      typeof window.lucide
        .createIcons === "function"
    ) {

      window.lucide
        .createIcons();

    }

  };


  document.addEventListener(
    "DOMContentLoaded",
    bootNavbar
  );


  window.addEventListener(
    "load",
    bootNavbar
  );


  bootNavbar();

})();
