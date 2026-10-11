# Legile UI/UX — reguli obligatorii pentru CODEPEDIA

Fiecare PR se verifică pe lista de mai jos. În descrierea PR-ului: „UX laws: OK” sau excepțiile, cu motiv.

## Fitts — ținte mari și aproape
- Ținte de atingere ≥ 44×44px pe mobil, ≥ 32px pe desktop (buton temă, RO/EN, × din modal, bifele din admin incluse — zona clicabilă, nu doar iconița).
- CTA-ul principal e cel mai mare element interactiv din header și primul din dreapta.
- Pe mobil, CTA-ul din meniul full-screen stă jos, în zona degetului mare.
- Spațiu ≥ 8px între ținte vecine.

## Hick — puține alegeri odată
- Meniul principal: maxim 4 linkuri + CTA. Restul (Prețuri, Despre, Noutăți) doar în footer.
- Dropdown Servicii: 2 grupe, maxim 4 proiecte per serviciu.
- Un singur CTA primar per ecran; celelalte acțiuni sunt secundare vizual.
- Formularul de contact: doar câmpurile obligatorii la vedere; serviciul vine preselectat.

## Jakob — ce știu deja utilizatorii
- Logo stânga → acasă. Navigație sus. Limbă și temă în dreapta header-ului.
- Esc închide modalul și dropdown-ul; click în afară închide; focusul revine pe butonul care le-a deschis.
- Linkurile arată ca linkuri (subliniere la hover), butoanele ca butoane.

## Miller — grupare în bucăți mici
- Liste lungi împărțite în grupe de 5–7 (servicii, pași de proces, fapte din studiul de caz).
- Numere de telefon, prețuri, IBAN etc. afișate grupat.

## Tesler — complexitatea o ducem noi
- Serviciul se preselectează după pagina de proveniență.
- Tema implicită urmează sistemul; limba implicită după domeniu/URL.
- Validare cu mesaj clar lângă câmp, fără a șterge ce a scris utilizatorul.

## Doherty — răspuns sub 400 ms
- Feedback vizual la orice acțiune < 100 ms (hover, pressed, „Se salvează…”).
- Trimiterea formularului: stare de încărcare imediată, confirmare clară.
- LCP < 2.5 s pe mobil; hero-ul interactiv nu blochează prima randare.

## Postel — tolerant la input
- Telefon/email acceptate cu spații, majuscule, prefix; normalizate la salvare.
- Câmpurile nu se golesc la eroare.

## Peak-End — momentele care rămân
- Ecranul de după trimiterea formularului: mulțumire + ce urmează și în cât timp.
- Rezultatul din studiul de caz e punctul de vârf: vizibil, fără blocuri goale înainte.

## Von Restorff — un singur element care iese în evidență
- Portocaliul (#FF4D14) doar pentru: CTA, starea activă, accentele din blocul de granturi. Nu pentru decor.

## Proximitate și regiune comună (Gestalt)
- Eticheta stă lângă câmpul ei (≤ 8px), grupurile separate de ≥ 24px.
- Elementele dintr-un grup împart același chenar sau fundal.

## Estetică–utilizabilitate
- Ritmul de spațiere și tipografia din Design System; fără excepții locale.

## Accesibilitate (obligatoriu, nu opțional)
- Contrast text ≥ 4.5:1 în ambele teme (3:1 pentru titluri mari).
- Focus vizibil pe tot ce e interactiv; navigare completă din tastatură.
- `prefers-reduced-motion` respectat (hero, tranziții).
