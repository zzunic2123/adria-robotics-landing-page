window.AR_ROBOTS = [
  {
    id: "pudu-cc1-pro",
    manufacturer: "PUDU Robotics",
    model: "CC1 Pro",
    fullName: "PUDU CC1 Pro",
    image: "assets/products/pudu-cc1-pro.webp",
    imageAlt: {
      hr: "Autonomni robot za čišćenje PUDU CC1 Pro",
      en: "PUDU CC1 Pro autonomous cleaning robot",
    },
    shortDescription: {
      hr: "Autonomno čišćenje četiri u jedan s prepoznavanjem zaprljanja i provjerom rezultata.",
      en: "Four-in-one autonomous cleaning with soil detection and cleaning-result verification.",
    },
    primaryUse: {
      hr: "Veliki komercijalni prostori koji trebaju kontinuirano pranje i suho čišćenje.",
      en: "Large commercial spaces requiring continuous wet and dry floor care.",
    },
    spaces: {
      hr: "Trgovački centri, prometni terminali, hoteli, uredi i veći javni objekti.",
      en: "Shopping centres, transport hubs, hotels, offices and larger public facilities.",
    },
    cleaningModes: {
      hr: "Pometanje, usisavanje, suho brisanje prašine i pranje podova.",
      en: "Sweeping, vacuuming, dust mopping and floor scrubbing.",
    },
    industries: ["commercial", "transport", "hospitality", "office"],
    taskCategories: ["washing", "sweeping", "vacuumDry", "large"],
    highlights: [
      {
        label: "application",
        value: {
          hr: "veliki komercijalni prostori",
          en: "large commercial spaces",
        },
      },
      {
        label: "operation",
        value: {
          hr: "četiri načina čišćenja",
          en: "four cleaning modes",
        },
      },
      {
        label: "performance",
        value: {
          hr: "700–1.000 m²/h u potpunom čišćenju",
          en: "700–1,000 m²/h in full-coverage cleaning",
        },
      },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "700–1.000 m²/h; ciljano čišćenje 1.500–3.000 m²/h", en: "700–1,000 m²/h; spot cleaning 1,500–3,000 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "workingWidth", value: "500 mm" },
          { label: "tankCapacity", value: { hr: "15 L čiste + 15 L prljave vode; spremnik otpada 2,5 L ili vreća 6 L", en: "15 L clean + 15 L waste water; 2.5 L debris bin or 6 L dust bag" } },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: { hr: "pranje 5 h; pometanje i usisavanje 5 h; tepisi 4 h; tiho brisanje 9 h", en: "scrubbing 5 h; sweeping and vacuuming 5 h; carpet vacuuming 4 h; silent mopping 9 h" } },
          { label: "chargingTime", value: { hr: "oko 3 h", en: "about 3 h" } },
          { label: "batteryCapacity", value: "50 Ah" },
        ],
      },
      {
        group: "navigation",
        items: [
          { label: "navigation", value: { hr: "LiDAR i vizualno pozicioniranje; prepoznavanje statičnih i pokretnih prepreka", en: "LiDAR and visual positioning; static and moving obstacle detection" } },
          { label: "automation", value: { hr: "automatsko punjenje te automatsko punjenje i pražnjenje vode uz opcionalnu stanicu", en: "automatic charging and automatic water refill/drainage with an optional station" } },
          { label: "minimumClearance", value: "70 cm" },
        ],
      },
      {
        group: "dimensions",
        items: [
          { label: "dimensions", value: "629 × 552 × 695 mm" },
          { label: "weight", value: "75 kg" },
        ],
      },
    ],
    sourceUrl: "https://www.pudurobotics.com/en/products/cc1-pro",
    price: null,
  },
  {
    id: "pudu-cc1",
    manufacturer: "PUDU Robotics",
    model: "CC1",
    fullName: "PUDU CC1",
    image: "assets/products/pudu-cc1.png",
    imageAlt: {
      hr: "Autonomni robot za čišćenje PUDU CC1",
      en: "PUDU CC1 autonomous cleaning robot",
    },
    shortDescription: {
      hr: "Višenamjenski autonomni robot za tvrde podove i tepihe u objektima s različitim zonama.",
      en: "Multi-purpose autonomous robot for hard floors and carpets across mixed facility zones.",
    },
    primaryUse: {
      hr: "Svakodnevno strojno čišćenje objekata s više vrsta podova.",
      en: "Daily machine cleaning in facilities with multiple floor types.",
    },
    spaces: {
      hr: "Uredi, obrazovne ustanove, hoteli, maloprodaja, zdravstvo i javni prijevoz.",
      en: "Offices, education, hotels, retail, healthcare and public transport.",
    },
    cleaningModes: {
      hr: "Pometanje, usisavanje, brisanje i pranje podova.",
      en: "Sweeping, vacuuming, mopping and floor scrubbing.",
    },
    industries: ["commercial", "education", "hospitality", "office", "transport"],
    taskCategories: ["washing", "sweeping", "vacuumDry", "compact"],
    highlights: [
      { label: "application", value: { hr: "mješoviti komercijalni prostori", en: "mixed commercial spaces" } },
      { label: "operation", value: { hr: "četiri načina čišćenja", en: "four cleaning modes" } },
      { label: "performance", value: { hr: "700–1.000 m²/h", en: "700–1,000 m²/h" } },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "700–1.000 m²/h", en: "700–1,000 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "suction", value: { hr: "do 17.000 Pa", en: "up to 17,000 Pa" } },
          { label: "tankCapacity", value: { hr: "15 L čiste + 15 L prljave vode", en: "15 L clean + 15 L waste water" } },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: { hr: "pranje 5 h; kombinirano čišćenje 5 h; tepisi 4 h; tiho brisanje 9 h", en: "scrubbing 5 h; combined cleaning 5 h; carpet vacuuming 4 h; silent mopping 9 h" } },
          { label: "chargingTime", value: { hr: "manje od 3 h", en: "under 3 h" } },
        ],
      },
      {
        group: "navigation",
        items: [
          { label: "navigation", value: { hr: "vizualni i laserski SLAM za pozicioniranje i planiranje ruta", en: "visual and laser SLAM for positioning and route planning" } },
          { label: "automation", value: { hr: "nastavak zadatka nakon punjenja; opcionalno automatsko punjenje i upravljanje vodom", en: "resumes tasks after charging; optional automatic charging and water management" } },
        ],
      },
    ],
    sourceUrl: "https://www.pudurobotics.com/en/products/puduCC1",
    price: null,
  },
  {
    id: "pudu-mt1",
    manufacturer: "PUDU Robotics",
    model: "MT1",
    fullName: "PUDU MT1",
    image: "assets/products/pudu-mt1.webp",
    imageAlt: {
      hr: "Autonomni robot za pometanje PUDU MT1",
      en: "PUDU MT1 autonomous sweeping robot",
    },
    shortDescription: {
      hr: "Autonomni robot za pometanje prašine, sitnog i krupnijeg otpada na velikim površinama.",
      en: "Autonomous sweeper for dust, fine debris and larger waste across large floor areas.",
    },
    primaryUse: {
      hr: "Suho čišćenje velikih unutarnjih prostora s rasutim otpadom i prašinom.",
      en: "Dry cleaning of large indoor spaces with scattered debris and dust.",
    },
    spaces: {
      hr: "Skladišta, proizvodnja, logistika, prometni terminali i veliki javni prostori.",
      en: "Warehouses, manufacturing, logistics, transport hubs and large public venues.",
    },
    cleaningModes: {
      hr: "Autonomno pometanje i ciljano prikupljanje prepoznatog otpada.",
      en: "Autonomous sweeping and targeted collection of detected waste.",
    },
    industries: ["logistics", "manufacturing", "transport"],
    taskCategories: ["sweeping", "large"],
    highlights: [
      { label: "application", value: { hr: "skladišta i velike zone", en: "warehouses and large zones" } },
      { label: "operation", value: { hr: "autonomno pometanje", en: "autonomous sweeping" } },
      { label: "performance", value: { hr: "do 1.800 m²/h", en: "up to 1,800 m²/h" } },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "do 1.800 m²/h; ciljano čišćenje do 6.000 m²/h", en: "up to 1,800 m²/h; spot cleaning up to 6,000 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "workingWidth", value: "700 mm" },
          { label: "binCapacity", value: "35 L" },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: "4–8 h" },
          { label: "chargingTime", value: { hr: "manje od 3 h", en: "under 3 h" } },
        ],
      },
      {
        group: "navigation",
        items: [
          { label: "navigation", value: { hr: "VSLAM, oznake i LiDAR SLAM; 3D percepcija i višesenzorsko izbjegavanje prepreka", en: "VSLAM, markers and LiDAR SLAM; 3D perception and multi-sensor obstacle avoidance" } },
          { label: "minimumClearance", value: "750 mm" },
        ],
      },
      {
        group: "dimensions",
        items: [
          { label: "dimensions", value: "840 × 600 × 490 mm" },
          { label: "weight", value: "65 kg" },
        ],
      },
    ],
    sourceUrl: "https://www.pudurobotics.com/en/products/mt1",
    price: null,
  },
  {
    id: "pudu-mt1-max",
    manufacturer: "PUDU Robotics",
    model: "MT1 Max",
    fullName: "PUDU MT1 Max",
    image: "assets/products/pudu-mt1-max.png",
    imageAlt: {
      hr: "Autonomni robot za pometanje PUDU MT1 Max",
      en: "PUDU MT1 Max autonomous sweeping robot",
    },
    shortDescription: {
      hr: "Robusni autonomni robot za suho čišćenje zahtjevnih unutarnjih i poluotvorenih prostora.",
      en: "Robust autonomous dry-cleaning robot for demanding indoor and semi-outdoor environments.",
    },
    primaryUse: {
      hr: "Pometanje velikih, dinamičnih prostora s vozilima, ljudima i različitim vrstama otpada.",
      en: "Sweeping large, dynamic spaces with vehicles, people and varied debris.",
    },
    spaces: {
      hr: "Logistički centri, proizvodnja, garaže i poluotvorene industrijske zone.",
      en: "Logistics centres, manufacturing, car parks and semi-outdoor industrial zones.",
    },
    cleaningModes: {
      hr: "Autonomno pometanje uz prilagodbu snage vrsti i količini otpada.",
      en: "Autonomous sweeping with cleaning power adapted to debris type and volume.",
    },
    industries: ["logistics", "manufacturing", "parking"],
    taskCategories: ["sweeping", "large"],
    highlights: [
      { label: "application", value: { hr: "zahtjevne velike zone", en: "demanding large zones" } },
      { label: "operation", value: { hr: "pometanje s 3D percepcijom", en: "sweeping with 3D perception" } },
      { label: "performance", value: { hr: "do 2.200 m²/h", en: "up to 2,200 m²/h" } },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "do 2.200 m²/h; ciljano čišćenje do 7.000 m²/h", en: "up to 2,200 m²/h; spot cleaning up to 7,000 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "workingWidth", value: "700 mm" },
          { label: "binCapacity", value: "35 L" },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: { hr: "5–10 h; standardni način 8 h", en: "5–10 h; standard mode 8 h" } },
          { label: "chargingTime", value: { hr: "manje od 3,5 h", en: "under 3.5 h" } },
          { label: "batteryCapacity", value: "60 Ah" },
        ],
      },
      {
        group: "navigation",
        items: [
          { label: "navigation", value: { hr: "VSLAM, oznake i 3D LiDAR SLAM; prepoznavanje pješaka, životinja i vozila", en: "VSLAM, markers and 3D LiDAR SLAM; pedestrian, animal and vehicle detection" } },
          { label: "safety", value: { hr: "zvučna i svjetlosna upozorenja, izbjegavanje kiše i zaštita IP54", en: "audible and visual warnings, rain avoidance and IP54 protection" } },
        ],
      },
      {
        group: "dimensions",
        items: [
          { label: "dimensions", value: "840 × 600 × 675 mm" },
          { label: "weight", value: "85 kg" },
        ],
      },
    ],
    sourceUrl: "https://www.pudurobotics.com/en/products/mt1-max",
    price: null,
  },
  {
    id: "pudu-mt1-vac",
    manufacturer: "PUDU Robotics",
    model: "MT1 Vac",
    fullName: "PUDU MT1 Vac",
    image: "assets/products/pudu-mt1-vac.png",
    imageAlt: {
      hr: "Autonomni robot za usisavanje PUDU MT1 Vac",
      en: "PUDU MT1 Vac autonomous vacuum robot",
    },
    shortDescription: {
      hr: "Autonomno usisavanje, pometanje i suho brisanje prašine na tvrdim podovima i tepisima.",
      en: "Autonomous vacuuming, sweeping and dust mopping on hard floors and carpets.",
    },
    primaryUse: {
      hr: "Suho čišćenje većih unutarnjih prostora s mješovitim podnim oblogama.",
      en: "Dry cleaning of larger indoor spaces with mixed floor coverings.",
    },
    spaces: {
      hr: "Uredi, hoteli, terminali, trgovine, hodnici i prostori s tepisima.",
      en: "Offices, hotels, terminals, shops, corridors and carpeted areas.",
    },
    cleaningModes: {
      hr: "Pometanje, usisavanje i suho brisanje prašine.",
      en: "Sweeping, vacuuming and dust mopping.",
    },
    industries: ["office", "hospitality", "commercial", "transport"],
    taskCategories: ["sweeping", "vacuumDry", "large"],
    highlights: [
      { label: "application", value: { hr: "tvrdi podovi i tepisi", en: "hard floors and carpets" } },
      { label: "operation", value: { hr: "usisavanje i suho čišćenje", en: "vacuuming and dry cleaning" } },
      { label: "performance", value: { hr: "do 1.400 m²/h", en: "up to 1,400 m²/h" } },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "do 1.400 m²/h", en: "up to 1,400 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "workingWidth", value: { hr: "usisavanje 550 mm; pometanje 700 mm", en: "vacuuming 550 mm; sweeping 700 mm" } },
          { label: "binCapacity", value: { hr: "spremnik 6 L; dvije vreće ukupno 14 L", en: "6 L debris bin; two dust bags totalling 14 L" } },
          { label: "filtration", value: { hr: "H11, opcionalno H13", en: "H11, optional H13" } },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: { hr: "3–6,5 h; standardno pometanje i usisavanje tvrdih podova 4 h", en: "3–6.5 h; standard hard-floor sweeping and vacuuming 4 h" } },
          { label: "chargingTime", value: { hr: "manje od 3,5 h", en: "under 3.5 h" } },
        ],
      },
      {
        group: "navigation",
        items: [
          { label: "navigation", value: { hr: "VSLAM, oznake i LiDAR SLAM; prepoznavanje poda i prepreka", en: "VSLAM, markers and LiDAR SLAM; floor and obstacle recognition" } },
          { label: "minimumClearance", value: { hr: "širina 750 mm; visina 520 mm", en: "750 mm wide; 520 mm high" } },
        ],
      },
      {
        group: "dimensions",
        items: [
          { label: "dimensions", value: "840 × 600 × 490 mm" },
          { label: "weight", value: "75 kg" },
        ],
      },
    ],
    sourceUrl: "https://www.pudurobotics.com/en/products/mt1-vac",
    price: null,
  },
  {
    id: "pudu-bg1-series",
    manufacturer: "PUDU Robotics",
    model: "BG1 Series",
    fullName: "PUDU BG1 Series",
    image: "assets/products/pudu-bg1-series.png",
    imageAlt: {
      hr: "Autonomni robot za pranje podova PUDU BG1 Series",
      en: "PUDU BG1 Series autonomous floor scrubber",
    },
    shortDescription: {
      hr: "Veliki autonomni stroj koji u jednom prolazu pomeće i intenzivno pere tvrde podove.",
      en: "Large autonomous machine that sweeps and deeply scrubs hard floors in one pass.",
    },
    primaryUse: {
      hr: "Intenzivno mokro čišćenje velikih tvrdih površina uz minimalne ručne intervencije.",
      en: "Intensive wet cleaning of large hard-floor areas with minimal manual intervention.",
    },
    spaces: {
      hr: "Industrijski pogoni, skladišta, trgovački kompleksi i prometni terminali.",
      en: "Industrial plants, warehouses, retail complexes and transport hubs.",
    },
    cleaningModes: {
      hr: "Istodobno pometanje i pranje, rubno pranje te opcionalno poliranje i suho brisanje.",
      en: "Combined sweeping and scrubbing, edge scrubbing, plus optional polishing and dust mopping.",
    },
    industries: ["manufacturing", "logistics", "commercial", "transport"],
    taskCategories: ["washing", "sweeping", "large"],
    highlights: [
      { label: "application", value: { hr: "vrlo velike tvrde površine", en: "very large hard-floor areas" } },
      { label: "operation", value: { hr: "pometanje i pranje u jednom prolazu", en: "one-pass sweeping and scrubbing" } },
      { label: "performance", value: { hr: "do 2.000 m²/h", en: "up to 2,000 m²/h" } },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "do 2.000 m²/h; ciljano čišćenje do 6.000 m²/h", en: "up to 2,000 m²/h; spot cleaning up to 6,000 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "workingWidth", value: { hr: "550 mm; 708 mm s bočnim četkama", en: "550 mm; 708 mm with side brushes" } },
          { label: "tankCapacity", value: { hr: "75 L čiste + 60 L prljave vode; spremnik otpada 5 L", en: "75 L clean + 60 L waste water; 5 L debris bin" } },
          { label: "detergentCapacity", value: { hr: "dva spremnika, ukupno oko 7 L", en: "dual tanks, about 7 L total" } },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: { hr: "do 7,5 h", en: "up to 7.5 h" } },
          { label: "chargingTime", value: { hr: "oko 3 h pri naponu od najmanje 180 V; oko 4,5 h pri nižem naponu", en: "about 3 h at 180 V or above; about 4.5 h at lower voltage" } },
          { label: "batteryCapacity", value: "90 Ah / 48 V" },
        ],
      },
      {
        group: "navigation",
        items: [
          { label: "navigation", value: { hr: "LiDAR i 3D VSLAM; BG1 Pro koristi 3D LiDAR i 3D VSLAM", en: "LiDAR and 3D VSLAM; BG1 Pro uses 3D LiDAR and 3D VSLAM" } },
          { label: "automation", value: { hr: "automatsko punjenje i rad bez nadzora uz opcionalnu radnu stanicu", en: "automatic charging and unattended operation with an optional workstation" } },
          { label: "minimumClearance", value: "850 mm" },
        ],
      },
      {
        group: "dimensions",
        items: [
          { label: "dimensions", value: { hr: "1.195 × 760 × 1.303 mm s usisnom gumom", en: "1,195 × 760 × 1,303 mm with squeegee" } },
          { label: "weight", value: { hr: "oko 344 kg", en: "about 344 kg" } },
        ],
      },
    ],
    sourceUrl: "https://www.pudurobotics.com/en/products/pudu-bg1-series",
    price: null,
  },
  {
    id: "pudu-sh1",
    manufacturer: "PUDU Robotics",
    model: "SH1",
    fullName: "PUDU SH1",
    image: "assets/products/pudu-sh1.png",
    imageAlt: {
      hr: "Ručni stroj za pranje i sušenje podova PUDU SH1",
      en: "PUDU SH1 upright scrubber dryer",
    },
    shortDescription: {
      hr: "Kompaktni stroj kojim osoblje pere i odmah suši podove u manjim i prometnim zonama.",
      en: "Compact staff-operated machine that scrubs and immediately dries floors in smaller busy zones.",
    },
    primaryUse: {
      hr: "Brza ručna intervencija na prolijevanjima, masnoći i svakodnevnoj prljavštini.",
      en: "Fast manual response to spills, grease and everyday floor soil.",
    },
    spaces: {
      hr: "Restorani, hoteli, trgovine, autoservisi, uredi i manji komercijalni prostori.",
      en: "Restaurants, hotels, shops, automotive service, offices and smaller commercial spaces.",
    },
    cleaningModes: {
      hr: "Pranje, ribanje i usisavanje prljave vode u jednom prolazu; dodatci za rubove i okomite površine.",
      en: "Washing, scrubbing and dirty-water recovery in one pass; accessories for edges and vertical surfaces.",
    },
    industries: ["hospitality", "commercial", "office"],
    taskCategories: ["washing", "compact"],
    highlights: [
      { label: "application", value: { hr: "manje i prometne zone", en: "smaller high-traffic zones" } },
      { label: "operation", value: { hr: "ručno pranje i trenutno sušenje", en: "manual scrubbing and instant drying" } },
      { label: "performance", value: { hr: "1.100–1.600 m²/h", en: "1,100–1,600 m²/h" } },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "1.100–1.600 m²/h", en: "1,100–1,600 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "workingWidth", value: { hr: "četka 440 mm; usisna guma 490 mm", en: "440 mm brush; 490 mm squeegee" } },
          { label: "tankCapacity", value: { hr: "4 L čiste + 4 L prljave vode", en: "4 L clean + 4 L waste water" } },
          { label: "brushPressure", value: "27 kg" },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: { hr: "70 min standardno; 100 min u štedljivom načinu", en: "70 min standard; 100 min in eco mode" } },
          { label: "chargingTime", value: "2.5 h" },
          { label: "batteryCapacity", value: "18 Ah" },
        ],
      },
      {
        group: "dimensions",
        items: [
          { label: "dimensions", value: "490 × 530 × 1.200 mm" },
          { label: "weight", value: "17 kg" },
        ],
      },
    ],
    sourceUrl: "https://www.pudurobotics.com/en/products/sh",
    price: null,
  },
  {
    id: "gausium-omnie",
    manufacturer: "Gausium",
    model: "Omnie",
    fullName: "Gausium Omnie",
    image: "assets/products/omnie-front-original.webp",
    imageAlt: {
      hr: "Autonomni robot za čišćenje Gausium Omnie",
      en: "Gausium Omnie autonomous cleaning robot",
    },
    shortDescription: {
      hr: "Autonomni robot za pranje, pometanje i suho brisanje u velikim, dinamičnim objektima.",
      en: "Autonomous scrubbing, sweeping and dust-mopping robot for large dynamic facilities.",
    },
    primaryUse: {
      hr: "Čišćenje velikih prostora s intenzivnim prometom i čestim promjenama okoline.",
      en: "Cleaning large spaces with heavy traffic and frequent environmental changes.",
    },
    spaces: {
      hr: "Zračne luke, kolodvori, skladišta, proizvodnja, trgovački centri i garaže.",
      en: "Airports, stations, warehouses, manufacturing, shopping centres and car parks.",
    },
    cleaningModes: {
      hr: "Pranje, pometanje i suho brisanje; konfiguracija s disk ili valjkastom četkom.",
      en: "Scrubbing, sweeping and dust mopping; disc-brush or roller-brush configuration.",
    },
    industries: ["transport", "logistics", "manufacturing", "commercial", "parking"],
    taskCategories: ["washing", "sweeping", "large"],
    highlights: [
      { label: "application", value: { hr: "dinamični veliki objekti", en: "large dynamic facilities" } },
      { label: "operation", value: { hr: "mokro i suho čišćenje", en: "wet and dry cleaning" } },
      { label: "performance", value: { hr: "pranje do 2.621 m²/h", en: "scrubbing up to 2,621 m²/h" } },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "pranje do 2.621 m²/h; pometanje do 3.931 m²/h; suho brisanje do 3.604 m²/h", en: "scrubbing up to 2,621 m²/h; sweeping up to 3,931 m²/h; dust mopping up to 3,604 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "workingWidth", value: { hr: "disk 520 mm; valjak 406 mm ili 780 mm s bočnim četkama", en: "disc 520 mm; roller 406 mm or 780 mm with side brushes" } },
          { label: "tankCapacity", value: { hr: "33 L čiste + 24 L prljave vode", en: "33 L clean + 24 L waste water" } },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: { hr: "pranje do 3 h; pometanje i suho brisanje do 8 h", en: "scrubbing up to 3 h; sweeping and dust mopping up to 8 h" } },
          { label: "chargingTime", value: "2 h" },
          { label: "batteryCapacity", value: "60 Ah" },
        ],
      },
      {
        group: "navigation",
        items: [
          { label: "navigation", value: { hr: "3D i 2D LiDAR, dubinska i RGB kamera, zaštita od sudara i pada", en: "3D and 2D LiDAR, depth and RGB cameras, anti-collision and anti-drop protection" } },
          { label: "minimumClearance", value: "800 mm" },
        ],
      },
      {
        group: "dimensions",
        items: [
          { label: "dimensions", value: "810 × 700 × 1.070 mm" },
          { label: "weight", value: { hr: "148–157 kg, ovisno o konfiguraciji", en: "148–157 kg, depending on configuration" } },
        ],
      },
    ],
    sourceUrl: "https://gausium.com/specs/omnie/",
    price: null,
  },
  {
    id: "gausium-phantas",
    manufacturer: "Gausium",
    model: "Phantas",
    fullName: "Gausium Phantas",
    image: "assets/products/phantas-front-original.webp",
    imageAlt: {
      hr: "Kompaktni autonomni robot za čišćenje Gausium Phantas",
      en: "Gausium Phantas compact autonomous cleaning robot",
    },
    shortDescription: {
      hr: "Kompaktni robot s četiri načina čišćenja za uske prolaze, rubove i mješovite podove.",
      en: "Compact four-mode cleaning robot for narrow passages, edges and mixed floor types.",
    },
    primaryUse: {
      hr: "Svakodnevno autonomno čišćenje manjih i srednjih prostora s mnogo prepreka.",
      en: "Daily autonomous cleaning of small and medium spaces with many obstacles.",
    },
    spaces: {
      hr: "Hoteli, trgovine, uredi, zdravstvo i drugi unutarnji komercijalni objekti.",
      en: "Hotels, shops, offices, healthcare and other indoor commercial facilities.",
    },
    cleaningModes: {
      hr: "Usisavanje, pometanje, pranje i suho brisanje prašine.",
      en: "Vacuuming, sweeping, scrubbing and dust mopping.",
    },
    industries: ["hospitality", "commercial", "office", "healthcare"],
    taskCategories: ["washing", "sweeping", "vacuumDry", "compact"],
    highlights: [
      { label: "application", value: { hr: "mali i srednji prostori", en: "small and medium spaces" } },
      { label: "operation", value: { hr: "četiri načina čišćenja", en: "four cleaning modes" } },
      { label: "performance", value: { hr: "praktično 350–700 m²/h", en: "practical 350–700 m²/h" } },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "praktično 350–700 m²/h", en: "practical 350–700 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "workingWidth", value: { hr: "usisavanje i pometanje 465 mm; pranje i suho brisanje 330 mm", en: "vacuuming and sweeping 465 mm; scrubbing and dust mopping 330 mm" } },
          { label: "tankCapacity", value: { hr: "11,5 L čiste + 10,5 L prljave vode; vreća 6 L; spremnik otpada 1 L", en: "11.5 L clean + 10.5 L waste water; 6 L dust bag; 1 L debris bin" } },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: { hr: "pranje i usisavanje 4,5 h; pometanje 6 h; suho brisanje 10 h", en: "scrubbing and vacuuming 4.5 h; sweeping 6 h; dust mopping 10 h" } },
          { label: "chargingTime", value: { hr: "oko 2 h", en: "about 2 h" } },
        ],
      },
      {
        group: "navigation",
        items: [
          { label: "navigation", value: { hr: "2D LiDAR, 3D dubinske kamere, RGB kamera, zaštita od sudara i pada", en: "2D LiDAR, 3D depth cameras, RGB camera, anti-collision and anti-drop protection" } },
          { label: "minimumClearance", value: { hr: "širina i visina 650 mm", en: "650 mm width and height" } },
          { label: "noise", value: { hr: "tihi način do 60 dB", en: "quiet mode up to 60 dB" } },
        ],
      },
      {
        group: "dimensions",
        items: [
          { label: "dimensions", value: "585 × 445 × 619 mm" },
          { label: "weight", value: "65 kg" },
        ],
      },
    ],
    sourceUrl: "https://gausium.com/specs/phantas/",
    price: null,
  },
  {
    id: "gausium-beetle",
    manufacturer: "Gausium",
    model: "Beetle",
    fullName: "Gausium Beetle",
    image: "assets/products/beetle-front-original.webp",
    imageAlt: {
      hr: "Industrijski autonomni robot za pometanje Gausium Beetle",
      en: "Gausium Beetle industrial autonomous sweeper",
    },
    shortDescription: {
      hr: "Industrijski robot za pouzdano pometanje prašine, pijeska i krupnijeg otpada.",
      en: "Industrial robot for dependable sweeping of dust, sand and larger debris.",
    },
    primaryUse: {
      hr: "Dugotrajno suho čišćenje industrijskih prostora i uskih skladišnih prolaza.",
      en: "Long-duration dry cleaning of industrial spaces and narrow warehouse aisles.",
    },
    spaces: {
      hr: "Skladišta, tvornice, logistički centri te unutarnje i vanjske industrijske zone.",
      en: "Warehouses, factories, logistics centres and indoor or outdoor industrial zones.",
    },
    cleaningModes: {
      hr: "Pometanje i ciljano prikupljanje otpada uz filtriranje fine prašine.",
      en: "Sweeping and targeted waste collection with fine-dust filtration.",
    },
    industries: ["logistics", "manufacturing"],
    taskCategories: ["sweeping", "large"],
    highlights: [
      { label: "application", value: { hr: "industrija i skladišta", en: "industry and warehouses" } },
      { label: "operation", value: { hr: "suho pometanje i filtriranje", en: "dry sweeping and filtration" } },
      { label: "performance", value: { hr: "teorijski do 3.240 m²/h", en: "theoretical up to 3,240 m²/h" } },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "teorijski do 3.240 m²/h", en: "theoretical up to 3,240 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "workingWidth", value: "750 mm" },
          { label: "binCapacity", value: "45 L" },
          { label: "airFlow", value: "1.500 m³/h" },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: { hr: "standardni model 3 h; Pro 5 h", en: "standard model 3 h; Pro 5 h" } },
          { label: "chargingTime", value: { hr: "manje od 2,5 h", en: "under 2.5 h" } },
          { label: "batteryCapacity", value: { hr: "standardni model 40 Ah; Pro 60 Ah", en: "standard model 40 Ah; Pro 60 Ah" } },
        ],
      },
      {
        group: "navigation",
        items: [
          { label: "navigation", value: { hr: "3D LiDAR, RGB kamera i RGB-D kamera", en: "3D LiDAR, RGB camera and RGB-D camera" } },
          { label: "safety", value: { hr: "Pro verzija: zastavica vidljivosti, rotacijsko svjetlo i prednja svjetla", en: "Pro version: visibility flag, strobe light and headlights" } },
        ],
      },
      {
        group: "dimensions",
        items: [
          { label: "dimensions", value: { hr: "960–990 × 650–750 × 680 mm bez zastavice", en: "960–990 × 650–750 × 680 mm without visibility flag" } },
          { label: "weight", value: { hr: "102 kg standardni; 112 kg Pro", en: "102 kg standard; 112 kg Pro" } },
        ],
      },
    ],
    sourceUrl: "https://gausium.com/specs/beetle/",
    price: null,
  },
  {
    id: "gausium-scrubber-75",
    manufacturer: "Gausium",
    model: "Scrubber 75",
    fullName: "Gausium Scrubber 75",
    image: "assets/products/scrubber-75-front-original.webp",
    imageAlt: {
      hr: "Veliki autonomni stroj za pranje podova Gausium Scrubber 75",
      en: "Gausium Scrubber 75 large autonomous floor scrubber",
    },
    shortDescription: {
      hr: "Robusni autonomni stroj za intenzivno mokro čišćenje velikih komercijalnih i industrijskih podova.",
      en: "Robust autonomous machine for intensive wet cleaning of large commercial and industrial floors.",
    },
    primaryUse: {
      hr: "Dubinsko pranje velikih površina, uključujući masne i jako zaprljane industrijske podove.",
      en: "Deep scrubbing of large areas, including oily and heavily soiled industrial floors.",
    },
    spaces: {
      hr: "Industrija, skladišta, prometni terminali, trgovački objekti i parkirališta.",
      en: "Industry, warehouses, transport hubs, retail facilities and car parks.",
    },
    cleaningModes: {
      hr: "Intenzivno pranje; opcionalno istodobno pometanje i pranje te način za uljne mrlje.",
      en: "Intensive scrubbing; optional simultaneous sweeping and scrubbing plus an oil-cleaning mode.",
    },
    industries: ["manufacturing", "logistics", "transport", "commercial", "parking"],
    taskCategories: ["washing", "sweeping", "large"],
    highlights: [
      { label: "application", value: { hr: "velike i jako zaprljane površine", en: "large and heavily soiled areas" } },
      { label: "operation", value: { hr: "intenzivno mokro čišćenje", en: "intensive wet cleaning" } },
      { label: "performance", value: { hr: "praktično 700–1.400 m²/h", en: "practical 700–1,400 m²/h" } },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "praktično 700–1.400 m²/h; teorijski do 3.000 m²/h", en: "practical 700–1,400 m²/h; theoretical up to 3,000 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "workingWidth", value: "750 mm" },
          { label: "tankCapacity", value: { hr: "75 L čiste + 50 L prljave vode", en: "75 L clean + 50 L waste water" } },
          { label: "brushPressure", value: "45 kg" },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: { hr: "oko 4–6 h", en: "about 4–6 h" } },
          { label: "chargingTime", value: { hr: "oko 5 h", en: "about 5 h" } },
          { label: "batteryCapacity", value: "200 Ah / 24 V" },
        ],
      },
      {
        group: "navigation",
        items: [
          { label: "navigation", value: { hr: "3D i 2D LiDAR, 3D kamera, zaštita od sudara i pada; 75 P uključuje radare milimetarskih valova", en: "3D and 2D LiDAR, 3D camera, anti-collision and anti-drop protection; 75 P adds millimetre-wave radars" } },
          { label: "minimumClearance", value: { hr: "općenito 1.400 mm; podzemne garaže 1.800 mm", en: "generally 1,400 mm; underground garages 1,800 mm" } },
        ],
      },
      {
        group: "dimensions",
        items: [
          { label: "dimensions", value: "1.370 × 962 × 1.417 mm" },
          { label: "weight", value: "400 kg" },
        ],
      },
    ],
    sourceUrl: "https://gausium.com/specs/scrubber-75/",
    price: null,
  },
  {
    id: "orionstar-cleanibot-c5",
    manufacturer: "OrionStar",
    model: "CleaniBot C5",
    fullName: "OrionStar CleaniBot C5",
    image: "assets/products/cleanibot-c5-product-original.webp",
    imageAlt: {
      hr: "Autonomni robot za pranje podova OrionStar CleaniBot C5",
      en: "OrionStar CleaniBot C5 autonomous floor scrubber",
    },
    shortDescription: {
      hr: "Autonomni robot visokog kapaciteta za pranje tvrdokornih mrlja i održavanje velikih unutarnjih prostora.",
      en: "High-capacity autonomous robot for stubborn stains and maintenance of large indoor spaces.",
    },
    primaryUse: {
      hr: "Jednoprolazno pranje i skupljanje vode na velikim tvrdim podovima.",
      en: "One-pass scrubbing and water recovery across large hard-floor areas.",
    },
    spaces: {
      hr: "Skladišta, kampusi, trgovački centri, bolnice, tvornice i prometni objekti.",
      en: "Warehouses, campuses, shopping centres, hospitals, factories and transport facilities.",
    },
    cleaningModes: {
      hr: "Pranje, suho brisanje prašine i usisavanje vode.",
      en: "Scrubbing, dust mopping and water recovery.",
    },
    industries: ["logistics", "commercial", "healthcare", "manufacturing", "transport"],
    taskCategories: ["washing", "large"],
    highlights: [
      { label: "application", value: { hr: "veliki unutarnji prostori", en: "large indoor spaces" } },
      { label: "operation", value: { hr: "dubinsko pranje i skupljanje vode", en: "deep scrubbing and water recovery" } },
      { label: "performance", value: { hr: "do 1.980 m²/h", en: "up to 1,980 m²/h" } },
    ],
    specifications: [
      {
        group: "purpose",
        items: [
          { label: "recommendedUse", valueFrom: "primaryUse" },
          { label: "recommendedSpaces", valueFrom: "spaces" },
          { label: "workingCapacity", value: { hr: "do 1.980 m²/h", en: "up to 1,980 m²/h" } },
        ],
      },
      {
        group: "cleaning",
        items: [
          { label: "cleaningModes", valueFrom: "cleaningModes" },
          { label: "workingWidth", value: "550 mm" },
          { label: "tankCapacity", value: { hr: "45 L čiste + 45 L prljave vode; spremnik otpada 1,8 L", en: "45 L clean + 45 L waste water; 1.8 L debris bin" } },
          { label: "brushPressure", value: "25 kg" },
        ],
      },
      {
        group: "battery",
        items: [
          { label: "runtime", value: { hr: "pranje 3 h; suho brisanje 8 h", en: "scrubbing 3 h; dust mopping 8 h" } },
          { label: "chargingTime", value: "1.5 h" },
          { label: "batteryCapacity", value: "24 V / 80 Ah" },
        ],
      },
      {
        group: "navigation",
        items: [
          { label: "automation", value: { hr: "automatsko punjenje, dopuna čiste vode, ispuštanje prljave vode i ispiranje spremnika", en: "automatic charging, clean-water refill, wastewater discharge and tank rinsing" } },
          { label: "safety", value: { hr: "dvostruko sigurnosno osiguranje; Wi-Fi, 4G i LoRa povezivanje", en: "dual-redundancy safety architecture; Wi-Fi, 4G and LoRa connectivity" } },
          { label: "minimumClearance", value: "880 mm" },
        ],
      },
      {
        group: "dimensions",
        items: [
          { label: "dimensions", value: "820 × 680 × 1.130 mm" },
          { label: "weight", value: "170 kg" },
          { label: "noise", value: "< 68 dB(A)" },
        ],
      },
    ],
    sourceUrl: "https://en.orionstar.com/cleanibot-c5.html",
    price: null,
  },
];
