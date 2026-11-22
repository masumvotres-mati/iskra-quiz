"use strict";

const island2Items = [
  { id: "water", name: "Woda", icon: '<path d="M16 3C12 10 7 15 7 21a9 9 0 0 0 18 0c0-6-5-11-9-18Z" fill="#7bd6e8"/><path d="M11 21q0 5 5 5"/>',
    growth: [{ age: 0, needs: { timber: 1 } }, { age: 0, needs: { rope: 2, wheel: 2 } }],
    stages: ["Źródełko", "Odsłonięta pracownia", "Woda pod kontrolą"],
    explanation: "Kanał prowadzi wodę do pola i koła. Przepływająca woda dostarcza energii, a nie sam fakt obecności wody. Odsłonięcie jaskini to baśniowy element tej wyspy.",
    sources: ["history-6", "history-64"] },
  { id: "seeds", name: "Nasiona", icon: '<path d="M16 29V15M16 21C4 21 3 10 4 7c9 0 14 5 12 14Zm0-6C16 6 22 3 29 4c0 8-5 13-13 11Z" fill="#91ce6e"/>',
    growth: [{ age: 1, needs: { water: 1 } }, { age: 4, needs: { water: 2, timber: 1 } }],
    stages: ["Nasiona w ziemi", "Zielony ogródek", "Zbiory dla budowniczych"],
    explanation: "Nawodnione rośliny potrzebują czasu, by wyrosnąć. Żywność wspiera rozbudowę pracowni. W tej łamigłówce włączenie kanału przed zasianiem pustej grządki zamienia ją w staw — to reguła tej wyspy, nie uniwersalna zasada nawadniania.",
    sources: ["history-4", "history-6"] },
  { id: "timber", name: "Skrzynia", icon: '<path d="m3 9 13-6 13 6v17l-13 5-13-5Z" fill="#edb574"/><path d="m3 9 13 6 13-6M16 15v16M8 7l13 6M8 20l5 2"/>',
    growth: [{ age: 1, needs: { seeds: 2 } }, { age: 2, needs: { wheel: 2 } }, { age: 4, needs: { rope: 3 } }],
    stages: ["Zwykła skrzynia", "Pracownia z zapasami", "Skrzynia zmieniona w kabinę", "Wieża i przystań"],
    explanation: "Mieszkańcy nie wyrzucają skrzyni: zdejmują wieko i przerabiają ją na kabinę windy. Napęd ułatwia prace stolarskie. To przykład ponownego użycia części, nie rekonstrukcja konkretnego wynalazku.",
    sources: ["history-4", "history-64"] },
  { id: "wheel", name: "Krążek", icon: '<ellipse cx="16" cy="12" rx="13" ry="8" fill="#e1ae70"/><path d="M3 12v5c0 11 26 11 26 0v-5M16 8v8m-7-6 14 4"/>',
    growth: [{ age: 1, needs: { water: 2, timber: 1 } }, { age: 2, needs: { copper: 2 } }, { age: 4, needs: { rope: 3 } }],
    stages: ["Stolik na herbatę", "Koło wodne", "Napęd prądnicy", "Napęd windy i optyki"],
    explanation: "Krążek jest najpierw blatem. Dopiero dołożenie osi i łopatek zmienia go w koło wodne. Koła historycznie napędzały m.in. młyny, tartaki i młoty kuźnicze. Tu ruch trafia też do prądnicy i windy.",
    sources: ["history-10", "history-64"] },
  { id: "rope", name: "Lina", icon: '<path d="M22 28V12a7 7 0 0 0-14 0v8a4 4 0 0 0 8 0V10m6 11h6m-6 5h6" fill="none" stroke="#b48b4e" stroke-width="4"/>',
    growth: [{ age: 1, needs: { timber: 2 } }, { age: 2, needs: { wheel: 2 } }, { age: 3, needs: { timber: 3, seeds: 3 } }],
    stages: ["Zwinięta lina", "Bloczek i przeciwwaga", "Wciągarka z napędem", "Dźwig portowy"],
    explanation: "Lina przez bloczek przenosi siłę i zmienia kierunek ciągnięcia. Dopiero koło wodne dostarcza tu energii do podnoszenia. Winda i dźwig to uproszczone, autorskie konstrukcje.",
    sources: ["history-64"] },
  { id: "copper", name: "Miedź", icon: '<path d="M4 23h4V11c0-8 7-8 7 0v12c0 7 7 7 7 0V11c0-7 6-7 6 0v12" fill="none" stroke="#dc8763" stroke-width="4"/>',
    growth: [{ age: 0, needs: { timber: 2 } }, { age: 0, needs: { wheel: 3 } }],
    stages: ["Zwój drutu", "Zwojnica i magnes", "Prądnica zasila latarnię"],
    explanation: "Sam miedziany drut nie wytwarza prądu. Mieszkańcy łączą zwojnicę z magnesem znalezionym w pracowni. Koło dostarcza ruchu; indukcja elektromagnetyczna pozwala zamienić energię mechaniczną w elektryczną.",
    sources: ["history-38"] },
  { id: "glass", name: "Szkło", icon: '<ellipse cx="16" cy="16" rx="10" ry="13" fill="#b9eff0"/><path d="m12 9 7-3m-9 10 12-6" stroke="#fff"/>',
    growth: [{ age: 1, needs: { timber: 1 } }, { age: 4, needs: { timber: 2 } }, { age: 5, needs: { lamp: 2, rope: 3, timber: 3 } }],
    stages: ["Szklany krążek", "Wstępne szlifowanie", "Gotowa soczewka", "Soczewka na szczycie"],
    explanation: "Rzemieślnik szlifuje szkło, zamiast otrzymać gotowy reflektor z niczego. Soczewka kieruje światło lampy; sama nie jest źródłem światła. Cytat dotyczy soczewek w okularach, nie wynalezienia latarni ani jej optyki.",
    sources: ["history-22"] },
  { id: "lamp", name: "Lampa", icon: '<path d="M11 7V4h10v3M7 10h18v16H7Zm-2 19h22M4 8h24" fill="#ffda76"/><path d="M16 13v9m-4-5h8"/>',
    growth: [{ age: 0, needs: { copper: 3, glass: 3 } }, { age: 0, needs: { glass: 4, wheel: 4 } }],
    stages: ["Niepodłączona lampa", "Światło elektryczne", "Obracająca się latarnia"],
    explanation: "Prądnica zasila elektryczną lampę, a mechaniczny napęd obraca zespół optyczny. To dwa różne zadania. Statek potrzebuje jeszcze gotowej przystani. Ta zabawkowa latarnia nie odtwarza rzeczywistej konstrukcji ani historii latarnictwa.",
    sources: ["history-38", "history-64"] },
];

function emptyIsland2Levels() {
  return Object.fromEntries(island2Items.map(({ id }) => [id, 0]));
}

function island2BranchOnPlacement(levels, branches, id) {
  const next = { ...branches };
  if (id === "seeds") next.seeds = levels.water >= 2 ? "pond" : "field";
  if (id === "wheel") next.wheel = levels.timber >= 2 ? "pottery" : "drive";
  return next;
}

function advanceIsland2(levels, placed, turn, branches = {}) {
  const next = { ...levels };
  const waves = [];
  while (true) {
    const changes = island2Items.filter((item) => {
      const rule = item.growth[next[item.id] - 1];
      if (next[item.id] >= 2 && (item.id === "seeds" && branches.seeds === "pond" ||
          item.id === "wheel" && branches.wheel === "pottery")) return false;
      if (next[item.id] === 1 && item.id === "wheel" && branches.wheel === "pottery") {
        return turn - placed.wheel >= 1 && next.timber >= 2;
      }
      return next[item.id] > 0 && rule && turn - placed[item.id] >= rule.age &&
        Object.entries(rule.needs).every(([id, minimum]) => next[id] >= minimum &&
          !(id === "wheel" && minimum >= 2 && branches.wheel === "pottery"));
    }).map(({ id }) => ({ id, level: next[id] + 1 }));
    if (!changes.length) break;
    for (const { id, level } of changes) next[id] = level;
    waves.push(changes);
  }
  return { levels: next, waves };
}

