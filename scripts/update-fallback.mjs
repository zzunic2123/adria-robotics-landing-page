import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const config = require("../config/data-source.js");
const { parseGvizResponse, tableToObjects } = require("../js/data-service.js");
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(scriptDirectory, "../config/fallback-data.js");

async function fetchPublicSheet(sheetName, range) {
  const url = new URL(`${config.endpoint}/${config.spreadsheetId}/gviz/tq`);
  url.search = new URLSearchParams({ tqx: "out:json", sheet: sheetName, range, headers: "1" });
  const response = await fetch(url, { credentials: "omit" });
  if (!response.ok) throw new Error(`${sheetName} returned HTTP ${response.status}`);
  return tableToObjects(parseGvizResponse(await response.text()).table);
}

const entries = await Promise.all(
  Object.entries(config.sheets).map(async ([sheetName, range]) => [
    sheetName,
    await fetchPublicSheet(sheetName, range),
  ]),
);
const snapshot = {
  generatedAt: new Date().toISOString(),
  spreadsheetId: config.spreadsheetId,
  sheets: Object.fromEntries(entries),
};
const source = `/*\n * GENERATED PUBLIC FALLBACK SNAPSHOT.\n * Do not edit manually. Run: npm run update:fallback\n * Google Sheets remains the single source of truth.\n */\n(function registerFallbackSnapshot(global) {\n  \"use strict\";\n  global.AR_FALLBACK_DATA = ${JSON.stringify(snapshot, null, 2)};\n})(typeof window !== \"undefined\" ? window : globalThis);\n`;

await writeFile(outputPath, source, "utf8");
process.stdout.write(
  `Updated ${outputPath} with ${snapshot.sheets.Products.length} public products.\n`,
);
