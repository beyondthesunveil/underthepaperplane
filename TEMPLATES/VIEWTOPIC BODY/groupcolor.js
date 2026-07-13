(() => {
  "use strict";

  const GROUP_NAMES = {
    3: "omniscience",
    4: "bones beneath fire",
    5: "smoke through hearts",
    6: "blood within stone",
    7: "ashes among thorns"
  };

  const STYLE_ID = "utpp-post-groups-style";

  function installGroupStyles() {
    if (document.querySelector(`#${STYLE_ID}`)) {
      return;
    }

    const style = document.createElement("style");

    style.id = STYLE_ID;
    style.textContent = `
      /* Nom du groupe et trait coloré */

      .utppVB_posttracker .group-label {
        display: inline-block;
        padding-bottom: 4px;
        border-bottom: 3px solid var(
          --utpp-post-group-color,
          currentColor
        );
      }

      /* Bloc du pseudo coloré */

      .utppVB_posttracker .utppVB_postname.is-group-colored {
        padding: 6px 10px;
        background: var(
          --utpp-post-group-color,
          transparent
        );
        color: #fff !important;
      }

      /* Le pseudo Forumactif peut contenir un lien et plusieurs spans */

      .utppVB_posttracker
      .utppVB_postname.is-group-colored,
      .utppVB_posttracker
      .utppVB_postname.is-group-colored a,
      .utppVB_posttracker
      .utppVB_postname.is-group-colored span {
        color: #fff !important;
      }

      .utppVB_posttracker
      .utppVB_postname.is-group-colored a {
        text-decoration: none;
      }
    `;

    document.head.appendChild(style);
  }

  function applyGroupStyles() {
    document
      .querySelectorAll(".utppVB_posttracker")
      .forEach(tracker => {
        const pseudo = tracker.querySelector(
          '.utppVB_postname [class*="group-"]'
        );

        if (!pseudo) {
          return;
        }

        const groupClass = [...pseudo.classList].find(className => {
          return /^group-\d+$/.test(className);
        });

        if (!groupClass) {
          return;
        }

        const groupId = Number(
          groupClass.replace("group-", "")
        );

        const groupName = GROUP_NAMES[groupId] || "";
        const groupColor = getComputedStyle(pseudo).color;

        const groupLabel = tracker.querySelector(".group-label");
        const pseudoBlock = tracker.querySelector(".utppVB_postname");

        tracker.style.setProperty(
          "--utpp-post-group-color",
          groupColor
        );

        if (groupLabel) {
          groupLabel.textContent = groupName;
        }

        if (pseudoBlock) {
          pseudoBlock.classList.add("is-group-colored");
        }
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
