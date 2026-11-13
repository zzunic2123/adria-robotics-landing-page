const locales = window.AR_LOCALES || {};
const site = window.AR_SITE || {};
const dataService = window.AR_DATA_SERVICE;
const roiCalculator = window.AR_ROI;
const defaultLanguage = "hr";
const mobileBreakpoint = 920;
const financingPeriods = [24, 36, 48];
const pageParameters = new URLSearchParams(window.location.search);
const requestedIndustryId = pageParameters.get("industry");

function storageValue(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function featureEnabled(name, fallback = true) {
  const value = site.features?.[name];
  return value === undefined ? fallback : value === true;
}

function contactFormEndpoint() {
  try {
    const url = new URL(site.contactFormEndpoint || "");
    const validPath = /^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname);
    return url.protocol === "https:" && url.hostname === "script.google.com" && validPath
      ? url.href
      : "";
  } catch {
    return "";
  }
}

const languageFromQuery = new URLSearchParams(window.location.search).get("lang");
const languageFromStorage = storageValue("ar-language");
let currentLanguage = locales[languageFromQuery]
  ? languageFromQuery
  : locales[languageFromStorage]
    ? languageFromStorage
    : defaultLanguage;
let activeLocale = locales[currentLanguage] || locales[defaultLanguage];
let webData = null;
let dataMeta = null;
let dataLoadState = "loading";
let activeModalRobotId = null;
let modalOpener = null;
let modalFinancingState = { mode: "purchase", period: 36 };
let roiState = null;
let roiUpdateTimer = 0;
let navOpenScrollY = 0;
let initialPageStateApplied = false;

const catalogState = {
  manufacturer: "all",
  task: "all",
  industry: "all",
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
const activeIndustryFilter = document.querySelector("[data-active-industry-filter]");
const dataNotice = document.querySelector("[data-data-notice]");
const industriesGrid = document.querySelector("[data-industries-grid]");
const roiApp = document.querySelector("[data-roi-app]");
const roiStatus = document.querySelector("[data-roi-status]");
const servicePlansContainer = document.querySelector("[data-service-plans]");
const robotModal = document.querySelector("[data-robot-modal]");
const modalDialog = document.querySelector("[data-modal-dialog]");
const modalContent = document.querySelector("[data-modal-content]");
const modalClose = document.querySelector("[data-modal-close]");
const demoForm = document.querySelector("[data-demo-form]");
const formStatus = document.querySelector("[data-form-status]");
const submitButton = document.querySelector("[data-submit-button]");
const submitLabel = document.querySelector("[data-submit-label]");
let contactSubmissionPending = false;
let contactSubmissionTimer = 0;

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
  return String(value ?? "")
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

function localeCode() {
  return currentLanguage === "hr" ? "hr-HR" : "en-IE";
}

function formatCurrency(value, fractionDigits) {
  const number = Number(value);
  if (!Number.isFinite(number)) return t("roi.unavailable", "N/A");
  const digits = fractionDigits ?? (Number.isInteger(number) ? 0 : 2);
  return new Intl.NumberFormat(localeCode(), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(number);
}

function formatNumber(value, maximumFractionDigits = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return t("roi.unavailable", "N/A");
  return new Intl.NumberFormat(localeCode(), { maximumFractionDigits }).format(number);
}

function formatPercent(value, maximumFractionDigits = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return t("roi.unavailable", "N/A");
  return new Intl.NumberFormat(localeCode(), {
    style: "percent",
    maximumFractionDigits,
  }).format(number);
}

function updateLanguageInUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", currentLanguage);
  window.history.replaceState({}, "", url);
}

function pageUrl(path, parameters = {}) {
  const url = new URL(path, window.location.href);
  url.searchParams.set("lang", currentLanguage);
  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") url.searchParams.set(key, value);
  });
  return url.href;
}

