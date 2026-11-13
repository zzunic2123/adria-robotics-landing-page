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
    display: "+385 91 348 0620",
    href: "+385913480620",
  });
  assert.equal(global.AR_SITE.email, "info@adriarobotics.hr");
  assert.equal(global.AR_SITE.bankName, "OTP banka d.d.");
  assert.equal(global.AR_SITE.iban, "HR2924070001100795592");
  assert.match(
    global.AR_SITE.contactFormEndpoint,
    /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/,
  );
  assert.equal(global.AR_SITE.features.showPricing, false);
  assert.equal(global.AR_SITE.features.showContactForm, true);
  assert.equal(global.AR_SITE.features.showEmail, true);
});

test("all public pages expose the configured bank and IBAN in the company footer", () => {
  ["index.html", "robots.html", "roi.html", "service-plans.html", "contact.html", "privacy.html"].forEach(
    (fileName) => {
      const html = fs.readFileSync(path.join(__dirname, "..", fileName), "utf8");
      assert.match(html, /data-site-bank-name/);
      assert.match(html, /data-site-iban/);
    },
  );
});

test("public home copy and imagery reference only Gausium", () => {
  ["index.html", "config/i18n.hr.js", "config/i18n.en.js", "css/styles.css"].forEach(
    (fileName) => {
      const content = fs.readFileSync(path.join(__dirname, "..", fileName), "utf8");
      assert.doesNotMatch(content, /MOVA|OrionStar|PUDU/i);
    },
  );
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
