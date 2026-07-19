const locales = window.AR_LOCALES || {};
const robots = Array.isArray(window.AR_ROBOTS) ? window.AR_ROBOTS : [];
const site = window.AR_SITE || {};
const defaultLanguage = "hr";
const mobileBreakpoint = 920;

const languageFromQuery = new URLSearchParams(window.location.search).get("lang");
const languageFromStorage = localStorage.getItem("ar-language");
let currentLanguage = locales[languageFromQuery]
  ? languageFromQuery
  : locales[languageFromStorage]
    ? languageFromStorage
    : defaultLanguage;
let activeLocale = locales[currentLanguage] || locales[defaultLanguage];

const catalogState = {
  manufacturer: "all",
  task: "all",
};

const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const navOverlay = document.querySelector("[data-nav-overlay]");
const productsGrid = document.querySelector("[data-products-grid]");
const catalogStatus = document.querySelector("[data-catalog-status]");
const catalogEmpty = document.querySelector("[data-catalog-empty]");
const manufacturerFilters = document.querySelector("[data-manufacturer-filters]");
const taskFilters = document.querySelector("[data-task-filters]");
const filterReset = document.querySelector("[data-filter-reset]");
const robotModal = document.querySelector("[data-robot-modal]");
const modalDialog = document.querySelector("[data-modal-dialog]");
const modalContent = document.querySelector("[data-modal-content]");
const modalClose = document.querySelector("[data-modal-close]");
const demoForm = document.querySelector("[data-demo-form]");
const formStatus = document.querySelector("[data-form-status]");
const submitButton = document.querySelector("[data-submit-button]");
const submitLabel = document.querySelector("[data-submit-label]");
const selectedModelInput = document.querySelector("#selected-model");
const demoSection = document.querySelector("#demo");
let navOpenScrollY = 0;
let activeModalRobotId = null;
let modalOpener = null;

function t(path, fallback = "") {
  return (
    path
      .split(".")
      .reduce(
        (value, key) => (value && value[key] !== undefined ? value[key] : undefined),
        activeLocale,
      ) ?? fallback
  );
}

function interpolate(template, values = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`,
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function localized(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  return value[currentLanguage] ?? value[defaultLanguage] ?? "";
}

function updateLanguageInUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", currentLanguage);
  window.history.replaceState({}, "", url);
}

function applyTextTranslations() {
  document.documentElement.lang = currentLanguage;
  document.title = t("meta.title", document.title);

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute(
      "content",
      t("meta.description", description.getAttribute("content") || ""),
    );
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n, element.textContent);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute(
      "placeholder",
      t(element.dataset.i18nPlaceholder, element.getAttribute("placeholder") || ""),
    );
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute(
      "aria-label",
      t(element.dataset.i18nAriaLabel, element.getAttribute("aria-label") || ""),
    );
  });

  document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
    element.setAttribute("alt", t(element.dataset.i18nAlt, element.getAttribute("alt") || ""));
  });
}

function renderBrands() {
  const grid = document.querySelector("[data-brand-grid]");
  if (!grid) return;

  grid.innerHTML = activeLocale.brands
    .map(
      (brand) => `
        <article>
          <span>${escapeHtml(brand.name)}</span>
          <p>${escapeHtml(brand.copy)}</p>
        </article>
      `,
    )
    .join("");
}

function createFilterButton(type, value, label, isActive) {
  return `
    <button
      class="filter-chip${isActive ? " is-active" : ""}"
      type="button"
      data-filter-type="${escapeHtml(type)}"
      data-filter-value="${escapeHtml(value)}"
      aria-pressed="${String(isActive)}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function renderFilters() {
  if (!manufacturerFilters || !taskFilters) return;

  const manufacturers = ["PUDU Robotics", "Gausium", "OrionStar"];
  manufacturerFilters.innerHTML = [
    createFilterButton(
      "manufacturer",
      "all",
      t("products.allManufacturers", "All"),
      catalogState.manufacturer === "all",
    ),
    ...manufacturers.map((manufacturer) =>
      createFilterButton(
        "manufacturer",
        manufacturer,
        manufacturer,
        catalogState.manufacturer === manufacturer,
      ),
    ),
  ].join("");

  const availableTasks = Object.keys(activeLocale.products.categories).filter((category) =>
    robots.some((robot) => robot.taskCategories.includes(category)),
  );
  taskFilters.innerHTML = [
    createFilterButton(
      "task",
      "all",
      t("products.allTasks", "All tasks"),
      catalogState.task === "all",
    ),
    ...availableTasks.map((task) =>
      createFilterButton(
        "task",
        task,
        t(`products.categories.${task}`, task),
        catalogState.task === task,
      ),
    ),
  ].join("");

  if (filterReset) {
    filterReset.disabled =
      catalogState.manufacturer === "all" && catalogState.task === "all";
  }
}

