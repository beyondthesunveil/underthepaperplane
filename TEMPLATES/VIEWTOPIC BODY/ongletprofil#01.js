window.__UTPP_PROFILE_FIELDS_LOADED__ = "v2";

(function () {
  "use strict";

  if (typeof window.jQuery !== "function") {
    console.error(
      "[CHAMPS PROFIL] jQuery n’est pas disponible."
    );

    return;
  }

  const $ = window.jQuery;

  const FIELDS_TO_MOVE = new Set([
    "feat",
    "date d'inscription",
    "messages"
  ]);

  function normalizeLabel(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s*:\s*$/, "")
      .trim()
      .toLocaleLowerCase("fr");
  }

  function moveProfileFields() {
    $(".utppVB_postprofile .post").each(
      function () {
        const $post = $(this);

        const $destination = $post
          .find(".systab .other")
          .first();

        if (!$destination.length) {
          return;
        }

        $post
          .find(".utppVB_charafield")
          .each(function () {
            const $field = $(this);

            const label = normalizeLabel(
              $field
                .find(".utppVB_charalabel")
                .first()
                .text()
            );

            if (FIELDS_TO_MOVE.has(label)) {
              $destination.append($field);
            }
          });
      }
    );

    console.info(
      "[CHAMPS PROFIL] Déplacement terminé."
    );
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      moveProfileFields,
      { once: true }
    );
  } else {
    moveProfileFields();
  }
})();
