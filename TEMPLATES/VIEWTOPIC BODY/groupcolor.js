(() => {
  "use strict";

  const GROUP_NAMES = {
    3: "omniscience",
    4: "bones beneath fire",
    5: "smoke through hearts",
    6: "blood within stone",
    7: "ashes among thorns"
  };

  const FORCED_GROUP_BY_USER = {
    1: 3
  };

  const GUEST_STYLE = {
    coloredBlock: true,
    color: "#777f7b"
  };

  const STYLE_ID = "utpp-post-groups-style";

  function installGroupStyles() {
    let style = document.querySelector(`#${STYLE_ID}`);

    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }

    style.textContent = `
      /*
       * Par défaut, aucun nom de groupe et aucun trait.
       * La classe .has-listed-group est ajoutée uniquement
       * pour les groupes définis dans GROUP_NAMES.
       */

      .utppVB_posttracker .group-label {
        display: none !important;
        padding-bottom: 0;
        border-bottom: 0 !important;
      }

      .utppVB_posttracker .group-label.has-listed-group {
        display: block !important;
        padding-bottom: 4px;

        border-bottom: 3px solid var(
          --utpp-post-group-color,
          currentColor
        ) !important;
      }

      /*
       * Bloc coloré du pseudo.
       */

      .utppVB_posttracker .utppVB_postname.is-group-colored {
        padding: 6px 10px;

        background: var(
          --utpp-post-group-color,
          transparent
        );

        color: #fff !important;
      }

      /*
       * Tous les éléments contenus dans le pseudo deviennent blancs :
       * lien, span Forumactif, icône éventuelle, etc.
       */

      .utppVB_posttracker
      .utppVB_postname.is-group-colored,
      .utppVB_posttracker
      .utppVB_postname.is-group-colored * {
        color: #fff !important;
      }

      .utppVB_posttracker
      .utppVB_postname.is-group-colored a {
        text-decoration: none;
      }
    `;
  }

  function getPosterIdentity(tracker, pseudoBlock) {
    const avatar = tracker.querySelector(
      ".utppVB_posteravatar[data-id]"
    );

    const rawPosterId = avatar?.dataset.id;
    const parsedPosterId = Number(rawPosterId);

    const posterId =
      Number.isInteger(parsedPosterId) &&
      parsedPosterId > 0
        ? parsedPosterId
        : null;

    const hasProfileLink = Boolean(
      pseudoBlock?.querySelector('a[href^="/u"]')
    );

    const isGuest =
      posterId === null &&
      !hasProfileLink;

    return {
      posterId,
      isGuest
    };
  }

  function getGroupElement(pseudoBlock) {
    if (!pseudoBlock) {
      return null;
    }

    if (pseudoBlock.matches('[class*="group-"]')) {
      return pseudoBlock;
    }

    return pseudoBlock.querySelector(
      '[class*="group-"]'
    );
  }

  function getDetectedGroupId(groupElement) {
    if (!groupElement) {
      return null;
    }

    const groupClass = [...groupElement.classList].find(
      className => /^group-\d+$/.test(className)
    );

    if (!groupClass) {
      return null;
    }

    const groupId = Number(
      groupClass.replace("group-", "")
    );

    return Number.isInteger(groupId)
      ? groupId
      : null;
  }

  function isListedGroup(groupId) {
    return Object.prototype.hasOwnProperty.call(
      GROUP_NAMES,
      groupId
    );
  }

  function getForcedGroupColor(tracker, groupId) {
    const probe = document.createElement("span");

    probe.className = `group-${groupId}`;
    probe.textContent = ".";

    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";

    tracker.appendChild(probe);

    const color = getComputedStyle(probe).color;

    probe.remove();

    return color || "#666";
  }

  function resetTrackerAppearance(
    tracker,
    pseudoBlock,
    groupLabel
  ) {
    tracker.style.removeProperty(
      "--utpp-post-group-color"
    );

    pseudoBlock?.classList.remove(
      "is-group-colored"
    );

    if (groupLabel) {
      groupLabel.textContent = "";

      groupLabel.classList.remove(
        "has-listed-group"
      );
    }
  }

  function applyGuestAppearance(
    tracker,
    pseudoBlock
  ) {
    if (!GUEST_STYLE.coloredBlock) {
      return;
    }

    tracker.style.setProperty(
      "--utpp-post-group-color",
      GUEST_STYLE.color
    );

    pseudoBlock.classList.add(
      "is-group-colored"
    );
  }

  function applyMemberAppearance(
    tracker,
    pseudoBlock,
    groupLabel,
    posterId,
    groupElement
  ) {
    const forcedGroupId =
      posterId !== null
        ? FORCED_GROUP_BY_USER[posterId] ?? null
        : null;

    const detectedGroupId =
      getDetectedGroupId(groupElement);

    const groupId =
      forcedGroupId ?? detectedGroupId;

    if (!groupId) {
      return;
    }

    const groupColor = forcedGroupId
      ? getForcedGroupColor(tracker, groupId)
      : getComputedStyle(groupElement).color;

    tracker.style.setProperty(
      "--utpp-post-group-color",
      groupColor || "#666"
    );

    pseudoBlock.classList.add(
      "is-group-colored"
    );

    if (
      groupLabel &&
      isListedGroup(groupId)
    ) {
      groupLabel.textContent =
        GROUP_NAMES[groupId];

      groupLabel.classList.add(
        "has-listed-group"
      );
    }
  }

  function applyGroupStyles() {
    document
      .querySelectorAll(".utppVB_posttracker")
      .forEach(tracker => {
        const pseudoBlock = tracker.querySelector(
          ".utppVB_postname"
        );

        if (!pseudoBlock) {
          return;
        }

        const groupLabel = tracker.querySelector(
          ".group-label"
        );

        const groupElement =
          getGroupElement(pseudoBlock);

        const identity =
          getPosterIdentity(
            tracker,
            pseudoBlock
          );

        resetTrackerAppearance(
          tracker,
          pseudoBlock,
          groupLabel
        );

        if (identity.isGuest) {
          applyGuestAppearance(
            tracker,
            pseudoBlock
          );

          return;
        }

        applyMemberAppearance(
          tracker,
          pseudoBlock,
          groupLabel,
          identity.posterId,
          groupElement
        );
      });
  }

  function initPostGroups() {
    installGroupStyles();
    applyGroupStyles();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initPostGroups,
      { once: true }
    );
  } else {
    initPostGroups();
  }
})();