function getFilteredRobots() {
  return robots.filter((robot) => {
    const manufacturerMatches =
      catalogState.manufacturer === "all" ||
      robot.manufacturer === catalogState.manufacturer;
    const taskMatches =
      catalogState.task === "all" || robot.taskCategories.includes(catalogState.task);
    return manufacturerMatches && taskMatches;
  });
}

function renderProducts() {
  if (!productsGrid) return;
  const filteredRobots = getFilteredRobots();

  productsGrid.innerHTML = filteredRobots
    .map((robot) => {
      const titleId = `product-title-${robot.id}`;
      const descriptionId = `product-description-${robot.id}`;
      const cardLabel = interpolate(t("accessibility.productCard"), {
        model: robot.fullName,
      });
      const highlights = robot.highlights
        .slice(0, 3)
        .map(
          (highlight) => `
            <li>
              <strong>${escapeHtml(
                t(`products.highlightLabels.${highlight.label}`, highlight.label),
              )}:</strong>
              <span>${escapeHtml(localized(highlight.value))}</span>
            </li>
          `,
        )
        .join("");

      return `
        <article class="product-card">
          <button
            class="product-card-action"
            type="button"
            aria-label="${escapeHtml(cardLabel)}"
            aria-labelledby="${titleId} ${descriptionId}"
            data-open-robot="${escapeHtml(robot.id)}"
          ></button>
          <div class="product-image">
            <img
              src="${escapeHtml(robot.image)}"
              width="600"
              height="600"
              loading="lazy"
              decoding="async"
              alt="${escapeHtml(localized(robot.imageAlt))}"
            />
          </div>
          <div class="product-body">
            <p class="product-brand">${escapeHtml(robot.manufacturer)}</p>
            <h3 id="${titleId}">${escapeHtml(robot.fullName)}</h3>
            <p class="product-description" id="${descriptionId}">
              ${escapeHtml(localized(robot.shortDescription))}
            </p>
            <ul class="product-highlights">${highlights}</ul>
            <span class="product-link">
              ${escapeHtml(t("buttons.viewSpecifications", "View specifications"))}
              <span aria-hidden="true">→</span>
            </span>
          </div>
        </article>
      `;
    })
    .join("");

  const countTemplate =
    filteredRobots.length === 1
      ? t("products.resultCount.one", "{count}")
      : t("products.resultCount.other", "{count}");
  if (catalogStatus) {
    catalogStatus.textContent = interpolate(countTemplate, { count: filteredRobots.length });
  }
  if (catalogEmpty) {
    catalogEmpty.hidden = filteredRobots.length !== 0;
  }
}