const island2Artwork = `
<svg viewBox="0 0 640 580" role="img" aria-labelledby="i2-art-title i2-art-description" xmlns="http://www.w3.org/2000/svg">
<title id="i2-art-title">Mała wyspa, wielkie pomysły</title>
<desc id="i2-art-description">Skalista wyspa z ogródkiem, ukrytą pracownią i czekającym żaglowcem. Dodawane przedmioty zmieniają się i łączą w działającą latarnię.</desc>
<defs>
 <linearGradient id="i2-sea" x2="0" y2="1"><stop stop-color="#d6f4f1"/><stop offset="1" stop-color="#8dd7d5"/></linearGradient>
 <linearGradient id="i2-lens" x2="1" y2="1"><stop stop-color="#f0ffff"/><stop offset=".5" stop-color="#96dee3"/><stop offset="1" stop-color="#defdff"/></linearGradient>
 <radialGradient id="i2-glow"><stop stop-color="#fff5a2" stop-opacity=".85"/><stop offset="1" stop-color="#fff5a2" stop-opacity="0"/></radialGradient>
 <clipPath id="i2-cave-mask"><path d="M238 354v-78q4-23 30-16 32 9 32 39v71Z"/></clipPath>
 <g id="i2-box" stroke="#805f43" stroke-width="3.5" stroke-linejoin="round">
  <path d="m-28-30 30-13 28 14-30 15Z" fill="#f7cf8d"/><path d="M-28-30 0-14v38l-28-16Z" fill="#e5a56a"/><path d="m0-14 30-15V8L0 24Z" fill="#c78e59"/>
  <path d="m-21-19 14 8v21l-14-8Zm28 8 16-8V1L7 9Z" fill="#f5c27e"/><path d="m-28-30 28 16 30-15M0-14v38" fill="none"/>
 </g>
 <g id="i2-grain" stroke="#7b7549" stroke-width="2"><path d="M0 0v-35m0 12-9-8m9 0 9-8m-9 0-8-8" fill="none"/><ellipse cx="-6" cy="-30" rx="4" ry="7" fill="#f7d56d" transform="rotate(-35 -6 -30)"/><ellipse cx="6" cy="-37" rx="4" ry="7" fill="#f7d56d" transform="rotate(35 6 -37)"/><ellipse cy="-46" rx="4" ry="7" fill="#f7d56d"/></g>
</defs>
<g id="i2-background">
<rect width="640" height="580" fill="#e6f7ed"/>
<path d="M0 338q145-18 280 0t360-3v245H0Z" fill="url(#i2-sea)"/>
<g fill="#fffdf0" opacity=".85"><path d="M46 113q-8-17 8-23 0-22 21-19 13-14 27 3 21-1 20 17 20 8 9 22Z"/><path d="M492 67q-5-13 9-18 4-20 24-12 12-10 22 6 22-1 20 16 19 8 8 15h-83Z"/></g>
<g class="i2-waves" stroke="#e4ffff" stroke-width="4" fill="none" stroke-linecap="round"><path d="M30 405h29m465-20h40M29 528h38m416 0h46M137 552h55m83-56h29M554 476h39"/><path d="M68 368h19m453 189h29"/></g>
<ellipse cx="331" cy="466" rx="211" ry="57" fill="#4aadb1" opacity=".22"/>
</g>
<g id="i2-base-terrain" stroke="#55735f" stroke-width="3" stroke-linejoin="round">
 <path d="m105 286 182-81 253 111-4 90-9 76-175 86-229-82-15-66Z" fill="#a5c391"/>
 <path d="m108 420 244 78v70l-229-82Z" fill="#c8d5a4"/>
 <path d="m352 498 184-92-9 76-175 86Z" fill="#8fba8b"/>
 <path d="m105 286 182-81 253 111-4 90-184 92-244-78Z" fill="#d1e6a1"/>
 <path d="m146 405 48 21m214 68 38-23m-231-130 27 12" stroke="#bfd398" stroke-width="5"/>
</g>
<g id="i2-middle-walls" stroke="#55735f" stroke-width="3" stroke-linejoin="round">
 <path d="m169 221 162-83 128 53 24 123-135 76-153-69Z" fill="#a2bcab"/>
 <path d="m348 266 111-75 24 123-135 76Z" fill="#79a69c"/>
 <path d="m169 221 179 45v124l-153-69Z" fill="#d0d5b5"/>
</g>
<g id="i2-middle-floor" stroke="#55735f" stroke-width="3" stroke-linejoin="round">
 <path d="m169 221 162-83 128 53-111 75Z" fill="#dcebb7"/>
 <path d="m213 231 24 7m-44-18 26-10m72-42 25-13" stroke="#f5f7d5" stroke-width="4"/>
</g>
<g id="i2-peak-walls" stroke="#55735f" stroke-width="3" stroke-linejoin="round">
 <path d="m319 136 89-40 83 44-32 51-111 75Z" fill="#b4c6a9"/>
 <path d="m459 191 32-51-94 44-49 82Z" fill="#9ab5a5"/>
</g>
<g id="i2-peak-floor" stroke="#55735f" stroke-width="3" stroke-linejoin="round">
 <path d="m319 136 89-40 83 44-94 44Z" fill="#edf0cf"/>
 <path d="m417 115 22 11" stroke="#fafce0" stroke-width="5"/>
</g>
<g id="i2-cave" stroke="#3d6261" stroke-width="4" stroke-linejoin="round">
 <path d="M228 332v-61q3-33 42-22 41 11 42 46v74Z" fill="#476e69"/>
 <path d="M239 333v-56q4-23 28-16 30 9 31 37v59Z" fill="#ffe5ab"/>
 <path d="m233 330 65 24-31 16-52-21Z" fill="#e9c38b"/>
 <path d="m250 302 37 12v12l-37-12Zm7 14v20m24-12v20" fill="#c38a59"/>
 <path d="M253 286v-12h11v18m0-18v-7m0 16h10" stroke="#ad735a" stroke-width="5"/>
 <path d="M281 277v21m-5-21h11" stroke="#759e9a" stroke-width="5"/>
 <g id="i2-magnet"><path d="M271 335v-16q0-9 8-6t8 11v16" fill="none" stroke="#bd726d" stroke-width="7"/><path d="M271 331v5m16 0v5" stroke="#e3e5d7" stroke-width="7"/></g>
</g>
<path id="i2-cave-lip" d="M234 339v-63q2-29 37-19 35 10 34 43v63" fill="none" stroke="#748c73" stroke-width="6"/>
<g id="i2-cover" stroke="#3d6261" stroke-width="4" stroke-linejoin="round">
 <path d="m217 243 66 8 37 44-8 73-85-31Z" fill="#c4cfb1"/><path d="m217 243 40 23 26-15m-26 15 10 34-40 37m40-37 45 68m-45-68 53-5" fill="none" stroke="#a2b9a2"/>
 <path d="m231 251 16 3 8-12m34 24 11 12" fill="none" stroke="#dae2be" stroke-width="7"/>
</g>
<g id="i2-water" class="i2-object">
 <g id="i2-stream" fill="none" stroke-linecap="round"><path d="M277 209q-33 11-26 47t-33 57l-22 41" stroke="#4a929e" stroke-width="17"/><path class="i2-flow" d="M277 209q-33 11-26 47t-33 57l-22 41" stroke="#a6eef0" stroke-width="10" stroke-dasharray="14 12"/><path d="M250 252q-30-14-63 11l-20 25" stroke="#77cbd1" stroke-width="8"/></g>
 <path d="m249 202 28-16 27 15-24 19Z" fill="#d4ddbe" stroke="#3d6261" stroke-width="4"/>
 <path d="M278 184q-17 20 0 24 17-4 0-24Z" fill="#74d2df" stroke="#438a9a" stroke-width="3"/>
 <g id="i2-valve" stroke="#6a795d" stroke-width="3"><path d="m244 239 35 13v17l-35-13Z" fill="#eac784"/><path d="M260 244v-24m-11 0h23m-12-7v14" fill="none"/><circle cx="260" cy="220" r="8" fill="#d6ecba"/></g>
</g>
<g id="i2-overflow"><ellipse cx="173" cy="287" rx="44" ry="17" fill="#91d5d9" stroke="#6ca8a2" stroke-width="2"/><path d="M143 284q26-11 50 2" fill="none" stroke="#cbf3e9" stroke-width="4"/></g>
<g id="i2-seeds" class="i2-object" stroke="#47785b" stroke-width="3" stroke-linejoin="round">
 <path d="m126 288 55-29 43 18-53 31Z" fill="#b6915f"/><path d="m141 289 44-24m-29 31 43-24" stroke="#e0b379"/>
 <g class="i2-seed-first" fill="#f1d38b" stroke="none"><ellipse cx="152" cy="286" rx="4" ry="2"/><ellipse cx="169" cy="278" rx="4" ry="2"/><ellipse cx="181" cy="291" rx="4" ry="2"/></g>
 <g class="i2-sprouts" fill="#88c56b"><path d="M151 286v-16m0 8q-17-1-12-11 13-2 12 11m0-5q13-14 17-3-4 9-17 8M178 280v-17m0 9q-13-1-12-10 12-5 12 10m0-3q10-14 15-3-4 9-15 8"/></g>
 <g class="i2-harvest"><use href="#i2-grain" x="146" y="286"/><use href="#i2-grain" x="169" y="280"/><use href="#i2-grain" x="191" y="291"/><ellipse cx="198" cy="301" rx="13" ry="10" fill="#f4ad62"/><path d="m198 292 4-7" fill="none"/><path d="m123 306 23 7-4 18-23-8Z" fill="#edc58b"/><path d="m121 310 23 7"/></g>
 <g id="i2-pond"><ellipse cx="174" cy="289" rx="45" ry="20" fill="#91d5d9"/><path d="M143 288q24-17 50-3" stroke="#d0f5eb" stroke-width="3" fill="none"/><ellipse cx="161" cy="287" rx="11" ry="5" fill="#9ac477"/><path d="m160 287 9-6" stroke="#d0f5eb"/><path d="m183 297 8-5 8 5-8 4Z" fill="#eab178"/><path d="m198 297 7-4v8Z" fill="#eab178"/><path d="M137 283v-20m0 9-8-7m8 2 6-8" fill="none" stroke="#81a875" stroke-width="3"/></g>
</g>
<g id="i2-coconut" transform="translate(214 416)" stroke="#81674c" stroke-width="2.5"><ellipse rx="10" ry="12" fill="#bb9461"/><path d="M-3-7v2m6-2v2M0 1v2" stroke="#685943"/></g>
<path id="i2-cliff-steps" d="m335 345 13-7-10-12 15-8-10-12 15-8-10-12 15-8-10-12 15-8-10-12 15-8-10-12 15-8-10-12 15-8" fill="none" stroke="#dbe2ba" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
<g id="i2-scaffold" stroke="#866f4f" stroke-width="5" stroke-linejoin="round" fill="none">
 <path d="M365 408V198l45-24v208M363 198l49-25M365 223l45-24m-45 60 45-24m-45 61 45-24m-45 61 45-24m-45 61 45-24" stroke="#c49d68"/>
 <path d="M374 391V206l28-15v186" stroke="#f0d7a2" stroke-width="3"/>
 <g transform="translate(389 185)"><g id="i2-pulley-rotor"><circle r="13" fill="#f0cf88"/><path d="M-9 0H9M0-9V9" stroke-width="3"/></g></g>
 <path class="i2-rope-loop" d="M378 198v188q9 12 21-3V190" stroke="#a77c49" stroke-width="3"/>
</g>
<g id="i2-tower" stroke="#3d6261" stroke-width="4" stroke-linejoin="round">
 <path d="m414 207-8-65 45-16 20 54-23 34Z" fill="#fff4cc"/><path d="m444 132 7-6 20 54-23 34Z" fill="#ded8b2"/><path d="m409 164 47-17m-45 30 49-18" fill="none" stroke="#e6a180" stroke-width="8"/>
 <path d="m401 141 36-19 24 11-35 20Z" fill="#f4d49b"/><path d="M413 202v-14q12-12 17 1v18Z" fill="#5b8880"/>
 <path d="m381 239 34-18 25 12-36 20Z" fill="#eac88d"/><path d="m388 235 27 13m-18-18 27 13" stroke="#ad8b59" stroke-width="2"/><path d="M386 242v13m48-22v14" fill="none" stroke="#987d56" stroke-width="3"/>
 <g id="i2-roof"><path d="m398 125 35-48 38 34-34 25Z" fill="#67aaa0"/><path d="m433 77 4 59 34-25Z" fill="#458c87"/><path d="M433 77v-14l22 4-21 7" fill="#f2ae76"/></g>
</g>
<g id="i2-drive" fill="none" stroke-linecap="round"><path d="m211 375 101 45 68-40V202l50-28" stroke="#856e4c" stroke-width="7"/><path class="i2-running-belt" d="m211 375 101 45 68-40V202l50-28" stroke="#e6c982" stroke-width="3" stroke-dasharray="8 12"/></g>
<g id="i2-dock" stroke="#806e50" stroke-width="3" stroke-linejoin="round">
 <path d="m425 439 48-27 56 26-51 30Z" fill="#e6bc7e"/><path d="m437 433 50 28m-37-35 50 28m-37-35 50 27M438 447v29m77-29v20" fill="none"/><path d="M477 420v-27l-21 12v29" fill="none" stroke-width="5"/><path d="m456 408-16 11" fill="none"/>
</g>
<path id="i2-port-rope" d="M389 185 472 227V431m-7 0q7 13 14 0" fill="none" stroke="#a27c49" stroke-width="3" stroke-linejoin="round"/>
<g id="i2-wheel" class="i2-object">
 <g id="i2-table-feet" stroke="#836544" stroke-width="6" stroke-linecap="round"><path d="m-17 9-5 30M17 9l5 30"/></g>
 <g id="i2-waterwheel" stroke="#805f43" stroke-width="3" stroke-linejoin="round">
  <g transform="scale(.78 1)"><circle r="34" fill="#dfb278"/><g id="i2-wheel-rotor"><g id="i2-paddles" fill="#f3cf92"><path d="M-10-43h20v17h-20Zm0 69h20v17h-20ZM-43-10h17v20h-17Zm69 0h17v20H26ZM-36-28l12-10 12 17-12 10Zm48 49 12-10 12 17-12 10ZM24-38l12 10-12 17-12-10Zm-48 49 12 10-12 17-12-10Z"/><circle r="25" fill="#d59d64"/><path d="M0-28v56m-23-14 46-28m-46 0 46 28" stroke="#f5d399" stroke-width="6"/></g></g><circle r="6" fill="#836544"/></g>
 </g>
 <g id="i2-tabletop" stroke="#805f43" stroke-width="3"><ellipse cy="3" rx="36" ry="19" fill="#d7a06a"/><g transform="scale(1 .5)"><g id="i2-table-rotor"><circle r="36" fill="#efca91"/><path d="M-32-12 29 12m-59 0 61-12M0-35v70" stroke="#d7ad74" stroke-width="3"/></g></g></g>
 <g id="i2-tea" stroke="#60827a" stroke-width="2"><ellipse cy="-8" rx="11" ry="5" fill="#fff6d8"/><path d="M-8-12v-8H6v8q-6 6-14 0Zm14-6q10-3 5 5H6" fill="#fff6d8"/><path d="M-5-27q-5-5 0-10m8 10q5-5 0-10" fill="none" stroke="#fff"/></g>
 <g id="i2-pottery" stroke="#986e50" stroke-width="2.5"><path d="M-10-28q-13 5-12 16t22 10 22-10-12-16l-1-9H-9Z" fill="#e5ac79"/><ellipse cy="-36" rx="10" ry="4" fill="#976c52"/><path d="M-20-17q20 8 40 0m-39 8q19 8 38 0" fill="none" stroke="#f1c995"/></g>
</g>
<g id="i2-crate" class="i2-object">
 <use href="#i2-box"/>
 <g id="i2-cabin-detail" stroke="#805f43" stroke-width="3" fill="none"><path d="M-28-30v-31L0-77l30 17v31M-28-61 0-45l30-15M0-45v31"/><path d="m-20-39 14 9v20l-14-8Zm27 7 15-8v20L7-12Z" fill="#fff1bd"/><path d="m-34-60 34-19 36 18-35 20Z" fill="#e7b379"/></g>
</g>
<g id="i2-rope-coil" class="i2-object" stroke="#a17c49" stroke-width="4" fill="none" stroke-linecap="round"><ellipse rx="22" ry="10"/><ellipse cy="-5" rx="22" ry="10"/><ellipse cy="-10" rx="22" ry="10"/><path d="M22-10q22 0 13 21l-8 10"/></g>
<g id="i2-copper" class="i2-object" stroke="#965f50" stroke-width="3" stroke-linejoin="round">
 <g id="i2-loose-coil" fill="none" stroke="#dc906b" stroke-width="6"><path d="M-27 5h10v-24q0-14 9-10t9 13V8q0 13 9 10t9-15v-22q0-12 9-9t9 14V9"/></g>
 <g id="i2-generator"><path d="m-29-12 31-15 30 15-30 18Z" fill="#b8cab4"/><path d="M-29-12V5L2 20 32 4v-16L2 6Z" fill="#89aaa0"/><path d="M-20-12v-21q0-21 21-15t21 26V0" fill="none" stroke="#d78073" stroke-width="13"/><path d="M-20-13v8m42 0v8" stroke="#eee4c6" stroke-width="13"/><path d="M-10-15 9-24l13 7-19 10Z" fill="#eeb084"/><path d="m-8-18 13 9m-7-12 13 9m-7-12 13 9" stroke="#ba7959" stroke-width="3"/><path class="i2-gen-axis" d="M-8-18 9-9" stroke="#5b8078" stroke-width="5"/></g>
 <g id="i2-sparks" fill="none" stroke="#ffe99b" stroke-width="4"><path d="m30-30 9-14m-5 29 15-3M-34-35l-9-11"/></g>
</g>
<path id="i2-wire" d="m333 402 26-13V205l69-33" fill="none" stroke="#e4a95c" stroke-width="4"/>
<g id="i2-lamp" class="i2-object" stroke="#6b795f" stroke-width="3" stroke-linejoin="round">
 <circle id="i2-light-halo" cy="-10" r="68" fill="url(#i2-glow)" stroke="none"/>
 <path d="M-13 6V-30h25V6m-18-36v-7H6v7M-19 8h37m-38-39h39" fill="#f5cb7e"/>
 <path d="M-8-24H7V0H-8Z" fill="#afc7ae"/><path id="i2-bulb" d="M0 0v-9q-9-12 0-15 10 3 0 15" fill="#ffe797"/>
</g>
<g id="i2-glass" class="i2-object" stroke="#599a9d" stroke-width="3">
 <ellipse rx="21" ry="28" fill="url(#i2-lens)"/><ellipse cx="-4" rx="14" ry="25" fill="#c3f5ef" opacity=".55"/><path d="m-11-12 15-9m-17 21 26-15" fill="none" stroke="#f3ffff" stroke-width="5" stroke-linecap="round"/><path id="i2-lens-rings" d="M-14-20q-11 22 0 41M-7-25q-13 25 0 51M7-25q13 25 0 51M14-20q11 22 0 41" fill="none" stroke="#7cbdbe" stroke-width="2"/>
</g>
<g id="i2-beam" pointer-events="none"><g transform="translate(439 134)"><g id="i2-beam-pivot"><path d="M0 0 195 36v83Z" fill="#fff7a4" opacity=".55"/><path d="M0 0 195 36" stroke="#fff9c7" stroke-width="3" opacity=".65"/></g></g></g>
<g id="i2-boat">
 <g class="i2-boat-bob" stroke="#3d6261" stroke-width="3.5" stroke-linejoin="round">
  <ellipse cy="15" rx="54" ry="10" fill="#67b6ba" stroke="none" opacity=".4"/>
  <path d="m-48-7 99-2-17 29h-58Z" fill="#599c9a"/><path d="m-39-5 81-2-6 9h-66Z" fill="#e5ba7a"/>
  <path d="M-5-11v-98l-36 81H-5m6-73 37 64H1" fill="#fff2cb"/><path d="m0-111 22 7-22 9" fill="#eaa282"/>
  <circle cx="-19" cy="8" r="4" fill="#f6db9d"/><circle cx="3" cy="8" r="4" fill="#f6db9d"/><circle cx="25" cy="8" r="4" fill="#f6db9d"/>
  <path d="M-32-16v-10h14v10" fill="#e5a36d"/>
 </g>
</g>
<g id="i2-cargo"><use href="#i2-box" transform="scale(.55)"/></g>
<g id="i2-production" stroke="#806a49" stroke-width="3" stroke-linejoin="round">
 <path d="m198 374 43-13" fill="none" stroke="#ab8755" stroke-width="5"/>
 <path d="m207 403 33-15 31 15-31 17Z" fill="#c8d3b6"/><path d="M207 403v14l33 15 31-15v-14l-31 17Z" fill="#96b8a6"/>
 <g id="i2-mill-arm"><path d="M241 391v-30h-23" fill="none" stroke="#a58151" stroke-width="7"/><path d="m209 358 22 6v13l-22-6Z" fill="#e0b17a"/></g>
 <path d="m223 425 20 7 16-8-2 14-13 7-19-7Z" fill="#fff2ce"/><ellipse cx="243" cy="429" rx="11" ry="5" fill="#f8e6ab"/>
</g>
<g id="i2-people">
 <g id="i2-person-scout"></g><g id="i2-person-maker"></g><g id="i2-person-gardener"></g>
</g>
<g id="i2-held" pointer-events="none"></g>
<g id="i2-reaction" fill="#fff2b0" stroke="#ba9961" stroke-width="2" stroke-linecap="round"><path d="M-10-15v8m20-8v8M-5 0q5 5 10 0" fill="none"/></g>
</svg>`;

