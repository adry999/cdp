-- Startica website: corrections to 20261009160400_startica_site_star_copy after a
-- second pass against CASE_STUDY_BRIEF.md.
-- - The reason for choosing Telegram is (dedus) + [DE CONFIRMAT] in the brief, so the
--   copy no longer claims the team "sees it fastest" there.
-- - "A platform it cannot reach" was stronger than the brief: now "someone else's platform".
-- - The 6-month maintenance paragraph is supported by the brief (only the launch date is
--   unconfirmed), so it is added to the result.
-- - There is a single admin role, so "Role-based access" becomes "Protected admin access".
-- Idempotent: plain updates scoped to the project.

update public.projects set
  solution_body_ro = $t$Nu am început cu ecrane. Am început cu site-ul existent: l-am parcurs pagină cu pagină și am făcut un inventar complet al conținutului, de la texte și fotografii până la grupe, programe, spații și evenimente. Apoi am urmărit drumul informației: cine publică un eveniment, cine primește o cerere de înscriere și ce face cu ea. Din asta a ieșit un document de cerințe, cu deciziile luate împreună cu clientul: ce rămâne neschimbat, ce trece în mâna echipei și unde ajung cererile.

Am refăcut mai întâi site-ul identic cu originalul și abia după ce identitatea a fost confirmată am trecut la îmbunătățiri. În panou am pus doar evenimentele, adică singurul conținut care se schimbă des; restul paginilor au rămas fixe, ca panoul să fie simplu. „Programează o vizită” deschide formularul pe aceeași pagină, ca părintele să nu fie scos din ce citea, iar cererea ajunge pe Telegram, direct pe telefonul administratorului.$t$,
  solution_body_en = $t$We did not start with screens. We started with the existing site: we went through it page by page and built a complete inventory of its content, from copy and photos to age groups, schedules, spaces and events. Then we traced how information moves: who publishes an event, who receives an enrolment request and what they do with it. That became a requirements document capturing the decisions made with the client: what stays the same, what moves into the team's hands, and where requests land.

We first rebuilt the site identical to the original, and only once the identity was signed off did we move on to improvements. The panel holds only events, the one kind of content that changes often; the other pages stay fixed so the panel stays simple. "Book a visit" opens the form on the same page, so the parent is not pulled away from what they were reading, and the request lands on Telegram, on the administrator's phone.$t$,

  star_biz_ro = $j$[
    "Păstrăm identitatea pe care părinții o recunosc, fără o schimbare vizuală care nu rezolva nicio problemă reală.",
    "Evenimentele se publică de către echipă, fără programator și fără așteptare.",
    "Fiecare cerere ajunge direct la persoana care o poate prelua, în câteva secunde.",
    "Fotografiile și datele site-ului stau în conturile clientului, nu pe o platformă străină.",
    "Structura pregătită pentru mai multe limbi: extinderea nu cere reconstruirea site-ului."
  ]$j$::jsonb,
  star_biz_en = $j$[
    "We keep the identity parents recognise, with no visual overhaul that would not have solved a real problem.",
    "The team publishes events on its own, with no developer and no waiting.",
    "Every request goes straight to the person who can act on it, within seconds.",
    "The site's photos and data live in the client's own accounts, not on someone else's platform.",
    "A structure ready for more languages: expanding does not require rebuilding the site."
  ]$j$::jsonb,

  result_body_ro = $t$Echipa Startica publică acum singură evenimentele, cu poze, fără să aștepte un programator. Cererile părinților ajung imediat pe telefonul administratorului, iar formularul de vizită este la un clic de pe orice pagină.

Fotografiile și datele site-ului stau în conturile clientului, nu pe serverul vechi. Pentru părinți, site-ul arată la fel ca înainte, doar că este făcut să se încarce bine și pe telefon.

După lansare, Codepedia oferă 6 luni de mentenanță: reparăm erorile și ne ocupăm de situațiile neprevăzute, ca echipa grădiniței să se poată concentra pe copii.$t$,
  result_body_en = $t$The Startica team now publishes events with photos on its own, without waiting for a developer. Parents' requests reach the administrator's phone right away, and the visit form is one click away from any page.

The site's photos and data live in the client's own accounts, not on the old server. For parents, the site looks the same as before, only built to load well on phones too.

After launch, Codepedia provides 6 months of maintenance: we fix bugs and handle anything unexpected, so the kindergarten's team can stay focused on the children.$t$
where slug_ro = 'startica-site';

update public.project_stack set
  name = 'Protected admin access',
  role_ro = 'Doar administratorul autentificat modifică conținutul; vizitatorii văd doar ce este publicat',
  role_en = 'Only the signed-in administrator can change content; visitors only see what is published'
where name = 'Role-based access'
  and project_id = (select id from public.projects where slug_ro = 'startica-site');
