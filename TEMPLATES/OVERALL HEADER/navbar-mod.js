(() => {

  /* ==========================================================================
     CONFIGURATION
     ========================================================================== */

  const NAVBAR_SELECTOR = ".utpp-headerNavbar";
  const GENERATED_SELECTOR = ".utpp-navigBar";


  const labels = [

    {
      label: "home sweet home",

      match: (href, text) =>
        href === "/" ||
        href === "/forum" ||
        href === "/forum.htm" ||
        text === "accueil"
    },

    {
      label: "les habitants de philadelphie",

      match: (href, text) =>
        href.startsWith("/memberlist") ||
        text === "membres"
    },

    {
      label: "groupes",

      match: (href, text) =>
        href.startsWith("/groups") ||
        text === "groupes"
    },

    {
      label: "rechercher",

      match: (href, text) =>
        href.startsWith("/search") ||
        text === "rechercher"
    },

    {
      label: "modifier son profil",

      match: (href, text) =>
        href.startsWith("/profile") ||
        text === "profil"
    },

    {
      label: "boîte aux lettres",

      match: (href, text) =>
        href.startsWith("/privmsg") ||
        text === "messagerie"
    },

    {
      label: "à la revoyure",

      match: (href, text, rawHref) =>
        rawHref.includes("logout=1") ||
        text.includes("déconnexion") ||
        text.includes("deconnexion")
    }

  ];


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

    const rawHref =
      link?.getAttribute("href") || "";


    try {

      const url =
        new URL(
          rawHref,
          window.location.origin
        );


      return (
        `${url.pathname}${url.search}`
      ).toLowerCase();

    } catch (e) {

      return rawHref.toLowerCase();

    }

  };


  const getCleanLabel = (element) => {

    if (!element) return "";


    const img =
      element.querySelector?.("img");


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

      const url =
        new URL(
          href,
          window.location.origin
        );


      return url.pathname.toLowerCase();

    } catch (e) {

      return String(
        href || ""
      ).toLowerCase();

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

    const data =
      window._userdata || {};


    const loggedIn =
      Number(
        data.session_logged_in
      ) === 1;


    const userId =
      Number(
        data.user_id
      );


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


    if (
      loggedIn &&
      data.avatar
    ) {

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


  const addProfile = (generated) => {

    const oldProfile =
      generated.querySelector(
        ".utpp-navProfile"
      );


    const newProfile =
      createProfile();


    if (oldProfile) {

      oldProfile.replaceWith(
        newProfile
      );

      return;

    }


    generated.insertBefore(
      newProfile,
      generated.firstChild
    );

  };


  /* ==========================================================================
     RENOMMER LES LIENS FORUMACTIF
     ========================================================================== */

  const renameNavbarLinks = (generated) => {

    generated
      .querySelectorAll(
        "a.mainmenu"
      )
      .forEach((link) => {

        const rawHref =
          (
            link.getAttribute("href") ||
            ""
          ).toLowerCase();


        const href =
          getPath(link);


        const originalLabel =
          getCleanLabel(link);


        const text =
          normalize(originalLabel);


        const item =
          labels.find(
            ({ match }) =>
              match(
                href,
                text,
                rawHref
              )
          );


        const finalLabel =
          item
            ? item.label
            : originalLabel;


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

      });

  };


  /* ==========================================================================
     SUJET ACTUEL
     ========================================================================== */

  const isTopicPage = () => {

    const path =
      window.location.pathname
        .toLowerCase();


    return /^\/t\d+(p\d+)?(?:-|$)/.test(
      path
    );

  };


  const getTopicTitle = () => {

    const selectors = [

      "h1.page-title",

      ".topic-title h1",

      ".topic-title",

      "h1"

    ];


    for (
      const selector
      of selectors
    ) {

      const element =
        document.querySelector(
          selector
        );


      const text =
        getCleanLabel(
          element
        );


      if (text) {
        return text;
      }

    }


    return document.title
      .replace(
        /\s[-–—]\s.*$/,
        ""
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  };


  const addContextLink = (generated) => {

    const oldContext =
      generated.querySelector(
        ".utpp-contextLink"
      );


    if (oldContext) {
      oldContext.remove();
    }


    if (!isTopicPage()) {
      return;
    }


    const topicTitle =
      getTopicTitle();


    if (!topicTitle) {
      return;
    }


    const contextLink =
      document.createElement("a");


    contextLink.className =
      "utpp-contextLink";


    contextLink.href =
      window.location.href;


    contextLink.textContent =
      topicTitle;


    contextLink.setAttribute(
      "title",
      topicTitle
    );


    contextLink.setAttribute(
      "aria-current",
      "page"
    );


    contextLink.setAttribute(
      "aria-label",
      `Sujet actuel : ${topicTitle}`
    );


    const profile =
      generated.querySelector(
        ".utpp-navProfile"
      );


    if (
      profile &&
      profile.nextSibling
    ) {

      generated.insertBefore(
        contextLink,
        profile.nextSibling
      );

    } else {

      generated.appendChild(
        contextLink
      );

    }

  };


  /* ==========================================================================
     LIEN ACTIF
     ========================================================================== */

  const setActiveNavbarLink = (generated) => {

    const currentPath =
      window.location.pathname
        .toLowerCase();


    generated
      .querySelectorAll(
        "a.mainmenu"
      )
      .forEach((link) => {

        const linkPath =
          normalizePath(
            link.getAttribute(
              "href"
            )
          );


        const isActive =
          linkPath === currentPath ||

          (
            isHomePath(
              currentPath
            ) &&
            isHomePath(
              linkPath
            )
          ) ||

          (
            currentPath.startsWith(
              "/privmsg"
            ) &&
            linkPath.startsWith(
              "/privmsg"
            )
          ) ||

          (
            currentPath.startsWith(
              "/profile"
            ) &&
            linkPath.startsWith(
              "/profile"
            )
          ) ||

          (
            currentPath.startsWith(
              "/memberlist"
            ) &&
            linkPath.startsWith(
              "/memberlist"
            )
          ) ||

          (
            currentPath.startsWith(
              "/groups"
            ) &&
            linkPath.startsWith(
              "/groups"
            )
          );


        link.classList.toggle(
          "utpp-activeLink",
          isActive
        );

      });

  };


  /* ==========================================================================
     CRÉATION DES SOUS-MENUS
     ========================================================================== */

  const createNavGroup = (
    label,
    links
  ) => {

    if (!links.length) {
      return null;
    }


    const item =
      document.createElement("li");


    item.className =
      "utpp-navGroup";


    const toggle =
      document.createElement(
        "button"
      );


    toggle.className =
      "utpp-navGroup-toggle";


    toggle.type =
      "button";


    toggle.setAttribute(
      "aria-expanded",
      "false"
    );


    const text =
      document.createElement(
        "span"
      );


    text.textContent =
      label;


    const icon =
      document.createElement(
        "i"
      );


    icon.setAttribute(
      "data-lucide",
      "chevron-down"
    );


    const panel =
      document.createElement(
        "div"
      );


    panel.className =
      "utpp-navGroup-panel";


    toggle.append(
      text,
      icon
    );


    links.forEach((link) => {

      const oldParent =
        link.parentElement;


      panel.appendChild(
        link
      );


      if (
        oldParent?.tagName === "LI" &&
        oldParent.children.length === 0 &&
        !oldParent.textContent.trim()
      ) {

        oldParent.remove();

      }

    });


    item.append(
      toggle,
      panel
    );


    return item;

  };


  const buildNavbarMenus = (
    generated
  ) => {

    if (
      generated.dataset
        .utppMenusBuilt === "true"
    ) {
      return;
    }


    const list =
      generated.querySelector(
        ":scope > ul"
      ) ||
      generated.querySelector(
        "ul"
      );


    if (!list) {
      return;
    }


    const links =
      Array.from(
        list.querySelectorAll(
          "a.mainmenu"
        )
      );


    if (!links.length) {
      return;
    }


    const cityLinks = [];
    const accountLinks = [];


    let homeLink = null;
    let logoutLink = null;


    links.forEach((link) => {

      const href =
        getPath(link);


      const text =
        normalize(
          getCleanLabel(link)
        );


      const rawHref =
        (
          link.getAttribute(
            "href"
          ) ||
          ""
        ).toLowerCase();


      /* ------------------------------------------
         HOME
      ------------------------------------------ */

      if (
        href === "/" ||
        href === "/forum" ||
        href === "/forum.htm" ||
        text === "home sweet home"
      ) {

        homeLink =
          link;


        link.classList.add(
          "utpp-navStandalone"
        );


        return;

      }


      /* ------------------------------------------
         PHILADELPHIE
      ------------------------------------------ */

      if (
        href.startsWith(
          "/memberlist"
        ) ||
        href.startsWith(
          "/groups"
        ) ||
        href.startsWith(
          "/search"
        )
      ) {

        cityLinks.push(
          link
        );


        return;

      }


      /* ------------------------------------------
         COMPTE
      ------------------------------------------ */

      if (
        href.startsWith(
          "/profile"
        ) ||
        href.startsWith(
          "/privmsg"
        )
      ) {

        accountLinks.push(
          link
        );


        return;

      }


      /* ------------------------------------------
         LOGOUT
      ------------------------------------------ */

      if (
        rawHref.includes(
          "logout=1"
        ) ||
        text.includes(
          "revoyure"
        ) ||
        text.includes(
          "déconnexion"
        ) ||
        text.includes(
          "deconnexion"
        )
      ) {

        logoutLink =
          link;


        link.classList.add(
          "utpp-navStandalone"
        );


        return;

      }


      /* ------------------------------------------
         LIEN INCONNU
         On le garde visible par sécurité.
      ------------------------------------------ */

      link.classList.add(
        "utpp-navStandalone"
      );

    });


    const cityMenu =
      createNavGroup(
        "Philadelphie",
        cityLinks
      );


    const accountMenu =
      createNavGroup(
        "Mon compte",
        accountLinks
      );


    const homeItem =
      homeLink?.closest("li");


    if (cityMenu) {

      if (
        homeItem &&
        homeItem.parentElement === list
      ) {

        homeItem.after(
          cityMenu
        );

      } else {

        list.prepend(
          cityMenu
        );

      }

    }


    if (accountMenu) {

      if (
        cityMenu &&
        cityMenu.parentElement === list
      ) {

        cityMenu.after(
          accountMenu
        );

      } else {

        list.appendChild(
          accountMenu
        );

      }

    }


    const logoutItem =
      logoutLink?.closest("li");


    if (
      logoutItem &&
      logoutItem.parentElement === list
    ) {

      list.appendChild(
        logoutItem
      );

    }


    generated.dataset
      .utppMenusBuilt =
        "true";

  };


  /* ==========================================================================
     PANNEAUX OUVERTS AU CLIC
     ========================================================================== */

  const closeAllMenus = (
    exception = null
  ) => {

    document
      .querySelectorAll(
        ".utpp-navGroup.is-open, " +
        ".utpp-controlCenter.is-open, " +
        ".utpp-switcher.is-open"
      )
      .forEach((element) => {

        if (
          exception &&
          element === exception
        ) {
          return;
        }


        element.classList.remove(
          "is-open"
        );


        const toggle =
          element.querySelector(
            ":scope > button"
          );


        toggle?.setAttribute(
          "aria-expanded",
          "false"
        );

      });

  };


  const bindDropdown = (
    element
  ) => {

    if (!element) return;


    if (
      element.dataset
        .utppDropdownBound ===
        "true"
    ) {
      return;
    }


    const toggle =
      element.querySelector(
        ":scope > button"
      );


    if (!toggle) return;


    element.dataset
      .utppDropdownBound =
        "true";


    toggle.addEventListener(
      "click",
      (event) => {

        event.preventDefault();
        event.stopPropagation();


        const isOpen =
          element.classList
            .contains(
              "is-open"
            );


        closeAllMenus(
          element
        );


        element.classList.toggle(
          "is-open",
          !isOpen
        );


        toggle.setAttribute(
          "aria-expanded",
          String(
            !isOpen
          )
        );

      });

  };


  const bindDropdowns = (
    navbar
  ) => {

    navbar
      .querySelectorAll(
        ".utpp-navGroup, " +
        ".utpp-controlCenter, " +
        ".utpp-switcher"
      )
      .forEach(
        bindDropdown
      );

  };


  /* ==========================================================================
     SWITCHEROO — AVATAR DU COMPTE ACTIF
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


    if (
      switcheroo.dataset
        .utppAvatarObserver ===
        "true"
    ) {
      return;
    }


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
          return;
        }


        current.innerHTML =
          "";


        const clone =
          img.cloneNode(
            true
          );


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
     FERMETURES GLOBALES
     ========================================================================== */

  const setupGlobalEvents = () => {

    if (
      document.documentElement
        .dataset
        .utppNavbarGlobalEvents ===
        "true"
    ) {
      return;
    }


    document.documentElement
      .dataset
      .utppNavbarGlobalEvents =
        "true";


    document.addEventListener(
      "click",
      (event) => {

        if (
          event.target.closest(
            ".utpp-navGroup, " +
            ".utpp-controlCenter, " +
            ".utpp-switcher"
          )
        ) {
          return;
        }


        closeAllMenus();

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


        closeAllMenus();

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


    if (!generated) {
      return;
    }


    addProfile(
      generated
    );


    renameNavbarLinks(
      generated
    );


    addContextLink(
      generated
    );


    setActiveNavbarLink(
      generated
    );


    buildNavbarMenus(
      generated
    );


    bindDropdowns(
      navbar
    );


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

/* (() => {
  const NAVBAR_SELECTOR = ".utpp-headerNavbar";
  const GENERATED_SELECTOR = ".utpp-navigBar";

  const labels = [
    {
      label: "home sweet home",
      match: (href, text) =>
        href === "/" ||
        href === "/forum" ||
        href === "/forum.htm" ||
        text === "accueil"
    },
    {
      label: "les habitants de philadelphie",
      match: (href, text) =>
        href.startsWith("/memberlist") ||
        text === "membres"
    },
    {
      label: "modifier son profil",
      match: (href, text) =>
        href.startsWith("/profile") ||
        text === "profil"
    },
    {
      label: "boîte aux lettres",
      match: (href, text) =>
        href.startsWith("/privmsg") ||
        text === "messagerie"
    },
    {
      label: "à la revoyure (se déconnecter)",
      match: (href, text, rawHref) =>
        rawHref.includes("logout=1") ||
        text.includes("déconnexion") ||
        text.includes("deconnexion")
    }
  ];

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

  const createProfile = () => {
    const data = window._userdata || {};
    const loggedIn = Number(data.session_logged_in) === 1;
    const userId = Number(data.user_id);
    const username = loggedIn && data.username ? data.username : "Invité";

    const profile = document.createElement("a");
    profile.className = "utpp-navProfile";
    profile.href = loggedIn && userId > 0 ? `/u${userId}` : "/login";
    profile.setAttribute(
      "aria-label",
      loggedIn ? `Profil de ${username}` : "Connexion"
    );

    const avatar = document.createElement("span");
    avatar.className = "utpp-navProfileAvatar";

    if (loggedIn && data.avatar) {
      avatar.innerHTML = data.avatar;
    } else {
      const fallback = document.createElement("span");
      fallback.className = "utpp-navProfileFallback";
      fallback.textContent = "?";
      avatar.appendChild(fallback);
    }

    const openBracket = document.createElement("span");
    openBracket.className = "utpp-navProfileBracket";
    openBracket.textContent = "[";

    const name = document.createElement("span");
    name.className = "utpp-navProfileName";
    name.textContent = username;

    const closeBracket = document.createElement("span");
    closeBracket.className = "utpp-navProfileBracket";
    closeBracket.textContent = "]";

    profile.append(avatar, openBracket, name, closeBracket);

    return profile;
  };

  const addProfile = (generated) => {
    const oldProfile = generated.querySelector(".utpp-navProfile");
    const newProfile = createProfile();

    if (oldProfile) {
      oldProfile.replaceWith(newProfile);
      return;
    }

    generated.insertBefore(newProfile, generated.firstChild);
  };

  const renameNavbarLinks = (generated) => {
    generated.querySelectorAll("a.mainmenu").forEach((link) => {
      const rawHref = (link.getAttribute("href") || "").toLowerCase();
      const href = getPath(link);
      const originalLabel = getCleanLabel(link);
      const text = normalize(originalLabel);

      const item = labels.find(({ match }) => match(href, text, rawHref));
      const finalLabel = item ? item.label : originalLabel;

      link.textContent = finalLabel;
      link.setAttribute("title", finalLabel);
      link.setAttribute("aria-label", finalLabel);
    });
  };

  const isTopicPage = () => {
    const path = window.location.pathname.toLowerCase();

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
      const element = document.querySelector(selector);
      const text = getCleanLabel(element);

      if (text) {
        return text;
      }
    }

    return document.title
      .replace(/\s[-–—]\s.*$/, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const addContextLink = (generated) => {
    const oldContext = generated.querySelector(".utpp-contextLink");

    if (oldContext) {
      oldContext.remove();
    }

    if (!isTopicPage()) return;

    const topicTitle = getTopicTitle();

    if (!topicTitle) return;

    const contextLink = document.createElement("a");
    contextLink.className = "utpp-contextLink";
    contextLink.href = window.location.href;
    contextLink.textContent = topicTitle;
    contextLink.setAttribute("title", topicTitle);
    contextLink.setAttribute("aria-current", "page");
    contextLink.setAttribute("aria-label", `Sujet actuel : ${topicTitle}`);

    const children = Array.from(generated.children);

    const firstMenuBlock = children.find((child) => {
      return (
        child.matches?.("a.mainmenu") ||
        child.querySelector?.("a.mainmenu")
      );
    });

    if (firstMenuBlock) {
      generated.insertBefore(contextLink, firstMenuBlock);
    } else {
      generated.appendChild(contextLink);
    }
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
    return path === "/" || path === "/forum" || path === "/forum.htm";
  };

  const setActiveNavbarLink = (generated) => {
    const currentPath = window.location.pathname.toLowerCase();

    generated.querySelectorAll("a.mainmenu").forEach((link) => {
      const linkPath = normalizePath(link.getAttribute("href"));

      const isActive =
        linkPath === currentPath ||
        (isHomePath(currentPath) && isHomePath(linkPath)) ||
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
        );

      link.classList.toggle("utpp-activeLink", isActive);
    });
  };

  const bootNavbar = () => {
    const navbar = document.querySelector(NAVBAR_SELECTOR);
    if (!navbar) return;

    const generated = navbar.querySelector(GENERATED_SELECTOR);
    if (!generated) return;

    addProfile(generated);
    renameNavbarLinks(generated);
    addContextLink(generated);
    setActiveNavbarLink(generated);

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  };

  document.addEventListener("DOMContentLoaded", bootNavbar);
  window.addEventListener("load", bootNavbar);

  bootNavbar();
})(); */