let island2State;
let island2Visual;
let island2Story;
let island2Queue = [];
let island2Timer;
let island2Animations = [];
let island2Current;
let island2Paused = false;
let island2Skipping = false;

function island2CanAnimate() {
  return !motionPreference.matches && !island2Paused && !island2Skipping && !document.hidden;
}

function island2Position(id, point) {
  island2Renderer.position(id, point);
}

function island2Animate(id, frames, duration, easing = "ease-in-out", delay = 0) {
  if (!island2CanAnimate()) return;
  const animation = element(id).animate(frames, { duration, easing, delay, fill: "both" });
  island2Animations.push(animation);
  return animation;
}

function island2Move(id, points, duration, offsets, delay = 0, plane) {
  island2Renderer.move(id, points, duration, offsets, { delay, plane });
}

function island2ClearMotion() {
  window.clearTimeout(island2Timer);
  island2Timer = undefined;
  for (const animation of island2Animations) {
    animation.onfinish = null;
    animation.cancel();
  }
  island2Animations = [];
  island2Renderer.clear();
  element("i2-held").replaceChildren();
  element("island2-scene").dataset.action = "";
}

function island2Actor(role, destination) {
  const travel = island2Renderer.actor(role, destination);
  if (island2Current && island2Current.kind !== "grow") {
    island2Current.duration = Math.max(island2Current.duration, travel + 350);
  }
  return travel;
}

