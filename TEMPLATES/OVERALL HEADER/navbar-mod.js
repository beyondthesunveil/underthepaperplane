(() => {
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
      label: "modifier son ID",
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

  const renameNavbarLinks = () => {
    document.querySelectorAll(".utpp-navGenerated a").forEach((link) => {
      const rawHref = (link.getAttribute("href") || "").toLowerCase();
      const href = getPath(link);
      const text = normalize(link.textContent || link.getAttribute("title"));

      const item = labels.find(({ match }) => match(href, text, rawHref));

      if (!item) return;

      link.textContent = item.label;
      link.setAttribute("title", item.label);
      link.setAttribute("aria-label", item.label);
    });

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  };

  document.addEventListener("DOMContentLoaded", renameNavbarLinks);
  window.addEventListener("load", renameNavbarLinks);

  renameNavbarLinks();
})();
