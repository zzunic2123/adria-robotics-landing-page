const locales = window.AR_LOCALES || {};
const defaultLanguage = "hr";

const languageFromQuery = new URLSearchParams(window.location.search).get("lang");
const languageFromStorage = localStorage.getItem("ar-language");
let currentLanguage = locales[languageFromQuery]
  ? languageFromQuery
  : locales[languageFromStorage]
    ? languageFromStorage
    : defaultLanguage;
let activeLocale = locales[currentLanguage] || locales[defaultLanguage];

const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const finderForm = document.querySelector("[data-finder-form]");
const areaOutput = document.querySelector("[data-area-output]");
const resultImage = document.querySelector("[data-result-image]");
const resultTitle = document.querySelector("[data-result-title]");
const resultCopy = document.querySelector("[data-result-copy]");
const resultCount = document.querySelector("[data-result-count]");
const resultPayback = document.querySelector("[data-result-payback]");
const resultNote = document.querySelector("[data-result-note]");
const demoForm = document.querySelector("[data-demo-form]");
const formStatus = document.querySelector("[data-form-status]");

const robotProfiles = {
  cc1pro: { image: "assets/products/pudu-cc1-pro.webp" },
  cc1: { image: "assets/products/pudu-cc1.png" },
  mt1: { image: "assets/products/pudu-mt1.webp" },
  mt1max: { image: "assets/products/pudu-mt1-max.png" },
  mt1vac: { image: "assets/products/pudu-mt1-vac.png" },
  bg1: { image: "assets/products/pudu-bg1-series.png" },
  sh1: { image: "assets/products/pudu-sh1.png" },
  omnie: { image: "assets/products/omnie-front-original.webp" },
  phantas: { image: "assets/products/phantas-front-original.webp" },
  beetle: { image: "assets/products/beetle-front-original.webp" },
  scrubber75: { image: "assets/products/scrubber-75-front-original.webp" },
  cleanibot: { image: "assets/products/cleanibot-c5-product-original.webp" },
};

function t(path, fallback = "") {
  return path.split(".").reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), activeLocale) ?? fallback;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function applyTextTranslations() {
  document.documentElement.lang = currentLanguage;
  document.title = t("meta.title", document.title);

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute("content", t("meta.description", description.getAttribute("content") || ""));
  }

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = t(element.dataset.i18n, element.textContent);
    element.textContent = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder, element.getAttribute("placeholder") || ""));
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel, element.getAttribute("aria-label") || ""));
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

