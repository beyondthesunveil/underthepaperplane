document.addEventListener("DOMContentLoaded", function () {
  const root = document.documentElement;
  const button = document.getElementById("utppUC-layout-toggle");
  const storageKey = "utppUC_categoryLayout";

  if (!button) {
    console.error("Bouton #utppUC-layout-toggle introuvable.");
    return;
  }

  let currentLayout = "classic";

  try {
    currentLayout =
      localStorage.getItem(storageKey) || "classic";
  } catch (error) {
    currentLayout = "classic";
  }

  function applyLayout(layout) {
    const selectedLayout =
      layout === "worked" ? "worked" : "classic";

    root.setAttribute(
      "data-utppuc-layout",
      selectedLayout
    );

    const isClassic =
      selectedLayout === "classic";

    button.setAttribute(
      "aria-pressed",
      String(isClassic)
    );

    button.title = isClassic
      ? "Activer la vue travaillée"
      : "Activer la vue classique";

    console.log(
      "Mise en page active :",
      selectedLayout
    );
  }

  applyLayout(currentLayout);

  button.addEventListener("click", function () {
    const current =
      root.getAttribute(
        "data-utppuc-layout"
      );

    const next =
      current === "classic"
        ? "worked"
        : "classic";

    applyLayout(next);

    try {
      localStorage.setItem(
        storageKey,
        next
      );
    } catch (error) {
      console.warn(
        "Impossible de mémoriser la mise en page."
      );
    }
  });
});
