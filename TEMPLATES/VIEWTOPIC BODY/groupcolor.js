$(document).ready(function() {

  const groupNames = {
    3: "l'omniscient",
    4: "bones beneath fire",
    5: "smoke through hearts",
    6: "blood within stone",
    7: "ashes among thorns",
  };

  $('.utppVB_posttracker').each(function() {

    const $tracker = $(this);

    const $pseudo = $tracker.find('.utppVB_postname span[class*="group-"]');
    if (!$pseudo.length) return;

    const match = $pseudo.attr('class').match(/group-(\d+)/);
    if (!match) return;

    const groupId = match[1];
    const groupName = groupNames[groupId] || "";
    const groupColor = $pseudo.css("color") || "#666";

    // Nom du groupe
    const $groupLabel = $tracker.find('.group-label');

    if ($groupLabel.length) {
      $groupLabel.text(groupName);
    }

    // Bordure sous le pseudo
    $pseudo.css({
      "border-bottom": "3px solid " + groupColor,
      "padding-bottom": "2px",
      "display": "inline-block"
    });

  });

});