function island2Carry(kind, points, duration, offsets, delay = 0) {
  element("i2-held").innerHTML = kind === "planks"
    ? '<g id="i2-parcel" stroke="#886849" stroke-width="2.5" stroke-linejoin="round"><path d="m-20-10 34-13 12 9-35 14Z" fill="#f3cd8c"/><path d="m-20-3 34-13 12 9-35 14Z" fill="#e1ae6f"/><path d="m-20 4 34-13 12 9-35 14Z" fill="#f3cd8c"/><path d="M0-15 9-8v13L0-2Z" fill="#b68e59"/></g>'
    : kind === "coconut"
    ? '<g id="i2-parcel"><ellipse rx="9" ry="11" fill="#bb9461" stroke="#81674c" stroke-width="3"/><path d="M-3-5v2m6-2v2M0 1v2" stroke="#685943" stroke-width="2"/></g>'
    : kind === "food"
    ? '<g id="i2-parcel"><path d="m-10-7 22 5-4 17-20-6Z" fill="#edbe7b" stroke="#806a49" stroke-width="3"/><ellipse cy="-8" rx="9" ry="8" fill="#efb566" stroke="#806a49" stroke-width="2"/></g>'
    : '<g id="i2-parcel" stroke="#67877a" stroke-width="4" stroke-linecap="round"><path d="M-8-7 9 10m-3-22L-7 8"/><path d="m-11-9 7-5 6 7-7 5" fill="#e5be7f"/></g>';
  const carrier = island2Current?.kind === "grow" && island2Current.carry === kind ? island2Current.actor : undefined;
  island2Renderer.parcel(element("i2-parcel"), carrier);
  if (carrier) return;
  island2Position("i2-parcel", points.at(-1));
  island2Move("i2-parcel", points, duration, offsets, delay);
}

