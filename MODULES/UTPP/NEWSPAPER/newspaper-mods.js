(function () {
  "use strict";

  /*
   * NEWSPAPER — prototype public V0.1
   * ---------------------------------
   * Le module est visible par tous.
   * Les éditions sont définies dans NEWSPAPER_DATA, ci-dessous.
   *
   * Pour publier une nouvelle édition :
   * 1. duplique un objet d'édition ;
   * 2. donne-lui un id unique ;
   * 3. place-la en première position dans le tableau.
   */

  const NEWSPAPER = {
    title: "NEWSPAPER",
    subtitle: "Le journal inRP de Philadelphie",
    icon: "newspaper",
    readStoragePrefix: "newspaper-read-v1"
  };

  const NEWSPAPER_DATA = [
    {
      id: "edition-2026-07-12",
      number: "018",
      date: "2026-07-12",
      city: "PHILADELPHIE",
      editionLabel: "ÉDITION DU DIMANCHE",
      tagline: "Toute la ville, une histoire à la fois.",
      articles: [
        {
          id: "night-transit",
          section: "À la une",
          kicker: "TRANSPORTS",
          layout: "lead",
          title: "La ville prolonge plusieurs lignes de nuit après des semaines de perturbations",
          dek: "La mesure doit soulager les travailleurs nocturnes, mais les syndicats demandent encore des garanties sur les effectifs et la sécurité.",
          author: "Mara Whitmore",
          readTime: "4 min",
          body: [
            "À compter de vendredi, plusieurs lignes traversant Center City resteront en service plus tard dans la nuit. La municipalité présente cette extension comme une réponse directe aux difficultés rencontrées par les habitants dont les horaires ne correspondent plus aux dernières dessertes régulières.",
            "Dans les stations concernées, la nouvelle a été accueillie avec un mélange de soulagement et de prudence. Des employés de restaurants, d’hôpitaux et de commerces de nuit expliquent avoir parfois dû consacrer une part importante de leur salaire à des trajets de remplacement.",
            "Les représentants syndicaux demandent toutefois que l’extension ne repose pas sur des équipes déjà sous tension. La mairie promet un premier bilan après quatre semaines d’expérimentation.",
            "Pour les habitants, la mesure pourrait surtout modifier les habitudes du week-end : certains établissements annoncent déjà envisager des horaires plus tardifs."
          ],
          pullQuote: "Une ville ne s’arrête pas de vivre lorsque les bureaux ferment."
        },
        {
          id: "warehouse-project",
          section: "Quartiers",
          kicker: "SOUTH PHILLY",
          layout: "side",
          title: "Un ancien entrepôt au cœur d’un projet qui divise le voisinage",
          dek: "Logements, ateliers et commerces sont annoncés sur le site, tandis que les riverains redoutent une nouvelle hausse des loyers.",
          author: "Eli Carter",
          readTime: "3 min",
          body: [
            "Le vaste bâtiment de briques est vide depuis près de six ans. Un promoteur souhaite aujourd’hui y créer des logements, des ateliers d’artisans et plusieurs cellules commerciales.",
            "Les partisans du projet évoquent la remise en état d’un site dégradé. Ses opposants craignent que l’opération accélère la transformation du quartier et rende les logements voisins moins accessibles.",
            "Une réunion publique est prévue mardi soir dans une école voisine. La municipalité indique qu’aucune décision définitive ne sera prise avant la fin de la période de consultation."
          ]
        },
        {
          id: "market-street-witnesses",
          section: "Police & justice",
          kicker: "APPEL À TÉMOINS",
          layout: "side",
          title: "La police recherche des témoins après une collision nocturne près de Market Street",
          dek: "Un véhicule a quitté les lieux avant l’arrivée des secours. Les enquêteurs tentent de reconstituer son itinéraire.",
          author: "Noah Bennett",
          readTime: "2 min",
          body: [
            "Les enquêteurs sollicitent les personnes présentes dans le secteur peu après minuit vendredi. Selon les premiers éléments, un véhicule sombre aurait heurté un cycliste avant de poursuivre sa route vers l’ouest.",
            "La victime a été hospitalisée et son état est décrit comme stable. Plusieurs commerces ont transmis leurs enregistrements de vidéosurveillance.",
            "La police demande aux automobilistes disposant d’une caméra embarquée de vérifier leurs images, même si aucun choc n’y apparaît directement."
          ]
        },
        {
          id: "diner-last-week",
          section: "Économie",
          kicker: "COMMERCE LOCAL",
          layout: "standard",
          title: "Après trente-quatre ans de service, le Melrose Corner servira ses derniers cafés",
          dek: "Le petit diner familial fermera dimanche prochain. Ses propriétaires invoquent la hausse des charges et l’épuisement.",
          author: "June Holloway",
          readTime: "3 min",
          body: [
            "Depuis l’annonce, les habitués se succèdent au comptoir pour commander une dernière fois les pancakes de la maison ou simplement saluer l’équipe.",
            "La famille propriétaire affirme avoir refusé plusieurs offres de reprise qui auraient profondément changé l’établissement. Le bâtiment, lui, devrait être remis en vente.",
            "Un livre de souvenirs a été installé près de la caisse. Les messages laissés par les clients racontent des premiers rendez-vous, des fins de service et des petits-déjeuners pris après des nuits trop longues."
          ],
          pullQuote: "On ne ferme pas seulement une cuisine. On ferme un endroit où les gens savaient qu’ils seraient reconnus."
        },
        {
          id: "cinema-reopening",
          section: "Culture & sorties",
          kicker: "RÉOUVERTURE",
          layout: "standard",
          title: "Le Rialto rallume son enseigne et promet des séances jusqu’à minuit",
          dek: "Après dix-huit mois de travaux, la salle historique revient avec une programmation de classiques, de films indépendants et de nuits thématiques.",
          author: "Amelia Frost",
          readTime: "3 min",
          body: [
            "Le hall conserve ses moulures, son ancien guichet et une partie des fauteuils restaurés. Derrière cette apparence familière, l’équipement de projection et le système sonore ont été entièrement remplacés.",
            "La soirée d’ouverture affichait complet avant même l’annonce du programme détaillé. Les propriétaires souhaitent réserver certains créneaux à des associations et à des écoles de la ville.",
            "Une séance surprise est annoncée samedi à 23 h 45. Le titre ne sera révélé qu’au lever du rideau."
          ]
        },
        {
          id: "boxing-title",
          section: "Sports",
          kicker: "BOXE",
          layout: "standard",
          title: "Un petit gymnase de North Philadelphia célèbre un titre inattendu",
          dek: "La victoire de l’une de ses jeunes athlètes attire soudain les regards sur une salle jusque-là menacée de fermeture.",
          author: "Caleb Ross",
          readTime: "2 min",
          body: [
            "Les murs sont couverts de photographies anciennes et les sacs de frappe portent les traces de plusieurs générations. Samedi, la salle a pourtant accueilli plus de monde qu’elle ne pouvait raisonnablement en contenir.",
            "La victoire obtenue la veille a suscité une collecte spontanée afin de financer les réparations du toit. L’entraîneur refuse de parler de sauvetage, mais reconnaît que les prochains mois paraissent désormais moins incertains."
          ]
        },
        {
          id: "night-noise-opinion",
          section: "Opinions",
          kicker: "ÉDITORIAL",
          layout: "standard",
          title: "La ville nocturne mérite mieux qu’une opposition entre silence et liberté",
          dek: "Durcir les règles sans investir dans la médiation ne fera que déplacer les conflits d’une rue à l’autre.",
          author: "La rédaction",
          readTime: "4 min",
          body: [
            "Les plaintes liées au bruit augmentent, tout comme la fréquentation des quartiers où bars, salles de concert et logements se côtoient. Présenter la situation comme un choix entre habitants et vie nocturne est une manière commode d’éviter le véritable débat.",
            "La ville dispose d’outils de contrôle, mais très peu de dispositifs de médiation. Les établissements respectueux des règles sont traités comme ceux qui les ignorent, tandis que les riverains ne savent souvent pas à qui s’adresser avant que la situation ne dégénère.",
            "Une politique sérieuse devrait associer horaires lisibles, isolation des bâtiments, interlocuteurs identifiés et sanctions réellement appliquées lorsque le dialogue échoue."
          ]
        },
        {
          id: "weekend-briefs",
          section: "En bref",
          kicker: "LA VILLE EN 90 SECONDES",
          layout: "brief",
          title: "Rue fermée, bibliothèque prolongée et marché déplacé : ce qu’il faut savoir ce week-end",
          dek: "Trois informations pratiques susceptibles de modifier les plans des habitants.",
          author: "Desk municipal",
          readTime: "1 min",
          body: [
            "Une portion de Walnut Street sera fermée dimanche matin pour des travaux d’urgence sur une conduite.",
            "La bibliothèque centrale prolongera exceptionnellement son ouverture jusqu’à 22 heures vendredi.",
            "Le marché habituellement installé sur la place voisine sera déplacé de deux rues en raison d’un événement privé."
          ]
        },
        {
          id: "classifieds-018",
          section: "Petites annonces",
          kicker: "SERVICES, EMPLOIS & OBJETS TROUVÉS",
          layout: "classifieds",
          title: "Les petites annonces de la semaine",
          dek: "Des occasions minuscules, des problèmes très concrets et parfois le début d’une histoire.",
          author: "Service des annonces",
          readTime: "2 min",
          body: [
            "EMPLOI — Bar de quartier recherche une personne disponible trois soirs par semaine. Expérience appréciée, sang-froid indispensable.",
            "LOGEMENT — Chambre à louer dans une maison partagée à West Philadelphia. Animaux acceptés, musiciens à discuter.",
            "OBJET TROUVÉ — Appareil photo argentique retrouvé dans un bus de nuit. Plusieurs clichés semblent déjà exposés.",
            "SERVICE — Pianiste recherché pour remplacer au pied levé un musicien samedi soir.",
            "PERDU — Chien brun de taille moyenne, collier bleu, aperçu pour la dernière fois près d’un terrain de basket."
          ]
        }
      ]
    },
    {
      id: "edition-2026-07-05",
      number: "017",
      date: "2026-07-05",
      city: "PHILADELPHIE",
      editionLabel: "ÉDITION DU DIMANCHE",
      tagline: "Toute la ville, une histoire à la fois.",
      articles: [
        {
          id: "heat-centers",
          section: "À la une",
          kicker: "VAGUE DE CHALEUR",
          layout: "lead",
          title: "Les centres de rafraîchissement étendent leurs horaires dans plusieurs quartiers",
          dek: "Les associations demandent une attention particulière pour les personnes isolées et les travailleurs exposés.",
          author: "Mara Whitmore",
          readTime: "4 min",
          body: [
            "Plusieurs équipements municipaux resteront ouverts jusqu’en soirée durant toute la semaine. La décision concerne notamment des bibliothèques, des centres communautaires et certaines salles de sport.",
            "Des équipes mobiles distribueront également de l’eau et des informations aux personnes ne pouvant pas facilement rejoindre ces lieux.",
            "Les autorités recommandent aux habitants de vérifier régulièrement la situation de leurs voisins âgés ou isolés."
          ]
        },
        {
          id: "school-garden",
          section: "Quartiers",
          kicker: "WEST PHILADELPHIA",
          layout: "side",
          title: "Une cour d’école abandonnée devient un jardin partagé",
          dek: "Le projet réunit enseignants, familles et habitants autour de parcelles cultivées collectivement.",
          author: "Eli Carter",
          readTime: "2 min",
          body: [
            "Les premières plantations ont été réalisées au printemps. Les responsables espèrent désormais maintenir l’accès au jardin pendant les vacances.",
            "Une petite partie de la récolte sera distribuée à une association locale, le reste étant réservé aux familles participantes."
          ]
        },
        {
          id: "museum-night",
          section: "Culture & sorties",
          kicker: "NUIT DES MUSÉES",
          layout: "side",
          title: "Plusieurs institutions ouvriront gratuitement leurs portes vendredi soir",
          dek: "Concerts, visites guidées et installations temporaires sont annoncés jusqu’à minuit.",
          author: "Amelia Frost",
          readTime: "2 min",
          body: [
            "Les organisateurs recommandent de réserver les visites les plus demandées. Des navettes gratuites relieront trois des principaux sites.",
            "Plusieurs artistes locaux proposeront également des performances dans les cours et les halls d’entrée."
          ]
        },
        {
          id: "rent-hearing",
          section: "Politique locale",
          kicker: "CONSEIL MUNICIPAL",
          layout: "standard",
          title: "Une audience publique sur les loyers attire une foule inhabituelle",
          dek: "Locataires, propriétaires et associations ont livré des témoignages parfois contradictoires.",
          author: "Noah Bennett",
          readTime: "3 min",
          body: [
            "La séance a dû être prolongée afin de permettre aux personnes inscrites de prendre la parole. Plusieurs habitants ont décrit des augmentations difficiles à absorber.",
            "Les représentants de petits propriétaires affirment de leur côté subir une hausse rapide des coûts d’entretien.",
            "Aucun vote n’était prévu lors de cette audience, mais plusieurs propositions doivent être examinées à l’automne."
          ]
        },
        {
          id: "classifieds-017",
          section: "Petites annonces",
          kicker: "SERVICES, EMPLOIS & OBJETS TROUVÉS",
          layout: "classifieds",
          title: "Les petites annonces de la semaine",
          dek: "Une sélection de messages publiés par les habitants.",
          author: "Service des annonces",
          readTime: "1 min",
          body: [
            "EMPLOI — Librairie indépendante recherche une aide ponctuelle pour inventaire.",
            "PERDU — Trousseau de clés avec porte-clés en forme d’avion en papier.",
            "VENTE — Vélo ancien à restaurer, prix à débattre.",
            "RECHERCHE — Partenaire d’échecs pour rencontres hebdomadaires dans un café du centre."
          ]
        }
      ]
    }
  ];

  let currentEditionIndex = 0;
  let currentSection = "all";
  let currentArticleId = null;
  let lastFocusedElement = null;

  function waitForBody(callback) {
    if (!document.body) {
      setTimeout(() => waitForBody(callback), 100);
      return;
    }

    callback();
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function getCurrentUserId() {
    const possibleIds = [
      window._userdata?.user_id,
      window._userdata?.userid,
      window._userdata?.id
    ];

    for (const value of possibleIds) {
      const parsed = Number(value);

      if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
      }
    }

    const profileLink = document.querySelector('a[href^="/u"]');
    const match = profileLink?.getAttribute("href")?.match(/^\/u(\d+)/);

    return match ? Number(match[1]) : "guest";
  }

  function getReadStorageKey() {
    return `${NEWSPAPER.readStoragePrefix}-u${getCurrentUserId()}`;
  }

  function getLatestEditionSignature() {
    const latest = NEWSPAPER_DATA[0];

    if (!latest) {
      return "";
    }

    return `${latest.id}:${latest.articles.length}`;
  }

  function hasReadLatestEdition() {
    try {
      return localStorage.getItem(getReadStorageKey()) === getLatestEditionSignature();
    } catch (error) {
      return false;
    }
  }

  function markLatestEditionAsRead() {
    try {
      localStorage.setItem(getReadStorageKey(), getLatestEditionSignature());
    } catch (error) {
      console.warn("[NEWSPAPER] Impossible d’enregistrer l’état de lecture.", error);
    }

    updateCount();
  }

  function formatDate(dateValue, options = {}) {
    const date = new Date(`${dateValue}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat("fr-FR", {
      weekday: options.withWeekday ? "long" : undefined,
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  }

  function refreshLucideIcons() {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }

function ensureToggleButton() {
  const toggle = document.querySelector("#newspaper-toggle");

  if (!toggle) {
    console.warn(
      "[NEWSPAPER] Bouton #newspaper-toggle introuvable. Le module n’est pas initialisé."
    );

    return null;
  }

  return toggle;
}

  function createNewspaperRoot() {
    document.querySelector("#newspaper-root")?.remove();

    const root = document.createElement("section");
    root.id = "newspaper-root";
    root.className = "newspaper-root";
    root.hidden = true;

    root.innerHTML = `
      <div class="newspaper-backdrop" data-newspaper-close></div>

      <div
        class="newspaper-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="newspaper-module-title"
      >
        <header class="newspaper-app-header">
          <div class="newspaper-app-heading">
            <i data-lucide="${NEWSPAPER.icon}"></i>

            <div>
              <strong id="newspaper-module-title">${escapeHTML(NEWSPAPER.title)}</strong>
              <span>${escapeHTML(NEWSPAPER.subtitle)}</span>
            </div>
          </div>

          <button
            class="newspaper-close"
            type="button"
            title="Fermer"
            aria-label="Fermer Newspaper"
            data-newspaper-close
          >
            <i data-lucide="x"></i>
          </button>
        </header>

        <main class="newspaper-paper">
          <section class="newspaper-edition" aria-live="polite"></section>
        </main>

        <section class="newspaper-reader" hidden aria-live="polite">
          <header class="newspaper-reader-header">
            <button
              class="newspaper-reader-back"
              type="button"
              data-reader-close
            >
              <i data-lucide="arrow-left"></i>
              <span>Retour à l’édition</span>
            </button>

            <span class="newspaper-reader-edition"></span>
          </header>

          <div class="newspaper-reader-scroll">
            <article class="newspaper-reader-article"></article>
          </div>
        </section>
      </div>
    `;

    document.body.appendChild(root);

    return root;
  }

  function getCurrentEdition() {
    return NEWSPAPER_DATA[currentEditionIndex] || NEWSPAPER_DATA[0];
  }

  function getSections(edition) {
    return [...new Set(edition.articles.map(article => article.section))];
  }

  function getArticleById(articleId) {
    return getCurrentEdition()?.articles.find(article => article.id === articleId);
  }

  function renderIssueControls(edition) {
    const olderDisabled = currentEditionIndex >= NEWSPAPER_DATA.length - 1;
    const newerDisabled = currentEditionIndex <= 0;

    return `
      <div class="newspaper-issue-controls">
        <button
          type="button"
          class="newspaper-issue-step"
          data-issue-step="1"
          ${olderDisabled ? "disabled" : ""}
          title="Édition précédente"
          aria-label="Édition précédente"
        >
          <i data-lucide="chevron-left"></i>
        </button>

        <label class="newspaper-issue-select-wrap">
          <span>Archives</span>

          <select id="newspaper-issue-select" aria-label="Choisir une édition">
            ${NEWSPAPER_DATA.map((item, index) => `
              <option value="${index}" ${index === currentEditionIndex ? "selected" : ""}>
                N° ${escapeHTML(item.number)} — ${escapeHTML(formatDate(item.date))}
              </option>
            `).join("")}
          </select>
        </label>

        <button
          type="button"
          class="newspaper-issue-step"
          data-issue-step="-1"
          ${newerDisabled ? "disabled" : ""}
          title="Édition suivante"
          aria-label="Édition suivante"
        >
          <i data-lucide="chevron-right"></i>
        </button>
      </div>
    `;
  }

  function renderSectionNavigation(edition) {
    const sections = getSections(edition);

    return `
      <nav class="newspaper-sections" aria-label="Rubriques du journal">
        <button
          type="button"
          class="${currentSection === "all" ? "is-active" : ""}"
          data-section="all"
        >
          Toutes
        </button>

        ${sections.map(section => `
          <button
            type="button"
            class="${currentSection === section ? "is-active" : ""}"
            data-section="${escapeHTML(section)}"
          >
            ${escapeHTML(section)}
          </button>
        `).join("")}
      </nav>
    `;
  }

  function renderStoryCard(article, size = "standard") {
    const effectiveSize = size || article.layout || "standard";

    return `
      <button
        type="button"
        class="newspaper-story newspaper-story-${escapeHTML(effectiveSize)}"
        data-article-id="${escapeHTML(article.id)}"
      >
        <span class="newspaper-story-kicker">${escapeHTML(article.kicker)}</span>
        <strong>${escapeHTML(article.title)}</strong>
        <span class="newspaper-story-dek">${escapeHTML(article.dek)}</span>

        <span class="newspaper-story-footer">
          <span>Par ${escapeHTML(article.author)}</span>
          <span>${escapeHTML(article.readTime)}</span>
        </span>
      </button>
    `;
  }

  function renderFrontPage(edition, articles) {
    const lead = articles.find(article => article.layout === "lead") || articles[0];
    const side = articles
      .filter(article => article.id !== lead?.id && article.layout === "side")
      .slice(0, 2);

    const usedIds = new Set([
      lead?.id,
      ...side.map(article => article.id)
    ].filter(Boolean));

    const remaining = articles.filter(article => !usedIds.has(article.id));
    const classifieds = remaining.filter(article => article.layout === "classifieds");
    const regular = remaining.filter(article => article.layout !== "classifieds");

    return `
      <div class="newspaper-front-page">
        <section class="newspaper-lead-column">
          ${lead ? renderStoryCard(lead, "lead") : ""}
        </section>

        <aside class="newspaper-side-column">
          ${side.map(article => renderStoryCard(article, "side")).join("")}
        </aside>
      </div>

      ${regular.length ? `
        <section class="newspaper-stories-grid">
          ${regular.map(article =>
            renderStoryCard(
              article,
              article.layout === "brief" ? "brief" : "standard"
            )
          ).join("")}
        </section>
      ` : ""}

      ${classifieds.length ? `
        <section class="newspaper-classifieds-strip">
          ${classifieds.map(article => renderStoryCard(article, "classifieds")).join("")}
        </section>
      ` : ""}
    `;
  }

  function renderFilteredSection(edition, articles) {
    return `
      <header class="newspaper-section-heading">
        <span>RUBRIQUE</span>
        <h2>${escapeHTML(currentSection)}</h2>
        <p>${articles.length} article${articles.length > 1 ? "s" : ""} dans cette édition.</p>
      </header>

      <section class="newspaper-filtered-grid">
        ${articles.map(article =>
          renderStoryCard(
            article,
            article.layout === "classifieds" ? "classifieds" : "standard"
          )
        ).join("")}
      </section>
    `;
  }

  function renderEdition() {
    const container = document.querySelector("#newspaper-root .newspaper-edition");
    const edition = getCurrentEdition();

    if (!container || !edition) {
      return;
    }

    const allArticles = edition.articles;
    const visibleArticles = currentSection === "all"
      ? allArticles
      : allArticles.filter(article => article.section === currentSection);

    container.innerHTML = `
      <header class="newspaper-masthead">
        <div class="newspaper-masthead-top">
          <span>N° ${escapeHTML(edition.number)}</span>
          <span>${escapeHTML(edition.city)}</span>
          <span>${escapeHTML(edition.editionLabel)}</span>
        </div>

        <div class="newspaper-name">${escapeHTML(NEWSPAPER.title)}</div>

        <div class="newspaper-masthead-bottom">
          <span>${escapeHTML(formatDate(edition.date, { withWeekday: true }))}</span>
          <em>${escapeHTML(edition.tagline)}</em>
          <span>${allArticles.length} articles</span>
        </div>
      </header>

      <div class="newspaper-toolbar">
        ${renderIssueControls(edition)}
        ${renderSectionNavigation(edition)}
      </div>

      <div class="newspaper-content">
        ${currentSection === "all"
          ? renderFrontPage(edition, visibleArticles)
          : renderFilteredSection(edition, visibleArticles)
        }
      </div>

      <footer class="newspaper-edition-footer">
        <span>NEWSPAPER — édition fictive destinée au jeu de rôle</span>
        <span>N° ${escapeHTML(edition.number)}</span>
      </footer>
    `;

    refreshLucideIcons();
  }

  function renderArticle(article) {
    const reader = document.querySelector("#newspaper-root .newspaper-reader");
    const articleContainer = document.querySelector(
      "#newspaper-root .newspaper-reader-article"
    );
    const editionLabel = document.querySelector(
      "#newspaper-root .newspaper-reader-edition"
    );
    const edition = getCurrentEdition();

    if (!reader || !articleContainer || !article || !edition) {
      return;
    }

    editionLabel.textContent =
      `N° ${edition.number} — ${formatDate(edition.date)}`;

    articleContainer.innerHTML = `
      <header class="newspaper-article-heading">
        <span class="newspaper-article-section">${escapeHTML(article.section)}</span>
        <span class="newspaper-article-kicker">${escapeHTML(article.kicker)}</span>
        <h1>${escapeHTML(article.title)}</h1>
        <p class="newspaper-article-dek">${escapeHTML(article.dek)}</p>

        <div class="newspaper-article-byline">
          <span>Par <strong>${escapeHTML(article.author)}</strong></span>
          <span>${escapeHTML(article.readTime)} de lecture</span>
        </div>
      </header>

      <div class="newspaper-article-body">
        ${article.body.map((paragraph, index) => `
          ${article.pullQuote && index === 1 ? `
            <blockquote>${escapeHTML(article.pullQuote)}</blockquote>
          ` : ""}
          <p>${escapeHTML(paragraph)}</p>
        `).join("")}
      </div>

      <footer class="newspaper-article-end">
        <span>Fin de l’article</span>
        <button type="button" data-reader-close>
          Retour à l’édition
        </button>
      </footer>
    `;

    reader.hidden = false;
    document
      .querySelector("#newspaper-root .newspaper-reader-scroll")
      ?.scrollTo({ top: 0, behavior: "auto" });

    refreshLucideIcons();

    setTimeout(() => {
      document.querySelector("#newspaper-root .newspaper-reader-back")?.focus();
    }, 30);
  }

  function openArticle(articleId) {
    const article = getArticleById(articleId);

    if (!article) {
      return;
    }

    currentArticleId = articleId;
    renderArticle(article);
  }

  function closeArticle() {
    const reader = document.querySelector("#newspaper-root .newspaper-reader");

    if (!reader || reader.hidden) {
      return;
    }

    reader.hidden = true;

    const previousArticleId = currentArticleId;
    currentArticleId = null;

    setTimeout(() => {
      [...document.querySelectorAll("#newspaper-root [data-article-id]")]
        .find(element => element.dataset.articleId === previousArticleId)
        ?.focus();
    }, 30);
  }

  function updateCount() {
    const countElement = document.querySelector("#newspaper-count");
    const latest = NEWSPAPER_DATA[0];

    if (!countElement || !latest) {
      return;
    }

    const unreadCount = hasReadLatestEdition() ? 0 : latest.articles.length;

    countElement.textContent = unreadCount ? String(unreadCount) : "";
    countElement.hidden = unreadCount === 0;
  }

  function openNewspaper() {
    const root = document.querySelector("#newspaper-root");
    const toggle = document.querySelector("#newspaper-toggle");

    if (!root || !toggle) {
      return;
    }

    lastFocusedElement = document.activeElement;
    root.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("newspaper-is-open");

    renderEdition();
    markLatestEditionAsRead();
    refreshLucideIcons();

    setTimeout(() => {
      document
        .querySelector("#newspaper-root .newspaper-issue-select-wrap select")
        ?.focus();
    }, 40);
  }

  function closeNewspaper() {
    const root = document.querySelector("#newspaper-root");
    const toggle = document.querySelector("#newspaper-toggle");

    if (!root || !toggle) {
      return;
    }

    closeArticle();
    root.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("newspaper-is-open");

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  }

  function toggleNewspaper() {
    const root = document.querySelector("#newspaper-root");

    if (!root) {
      return;
    }

    if (root.hidden) {
      openNewspaper();
    } else {
      closeNewspaper();
    }
  }

  function changeEdition(nextIndex) {
    const safeIndex = Math.min(
      NEWSPAPER_DATA.length - 1,
      Math.max(0, Number(nextIndex) || 0)
    );

    currentEditionIndex = safeIndex;
    currentSection = "all";
    closeArticle();
    renderEdition();
  }

  function bindEvents(toggle, root) {
    toggle.addEventListener("click", toggleNewspaper);

    root.addEventListener("click", event => {
      if (event.target.closest("[data-newspaper-close]")) {
        closeNewspaper();
        return;
      }

      if (event.target.closest("[data-reader-close]")) {
        closeArticle();
        return;
      }

      const articleButton = event.target.closest("[data-article-id]");

      if (articleButton) {
        openArticle(articleButton.dataset.articleId);
        return;
      }

      const sectionButton = event.target.closest("[data-section]");

      if (sectionButton) {
        currentSection = sectionButton.dataset.section || "all";
        renderEdition();
        return;
      }

      const stepButton = event.target.closest("[data-issue-step]");

      if (stepButton && !stepButton.disabled) {
        changeEdition(
          currentEditionIndex + Number(stepButton.dataset.issueStep || 0)
        );
      }
    });

    root.addEventListener("change", event => {
      if (event.target.matches("#newspaper-issue-select")) {
        changeEdition(event.target.value);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") {
        return;
      }

      const reader = document.querySelector("#newspaper-root .newspaper-reader");
      const newspaperRoot = document.querySelector("#newspaper-root");

      if (!reader?.hidden) {
        closeArticle();
        return;
      }

      if (newspaperRoot && !newspaperRoot.hidden) {
        closeNewspaper();
      }
    });
  }

  function initNewspaper() {
    if (!NEWSPAPER_DATA.length) {
      console.warn("[NEWSPAPER] Aucune édition configurée.");
      return;
    }

    const toggle = ensureToggleButton();

    if (!toggle) {
      return;
    }

    const root = createNewspaperRoot();

    bindEvents(toggle, root);
    updateCount();
    refreshLucideIcons();
  }

  waitForBody(initNewspaper);
})();
