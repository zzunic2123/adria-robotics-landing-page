(function configurePublicDataSource(global) {
  "use strict";

  const config = Object.freeze({
    spreadsheetId: "1YFBlMR4SUUCsW98MqSjVjHAnBmVZoXhxQzt3qshLelo",
    endpoint: "https://docs.google.com/spreadsheets/d",
    cacheKey: "ar-public-sheet-data-v1",
    cacheVersion: 5,
    cacheTtlMs: 15 * 60 * 1000,
    sheets: Object.freeze({
      Products: "A3:AE",
      Product_Specs: "A3:H",
      Financing: "A3:S",
      ROI_Config: "A3:I",
      Industries: "A3:J",
      Product_Industries: "A3:D",
      Service_Plans: "A3:H",
    }),
  });

  global.AR_DATA_SOURCE = config;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = config;
  }
})(typeof window !== "undefined" ? window : globalThis);
