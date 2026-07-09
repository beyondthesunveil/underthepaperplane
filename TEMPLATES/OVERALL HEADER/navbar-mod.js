(() => {
  const NAVBAR_SELECTOR = ".utpp-headerNavbar";
  const GENERATED_SELECTOR = ".utpp-navigBar";

  const labels = [
    {
      label: "home sweet home",
      match: (href, text) =>
        href === "/" ||
        href === "/forum" ||
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
    const rawHref = link.getAttribute("href") || "";

    try {
      const url = new URL(rawHref, window.location.origin);
      return `${url.pathname}${url.search}`.toLowerCase();
    } catch (e) {
      return rawHref.toLowerCase();
    }
  };

  const getCleanLabel = (link) => {
    const img = link.querySelector("img");

    return (
      link.getAttribute("title") ||
      img?.getAttribute("alt") ||
      link.textContent ||
      "Lien"
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

    if (text && text !== "Lien") {
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

  const firstMenuLink = generated.querySelector("a.mainmenu");

  if (firstMenuLink) {
    generated.insertBefore(contextLink, firstMenuLink);
  } else {
    generated.appendChild(contextLink);
  }
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

  const setActiveNavbarLink = (generated) => {
  const currentPath = window.location.pathname.toLowerCase();

  generated.querySelectorAll("a.mainmenu").forEach((link) => {
    const href = link.getAttribute("href") || "";
    let linkPath = href.toLowerCase();

    try {
      const url = new URL(href, window.location.origin);
      linkPath = url.pathname.toLowerCase();
    } catch (e) {}

    const isActive =
      linkPath === currentPath ||
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

  document.addEventListener("DOMContentLoaded", bootNavbar);
  window.addEventListener("load", bootNavbar);

  bootNavbar();
})();
