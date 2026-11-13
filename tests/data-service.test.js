const test = require("node:test");
const assert = require("node:assert/strict");

require("../config/data-source.js");
require("../config/fallback-data.js");
const {
  parseGvizResponse,
  tableToObjects,
  isSafeRelativePath,
  normalizeWebData,
  loadWebData,
  clearMemoryCache,
} = require("../js/data-service.js");

test("parses the Google Visualization wrapper without evaluating code", () => {
  const response = `/*O_o*/\ngoogle.visualization.Query.setResponse(${JSON.stringify({
    version: "0.6",
    status: "ok",
    table: {
      cols: [
        { id: "A", label: "id", type: "string" },
        { id: "B", label: "price", type: "number" },
        { id: "C", label: "active", type: "boolean" },
      ],
      rows: [{ c: [{ v: "robot" }, { v: 13900, f: "13.900,00 €" }, { v: true }] }],
    },
  })});`;
  const rows = tableToObjects(parseGvizResponse(response).table);
  assert.deepEqual(rows, [{ id: "robot", price: 13900, active: true }]);
});

test("rejects unsafe relative image paths", () => {
  assert.equal(isSafeRelativePath("assets/products/robot.png"), true);
  assert.equal(isSafeRelativePath("../private/robot.png"), false);
  assert.equal(isSafeRelativePath("assets/%2e%2e/private.png"), false);
  assert.equal(isSafeRelativePath("assets/%252e%252e/private.png"), false);
  assert.equal(isSafeRelativePath("javascript:alert(1)"), false);
  assert.equal(isSafeRelativePath("javascript%3Aalert(1)"), false);
  assert.equal(isSafeRelativePath("https://example.com/robot.png"), false);
});

test("normalizes the generated public fallback to the official catalogue", () => {
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...values) => warnings.push(values);
  let data;
  try {
    data = normalizeWebData(global.AR_FALLBACK_DATA.sheets);
  } finally {
    console.warn = originalWarn;
  }
  assert.equal(warnings.length, 0);
  assert.equal(data.products.length, 11);
  assert.equal(data.financing.length, 11);
  assert.equal(data.industries.length, 6);
  assert.equal(data.productIndustries.length, 23);
  assert.equal(data.servicePlans.length, 9);
  assert.equal(data.specifications.length, 77);
  assert.deepEqual(
    data.products.map((product) => product.fullName),
    [
      "MOVA M3 Pro",
      "OrionStar CleaniBot K1",
      "OrionStar CleaniBot S55 Pro",
      "OrionStar CleaniBot M1",
      "PUDU MT1 Max",
      "PUDU BG1 / BG1 Pro",
      "Gausium PHANTAS+WS",
      "Gausium BEETLE+CD",
      "Gausium MIRA+WS",
      "Gausium OMNIE+WS",
      "Gausium MARVEL+WS",
    ],
  );
  assert.equal(data.products.filter((product) => product.imageStatus === "ready").length, 11);
  assert.equal(data.products.filter((product) => product.imageStatus === "missing").length, 0);
  assert.equal(data.products.some((product) => product.id === "pudu-cc1"), false);
});

test("skips one invalid product row without losing valid public data", () => {
  const sheets = structuredClone(global.AR_FALLBACK_DATA.sheets);
  sheets.Products.push({
    ...sheets.Products[0],
    id: "unsafe-product",
    sort_order: "not-a-number",
    image_path: "../secret.png",
  });
  const warnings = [];
  const originalWarn = console.warn;
  console.warn = (...values) => warnings.push(values);
  let data;
  try {
    data = normalizeWebData(sheets);
  } finally {
    console.warn = originalWarn;
  }
  assert.equal(data.products.length, 11);
  assert.equal(data.products.some((product) => product.id === "unsafe-product"), false);
  assert.ok(warnings.length >= 1);
});

test("uses the last valid stale cache when all public requests fail", async () => {
  const cache = JSON.stringify({
    version: global.AR_DATA_SOURCE.cacheVersion,
    cachedAt: 1,
    rawSheets: global.AR_FALLBACK_DATA.sheets,
  });
  const storage = {
    getItem: (key) => (key === global.AR_DATA_SOURCE.cacheKey ? cache : null),
    setItem: () => {},
  };
  const originalWarn = console.warn;
  console.warn = () => {};
  clearMemoryCache();
  try {
    const result = await loadWebData({
      storage,
      fetchImpl: async () => {
        throw new Error("offline");
      },
    });
    assert.equal(result.meta.source, "stale-cache");
    assert.equal(result.meta.isStale, true);
    assert.equal(result.data.products.length, 11);
  } finally {
    clearMemoryCache();
    console.warn = originalWarn;
  }
});