function renderIsland2() {
  const l = island2Visual;
  const scene = element("island2-scene");
  scene.dataset.live = String(island2CanAnimate() && !element("island2").hidden);
  for (const item of island2Items) scene.dataset[item.id] = l[item.id];
  scene.dataset.seedsForm = island2State.branches.seeds;
  scene.dataset.wheelForm = island2State.branches.wheel;
  scene.dataset.ending = island2Story.ending;
  scene.dataset.celebrating = String(island2Story.celebrating);
  const show = (id, condition) => { element(id).style.display = condition ? "" : "none"; };
  for (const [id, key] of [["i2-water", "water"], ["i2-seeds", "seeds"], ["i2-crate", "timber"],
    ["i2-wheel", "wheel"], ["i2-rope-coil", "rope"], ["i2-copper", "copper"], ["i2-glass", "glass"], ["i2-lamp", "lamp"]]) {
    show(id, l[key] > 0);
  }
  show("i2-cave", l.water >= 2);
  show("i2-cover", l.water < 2);
  show("i2-stream", l.water >= 2);
  show("i2-valve", l.water >= 3);
  show("i2-scaffold", l.rope >= 2);
  show("i2-tower", l.timber >= 3);
  show("i2-roof", l.timber >= 4);
  show("i2-dock", l.timber >= 4 && l.rope >= 4);
  show("i2-port-rope", l.rope >= 4);
  show("i2-cliff-steps", l.water >= 2);
  show("i2-drive", l.wheel >= 3);
  const pottery = island2State.branches.wheel === "pottery";
  show("i2-table-feet", l.wheel === 1 || pottery);
  show("i2-tea", l.wheel === 1);
  show("i2-waterwheel", l.wheel >= 2 && !pottery);
  show("i2-tabletop", l.wheel === 1 || pottery);
  show("i2-pottery", l.wheel >= 2 && pottery);
  show("i2-pond", island2State.branches.seeds === "pond" && l.seeds >= 2);
  show("i2-overflow", l.water >= 2 && (l.seeds === 0 || island2State.branches.seeds === "pond"));
  show("i2-cabin-detail", l.timber >= 3);
  show("i2-rope-coil", l.rope === 1);
  show("i2-loose-coil", l.copper === 1);
  show("i2-generator", l.copper >= 2);
  show("i2-magnet", l.copper < 2);
  show("i2-sparks", l.copper >= 3);
  show("i2-wire", l.copper >= 3);
  show("i2-light-halo", l.lamp >= 2);
  show("i2-bulb", l.lamp >= 2);
  show("i2-lens-rings", l.glass >= 3);
  show("i2-beam", l.lamp >= 3);
  show("i2-production", island2Story.producing);
  show("i2-cargo", island2Story.cargo !== "hidden");
  show("i2-reaction", island2Story.reaction);
  show("i2-person-maker", l.water >= 2);
  show("i2-person-gardener", l.seeds >= 2);
  show("i2-coconut", !island2Story.producing);
  island2Position("i2-wheel", l.wheel >= 2 ? pottery ? [273, 366] : [198, 374] : [144, 390]);
  island2Position("i2-crate", l.timber >= 3 ? island2Story.cabin : [286, 355]);
  island2Position("i2-rope-coil", [448, 341]);
  island2Position("i2-copper", [316, 416]);
  island2Position("i2-glass", l.glass >= 4 ? [436, 131] : l.glass >= 3 ? [347, 359] : l.glass >= 2 ? [281, 330] : [193, 330]);
  island2Renderer.glass(l.glass >= 4);
  island2Position("i2-lamp", [436, 142]);
  island2Position("i2-boat", island2Story.boat);
  island2Position("i2-cargo", island2Story.cargo === "unloaded" ? [415, 234] : [480, 452]);
  for (const [role, point] of Object.entries(island2Story.people)) island2Position(`i2-person-${role}`, point);
  element("island2-count").textContent = `${island2State.order.length} / 8`;
  element("island2-controls").setAttribute("aria-busy", String(island2State.busy));
  for (const item of island2Items) {
    const button = element(`island2-pick-${item.id}`);
    const level = l[item.id];
    button.disabled = island2State.busy;
    button.classList.toggle("placed", level > 0);
    button.classList.toggle("maxed", level === item.stages.length);
    button.querySelector("small").textContent = level ? `${island2State.order.indexOf(item.id) + 1} · ${level === item.stages.length ? "MAX" : `${level}/${item.stages.length}`}` : "Dodaj";
    button.setAttribute("aria-label", level ? `${item.name}: ${island2Stage(item.id, level)}. Obejrzyj.` : `Dodaj: ${item.name}`);
  }
  element("island2-skip").hidden = !island2State.busy;
  element("island2-look").disabled = island2State.busy;
  element("island2-motion").setAttribute("aria-pressed", String(island2Paused));
  element("island2-motion").textContent = island2Paused ? "Wznów animacje" : "Pauza animacji";
  island2Renderer.sync({ live: island2CanAnimate() && !element("island2").hidden, levels: l,
    branches: island2State.branches, story: island2Story, busy: island2State.busy, finished: island2State.finished });
  if (!element("island2").hidden) setIslandMusicStage(l.copper >= 3 ? 2 : l.wheel >= 2 ? 1 : 0);
}

