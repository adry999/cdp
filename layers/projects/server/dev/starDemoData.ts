// DEMO DATA, DEV ONLY. Invented example figures, incidents and links copied from the
// design prototypes (STAR / LINKS constants in "Studiu de caz.dc.html" and
// "Case Study.dc.html", card results in "Codepedia.dc.html" / "Codepedia EN.dc.html").
// They are not real client data: never seed them into the database. Loaded only
// under `nuxt dev` (see applyDevDemo), so production builds never include them.
// Regenerate rather than edit by hand.
import type { Json } from '#layers/core/shared/types/database.types'

export const STAR_DEMO: Record<string, Record<string, Json>> = {
  "startica-app": {
    "star_cost_ro": [
      {
        "v": "2 seri",
        "k": "pe lună pentru raportul contabil"
      },
      {
        "v": "4",
        "k": "evidențe separate, câte una pe filială"
      },
      {
        "v": "~15%",
        "k": "restanțe observate târziu"
      }
    ],
    "star_cost_en": [
      {
        "v": "2 evenings",
        "k": "a month on the accounting report"
      },
      {
        "v": "4",
        "k": "separate records, one per branch"
      },
      {
        "v": "~15%",
        "k": "arrears noticed late"
      }
    ],
    "star_goal_ro": "O singură aplicație pentru prezență, plăți și cheltuieli, folosită de toate filialele din prima zi a anului școlar.",
    "star_goal_en": "One app for attendance, payments and expenses, used by every branch from the first day of the school year.",
    "star_constraints_ro": [
      {
        "k": "Termen",
        "v": "10 săptămâni, până la 1 septembrie"
      },
      {
        "k": "Utilizatori",
        "v": "Administratori fără experiență tehnică"
      },
      {
        "k": "Date existente",
        "v": "Registre Excel separate, câte unul pe filială"
      },
      {
        "k": "Buget",
        "v": "Fix, stabilit la ofertă"
      }
    ],
    "star_constraints_en": [
      {
        "k": "Deadline",
        "v": "10 weeks, by 1 September"
      },
      {
        "k": "Users",
        "v": "Administrators with no technical background"
      },
      {
        "k": "Existing data",
        "v": "Separate Excel registers, one per branch"
      },
      {
        "k": "Budget",
        "v": "Fixed, set in the proposal"
      }
    ],
    "star_biz_ro": [
      "Am urmărit o zi de lucru a administratorului înainte să desenăm vreun ecran.",
      "Raportul contabil urmează formatul cerut de contabil, ca să nu mai fie refăcut manual.",
      "Notificarea SMS pentru restanțe aduce plățile înainte de sfârșitul lunii.",
      "Lansare pe o filială pilot, apoi extindere pe restul."
    ],
    "star_biz_en": [
      "We followed an administrator through a working day before drawing any screen.",
      "The accounting report follows the format the accountant asked for, so it is no longer redone by hand.",
      "SMS reminders for arrears bring payments in before the end of the month.",
      "Launch on one pilot branch, then roll out to the rest."
    ],
    "star_incident_ro": {
      "found": "În săptămâna 5, contabilul a cerut ca raportul lunar să poată fi importat direct în programul lui de contabilitate. Raportul era gândit ca PDF de citit.",
      "risk": "Rescrierea raportului după lansare și încă o lună de introdus manual cifrele în contabilitate.",
      "action": "Am cerut un fișier de import de la contabil și am construit exportul în acel format din sprintul următor, înaintea modulelor secundare. Primul raport a fost verificat împreună cu el, pe datele lunii de test.",
      "outcome": [
        {
          "v": "0 zile",
          "k": "întârziere la lansare"
        },
        {
          "v": "3 săpt.",
          "k": "întârziere evitată"
        }
      ]
    },
    "star_incident_en": {
      "found": "In week 5 the accountant asked for the monthly report to be importable straight into his accounting software. The report had been planned as a PDF to read.",
      "risk": "Rewriting the report after launch, and another month of typing the figures into accounting by hand.",
      "action": "We got a sample import file from the accountant and built the export in that format in the next sprint, ahead of the secondary modules. We checked the first report with him on the test month data.",
      "outcome": [
        {
          "v": "0 days",
          "k": "launch delay"
        },
        {
          "v": "3 wks",
          "k": "delay avoided"
        }
      ]
    },
    "star_gains_ro": [
      {
        "v": "180",
        "k": "copii gestionați într-un singur loc"
      },
      {
        "v": "−40%",
        "k": "restanțe după 3 luni"
      }
    ],
    "star_gains_en": [
      {
        "v": "180",
        "k": "children managed in one place"
      },
      {
        "v": "−40%",
        "k": "arrears after 3 months"
      }
    ],
    "star_savings_ro": [
      {
        "v": "12 h",
        "k": "lucru manual economisit lunar"
      },
      {
        "v": "~2 400 €",
        "k": "pe an, timp administrativ"
      }
    ],
    "star_savings_en": [
      {
        "v": "12 h",
        "k": "manual work saved monthly"
      },
      {
        "v": "~€2,400",
        "k": "a year in admin time"
      }
    ],
    "win_value_ro": "−40%",
    "win_value_en": "−40%",
    "win_label_ro": "restanțe după 3 luni",
    "win_label_en": "arrears after 3 months",
    "links": [
      {
        "kind": "preview",
        "url": "https://preview.codepedia.studio/startica-app",
        "note_ro": "Cont demo, date fictive",
        "note_en": "Demo account, fictional data"
      },
      {
        "kind": "figma",
        "url": "https://www.figma.com/",
        "note_ro": "Machete și flux",
        "note_en": "Mockups and flow"
      }
    ]
  },
  "startica-site": {
    "star_cost_ro": [
      {
        "v": "30+",
        "k": "apeluri pe săptămână cu aceleași întrebări"
      },
      {
        "v": "0",
        "k": "cereri primite în afara programului"
      },
      {
        "v": "3",
        "k": "limbi, gestionate manual"
      }
    ],
    "star_cost_en": [
      {
        "v": "30+",
        "k": "calls a week with the same questions"
      },
      {
        "v": "0",
        "k": "requests outside office hours"
      },
      {
        "v": "3",
        "k": "languages, managed by hand"
      }
    ],
    "star_goal_ro": "Un site care răspunde la întrebările frecvente și aduce cereri de înscriere în română, rusă și engleză.",
    "star_goal_en": "A site that answers the frequent questions and brings enrolment requests in Romanian, Russian and English.",
    "star_constraints_ro": [
      {
        "k": "Termen",
        "v": "6 săptămâni, înainte de perioada înscrierilor"
      },
      {
        "k": "Conținut",
        "v": "Peste 200 de fotografii"
      },
      {
        "k": "Public",
        "v": "Majoritar de pe telefon"
      },
      {
        "k": "Administrare",
        "v": "Fără programator, din panou"
      }
    ],
    "star_constraints_en": [
      {
        "k": "Deadline",
        "v": "6 weeks, before enrolment season"
      },
      {
        "k": "Content",
        "v": "Over 200 photos"
      },
      {
        "k": "Audience",
        "v": "Mostly on phones"
      },
      {
        "k": "Admin",
        "v": "From a panel, no developer needed"
      }
    ],
    "star_biz_ro": [
      "Paginile sunt ordonate după întrebările pe care părinții le pun la telefon.",
      "Formularul cere grupa și programul, ca managerul să sune pregătit.",
      "Termenul de răspuns de 24 de ore e afișat lângă formular."
    ],
    "star_biz_en": [
      "Pages are ordered by the questions parents ask on the phone.",
      "The form asks for group and schedule, so the manager calls prepared.",
      "The 24-hour reply time is shown next to the form."
    ],
    "star_incident_ro": {
      "found": "La migrarea fotografiilor am descoperit că jumătate erau originale de 6–8 MB, direct din telefon. Pagina principală trecea de 40 MB.",
      "risk": "Site lent pe date mobile chiar în perioada înscrierilor și poziții slabe în Google.",
      "action": "Am adăugat optimizare automată la încărcare: fiecare fotografie se convertește în WebP, în trei dimensiuni. Administratorul încarcă orice fișier, iar site-ul servește varianta potrivită ecranului.",
      "outcome": [
        {
          "v": "40 → 2 MB",
          "k": "pagina principală"
        },
        {
          "v": "0 zile",
          "k": "întârziere"
        }
      ]
    },
    "star_incident_en": {
      "found": "While migrating the photos we found half were 6–8 MB originals straight from a phone. The home page went over 40 MB.",
      "risk": "A slow site on mobile data right in enrolment season, and weak Google rankings.",
      "action": "We added automatic optimisation on upload: every photo is converted to WebP in three sizes. The admin uploads any file and the site serves the size that fits the screen.",
      "outcome": [
        {
          "v": "40 → 2 MB",
          "k": "home page"
        },
        {
          "v": "0 days",
          "k": "delay"
        }
      ]
    },
    "star_gains_ro": [
      {
        "v": "40+",
        "k": "cereri de înscriere pe lună"
      },
      {
        "v": "24/7",
        "k": "cereri primite și în afara programului"
      }
    ],
    "star_gains_en": [
      {
        "v": "40+",
        "k": "enrolment requests a month"
      },
      {
        "v": "24/7",
        "k": "requests outside office hours"
      }
    ],
    "star_savings_ro": [
      {
        "v": "−60%",
        "k": "apeluri repetitive"
      },
      {
        "v": "~6 h",
        "k": "pe săptămână pentru manager"
      }
    ],
    "star_savings_en": [
      {
        "v": "−60%",
        "k": "repetitive calls"
      },
      {
        "v": "~6 h",
        "k": "a week for the manager"
      }
    ],
    "win_value_ro": "−60%",
    "win_value_en": "−60%",
    "win_label_ro": "apeluri repetitive",
    "win_label_en": "repetitive calls",
    "links": []
  },
  "aurelia-badiur": {
    "star_cost_ro": [
      {
        "v": "3–4",
        "k": "mesaje până la prima întâlnire"
      },
      {
        "v": "0",
        "k": "cereri din afara Moldovei"
      }
    ],
    "star_cost_en": [
      {
        "v": "3–4",
        "k": "messages before the first meeting"
      },
      {
        "v": "0",
        "k": "requests from outside Moldova"
      }
    ],
    "star_goal_ro": "O prezentare bilingvă, pe care consultanta o poate trimite oricărei crame, care duce direct la o discuție 1:1.",
    "star_goal_en": "A bilingual presentation the consultant can send to any winery, leading straight to a 1:1 conversation.",
    "star_constraints_ro": [
      {
        "k": "Termen",
        "v": "4 săptămâni"
      },
      {
        "k": "Conținut",
        "v": "Texte tehnice, pentru specialiști și proprietari"
      },
      {
        "k": "Limbi",
        "v": "Română și engleză"
      },
      {
        "k": "Buget",
        "v": "Redus, site static"
      }
    ],
    "star_constraints_en": [
      {
        "k": "Deadline",
        "v": "4 weeks"
      },
      {
        "k": "Content",
        "v": "Technical copy, for specialists and owners"
      },
      {
        "k": "Languages",
        "v": "Romanian and English"
      },
      {
        "k": "Budget",
        "v": "Small, static site"
      }
    ],
    "star_biz_ro": [
      "Serviciul e împărțit în urmărire completă și consultanță punctuală.",
      "Formarea și domeniile apar înaintea serviciilor, pentru încredere.",
      "Trei canale de contact, la alegerea cramei."
    ],
    "star_biz_en": [
      "The service is split into full follow-up and one-off consulting.",
      "Training and fields come before the services, to build trust.",
      "Three contact channels, the winery chooses."
    ],
    "star_incident_ro": {
      "found": "În săptămâna 2, clienta a primit o cerere de la o cramă din Franța care voia o prezentare scrisă. Versiunea în engleză nu era gata.",
      "risk": "Pierderea unui client străin sau lansarea amânată pentru traduceri.",
      "action": "Am publicat întâi pagina de servicii în engleză, ca link separat, și am continuat restul în paralel. Site-ul complet s-a lansat la termen.",
      "outcome": [
        {
          "v": "1",
          "k": "client străin păstrat"
        },
        {
          "v": "0 zile",
          "k": "întârziere"
        }
      ]
    },
    "star_incident_en": {
      "found": "In week 2 the client got a request from a winery in France that wanted a written presentation. The English version was not ready.",
      "risk": "Losing a foreign client, or delaying launch for translations.",
      "action": "We published the English services page first, as a separate link, and finished the rest in parallel. The full site launched on time.",
      "outcome": [
        {
          "v": "1",
          "k": "foreign client kept"
        },
        {
          "v": "0 days",
          "k": "delay"
        }
      ]
    },
    "star_gains_ro": [
      {
        "v": "8",
        "k": "cereri în prima lună"
      },
      {
        "v": "3",
        "k": "colaborări noi"
      }
    ],
    "star_gains_en": [
      {
        "v": "8",
        "k": "requests in the first month"
      },
      {
        "v": "3",
        "k": "new collaborations"
      }
    ],
    "star_savings_ro": [
      {
        "v": "1 link",
        "k": "în loc de 3–4 mesaje explicative"
      },
      {
        "v": "~3 h",
        "k": "pe săptămână în corespondență"
      }
    ],
    "star_savings_en": [
      {
        "v": "1 link",
        "k": "instead of 3–4 explaining messages"
      },
      {
        "v": "~3 h",
        "k": "a week of correspondence"
      }
    ],
    "win_value_ro": "8",
    "win_value_en": "8",
    "win_label_ro": "cereri în prima lună",
    "win_label_en": "requests in the first month",
    "links": []
  },
  "englishminds": {
    "star_cost_ro": [
      {
        "v": "4",
        "k": "stiluri vizuale diferite pe materiale"
      },
      {
        "v": "~5%",
        "k": "vizitatori care ajungeau la contact"
      }
    ],
    "star_cost_en": [
      {
        "v": "4",
        "k": "different visual styles across materials"
      },
      {
        "v": "~5%",
        "k": "visitors who reached contact"
      }
    ],
    "star_goal_ro": "O identitate unitară și un parcurs clar de la prima vizită până la lecția demo.",
    "star_goal_en": "A unified identity and a clear path from first visit to the demo lesson.",
    "star_constraints_ro": [
      {
        "k": "Termen",
        "v": "8 săptămâni, înainte de înscrierile din septembrie"
      },
      {
        "k": "Public",
        "v": "Copii, părinți și adulți"
      },
      {
        "k": "Echipa clientului",
        "v": "Publică singură pe Instagram"
      },
      {
        "k": "Livrabile",
        "v": "Brand, site, flyer, șabloane"
      }
    ],
    "star_constraints_en": [
      {
        "k": "Deadline",
        "v": "8 weeks, before September enrolment"
      },
      {
        "k": "Audience",
        "v": "Children, parents and adults"
      },
      {
        "k": "Client team",
        "v": "Posts on Instagram themselves"
      },
      {
        "k": "Deliverables",
        "v": "Brand, site, flyer, templates"
      }
    ],
    "star_biz_ro": [
      "Testul de nivel e primul pas, fără obligații.",
      "Lecția demo e a doua acțiune, după rezultatul testului.",
      "Șabloanele Instagram le completează echipa școlii, fără designer."
    ],
    "star_biz_en": [
      "The level test is the first step, no strings attached.",
      "The demo lesson is the second action, after the test result.",
      "The school team fills in the Instagram templates, no designer needed."
    ],
    "star_incident_ro": {
      "found": "La jumătatea proiectului am aflat că școala deschide o tabără de vară, cu înscrieri peste 3 săptămâni, nu în septembrie.",
      "risk": "Tabăra promovată cu materialele vechi, fără pagină și fără formular de înscriere.",
      "action": "Am reordonat livrările: pagina de tabere, flyer-ul și 6 postări au trecut înaintea blogului. Restul site-ului a urmat planul inițial.",
      "outcome": [
        {
          "v": "la timp",
          "k": "tabăra promovată"
        },
        {
          "v": "0 zile",
          "k": "întârziere la site"
        }
      ]
    },
    "star_incident_en": {
      "found": "Midway through we learned the school was opening a summer camp, with enrolment in 3 weeks, not September.",
      "risk": "The camp promoted with the old materials, with no page and no sign-up form.",
      "action": "We reordered deliveries: the camps page, the flyer and 6 posts moved ahead of the blog. The rest of the site followed the original plan.",
      "outcome": [
        {
          "v": "on time",
          "k": "camp promoted"
        },
        {
          "v": "0 days",
          "k": "site delay"
        }
      ]
    },
    "star_gains_ro": [
      {
        "v": "120",
        "k": "teste de nivel completate"
      },
      {
        "v": "35",
        "k": "lecții demo programate"
      }
    ],
    "star_gains_en": [
      {
        "v": "120",
        "k": "level tests completed"
      },
      {
        "v": "35",
        "k": "demo lessons booked"
      }
    ],
    "star_savings_ro": [
      {
        "v": "~4 h",
        "k": "pe săptămână la postări"
      },
      {
        "v": "0 €",
        "k": "designer extern pentru materiale"
      }
    ],
    "star_savings_en": [
      {
        "v": "~4 h",
        "k": "a week on posts"
      },
      {
        "v": "€0",
        "k": "external designer for materials"
      }
    ],
    "win_value_ro": "120",
    "win_value_en": "120",
    "win_label_ro": "teste de nivel completate",
    "win_label_en": "level tests completed",
    "links": [
      {
        "kind": "figma",
        "url": "https://www.figma.com/",
        "note_ro": "Brand și șabloane",
        "note_en": "Brand and templates"
      }
    ]
  },
  "swisscars": {
    "star_cost_ro": [
      {
        "v": "~150 €",
        "k": "pe lună pe anunțuri plătite"
      },
      {
        "v": "2–3 zile",
        "k": "până la actualizarea unui anunț"
      }
    ],
    "star_cost_en": [
      {
        "v": "~€150",
        "k": "a month on paid listings"
      },
      {
        "v": "2–3 days",
        "k": "to update a listing"
      }
    ],
    "star_goal_ro": "Un catalog propriu, administrat din panou, cu pagină completă pentru fiecare mașină și opțiuni de leasing.",
    "star_goal_en": "An own catalogue, managed from a panel, with a full page for every car and leasing options.",
    "star_constraints_ro": [
      {
        "k": "Termen",
        "v": "8 săptămâni"
      },
      {
        "k": "Stoc",
        "v": "Se schimbă săptămânal"
      },
      {
        "k": "Fotografii",
        "v": "30–60 pe mașină"
      },
      {
        "k": "Limbi",
        "v": "Română, rusă, engleză"
      }
    ],
    "star_constraints_en": [
      {
        "k": "Deadline",
        "v": "8 weeks"
      },
      {
        "k": "Stock",
        "v": "Changes weekly"
      },
      {
        "k": "Photos",
        "v": "30–60 per car"
      },
      {
        "k": "Languages",
        "v": "Romanian, Russian, English"
      }
    ],
    "star_biz_ro": [
      "Fiecare mașină are link propriu, trimis direct clientului.",
      "Leasingul apare lângă preț, nu pe o pagină separată.",
      "Recenziile reale stau lângă stoc."
    ],
    "star_biz_en": [
      "Every car has its own link, sent straight to the client.",
      "Leasing sits next to the price, not on a separate page.",
      "Real reviews sit next to the stock."
    ],
    "star_incident_ro": {
      "found": "În săptămâna 4 am observat că mașinile vândute rămâneau vizibile ore întregi, din cauza cache-ului. Un client a sunat pentru o mașină deja vândută.",
      "risk": "Pierderea încrederii cumpărătorilor și apeluri inutile pentru vânzători.",
      "action": "Am legat statusul din panou de reîmprospătarea paginii: la „Vândut”, pagina se actualizează în câteva secunde, iar mașina iese din listă.",
      "outcome": [
        {
          "v": "< 10 s",
          "k": "actualizare după vânzare"
        },
        {
          "v": "0 zile",
          "k": "întârziere"
        }
      ]
    },
    "star_incident_en": {
      "found": "In week 4 we noticed sold cars stayed visible for hours because of caching. A client called about a car already sold.",
      "risk": "Lost buyer trust and wasted calls for the sales team.",
      "action": "We tied the status in the panel to page revalidation: on “Sold”, the page updates within seconds and the car leaves the list.",
      "outcome": [
        {
          "v": "< 10 s",
          "k": "update after a sale"
        },
        {
          "v": "0 days",
          "k": "delay"
        }
      ]
    },
    "star_gains_ro": [
      {
        "v": "1 link",
        "k": "per mașină, gata de trimis"
      },
      {
        "v": "3",
        "k": "limbi pentru cumpărători"
      }
    ],
    "star_gains_en": [
      {
        "v": "1 link",
        "k": "per car, ready to send"
      },
      {
        "v": "3",
        "k": "languages for buyers"
      }
    ],
    "star_savings_ro": [
      {
        "v": "−150 €",
        "k": "pe lună la anunțuri"
      },
      {
        "v": "~5 h",
        "k": "pe săptămână la actualizări"
      }
    ],
    "star_savings_en": [
      {
        "v": "−€150",
        "k": "a month on listings"
      },
      {
        "v": "~5 h",
        "k": "a week on updates"
      }
    ],
    "win_value_ro": "~5 h",
    "win_value_en": "~5 h",
    "win_label_ro": "pe săptămână la actualizări",
    "win_label_en": "a week on updates",
    "links": []
  },
  "bloom": {
    "star_cost_ro": [
      {
        "v": "~8%",
        "k": "flori pierdute, observate doar la inventar"
      },
      {
        "v": "3",
        "k": "evidențe separate"
      }
    ],
    "star_cost_en": [
      {
        "v": "~8%",
        "k": "flowers lost, noticed only at stocktake"
      },
      {
        "v": "3",
        "k": "separate records"
      }
    ],
    "star_goal_ro": "O singură evidență pentru comenzi, stoc și plăți, cu marja reală pe fiecare produs.",
    "star_goal_en": "One record for orders, stock and payments, with the real margin on every product.",
    "star_constraints_ro": [
      {
        "k": "Termen",
        "v": "12 săptămâni, înainte de 8 Martie"
      },
      {
        "k": "Roluri",
        "v": "Admin și vânzători, cu acces separat"
      },
      {
        "k": "Plăți",
        "v": "MAIB și PayNet"
      },
      {
        "k": "Vârf",
        "v": "14 Februarie și 8 Martie"
      }
    ],
    "star_constraints_en": [
      {
        "k": "Deadline",
        "v": "12 weeks, before 8 March"
      },
      {
        "k": "Roles",
        "v": "Admin and sellers, separate access"
      },
      {
        "k": "Payments",
        "v": "MAIB and PayNet"
      },
      {
        "k": "Peaks",
        "v": "14 February and 8 March"
      }
    ],
    "star_biz_ro": [
      "Tabla de comenzi urmează felul în care lucrează florarii: Confirmată, În lucru, Pregătită.",
      "Pierderile se înregistrează pe motive, ca să se vadă de unde vin.",
      "Datele financiare rămân doar la admin."
    ],
    "star_biz_en": [
      "The order board follows how florists work: Confirmed, In progress, Ready.",
      "Losses are logged by reason, to show where they come from.",
      "Financial data stays with the admin only."
    ],
    "star_incident_ro": {
      "found": "La testele de încărcare dinainte de 8 Martie am găsit că două comenzi simultane pe ultimele bucăți dintr-un lot puteau trece amândouă. Stocul ajungea negativ.",
      "risk": "Comenzi confirmate fără flori, chiar în ziua cu cele mai multe vânzări din an.",
      "action": "Am mutat crearea comenzii într-o funcție atomică în baza de date, cu rezervare blocantă a stocului, și am adăugat teste pentru acest caz.",
      "outcome": [
        {
          "v": "0",
          "k": "comenzi fără stoc de 8 Martie"
        },
        {
          "v": "0 zile",
          "k": "întârziere"
        }
      ]
    },
    "star_incident_en": {
      "found": "In load tests before 8 March we found that two simultaneous orders on the last items of a batch could both go through. Stock went negative.",
      "risk": "Confirmed orders with no flowers, on the busiest sales day of the year.",
      "action": "We moved order creation into an atomic database function with locking stock reservation, and added tests for this case.",
      "outcome": [
        {
          "v": "0",
          "k": "out-of-stock orders on 8 March"
        },
        {
          "v": "0 days",
          "k": "delay"
        }
      ]
    },
    "star_gains_ro": [
      {
        "v": "+11%",
        "k": "marjă, după ajustarea prețurilor"
      },
      {
        "v": "1",
        "k": "evidență pentru tot"
      }
    ],
    "star_gains_en": [
      {
        "v": "+11%",
        "k": "margin, after price adjustments"
      },
      {
        "v": "1",
        "k": "record for everything"
      }
    ],
    "star_savings_ro": [
      {
        "v": "−35%",
        "k": "pierderi de flori"
      },
      {
        "v": "~6 h",
        "k": "pe săptămână la inventar"
      }
    ],
    "star_savings_en": [
      {
        "v": "−35%",
        "k": "flower losses"
      },
      {
        "v": "~6 h",
        "k": "a week on stocktake"
      }
    ],
    "win_value_ro": "−35%",
    "win_value_en": "−35%",
    "win_label_ro": "pierderi de flori",
    "win_label_en": "flower losses",
    "links": [
      {
        "kind": "preview",
        "url": "https://preview.codepedia.studio/bloom",
        "note_ro": "Cont demo admin / vânzător",
        "note_en": "Demo admin / seller account"
      },
      {
        "kind": "figma",
        "url": "https://www.figma.com/",
        "note_ro": "Machete",
        "note_en": "Mockups"
      }
    ]
  },
  "truckerhq": {
    "star_cost_ro": [
      {
        "v": "8–10%",
        "k": "din cursă, plătit dispecerilor"
      },
      {
        "v": "0",
        "k": "trafic organic"
      }
    ],
    "star_cost_en": [
      {
        "v": "8–10%",
        "k": "of each load, paid to dispatchers"
      },
      {
        "v": "0",
        "k": "organic traffic"
      }
    ],
    "star_goal_ro": "Un site care explică tariful fix, aduce cereri de dispatch și atrage trafic prin unelte gratuite.",
    "star_goal_en": "A site that explains the flat fee, brings dispatch requests and draws traffic through free tools.",
    "star_constraints_ro": [
      {
        "k": "Termen",
        "v": "10 săptămâni"
      },
      {
        "k": "Limbi",
        "v": "Engleză, rusă"
      },
      {
        "k": "Date",
        "v": "FMCSA, uneori incomplete"
      },
      {
        "k": "Utilizatori",
        "v": "Șoferi, de pe telefon"
      }
    ],
    "star_constraints_en": [
      {
        "k": "Deadline",
        "v": "10 weeks"
      },
      {
        "k": "Languages",
        "v": "English, Russian"
      },
      {
        "k": "Data",
        "v": "FMCSA, sometimes incomplete"
      },
      {
        "k": "Users",
        "v": "Drivers, on phones"
      }
    ],
    "star_biz_ro": [
      "Tariful fix e comparat direct cu procentul din cursă.",
      "Uneltele fără cont sunt primul contact cu transportatorul.",
      "Pagini pe fiecare stat, pentru căutări locale."
    ],
    "star_biz_en": [
      "The flat fee is compared directly with the percentage per load.",
      "No-account tools are the first contact with the carrier.",
      "Pages for every state, for local searches."
    ],
    "star_incident_ro": {
      "found": "În săptămâna 6, cheia de acces FMCSA a rămas blocată în aprobare, cu un termen estimat de 4 săptămâni.",
      "risk": "Uneltele, partea principală a site-ului, nu puteau fi lansate.",
      "action": "Am construit un strat de date de exemplu cu aceeași structură ca API-ul. Site-ul s-a lansat cu el, iar la primirea cheii a trecut pe date live dintr-o setare.",
      "outcome": [
        {
          "v": "4 săpt.",
          "k": "întârziere evitată"
        },
        {
          "v": "1 setare",
          "k": "pentru trecerea pe date live"
        }
      ]
    },
    "star_incident_en": {
      "found": "In week 6 the FMCSA access key got stuck in approval, with an estimated 4 weeks.",
      "risk": "The tools, the main part of the site, could not launch.",
      "action": "We built a sample data layer with the same structure as the API. The site launched on it, and switched to live data from a setting once the key arrived.",
      "outcome": [
        {
          "v": "4 wks",
          "k": "delay avoided"
        },
        {
          "v": "1 setting",
          "k": "to switch to live data"
        }
      ]
    },
    "star_gains_ro": [
      {
        "v": "50+",
        "k": "pagini pe stat indexate"
      },
      {
        "v": "24/7",
        "k": "cereri de dispatch"
      }
    ],
    "star_gains_en": [
      {
        "v": "50+",
        "k": "state pages indexed"
      },
      {
        "v": "24/7",
        "k": "dispatch requests"
      }
    ],
    "star_savings_ro": [
      {
        "v": "~1 200 $",
        "k": "pe lună per camion, față de procent"
      },
      {
        "v": "0 $",
        "k": "reclamă pentru primele cereri"
      }
    ],
    "star_savings_en": [
      {
        "v": "~$1,200",
        "k": "a month per truck vs percentage"
      },
      {
        "v": "$0",
        "k": "ads for the first requests"
      }
    ],
    "win_value_ro": "~1 200 $",
    "win_value_en": "~$1,200",
    "win_label_ro": "economisiți lunar per camion",
    "win_label_en": "saved monthly per truck",
    "links": [
      {
        "kind": "preview",
        "url": "https://preview.codepedia.studio/truckerhq",
        "note_ro": "Înainte de lansare",
        "note_en": "Before launch"
      }
    ]
  }
}
