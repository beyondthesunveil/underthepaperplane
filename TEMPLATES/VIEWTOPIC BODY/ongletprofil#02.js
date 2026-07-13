/* $(function() {
    // clic sur un onglet
    var d = function() {
        // si l'onglet est déjà actif, ne rien faire
        if ($(this).is(".selected")) return;
        // affiche le contenu correspondant et on met l'onglet en sélectionné
        var a = $(this).closest(".systab");
        a.find(".selected").removeClass("selected").filter(".content")[a.is(".s_slide") ? "slideUp" : a.is(".s_fade") ? "fadeOut" : "hide"](+((a.attr("class") || "").match(/^[sS]*(?:^|s)s_trans([0-9]+)(?:s|$)[sS]*$/) || ["", 500])[1]);
        $(this).addClass("selected").data("content").addClass("selected").stop(!0, !0)[a.is(".s_slide") ? "slideDown" : a.is(".s_fade") ? "fadeIn" : "show"](+((a.attr("class") || "").match(/^[sS]*(?:^|s)s_trans([0-9]+)(?:s|$)[sS]*$/) || ["", 500])[1])
    };
    // pour chacun des systèmes d'onglets
    $("div.systab").each(function() {
        var a = $("> div", this).detach(),
            c = this,
            b;
        // on ajoute le conteneur d'onglet avant ou après ( si s_bottom )
        $(this).html('<div class="' + ($(this).is(".s_bottom") ? "contents" : "tabs") + '"></div><div class="' + ($(this).is(".s_bottom") ?
            "tabs" : "contents") + '"></div>');
        $(a).each(function() {
            b = $(this).children(":first");
            b.is("span") ? (
                $("> div.tabs", c).append($(b).addClass("tab").data("content", $(this))), $(this).addClass("content").data("tab", b)) : $(this).remove()
        });
        $("> div.contents", this).append(a);
        b = $(".content:first,.content.selected", this).last();
        $(b).addClass("selected").siblings().hide();
        $(b).data("tab").addClass("selected")
    }).on("click", ".tab", d).filter(".s_hover").on("mouseenter", ".tab", d)
});
*/