function applyTextTranslations() {
  document.documentElement.lang = currentLanguage;
  const metaKey = document.body.dataset.metaKey;
  document.title = metaKey
    ? t(`${metaKey}.title`, t("meta.title", document.title))
    : t("meta.title", document.title);
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute(
      "content",
      metaKey
        ? t(`${metaKey}.description`, t("meta.description", description.getAttribute("content") || ""))
        : t("meta.description", description.getAttribute("content") || ""),
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
  const products = webData?.products || [];
  const manufacturers = [...new Set(products.map((product) => product.manufacturer).filter(Boolean))];
  manufacturerFilters.closest(".filter-group").hidden = manufacturers.length <= 1;
  if (manufacturers.length <= 1) catalogState.manufacturer = "all";
  if (
    catalogState.manufacturer !== "all" &&
    !manufacturers.includes(catalogState.manufacturer)
  ) {
    catalogState.manufacturer = "all";
  }
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

  const categories = activeLocale.products?.categories || {};
  const availableTasks = Object.keys(categories).filter((category) =>
    products.some((product) => product.taskCategories.includes(category)),
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
      catalogState.manufacturer === "all" &&
      catalogState.task === "all" &&
      catalogState.industry === "all";
  }
  renderActiveIndustryFilter();
}

function renderActiveIndustryFilter() {
  if (!activeIndustryFilter) return;
  const industry = webData?.industries.find((item) => item.id === catalogState.industry);
  activeIndustryFilter.hidden = !industry;
  activeIndustryFilter.innerHTML = industry
    ? `
      <span>${escapeHtml(
        interpolate(t("products.industryActive"), { industry: localized(industry.title) }),
      )}</span>
      <button type="button" data-clear-industry>
        ${escapeHtml(t("buttons.clearIndustry"))}
        <span aria-hidden="true">×</span>
      </button>
    `
    : "";
}

function productIndustryPriority(productId, industryId) {
  return webData?.productIndustries.find(
    (item) => item.productId === productId && item.industryId === industryId,
  )?.priority;
}

function getFilteredRobots() {
  if (!webData) return [];
  return webData.products
    .filter((product) => {
      const manufacturerMatches =
        catalogState.manufacturer === "all" ||
        product.manufacturer === catalogState.manufacturer;
      const taskMatches =
        catalogState.task === "all" || product.taskCategories.includes(catalogState.task);
      const industryMatches =
        catalogState.industry === "all" ||
        productIndustryPriority(product.id, catalogState.industry) !== undefined;
      return manufacturerMatches && taskMatches && industryMatches;
    })
    .sort((a, b) => {
      if (catalogState.industry !== "all") {
        const priorityDifference =
          productIndustryPriority(a.id, catalogState.industry) -
          productIndustryPriority(b.id, catalogState.industry);
        if (priorityDifference) return priorityDifference;
      }
      return a.sortOrder - b.sortOrder;
    });
}

function imagePlaceholder(product) {
  const label = interpolate(t("products.imageUnavailableAlt"), { model: product.fullName });
  return `
    <div class="product-placeholder" role="img" aria-label="${escapeHtml(label)}">
      <img
        src="assets/brand/adria-robotics-icon.svg"
        width="58"
        height="58"
        alt=""
        aria-hidden="true"
      />
      <span>${escapeHtml(product.fullName)}</span>
      <small>${escapeHtml(t("products.imageUnavailable"))}</small>
    </div>
  `;
}

function productImage(product, { lazy = true } = {}) {
  if (product.imageStatus !== "ready" || !product.imagePath) return imagePlaceholder(product);
  return `
    <img
      src="${escapeHtml(product.imagePath)}"
      width="700"
      height="700"
      ${lazy ? 'loading="lazy"' : ""}
      decoding="async"
      alt="${escapeHtml(localized(product.imageAlt))}"
      data-product-image="${escapeHtml(product.id)}"
    />
  `;
}

function financingForProduct(productId) {
  return webData?.financing.find((item) => item.productId === productId) || null;
}

function renderCatalogSkeleton() {
  if (!productsGrid) return;
  productsGrid.innerHTML = Array.from(
    { length: 4 },
    (_, index) => `
      <div class="product-card catalog-skeleton" aria-hidden="true" data-skeleton="${index}">
        <div class="product-image"></div>
        <div class="product-body"><span></span><span></span><span></span></div>
      </div>
    `,
  ).join("");
}

function renderProducts() {
  if (!productsGrid) return;
  if (dataLoadState === "loading" && !webData) {
    catalogStatus.textContent = t("data.loadingCatalog");
    catalogEmpty.hidden = true;
    renderCatalogSkeleton();
    return;
  }
  if (dataLoadState === "error" && !webData) {
    productsGrid.innerHTML = "";
    catalogEmpty.hidden = true;
    catalogStatus.innerHTML = `
      <span>${escapeHtml(t("data.error"))}</span>
      <button class="inline-retry" type="button" data-data-retry>${escapeHtml(
        t("buttons.retry"),
      )}</button>
    `;
    return;
  }

  const filteredRobots = getFilteredRobots();
  const showPricing = featureEnabled("showPricing");
  productsGrid.innerHTML = filteredRobots
    .map((product) => {
      const financing = showPricing ? financingForProduct(product.id) : null;
      const titleId = `product-title-${product.id}`;
      const descriptionId = `product-description-${product.id}`;
      const cardLabel = interpolate(t("accessibility.productCard"), { model: product.fullName });
      const highlights = [
        ["application", localized(product.segment)],
        ["operation", localized(product.cleaningType)],
        ["performance", product.capacity],
      ]
        .filter(([, value]) => value)
        .slice(0, 3)
        .map(
          ([label, value]) => `
            <li>
              <strong>${escapeHtml(t(`products.highlightLabels.${label}`, label))}:</strong>
              <span>${escapeHtml(value)}</span>
            </li>
          `,
        )
        .join("");
      const rentText = financing
        ? interpolate(t("products.standardRentFrom"), {
            amount: formatCurrency(financing.rentStandard[36], 2),
          })
        : "";
      return `
        <article class="product-card">
          <button
            class="product-card-action"
            type="button"
            aria-label="${escapeHtml(cardLabel)}"
            aria-labelledby="${titleId} ${descriptionId}"
            data-open-robot="${escapeHtml(product.id)}"
          ></button>
          <div class="product-image" data-product-image-frame="${escapeHtml(product.id)}">
            ${productImage(product)}
          </div>
          <div class="product-body">
            <p class="product-brand">${escapeHtml(product.manufacturer)}</p>
            <h3 id="${titleId}">${escapeHtml(product.fullName)}</h3>
            <p class="product-description" id="${descriptionId}">
              ${escapeHtml(localized(product.shortDescription))}
            </p>
            <ul class="product-highlights">${highlights}</ul>
            ${
              showPricing
                ? `<div class="product-commercial">
                    <p>
                      ${product.priceNetEur === null ? "" : `<strong>${escapeHtml(formatCurrency(product.priceNetEur, 0))}</strong>`}
                      <span>${escapeHtml(localized(product.priceNote))}</span>
                    </p>
                    ${rentText ? `<small>${escapeHtml(rentText)}</small>` : ""}
                  </div>`
                : ""
            }
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
  catalogStatus.textContent = interpolate(countTemplate, { count: filteredRobots.length });
  catalogEmpty.hidden = filteredRobots.length !== 0;
}

function renderIndustries() {
  if (!industriesGrid) return;
  if (!webData) {
    industriesGrid.innerHTML = "";
    return;
  }
  industriesGrid.innerHTML = webData.industries
    .map((industry) => {
      const title = localized(industry.title);
      const isActive = catalogState.industry === industry.id;
      return `
        <article${isActive ? ' class="is-active"' : ""}>
          <button
            class="industry-card-action"
            type="button"
            data-industry="${escapeHtml(industry.id)}"
            aria-pressed="${String(isActive)}"
            aria-label="${escapeHtml(
              interpolate(t("accessibility.industryCard"), { industry: title }),
            )}"
          >
            <span class="industry-image">
              <img
                src="${escapeHtml(industry.imagePath)}"
                width="960"
                height="467"
                loading="lazy"
                decoding="async"
                alt="${escapeHtml(localized(industry.imageAlt))}"
              />
            </span>
            <span class="industry-body">
              <strong>${escapeHtml(title)}</strong>
              <span>${escapeHtml(localized(industry.description))}</span>
            </span>
          </button>
        </article>
      `;
    })
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
  list.innerHTML = activeLocale.demo.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("");
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
            <button type="button" aria-expanded="false" aria-controls="${answerId}" data-faq-button>
              <span>${escapeHtml(item.question)}</span>
              <span class="faq-icon" aria-hidden="true"></span>
            </button>
          </h3>
          <div class="faq-answer" id="${answerId}" hidden><p>${escapeHtml(item.answer)}</p></div>
        </article>
      `;
    })
    .join("");
}