const island2Actions = {
  "water-2": { text: "Woda podmywa płytę… Za nią ktoś mieszka!", actor: "scout", to: [225, 325], duration: 1350 },
  "water-3": { text: "Lina i drewniane wrota regulują strumień.", actor: "maker", to: [284, 252], duration: 850 },
  "seeds-2": { text: "Strumień dociera do nasion. Pierwsze listki!", actor: "scout", to: [152, 319], duration: 850 },
  "seeds-3": { text: "Ogródek dojrzał. Zapasy jadą do pracowni.", actor: "gardener", to: [218, 340], duration: 1150, carry: "food" },
  "timber-2": { text: "Jedzenie dla majsterkowicza! Skrzynia staje się warsztatem.", actor: "gardener", to: [274, 374], duration: 1150, carry: "food" },
  "timber-3": { text: "Wieko w górę, boki na podpory… To już kabina windy!", actor: "maker", to: [360, 393], duration: 1600, carry: "tools" },
  "timber-4": { text: "Wciągarka podaje deski. Powstają dach i pomost.", actor: "maker", to: [401, 223], duration: 1800 },
  "wheel-2": { text: "Herbata wypita. Blat dostaje łopatki i wędruje pod strumień!", actor: "scout", to: [179, 405], duration: 1500, carry: "tools" },
  "wheel-3": { text: "Pasek łączy koło ze zwojnicą i magnesem.", actor: "maker", to: [315, 443], duration: 1100, carry: "tools" },
  "wheel-4": { text: "Przekładnia przekazuje ruch do windy i latarni.", actor: "maker", to: [367, 390], duration: 1000 },
  "rope-2": { text: "Majsterkowicz przewleka linę przez bloczek.", actor: "maker", to: [361, 246], duration: 1200, carry: "tools" },
  "rope-3": { text: "Koło ciągnie linę. Pusta wciągarka przechodzi próbę!", actor: "maker", to: [363, 388], duration: 1100 },
  "rope-4": { text: "Deski na pomost, lina za burtę. Można odbierać ładunki!", actor: "gardener", to: [450, 435], duration: 1100, carry: "planks" },
  "copper-2": { text: "W pracowni był magnes! Drut staje się zwojnicą.", actor: "maker", to: [309, 433], duration: 1000, carry: "tools" },
  "copper-3": { text: "Ruch przy magnesie daje prąd. Przewód prowadzi na szczyt.", actor: "maker", to: [339, 423], duration: 950 },
  "glass-2": { text: "Najpierw gładki brzeg. Szkło wymaga kilku etapów pracy.", actor: "scout", to: [248, 364], duration: 900, carry: "tools" },
  "glass-3": { text: "Długie szlifowanie gotowe. Krążek jest teraz soczewką!", actor: "maker", to: [326, 424], duration: 1200, carry: "tools" },
  "glass-4": { text: "Ta sama soczewka jedzie windą na sam szczyt!", actor: "scout", to: [402, 249], duration: 2100 },
  "lamp-2": { text: "Prąd dociera do lampy. Świeci — ale to jeszcze nie wszystko!", actor: "scout", to: [477, 186], duration: 950 },
  "lamp-3": { text: "Mechanizm obraca optykę. Światło omiata zatokę!", actor: "scout", to: [477, 186], duration: 1200 },
};

function island2StartStep(step) {
  element("island2-status").textContent = step.text;
  element("island2-scene").dataset.action = step.key || step.kind;
  if (step.kind === "place") {
    island2Visual[step.id] = 1;
    renderIsland2();
    const nodeId = { timber: "crate", rope: "rope-coil" }[step.id] || step.id;
    const point = [...island2Renderer.entities.get(`i2-${nodeId}`).point];
    island2Move(`i2-${nodeId}`, [[point[0], point[1] - 70], point], 400);
    island2Animate(`i2-${nodeId}`, [{ opacity: 0 }, { opacity: 1 }], 400);
    playSound("island-place");
    return;
  }
  if (step.kind === "grow") {
    const origin = island2Story.people[step.actor];
    const travel = Math.ceil(island2Actor(step.actor, step.to));
    step.duration += travel;
    if (step.carry) island2Carry(step.carry, [[origin[0] + 18, origin[1] - 28], [step.to[0] + 18, step.to[1] - 28]], Math.min(750, step.duration - 300));
    if (step.key === "water-2") {
      element("i2-cave").style.display = "";
      element("i2-stream").style.display = "";
      island2Move("i2-cover", [[0, 0], [-35, 60], [-70, 150]], 1250, undefined, travel);
      island2Animate("i2-cover", [{ opacity: 1 }, { opacity: 0 }], 1250, "ease-in-out", travel);
      element("i2-person-maker").style.display = "";
      island2Renderer.actor("maker", [248, 364], false, travel + 900);
    }
    if (step.key === "seeds-2") {
      element("i2-person-gardener").style.display = "";
      const arrival = island2Actor("gardener", [148, 318]);
      step.duration = Math.max(step.duration, arrival + 350);
    }
    if (step.key === "wheel-2" && island2State.branches.wheel !== "pottery") {
      element("i2-tea").style.display = "none";
      element("i2-table-feet").style.display = "none";
      element("i2-paddles").style.display = "";
      element("i2-waterwheel").style.display = "";
      element("i2-tabletop").style.display = "none";
      island2Move("i2-wheel", [[144, 390], [153, 338], [198, 374]], 1300, undefined, travel);
    }
    if (step.key === "wheel-2" && island2State.branches.wheel === "pottery") {
      element("i2-tea").style.display = "none";
      element("i2-pottery").style.display = "";
      island2Move("i2-wheel", [[144, 390], [210, 387], [273, 366]], 1000, undefined, travel);
      island2Animate("i2-pottery", [{ opacity: 0 }, { opacity: 0, offset: .75 }, { opacity: 1 }], 1300, "ease-in-out", travel);
    }
    if (step.key === "timber-3") {
      element("i2-cabin-detail").style.display = "";
      island2Move("i2-crate", [[286, 355], [315, 343], [389, 381]], 1450, undefined, travel);
    }
    if (step.key === "glass-2") island2Move("i2-glass", [[193, 330], [248, 331], [281, 330]], 800, undefined, travel);
    if (step.key === "glass-3") island2Move("i2-glass", [[281, 330], [318, 348], [347, 359]], 1100, undefined, travel);
    if (step.key === "glass-4") {
      island2Renderer.glass(false, true);
      const offsets = [0, 0.2, 0.82, 1];
      island2Move("i2-crate", [[389, 381], [389, 381], [389, 205], [389, 205]], 2000, offsets, travel);
      island2Move("i2-glass", [[347, 359], [389, 346], [389, 170], [436, 131]], 2000, offsets, travel, "peak");
      island2Story.cabin = [389, 205];
    }
    if (step.key === "timber-4") {
      const offsets = [0, 0.15, 0.78, 1];
      island2Carry("planks", [[389, 346], [389, 346], [389, 205], [415, 234]], 1450, offsets, travel);
      island2Move("i2-crate", [[389, 381], [389, 381], [389, 240], [389, 240]], 1450, offsets, travel);
      island2Story.cabin = [389, 240];
      element("i2-roof").style.display = "";
      island2Animate("i2-roof", [{ opacity: 0 }, { opacity: 0, offset: 0.8 }, { opacity: 1 }], 1750, "ease-in-out", travel);
    }
    return;
  }
  if (step.kind === "signal") {
    island2Story.reaction = true;
    island2Actor("scout", [477, 186], 650);
    if (island2CanAnimate()) playSound("island-signal");
  } else if (step.kind === "sail") {
    island2Move("i2-boat", [island2Story.boat, [567, 379], [566, 476], [480, 478]], 2400);
    island2Story.boat = [480, 478];
  } else if (step.kind === "unload") {
    island2Story.cargo = "moving";
    element("i2-cargo").style.display = "";
    const offsets = [0, 0.18, 0.4, 0.85, 1];
    island2Move("i2-cargo", [[480, 452], [480, 405], [389, 346], [389, 205], [415, 234]], 2200, offsets);
    island2Move("i2-crate", [[389, 381], [389, 381], [389, 381], [389, 240], [389, 240]], 2200, offsets);
    island2Story.cabin = [389, 240];
    island2Actor("maker", [415, 257], 1800);
  } else if (step.kind === "lower") {
    island2Move("i2-crate", [island2Story.cabin, [389, 381]], 700);
    island2Story.cabin = [389, 381];
  } else if (step.kind === "cheer") {
    island2Actor("scout", island2Renderer.nodes.plazaCenter.point);
    island2Actor("maker", island2Renderer.nodes.plazaLeft.point);
    island2Actor("gardener", island2Renderer.nodes.plazaRight.point);
    island2Story.celebrating = true;
    renderIsland2();
    if (!document.hidden) playSound("complete");
  } else if (step.kind === "miss") {
    island2Move("i2-boat", [island2Story.boat, [111, 489], [75, 482]], 1800);
    island2Story.boat = [75, 482];
    island2Actor("scout", [477, 186], 600);
    island2Story.reaction = true;
  } else if (step.kind === "wait") {
    island2Move("i2-boat", [island2Story.boat, [155, 510], [307, 516]], 1800);
    island2Story.boat = [307, 516];
    island2Story.reaction = true;
  } else if (step.kind === "produce") {
    island2Story.producing = true;
    island2Actor("maker", [302, 455], 650);
    island2Actor("gardener", [175, 457], 650);
    island2Actor("scout", [308, 355], 650);
    renderIsland2();
    element("i2-coconut").style.display = "none";
    island2Carry(island2Visual.seeds >= 3 ? "food" : "coconut", [[284, 427], [237, 390], [243, 430]], 1600);
  } else if (step.kind === "tea") {
    island2Actor("scout", [113, 419], 700);
    island2Actor("maker", [169, 430], 700);
    island2Story.reaction = true;
  } else if (step.kind === "pond") {
    step.duration += Math.ceil(island2Actor("gardener", [148, 318]));
    island2Actor("scout", [248, 364]);
    island2Story.reaction = true;
  } else if (step.kind === "pottery") {
    step.duration += Math.ceil(island2Actor("maker", [248, 364]));
    island2Story.reaction = true;
  }
}

