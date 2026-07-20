(function () {
  "use strict";

  function initHomepageAccordion() {
    const homepage = document.querySelector(
      ".utppHP_home"
    );

    if (
      !homepage ||
      homepage.dataset.accordionReady === "true"
    ) {
      return;
    }

    const feature = homepage.querySelector(
      ".utppHP_feature"
    );

    const items = Array.from(
      homepage.querySelectorAll(
        ".utppHP_featureItem"
      )
    );

    if (!feature || !items.length) {
      return;
    }

    function activateItem(activeItem) {
      const activeIndex = items.indexOf(activeItem);

      items.forEach(function (item) {
        const isActive = item === activeItem;

        const button = item.querySelector(
          ".utppHP_featureButton"
        );

        item.classList.toggle(
          "is-active",
          isActive
        );

        if (button) {
          button.setAttribute(
            "aria-expanded",
            String(isActive)
          );
        }
      });

      feature.setAttribute(
        "data-active",
        String(Math.max(activeIndex, 0))
      );
    }

    items.forEach(function (item) {
      const button = item.querySelector(
        ".utppHP_featureButton"
      );

      item.addEventListener(
        "click",
        function (event) {

          if (
            event.target.closest(
              ".utppHP_featureContent a"
            )
          ) {
            return;
          }

          activateItem(item);
        }
      );

      item.addEventListener(
        "keydown",
        function (event) {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            activateItem(item);
          }
        }
      );

      if (button) {
        button.addEventListener(
          "click",
          function (event) {
            event.stopPropagation();
            activateItem(item);
          }
        );
      }
    });

    const initialItem =
      items.find(function (item) {
        return item.classList.contains(
          "is-active"
        );
      }) || items[0];

    if (initialItem) {
      activateItem(initialItem);
    }

    homepage.dataset.accordionReady = "true";
  }

  function initWantedTooltips() {
    const characters = document.querySelectorAll(
      ".utppHP_wantedGrid a[data-character]"
    );

    if (!characters.length) {
      return;
    }

    let tooltip = document.querySelector(
      "#utppHP-wanted-tooltip"
    );

    if (!tooltip) {
      tooltip = document.createElement("div");

      tooltip.id = "utppHP-wanted-tooltip";
      tooltip.className =
        "utppHP_wantedTooltip";

      tooltip.setAttribute(
        "role",
        "tooltip"
      );

      tooltip.setAttribute(
        "aria-hidden",
        "true"
      );

      document.body.appendChild(tooltip);
    }

    function positionTooltip(character) {
      const targetRect =
        character.getBoundingClientRect();

      const tooltipRect =
        tooltip.getBoundingClientRect();

      const edge = 8;
      const gap = 9;

      let left =
        targetRect.left +
        targetRect.width / 2 -
        tooltipRect.width / 2;

      left = Math.max(
        edge,
        Math.min(
          left,
          window.innerWidth -
            tooltipRect.width -
            edge
        )
      );

      let top =
        targetRect.top -
        tooltipRect.height -
        gap;

      if (top < edge) {
        top = targetRect.bottom + gap;
      }

      tooltip.style.left =
        Math.round(left) + "px";

      tooltip.style.top =
        Math.round(top) + "px";
    }

    function showTooltip(character) {
      const name =
        character.dataset.character ||
        "Personnage recherché";

      const waiting =
        character.dataset.waiting ||
        "Un membre";

      tooltip.replaceChildren();

      const title =
        document.createElement("strong");

      const mention =
        document.createElement("span");

      title.textContent = name;

      mention.textContent =
        waiting + " attend ce personnage";

      tooltip.append(
        title,
        mention
      );

      tooltip.classList.add(
        "is-visible"
      );

      tooltip.setAttribute(
        "aria-hidden",
        "false"
      );

      requestAnimationFrame(function () {
        positionTooltip(character);
      });
    }

    function hideTooltip() {
      tooltip.classList.remove(
        "is-visible"
      );

      tooltip.setAttribute(
        "aria-hidden",
        "true"
      );
    }

    characters.forEach(function (character) {
      if (
        character.dataset.tooltipReady === "true"
      ) {
        return;
      }

      character.setAttribute(
        "aria-describedby",
        tooltip.id
      );

      character.addEventListener(
        "mouseenter",
        function () {
          showTooltip(character);
        }
      );

      character.addEventListener(
        "mouseleave",
        hideTooltip
      );

      character.addEventListener(
        "focus",
        function () {
          showTooltip(character);
        }
      );

      character.addEventListener(
        "blur",
        hideTooltip
      );

      character.dataset.tooltipReady = "true";
    });

    window.addEventListener(
      "resize",
      hideTooltip
    );

    window.addEventListener(
      "scroll",
      hideTooltip,
      true
    );
  }

  function renderLucideIcons() {
    if (
      window.lucide &&
      typeof window.lucide.createIcons === "function"
    ) {
      window.lucide.createIcons();
    }
  }

  function initHomepage() {
    initHomepageAccordion();
    initWantedTooltips();
    renderLucideIcons();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initHomepage,
      { once: true }
    );
  } else {
    initHomepage();
  }
})();