function renderIndustries() {
  const grid = document.querySelector("[data-industries-grid]");
  if (!grid) return;

  grid.innerHTML = activeLocale.industries.items
    .map(
      (industry) => `
        <article>
          <div class="industry-image">
            <img
              src="${escapeHtml(industry.image)}"
              width="960"
              height="467"
              loading="lazy"
              decoding="async"
              alt="${escapeHtml(industry.alt)}"
              style="object-position: ${escapeHtml(industry.position || "center")}"
            />
          </div>
          <div class="industry-body">
            <h3>${escapeHtml(industry.title)}</h3>
            <p>${escapeHtml(industry.copy)}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderProcessSteps() {
  const list = document.querySelector("[data-process-steps]");
  if (!list) return;

  list.innerHTML = activeLocale.process.steps
    .map(
      (step) => `
        <li>
          <span>${escapeHtml(step.number)}</span>
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.copy)}</p>
        </li>
      `,
    )
    .join("");
}

function renderDemoPoints() {
  const list = document.querySelector("[data-demo-points]");
  if (!list) return;
  list.innerHTML = activeLocale.demo.points
    .map((point) => `<li>${escapeHtml(point)}</li>`)
    .join("");
}

function renderFaq() {
  const list = document.querySelector("[data-faq-list]");
  if (!list) return;

  list.innerHTML = activeLocale.faq.items
    .map((item, index) => {
      const answerId = `faq-answer-${index}`;
      return `
        <article class="faq-item">
          <h3>
            <button
              type="button"
              aria-expanded="false"
              aria-controls="${answerId}"
              data-faq-button
            >
              <span>${escapeHtml(item.question)}</span>
              <span class="faq-icon" aria-hidden="true"></span>
            </button>
          </h3>
          <div class="faq-answer" id="${answerId}" hidden>
            <p>${escapeHtml(item.answer)}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSiteDetails() {
  document.querySelectorAll("[data-contact-phone]").forEach((link) => {
    link.textContent = site.phoneDisplay || "";
    link.setAttribute("href", `tel:${site.phoneHref || ""}`);
  });
  document.querySelectorAll("[data-contact-email]").forEach((link) => {
    link.textContent = site.email || "";
    link.setAttribute("href", `mailto:${site.email || ""}`);
  });
  document.querySelectorAll("[data-site-legal-name]").forEach((element) => {
    element.textContent = site.legalName || "";
  });
  document.querySelectorAll("[data-site-address]").forEach((element) => {
    element.textContent = site.address || "";
  });
  document.querySelectorAll("[data-site-tax-id]").forEach((element) => {
    element.textContent = site.taxId || "";
  });
  document.querySelectorAll("[data-legal-link]").forEach((link) => {
    link.setAttribute("href", `${link.dataset.legalLink}?lang=${currentLanguage}`);
  });

  const copyright = document.querySelector("[data-copyright]");
  if (copyright) {
    const year = Math.max(site.copyrightStartYear || 2026, new Date().getFullYear());
    copyright.textContent = interpolate(t("footer.copyright"), { year });
  }
}

function updateLanguageButtons() {
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    const isActive = button.dataset.langButton === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function setLanguage(language) {
  if (!locales[language]) return;
  currentLanguage = language;
  activeLocale = locales[language];
  localStorage.setItem("ar-language", language);
  updateLanguageInUrl();
  applyLocale();
  closeNavigation({ restoreFocus: false });
}

function applyLocale() {
  applyTextTranslations();
  renderBrands();
  renderFilters();
  renderProducts();
  renderIndustries();
  renderProcessSteps();
  renderDemoPoints();
  renderFaq();
  renderSiteDetails();
  updateLanguageButtons();
  syncNavigationAccessibility();

  if (activeModalRobotId) {
    const robot = robots.find((item) => item.id === activeModalRobotId);
    if (robot) renderModal(robot);
  }
}

function isMobileNavigation() {
  return window.innerWidth <= mobileBreakpoint;
}

function isNavigationOpen() {
  return Boolean(nav?.classList.contains("is-open"));
}

function syncNavigationAccessibility() {
  if (!navToggle) return;
  const isOpen = isNavigationOpen();
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute(
    "aria-label",
    isOpen ? t("accessibility.closeNav") : t("accessibility.openNav"),
  );
}

function openNavigation() {
  if (!nav || !navToggle || !isMobileNavigation()) return;
  nav.classList.add("is-open");
  document.body.classList.add("nav-is-open");
  navOpenScrollY = window.scrollY;
  if (navOverlay) navOverlay.hidden = false;
  syncNavigationAccessibility();
}

function closeNavigation({ restoreFocus = false } = {}) {
  if (!nav || !navToggle) return;
  const wasOpen = isNavigationOpen();
  nav.classList.remove("is-open");
  document.body.classList.remove("nav-is-open");
  if (navOverlay) navOverlay.hidden = true;
  syncNavigationAccessibility();
  if (wasOpen && restoreFocus && document.contains(navToggle)) {
    navToggle.focus();
  }
}

function resolveSpecificationValue(item, robot) {
  if (item.valueFrom) return localized(robot[item.valueFrom]);
  if (currentLanguage === "en" && item.valueEn) return item.valueEn;
  return localized(item.value);
}

function renderModal(robot) {
  if (!modalContent || !modalDialog) return;
  const specificationGroups = robot.specifications
    .map((group) => {
      const items = group.items
        .map((item) => {
          const value = resolveSpecificationValue(item, robot);
          if (!value) return "";
          return `
            <div class="spec-row">
              <dt>${escapeHtml(t(`products.modal.labels.${item.label}`, item.label))}</dt>
              <dd>${escapeHtml(value)}</dd>
            </div>
          `;
        })
        .filter(Boolean)
        .join("");
      if (!items) return "";
      return `
        <section class="spec-group">
          <h3>${escapeHtml(t(`products.modal.groups.${group.group}`, group.group))}</h3>
          <dl>${items}</dl>
        </section>
      `;
    })
    .filter(Boolean)
    .join("");

  const price =
    typeof robot.price === "number"
      ? `
        <div class="modal-price">
          <span>${escapeHtml(t("products.modal.price", "Price"))}</span>
          <strong>${escapeHtml(
            new Intl.NumberFormat(currentLanguage === "hr" ? "hr-HR" : "en-IE", {
              style: "currency",
              currency: "EUR",
            }).format(robot.price),
          )}</strong>
        </div>
      `
      : "";

  modalDialog.setAttribute(
    "aria-label",
    interpolate(t("accessibility.modalLabel"), { model: robot.fullName }),
  );
  modalContent.innerHTML = `
    <div class="modal-hero">
      <div class="modal-image">
        <img
          src="${escapeHtml(robot.image)}"
          width="700"
          height="700"
          alt="${escapeHtml(localized(robot.imageAlt))}"
        />
      </div>
      <div class="modal-summary">
        <p class="modal-brand">${escapeHtml(robot.manufacturer)}</p>
        <h2 id="robot-modal-title">${escapeHtml(robot.fullName)}</h2>
        <p class="modal-description">${escapeHtml(localized(robot.shortDescription))}</p>
        <dl class="modal-recommendations">
          <div>
            <dt>${escapeHtml(t("products.modal.recommendedUse"))}</dt>
            <dd>${escapeHtml(localized(robot.primaryUse))}</dd>
          </div>
          <div>
            <dt>${escapeHtml(t("products.modal.recommendedSpaces"))}</dt>
            <dd>${escapeHtml(localized(robot.spaces))}</dd>
          </div>
        </dl>
        ${price}
      </div>
    </div>
    <div class="spec-groups">${specificationGroups}</div>
    <div class="modal-footer">
      <div>
        <a href="${escapeHtml(robot.sourceUrl)}" target="_blank" rel="noopener noreferrer">
          ${escapeHtml(t("products.modal.source"))}
          <span aria-hidden="true">↗</span>
        </a>
        <p>${escapeHtml(t("products.modal.sourceNote"))}</p>
      </div>
      <button class="button button-primary" type="button" data-modal-demo="${escapeHtml(robot.id)}">
        <span>${escapeHtml(t("buttons.modalDemo"))}</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  `;
}

function setPageInert(isInert) {
  ["header", "main", "footer"].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) element.inert = isInert;
  });
}

