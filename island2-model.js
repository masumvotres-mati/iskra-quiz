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
    alternate: { id: "pond", growth: [{ age: 1, needs: { water: 1 } }, { age: 3, needs: { water: 2, glass: 2 } }],
      stages: ["Nasiona w zalanej ziemi", "Staw z liliami", "Wielki liść do nowych przygód"] },
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
    alternate: { id: "pottery", growth: [{ age: 1, needs: { timber: 2 } }, { age: 3, needs: { water: 2, rope: 2 } }],
      stages: ["Krążek dla garncarza", "Koło garncarskie", "Gliniane formy związane do transportu"] },
    explanation: "Krążek jest najpierw blatem. Oś i łopatki zmieniają go w koło wodne, a garncarz może wykorzystać go do formowania naczyń. Lepienie, suszenie i wypał to osobne procesy: transport glinianych form nie oznacza, że mokra glina stała się ceramiką. Koła wodne historycznie napędzały m.in. tartaki i młoty.",
    sources: ["history-10", "history-64"] },
  { id: "rope", name: "Lina", icon: '<path d="M22 28V12a7 7 0 0 0-14 0v8a4 4 0 0 0 8 0V10m6 11h6m-6 5h6" fill="none" stroke="#b48b4e" stroke-width="4"/>',
    growth: [{ age: 1, needs: { timber: 2 } }, { age: 2, needs: { wheel: 2 } }, { age: 3, needs: { timber: 3, seeds: 3 } }],
    stages: ["Zwinięta lina", "Bloczek i przeciwwaga", "Wciągarka z napędem", "Dźwig portowy"],
    explanation: "Lina przez bloczek przenosi siłę i zmienia kierunek ciągnięcia. Dopiero koło wodne dostarcza tu energii do podnoszenia. Winda i dźwig to uproszczone, autorskie konstrukcje.",
    sources: ["history-64"] },
  { id: "copper", name: "Drut", icon: '<path d="M4 23h4V11c0-8 7-8 7 0v12c0 7 7 7 7 0V11c0-7 6-7 6 0v12" fill="none" stroke="#dc8763" stroke-width="4"/>',
    growth: [{ age: 0, needs: { timber: 2 } }, { age: 0, needs: { wheel: 3 } }],
    stages: ["Zwój drutu", "Zwojnica i magnes", "Prądnica zasila latarnię"],
    explanation: "Sam miedziany drut nie wytwarza prądu. Mieszkańcy łączą zwojnicę z magnesem znalezionym pod pracownią. Koło dostarcza ruchu; indukcja elektromagnetyczna pozwala zamienić energię mechaniczną w elektryczną.",
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

function island2Track(item, branches) {
  return item.alternate && item.alternate.id === branches[item.id] ? item.alternate : item;
}

function island2NeedsReady(levels, needs, branches) {
  return Object.entries(needs).every(([id, minimum]) => levels[id] >= minimum &&
    !(id === "wheel" && minimum >= 2 && branches.wheel === "pottery") &&
    !(id === "seeds" && minimum >= 3 && branches.seeds === "pond"));
}

function island2Preparation(item, levels, placed, turn, branches) {
  const rule = island2Track(item, branches).growth[levels[item.id] - 1];
  if (!rule || !levels[item.id]) return null;
  return { done: Math.min(turn - placed[item.id], rule.age), total: rule.age,
    ready: island2NeedsReady(levels, rule.needs, branches) };
}

function advanceIsland2(levels, placed, turn, branches = {}) {
  const next = { ...levels };
  const waves = [];
  while (true) {
    const changes = island2Items.filter((item) => {
      const rule = island2Track(item, branches).growth[next[item.id] - 1];
      return next[item.id] > 0 && rule && turn - placed[item.id] >= rule.age &&
        island2NeedsReady(next, rule.needs, branches);
    }).map(({ id }) => ({ id, level: next[id] + 1 }));
    if (!changes.length) break;
    for (const { id, level } of changes) next[id] = level;
    waves.push(changes);
  }
  return { levels: next, waves };
}
