# Izvori podataka o robotima

Javni Google Sheet je jedini izvor istine za katalog, tehničke specifikacije, cijene,
financiranje, industrije, ROI postavke i servisne pakete:

- [Adria Robotics javna baza](https://docs.google.com/spreadsheets/d/1YFBlMR4SUUCsW98MqSjVjHAnBmVZoXhxQzt3qshLelo/edit)

Web dohvaća samo raspone navedene u `config/data-source.js`. Poveznica na službenu stranicu
proizvođača prikazuje se samo kada aktivni red proizvoda sadrži valjan HTTPS `source_url`.
Proizvođačke vrijednosti su informativne; stvarni rezultat ovisi o podu, rasporedu, prometu,
preprekama, načinu čišćenja i odabranoj konfiguraciji.

Generirani `config/fallback-data.js` služi samo za dostupnost statične stranice kada ni Google ni
preglednikov zadnji valjani cache nisu dostupni. Ne uređuje se ručno i nije drugi izvor istine.