function island2CommitStep(step) {
  if (step.kind === "grow") {
    island2Visual[step.id] = step.level;
    if (island2CanAnimate()) playSound(step.id === "lamp" ? "island-signal" : "island-grow");
  }
  if (step.kind === "unload") island2Story.cargo = "unloaded";
  if (step.kind === "cheer") island2Story.celebrating = true;
  island2ClearMotion();
  renderIsland2();
}

function island2Pump() {
  island2Timer = undefined;
  while (island2Queue.length) {
    const step = island2Queue.shift();
    island2Current = step;
    island2StartStep(step);
    if (island2CanAnimate()) {
      island2Timer = window.setTimeout(() => {
        island2CommitStep(step);
        island2Current = undefined;
        island2Pump();
      }, step.duration);
      return;
    }
    island2CommitStep(step);
    island2Current = undefined;
  }
  island2Skipping = false;
  island2State.busy = false;
  renderIsland2();
  if (island2State.order.length === 8) finishIsland2();
  else element("island2-status").textContent = "Co dodasz teraz? Możesz też dotknąć użytego przedmiotu.";
}

function island2Skip() {
  if (!island2State.busy) return;
  island2Skipping = true;
  if (island2Current) island2CommitStep(island2Current);
  island2Current = undefined;
  island2ClearMotion();
  island2Pump();
}

function island2Stage(id, level) {
  if (id === "seeds" && island2State.branches.seeds === "pond") return level >= 2 ? "Staw z liliami i rybkami" : "Nasiona w zalanej ziemi";
  if (id === "wheel" && island2State.branches.wheel === "pottery") return level >= 2 ? "Koło garncarskie" : "Krążek dla garncarza";
  return island2Items.find((item) => item.id === id).stages[level - 1];
}

function island2BranchHint(id) {
  if (id === "seeds" && island2State.branches.seeds === "pond") {
    return "Nasiona trafiły na już zalaną grządkę. Powstał staw zamiast pola. Zmień kolejność zasiewu i doprowadzenia wody.";
  }
  if (id === "wheel" && island2State.branches.wheel === "pottery") {
    return "Krążek trafił do już działającej pracowni. Garncarz zatrzymał go dla siebie. Żeby posłużył za napęd, musi wcześniej dostać inne zadanie.";
  }
  return "";
}

function island2EndingSteps() {
  const levels = island2State.levels;
  const full = island2Items.every((item) => levels[item.id] === item.stages.length);
  island2Story.ending = full ? "beacon" : island2State.branches.seeds === "pond" ? "pond"
    : island2State.branches.wheel === "pottery" ? "pottery" : levels.lamp >= 2 ? "light" : "workshop";
  if (full) return [
    { kind: "signal", text: "Kapitan zauważa obracające się światło. Jest droga do portu!", duration: 900 },
    { kind: "sail", text: "Statek opływa skałę i podchodzi do nowej przystani.", duration: 2500 },
    { kind: "unload", text: "Dźwig odbiera paczkę. Ta sama skrzynia znów pracuje jako winda!", duration: 2300 },
    { kind: "lower", text: "Paczka na tarasie. Pusta kabina wraca po następny ładunek.", duration: 750 },
    { kind: "cheer", text: "Dostawa dotarła na górę. Mała wyspa połączyła się ze światem!", duration: 1000 },
  ];
  if (island2Story.ending === "pond") return [{ kind: "pond", text: "Woda zajęła grządkę. Zamiast zboża mieszkańcy mają staw z rybkami!", duration: 1700 }];
  if (island2Story.ending === "pottery") return [{ kind: "pottery", text: "Garncarz zamienił krążek w koło do lepienia naczyń. Wyspa znalazła inną drogę!", duration: 1700 }];
  if (levels.lamp >= 2) return [{ kind: levels.lamp >= 3 ? "wait" : "miss",
    text: levels.lamp >= 3 ? "Kapitan widzi latarnię, ale bez gotowej przystani czeka na wodzie…"
      : "Lampa świeci, ale soczewka nie dotarła na szczyt. Statek zawraca…", duration: 2100 }];
  return [{ kind: levels.wheel >= 2 ? "produce" : "tea",
    text: levels.wheel >= 2 ? levels.seeds >= 3 ? "Statek jeszcze poczeka. Koło napędza mały młyn — pierwsza mąka!"
      : "Statek jeszcze poczeka. Napędzany kołem tłuczek rozłupuje kokos!"
      : "Nie ma napędu? Za to krążek nadal jest świetnym stolikiem na herbatę.", duration: 2200 }];
}