function renderSiteDetails() {
  const salesPhones = Array.isArray(site.salesPhones) ? site.salesPhones : [];
  document.querySelectorAll("[data-contact-sales-phone]").forEach((link) => {
    const phone = salesPhones[Number(link.dataset.contactSalesPhone)];
    link.hidden = !phone?.display || !phone?.href;
    link.textContent = phone?.display || "";
    if (phone?.href) link.setAttribute("href", `tel:${phone.href}`);
    else link.removeAttribute("href");
  });
  document.querySelectorAll("[data-contact-support-phone]").forEach((link) => {
    const phone = site.supportPhone;
    link.hidden = !phone?.display || !phone?.href;
    link.textContent = phone?.display || "";
    if (phone?.href) link.setAttribute("href", `tel:${phone.href}`);
    else link.removeAttribute("href");
  });
  document.querySelectorAll("[data-contact-email]").forEach((link) => {
    const showEmail = featureEnabled("showEmail") && Boolean(site.email);
    const row = link.closest("[data-contact-email-row]");
    link.hidden = !showEmail;
    if (row) row.hidden = !showEmail;
    if (showEmail) {
      link.textContent = site.email;
      link.setAttribute("href", `mailto:${site.email}`);
    } else {
      link.textContent = "";
      link.removeAttribute("href");
    }
  });
  const endpoint = contactFormEndpoint();
  const showContactForm = featureEnabled("showContactForm") && Boolean(endpoint);
  if (demoForm) {
    demoForm.hidden = !showContactForm;
    if (endpoint) demoForm.setAttribute("action", endpoint);
    else demoForm.removeAttribute("action");
  }
  demoForm
    ?.closest("[data-contact-layout]")
    ?.classList.toggle("is-form-hidden", !showContactForm);
  document.querySelectorAll("[data-site-legal-name]").forEach((element) => {
    element.textContent = site.legalName || "";
  });
  document.querySelectorAll("[data-site-address]").forEach((element) => {
    element.textContent = site.address || "";
  });
  document.querySelectorAll("[data-site-tax-id]").forEach((element) => {
    element.textContent = site.taxId || "";
  });
  document.querySelectorAll("[data-site-bank-name]").forEach((element) => {
    element.textContent = site.bankName || "";
  });
  document.querySelectorAll("[data-site-iban]").forEach((element) => {
    element.textContent = site.iban || "";
  });
  document.querySelectorAll("[data-page-link]").forEach((link) => {
    link.setAttribute("href", pageUrl(link.dataset.pageLink));
  });
  const activePage = document.body.dataset.page;
  document.querySelectorAll("[data-nav-page]").forEach((link) => {
    if (link.dataset.navPage === activePage) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const copyright = document.querySelector("[data-copyright]");
  if (copyright) {
    const year = Math.max(site.copyrightStartYear || 2026, new Date().getFullYear());
    copyright.textContent = interpolate(t("footer.copyright"), { year });
  }
}

function renderDataNotice() {
  if (!dataNotice) return;
  const noticeKey = dataMeta?.source === "stale-cache" ? "data.staleCache" : dataMeta?.source === "fallback" ? "data.fallback" : "";
  dataNotice.hidden = !noticeKey;
  dataNotice.textContent = noticeKey ? t(noticeKey) : "";
}

function renderServicePlans() {
  if (!servicePlansContainer) return;
  if (!webData) {
    servicePlansContainer.innerHTML = "";
    return;
  }
  const included = (value) =>
    value
      ? `<span class="plan-included"><span aria-hidden="true">✓</span><span>${escapeHtml(
          t("servicePlans.included"),
        )}</span></span>`
      : `<span class="plan-not-included">${escapeHtml(t("servicePlans.notIncluded"))}</span>`;
  servicePlansContainer.innerHTML = `
    <table class="service-plans-table">
      <thead>
        <tr>
          <th scope="col">${escapeHtml(t("servicePlans.service"))}</th>
          <th scope="col">${escapeHtml(t("servicePlans.standard"))}</th>
          <th scope="col">${escapeHtml(t("servicePlans.fullService"))}</th>
        </tr>
      </thead>
      <tbody>
        ${webData.servicePlans
          .map(
            (plan) => `
              <tr>
                <th scope="row">
                  <span>${escapeHtml(localized(plan.label))}</span>
                  ${
                    localized(plan.note)
                      ? `<small><span class="sr-only">${escapeHtml(t("servicePlans.note"))}: </span>${escapeHtml(
                          localized(plan.note),
                        )}</small>`
                      : ""
                  }
                </th>
                <td data-label="${escapeHtml(t("servicePlans.standard"))}">${included(plan.standardIncluded)}</td>
                <td data-label="${escapeHtml(t("servicePlans.fullService"))}">${included(plan.fullServiceIncluded)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function specificationsForProduct(productId) {
  return webData?.specifications.filter((item) => item.productId === productId) || [];
}

function renderSpecificationGroups(product) {
  const groups = new Map();
  specificationsForProduct(product.id).forEach((specification) => {
    if (!groups.has(specification.groupId)) groups.set(specification.groupId, []);
    groups.get(specification.groupId).push(specification);
  });
  return [...groups.entries()]
    .map(
      ([groupId, items]) => `
        <section class="spec-group">
          <h3>${escapeHtml(t(`products.modal.groups.${groupId}`, groupId))}</h3>
          <dl>
            ${items
              .map(
                (item) => `
                  <div class="spec-row">
                    <dt>${escapeHtml(localized(item.label))}</dt>
                    <dd>${escapeHtml(localized(item.value))}</dd>
                  </div>
                `,
              )
              .join("")}
          </dl>
        </section>
      `,
    )
    .join("");
}

function financingModeLabel(mode) {
  return t(
    {
      purchase: "products.financing.purchase",
      lease: "products.financing.lease",
      rentStandard: "products.financing.rentStandard",
      rentFull: "products.financing.rentFull",
    }[mode],
    mode,
  );
}

function financingRate(financing, mode, period) {
  if (!financing) return null;
  if (mode === "lease") return financing.lease[period];
  if (mode === "rentStandard") return financing.rentStandard[period];
  if (mode === "rentFull") return financing.rentFull[period];
  return financing.netPriceEur;
}

function financingPanelHtml(product) {
  const financing = financingForProduct(product.id);
  if (!financing) return "";
  if (!featureEnabled("showPricing")) {
    return `
      <section class="modal-financing" aria-labelledby="modal-financing-title">
        <h3 id="modal-financing-title">${escapeHtml(t("products.financing.title"))}</h3>
        <p class="financing-availability-intro">
          ${escapeHtml(t("products.financing.availabilityIntro"))}
        </p>
        <ul class="financing-availability">
          ${["purchase", "lease", "rentStandard", "rentFull"]
            .map((mode) => `<li>${escapeHtml(financingModeLabel(mode))}</li>`)
            .join("")}
        </ul>
        <p class="financing-terms">
          <strong>${escapeHtml(t("products.financing.availableTerms"))}</strong>
          ${escapeHtml(
            financingPeriods
              .map((period) => interpolate(t("products.financing.months"), { count: period }))
              .join(" · "),
          )}
        </p>
        <p class="financing-disclaimer">${escapeHtml(t("products.financing.quoteNote"))}</p>
        <a href="#service-plans" data-modal-services>
          ${escapeHtml(t("products.financing.servicesLink"))}
          <span aria-hidden="true">↓</span>
        </a>
      </section>
    `;
  }
  return `
    <section class="modal-financing" aria-labelledby="modal-financing-title">
      <h3 id="modal-financing-title">${escapeHtml(t("products.financing.title"))}</h3>
      <div
        class="financing-options"
        role="group"
        aria-label="${escapeHtml(t("accessibility.financingType"))}"
      >
        ${["purchase", "lease", "rentStandard", "rentFull"]
          .map(
            (mode) => `
              <button
                type="button"
                data-financing-mode="${mode}"
                aria-pressed="${String(modalFinancingState.mode === mode)}"
                class="${modalFinancingState.mode === mode ? "is-active" : ""}"
              >${escapeHtml(financingModeLabel(mode))}</button>
            `,
          )
          .join("")}
      </div>
      <div
        class="financing-periods"
        role="group"
        aria-label="${escapeHtml(t("accessibility.financingPeriod"))}"
        data-financing-periods
      >
        <span>${escapeHtml(t("products.financing.period"))}</span>
        ${financingPeriods
          .map(
            (period) => `
              <button
                type="button"
                data-financing-period="${period}"
                aria-pressed="${String(modalFinancingState.period === period)}"
                class="${modalFinancingState.period === period ? "is-active" : ""}"
              >${escapeHtml(interpolate(t("products.financing.months"), { count: period }))}</button>
            `,
          )
          .join("")}
      </div>
      <div class="financing-result" data-financing-result aria-live="polite"></div>
      <p class="financing-disclaimer">${escapeHtml(localized(financing.disclaimer))}</p>
      <a href="#service-plans" data-modal-services>
        ${escapeHtml(t("products.financing.servicesLink"))}
        <span aria-hidden="true">↓</span>
      </a>
    </section>
  `;
}

function updateModalFinancing() {
  if (!activeModalRobotId || !modalContent) return;
  const financing = financingForProduct(activeModalRobotId);
  if (!financing) return;
  modalContent.querySelectorAll("[data-financing-mode]").forEach((button) => {
    const isActive = button.dataset.financingMode === modalFinancingState.mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  modalContent.querySelectorAll("[data-financing-period]").forEach((button) => {
    const isActive = Number(button.dataset.financingPeriod) === modalFinancingState.period;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  const periods = modalContent.querySelector("[data-financing-periods]");
  if (periods) periods.hidden = modalFinancingState.mode === "purchase";
  const amount = financingRate(financing, modalFinancingState.mode, modalFinancingState.period);
  const result = modalContent.querySelector("[data-financing-result]");
  if (!result) return;
  const isPurchase = modalFinancingState.mode === "purchase";
  result.innerHTML = `
    <dl>
      <div>
        <dt>${escapeHtml(
          t(isPurchase ? "products.financing.netAmount" : "products.financing.monthlyRate"),
        )}</dt>
        <dd>${escapeHtml(formatCurrency(amount, isPurchase ? 0 : 2))}</dd>
      </div>
      ${
        modalFinancingState.mode === "lease"
          ? `<div><dt>${escapeHtml(t("products.financing.downPayment"))}</dt><dd>${escapeHtml(
              formatCurrency(financing.leaseDownPaymentEur, 2),
            )}</dd></div>`
          : ""
      }
    </dl>
    <p>${escapeHtml(localized(financing.priceNote))}</p>
  `;
}

function renderModal(product) {
  if (!modalContent || !modalDialog) return;
  const sourceLink = product.sourceUrl
    ? `
      <a href="${escapeHtml(product.sourceUrl)}" target="_blank" rel="noopener noreferrer">
        ${escapeHtml(t("products.modal.source"))}<span aria-hidden="true">↗</span>
      </a>
    `
    : "";
  modalDialog.setAttribute(
    "aria-label",
    interpolate(t("accessibility.modalLabel"), { model: product.fullName }),
  );
  modalContent.innerHTML = `
    <div class="modal-hero">
      <div class="modal-image" data-product-image-frame="${escapeHtml(product.id)}">
        ${productImage(product, { lazy: false })}
      </div>
      <div class="modal-summary">
        <p class="modal-brand">${escapeHtml(product.manufacturer)}</p>
        <h2 id="robot-modal-title">${escapeHtml(product.fullName)}</h2>
        <p class="modal-description">${escapeHtml(localized(product.shortDescription))}</p>
        <dl class="modal-recommendations">
          <div>
            <dt>${escapeHtml(t("products.modal.recommendedUse"))}</dt>
            <dd>${escapeHtml(localized(product.segment))}</dd>
          </div>
          <div>
            <dt>${escapeHtml(t("products.modal.recommendedSpaces"))}</dt>
            <dd>${escapeHtml(localized(product.environments))}</dd>
          </div>
        </dl>
        ${
          featureEnabled("showPricing")
            ? `<div class="modal-price">
                <span>${escapeHtml(t("products.netPrice"))}</span>
                ${product.priceNetEur === null ? "" : `<strong>${escapeHtml(formatCurrency(product.priceNetEur, 0))}</strong>`}
                <small>${escapeHtml(localized(product.priceNote))}</small>
              </div>`
            : ""
        }
      </div>
    </div>
    <div class="spec-groups">${renderSpecificationGroups(product)}</div>
    ${financingPanelHtml(product)}
    <div class="modal-footer">
      <div>
        ${sourceLink}
        <p>${escapeHtml(t("products.modal.sourceNote"))}</p>
      </div>
      <button class="button button-primary" type="button" data-modal-quote="${escapeHtml(product.id)}">
        <span>${escapeHtml(t("buttons.requestQuote"))}</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  `;
  updateModalFinancing();
}

function setPageInert(isInert) {
  ["header", "main", "footer"].forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) element.inert = isInert;
  });
}

function openModal(productId, opener) {
  const product = webData?.products.find((item) => item.id === productId);
  if (!product || !robotModal || !modalDialog) return;
  closeNavigation({ restoreFocus: false });
  activeModalRobotId = productId;
  modalOpener = opener || document.activeElement;
  modalFinancingState = { mode: "purchase", period: 36 };
  renderModal(product);
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

function selectRobotForQuote(productId) {
  const product = webData?.products.find((item) => item.id === productId);
  if (!product) return;
  closeModal({ restoreFocus: false });
  window.location.href = pageUrl("contact.html");
}

function applyInitialPageState() {
  if (initialPageStateApplied || !webData) return;
  if (
    productsGrid &&
    requestedIndustryId &&
    webData.industries.some((industry) => industry.id === requestedIndustryId)
  ) {
    catalogState.industry = requestedIndustryId;
  }
  initialPageStateApplied = true;
}

function roiConfigRow(key) {
  return webData?.roiConfig.find((item) => item.key === key) || null;
}

function roiConfigNumber(key, fallback) {
  const value = roiConfigRow(key)?.numericValue;
  return value === null || value === undefined ? fallback : value;
}

function roiConfigText(key, fallback = "") {
  return roiConfigRow(key)?.textValue || fallback;
}

function parseDefaultFinancing(value) {
  const match = String(value).match(/^(lease|rent_standard|rent_full)_(24|36|48)$/);
  if (!match) return { mode: "rentStandard", period: 36 };
  return {
    mode: { lease: "lease", rent_standard: "rentStandard", rent_full: "rentFull" }[match[1]],
    period: Number(match[2]),
  };
}

function initializeRoiState() {
  if (roiState || !webData) return;
  const defaults = parseDefaultFinancing(roiConfigText("default_financing"));
  const defaultProductId = roiConfigText("default_product_id", "gausium-mira");
  roiState = {
    area: roiConfigNumber("area_m2", 5000),
    workdaysPerMonth: roiConfigNumber("workdays_per_month", 26),
    shiftsPerDay: roiConfigNumber("shifts_per_day", 2),
    employeesPerShift: roiConfigNumber("employees_per_shift", 2),
    shiftHours: roiConfigNumber("shift_hours", 8),
    employeeCostPerHour: roiConfigNumber("employee_cost_per_hour_eur", 7.94),
    robotWorkShare: roiConfigNumber("robot_work_share", 0.7),
    productId: webData.roiProducts.some((product) => product.id === defaultProductId)
      ? defaultProductId
      : webData.roiProducts[0]?.id,
    financingMode: defaults.mode,
    period: defaults.period,
    manualRobotCount: "",
  };
}

function roiInputDefinition(stateKey) {
  return {
    area: { configKey: "area_m2", min: 1, step: 100, value: roiState.area },
    workdaysPerMonth: {
      configKey: "workdays_per_month",
      min: 1,
      max: 31,
      step: 1,
      value: roiState.workdaysPerMonth,
    },
    shiftsPerDay: {
      configKey: "shifts_per_day",
      min: 1,
      max: 8,
      step: 1,
      value: roiState.shiftsPerDay,
    },
    employeesPerShift: {
      configKey: "employees_per_shift",
      min: 1,
      step: 1,
      value: roiState.employeesPerShift,
    },
    shiftHours: {
      configKey: "shift_hours",
      min: 0.25,
      max: 24,
      step: 0.25,
      value: roiState.shiftHours,
    },
    employeeCostPerHour: {
      configKey: "employee_cost_per_hour_eur",
      min: 0.01,
      step: 0.01,
      value: roiState.employeeCostPerHour,
    },
    robotWorkShare: {
      configKey: "robot_work_share",
      min: 0,
      max: 100,
      step: 1,
      value: roiState.robotWorkShare * 100,
    },
  }[stateKey];
}

function roiInputHtml(stateKey) {
  const definition = roiInputDefinition(stateKey);
  const config = roiConfigRow(definition.configKey);
  const inputId = `roi-${stateKey}`;
  const unit = stateKey === "robotWorkShare" ? "%" : config?.unit || "";
  return `
    <div class="roi-field">
      <label for="${inputId}">${escapeHtml(localized(config?.label) || definition.configKey)}</label>
      <div class="roi-input-control">
        <input
          id="${inputId}"
          name="${stateKey}"
          type="number"
          value="${escapeHtml(definition.value)}"
          min="${definition.min}"
          ${definition.max !== undefined ? `max="${definition.max}"` : ""}
          step="${definition.step}"
          inputmode="decimal"
          aria-describedby="${inputId}-unit ${inputId}-error"
          data-roi-input="${stateKey}"
        />
        <span id="${inputId}-unit">${escapeHtml(unit)}</span>
      </div>
      <small class="field-error" id="${inputId}-error" data-roi-error="${stateKey}"></small>
    </div>
  `;
}

function renderRoi() {
  if (!roiApp || !roiStatus) return;
  if (dataLoadState === "loading" && !webData) {
    roiApp.hidden = true;
    roiStatus.hidden = false;
    roiStatus.textContent = t("data.loadingRoi");
    return;
  }
  if (dataLoadState === "error" && !webData) {
    roiApp.hidden = true;
    roiStatus.hidden = false;
    roiStatus.innerHTML = `
      <span>${escapeHtml(t("data.error"))}</span>
      <button class="inline-retry" type="button" data-data-retry>${escapeHtml(
        t("buttons.retry"),
      )}</button>
    `;
    return;
  }
  initializeRoiState();
  if (!roiState) return;
  roiStatus.hidden = true;
  roiApp.hidden = false;
  roiApp.innerHTML = `
    <div class="roi-layout">
      <form class="roi-form" data-roi-form novalidate>
        <h3>${escapeHtml(t("roi.inputsTitle"))}</h3>
        <p class="roi-form-intro">${escapeHtml(t("roi.simpleIntro"))}</p>
        <div class="roi-fields roi-fields-primary">
          ${["area", "employeesPerShift"].map(roiInputHtml).join("")}
          <div class="roi-field roi-field-product">
            <label for="roi-product">${escapeHtml(t("roi.model"))}</label>
            <select id="roi-product" data-roi-select="productId">
              ${webData.roiProducts
                .map(
                  (product) => `<option value="${escapeHtml(product.id)}"${
                    roiState.productId === product.id ? " selected" : ""
                  }>${escapeHtml(product.fullName)}</option>`,
                )
                .join("")}
            </select>
          </div>
          <div class="roi-field">
            <label for="roi-financing">${escapeHtml(t("roi.financing"))}</label>
            <select id="roi-financing" data-roi-select="financingMode">
              ${["lease", "rentStandard", "rentFull"]
                .map(
                  (mode) => `<option value="${mode}"${
                    roiState.financingMode === mode ? " selected" : ""
                  }>${escapeHtml(t(`roi.financingOptions.${mode}`))}</option>`,
                )
                .join("")}
            </select>
          </div>
          <div class="roi-field">
            <label for="roi-period">${escapeHtml(t("roi.period"))}</label>
            <select id="roi-period" data-roi-select="period">
              ${financingPeriods
                .map(
                  (period) => `<option value="${period}"${
                    roiState.period === period ? " selected" : ""
                  }>${escapeHtml(interpolate(t("roi.periodOption"), { count: period }))}</option>`,
                )
                .join("")}
            </select>
          </div>
        </div>
        <fieldset class="roi-share-picker">
          <legend>${escapeHtml(t("roi.sharePresetTitle"))}</legend>
          <p>${escapeHtml(t("roi.sharePresetHint"))}</p>
          <div>
            ${[
              ["conservative", 0.5],
              ["realistic", 0.7],
              ["optimistic", 0.9],
            ]
              .map(
                ([name, share]) => `
                  <button
                    type="button"
                    data-roi-share="${share}"
                    aria-pressed="${String(Math.abs(roiState.robotWorkShare - share) < 0.0001)}"
                  >
                    <span>${escapeHtml(t(`roi.scenarios.${name}`))}</span>
                    <strong>${escapeHtml(formatPercent(share, 0))}</strong>
                  </button>
                `,
              )
              .join("")}
          </div>
        </fieldset>
        <details class="roi-advanced-assumptions">
          <summary>
            <span>${escapeHtml(t("roi.advancedTitle"))}</span>
            <small>${escapeHtml(t("roi.advancedHint"))}</small>
          </summary>
          <div class="roi-fields">
            ${[
              "workdaysPerMonth",
              "shiftsPerDay",
              "shiftHours",
              "employeeCostPerHour",
              "robotWorkShare",
            ]
              .map(roiInputHtml)
              .join("")}
          <div class="roi-field roi-field-manual">
            <label for="roi-manual-count">${escapeHtml(t("roi.manualRobotCount"))}</label>
            <input
              id="roi-manual-count"
              type="number"
              min="1"
              step="1"
              inputmode="numeric"
              value="${escapeHtml(roiState.manualRobotCount)}"
              aria-describedby="roi-manual-hint roi-manual-error"
              data-roi-input="manualRobotCount"
            />
            <small id="roi-manual-hint">${escapeHtml(t("roi.manualRobotHint"))}</small>
            <small class="field-error" id="roi-manual-error" data-roi-error="manualRobotCount"></small>
          </div>
          </div>
        </details>
      </form>
      <section class="roi-results" aria-labelledby="roi-results-title">
        <h3 id="roi-results-title">${escapeHtml(t("roi.resultsTitle"))}</h3>
        <div data-roi-results></div>
        <p class="sr-only" data-roi-live aria-live="polite"></p>
      </section>
    </div>
  `;
  renderRoiResults();
}

function roiFieldError(stateKey) {
  const value = roiState[stateKey];
  if (stateKey === "manualRobotCount") {
    if (value === "") return "";
    return Number.isInteger(Number(value)) && Number(value) > 0
      ? ""
      : t("roi.validation.positive");
  }
  if (stateKey === "robotWorkShare") {
    return Number.isFinite(value) && value >= 0 && value <= 1 ? "" : t("roi.validation.share");
  }
  return Number.isFinite(value) && value > 0 ? "" : t("roi.validation.positive");
}

function roiStateIsValid() {
  return [
    "area",
    "workdaysPerMonth",
    "shiftsPerDay",
    "employeesPerShift",
    "shiftHours",
    "employeeCostPerHour",
    "robotWorkShare",
    "manualRobotCount",
  ].every((key) => !roiFieldError(key));
}

function selectedRoiFinancing() {
  const financing = financingForProduct(roiState.productId);
  return {
    financing,
    monthlyRate: financingRate(financing, roiState.financingMode, roiState.period),
    isLease: roiState.financingMode === "lease",
  };
}

function calculateCurrentRoi(robotWorkShare = roiState.robotWorkShare) {
  const recommendedRobotCount = roiCalculator.recommendRobotCount(roiState.area, webData.roiConfig);
  const hasManualCount =
    roiState.manualRobotCount !== "" &&
    Number.isInteger(Number(roiState.manualRobotCount)) &&
    Number(roiState.manualRobotCount) > 0;
  const robotCount = hasManualCount ? Number(roiState.manualRobotCount) : recommendedRobotCount;
  const selected = selectedRoiFinancing();
  return {
    recommendedRobotCount,
    hasManualCount,
    result: roiCalculator.calculateRoi({
      area: roiState.area,
      workdaysPerMonth: roiState.workdaysPerMonth,
      shiftsPerDay: roiState.shiftsPerDay,
      employeesPerShift: roiState.employeesPerShift,
      shiftHours: roiState.shiftHours,
      employeeCostPerHour: roiState.employeeCostPerHour,
      robotWorkShare,
      robotCount,
      selectedMonthlyFinancingRate: selected.monthlyRate,
      selectedFinancingIsLease: selected.isLease,
      leaseDownPaymentPerRobot: selected.financing?.leaseDownPaymentEur || 0,
      fteHoursPerMonth: roiConfigNumber("fte_hours_per_month", 174),
    }),
  };
}

function paybackText(result) {
  if (result.annualSavings <= 0 || result.paybackMonths === null) {
    return t("roi.paybackNotAchieved");
  }
  if (result.paybackMonths === 0) return t("roi.paybackImmediate");
  return interpolate(t("roi.paybackMonths"), { count: formatNumber(result.paybackMonths, 1) });
}

function annualCostChart(result) {
  const maximum = Math.max(result.baselineAnnualLaborCost, result.newAnnualCost, 1);
  const beforeWidth = Math.max(0, (result.baselineAnnualLaborCost / maximum) * 100);
  const afterWidth = Math.max(0, (result.newAnnualCost / maximum) * 100);
  const summary = interpolate(t("roi.annualCostSummary"), {
    before: formatCurrency(result.baselineAnnualLaborCost, 0),
    after: formatCurrency(result.newAnnualCost, 0),
  });
  return `
    <figure class="roi-chart annual-cost-chart">
      <h4>${escapeHtml(t("roi.annualCostTitle"))}</h4>
      <div role="img" aria-label="${escapeHtml(t("accessibility.annualCostChart"))}">
        <div>
          <span>${escapeHtml(t("roi.before"))}</span>
          <i><b style="width:${beforeWidth}%"></b></i>
          <strong>${escapeHtml(formatCurrency(result.baselineAnnualLaborCost, 0))}</strong>
        </div>
        <div>
          <span>${escapeHtml(t("roi.after"))}</span>
          <i><b style="width:${afterWidth}%"></b></i>
          <strong>${escapeHtml(formatCurrency(result.newAnnualCost, 0))}</strong>
        </div>
      </div>
      <figcaption>${escapeHtml(summary)}</figcaption>
    </figure>
  `;
}

function roiDisclaimer() {
  return currentLanguage === "en"
    ? roiConfigText("disclaimer_en", t("roi.disclaimerFallback"))
    : roiConfigText("disclaimer", t("roi.disclaimerFallback"));
}

function renderRoiResults() {
  const container = roiApp?.querySelector("[data-roi-results]");
  if (!container || !roiState) return;
  const resultDetailsWereOpen = Boolean(
    container.querySelector("[data-roi-result-details]")?.open,
  );
  roiApp.querySelectorAll("[data-roi-input]").forEach((input) => {
    const error = roiFieldError(input.dataset.roiInput);
    input.setAttribute("aria-invalid", String(Boolean(error)));
    const errorElement = roiApp.querySelector(`[data-roi-error="${input.dataset.roiInput}"]`);
    if (errorElement) errorElement.textContent = error;
  });
  roiApp.querySelectorAll("[data-roi-share]").forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(Math.abs(Number(button.dataset.roiShare) - roiState.robotWorkShare) < 0.0001),
    );
  });
  if (!roiStateIsValid()) return;
  const calculation = calculateCurrentRoi();
  const result = calculation.result;
  const recommendationText = calculation.hasManualCount
    ? interpolate(t("roi.manualOverride"), { count: calculation.recommendedRobotCount })
    : t("roi.automaticRecommendation");
  const primaryKpis = [
    ["robotCount", formatNumber(result.robotCount, 0)],
    ["monthlyRobotCost", `${formatCurrency(result.monthlyRobotCost, 2)} ${t("roi.netSuffix")}`],
    ["monthlySavings", formatCurrency(result.monthlySavings, 2)],
    ["annualSavings", formatCurrency(result.annualSavings, 0)],
    ["annualRoi", formatPercent(result.annualROI)],
    ["payback", paybackText(result)],
  ];
  const secondaryKpis = [
    ["costReduction", formatPercent(result.costReduction)],
    ["replacedHours", formatNumber(result.replacedHoursPerYear, 0)],
    ["freedFte", formatNumber(result.freedFTE, 2)],
    ["benefit24", formatCurrency(result.netBenefit24, 0)],
    ["benefit36", formatCurrency(result.netBenefit36, 0)],
    ["benefit48", formatCurrency(result.netBenefit48, 0)],
  ];
  const scenarios = [
    ["conservative", 0.5],
    ["realistic", 0.7],
    ["optimistic", 0.9],
  ].map(([name, share]) => ({ name, share, result: calculateCurrentRoi(share).result }));
  container.innerHTML = `
    <p class="roi-recommendation">${escapeHtml(recommendationText)}</p>
    ${
      result.annualSavings < 0
        ? `<p class="roi-warning" role="status">${escapeHtml(t("roi.negativeWarning"))}</p>`
        : ""
    }
    <dl class="roi-kpis roi-kpis-primary">
      ${primaryKpis
        .map(
          ([key, value]) => `
            <div><dt>${escapeHtml(t(`roi.kpis.${key}`))}</dt><dd>${escapeHtml(value)}</dd></div>
          `,
        )
        .join("")}
    </dl>
    <details class="roi-result-details" data-roi-result-details${resultDetailsWereOpen ? " open" : ""}>
      <summary>
        <span>${escapeHtml(t("roi.detailsTitle"))}</span>
        <small>${escapeHtml(t("roi.detailsHint"))}</small>
      </summary>
      <div class="roi-result-details-body">
        <h4>${escapeHtml(t("roi.secondaryTitle"))}</h4>
        <dl class="roi-kpis roi-kpis-secondary">
          ${secondaryKpis
            .map(
              ([key, value]) => `
                <div><dt>${escapeHtml(t(`roi.kpis.${key}`))}</dt><dd>${escapeHtml(value)}</dd></div>
              `,
            )
            .join("")}
        </dl>
        <section class="roi-scenarios" aria-labelledby="roi-scenarios-title">
          <h4 id="roi-scenarios-title">${escapeHtml(t("roi.scenariosTitle"))}</h4>
          <div class="roi-table-wrap">
            <table>
              <thead><tr>
                <th scope="col">${escapeHtml(t("roi.scenario"))}</th>
                <th scope="col">${escapeHtml(t("roi.robotShare"))}</th>
                <th scope="col">${escapeHtml(t("roi.annualSavings"))}</th>
                <th scope="col">${escapeHtml(t("roi.annualRoi"))}</th>
                <th scope="col">${escapeHtml(t("roi.payback"))}</th>
                <th scope="col">${escapeHtml(t("roi.benefit48"))}</th>
              </tr></thead>
              <tbody>
                ${scenarios
                  .map(
                    (scenario) => `
                      <tr>
                        <th scope="row">${escapeHtml(t(`roi.scenarios.${scenario.name}`))}</th>
                        <td data-label="${escapeHtml(t("roi.robotShare"))}">${escapeHtml(formatPercent(scenario.share, 0))}</td>
                        <td data-label="${escapeHtml(t("roi.annualSavings"))}">${escapeHtml(formatCurrency(scenario.result.annualSavings, 0))}</td>
                        <td data-label="${escapeHtml(t("roi.annualRoi"))}">${escapeHtml(formatPercent(scenario.result.annualROI))}</td>
                        <td data-label="${escapeHtml(t("roi.payback"))}">${escapeHtml(paybackText(scenario.result))}</td>
                        <td data-label="${escapeHtml(t("roi.benefit48"))}">${escapeHtml(formatCurrency(scenario.result.netBenefit48, 0))}</td>
                      </tr>
                    `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </section>
        ${annualCostChart(result)}
      </div>
    </details>
    <p class="roi-disclaimer">${escapeHtml(roiDisclaimer())}</p>
  `;
  const liveSummary = roiApp.querySelector("[data-roi-live]");
  if (liveSummary) {
    liveSummary.textContent = interpolate(t("roi.liveSummary"), {
      savings: formatCurrency(result.annualSavings, 0),
      roi: formatPercent(result.annualROI),
      payback: paybackText(result),
    });
  }
}

function scheduleRoiResults() {
  window.clearTimeout(roiUpdateTimer);
  roiUpdateTimer = window.setTimeout(renderRoiResults, 260);
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
  try {
    localStorage.setItem("ar-language", language);
  } catch {
    // The language still changes for this page view when storage is unavailable.
  }
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
  renderDataNotice();
  renderServicePlans();
  renderRoi();
  updateLanguageButtons();
  syncNavigationAccessibility();
  if (activeModalRobotId) {
    const product = webData?.products.find((item) => item.id === activeModalRobotId);
    if (product) renderModal(product);
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
  navToggle.setAttribute("aria-label", isOpen ? t("accessibility.closeNav") : t("accessibility.openNav"));
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
  if (wasOpen && restoreFocus && document.contains(navToggle)) navToggle.focus();
}

function validateForm() {
  if (!demoForm) return false;
  const fields = Array.from(demoForm.querySelectorAll("input, textarea"));
  fields.forEach((field) => field.setCustomValidity(""));
  fields.forEach((field) => {
    if (field.required && !field.value.trim()) field.setCustomValidity(t("forms.required"));
    else if (field.type === "email" && field.validity.typeMismatch) {
      field.setCustomValidity(t("forms.email"));
    }
  });
  const isValid = demoForm.checkValidity();
  if (!isValid) demoForm.reportValidity();
  return isValid;
}

function setContactSubmissionState({ pending, message, error = false }) {
  contactSubmissionPending = pending;
  if (submitButton) {
    submitButton.disabled = pending;
    submitButton.toggleAttribute("aria-busy", pending);
  }
  if (submitLabel) {
    submitLabel.textContent = pending ? t("forms.submitting") : t("buttons.sendRequest");
  }
  if (formStatus) {
    formStatus.classList.toggle("is-error", error);
    formStatus.textContent = message || "";
  }
}

function prepareContactRequest(event) {
  if (
    !featureEnabled("showContactForm") ||
    !contactFormEndpoint() ||
    !demoForm ||
    !formStatus ||
    !submitButton ||
    !submitLabel ||
    contactSubmissionPending
  ) {
    event.preventDefault();
    return;
  }
  if (!validateForm()) {
    event.preventDefault();
    return;
  }
  window.clearTimeout(contactSubmissionTimer);
  setContactSubmissionState({ pending: true, message: t("forms.submitting") });
  contactSubmissionTimer = window.setTimeout(() => {
    setContactSubmissionState({
      pending: false,
      message: t("forms.timeout"),
      error: true,
    });
  }, 20000);
}

function isGoogleScriptMessageOrigin(origin) {
  try {
    const hostname = new URL(origin).hostname;
    return hostname === "script.google.com" || hostname.endsWith(".googleusercontent.com");
  } catch {
    return false;
  }
}

function handleContactFormResponse(event) {
  const response = event.data;
  if (
    !contactSubmissionPending ||
    !isGoogleScriptMessageOrigin(event.origin) ||
    !response ||
    response.source !== "adria-contact-form"
  ) {
    return;
  }
  window.clearTimeout(contactSubmissionTimer);
  if (response.success) {
    demoForm?.reset();
    setContactSubmissionState({
      pending: false,
      message: t(response.code === "saved" ? "forms.saved" : "forms.success"),
    });
    return;
  }
  setContactSubmissionState({
    pending: false,
    message: t(response.code === "validation" ? "forms.validation" : "forms.error"),
    error: true,
  });
}

async function loadData({ forceRefresh = false } = {}) {
  dataLoadState = "loading";
  renderProducts();
  renderRoi();
  try {
    if (forceRefresh) dataService.clearMemoryCache();
    const result = await dataService.loadWebData({ forceRefresh });
    webData = result.data;
    dataMeta = result.meta;
    dataLoadState = "ready";
    applyInitialPageState();
    initializeRoiState();
  } catch (error) {
    console.error("[Adria Robotics data] Public data could not be loaded.", error);
    dataLoadState = "error";
  }
  applyLocale();
}

navToggle?.addEventListener("click", () => {
  if (isNavigationOpen()) closeNavigation({ restoreFocus: false });
  else openNavigation();
});

nav?.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeNavigation({ restoreFocus: false });
});

navOverlay?.addEventListener("click", () => closeNavigation({ restoreFocus: true }));

document.addEventListener("pointerdown", (event) => {
  if (event.target === navOverlay) return;
  if (isNavigationOpen() && !nav?.contains(event.target) && !navToggle?.contains(event.target)) {
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
  if (!isMobileNavigation() && isNavigationOpen()) closeNavigation({ restoreFocus: false });
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

document.addEventListener(
  "error",
  (event) => {
    const image = event.target.closest?.("[data-product-image]");
    if (!image) return;
    const product = webData?.products.find((item) => item.id === image.dataset.productImage);
    const frame = image.closest("[data-product-image-frame]");
    if (product && frame) frame.innerHTML = imagePlaceholder(product);
  },
  true,
);

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
  catalogState.industry = "all";
  renderFilters();
  renderProducts();
  renderIndustries();
});

activeIndustryFilter?.addEventListener("click", (event) => {
  if (!event.target.closest("[data-clear-industry]")) return;
  catalogState.industry = "all";
  renderFilters();
  renderProducts();
  renderIndustries();
});

productsGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-robot]");
  if (button) openModal(button.dataset.openRobot, button);
});