function openModal(robotId, opener) {
  const robot = robots.find((item) => item.id === robotId);
  if (!robot || !robotModal || !modalDialog) return;
  closeNavigation({ restoreFocus: false });
  activeModalRobotId = robotId;
  modalOpener = opener || document.activeElement;
  renderModal(robot);
  robotModal.hidden = false;
  document.body.classList.add("modal-is-open");
  setPageInert(true);
  modalDialog.scrollTop = 0;
  window.requestAnimationFrame(() => modalClose?.focus());
}

function closeModal({ restoreFocus = true } = {}) {
  if (!robotModal || robotModal.hidden) return;
  robotModal.hidden = true;
  document.body.classList.remove("modal-is-open");
  setPageInert(false);
  activeModalRobotId = null;
  const focusTarget = modalOpener;
  modalOpener = null;
  if (restoreFocus && focusTarget instanceof HTMLElement && document.contains(focusTarget)) {
    focusTarget.focus();
  }
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hidden && element.getClientRects().length > 0);
}

function trapModalFocus(event) {
  if (event.key !== "Tab" || !modalDialog || robotModal?.hidden) return;
  const focusable = getFocusableElements(modalDialog);
  if (!focusable.length) {
    event.preventDefault();
    modalDialog.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function selectRobotForDemo(robotId) {
  const robot = robots.find((item) => item.id === robotId);
  if (!robot || !selectedModelInput || !demoSection) return;
  selectedModelInput.value = robot.fullName;
  closeModal({ restoreFocus: false });
  demoSection.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    const firstField = demoForm?.querySelector("input:not([readonly])");
    firstField?.focus({ preventScroll: true });
  }, 450);
}

