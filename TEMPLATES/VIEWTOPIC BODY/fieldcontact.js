(() => {
  "use strict";

  const CONTACT_TYPES = [
    {
      type: "rps",
      keywords: [
        "fiche suivi rps",
        "suivi rps",
        "suivi rp"
      ],
      tooltip: "Fiche suivi RPs"
    },
    {
      type: "links",
      keywords: [
        "fiche de liens",
        "fiche liens",
        "liens"
      ],
      tooltip: "Fiche de liens"
    },
    {
      type: "presentation",
      keywords: [
        "presentation",
        "fiche de presentation"
      ],
      tooltip: "Présentation"
    }
  ];

  function normalizeUTPPVBContact(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function getUTPPVBContactText(link) {
    const image = link.querySelector("img");

    return [
      link.getAttribute("title"),
      link.getAttribute("aria-label"),
      image?.getAttribute("title"),
      image?.getAttribute("alt")
    ]
      .filter(Boolean)
      .join(" ");
  }

  function initializeUTPPVBContacts() {
    document
      .querySelectorAll(".utppVB_contFields")
      .forEach(container => {
        if (
          container.dataset.utppvbContactsReady ===
          "true"
        ) {
          return;
        }

        const links = Array.from(
          container.querySelectorAll("a")
        );

        links.forEach(link => {
          const originalText =
            getUTPPVBContactText(link);

          const normalizedText =
            normalizeUTPPVBContact(
              originalText
            );

          const contactType =
            CONTACT_TYPES.find(contact => {
              return contact.keywords.some(
                keyword => {
                  return normalizedText.includes(
                    normalizeUTPPVBContact(
                      keyword
                    )
                  );
                }
              );
            });

          link.classList.add(
            "utppVB_contField"
          );

          if (contactType) {
            link.dataset.utppvbContact =
              contactType.type;

            link.dataset.utppvbTooltip =
              contactType.tooltip;

            link.setAttribute(
              "aria-label",
              contactType.tooltip
            );
          } else {
            link.dataset.utppvbContact =
              "default";

            link.dataset.utppvbTooltip =
              originalText || "Ouvrir le lien";

            link.setAttribute(
              "aria-label",
              originalText || "Ouvrir le lien"
            );
          }
          
          link.removeAttribute("title");

          link
            .querySelectorAll("[title]")
            .forEach(element => {
              element.removeAttribute(
                "title"
              );
            });
        });

        container.dataset.utppvbContactsReady =
          "true";

        container.hidden =
          links.length === 0;
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initializeUTPPVBContacts,
      { once: true }
    );
  } else {
    initializeUTPPVBContacts();
  }
})();
