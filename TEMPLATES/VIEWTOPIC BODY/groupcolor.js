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

  const STYLE_ID = "utpp-post-groups-style";

  function installGroupStyles() {
    if (document.querySelector(`#${STYLE_ID}`)) {
      return;
    }

    const style = document.createElement("style");

    style.id = STYLE_ID;
    style.textContent = `
      .utppVB_posttracker .group-label {
        display: inline-block;
        padding-bottom: 4px;
        border-bottom: 3px solid var(
          --utpp-post-group-color,
          currentColor
        );
      }

      .utppVB_posttracker .utppVB_postname.is-group-colored {
        padding: 6px 10px;
        background: var(
          --utpp-post-group-color,
          transparent
        );
        color: #fff !important;
      }

      .utppVB_posttracker
      .utppVB_postname.is-group-colored,
      .utppVB_posttracker
      .utppVB_postname.is-group-colored a,
      .utppVB_posttracker
      .utppVB_postname.is-group-colored span,
      .utppVB_posttracker
      .utppVB_postname.is-group-colored strong {
        color: #fff !important;
      }

      .utppVB_posttracker
      .utppVB_postname.is-group-colored a {
        text-decoration: none;
      }
    `;

    document.head.appendChild(style);
  }

  function getPosterId(tracker) {
    const avatar = tracker.querySelector(
      ".utppVB_posteravatar[data-id]"
    );

    const posterId = Number(avatar?.dataset.id);

    return Number.isInteger(posterId)
      ? posterId
      : null;
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

    return Number(groupClass.replace("group-", ""));
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

  function applyGroupStyles() {
    document
      .querySelectorAll(".utppVB_posttracker")
      .forEach(tracker => {
        const pseudoBlock = tracker.querySelector(
          ".utppVB_postname"
        );

        const groupLabel = tracker.querySelector(
          ".group-label"
        );

        const groupElement = pseudoBlock?.querySelector(
          '[class*="group-"]'
        );

        const posterId = getPosterId(tracker);

        const forcedGroupId =
          FORCED_GROUP_BY_USER[posterId];

        const detectedGroupId =
          getDetectedGroupId(groupElement);

        const groupId =
          forcedGroupId || detectedGroupId;

        if (!groupId || !pseudoBlock) {
          return;
        }

        const groupName =
          GROUP_NAMES[groupId] || "";

        const groupColor = forcedGroupId
          ? getForcedGroupColor(tracker, groupId)
          : getComputedStyle(groupElement).color;

        tracker.style.setProperty(
          "--utpp-post-group-color",
          groupColor
        );

        if (groupLabel) {
          groupLabel.textContent = groupName;
        }

        pseudoBlock.classList.add(
          "is-group-colored"
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
