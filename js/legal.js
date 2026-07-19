const locales = window.AR_LOCALES || {};
const site = window.AR_SITE || {};
const defaultLanguage = "hr";
const languageFromQuery = new URLSearchParams(window.location.search).get("lang");
const languageFromStorage = localStorage.getItem("ar-language");
const pageType = document.body.dataset.legalPage;
let currentLanguage = locales[languageFromQuery]
  ? languageFromQuery
  : locales[languageFromStorage]
    ? languageFromStorage
    : defaultLanguage;
let activeLocale = locales[currentLanguage] || locales[defaultLanguage];

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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function interpolate(template, values = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) =>
    values[key] !== undefined ? String(values[key]) : `{${key}}`,
  );
}

function applyStaticTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n, element.textContent);
  });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute(
      "aria-label",
      t(element.dataset.i18nAriaLabel, element.getAttribute("aria-label") || ""),
    );
  });
}

function renderLegalPage() {
  const page = activeLocale.legal[pageType];
  if (!page) return;
  document.documentElement.lang = currentLanguage;
  document.title = page.metaTitle;
  document.querySelector("[data-legal-title]").textContent = page.title;
  document.querySelector("[data-legal-intro]").textContent = page.intro;
  document.querySelector("[data-legal-updated]").textContent = activeLocale.legal.common.updated;
  document.querySelector("[data-legal-review]").textContent =
    activeLocale.legal.common.reviewNote;
  document.querySelector("[data-legal-back]").textContent =
    activeLocale.legal.common.backHome;
  document.querySelector("[data-legal-sections]").innerHTML = page.sections
    .map(
      (section) => `
        <section class="legal-section">
          <h2>${escapeHtml(section.title)}</h2>
          ${section.paragraphs
            .map(
              (paragraph) =>
                `<p>${escapeHtml(interpolate(paragraph, { email: site.email || "" }))}</p>`,
            )
            .join("")}
        </section>
      `,
    )
    .join("");

  document.querySelectorAll("[data-home-link]").forEach((link) => {
    link.setAttribute("href", `index.html?lang=${currentLanguage}`);
  });
  document.querySelectorAll("[data-lang-button]").forEach((button) => {
    const isActive = button.dataset.langButton === currentLanguage;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  applyStaticTranslations();
}

function setLanguage(language) {
  if (!locales[language]) return;
  currentLanguage = language;
  activeLocale = locales[language];
  localStorage.setItem("ar-language", language);
  const url = new URL(window.location.href);
  url.searchParams.set("lang", language);
  window.history.replaceState({}, "", url);
  renderLegalPage();
}

document.querySelectorAll("[data-lang-button]").forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.langButton));
});

renderLegalPage();