function validateForm() {
  if (!demoForm) return false;
  const fields = Array.from(demoForm.querySelectorAll("input, textarea"));
  fields.forEach((field) => field.setCustomValidity(""));

  fields.forEach((field) => {
    if (field.required && !field.value.trim()) {
      field.setCustomValidity(t("forms.required"));
    } else if (field.type === "email" && field.validity.typeMismatch) {
      field.setCustomValidity(t("forms.email"));
    }
  });

  const isValid = demoForm.checkValidity();
  if (!isValid) demoForm.reportValidity();
  return isValid;
}

function prepareEmailRequest() {
  if (!demoForm || !formStatus || !submitButton || !submitLabel || !validateForm()) return;
  const data = new FormData(demoForm);
  const company = String(data.get("company") || "").trim();
  const subject = interpolate(t("forms.emailSubject"), { company });
  const labels = activeLocale.forms.emailBody;
  const body = [
    `${labels.name}: ${data.get("name") || ""}`,
    `${labels.company}: ${company}`,
    `${labels.email}: ${data.get("email") || ""}`,
    `${labels.phone}: ${data.get("phone") || "—"}`,
    `${labels.model}: ${data.get("model") || "—"}`,
    "",
    `${labels.message}:`,
    `${data.get("message") || ""}`,
  ].join("\n");

  submitButton.disabled = true;
  submitButton.setAttribute("aria-busy", "true");
  submitLabel.textContent = t("forms.submitting");
  formStatus.classList.remove("is-error");
  formStatus.textContent = t("forms.submitting");

  window.setTimeout(() => {
    try {
      const mailto = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      formStatus.textContent = t("forms.success");
    } catch {
      formStatus.classList.add("is-error");
      formStatus.textContent = interpolate(t("forms.error"), { email: site.email });
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
      submitLabel.textContent = t("buttons.sendRequest");
    }
  }, 350);
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    if (isNavigationOpen()) {
      closeNavigation({ restoreFocus: false });
    } else {
      openNavigation();
    }
  });

  nav.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link) closeNavigation({ restoreFocus: false });
  });
}

navOverlay?.addEventListener("click", () => closeNavigation({ restoreFocus: true }));

document.addEventListener("pointerdown", (event) => {
  if (event.target === navOverlay) return;
  if (
    isNavigationOpen() &&
    !nav?.contains(event.target) &&
    !navToggle?.contains(event.target)
  ) {
    closeNavigation({ restoreFocus: false });
  }
});

window.addEventListener(
  "scroll",
  () => {
    if (isNavigationOpen() && Math.abs(window.scrollY - navOpenScrollY) > 36) {
      closeNavigation({ restoreFocus: false });
    }
  },
  { passive: true },
);

window.addEventListener("resize", () => {
  if (!isMobileNavigation() && isNavigationOpen()) {
    closeNavigation({ restoreFocus: false });
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (robotModal && !robotModal.hidden) {
      event.preventDefault();
      closeModal({ restoreFocus: true });
      return;
    }
    if (isNavigationOpen()) {
      event.preventDefault();
      closeNavigation({ restoreFocus: true });
    }
  }
  trapModalFocus(event);
});

document.querySelectorAll("[data-lang-button]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.langButton));
});

document.querySelector(".catalog-filters")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter-type]");
  if (!button) return;
  catalogState[button.dataset.filterType] = button.dataset.filterValue;
  renderFilters();
  renderProducts();
});

filterReset?.addEventListener("click", () => {
  catalogState.manufacturer = "all";
  catalogState.task = "all";
  renderFilters();
  renderProducts();
});

productsGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-robot]");
  if (button) openModal(button.dataset.openRobot, button);
});

document.querySelector("[data-faq-list]")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-faq-button]");
  if (!button) return;
  const answer = document.getElementById(button.getAttribute("aria-controls"));
  const willOpen = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(willOpen));
  if (answer) answer.hidden = !willOpen;
});

modalClose?.addEventListener("click", () => closeModal({ restoreFocus: true }));

robotModal?.addEventListener("click", (event) => {
  if (event.target === robotModal) {
    closeModal({ restoreFocus: true });
    return;
  }
  const demoButton = event.target.closest("[data-modal-demo]");
  if (demoButton) selectRobotForDemo(demoButton.dataset.modalDemo);
});

demoForm?.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    event.target.setCustomValidity("");
  }
  formStatus?.classList.remove("is-error");
});

demoForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (submitButton?.disabled) return;
  prepareEmailRequest();
});

applyLocale();
