(function () {
  "use strict";

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  const PANEL_TYPES = [
    {
      type: "dice",
      icon: "dices",

      matches: function (text) {
        return text.includes(
          "lancer de des"
        );
      }
    },
    {
      type: "options",
      icon: "settings-2",

      matches: function (text) {
        return text === "options";
      }
    },
    {
      type: "poll",
      icon:
        "chart-no-axes-column-increasing",

      matches: function (text) {
        return text.includes(
          "sondage"
        );
      }
    }
  ];

  /*
   * Récupère uniquement le texte directement
   * placé dans l’entête native Forumactif.
   */
  function getDirectText(element) {
    return Array.from(
      element.childNodes
    )
      .filter(function (node) {
        return (
          node.nodeType ===
          Node.TEXT_NODE
        );
      })
      .map(function (node) {
        return node.textContent;
      })
      .join(" ")
      .trim();
  }

  /* ==================================================
     LANCER DE DÉS
     ================================================== */

  function decorateDicePanel(panel) {
    const diceTable =
      panel.querySelector(
        "#list_dice"
      );

    if (diceTable) {
      diceTable.classList.add(
        "utppPB_diceList"
      );
    }
  }

  /* ==================================================
     OPTIONS
     ================================================== */

  function decorateOptionsPanel(
    panel
  ) {
    panel
      .querySelectorAll("fieldset")
      .forEach(function (fieldset) {
        fieldset.classList.add(
          "utppPB_optionsFieldset"
        );

        /*
         * Transforme le texte libre :
         * « Poster le sujet en tant que »
         * en véritable élément stylable.
         */
        Array.from(
          fieldset.childNodes
        ).forEach(function (node) {
          if (
            node.nodeType ===
              Node.TEXT_NODE &&
            normalizeText(
              node.textContent
            ).includes(
              "poster le sujet"
            )
          ) {
            const legend =
              document.createElement(
                "span"
              );

            legend.className =
              "utppPB_optionLegend";

            legend.textContent =
              node.textContent.trim();

            node.replaceWith(legend);
          }
        });

        fieldset
          .querySelectorAll("label")
          .forEach(function (choice) {
            const input =
              choice.querySelector(
                "input"
              );

            if (!input) {
              return;
            }

            choice.classList.add(
              "utppPB_optionChoice",
              "utppPB_optionChoice--" +
                input.type
            );
          });
      });
  }

  /* ==================================================
     SONDAGE
     ================================================== */

  function decoratePollPanel(panel) {
    const fieldset =
      panel.querySelector(
        "fieldset"
      );

    if (fieldset) {
      fieldset.classList.add(
        "utppPB_pollFieldset"
      );
    }

    panel
      .querySelectorAll("dl")
      .forEach(function (row) {
        row.classList.add(
          "utppPB_pollRow"
        );
      });

    panel
      .querySelectorAll(
        'label:has(input[type="radio"])'
      )
      .forEach(function (choice) {
        choice.classList.add(
          "utppPB_pollChoice"
        );
      });
  }

  /* ==================================================
     ACCORDÉON
     ================================================== */

  function decoratePanel(
    toggle,
    panel,
    config,
    titleText
  ) {
    /*
     * Retire uniquement le texte natif.
     * Le bouton Forumactif est conservé.
     */
    Array.from(
      toggle.childNodes
    ).forEach(function (node) {
      if (
        node.nodeType ===
        Node.TEXT_NODE
      ) {
        node.remove();
      }
    });

    const icon =
      document.createElement("span");

    icon.className =
      "utppPB_extraToggleIcon";

    icon.setAttribute(
      "aria-hidden",
      "true"
    );

    icon.innerHTML =
      '<i data-lucide="' +
      config.icon +
      '"></i>';

    const label =
      document.createElement("span");

    label.className =
      "utppPB_extraToggleLabel";

    label.textContent =
      titleText;

    toggle.insertBefore(
      icon,
      toggle.firstChild
    );

    toggle.insertBefore(
      label,
      icon.nextSibling
    );

    toggle.classList.add(
      "utppPB_extraToggle",
      "utppPB_extraToggle--" +
        config.type
    );

    panel.classList.add(
      "utppPB_extraPanel",
      "utppPB_extraPanel--" +
        config.type
    );

    toggle.setAttribute(
      "role",
      "button"
    );

    toggle.setAttribute(
      "tabindex",
      "0"
    );

    /*
     * Synchronise le chevron avec
     * l’état natif du panneau.
     */
    function updateExpandedState() {
      const isExpanded =
        !panel.hidden &&
        window
          .getComputedStyle(panel)
          .display !== "none";

      toggle.setAttribute(
        "aria-expanded",
        String(isExpanded)
      );
    }

    toggle.addEventListener(
      "click",
      function () {
        /*
         * Attend que le script natif
         * Forumactif ait ouvert ou fermé
         * le panneau.
         */
        window.setTimeout(
          updateExpandedState,
          0
        );
      }
    );

    /*
     * Rend l’accordéon utilisable
     * avec le clavier.
     */
    toggle.addEventListener(
      "keydown",
      function (event) {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          toggle.click();
        }
      }
    );

    /*
     * Surveille les changements de
     * classe et de style produits par FA.
     */
    const observer =
      new MutationObserver(
        updateExpandedState
      );

    observer.observe(panel, {
      attributes: true,
      attributeFilter: [
        "class",
        "style",
        "hidden"
      ]
    });

    updateExpandedState();

    /*
     * Personnalisation propre à
     * chaque type de panneau.
     */
    if (config.type === "dice") {
      decorateDicePanel(panel);
    } else if (
      config.type === "options"
    ) {
      decorateOptionsPanel(panel);
    } else if (
      config.type === "poll"
    ) {
      decoratePollPanel(panel);
    }

    toggle.dataset.utppPanelReady =
      "true";
  }

  /* ==================================================
     INITIALISATION
     ================================================== */

  function enhancePostingExtraPanels() {
    const toggles =
      document.querySelectorAll(
        ".h3.forum-hideable"
      );

    toggles.forEach(
      function (toggle) {
        if (
          toggle.dataset
            .utppPanelReady === "true"
        ) {
          return;
        }

        const titleText =
          getDirectText(toggle);

        const normalizedTitle =
          normalizeText(titleText);

        const config =
          PANEL_TYPES.find(
            function (item) {
              return item.matches(
                normalizedTitle
              );
            }
          );

        const panel =
          toggle.nextElementSibling;

        if (
          !config ||
          !panel ||
          !panel.classList.contains(
            "panel"
          )
        ) {
          return;
        }

        decoratePanel(
          toggle,
          panel,
          config,
          titleText
        );
      }
    );

    /*
     * Transforme les icônes ajoutées
     * en SVG Lucide.
     */
    if (
      window.lucide &&
      typeof window.lucide
        .createIcons === "function"
    ) {
      window.lucide.createIcons();
    }
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      enhancePostingExtraPanels,
      { once: true }
    );
  } else {
    enhancePostingExtraPanels();
  }
})();
