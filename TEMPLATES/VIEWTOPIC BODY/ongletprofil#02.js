jQuery(function ($) {
  "use strict";

  const fieldsToMove = [
    "feat",
    "date d'inscription",
    "messages"
  ];

  function normalizeLabel(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s*:\s*$/, "")
      .trim()
      .toLowerCase();
  }

  $(".utppVB_postprofile .post").each(function () {
    const $post = $(this);

    /*
     * On cherche uniquement la destination
     * appartenant à ce message.
     */
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

        if (fieldsToMove.includes(label)) {
          $destination.append($field);
        }
      });
  });
});
