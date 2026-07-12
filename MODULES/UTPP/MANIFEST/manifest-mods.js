(function () {
  "use strict";

  const MANIFEST = {
    allowedUsers: [1], // Ajoute d'autres IDs ici : [1, 2, 7]
    storagePrefix: "manifest-v1",
    title: "MANIFEST",

    categories: [
      {
        id: "design",
        label: "Graphisme",
        icon: "palette"
      },
      {
        id: "code",
        label: "Code",
        icon: "code-2"
      },
      {
        id: "daily",
        label: "Check quotidien",
        icon: "calendar-check"
      },
      {
        id: "profiles",
        label: "Fiches perso",
        icon: "contact-round"
      },
      {
        id: "partners",
        label: "Partenaires",
        icon: "handshake"
      }
    ]
  };

  let currentCategory = MANIFEST.categories[0].id;
  let currentUserId = null;
  let state = null;

  function waitForBody(callback) {
    if (!document.body) {
      setTimeout(() => waitForBody(callback), 100);
      return;
    }

    callback();
  }

  function escapeHTML(value) {
    return String(value || "").replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function generateId() {
    return `manifest-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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

    const profileLinks = [
      document.querySelector('#page-header a[href^="/u"]'),
      document.querySelector('.navbar a[href^="/u"]'),
      document.querySelector('a[href^="/u"][title*="Profil"]'),
      document.querySelector('a[href^="/u"]')
    ];

    for (const link of profileLinks) {
      const match = link?.getAttribute("href")?.match(/^\/u(\d+)/);

      if (match) {
        return Number(match[1]);
      }
    }

    return null;
  }

  function getStorageKey() {
    return `${MANIFEST.storagePrefix}-u${currentUserId}`;
  }

  function createEmptyState() {
    return {
      version: 1,
      tasks: [],
      updatedAt: Date.now()
    };
  }

  function loadState() {
    const raw = localStorage.getItem(getStorageKey());

    if (!raw) {
      return createEmptyState();
    }

    try {
      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed.tasks)) {
        return createEmptyState();
      }

      return {
        version: 1,
        tasks: parsed.tasks,
        updatedAt: parsed.updatedAt || Date.now()
      };
    } catch (error) {
      console.warn("[MANIFEST] Sauvegarde illisible :", error);
      return createEmptyState();
    }
  }

  function saveState() {
    state.updatedAt = Date.now();
    localStorage.setItem(getStorageKey(), JSON.stringify(state));
    updateCount();
  }

  function refreshLucideIcons() {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }

  function ensureToggleButton() {
    let toggle = document.querySelector("#manifest-toggle");

    if (toggle) {
      return toggle;
    }

    /*
     * Solution de secours :
     * si le bouton n'est pas présent dans le template,
     * le script essaie de le placer après LOGBOOK.
     */
    const logbookToggle = document.querySelector("#logbook-toggle");

    if (!logbookToggle) {
      console.warn(
        "[MANIFEST] Bouton #manifest-toggle introuvable et aucun #logbook-toggle disponible."
      );

      return null;
    }

    toggle = document.createElement("button");
    toggle.id = "manifest-toggle";
    toggle.type = "button";
    toggle.title = "Manifest";
    toggle.setAttribute("aria-controls", "manifest-root");
    toggle.setAttribute("aria-expanded", "false");

    toggle.innerHTML = `
      <i data-lucide="clipboard-check"></i>
      <span id="manifest-count"></span>
    `;

    logbookToggle.insertAdjacentElement("afterend", toggle);

    return toggle;
  }

  function createManifestRoot() {
    document.querySelector("#manifest-root")?.remove();

    const root = document.createElement("section");
    root.id = "manifest-root";
    root.className = "manifest-root";
    root.hidden = true;

    root.innerHTML = `
      <div class="manifest-backdrop" data-manifest-close></div>

      <div
        class="manifest-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="manifest-title"
      >
        <header class="manifest-header">
          <div class="manifest-heading">
            <i data-lucide="clipboard-check"></i>

            <div>
              <strong id="manifest-title">${MANIFEST.title}</strong>
              <span>Tableau de bord administratif</span>
            </div>
          </div>

          <button
            class="manifest-close"
            type="button"
            title="Fermer"
            aria-label="Fermer Manifest"
            data-manifest-close
          >
            <i data-lucide="x"></i>
          </button>
        </header>

        <nav class="manifest-tabs" aria-label="Catégories Manifest">
          ${MANIFEST.categories.map(category => `
            <button
              class="manifest-tab"
              type="button"
              data-category="${escapeHTML(category.id)}"
              aria-selected="false"
            >
              <i data-lucide="${escapeHTML(category.icon)}"></i>
              <span>${escapeHTML(category.label)}</span>
              <small data-category-count="${escapeHTML(category.id)}"></small>
            </button>
          `).join("")}
        </nav>

        <div class="manifest-main">
          <section class="manifest-composer">
            <div class="manifest-composer-top">
              <input
                id="manifest-task-title"
                type="text"
                maxlength="180"
                placeholder="Ajouter une tâche..."
                autocomplete="off"
              >

              <button
                id="manifest-add"
                type="button"
                title="Ajouter la tâche"
              >
                <i data-lucide="plus"></i>
                <span>Ajouter</span>
              </button>
            </div>

            <div class="manifest-composer-options">
              <label>
                <span>Priorité</span>

                <select id="manifest-task-priority">
                  <option value="normal">Normale</option>
                  <option value="low">Basse</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </label>

              <label>
                <span>Échéance</span>
                <input id="manifest-task-due" type="date">
              </label>

              <label class="manifest-note-field">
                <span>Note facultative</span>

                <textarea
                  id="manifest-task-note"
                  maxlength="1000"
                  placeholder="Informations complémentaires..."
                ></textarea>
              </label>
            </div>
          </section>

          <section class="manifest-toolbar">
            <div class="manifest-summary"></div>

            <div class="manifest-filters">
              <button type="button" data-filter="all" class="is-active">
                Toutes
              </button>

              <button type="button" data-filter="open">
                À faire
              </button>

              <button type="button" data-filter="done">
                Terminées
              </button>
            </div>
          </section>

          <section
            class="manifest-list"
            aria-live="polite"
          ></section>
        </div>
      </div>
    `;

    document.body.appendChild(root);

    return root;
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "";
    }

    const date = new Date(`${dateValue}T12:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function isOverdue(task) {
    if (!task.dueDate || task.completed) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(`${task.dueDate}T00:00:00`);

    return dueDate < today;
  }

  function getPriorityLabel(priority) {
    return {
      low: "Basse",
      normal: "Normale",
      high: "Haute",
      urgent: "Urgente"
    }[priority] || "Normale";
  }

  function getCategoryTasks() {
    return state.tasks.filter(task => task.category === currentCategory);
  }

  function getCurrentFilter() {
    return document
      .querySelector("#manifest-root .manifest-filters .is-active")
      ?.dataset.filter || "all";
  }

  function getVisibleTasks() {
    const filter = getCurrentFilter();

    return getCategoryTasks()
      .filter(task => {
        if (filter === "open") {
          return !task.completed;
        }

        if (filter === "done") {
          return task.completed;
        }

        return true;
      })
      .sort((firstTask, secondTask) => {
        if (firstTask.completed !== secondTask.completed) {
          return Number(firstTask.completed) - Number(secondTask.completed);
        }

        const priorityOrder = {
          urgent: 0,
          high: 1,
          normal: 2,
          low: 3
        };

        const firstPriority = priorityOrder[firstTask.priority] ?? 2;
        const secondPriority = priorityOrder[secondTask.priority] ?? 2;

        if (firstPriority !== secondPriority) {
          return firstPriority - secondPriority;
        }

        return secondTask.createdAt - firstTask.createdAt;
      });
  }

  function renderTabs() {
    document.querySelectorAll("#manifest-root .manifest-tab").forEach(tab => {
      const isActive = tab.dataset.category === currentCategory;

      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));

      const count = state.tasks.filter(task =>
        task.category === tab.dataset.category &&
        !task.completed
      ).length;

      const countElement = tab.querySelector("[data-category-count]");

      if (countElement) {
        countElement.textContent = count ? String(count) : "";
      }
    });
  }

  function renderSummary() {
    const category = MANIFEST.categories.find(item =>
      item.id === currentCategory
    );

    const tasks = getCategoryTasks();
    const openCount = tasks.filter(task => !task.completed).length;
    const doneCount = tasks.filter(task => task.completed).length;

    const summary = document.querySelector(
      "#manifest-root .manifest-summary"
    );

    if (!summary) {
      return;
    }

    summary.innerHTML = `
      <strong>${escapeHTML(category?.label || "")}</strong>
      <span>
        ${openCount} à faire
        <i aria-hidden="true">•</i>
        ${doneCount} terminée${doneCount > 1 ? "s" : ""}
      </span>
    `;
  }

  function renderTasks() {
    const list = document.querySelector("#manifest-root .manifest-list");

    if (!list) {
      return;
    }

    const tasks = getVisibleTasks();

    if (!tasks.length) {
      list.innerHTML = `
        <div class="manifest-empty">
          <i data-lucide="check-check"></i>
          <strong>Rien à signaler ici</strong>
          <span>Profite de ce rare instant de paix administrative.</span>
        </div>
      `;

      refreshLucideIcons();
      return;
    }

    list.innerHTML = tasks.map(task => `
      <article
        class="
          manifest-task
          ${task.completed ? "is-completed" : ""}
          ${isOverdue(task) ? "is-overdue" : ""}
        "
        data-task-id="${escapeHTML(task.id)}"
      >
        <button
          class="manifest-task-check"
          type="button"
          title="${task.completed ? "Marquer comme non terminée" : "Terminer"}"
          aria-label="${task.completed ? "Marquer comme non terminée" : "Terminer"}"
          data-action="toggle"
        >
          <i data-lucide="${task.completed ? "circle-check-big" : "circle"}"></i>
        </button>

        <div class="manifest-task-content">
          <div class="manifest-task-title-row">
            <strong>${escapeHTML(task.title)}</strong>

            <span
              class="manifest-priority manifest-priority-${escapeHTML(task.priority)}"
            >
              ${escapeHTML(getPriorityLabel(task.priority))}
            </span>
          </div>

          ${task.note ? `
            <p>${escapeHTML(task.note)}</p>
          ` : ""}

          <div class="manifest-task-meta">
            ${task.dueDate ? `
              <span class="${isOverdue(task) ? "is-overdue" : ""}">
                <i data-lucide="calendar-days"></i>
                ${escapeHTML(formatDate(task.dueDate))}
              </span>
            ` : ""}

            <span>
              <i data-lucide="clock-3"></i>
              ${new Intl.DateTimeFormat("fr-FR", {
                day: "2-digit",
                month: "short"
              }).format(new Date(task.createdAt))}
            </span>
          </div>
        </div>

        <div class="manifest-task-actions">
          <button
            type="button"
            title="Modifier"
            aria-label="Modifier la tâche"
            data-action="edit"
          >
            <i data-lucide="pencil"></i>
          </button>

          <button
            type="button"
            title="Supprimer"
            aria-label="Supprimer la tâche"
            data-action="delete"
          >
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </article>
    `).join("");

    refreshLucideIcons();
  }

  function render() {
    renderTabs();
    renderSummary();
    renderTasks();
    updateCount();
  }

  function updateCount() {
    const countElement = document.querySelector("#manifest-count");

    if (!countElement || !state) {
      return;
    }

    const count = state.tasks.filter(task => !task.completed).length;

    countElement.textContent = count ? String(count) : "";
    countElement.hidden = count === 0;
  }

  function clearComposer() {
    const title = document.querySelector("#manifest-task-title");
    const note = document.querySelector("#manifest-task-note");
    const dueDate = document.querySelector("#manifest-task-due");
    const priority = document.querySelector("#manifest-task-priority");

    if (title) title.value = "";
    if (note) note.value = "";
    if (dueDate) dueDate.value = "";
    if (priority) priority.value = "normal";
  }

  function addTask() {
    const titleInput = document.querySelector("#manifest-task-title");
    const noteInput = document.querySelector("#manifest-task-note");
    const dueInput = document.querySelector("#manifest-task-due");
    const priorityInput = document.querySelector("#manifest-task-priority");

    const title = titleInput?.value.trim() || "";

    if (!title) {
      titleInput?.focus();
      return;
    }

    state.tasks.push({
      id: generateId(),
      category: currentCategory,
      title,
      note: noteInput?.value.trim() || "",
      dueDate: dueInput?.value || "",
      priority: priorityInput?.value || "normal",
      completed: false,
      createdAt: Date.now(),
      completedAt: null,
      updatedAt: Date.now()
    });

    saveState();
    clearComposer();
    render();

    titleInput?.focus();
  }

  function toggleTask(task) {
    task.completed = !task.completed;
    task.completedAt = task.completed ? Date.now() : null;
    task.updatedAt = Date.now();

    saveState();
    render();
  }

  function editTask(task) {
    const newTitle = window.prompt(
      "Modifier le titre de la tâche :",
      task.title
    );

    if (newTitle === null) {
      return;
    }

    const cleanTitle = newTitle.trim();

    if (!cleanTitle) {
      return;
    }

    const newNote = window.prompt(
      "Modifier la note facultative :",
      task.note || ""
    );

    if (newNote === null) {
      return;
    }

    task.title = cleanTitle;
    task.note = newNote.trim();
    task.updatedAt = Date.now();

    saveState();
    render();
  }

  function deleteTask(task) {
    const confirmed = window.confirm(
      `Supprimer définitivement « ${task.title} » ?`
    );

    if (!confirmed) {
      return;
    }

    state.tasks = state.tasks.filter(item => item.id !== task.id);

    saveState();
    render();
  }

  function handleTaskAction(event) {
    const actionButton = event.target.closest("[data-action]");

    if (!actionButton) {
      return;
    }

    const taskElement = actionButton.closest("[data-task-id]");
    const taskId = taskElement?.dataset.taskId;

    const task = state.tasks.find(item => item.id === taskId);

    if (!task) {
      return;
    }

    const action = actionButton.dataset.action;

    if (action === "toggle") {
      toggleTask(task);
    }

    if (action === "edit") {
      editTask(task);
    }

    if (action === "delete") {
      deleteTask(task);
    }
  }

  function openManifest() {
    const root = document.querySelector("#manifest-root");
    const toggle = document.querySelector("#manifest-toggle");

    if (!root || !toggle) {
      return;
    }

    root.hidden = false;
    toggle.setAttribute("aria-expanded", "true");

    document.body.classList.add("manifest-is-open");

    render();
    refreshLucideIcons();

    setTimeout(() => {
      document.querySelector("#manifest-task-title")?.focus();
    }, 50);
  }

  function closeManifest() {
    const root = document.querySelector("#manifest-root");
    const toggle = document.querySelector("#manifest-toggle");

    if (!root || !toggle) {
      return;
    }

    root.hidden = true;
    toggle.setAttribute("aria-expanded", "false");

    document.body.classList.remove("manifest-is-open");
  }

  function toggleManifest() {
    const root = document.querySelector("#manifest-root");

    if (!root) {
      return;
    }

    if (root.hidden) {
      openManifest();
    } else {
      closeManifest();
    }
  }

  function bindEvents(toggle, root) {
    toggle.addEventListener("click", toggleManifest);

    root.addEventListener("click", event => {
      if (event.target.closest("[data-manifest-close]")) {
        closeManifest();
        return;
      }

      const tab = event.target.closest(".manifest-tab");

      if (tab) {
        currentCategory = tab.dataset.category;
        render();
        return;
      }

      const filter = event.target.closest("[data-filter]");

      if (filter) {
        root.querySelectorAll("[data-filter]").forEach(button => {
          button.classList.toggle("is-active", button === filter);
        });

        renderTasks();
        return;
      }

      handleTaskAction(event);
    });

    root.querySelector("#manifest-add")?.addEventListener("click", addTask);

    root.querySelector("#manifest-task-title")?.addEventListener(
      "keydown",
      event => {
        if (event.key === "Enter") {
          event.preventDefault();
          addTask();
        }
      }
    );

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeManifest();
      }
    });
  }

  function initManifest() {
    currentUserId = getCurrentUserId();

    if (!currentUserId) {
      console.warn("[MANIFEST] Impossible d’identifier l’utilisateur connecté.");
      return;
    }

    if (!MANIFEST.allowedUsers.includes(currentUserId)) {
      document.querySelector("#manifest-toggle")?.remove();
      return;
    }

    state = loadState();

    const toggle = ensureToggleButton();

    if (!toggle) {
      return;
    }

    const root = createManifestRoot();

    bindEvents(toggle, root);
    render();
    refreshLucideIcons();
  }

  waitForBody(initManifest);
})();