industriesGrid?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-industry]");
  if (!button) return;
  if (!productsGrid) {
    window.location.href = pageUrl("robots.html", { industry: button.dataset.industry });
    return;
  }
  catalogState.industry = button.dataset.industry;
  renderFilters();
  renderProducts();
  renderIndustries();
  document.querySelector("#robots")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const mode = event.target.closest("[data-financing-mode]");
  if (mode) {
    modalFinancingState.mode = mode.dataset.financingMode;
    updateModalFinancing();
    return;
  }
  const period = event.target.closest("[data-financing-period]");
  if (period) {
    modalFinancingState.period = Number(period.dataset.financingPeriod);
    updateModalFinancing();
    return;
  }
  if (event.target.closest("[data-modal-services]")) {
    event.preventDefault();
    closeModal({ restoreFocus: false });
    const servicePlans = document.querySelector("#service-plans");
    if (servicePlans) servicePlans.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.location.href = pageUrl("service-plans.html#service-plans");
    return;
  }
  const quoteButton = event.target.closest("[data-modal-quote]");
  if (quoteButton) selectRobotForQuote(quoteButton.dataset.modalQuote);
});

roiApp?.addEventListener("click", (event) => {
  const shareButton = event.target.closest("[data-roi-share]");
  if (!shareButton || !roiState) return;
  roiState.robotWorkShare = Number(shareButton.dataset.roiShare);
  const exactShareInput = roiApp.querySelector('[data-roi-input="robotWorkShare"]');
  if (exactShareInput) exactShareInput.value = roiState.robotWorkShare * 100;
  renderRoiResults();
});

roiApp?.addEventListener("input", (event) => {
  const input = event.target.closest("[data-roi-input]");
  if (!input) return;
  const key = input.dataset.roiInput;
  if (key === "manualRobotCount") roiState[key] = input.value;
  else if (key === "robotWorkShare") roiState[key] = Number(input.value) / 100;
  else roiState[key] = Number(input.value);
  scheduleRoiResults();
});

roiApp?.addEventListener("change", (event) => {
  const select = event.target.closest("[data-roi-select]");
  if (!select) return;
  const key = select.dataset.roiSelect;
  roiState[key] = key === "period" ? Number(select.value) : select.value;
  renderRoiResults();
});

roiApp?.addEventListener("submit", (event) => event.preventDefault());

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-data-retry]")) loadData({ forceRefresh: true });
});

demoForm?.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    event.target.setCustomValidity("");
  }
  formStatus?.classList.remove("is-error");
});

demoForm?.addEventListener("submit", (event) => {
  prepareContactRequest(event);
});

window.addEventListener("message", handleContactFormResponse);

applyLocale();
loadData();
