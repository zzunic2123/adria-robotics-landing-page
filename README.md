# Adria Robotics landing page

Statična, dvojezična HR/EN stranica za Adria Robotics. Nema backenda, frameworka ni build koraka;
objavljuje se izravno preko GitHub Pagesa.

## Stranice

Web je podijeljen na nekoliko statičnih HTML dokumenata koji dijele isti CSS, JavaScript, javne
Google Sheets podatke i 15-minutni cache:

| Datoteka | Sadržaj |
| --- | --- |
| `index.html` | Kratka naslovnica, industrije, proces, video i FAQ |
| `robots.html` | Katalog, filtri, specifikacije i financiranje po modelu |
| `roi.html` | ROI kalkulator i scenariji |
| `service-plans.html` | Načini financiranja i usporedba paketa usluga |
| `contact.html` | Kontakt i obrazac za demo |
| `privacy-policy.html` | Politika privatnosti |
| `cookie-policy.html` | Politika kolačića i lokalne pohrane |

Industrijska kartica s naslovnice otvara filtrirani katalog preko parametra `industry`, a CTA iz
modala robota otvara kontakt preko parametra `model`. Parametar `lang=hr|en` i spremljeni odabir
jezika vrijede na svim stranicama.

## Javni Google Sheets podaci

Jedini izvor istine je javni spreadsheet:

- <https://docs.google.com/spreadsheets/d/1YFBlMR4SUUCsW98MqSjVjHAnBmVZoXhxQzt3qshLelo/edit>
- Spreadsheet ID: `1YFBlMR4SUUCsW98MqSjVjHAnBmVZoXhxQzt3qshLelo`

Web čita samo ovih sedam raspona preko javnog Google Visualization endpointa, bez API ključa:

| List | Raspon |
| --- | --- |
| `Products` | `A3:AE` |
| `Product_Specs` | `A3:H` |
| `Financing` | `A3:S` |
| `ROI_Config` | `A3:I` |
| `Industries` | `A3:J` |
| `Product_Industries` | `A3:D` |
| `Service_Plans` | `A3:H` |

Redak 3 je zaglavlje. Podaci se nakon prvog valjanog učitavanja spremaju u `localStorage` na 15
minuta. Ako Google privremeno nije dostupan, koristi se zadnji valjani cache, a zatim generirani
javni fallback snapshot.

## Lokalno pokretanje i testovi

Potrebni su Node.js 20+ i Python 3 (samo za jednostavan lokalni HTTP server).

```bash
npm run serve
```

Otvorite <http://localhost:8080>. Nemojte provjeravati preko `file://`, jer tada mrežni dohvat nije
reprezentativan i preglednik može blokirati dohvat javnih Google Sheets podataka. Sve su stranice
obični statični HTML, ali ih lokalno ipak treba posluživati preko HTTP servera.

Čisti testovi koriste samo ugrađene Node module:

```bash
npm test
```

## Objavljivanje Sheetsa

1. U Google Sheetsu otvorite **Share / Dijeli**.
2. Postavite opći pristup na **Anyone with the link / Svatko s poveznicom (Viewer / Pregledavatelj)**.
3. Ne objavljujte niti povezujte internu tablicu `adriarobitics-database`.
4. U anonimnom prozoru provjerite da javni spreadsheet i GViz endpoint rade bez prijave.

U javnim listovima ne smiju biti nabavne cijene, marže, interne kamatne stope, ostatne vrijednosti,
interne formule, vjerodajnice ni osobni podaci. Frontend ne sadrži Google API ključ ni service
account.

## Promjena cijene ili financiranja

1. U `Products.price_net_eur` promijenite javnu neto prodajnu cijenu.
2. U odgovarajućem retku lista `Financing` uskladite `net_price_eur` te gotove javne iznose za
   leasing i oba najma za 24/36/48 mjeseci.
3. Ne dodajte internu formulu financiranja u JavaScript. Browser koristi samo gotove javne iznose.
4. Nakon izmjene osvježite fallback snapshot prema uputi ispod.

Posjetitelji sa svježim cacheom promjenu će automatski dobiti najkasnije nakon 15 minuta. Za lokalnu
provjeru može se obrisati ključ `ar-public-sheet-data-v1` iz `localStorage`.

## Dodavanje produktne slike

1. Dodajte optimiziranu datoteku u `assets/products/`.
2. U `Products.image_path` upišite relativnu putanju, primjerice
   `assets/products/gausium-mira.png`.
3. Postavite `Products.image_status` na `ready` i provjerite oba alt teksta.
4. Commitajte sliku zajedno s osvježenim fallback snapshotom.

Ne koristite vanjske hotlinkove ni sliku drugog modela. Ako datoteka ili putanja nedostaje, web
automatski prikazuje neutralni Adria Robotics placeholder bez broken-image ikone.

## Osvježavanje fallback snapshota

Sheet mora biti javno dostupan, zatim pokrenite:

```bash
npm run update:fallback
npm test
```

Skripta čita samo konfiguriranih sedam javnih raspona i mehanički regenerira
`config/fallback-data.js`. Datoteku ne uređujte ručno. Prije commita provjerite da snapshot sadrži
11 službenih aktivnih proizvoda i da `git diff` ne sadrži interne ili osobne podatke.

## GitHub Pages objava

Repo nema build izlaz. U postavkama repozitorija odaberite GitHub Pages objavu iz željene grane i
root direktorija. GitHub Pages će uz `index.html` automatski posluživati i `robots.html`, `roi.html`,
`service-plans.html` te `contact.html`; nije potrebno konfigurirati rute ili redirects. Nakon objave
provjerite sve glavne stranice, katalog, modal, ROI, industrijske filtre, servisne pakete, HR/EN
prebacivanje i pravne stranice u anonimnom prozoru.