function renderProducts() {
  const grid = document.querySelector("[data-products-grid]");
  if (!grid) return;

  grid.innerHTML = activeLocale.products.items
    .map(
      (product) => `
        <article class="product-card">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}" />
          <div>
            <p>${escapeHtml(product.brand)}</p>
            <h3>${escapeHtml(product.name)}</h3>
            <span>${escapeHtml(product.fit)}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderIndustries() {
  const grid = document.querySelector("[data-industries-grid]");
  if (!grid) return;

  grid.innerHTML = activeLocale.industries.items
    .map(
      (industry) => `
        <article>
          <img src="${escapeHtml(industry.image)}" alt="${escapeHtml(industry.alt)}" />
          <h3>${escapeHtml(industry.title)}</h3>
          <p>${escapeHtml(industry.copy)}</p>
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

  list.innerHTML = activeLocale.demo.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("");
}

function setLanguage(language) {
  if (!locales[language]) return;
  currentLanguage = language;
  activeLocale = locales[language];
  localStorage.setItem("ar-language", language);
  applyLocale();
}

function updateLanguageButtons() {
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    const isActive = button.dataset.langButton === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function applyLocale() {
  applyTextTranslations();
  renderBrands();
  renderProducts();
  renderIndustries();
  renderProcessSteps();
  renderDemoPoints();
  updateLanguageButtons();
  updateRecommendation();
}

function formatArea(value) {
  const locale = currentLanguage === "hr" ? "hr-HR" : "en-US";
  return `${Number(value).toLocaleString(locale)} m²`;
}

function readFinderValues() {
  const data = new FormData(finderForm);
  return {
    area: Number(data.get("area")),
    facility: data.get("facility"),
    task: data.get("task"),
    frequency: data.get("frequency"),
    obstacles: data.get("obstacles"),
  };
}

function chooseRobot(values) {
  const industrial = ["logistics", "manufacturing", "parking"].includes(values.facility);
  const publicLarge = ["shopping", "transport"].includes(values.facility);
  const compactCommercial = ["retail", "office", "hospitality"].includes(values.facility);
  const commercial = compactCommercial || publicLarge;
  const highObstacles = values.obstacles === "high";
  const lowUse = values.frequency === "weekly" || values.frequency === "seasonal";
  const small = values.area < 1800;
  const medium = values.area >= 1800 && values.area < 6000;
  const large = values.area >= 6000 && values.area < 12000;
  const veryLarge = values.area >= 12000;
  const extreme = values.area >= 16000;

  // When two models solve the same case, keep the PUDU model as the default recommendation.
  switch (values.task) {
    case "spill":
      return "sh1";
    case "vacuum":
      if (industrial && (veryLarge || highObstacles)) return "mt1max";
      return "mt1vac";
    case "drySweep":
      if (values.facility === "parking" && (large || veryLarge || highObstacles)) return "beetle";
      if (industrial && extreme) return "beetle";
      if (industrial || publicLarge) return large || veryLarge || highObstacles ? "mt1max" : "mt1";
      return small && lowUse ? "sh1" : "mt1vac";
    case "heavyScrub":
      if ((values.facility === "parking" || values.facility === "manufacturing") && extreme) return "scrubber75";
      return "bg1";
    case "edge":
      if (values.facility === "office") return "cleanibot";
      if (commercial && small && highObstacles) return "phantas";
      return small || highObstacles ? "cc1" : "cc1pro";
    case "full":
      if (publicLarge && veryLarge && !highObstacles) return "omnie";
      if ((industrial || publicLarge) && veryLarge) return "bg1";
      if (compactCommercial && (small || highObstacles)) return "cc1";
      return "cc1pro";
    default:
      break;
  }

  if (small && ["retail", "hospitality"].includes(values.facility) && lowUse) return "sh1";
  if (values.facility === "parking") return large || veryLarge ? "bg1" : "beetle";
  if (publicLarge && veryLarge && !highObstacles) return "omnie";
  if (industrial) return large || veryLarge ? "bg1" : "cc1pro";
  if (publicLarge) return veryLarge ? "bg1" : "cc1pro";
  if (values.facility === "office") return small && highObstacles ? "cleanibot" : small || highObstacles ? "cc1" : "cc1pro";
  if (values.facility === "retail") return small || highObstacles || lowUse ? "cc1" : "cc1pro";
  if (values.facility === "hospitality") {
    if (small || lowUse) return "sh1";
    return highObstacles || medium ? "cc1" : "cc1pro";
  }

  if (compactCommercial) return small ? "cc1" : "cc1pro";
  return "cc1pro";
}

function estimateRobotCount(values) {
  const taskCoverage = {
    drySweep: 5600,
    vacuum: 5000,
    heavyScrub: 3600,
    edge: 3200,
    spill: 2200,
    full: 4200,
    auto: 4200,
  };
  const baseCoverage = taskCoverage[values.task] || taskCoverage.auto;
  const obstacleFactor = values.obstacles === "high" ? 0.72 : values.obstacles === "medium" ? 0.88 : 1;
  const frequencyFactor = values.frequency === "daily" ? 1 : values.frequency === "often" ? 0.76 : 0.55;
  const adjustedCoverage = baseCoverage * obstacleFactor * frequencyFactor;
  const count = Math.max(1, Math.ceil(values.area / adjustedCoverage));
  return count > 3 ? "3+" : String(count);
}

function estimatePayback(values) {
  const frequencyScore = {
    daily: 8,
    often: 5,
    weekly: 2,
    seasonal: 1,
  }[values.frequency];
  const taskScore = {
    heavyScrub: 5,
    full: 4,
    drySweep: 4,
    vacuum: 3,
    edge: 2,
    spill: 1,
    auto: 3,
  }[values.task] || 3;
  const score = values.area / 1000 + frequencyScore + taskScore;
  const monthShort = t("finder.payback.monthShort", "mo.");

  if (score >= 22) return `8-14 ${monthShort}`;
  if (score >= 14) return `12-20 ${monthShort}`;
  if (score >= 8) return `18-30 ${monthShort}`;
  return t("finder.payback.audit", "estimate after audit");
}

function updateRecommendation() {
  if (!finderForm) return;
  const values = readFinderValues();
  const robotId = chooseRobot(values);
  const robot = {
    ...robotProfiles[robotId],
    ...(activeLocale.robots[robotId] || {}),
  };

  if (areaOutput) areaOutput.textContent = formatArea(values.area);
  if (resultImage && robot.image) {
    resultImage.src = robot.image;
    resultImage.alt = robot.name || "";
  }
  if (resultTitle) resultTitle.textContent = robot.name || "";
  if (resultCopy) resultCopy.textContent = robot.copy || "";
  if (resultCount) resultCount.textContent = estimateRobotCount(values);
  if (resultPayback) resultPayback.textContent = estimatePayback(values);
  if (resultNote) resultNote.textContent = robot.note || "";
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll("[data-lang-button]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.langButton));
});

if (finderForm) {
  finderForm.addEventListener("input", updateRecommendation);
  finderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    updateRecommendation();
  });
}

if (demoForm && formStatus) {
  demoForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const company = new FormData(demoForm).get("company") || t("forms.companyFallback", "your facility");
    formStatus.textContent = t("forms.status", "Thank you.").replace("{company}", company);
  });
}

applyLocale();
