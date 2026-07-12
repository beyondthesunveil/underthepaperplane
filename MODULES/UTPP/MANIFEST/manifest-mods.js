(function () {
  "use strict";

  const MANIFEST = {
    allowedUsers: [1], // Ajoute d'autres IDs ici : [1, 2, 7]
    storagePrefix: "manifest-v1",
    title: "MANIFEST",
    version: 3,

    categories: [
      { id: "design", label: "Graphisme", icon: "palette" },
      { id: "code", label: "Code", icon: "code-2" },
      { id: "daily", label: "Check quotidien", icon: "calendar-check" },
      { id: "profiles", label: "Fiches perso", icon: "contact-round" },
      { id: "partners", label: "Partenaires", icon: "handshake" }
    ],

    days: [
      { id: "monday", label: "Lundi", short: "Lun" },
      { id: "tuesday", label: "Mardi", short: "Mar" },
      { id: "wednesday", label: "Mercredi", short: "Mer" },
      { id: "thursday", label: "Jeudi", short: "Jeu" },
      { id: "friday", label: "Vendredi", short: "Ven" },
      { id: "saturday", label: "Samedi", short: "Sam" },
      { id: "sunday", label: "Dimanche", short: "Dim" }
    ]
  };

  let currentCategory = MANIFEST.categories[0].id;
  let currentUserId = null;
  let state = null;

  let currentWeekStart = startOfWeek(new Date());
  let selectedDailyDateKey = toDateKey(new Date());
  let editingTaskId = null;
  let pendingDeleteTaskId = null;
  let dragArmedTaskId = null;
  let draggedTaskId = null;

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

  function padNumber(value) {
    return String(value).padStart(2, "0");
  }

  function toDateKey(date) {
    return [
      date.getFullYear(),
      padNumber(date.getMonth() + 1),
      padNumber(date.getDate())
    ].join("-");
  }

  function parseDateKey(dateKey) {
    const [year, month, day] = String(dateKey).split("-").map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);

    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    result.setHours(12, 0, 0, 0);
    return result;
  }

  function startOfWeek(date) {
    const result = new Date(date);
    const nativeDay = result.getDay();
    const distanceFromMonday = nativeDay === 0 ? -6 : 1 - nativeDay;

    result.setDate(result.getDate() + distanceFromMonday);
    result.setHours(12, 0, 0, 0);

    return result;
  }

  function getWeekDays() {
    return MANIFEST.days.map((day, index) => ({
      ...day,
      date: addDays(currentWeekStart, index),
      dateKey: toDateKey(addDays(currentWeekStart, index))
    }));
  }

  function getDayIdFromDateKey(dateKey) {
    const date = parseDateKey(dateKey);
    const nativeDay = date.getDay();
    const index = nativeDay === 0 ? 6 : nativeDay - 1;

    return MANIFEST.days[index]?.id || "monday";
  }

  function getSelectedDayIndex() {
    const selectedDate = parseDateKey(selectedDailyDateKey);
    const difference = Math.round(
      (selectedDate.getTime() - currentWeekStart.getTime()) / 86400000
    );

    return Math.min(6, Math.max(0, difference));
  }

  function ensureSelectedDateInWeek() {
    const startKey = toDateKey(currentWeekStart);
    const endKey = toDateKey(addDays(currentWeekStart, 6));

    if (selectedDailyDateKey < startKey || selectedDailyDateKey > endKey) {
      selectedDailyDateKey = startKey;
    }
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
      version: MANIFEST.version,
      tasks: [],
      updatedAt: Date.now()
    };
  }

  function normalizeTask(task, index) {
    const normalized = {
      id: task.id || generateId(),
      category: MANIFEST.categories.some(item => item.id === task.category)
        ? task.category
        : MANIFEST.categories[0].id,
      title: String(task.title || "Tâche sans titre"),
      note: String(task.note || ""),
      dueDate: String(task.dueDate || ""),
      priority: ["low", "normal", "high", "urgent"].includes(task.priority)
        ? task.priority
        : "normal",
      completed: Boolean(task.completed),
      createdAt: Number(task.createdAt) || Date.now(),
      completedAt: task.completedAt || null,
      updatedAt: Number(task.updatedAt) || Date.now(),
      order: Number.isFinite(Number(task.order)) ? Number(task.order) : index,
      recurring: Boolean(task.recurring),
      recurrence: task.recurrence === "weekly" ? "weekly" : "daily",
      days: Array.isArray(task.days)
        ? task.days.filter(day => MANIFEST.days.some(item => item.id === day))
        : [],
      completionHistory:
        task.completionHistory && typeof task.completionHistory === "object"
          ? { ...task.completionHistory }
          : {}
    };

    if (normalized.category === "daily") {
      normalized.recurring = true;

      if (normalized.recurrence === "weekly" && !normalized.days.length) {
        normalized.days = [getDayIdFromDateKey(selectedDailyDateKey)];
      }

      /*
       * Migration des anciennes tâches quotidiennes :
       * un ancien completed:true devient une validation pour aujourd'hui,
       * puis la tâche retrouve son fonctionnement récurrent.
       */
      if (normalized.completed && !Object.keys(normalized.completionHistory).length) {
        normalized.completionHistory[toDateKey(new Date())] = true;
      }

      normalized.completed = false;
      normalized.completedAt = null;
    } else {
      normalized.recurring = false;
      normalized.recurrence = "daily";
      normalized.days = [];
      normalized.completionHistory = {};
    }

    return normalized;
  }

  function normalizeState(parsed) {
    const tasks = Array.isArray(parsed?.tasks)
      ? parsed.tasks.map(normalizeTask)
      : [];

    return {
      version: MANIFEST.version,
      tasks,
      updatedAt: Number(parsed?.updatedAt) || Date.now()
    };
  }

  function loadState() {
    const raw = localStorage.getItem(getStorageKey());

    if (!raw) {
      return createEmptyState();
    }

    try {
      return normalizeState(JSON.parse(raw));
    } catch (error) {
      console.warn("[MANIFEST] Sauvegarde illisible :", error);
      return createEmptyState();
    }
  }

  function saveState() {
    state.version = MANIFEST.version;
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

  function createDayPicker(prefix) {
    return `
      <fieldset class="manifest-day-picker" data-day-picker="${prefix}">
        <legend>Jours concernés</legend>
        <div>
          ${MANIFEST.days.map(day => `
            <label>
              <input type="checkbox" value="${escapeHTML(day.id)}">
              <span>${escapeHTML(day.short)}</span>
            </label>
          `).join("")}
        </div>
      </fieldset>
    `;
  }

  function createRecurrenceFields(prefix) {
    return `
      <div class="manifest-recurrence-fields" data-recurrence-fields="${prefix}">
        <label>
          <span>Répétition</span>
          <select id="${prefix}-recurrence">
            <option value="daily">Tous les jours</option>
            <option value="weekly">Certains jours</option>
          </select>
        </label>
        ${createDayPicker(prefix)}
      </div>
    `;
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
          <section class="manifest-week" hidden>
            <div class="manifest-week-head">
              <div>
                <span class="manifest-week-kicker">Suivi hebdomadaire</span>
                <strong class="manifest-week-range"></strong>
              </div>

              <div class="manifest-week-navigation">
                <button type="button" data-week-shift="-7" title="Semaine précédente">
                  <i data-lucide="chevron-left"></i>
                </button>
                <button type="button" data-week-today>Aujourd’hui</button>
                <button type="button" data-week-shift="7" title="Semaine suivante">
                  <i data-lucide="chevron-right"></i>
                </button>
              </div>
            </div>

            <div class="manifest-week-progress">
              <div class="manifest-week-progress-copy"></div>
              <div class="manifest-progress-track" aria-hidden="true">
                <span></span>
              </div>
            </div>

            <div class="manifest-day-tabs" role="tablist" aria-label="Jours de la semaine"></div>
          </section>

          <section class="manifest-composer">
            <div class="manifest-composer-top">
              <input
                id="manifest-task-title"
                type="text"
                maxlength="180"
                placeholder="Ajouter une tâche..."
                autocomplete="off"
              >

              <button id="manifest-add" type="button" title="Ajouter la tâche">
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

            <div class="manifest-composer-recurrence" hidden>
              ${createRecurrenceFields("manifest-task")}
            </div>
          </section>

          <section class="manifest-toolbar">
            <div class="manifest-summary"></div>

            <div class="manifest-filters">
              <button type="button" data-filter="all" class="is-active">Toutes</button>
              <button type="button" data-filter="open">À faire</button>
              <button type="button" data-filter="done">Terminées</button>
            </div>
          </section>

          <section class="manifest-list" aria-live="polite"></section>
        </div>
      </div>

      <div class="manifest-editor" hidden>
        <div class="manifest-editor-backdrop" data-editor-close></div>

        <form
          id="manifest-editor-form"
          class="manifest-editor-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manifest-editor-title"
        >
          <header>
            <div>
              <span>MANIFEST</span>
              <strong id="manifest-editor-title">Modifier la tâche</strong>
            </div>

            <button type="button" data-editor-close aria-label="Fermer l’éditeur">
              <i data-lucide="x"></i>
            </button>
          </header>

          <div class="manifest-editor-body">
            <label>
              <span>Titre</span>
              <input id="manifest-editor-task-title" type="text" maxlength="180" required>
            </label>

            <label>
              <span>Note facultative</span>
              <textarea id="manifest-editor-task-note" maxlength="1000"></textarea>
            </label>

            <div class="manifest-editor-grid">
              <label>
                <span>Priorité</span>
                <select id="manifest-editor-task-priority">
                  <option value="normal">Normale</option>
                  <option value="low">Basse</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </label>

              <label>
                <span>Échéance</span>
                <input id="manifest-editor-task-due" type="date">
              </label>
            </div>

            <div class="manifest-editor-recurrence" hidden>
              ${createRecurrenceFields("manifest-editor-task")}
            </div>
          </div>

          <footer>
            <button type="button" class="manifest-button-secondary" data-editor-close>
              Annuler
            </button>
            <button type="submit" class="manifest-button-primary">
              <i data-lucide="save"></i>
              Enregistrer
            </button>
          </footer>
        </form>
      </div>

      <div class="manifest-confirm" hidden>
        <div class="manifest-editor-backdrop" data-confirm-cancel></div>

        <div
          class="manifest-confirm-dialog"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="manifest-confirm-title"
          aria-describedby="manifest-confirm-copy"
        >
          <i data-lucide="triangle-alert"></i>
          <strong id="manifest-confirm-title">Supprimer cette tâche ?</strong>
          <p id="manifest-confirm-copy"></p>

          <div>
            <button type="button" class="manifest-button-secondary" data-confirm-cancel>
              Annuler
            </button>
            <button type="button" class="manifest-button-danger" data-confirm-delete>
              Supprimer
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(root);
    return root;
  }

  function formatDate(dateValue, options) {
    if (!dateValue) {
      return "";
    }

    const date = /^\d{4}-\d{2}-\d{2}$/.test(String(dateValue))
      ? parseDateKey(dateValue)
      : new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return new Intl.DateTimeFormat("fr-FR", options || {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function formatWeekRange() {
    const start = currentWeekStart;
    const end = addDays(currentWeekStart, 6);
    const sameMonth = start.getMonth() === end.getMonth();
    const sameYear = start.getFullYear() === end.getFullYear();

    if (sameMonth && sameYear) {
      return `${formatDate(start, { day: "numeric" })}–${formatDate(end, {
        day: "numeric",
        month: "long",
        year: "numeric"
      })}`;
    }

    return `${formatDate(start, {
      day: "numeric",
      month: "short"
    })} – ${formatDate(end, {
      day: "numeric",
      month: "short",
      year: "numeric"
    })}`;
  }

  function isTaskScheduledForDate(task, dateKey) {
    if (task.category !== "daily") {
      return true;
    }

    if (task.recurrence !== "weekly") {
      return true;
    }

    return task.days.includes(getDayIdFromDateKey(dateKey));
  }

  function isTaskCompleted(task, dateKey = selectedDailyDateKey) {
    if (task.category === "daily") {
      return Boolean(task.completionHistory?.[dateKey]);
    }

    return Boolean(task.completed);
  }

  function isOverdue(task) {
    if (!task.dueDate || task.category === "daily" || task.completed) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = parseDateKey(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

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

  function getRecurrenceLabel(task) {
    if (task.category !== "daily") {
      return "";
    }

    if (task.recurrence !== "weekly") {
      return "Tous les jours";
    }

    const labels = MANIFEST.days
      .filter(day => task.days.includes(day.id))
      .map(day => day.short);

    return labels.length ? labels.join(" · ") : "Aucun jour";
  }

  function getCategoryTasks(categoryId = currentCategory) {
    return state.tasks
      .filter(task => task.category === categoryId)
      .sort((firstTask, secondTask) => {
        if (firstTask.order !== secondTask.order) {
          return firstTask.order - secondTask.order;
        }

        return firstTask.createdAt - secondTask.createdAt;
      });
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
        if (currentCategory === "daily") {
          return isTaskScheduledForDate(task, selectedDailyDateKey);
        }

        return true;
      })
      .filter(task => {
        const completed = isTaskCompleted(task);

        if (filter === "open") {
          return !completed;
        }

        if (filter === "done") {
          return completed;
        }

        return true;
      });
  }

  function getDailyCountForDate(dateKey) {
    const tasks = getCategoryTasks("daily").filter(task =>
      isTaskScheduledForDate(task, dateKey)
    );

    const done = tasks.filter(task => isTaskCompleted(task, dateKey)).length;

    return {
      total: tasks.length,
      done,
      open: tasks.length - done
    };
  }

  function getWeekCompletion() {
    return getWeekDays().reduce((summary, day) => {
      const count = getDailyCountForDate(day.dateKey);
      summary.total += count.total;
      summary.done += count.done;
      return summary;
    }, { total: 0, done: 0 });
  }

  function renderTabs() {
    const todayKey = toDateKey(new Date());

    document.querySelectorAll("#manifest-root .manifest-tab").forEach(tab => {
      const isActive = tab.dataset.category === currentCategory;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));

      let count = 0;

      if (tab.dataset.category === "daily") {
        count = getDailyCountForDate(todayKey).open;
      } else {
        count = state.tasks.filter(task =>
          task.category === tab.dataset.category && !task.completed
        ).length;
      }

      const countElement = tab.querySelector("[data-category-count]");

      if (countElement) {
        countElement.textContent = count ? String(count) : "";
      }
    });
  }

  function renderWeekPanel() {
    const panel = document.querySelector("#manifest-root .manifest-week");

    if (!panel) {
      return;
    }

    const isDaily = currentCategory === "daily";
    panel.hidden = !isDaily;

    if (!isDaily) {
      return;
    }

    ensureSelectedDateInWeek();

    const range = panel.querySelector(".manifest-week-range");
    const progressCopy = panel.querySelector(".manifest-week-progress-copy");
    const progressBar = panel.querySelector(".manifest-progress-track span");
    const dayTabs = panel.querySelector(".manifest-day-tabs");
    const week = getWeekCompletion();
    const percentage = week.total ? Math.round((week.done / week.total) * 100) : 0;
    const todayKey = toDateKey(new Date());

    if (range) {
      range.textContent = formatWeekRange();
    }

    if (progressCopy) {
      progressCopy.innerHTML = `
        <strong>${week.done} / ${week.total} vérifications terminées</strong>
        <span>${percentage}% de la semaine complétée</span>
      `;
    }

    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }

    if (dayTabs) {
      dayTabs.innerHTML = getWeekDays().map(day => {
        const count = getDailyCountForDate(day.dateKey);
        const selected = day.dateKey === selectedDailyDateKey;
        const isToday = day.dateKey === todayKey;

        return `
          <button
            type="button"
            role="tab"
            class="manifest-day-tab ${selected ? "is-active" : ""} ${isToday ? "is-today" : ""}"
            data-day-date="${day.dateKey}"
            aria-selected="${selected}"
          >
            <span>${escapeHTML(day.short)}</span>
            <strong>${formatDate(day.date, { day: "2-digit" })}</strong>
            <small>${count.done}/${count.total}</small>
          </button>
        `;
      }).join("");
    }
  }

  function renderSummary() {
    const category = MANIFEST.categories.find(item => item.id === currentCategory);
    const summary = document.querySelector("#manifest-root .manifest-summary");

    if (!summary) {
      return;
    }

    let tasks = getCategoryTasks();
    let openCount;
    let doneCount;
    let subtitle = "";

    if (currentCategory === "daily") {
      tasks = tasks.filter(task => isTaskScheduledForDate(task, selectedDailyDateKey));
      doneCount = tasks.filter(task => isTaskCompleted(task)).length;
      openCount = tasks.length - doneCount;
      subtitle = formatDate(selectedDailyDateKey, {
        weekday: "long",
        day: "numeric",
        month: "long"
      });
    } else {
      openCount = tasks.filter(task => !task.completed).length;
      doneCount = tasks.filter(task => task.completed).length;
    }

    summary.innerHTML = `
      <strong>${escapeHTML(category?.label || "")}</strong>
      <span>
        ${subtitle ? `${escapeHTML(subtitle)} <i aria-hidden="true">•</i> ` : ""}
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
          <span>${currentCategory === "daily"
            ? "Cette journée est libre — ou déjà parfaitement maîtrisée."
            : "Profite de ce rare instant de paix administrative."}</span>
        </div>
      `;

      refreshLucideIcons();
      return;
    }

    list.innerHTML = tasks.map(task => {
      const completed = isTaskCompleted(task);

      return `
        <article
          class="manifest-task ${completed ? "is-completed" : ""} ${isOverdue(task) ? "is-overdue" : ""}"
          data-task-id="${escapeHTML(task.id)}"
          draggable="true"
          aria-grabbed="false"
        >
          <button
            class="manifest-drag-handle"
            type="button"
            title="Faire glisser pour réordonner"
            aria-label="Faire glisser pour réordonner la tâche"
            data-drag-handle
          >
            <i data-lucide="grip-vertical"></i>
          </button>

          <button
            class="manifest-task-check"
            type="button"
            title="${completed ? "Marquer comme non terminée" : "Terminer"}"
            aria-label="${completed ? "Marquer comme non terminée" : "Terminer"}"
            data-action="toggle"
          >
            <i data-lucide="${completed ? "circle-check-big" : "circle"}"></i>
          </button>

          <div class="manifest-task-content">
            <div class="manifest-task-title-row">
              <strong>${escapeHTML(task.title)}</strong>

              <span class="manifest-priority manifest-priority-${escapeHTML(task.priority)}">
                ${escapeHTML(getPriorityLabel(task.priority))}
              </span>
            </div>

            ${task.note ? `<p>${escapeHTML(task.note)}</p>` : ""}

            <div class="manifest-task-meta">
              ${task.category === "daily" ? `
                <span>
                  <i data-lucide="repeat-2"></i>
                  ${escapeHTML(getRecurrenceLabel(task))}
                </span>
              ` : ""}

              ${task.dueDate ? `
                <span class="${isOverdue(task) ? "is-overdue" : ""}">
                  <i data-lucide="calendar-days"></i>
                  ${escapeHTML(formatDate(task.dueDate))}
                </span>
              ` : ""}

              <span>
                <i data-lucide="clock-3"></i>
                ${formatDate(task.createdAt, { day: "2-digit", month: "short" })}
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
      `;
    }).join("");

    refreshLucideIcons();
  }

  function renderComposerMode() {
    const recurrenceBlock = document.querySelector(
      "#manifest-root .manifest-composer-recurrence"
    );

    if (recurrenceBlock) {
      recurrenceBlock.hidden = currentCategory !== "daily";
    }

    updateRecurrencePicker("manifest-task");
  }

  function render() {
    renderTabs();
    renderWeekPanel();
    renderComposerMode();
    renderSummary();
    renderTasks();
    updateCount();
  }

  function updateCount() {
    const countElement = document.querySelector("#manifest-count");

    if (!countElement || !state) {
      return;
    }

    const todayKey = toDateKey(new Date());
    const standardOpen = state.tasks.filter(task =>
      task.category !== "daily" && !task.completed
    ).length;
    const dailyOpen = getDailyCountForDate(todayKey).open;
    const count = standardOpen + dailyOpen;

    countElement.textContent = count ? String(count) : "";
    countElement.hidden = count === 0;
  }

  function getSelectedDays(prefix) {
    return Array.from(document.querySelectorAll(
      `#manifest-root [data-day-picker="${prefix}"] input:checked`
    )).map(input => input.value);
  }

  function setSelectedDays(prefix, days) {
    document.querySelectorAll(
      `#manifest-root [data-day-picker="${prefix}"] input`
    ).forEach(input => {
      input.checked = days.includes(input.value);
    });
  }

  function updateRecurrencePicker(prefix) {
    const select = document.querySelector(`#${prefix}-recurrence`);
    const picker = document.querySelector(
      `#manifest-root [data-day-picker="${prefix}"]`
    );

    if (!select || !picker) {
      return;
    }

    const isWeekly = select.value === "weekly";
    picker.classList.toggle("is-disabled", !isWeekly);

    picker.querySelectorAll("input").forEach(input => {
      input.disabled = !isWeekly;
    });
  }

  function readRecurrence(prefix) {
    const select = document.querySelector(`#${prefix}-recurrence`);
    const recurrence = select?.value === "weekly" ? "weekly" : "daily";
    let days = recurrence === "weekly" ? getSelectedDays(prefix) : [];

    if (recurrence === "weekly" && !days.length) {
      days = [getDayIdFromDateKey(selectedDailyDateKey)];
      setSelectedDays(prefix, days);
    }

    return { recurrence, days };
  }

  function clearComposer() {
    const title = document.querySelector("#manifest-task-title");
    const note = document.querySelector("#manifest-task-note");
    const dueDate = document.querySelector("#manifest-task-due");
    const priority = document.querySelector("#manifest-task-priority");
    const recurrence = document.querySelector("#manifest-task-recurrence");

    if (title) title.value = "";
    if (note) note.value = "";
    if (dueDate) dueDate.value = "";
    if (priority) priority.value = "normal";
    if (recurrence) recurrence.value = "daily";

    setSelectedDays("manifest-task", [getDayIdFromDateKey(selectedDailyDateKey)]);
    updateRecurrencePicker("manifest-task");
  }

  function getNextOrder(category) {
    const orders = state.tasks
      .filter(task => task.category === category)
      .map(task => Number(task.order) || 0);

    return orders.length ? Math.max(...orders) + 1 : 0;
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

    const recurrence = currentCategory === "daily"
      ? readRecurrence("manifest-task")
      : { recurrence: "daily", days: [] };

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
      updatedAt: Date.now(),
      order: getNextOrder(currentCategory),
      recurring: currentCategory === "daily",
      recurrence: recurrence.recurrence,
      days: recurrence.days,
      completionHistory: {}
    });

    saveState();
    clearComposer();
    render();
    titleInput?.focus();
  }

  function toggleTask(task) {
    if (task.category === "daily") {
      task.completionHistory ||= {};

      if (task.completionHistory[selectedDailyDateKey]) {
        delete task.completionHistory[selectedDailyDateKey];
      } else {
        task.completionHistory[selectedDailyDateKey] = true;
      }
    } else {
      task.completed = !task.completed;
      task.completedAt = task.completed ? Date.now() : null;
    }

    task.updatedAt = Date.now();
    saveState();
    render();
  }

  function openTaskEditor(task) {
    const editor = document.querySelector("#manifest-root .manifest-editor");
    const recurrenceBlock = document.querySelector(
      "#manifest-root .manifest-editor-recurrence"
    );

    if (!editor) {
      return;
    }

    editingTaskId = task.id;

    document.querySelector("#manifest-editor-task-title").value = task.title;
    document.querySelector("#manifest-editor-task-note").value = task.note || "";
    document.querySelector("#manifest-editor-task-priority").value = task.priority;
    document.querySelector("#manifest-editor-task-due").value = task.dueDate || "";

    if (recurrenceBlock) {
      recurrenceBlock.hidden = task.category !== "daily";
    }

    const recurrenceSelect = document.querySelector(
      "#manifest-editor-task-recurrence"
    );

    if (recurrenceSelect) {
      recurrenceSelect.value = task.recurrence === "weekly" ? "weekly" : "daily";
    }

    setSelectedDays("manifest-editor-task", task.days || []);
    updateRecurrencePicker("manifest-editor-task");

    editor.hidden = false;
    refreshLucideIcons();

    setTimeout(() => {
      const titleInput = document.querySelector("#manifest-editor-task-title");
      titleInput?.focus();
      titleInput?.select();
    }, 30);
  }

  function closeTaskEditor() {
    const editor = document.querySelector("#manifest-root .manifest-editor");

    if (editor) {
      editor.hidden = true;
    }

    editingTaskId = null;
  }

  function saveTaskEdits(event) {
    event.preventDefault();

    const task = state.tasks.find(item => item.id === editingTaskId);
    const titleInput = document.querySelector("#manifest-editor-task-title");
    const title = titleInput?.value.trim() || "";

    if (!task || !title) {
      titleInput?.focus();
      return;
    }

    task.title = title;
    task.note = document.querySelector("#manifest-editor-task-note")?.value.trim() || "";
    task.priority = document.querySelector("#manifest-editor-task-priority")?.value || "normal";
    task.dueDate = document.querySelector("#manifest-editor-task-due")?.value || "";

    if (task.category === "daily") {
      const recurrence = readRecurrence("manifest-editor-task");
      task.recurring = true;
      task.recurrence = recurrence.recurrence;
      task.days = recurrence.days;
    }

    task.updatedAt = Date.now();

    saveState();
    closeTaskEditor();
    render();
  }

  function openDeleteConfirm(task) {
    const confirm = document.querySelector("#manifest-root .manifest-confirm");
    const copy = document.querySelector("#manifest-confirm-copy");

    if (!confirm || !copy) {
      return;
    }

    pendingDeleteTaskId = task.id;
    copy.textContent = `« ${task.title} » sera supprimée définitivement.`;
    confirm.hidden = false;
    refreshLucideIcons();

    setTimeout(() => {
      confirm.querySelector("button[data-confirm-cancel]")?.focus();
    }, 30);
  }

  function closeDeleteConfirm() {
    const confirm = document.querySelector("#manifest-root .manifest-confirm");

    if (confirm) {
      confirm.hidden = true;
    }

    pendingDeleteTaskId = null;
  }

  function confirmDeleteTask() {
    if (!pendingDeleteTaskId) {
      return;
    }

    state.tasks = state.tasks.filter(task => task.id !== pendingDeleteTaskId);
    saveState();
    closeDeleteConfirm();
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
    } else if (action === "edit") {
      openTaskEditor(task);
    } else if (action === "delete") {
      openDeleteConfirm(task);
    }
  }

  function clearDragClasses() {
    document.querySelectorAll("#manifest-root .manifest-task").forEach(task => {
      task.classList.remove("is-dragging", "is-drag-before", "is-drag-after");
      task.setAttribute("aria-grabbed", "false");
    });
  }

  function persistVisibleOrder() {
    const visibleIds = Array.from(document.querySelectorAll(
      "#manifest-root .manifest-list [data-task-id]"
    )).map(element => element.dataset.taskId);

    if (!visibleIds.length) {
      return;
    }

    const visibleSet = new Set(visibleIds);
    const categoryTasks = getCategoryTasks();
    let visibleCursor = 0;

    const mergedIds = categoryTasks.map(task => {
      if (!visibleSet.has(task.id)) {
        return task.id;
      }

      const replacement = visibleIds[visibleCursor];
      visibleCursor += 1;
      return replacement;
    });

    mergedIds.forEach((id, index) => {
      const task = state.tasks.find(item => item.id === id);

      if (task) {
        task.order = index;
        task.updatedAt = Date.now();
      }
    });
  }

  function handleDragStart(event) {
    const taskElement = event.target.closest("[data-task-id]");
    const taskId = taskElement?.dataset.taskId;

    if (!taskElement || !taskId || dragArmedTaskId !== taskId) {
      event.preventDefault();
      return;
    }

    draggedTaskId = taskId;
    taskElement.classList.add("is-dragging");
    taskElement.setAttribute("aria-grabbed", "true");

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", taskId);
    }
  }

  function handleDragOver(event) {
    if (!draggedTaskId) {
      return;
    }

    const target = event.target.closest("[data-task-id]");

    if (!target || target.dataset.taskId === draggedTaskId) {
      return;
    }

    event.preventDefault();

    document.querySelectorAll("#manifest-root .manifest-task").forEach(task => {
      task.classList.remove("is-drag-before", "is-drag-after");
    });

    const bounds = target.getBoundingClientRect();
    const placeAfter = event.clientY > bounds.top + bounds.height / 2;
    target.classList.add(placeAfter ? "is-drag-after" : "is-drag-before");

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
  }

  function handleDrop(event) {
    if (!draggedTaskId) {
      return;
    }

    const list = document.querySelector("#manifest-root .manifest-list");
    const dragged = Array.from(
      list?.querySelectorAll("[data-task-id]") || []
    ).find(element => element.dataset.taskId === draggedTaskId);
    const target = event.target.closest("[data-task-id]");

    if (!list || !dragged || !target || target === dragged) {
      clearDragClasses();
      return;
    }

    event.preventDefault();

    const placeAfter = target.classList.contains("is-drag-after");

    if (placeAfter) {
      target.insertAdjacentElement("afterend", dragged);
    } else {
      target.insertAdjacentElement("beforebegin", dragged);
    }

    persistVisibleOrder();
    saveState();

    draggedTaskId = null;
    dragArmedTaskId = null;
    clearDragClasses();
    render();
  }

  function handleDragEnd() {
    draggedTaskId = null;
    dragArmedTaskId = null;
    clearDragClasses();
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

    closeTaskEditor();
    closeDeleteConfirm();

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
      if (event.target.closest("[data-editor-close]")) {
        closeTaskEditor();
        return;
      }

      if (event.target.closest("[data-confirm-cancel]")) {
        closeDeleteConfirm();
        return;
      }

      if (event.target.closest("[data-confirm-delete]")) {
        confirmDeleteTask();
        return;
      }

      if (event.target.closest("[data-manifest-close]")) {
        closeManifest();
        return;
      }

      const tab = event.target.closest(".manifest-tab");

      if (tab) {
        currentCategory = tab.dataset.category;

        if (currentCategory === "daily") {
          const today = new Date();
          currentWeekStart = startOfWeek(today);
          selectedDailyDateKey = toDateKey(today);
          clearComposer();
        }

        render();
        return;
      }

      const dayTab = event.target.closest("[data-day-date]");

      if (dayTab) {
        selectedDailyDateKey = dayTab.dataset.dayDate;
        render();
        return;
      }

      const weekShift = event.target.closest("[data-week-shift]");

      if (weekShift) {
        const selectedIndex = getSelectedDayIndex();
        currentWeekStart = addDays(
          currentWeekStart,
          Number(weekShift.dataset.weekShift) || 0
        );
        selectedDailyDateKey = toDateKey(addDays(currentWeekStart, selectedIndex));
        render();
        return;
      }

      if (event.target.closest("[data-week-today]")) {
        const today = new Date();
        currentWeekStart = startOfWeek(today);
        selectedDailyDateKey = toDateKey(today);
        render();
        return;
      }

      const filter = event.target.closest("[data-filter]");

      if (filter) {
        root.querySelectorAll("[data-filter]").forEach(button => {
          button.classList.toggle("is-active", button === filter);
        });

        renderSummary();
        renderTasks();
        return;
      }

      handleTaskAction(event);
    });

    root.addEventListener("change", event => {
      if (event.target.matches("#manifest-task-recurrence")) {
        updateRecurrencePicker("manifest-task");
      }

      if (event.target.matches("#manifest-editor-task-recurrence")) {
        updateRecurrencePicker("manifest-editor-task");
      }
    });

    root.addEventListener("pointerdown", event => {
      const handle = event.target.closest("[data-drag-handle]");
      dragArmedTaskId = handle?.closest("[data-task-id]")?.dataset.taskId || null;
    });

    root.addEventListener("pointerup", () => {
      if (!draggedTaskId) {
        dragArmedTaskId = null;
      }
    });

    root.addEventListener("dragstart", handleDragStart);
    root.addEventListener("dragover", handleDragOver);
    root.addEventListener("drop", handleDrop);
    root.addEventListener("dragend", handleDragEnd);

    root.querySelector("#manifest-add")?.addEventListener("click", addTask);
    root.querySelector("#manifest-editor-form")?.addEventListener("submit", saveTaskEdits);

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
      if (event.key !== "Escape" || root.hidden) {
        return;
      }

      const confirm = root.querySelector(".manifest-confirm");
      const editor = root.querySelector(".manifest-editor");

      if (confirm && !confirm.hidden) {
        closeDeleteConfirm();
      } else if (editor && !editor.hidden) {
        closeTaskEditor();
      } else {
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
    saveState(); // Enregistre immédiatement la migration au format V3.

    const toggle = ensureToggleButton();

    if (!toggle) {
      return;
    }

    const root = createManifestRoot();
    bindEvents(toggle, root);
    clearComposer();
    render();
    refreshLucideIcons();
  }

  waitForBody(initManifest);
})();
