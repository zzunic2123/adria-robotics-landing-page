(function createDataService(global) {
  "use strict";

  const TASK_CATEGORIES = new Set(["washing", "sweeping", "vacuumDry", "large", "compact"]);
  const FINANCING_AMOUNT_FIELDS = [
    "net_price_eur",
    "lease_down_payment_eur",
    "lease_24_eur_month",
    "lease_36_eur_month",
    "lease_48_eur_month",
    "rent_standard_24_eur_month",
    "rent_standard_36_eur_month",
    "rent_standard_48_eur_month",
    "rent_full_24_eur_month",
    "rent_full_36_eur_month",
    "rent_full_48_eur_month",
  ];
  let memoryResult = null;
  let activeRequest = null;

  function getConfig() {
    if (global.AR_DATA_SOURCE) return global.AR_DATA_SOURCE;
    if (typeof require === "function") return require("../config/data-source.js");
    throw new Error("Public data-source configuration is unavailable.");
  }

  function warn(message, row) {
    if (typeof console !== "undefined" && typeof console.warn === "function") {
      console.warn(`[Adria Robotics data] ${message}`, row ?? "");
    }
  }

  function isPresent(value) {
    return value !== null && value !== undefined && String(value).trim() !== "";
  }

  function stringValue(value) {
    return isPresent(value) ? String(value).trim() : "";
  }

  function numberValue(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (!isPresent(value)) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  function booleanValue(value) {
    if (typeof value === "boolean") return value;
    if (value === 1 || value === "1") return true;
    if (value === 0 || value === "0") return false;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true" || normalized === "yes") return true;
      if (normalized === "false" || normalized === "no" || normalized === "") return false;
    }
    return null;
  }

  function localizedPair(row, baseName) {
    return {
      hr: stringValue(row[`${baseName}_hr`]),
      en: stringValue(row[`${baseName}_en`]),
    };
  }

  function isSafeRelativePath(value) {
    if (!isPresent(value)) return false;
    const path = String(value).trim();
    let decoded = path;
    try {
      for (let index = 0; index < 3; index += 1) {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      }
    } catch {
      return false;
    }
    if (
      decoded.startsWith("/") ||
      decoded.startsWith("\\") ||
      decoded.includes("\\") ||
      decoded.includes("\0") ||
      /^[a-z][a-z\d+.-]*:/i.test(decoded) ||
      decoded.startsWith("//")
    ) {
      return false;
    }
    return !decoded.split("/").some((segment) => segment === "..");
  }

  function validHttpsUrl(value) {
    if (!isPresent(value)) return "";
    try {
      const url = new URL(String(value));
      return url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  }

  function parseGvizResponse(text) {
    if (typeof text !== "string") throw new TypeError("Google response must be text.");
    const prefix = "google.visualization.Query.setResponse(";
    const start = text.indexOf(prefix);
    const end = text.lastIndexOf(");");
    if (start < 0 || end <= start + prefix.length) {
      throw new Error("Google Sheets returned an unexpected response.");
    }
    const payload = JSON.parse(text.slice(start + prefix.length, end));
    if (payload.status === "error") {
      const detail = payload.errors?.map((error) => error.detailed_message || error.message).join(" ");
      throw new Error(detail || "Google Sheets query failed.");
    }
    if (!payload.table || !Array.isArray(payload.table.cols) || !Array.isArray(payload.table.rows)) {
      throw new Error("Google Sheets response does not contain a table.");
    }
    return payload;
  }

  function tableToObjects(table) {
    const headers = table.cols.map((column, index) =>
      stringValue(column.label || column.id || `column_${index + 1}`),
    );
    const seenHeaders = new Set();
    headers.forEach((header) => {
      if (!header || seenHeaders.has(header)) throw new Error(`Invalid or duplicate column: ${header}`);
      seenHeaders.add(header);
    });
    return table.rows.map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row.c?.[index]?.v ?? null])),
    );
  }

  async function fetchSheet(sheetName, range, fetchImpl = global.fetch) {
    const config = getConfig();
    if (config.sheets[sheetName] !== range) {
      throw new Error(`Sheet or range is not permitted: ${sheetName} ${range}`);
    }
    if (typeof fetchImpl !== "function") throw new Error("Fetch is unavailable.");
    const url = new URL(`${config.endpoint}/${config.spreadsheetId}/gviz/tq`);
    url.search = new URLSearchParams({
      tqx: "out:json",
      sheet: sheetName,
      range,
      headers: "1",
    });
    const response = await fetchImpl(url.href, { method: "GET", credentials: "omit" });
    if (!response.ok) throw new Error(`Google Sheets request failed (${response.status}).`);
    return tableToObjects(parseGvizResponse(await response.text()).table);
  }

  function normalizeProducts(rows) {
    const ids = new Set();
    const products = [];
    rows.forEach((row) => {
      const id = stringValue(row.id);
      if (!id || ids.has(id)) {
        warn(id ? `Duplicate product id skipped: ${id}` : "Product without an id skipped.", row);
        return;
      }
      ids.add(id);
      const active = booleanValue(row.active);
      if (active !== true) return;
      const sortOrder = numberValue(row.sort_order);
      const priceNetEur = numberValue(row.price_net_eur);
      if (sortOrder === null || priceNetEur === null || priceNetEur < 0) {
        warn(`Product with invalid sort order or price skipped: ${id}`, row);
        return;
      }
      const requestedImagePath = stringValue(row.image_path);
      const imageReady = stringValue(row.image_status).toLowerCase() === "ready";
      const imagePath = imageReady && isSafeRelativePath(requestedImagePath) ? requestedImagePath : "";
      if (requestedImagePath && !isSafeRelativePath(requestedImagePath)) {
        warn(`Unsafe product image path ignored: ${id}`, row);
      }
      const rawSourceUrl = stringValue(row.source_url);
      const sourceUrl = validHttpsUrl(rawSourceUrl);
      if (rawSourceUrl && !sourceUrl) warn(`Invalid product source URL ignored: ${id}`, row);
      const taskCategories = stringValue(row.task_categories)
        .split(",")
        .map((item) => item.trim())
        .filter((item) => TASK_CATEGORIES.has(item));
      products.push({
        id,
        active: true,
        sortOrder,
        manufacturer: stringValue(row.manufacturer),
        model: stringValue(row.model),
        fullName: stringValue(row.full_name),
        segment: localizedPair(row, "segment"),
        cleaningType: localizedPair(row, "cleaning_type"),
        shortDescription: localizedPair(row, "short_description"),
        keyFeatures: localizedPair(row, "key_features"),
        environments: localizedPair(row, "environments"),
        taskCategories,
        weight: stringValue(row.weight),
        capacity: stringValue(row.capacity),
        autonomy: localizedPair(row, "autonomy"),
        priceNetEur,
        priceNote: localizedPair(row, "price_note"),
        imagePath,
        imageAlt: localizedPair(row, "image_alt"),
        imageStatus: imagePath ? "ready" : "missing",
        sourceUrl,
        featured: booleanValue(row.featured) === true,
        updatedAt: stringValue(row.updated_at),
      });
    });
    return products.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function normalizeFinancing(rows, productIds) {
    const seen = new Set();
    const financing = [];
    rows.forEach((row) => {
      const productId = stringValue(row.product_id);
      if (!productIds.has(productId) || seen.has(productId) || booleanValue(row.display_public) !== true) {
        warn(`Invalid, private or duplicate financing row skipped: ${productId || "unknown"}`, row);
        return;
      }
      const amounts = Object.fromEntries(
        FINANCING_AMOUNT_FIELDS.map((field) => [field, numberValue(row[field])]),
      );
      if (Object.values(amounts).some((value) => value === null || value < 0)) {
        warn(`Financing row with an invalid amount skipped: ${productId}`, row);
        return;
      }
      seen.add(productId);
      financing.push({
        productId,
        fullName: stringValue(row.full_name),
        netPriceEur: amounts.net_price_eur,
        priceNote: localizedPair(row, "price_note"),
        leaseDownPaymentEur: amounts.lease_down_payment_eur,
        lease: {
          24: amounts.lease_24_eur_month,
          36: amounts.lease_36_eur_month,
          48: amounts.lease_48_eur_month,
        },
        rentStandard: {
          24: amounts.rent_standard_24_eur_month,
          36: amounts.rent_standard_36_eur_month,
          48: amounts.rent_standard_48_eur_month,
        },
        rentFull: {
          24: amounts.rent_full_24_eur_month,
          36: amounts.rent_full_36_eur_month,
          48: amounts.rent_full_48_eur_month,
        },
        validFrom: stringValue(row.valid_from),
        disclaimer: localizedPair(row, "disclaimer"),
      });
    });
    return financing;
  }

  function normalizeSpecs(rows, productIds) {
    return rows
      .map((row) => {
        const productId = stringValue(row.product_id);
        const sortOrder = numberValue(row.sort_order);
        if (!productIds.has(productId) || sortOrder === null) {
          warn(`Invalid product specification skipped: ${productId || "unknown"}`, row);
          return null;
        }
        return {
          productId,
          groupId: stringValue(row.group_id) || "other",
          labelKey: stringValue(row.label_key),
          label: localizedPair(row, "label"),
          value: localizedPair(row, "value"),
          sortOrder,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function normalizeIndustries(rows) {
    const ids = new Set();
    return rows
      .map((row) => {
        const id = stringValue(row.id);
        const sortOrder = numberValue(row.sort_order);
        if (!id || ids.has(id) || booleanValue(row.active) !== true || sortOrder === null) {
          if (booleanValue(row.active) === true) warn(`Invalid industry skipped: ${id || "unknown"}`, row);
          return null;
        }
        ids.add(id);
        const imagePath = stringValue(row.image_path);
        if (!isSafeRelativePath(imagePath)) {
          warn(`Industry with unsafe image path skipped: ${id}`, row);
          return null;
        }
        return {
          id,
          sortOrder,
          title: localizedPair(row, "title"),
          description: localizedPair(row, "description"),
          imagePath,
          imageAlt: localizedPair(row, "image_alt"),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function normalizeProductIndustries(rows, productIds, industryIds, activeIndustryIds) {
    return rows
      .map((row) => {
        const productId = stringValue(row.product_id);
        const industryId = stringValue(row.industry_id);
        const priority = numberValue(row.priority);
        if (!productIds.has(productId) || !industryIds.has(industryId) || priority === null) {
          warn(`Invalid product-industry reference skipped: ${productId}/${industryId}`, row);
          return null;
        }
        if (!activeIndustryIds.has(industryId)) return null;
        return {
          productId,
          industryId,
          priority,
          recommended: booleanValue(row.recommended) === true,
        };
      })
      .filter(Boolean);
  }

  function normalizeRoiConfig(rows) {
    const seen = new Set();
    return rows
      .map((row) => {
        const key = stringValue(row.key);
        const sortOrder = numberValue(row.sort_order);
        const numericValue = numberValue(row.numeric_value);
        if (!key || seen.has(key) || sortOrder === null) {
          warn(`Invalid ROI configuration row skipped: ${key || "unknown"}`, row);
          return null;
        }
        seen.add(key);
        return {
          section: stringValue(row.section),
          key,
          numericValue,
          textValue: stringValue(row.text_value),
          unit: stringValue(row.unit),
          editableByVisitor: booleanValue(row.editable_by_visitor) === true,
          label: localizedPair(row, "label"),
          sortOrder,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function normalizeServicePlans(rows) {
    return rows
      .map((row) => {
        const serviceKey = stringValue(row.service_key);
        const sortOrder = numberValue(row.sort_order);
        const standardIncluded = booleanValue(row.standard_included);
        const fullServiceIncluded = booleanValue(row.full_service_included);
        if (!serviceKey || sortOrder === null || standardIncluded === null || fullServiceIncluded === null) {
          warn(`Invalid service-plan row skipped: ${serviceKey || "unknown"}`, row);
          return null;
        }
        return {
          serviceKey,
          sortOrder,
          label: localizedPair(row, "label"),
          standardIncluded,
          fullServiceIncluded,
          note: localizedPair(row, "note"),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  function normalizeWebData(rawSheets) {
    const required = Object.keys(getConfig().sheets);
    required.forEach((sheet) => {
      if (!Array.isArray(rawSheets?.[sheet])) throw new Error(`Missing sheet data: ${sheet}`);
    });
    let products = normalizeProducts(rawSheets.Products);
    const initialProductIds = new Set(products.map((product) => product.id));
    const financing = normalizeFinancing(rawSheets.Financing, initialProductIds);
    const financedIds = new Set(financing.map((row) => row.productId));
    products = products.filter((product) => {
      if (financedIds.has(product.id)) return true;
      warn(`Active product without public financing skipped: ${product.id}`);
      return false;
    });
    const productIds = new Set(products.map((product) => product.id));
    const industries = normalizeIndustries(rawSheets.Industries);
    const activeIndustryIds = new Set(industries.map((industry) => industry.id));
    const industryIds = new Set(
      rawSheets.Industries.map((industry) => stringValue(industry.id)).filter(Boolean),
    );
    return {
      products,
      specifications: normalizeSpecs(rawSheets.Product_Specs, productIds),
      financing: financing.filter((row) => productIds.has(row.productId)),
      roiConfig: normalizeRoiConfig(rawSheets.ROI_Config),
      industries,
      productIndustries: normalizeProductIndustries(
        rawSheets.Product_Industries,
        productIds,
        industryIds,
        activeIndustryIds,
      ),
      servicePlans: normalizeServicePlans(rawSheets.Service_Plans),
    };
  }

  function readCache(storage, config) {
    try {
      const cached = JSON.parse(storage?.getItem(config.cacheKey) || "null");
      if (
        cached?.version !== config.cacheVersion ||
        !Number.isFinite(cached.cachedAt) ||
        !cached.rawSheets
      ) {
        return null;
      }
      return cached;
    } catch (error) {
      warn("Invalid local cache ignored.", error);
      return null;
    }
  }

  function writeCache(storage, config, rawSheets) {
    try {
      storage?.setItem(
        config.cacheKey,
        JSON.stringify({ version: config.cacheVersion, cachedAt: Date.now(), rawSheets }),
      );
    } catch (error) {
      warn("Public data could not be cached locally.", error);
    }
  }

  function normalizeCachedResult(cached, source, isStale) {
    return {
      data: normalizeWebData(cached.rawSheets),
      meta: { source, isStale, cachedAt: cached.cachedAt },
    };
  }

  async function requestAllSheets(config, fetchImpl) {
    const entries = await Promise.all(
      Object.entries(config.sheets).map(async ([sheetName, range]) => [
        sheetName,
        await fetchSheet(sheetName, range, fetchImpl),
      ]),
    );
    return Object.fromEntries(entries);
  }

  async function loadWebData(options = {}) {
    const config = getConfig();
    const storage = options.storage === undefined ? global.localStorage : options.storage;
    const forceRefresh = options.forceRefresh === true;
    if (memoryResult && !forceRefresh) return memoryResult;
    if (activeRequest && !forceRefresh) return activeRequest;
    activeRequest = (async () => {
      const cached = readCache(storage, config);
      const isFresh = cached && Date.now() - cached.cachedAt <= config.cacheTtlMs;
      if (isFresh && !forceRefresh) {
        try {
          memoryResult = normalizeCachedResult(cached, "cache", false);
          return memoryResult;
        } catch (cacheError) {
          warn("Fresh local cache failed validation and was ignored.", cacheError);
        }
      }
      try {
        const rawSheets = await requestAllSheets(config, options.fetchImpl || global.fetch);
        const data = normalizeWebData(rawSheets);
        writeCache(storage, config, rawSheets);
        memoryResult = { data, meta: { source: "network", isStale: false, cachedAt: Date.now() } };
        return memoryResult;
      } catch (networkError) {
        warn("Live public data is unavailable; attempting a safe fallback.", networkError);
        if (cached) {
          try {
            memoryResult = normalizeCachedResult(cached, "stale-cache", true);
            return memoryResult;
          } catch (cacheError) {
            warn("Stale local cache failed validation and was ignored.", cacheError);
          }
        }
        const fallback = global.AR_FALLBACK_DATA;
        if (fallback?.spreadsheetId === config.spreadsheetId && fallback.sheets) {
          memoryResult = {
            data: normalizeWebData(fallback.sheets),
            meta: { source: "fallback", isStale: true, cachedAt: 0, generatedAt: fallback.generatedAt },
          };
          return memoryResult;
        }
        const error = new Error("No live, cached or fallback public data is available.");
        error.cause = networkError;
        throw error;
      }
    })();
    try {
      return await activeRequest;
    } finally {
      activeRequest = null;
    }
  }

  function clearMemoryCache() {
    memoryResult = null;
    activeRequest = null;
  }

  const api = {
    TASK_CATEGORIES,
    parseGvizResponse,
    tableToObjects,
    isSafeRelativePath,
    validHttpsUrl,
    fetchSheet,
    normalizeWebData,
    loadWebData,
    clearMemoryCache,
  };

  global.AR_DATA_SERVICE = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
