const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

global.window = global;
require("../config/site.js");

test("public configuration exposes contacts, form endpoint and hides product pricing", () => {
  assert.deepEqual(global.AR_SITE.salesPhones, [
    { display: "+385 98 256 469", href: "+38598256469" },
    { display: "+385 99 389 9783", href: "+385993899783" },
  ]);
  assert.deepEqual(global.AR_SITE.supportPhone, {
    display: "+385 91 767 8433",
    href: "+385917678433",
  });
  assert.equal(global.AR_SITE.email, "info@adriarobotics.hr");
  assert.match(
    global.AR_SITE.contactFormEndpoint,
    /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/,
  );
  assert.equal(global.AR_SITE.features.showPricing, false);
  assert.equal(global.AR_SITE.features.showContactForm, true);
  assert.equal(global.AR_SITE.features.showEmail, true);
});

test("contact form posts only the five requested fields through the Apps Script iframe", () => {
  const html = fs.readFileSync(path.join(__dirname, "..", "contact.html"), "utf8");

  ["firstName", "lastName", "email", "phone", "message"].forEach((name) => {
    assert.match(html, new RegExp(`name="${name}"`));
  });
  assert.doesNotMatch(html, /name="company"/);
  assert.doesNotMatch(html, /name="model"/);
  assert.match(html, /name="companyWebsite"/);
  assert.match(html, /target="contact-form-response"/);
  assert.match(html, /data-contact-form-response/);
});
