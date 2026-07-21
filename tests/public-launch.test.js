const test = require("node:test");
const assert = require("node:assert/strict");

global.window = global;
require("../config/site.js");

test("public launch configuration hides temporary commercial and email UI", () => {
  assert.equal(global.AR_SITE.phoneDisplay, "+385 98 256 469");
  assert.equal(global.AR_SITE.phoneHref, "+38598256469");
  assert.equal(global.AR_SITE.email, "");
  assert.equal(global.AR_SITE.features.showPricing, false);
  assert.equal(global.AR_SITE.features.showContactForm, false);
  assert.equal(global.AR_SITE.features.showEmail, false);
});
