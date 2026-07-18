/* ==================================================
   PARTICIPANTS DU SUJET
   ================================================== */

function enhanceTopicParticipants() {
  const participants = document.querySelector(
    ".sub-header-buttons__right"
  );

  /*
   * Arrêt si le bloc n’existe pas ou s’il a
   * déjà été transformé.
   */

  if (
    !participants ||
    participants.dataset.participantsReady === "true"
  ) {
    return;
  }


  /*
   * Cette liste contiendra les pseudos et les liens
   * de profil récupérés depuis {POSTERS_LIST}.
   */

  const participantNames = [];


  /* --------------------------------------------------
     AVATARS ET PSEUDOS
     -------------------------------------------------- */

  const participantImages =
    participants.querySelectorAll("img");


  participantImages.forEach(function (image) {
    /*
     * Forumactif place généralement l’avatar
     * dans un lien menant vers le profil.
     */

    const profileLink =
      image.closest("a");

    const avatar =
      profileLink || image.parentElement;


    if (!avatar) {
      return;
    }


    /*
     * Recherche du pseudo dans les informations
     * générées par Forumactif.
     */

    const participantName =
      image.getAttribute("alt") ||
      image.getAttribute("title") ||
      avatar.getAttribute("title") ||
      (
        profileLink
          ? profileLink.textContent.trim()
          : ""
      ) ||
      "Voir le profil";


    /*
     * Certains templates produisent un texte comme
     * “Avatar de Alice”. On conserve seulement Alice.
     */

    const cleanName = participantName
      .replace(
        /^avatar\s+(de|of)\s+/i,
        ""
      )
      .trim();


    /*
     * Classe utilisée pour mettre en forme l’avatar.
     */

    avatar.classList.add(
      "utppVB_participant"
    );


    /*
     * Rend l’avatar accessible au clavier lorsqu’il
     * n’est pas déjà contenu dans un lien.
     */

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


    /*
     * Suppression des tooltips natifs.
     */

    image.removeAttribute(
      "title"
    );

    avatar.removeAttribute(
      "title"
    );


    /*
     * Enregistre le pseudo et son éventuel lien.
     */

    participantNames.push({
      name: cleanName,

      href: profileLink
        ? profileLink.getAttribute("href") || ""
        : ""
    });
  });


  /* --------------------------------------------------
     SUPPRESSION DU COMPTEUR NATIF
     -------------------------------------------------- */

  /*
   * Forumactif génère souvent “2 participants”
   * sous forme de texte brut. Le TreeWalker permet
   * de le retrouver sans toucher aux avatars.
   */

  const textNodes = [];

  const walker = document.createTreeWalker(
    participants,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function (node) {
        /*
         * Ignore le contenu éventuel d’un avatar
         * ou d’un lien de profil.
         */

        const parentElement =
          node.parentElement;

        const isInsideParticipant =
          parentElement &&
          parentElement.closest(
            ".utppVB_participant"
          );


        if (isInsideParticipant) {
          return NodeFilter.FILTER_REJECT;
        }


        const containsParticipantCount =
          /participants?/i.test(
            node.textContent
          );


        return containsParticipantCount
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


  /*
   * Supprime “2 participants”.
   */

  textNodes.forEach(function (textNode) {
    textNode.remove();
  });


  /* --------------------------------------------------
     CRÉATION DE LA LISTE DES PSEUDOS
     -------------------------------------------------- */

  if (participantNames.length) {
    const names =
      document.createElement("span");


    names.className =
      "utppVB_participants-names";


    participantNames.forEach(function (participant) {
      /*
       * Si un lien de profil existe, le pseudo devient
       * lui-même cliquable.
       */

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


  /*
   * Active la mise en forme CSS de la capsule.
   */

  participants.classList.add(
    "utppVB_participants-ready"
  );

  participants.dataset.participantsReady =
    "true";
}