(() => {
  "use strict";

  const REAR_FIELD_LABELS = new Set([
    "feat",
    "date d'inscription",
    "messages"
  ]);


  /* ========================================================
     NORMALISATION DES LABELS
     ======================================================== */

  function normalizeLabel(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s*:\s*$/, "")
      .trim()
      .toLocaleLowerCase("fr");
  }

  function getFieldLabel(field) {
    const label = field.querySelector(
      ".utppVB_charalabel"
    );

    return normalizeLabel(
      label?.textContent
    );
  }


  /* ========================================================
     DÉPLACEMENT DES CHAMPS
     ======================================================== */

  function moveRearFields(system) {
    const rearContainer =
      system.querySelector(".other");

    if (!rearContainer) {
      return;
    }

    system
      .querySelectorAll(".utppVB_charafield")
      .forEach(field => {
        const label = getFieldLabel(field);

        if (REAR_FIELD_LABELS.has(label)) {
          rearContainer.appendChild(field);
        }
      });
  }


  /* ========================================================
     ACTIVATION D’UN ONGLET
     ======================================================== */

  function activateTab(
    system,
    requestedIndex,
    options = {}
  ) {
    const tabs = Array.from(
      system.querySelectorAll(
        ".tabs > .tab"
      )
    );

    const panels = Array.from(
      system.querySelectorAll(
        ".contents > .content"
      )
    );

    if (!tabs.length || !panels.length) {
      return;
    }

    const index = Math.min(
      tabs.length - 1,
      Math.max(0, requestedIndex)
    );

    tabs.forEach((tab, tabIndex) => {
      const selected =
        tabIndex === index;

      tab.classList.toggle(
        "selected",
        selected
      );

      tab.setAttribute(
        "aria-selected",
        String(selected)
      );

      tab.tabIndex = selected
        ? 0
        : -1;
    });

    panels.forEach((panel, panelIndex) => {
      const selected =
        panelIndex === index;

      panel.classList.toggle(
        "selected",
        selected
      );

      panel.hidden = !selected;
    });

    if (options.focus) {
      tabs[index]?.focus();
    }
  }


  /* ========================================================
     CLAVIER
     ======================================================== */

  function handleTabKeyboard(event, system) {
    const tab = event.target.closest(".tab");

    if (!tab) {
      return;
    }

    const tabs = Array.from(
      system.querySelectorAll(
        ".tabs > .tab"
      )
    );

    const currentIndex =
      tabs.indexOf(tab);

    if (currentIndex === -1) {
      return;
    }

    let nextIndex = null;

    if (
      event.key === "ArrowRight" ||
      event.key === "ArrowDown"
    ) {
      nextIndex =
        (currentIndex + 1) % tabs.length;
    }

    if (
      event.key === "ArrowLeft" ||
      event.key === "ArrowUp"
    ) {
      nextIndex =
        (currentIndex - 1 + tabs.length) %
        tabs.length;
    }

    if (event.key === "Home") {
      nextIndex = 0;
    }

    if (event.key === "End") {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();

    activateTab(
      system,
      nextIndex,
      { focus: true }
    );
  }


  /* ========================================================
     CONSTRUCTION DU SYSTÈME
     ======================================================== */

  function buildTabSystem(
    system,
    systemIndex
  ) {
    if (
      system.dataset.systabReady === "true"
    ) {
      return;
    }

    /*
     * Les champs sont déplacés avant que la structure
     * HTML des onglets soit reconstruite.
     */

    moveRearFields(system);

    const originalPanels = Array.from(
      system.children
    ).filter(element => {
      return element.tagName === "DIV";
    });

    const items = originalPanels
      .map(panel => {
        const heading =
          panel.firstElementChild;

        if (
          !heading ||
          heading.tagName !== "SPAN"
        ) {
          return null;
        }

        return {
          panel,
          heading,
          label:
            heading.textContent.trim(),
          initiallySelected:
            panel.classList.contains(
              "selected"
            )
        };
      })
      .filter(Boolean);

    if (!items.length) {
      return;
    }

    let selectedIndex =
      items.findIndex(item => {
        return item.initiallySelected;
      });

    if (selectedIndex < 0) {
      selectedIndex = 0;
    }

    const tabsContainer =
      document.createElement("div");

    tabsContainer.className = "tabs";
    tabsContainer.setAttribute(
      "role",
      "tablist"
    );

    const contentsContainer =
      document.createElement("div");

    contentsContainer.className =
      "contents";

    items.forEach((item, itemIndex) => {
      const tabId =
        `systab-${systemIndex}-tab-${itemIndex}`;

      const panelId =
        `systab-${systemIndex}-panel-${itemIndex}`;

      /*
       * Le span servant de titre est retiré du panneau.
       */

      item.heading.remove();

      const tab =
        document.createElement("button");

      tab.type = "button";
      tab.className = "tab";
      tab.textContent = item.label;
      tab.dataset.tabIndex =
        String(itemIndex);

      tab.id = tabId;
      tab.setAttribute("role", "tab");
      tab.setAttribute(
        "aria-controls",
        panelId
      );

      item.panel.id = panelId;
      item.panel.classList.remove(
        "selected"
      );
      item.panel.classList.add(
        "content"
      );

      item.panel.setAttribute(
        "role",
        "tabpanel"
      );

      item.panel.setAttribute(
        "aria-labelledby",
        tabId
      );

      item.panel.hidden = true;

      tabsContainer.appendChild(tab);
      contentsContainer.appendChild(
        item.panel
      );
    });

    system.replaceChildren();

    /*
     * Compatibilité avec l’ancienne classe s_bottom.
     */

    if (
      system.classList.contains(
        "s_bottom"
      )
    ) {
      system.append(
        contentsContainer,
        tabsContainer
      );
    } else {
      system.append(
        tabsContainer,
        contentsContainer
      );
    }

    system.dataset.systabReady = "true";

    tabsContainer.addEventListener(
      "click",
      event => {
        const tab =
          event.target.closest(".tab");

        if (!tab) {
          return;
        }

        activateTab(
          system,
          Number(tab.dataset.tabIndex)
        );
      }
    );

    tabsContainer.addEventListener(
      "keydown",
      event => {
        handleTabKeyboard(
          event,
          system
        );
      }
    );

    /*
     * Ancienne option s_hover :
     * le passage de la souris change l’onglet.
     */

    if (
      system.classList.contains(
        "s_hover"
      )
    ) {
      tabsContainer
        .querySelectorAll(".tab")
        .forEach(tab => {
          tab.addEventListener(
            "mouseenter",
            () => {
              activateTab(
                system,
                Number(
                  tab.dataset.tabIndex
                )
              );
            }
          );
        });
    }

    activateTab(
      system,
      selectedIndex
    );
  }


  /* ========================================================
     INITIALISATION
     ======================================================== */

  function initTabSystems() {
    document
      .querySelectorAll(".systab")
      .forEach((system, index) => {
        buildTabSystem(
          system,
          index
        );
      });
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initTabSystems,
      { once: true }
    );
  } else {
    initTabSystems();
  }
})();
