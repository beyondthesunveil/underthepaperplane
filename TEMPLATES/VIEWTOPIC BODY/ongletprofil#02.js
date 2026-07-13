window.__UTPP_SYSTAB_LOADED__ = "v2";

(function () {
  "use strict";

  if (typeof window.jQuery !== "function") {
    console.error(
      "[SYSTAB] jQuery n’est pas disponible."
    );

    return;
  }

  const $ = window.jQuery;

  function initializeSystem($system) {
    if (
      $system.attr("data-systab-ready") ===
      "true"
    ) {
      return;
    }

    const $originalPanels =
      $system.children("div").detach();

    const $tabs =
      $('<div class="tabs" role="tablist"></div>');

    const $contents =
      $('<div class="contents"></div>');

    $system.empty();

    if ($system.hasClass("s_bottom")) {
      $system.append($contents, $tabs);
    } else {
      $system.append($tabs, $contents);
    }

    $originalPanels.each(function (index) {
      const $panel = $(this);

      const $title = $panel
        .children("span")
        .first();

      if (!$title.length) {
        return;
      }

      const tabId =
        `utpp-systab-tab-${index}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      const panelId =
        `utpp-systab-panel-${index}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      $title
        .detach()
        .addClass("tab")
        .attr({
          id: tabId,
          role: "tab",
          tabindex: "-1",
          "aria-controls": panelId,
          "aria-selected": "false"
        });

      $panel
        .removeClass("selected")
        .addClass("content")
        .attr({
          id: panelId,
          role: "tabpanel",
          "aria-labelledby": tabId
        })
        .hide();

      $tabs.append($title);
      $contents.append($panel);
    });

    const $allTabs =
      $tabs.children(".tab");

    const $allContents =
      $contents.children(".content");

    let selectedIndex = 0;

    const originalSelectedIndex =
      $originalPanels.index(
        $originalPanels.filter(".selected").last()
      );

    if (originalSelectedIndex >= 0) {
      selectedIndex = originalSelectedIndex;
    }

    $allTabs
      .removeClass("selected")
      .attr({
        tabindex: "-1",
        "aria-selected": "false"
      });

    $allContents
      .removeClass("selected")
      .hide();

    $allTabs
      .eq(selectedIndex)
      .addClass("selected")
      .attr({
        tabindex: "0",
        "aria-selected": "true"
      });

    $allContents
      .eq(selectedIndex)
      .addClass("selected")
      .show();

    $system.attr(
      "data-systab-ready",
      "true"
    );
  }

  function activateTab($tab) {
    const $system =
      $tab.closest(".systab");

    const $tabs =
      $system.children(".tabs");

    const $contents =
      $system.children(".contents");

    const index =
      $tabs.children(".tab").index($tab);

    if (index < 0) {
      return;
    }

    $tabs
      .children(".tab")
      .removeClass("selected")
      .attr({
        tabindex: "-1",
        "aria-selected": "false"
      });

    $contents
      .children(".content")
      .removeClass("selected")
      .stop(true, true)
      .hide();

    $tab
      .addClass("selected")
      .attr({
        tabindex: "0",
        "aria-selected": "true"
      });

    $contents
      .children(".content")
      .eq(index)
      .addClass("selected")
      .show();
  }

  function initializeTabs() {
    $("div.systab").each(function () {
      initializeSystem($(this));
    });

    console.info(
      "[SYSTAB] Initialisation terminée :",
      document.querySelectorAll(
        ".systab[data-systab-ready='true']"
      ).length,
      "système(s)."
    );
  }

  $(document).on(
    "click",
    ".systab .tabs > .tab",
    function (event) {
      event.preventDefault();
      activateTab($(this));
    }
  );

  $(document).on(
    "mouseenter",
    ".systab.s_hover .tabs > .tab",
    function () {
      activateTab($(this));
    }
  );

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeTabs,
      { once: true }
    );
  } else {
    initializeTabs();
  }
})();
