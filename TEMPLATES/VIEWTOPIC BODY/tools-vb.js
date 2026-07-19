(function () {
  "use strict";

  const RANDOM_ICONS = [
    "sparkles",
    "orbit",
    "flame",
    "zap",
    "ghost",
    "gem",
    "moon-star",
    "rocket",
    "bot",
    "skull",
    "wand-sparkles",
    "scan-eye"
  ];

  const QUICK_REPLY_COPY = {
    eyebrow: "Discussion",
    title: "Écrire une réponse",
    subtitle: "Partagez votre message avec la communauté.",
    placeholder: "Écrivez votre réponse…",
    preview: "Aperçu",
    send: "Envoyer"
  };

  function normalizeText(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function setRandomTitleIcons() {
    const elements = document.querySelectorAll(
      "[data-random-lucide]"
    );

    elements.forEach(function (element) {
      const randomIndex = Math.floor(
        Math.random() * RANDOM_ICONS.length
      );

      element.setAttribute(
        "data-lucide",
        RANDOM_ICONS[randomIndex]
      );
    });
  }

  function enhancePaginations() {
    const paginations = document.querySelectorAll(
      ".utppVB_pages"
    );

    paginations.forEach(function (pagination) {
      if (
        pagination.dataset.paginationReady === "true"
      ) {
        return;
      }

      const currentPage =
        pagination.querySelector("strong");

      if (!currentPage) {
        return;
      }

      const currentNumber =
        currentPage.textContent.trim();

      const pageList =
        document.createElement("div");

      const currentBlock =
        document.createElement("div");

      const label =
        document.createElement("span");

      const number =
        document.createElement("span");


      pageList.className =
        "utppVB_pages__list";

      currentBlock.className =
        "utppVB_pages__current";

      label.className =
        "utppVB_pages__label";

      number.className =
        "utppVB_pages__number";


      label.textContent =
        "Page actuelle";

      number.textContent =
        currentNumber;


      currentBlock.setAttribute(
        "aria-label",
        "Page actuelle : " + currentNumber
      );

      currentBlock.append(
        label,
        number
      );

      while (pagination.firstChild) {
        pageList.appendChild(
          pagination.firstChild
        );
      }


      pagination.append(
        currentBlock,
        pageList
      );

      pagination.dataset.paginationReady =
        "true";
    });
  }

  function updateWatchTopicStates() {
    const watchBlocks = document.querySelectorAll(
      ".utppVB_watchtopicBG"
    );

    watchBlocks.forEach(function (watchBlock) {
      const watchLink =
        watchBlock.querySelector("a");

      if (!watchLink) {
        return;
      }

      const linkText = normalizeText(
        watchLink.textContent
      );

      const linkHref = (
        watchLink.getAttribute("href") || ""
      ).toLowerCase();

      const isWatching =
        linkText.includes("arreter") ||
        linkText.includes("ne plus surveiller") ||
        linkText.includes("stop watching") ||
        linkHref.includes("unwatch");


      watchBlock.classList.toggle(
        "is-watching",
        isWatching
      );

      watchLink.setAttribute(
        "aria-pressed",
        String(isWatching)
      );
    });
  }

  function enhanceTopicParticipants() {
    const participants = document.querySelector(
      ".sub-header-buttons__right"
    );

    if (
      !participants ||
      participants.dataset.participantsReady === "true"
    ) {
      return;
    }

    const participantNames = [];

    const participantImages =
      participants.querySelectorAll("img");


    participantImages.forEach(function (image) {
      const profileLink =
        image.closest("a");

      const avatar =
        profileLink || image.parentElement;

      if (!avatar) {
        return;
      }


      const rawName =
        image.getAttribute("alt") ||
        image.getAttribute("title") ||
        avatar.getAttribute("title") ||
        (
          profileLink
            ? profileLink.textContent.trim()
            : ""
        ) ||
        "Voir le profil";


      const cleanName = rawName
        .replace(
          /^avatar\s+(de|of)\s+/i,
          ""
        )
        .trim();


      avatar.classList.add(
        "utppVB_participant"
      );


      if (!profileLink) {
        avatar.setAttribute(
          "tabindex",
          "0"
        );
      }


      if (!avatar.getAttribute("aria-label")) {
        avatar.setAttribute(
          "aria-label",
          cleanName
        );
      }


      image.removeAttribute("title");
      avatar.removeAttribute("title");


      participantNames.push({
        name: cleanName,

        href: profileLink
          ? profileLink.getAttribute("href") || ""
          : ""
      });
    });

    const textNodes = [];

    const walker = document.createTreeWalker(
      participants,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          const parentElement =
            node.parentElement;

          const insideAvatar =
            parentElement &&
            parentElement.closest(
              ".utppVB_participant"
            );

          if (insideAvatar) {
            return NodeFilter.FILTER_REJECT;
          }

          const containsCounter =
            /participants?/i.test(
              node.textContent
            );

          return containsCounter
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );


    while (walker.nextNode()) {
      textNodes.push(
        walker.currentNode
      );
    }


    textNodes.forEach(function (textNode) {
      textNode.remove();
    });

    if (participantNames.length) {
      const names =
        document.createElement("span");

      names.className =
        "utppVB_participants-names";


      participantNames.forEach(function (participant) {
        const nameElement =
          document.createElement(
            participant.href
              ? "a"
              : "span"
          );

        nameElement.className =
          "utppVB_participants-name";

        nameElement.textContent =
          participant.name;


        if (participant.href) {
          nameElement.setAttribute(
            "href",
            participant.href
          );
        }


        names.appendChild(
          nameElement
        );
      });


      participants.appendChild(
        names
      );
    }


    participants.classList.add(
      "utppVB_participants-ready"
    );

    participants.dataset.participantsReady =
      "true";
  }

  function hideLegacyQuickReplyTitle(quickReply) {
    const parent =
      quickReply.parentElement;

    if (!parent) {
      return;
    }

    const possibleTitles = parent.querySelectorAll(
      [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        ".h1",
        ".h2",
        ".h3",
        ".h4",
        ".page-title",
        ".topic-title"
      ].join(",")
    );


    possibleTitles.forEach(function (element) {
      const position =
        element.compareDocumentPosition(
          quickReply
        );

      const isBeforeQuickReply = Boolean(
        position &
        Node.DOCUMENT_POSITION_FOLLOWING
      );

      if (!isBeforeQuickReply) {
        return;
      }

      const normalizedTitle = normalizeText(
        element.textContent
      )
        .replace(/[\s:：\-–—]+$/g, "")
        .trim();

      const isQuickReplyTitle =
        normalizedTitle === "reponse rapide" ||
        normalizedTitle === "quick reply";


      if (isQuickReplyTitle) {
        element.classList.add(
          "utppVB_quickreply-legacy-title"
        );
      }
    });
  }

  function enhanceQuickReply() {
    const quickReply = document.querySelector(
      "#quick_reply"
    );

    if (
      !quickReply ||
      quickReply.dataset.quickReplyReady === "true"
    ) {
      return;
    }

    const editorContent = quickReply.querySelector(
      "#textarea_content"
    );

    if (!editorContent) {
      return;
    }


    hideLegacyQuickReplyTitle(
      quickReply
    );

    const header =
      document.createElement("header");

    const icon =
      document.createElement("span");

    const heading =
      document.createElement("span");

    const eyebrow =
      document.createElement("span");

    const title =
      document.createElement("span");

    const subtitle =
      document.createElement("span");


    header.className =
      "utppVB_quickreply-head";

    icon.className =
      "utppVB_quickreply-icon";

    heading.className =
      "utppVB_quickreply-heading";

    eyebrow.className =
      "utppVB_quickreply-eyebrow";

    title.className =
      "utppVB_quickreply-title";

    subtitle.className =
      "utppVB_quickreply-subtitle";


    icon.setAttribute(
      "aria-hidden",
      "true"
    );

    icon.innerHTML =
      '<i data-lucide="message-circle-more"></i>';


    eyebrow.textContent =
      QUICK_REPLY_COPY.eyebrow;

    title.textContent =
      QUICK_REPLY_COPY.title;

    subtitle.textContent =
      QUICK_REPLY_COPY.subtitle;


    heading.append(
      eyebrow,
      title,
      subtitle
    );

    header.append(
      icon,
      heading
    );

    quickReply.insertBefore(
      header,
      editorContent
    );

    const previewButton = quickReply.querySelector(
      'input[type="submit"][name="preview"]'
    );

    const sendButton = quickReply.querySelector(
      'input[type="submit"][name="post"]'
    );

    const actions = sendButton
      ? sendButton.closest("div")
      : null;


    if (previewButton) {
      previewButton.value =
        QUICK_REPLY_COPY.preview;

      previewButton.classList.add(
        "utppVB_quickreply-preview"
      );
    }


    if (sendButton) {
      sendButton.value =
        QUICK_REPLY_COPY.send;

      sendButton.classList.add(
        "utppVB_quickreply-send"
      );
    }


    if (
      actions &&
      actions.parentElement === quickReply
    ) {
      actions.classList.add(
        "utppVB_quickreply-actions"
      );

      actions.removeAttribute(
        "style"
      );
    }

    const editorTextareas = quickReply.querySelectorAll(
      ".sceditor-container textarea"
    );

    editorTextareas.forEach(function (textarea) {
      textarea.setAttribute(
        "placeholder",
        QUICK_REPLY_COPY.placeholder
      );

      textarea.setAttribute(
        "aria-label",
        QUICK_REPLY_COPY.title
      );
    });


    quickReply.dataset.quickReplyReady =
      "true";
  }

  function renderLucideIcons() {
    if (
      window.lucide &&
      typeof window.lucide.createIcons === "function"
    ) {
      window.lucide.createIcons();
    }
  }

  function initTopicTools() {
    setRandomTitleIcons();
    enhancePaginations();
    updateWatchTopicStates();
    enhanceTopicParticipants();
    enhanceQuickReply();
    renderLucideIcons();
  }


  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initTopicTools,
      { once: true }
    );
  } else {
    initTopicTools();
  }
})();
