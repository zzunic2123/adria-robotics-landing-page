const test = require("node:test");
const assert = require("node:assert/strict");

global.window = global;
require("../config/site.js");

test("public launch configuration exposes current contacts and hides temporary commercial UI", () => {
  assert.deepEqual(global.AR_SITE.salesPhones, [
    { display: "+385 98 256 469", href: "+38598256469" },
    { display: "+385 99 389 9783", href: "+385993899783" },
  ]);
  assert.deepEqual(global.AR_SITE.supportPhone, {
    display: "+385 91 767 8433",
    href: "+385917678433",
  });
  assert.equal(global.AR_SITE.email, "info@adriarobotics.hr");
  assert.equal(global.AR_SITE.features.showPricing, false);
  assert.equal(global.AR_SITE.features.showContactForm, false);
  assert.equal(global.AR_SITE.features.showEmail, true);
});