function pickIsland2(id) {
  if (element("island2").hidden || island2State.busy) return;
  const item = island2Items.find((other) => other.id === id);
  if (!item) {
    notifyCourse("Nie rozpoznano przedmiotu nowej wyspy.");
    return;
  }
  if (island2State.levels[id]) {
    const level = island2State.levels[id];
    element("island2-status").textContent = `${item.name}: ${island2Stage(id, level)}.`;
    playSound("click");
    return;
  }
  if (island2State.finished) return;
  island2Renderer.stopIdle();
  island2State.branches = island2BranchOnPlacement(island2State.levels, island2State.branches, id);
  island2State.order.push(id);
  island2State.placed[id] = island2State.order.length;
  const seeded = { ...island2State.levels, [id]: 1 };
  const result = advanceIsland2(seeded, island2State.placed, island2State.order.length, island2State.branches);
  island2State.levels = result.levels;
  island2State.busy = true;
  island2Queue = [{ kind: "place", id, text: `${item.name} trafia na wyspę.`, duration: 500 }];
  for (const wave of result.waves) for (const change of wave) {
    const key = `${change.id}-${change.level}`;
    const action = { ...island2Actions[key] };
    if (key === "seeds-2" && island2State.branches.seeds === "pond") action.text = "Nasiona wpadły w wodę. W stawie pojawiają się lilie!";
    if (key === "wheel-2" && island2State.branches.wheel === "pottery") {
      action.text = "Garncarz zabiera krążek do pracowni. Będzie na nim lepić naczynia!";
      action.actor = "maker";
      action.to = [248, 364];
      action.carry = undefined;
    }
    island2Queue.push({ kind: "grow", ...change, key, ...action });
    if (key === "glass-4" || key === "timber-4") island2Queue.push({ kind: "lower",
      text: key === "glass-4" ? "Soczewka na miejscu. Kabina wraca na dół." : "Deski na tarasie. Kabina wraca po następny ładunek.", duration: 750 });
  }
  if (island2State.order.length === 8) island2Queue.push(...island2EndingSteps());
  renderIsland2();
  island2Pump();
}

function finishIsland2() {
  if (island2State.finished) return;
  island2State.finished = true;
  const l = island2State.levels;
  const full = island2Story.ending === "beacon";
  const maxed = island2Items.filter((item) => l[item.id] === item.stages.length).length;
  const late = island2Items.filter((item) => {
    if (island2BranchHint(item.id)) return false;
    const rule = item.growth[l[item.id] - 1];
    return rule && 8 - island2State.placed[item.id] < rule.age &&
      Object.entries(rule.needs).every(([id, minimum]) => l[id] >= minimum);
  }).map((item) => item.name);
  element("island2-results").hidden = false;
  element("island2-result-title").textContent = full ? "Witaj w Porcie Świetlików!"
    : island2Story.ending === "pond" ? "Wyspa lilii wodnych" : island2Story.ending === "pottery" ? "Osada garncarzy"
      : island2Story.ending === "light" ? "Światło to nie wszystko" : l.wheel === 1 ? "Herbaciarnia na Skale" : "Wyspa małych rzemieślników";
  const branchAdvice = island2BranchHint("seeds") || island2BranchHint("wheel");
  const advice = full
    ? "Woda, praca mieszkańców, napęd i światło złożyły się w jedną działającą wyspę."
    : branchAdvice || (late.length ? `Wcześniej dodaj: ${late.join(", ")}. Pozostałe przedmioty czekały na ich rozwój.`
      : "Ta wyspa znalazła inne zastosowania. Sprawdź odkryte połączenia poniżej.");
  element("island2-result-text").textContent = `${maxed} / 8 elementów w pełni rozwiniętych. ${advice}`;
  element("island2-status").textContent = full ? "Statek w porcie, dostawa na górze. Udało się!"
    : island2Story.ending === "pond" ? "Powstał staw zamiast pola. Mieszkańcy znaleźli inne zastosowanie!"
      : island2Story.ending === "pottery" ? "Krążek napędza dłonie garncarza, nie latarnię."
        : l.lamp >= 3 ? "Statek widzi światło, ale nie ma gdzie bezpiecznie zacumować."
      : l.lamp >= 2 ? "Lampa działa, ale soczewka nie dotarła na szczyt."
        : l.wheel === 1 ? "Nie powstała latarnia. Za to jest wspólna herbata!"
          : l.seeds >= 3 ? "Młyn działa. Do połączenia ze światem zabrakło latarni."
            : "Napęd rozłupuje kokosy. Na sygnał dla statku jest jeszcze za wcześnie.";
  element("island2-order").textContent = island2State.order.map((id) => island2Items.find((item) => item.id === id).name).join(" → ");
  for (const item of island2Items) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const level = l[item.id];
    summary.textContent = `${item.name} · ${level}/${item.stages.length} — ${island2Stage(item.id, level)}`;
    const explanation = document.createElement("p");
    annotateTerms(explanation, item.explanation, () => island2State.finished);
    details.append(summary, explanation);
    if (level < item.stages.length) {
      const rule = item.growth[level - 1];
      const missing = Object.entries(rule.needs).filter(([id, minimum]) => l[id] < minimum)
        .map(([id]) => island2Items.find((other) => other.id === id).name);
      const hint = document.createElement("p");
      hint.textContent = island2BranchHint(item.id) || (missing.length ? `Nie były jeszcze gotowe: ${missing.join(", ")}.`
        : "Warunki są już gotowe, ale ten przedmiot trafił na wyspę zbyt późno.");
      details.append(hint);
    }
    for (const source of item.sources) {
      const panel = document.createElement("div");
      panel.className = "feedback";
      appendStudySources(panel, questionBank.find((question) => question.id === source), () => island2State.finished);
      details.append(panel);
    }
    element("island2-learning").append(details);
  }
  if (full) celebrate();
  else if (!document.hidden) playSound("finish");
  renderIsland2();
  element("island2-result-title").focus({ preventScroll: true });
}

function startIsland2() {
  island2ClearMotion();
  island2Queue = [];
  island2Current = undefined;
  island2Skipping = false;
  island2State = { levels: emptyIsland2Levels(), placed: {}, order: [], branches: { seeds: "field", wheel: "drive" }, busy: false, finished: false };
  island2Visual = emptyIsland2Levels();
  island2Story = {
    people: { scout: [309, 244], maker: [267, 338], gardener: [439, 301] },
    boat: [523, 341], cabin: [389, 381], cargo: "hidden", ending: "", celebrating: false, producing: false, reaction: false,
  };
  island2Renderer.reset();
  element("island2-results").hidden = true;
  element("island2-explanations").open = false;
  element("island2-learning").replaceChildren();
  showScreen("island2");
  renderIsland2();
  element("island2-status").textContent = "Statek czeka na sygnał. Od czego zaczniemy?";
  element("island2-title").focus({ preventScroll: true });
}

element("island2-art").innerHTML = island2Artwork;
island2Renderer.mount();
for (const item of island2Items) {
  const button = document.createElement("button");
  button.id = `island2-pick-${item.id}`;
  button.type = "button";
  button.dataset.feedbackSound = "";
  button.innerHTML = `<svg viewBox="0 0 32 34" aria-hidden="true" fill="none" stroke="#56786a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg><span>${item.name}</span><small>Dodaj</small>`;
  button.addEventListener("click", () => pickIsland2(item.id));
  element("island2-controls").append(button);
}
for (const id of ["open", "reset", "replay"]) element(`island2-${id}`).addEventListener("click", startIsland2);
element("island2-skip").addEventListener("click", island2Skip);
element("island2-exit").addEventListener("click", () => {
  showScreen("welcome");
  element("island2-open").focus();
});
element("island2-motion").addEventListener("click", () => {
  island2Paused = !island2Paused;
  if (island2Paused) island2Skip();
  renderIsland2();
});
element("island2-look").addEventListener("click", () => {
  island2ClearMotion();
  island2Story.reaction = !island2Story.reaction;
  renderIsland2();
  island2Renderer.stopIdle();
  island2Actor("scout", island2Renderer.nodes.behind.point);
});
document.addEventListener("iskra-screen-change", (event) => {
  if (!island2State || event.detail === "island2") return;
  island2ClearMotion();
  island2Renderer.sync({ live: false, levels: island2Visual, branches: island2State.branches,
    story: island2Story, busy: false, finished: island2State.finished });
  island2Queue = [];
  island2Current = undefined;
  island2State.busy = false;
  element("island2-scene").dataset.live = "false";
});
document.addEventListener("visibilitychange", () => {
  if (!island2State || element("island2").hidden) return;
  if (document.hidden) island2Skip();
  renderIsland2();
});
motionPreference.addEventListener("change", () => {
  if (!island2State) return;
  if (motionPreference.matches) island2Skip();
  renderIsland2();
});
