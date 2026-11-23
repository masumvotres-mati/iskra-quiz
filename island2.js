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
  const age = turn - placed[item.id];
  return { done: Math.min(age, rule.age), total: rule.age,
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
  element("i2-held").innerHTML = kind === "magnet"
    ? '<g id="i2-parcel"><use href="#i2-magnet-token" transform="scale(.8)"/></g>'
    : kind === "planks"
    ? '<g id="i2-parcel" stroke="#886849" stroke-width="2.5" stroke-linejoin="round"><path d="m-20-10 34-13 12 9-35 14Z" fill="#f3cd8c"/><path d="m-20-3 34-13 12 9-35 14Z" fill="#e1ae6f"/><path d="m-20 4 34-13 12 9-35 14Z" fill="#f3cd8c"/><path d="M0-15 9-8v13L0-2Z" fill="#b68e59"/></g>'
    : kind === "food"
    ? '<g id="i2-parcel"><path d="m-10-7 22 5-4 17-20-6Z" fill="#edbe7b" stroke="#806a49" stroke-width="3"/><ellipse cy="-8" rx="9" ry="8" fill="#efb566" stroke="#806a49" stroke-width="2"/></g>'
    : '<g id="i2-parcel" stroke="#67877a" stroke-width="4" stroke-linecap="round"><path d="M-8-7 9 10m-3-22L-7 8"/><path d="m-11-9 7-5 6 7-7 5" fill="#e5be7f"/></g>';
  const carrier = island2Current?.carry === kind ? island2Current.actor : undefined;
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
  show("i2-cave", l.water >= 2 || island2Story.workshopOpen);
  show("i2-cutaway", island2Story.cutawayOpen);
  show("i2-cover", l.water < 2 || island2Story.stoneSaved);
  show("i2-stream", l.water >= 2);
  show("i2-valve", l.water >= 3);
  show("i2-scaffold", l.rope >= 2 && l.timber >= 3);
  show("i2-scaffold-front", l.rope >= 2 && l.timber >= 3);
  show("i2-scaffold-short", l.rope >= 2 && l.timber < 3);
  show("i2-tower", l.timber >= 3);
  show("i2-gallery-rail", l.timber >= 3);
  show("i2-roof", l.timber >= 4);
  show("i2-dock", l.timber >= 4 && l.rope >= 4);
  show("i2-port-rope", l.rope >= 4);
  show("i2-cliff-steps", l.water >= 2);
  show("i2-drive", l.wheel >= 3);
  const pottery = island2State.branches.wheel === "pottery";
  show("i2-wheel-flow", l.wheel >= 2 && !pottery);
  show("i2-bypass-flow", l.wheel < 2 || pottery);
  show("i2-table-feet", l.wheel === 1 || pottery);
  show("i2-tea", l.wheel === 1);
  show("i2-waterwheel", l.wheel >= 2 && !pottery);
  show("i2-tabletop", l.wheel === 1 || pottery);
  show("i2-pottery", l.wheel >= 2 && pottery);
  show("i2-pond", island2State.branches.seeds === "pond" && l.seeds >= 2);
  show("i2-overflow", l.water >= 2 && (l.seeds === 0 || island2State.branches.seeds === "pond"));
  show("i2-cabin-detail", l.timber >= 3);
  show("i2-crate-box", l.timber < 3);
  show("i2-rope-coil", l.rope === 1);
  show("i2-loose-coil", l.copper === 1);
  show("i2-generator", l.copper >= 2);
  show("i2-magnet", island2Story.cutawayOpen && !island2Story.magnetTaken && l.copper < 2);
  show("i2-sparks", l.copper >= 3);
  show("i2-wire", l.copper >= 3);
  show("i2-light-halo", l.lamp >= 2);
  show("i2-bulb", l.lamp >= 2);
  show("i2-lens-rings", l.glass >= 3);
  show("i2-beam", l.lamp >= 3);
  show("i2-production", island2Story.producing);
  show("i2-cargo", island2Story.cargo !== "hidden");
  show("i2-reaction", island2Story.reaction);
  show("i2-person-maker", l.water >= 2 || island2Story.workshopOpen);
  show("i2-person-gardener", l.seeds >= 2);
  show("i2-splash", false);
  show("i2-boat", island2Story.boatSeen);
  show("i2-lily", island2State.branches.seeds === "pond" && l.seeds >= 2);
  show("i2-fish", island2State.branches.seeds === "pond" && l.seeds >= 2);
  show("i2-lily-stem", island2Story.lilyMoved && (!island2Story.leafFlat || island2Story.leafSail));
  show("i2-crate-open", island2Story.crateOpen);
  show("i2-crate-lid", !island2Story.oarStowed && l.timber > 0);
  show("i2-lid-board", !island2Story.oarMade);
  show("i2-lid-paddle", island2Story.oarMade);
  show("i2-gift", island2Story.giftSeen);
  show("i2-crate-ripple", island2Story.crateBoat);
  show("i2-stone-bridge-face", island2Story.bridgeBuilt);
  show("i2-cover-panel", !island2Story.bridgeBuilt);
  show("i2-reflection", false);
  show("i2-pot-tie", pottery && l.wheel >= 3);
  island2Position("i2-cover", island2Story.stonePoint);
  element("i2-cover-panel").setAttribute("transform", island2Story.stoneFlat ? "scale(1 .25)" : "");
  const leafTransform = island2Story.leafSail && island2Renderer.followers.get("i2-lily")?.target === "i2-crate"
    ? "rotate(-35) scale(1.45 2.1)" : island2Story.leafGrown ? "scale(1.45)" : "";
  element("i2-lily-body").setAttribute("transform", leafTransform);
  island2Position("i2-lily", island2Story.leafPoint);
  island2Position("i2-fish", island2Layout.fish);
  element("i2-lid-board").setAttribute("transform", l.timber >= 3 && !island2Story.crateBoat ? "translate(0 -19) scale(1.16)" : "");
  if (l.glass) {
    const age = island2State.order.length - island2State.placed.glass;
    const passes = l.glass >= 3 ? 3 : l.glass >= 2 ? Math.min(2, Math.max(0, age - 1)) : 0;
    [...element("i2-glass-roughness").children].forEach((patch, index) => { patch.style.opacity = index < passes ? "0" : ".8"; });
  }
  const cropAge = l.seeds ? island2State.order.length - island2State.placed.seeds : 0;
  const sprouts = element("i2-seeds").querySelector(".i2-sprouts");
  sprouts.setAttribute("transform", `translate(157 336) scale(1 ${.65 + Math.min(1, cropAge / 4) * .6}) translate(-157 -336)`);
  const timberAge = l.timber ? island2State.order.length - island2State.placed.timber : 0;
  element("i2-saw-cuts").style.opacity = String(Math.min(1, timberAge / 4));
  island2Position("i2-wheel", l.wheel >= 2 ? pottery ? island2Layout.wheelPottery : island2Layout.wheelDrive : island2Layout.wheelRest);
  island2Position("i2-crate", island2Story.crateBoat ? island2Story.craftPoint : l.timber >= 3 ? island2Story.cabin : island2Layout.crateRest);
  island2Position("i2-rope-coil", island2Layout.rope);
  island2Position("i2-copper", island2Layout.copper);
  island2Position("i2-glass", island2Story.glassPoint || (l.glass >= 4 ? island2Layout.glassTop : l.glass >= 3 ? island2Layout.glassReady
    : l.glass >= 2 ? island2Layout.glassRough : island2Layout.glassRest));
  island2Renderer.discPlane("i2-glass", island2Story.glassPlane || "x");
  island2Renderer.glass(l.glass >= 4);
  island2Position("i2-lamp", island2Story.lampPoint || (island2Story.lampRaised ? island2Layout.lamp : island2Layout.lampRest));
  island2Renderer.lamp(island2Story.lampRaised);
  island2Position("i2-boat", island2Story.boat);
  island2Position("i2-cargo", island2Story.cargo === "unloaded" ? island2Layout.cargoLanding : island2Layout.cargoBoat);
  for (const [role, point] of Object.entries(island2Story.people)) island2Position(`i2-person-${role}`, point);
  element("island2-count").textContent = `${island2State.order.length} / 8`;
  element("island2-controls").setAttribute("aria-busy", String(island2State.busy));
  for (const item of island2Items) {
    const button = element(`island2-pick-${item.id}`);
    const level = l[item.id];
    button.disabled = island2State.busy;
    button.classList.toggle("placed", level > 0);
    const track = island2Track(item, island2State.branches);
    const preparation = island2Preparation(item, l, island2State.placed, island2State.order.length, island2State.branches);
    button.classList.toggle("maxed", level === track.stages.length);
    button.querySelector("small").textContent = level ? `${island2State.order.indexOf(item.id) + 1} · ${level === track.stages.length ? "MAX" : `${level}/${track.stages.length}`}` : "Dodaj";
    const work = preparation?.total ? ` Przygotowanie: ${preparation.done} z ${preparation.total} etapów.` : "";
    button.setAttribute("aria-label", level ? `${item.name}: ${island2Stage(item.id, level)}.${work} Obejrzyj.` : `Dodaj: ${item.name}`);
  }
  element("island2-skip").hidden = !island2State.busy;
  element("island2-look").disabled = island2State.busy;
  element("island2-motion").setAttribute("aria-pressed", String(island2Paused));
  element("island2-motion").textContent = island2Paused ? "Wznów animacje" : "Pauza animacji";
  island2Renderer.sync({ live: island2CanAnimate() && !element("island2").hidden, levels: l,
    branches: island2State.branches, story: island2Story, busy: island2State.busy, finished: island2State.finished });
  if (!element("island2").hidden) setIslandMusicStage(l.copper >= 3 || island2Story.sailing || island2Story.tradeDone ? 2 : l.wheel >= 2 ? 1 : 0);
}

const island2Actions = {
  "water-2": { text: "Woda otwiera drogę. Mieszkaniec odsuwa kamienną płytę!", actor: "scout", to: island2Renderer.nodes.cave.point, duration: 1350 },
  "water-3": { text: "Lina i drewniane wrota regulują strumień.", actor: "maker", to: island2Renderer.nodes.spring.point, duration: 850 },
  "seeds-2": { text: "Strumień dociera do nasion. Pierwsze listki!", actor: "scout", to: island2Renderer.nodes.farm.point, duration: 850 },
  "seeds-3": { text: "Ogródek dojrzał. Zapasy jadą do pracowni.", actor: "gardener", to: island2Renderer.nodes.cave.point, duration: 1150, carry: "food" },
  "timber-2": { text: "Jedzenie dla majsterkowicza! Skrzynia dostarcza zapasów.", actor: "gardener", to: island2Renderer.nodes.cave.point, duration: 1150, carry: "food" },
  "timber-3": { text: "Wieko w górę, boki na podpory… To już kabina windy!", actor: "maker", to: island2Renderer.nodes.lift.point, duration: 1600, carry: "tools" },
  "timber-4": { text: "Wciągarka podaje deski. Powstają dach i pomost.", actor: "maker", to: island2Renderer.nodes.balcony.point, duration: 1800 },
  "wheel-2": { text: "Herbata wypita. Blat dostaje łopatki i wędruje pod strumień!", actor: "scout", to: island2Renderer.nodes.wheel.point, duration: 1500, carry: "tools" },
  "wheel-3": { text: "Pasek łączy koło ze zwojnicą i magnesem.", actor: "maker", to: island2Renderer.nodes.generator.point, duration: 1100, carry: "tools" },
  "wheel-4": { text: "Przekładnia przekazuje ruch do windy i latarni.", actor: "maker", to: island2Renderer.nodes.lift.point, duration: 1000 },
  "rope-2": { text: "Majsterkowicz ustawia prowadnice i przewleka linę przez bloczek.", actor: "maker", to: island2Renderer.nodes.lift.point, duration: 1200, carry: "tools" },
  "rope-3": { text: "Koło ciągnie linę. Pusta wciągarka przechodzi próbę!", actor: "maker", to: island2Renderer.nodes.lift.point, duration: 1100 },
  "rope-4": { text: "Deski na pomost, lina za burtę. Można odbierać ładunki!", actor: "gardener", to: island2Renderer.nodes.dock.point, duration: 1100, carry: "planks" },
  "copper-2": { text: "W pracowni był magnes! Drut staje się zwojnicą.", actor: "maker", to: island2Renderer.nodes.generator.point, duration: 1000, carry: "tools" },
  "copper-3": { text: "Ruch przy magnesie daje prąd. Przewód prowadzi na szczyt.", actor: "maker", to: island2Renderer.nodes.generator.point, duration: 950 },
  "glass-2": { text: "Najpierw gładki brzeg. Szkło wymaga kilku etapów pracy.", actor: "scout", to: island2Renderer.nodes.cave.point, duration: 900, carry: "tools" },
  "glass-3": { text: "Długie szlifowanie gotowe. Krążek jest teraz soczewką!", actor: "maker", to: island2Renderer.nodes.landing.point, duration: 1200, carry: "tools" },
  "glass-4": { text: "Ta sama soczewka jedzie windą na sam szczyt!", actor: "scout", to: island2Renderer.nodes.balcony.point, duration: 2100 },
  "lamp-2": { text: "Prąd dociera do lampy. Świeci — ale to jeszcze nie wszystko!", actor: "scout", to: island2Renderer.nodes.lift.point, duration: 950 },
  "lamp-3": { text: "Mechanizm obraca optykę. Światło omiata zatokę!", actor: "scout", to: island2Renderer.nodes.balcony.point, duration: 1200 },
};

function island2StartStep(step) {
  element("island2-status").textContent = step.text;
  element("island2-scene").dataset.action = step.key || step.kind;
  if (step.kind === "scene") {
    element("island2-scene").dataset.action = step.scene;
    island2Cinema.start(step);
    return;
  }
  if (step.kind === "reveal") return;
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
      island2Move("i2-cover", [[0, 0], [-23, 8], [-45, 17]], 1250, undefined, travel);
      island2Animate("i2-cover", [{ opacity: 1 }, { opacity: 0 }], 1250, "ease-in-out", travel);
      element("i2-person-maker").style.display = "";
      island2Renderer.actor("maker", island2Renderer.nodes.cave.point, false, travel + 900);
    }
    if (step.key === "seeds-2") {
      element("i2-person-gardener").style.display = "";
      const arrival = island2Actor("gardener", island2Renderer.nodes.farm.point);
      step.duration = Math.max(step.duration, arrival + 350);
    }
    if (step.key === "rope-2") {
      const frame = island2Visual.timber >= 3 ? "i2-scaffold" : "i2-scaffold-short";
      element(frame).style.display = "";
      island2Animate(frame, [{ opacity: 0 }, { opacity: 1 }], 1000, "ease-in-out", travel);
    }
    if (step.key === "wheel-2" && island2State.branches.wheel !== "pottery") {
      element("i2-tea").style.display = "none";
      element("i2-paddles").style.display = "";
      element("i2-waterwheel").style.display = "";
      island2Animate("i2-waterwheel", [{ opacity: 0 }, { opacity: 1 }], 500, "ease-in-out", travel);
      for (const id of ["i2-table-feet", "i2-tabletop"]) island2Animate(id,
        [{ opacity: 1 }, { opacity: 0 }], 500, "ease-in-out", travel);
      island2Move("i2-wheel", [island2Layout.wheelRest, [244, 409], island2Layout.wheelDrive], 1300, undefined, travel);
    }
    if (step.key === "wheel-2" && island2State.branches.wheel === "pottery") {
      element("i2-tea").style.display = "none";
      element("i2-pottery").style.display = "";
      island2Move("i2-wheel", [island2Layout.wheelRest, [244, 409], island2Layout.wheelPottery], 1000, undefined, travel);
      island2Animate("i2-pottery", [{ opacity: 0 }, { opacity: 0, offset: .75 }, { opacity: 1 }], 1300, "ease-in-out", travel);
    }
    if (step.key === "timber-3") {
      element("i2-cabin-detail").style.display = "";
      island2Animate("i2-crate-box", [{ opacity: 1 }, { opacity: 0 }], 500, "ease-in-out", travel);
      island2Animate("i2-cabin-detail", [{ opacity: 0 }, { opacity: 1 }], 500, "ease-in-out", travel);
      element("i2-tower").style.display = "";
      island2Animate("i2-tower", [{ opacity: 0 }, { opacity: 1 }], 1450, "ease-in-out", travel);
      if (island2Visual.rope >= 2) {
        element("i2-scaffold").style.display = "";
        island2Animate("i2-scaffold", [{ opacity: 0 }, { opacity: 1 }], 1450, "ease-in-out", travel);
        island2Animate("i2-scaffold-short", [{ opacity: 1 }, { opacity: 0 }], 1450, "ease-in-out", travel);
      }
      island2Move("i2-crate", [island2Layout.crateRest, [440, 401], island2Layout.cabinBase], 1450, undefined, travel);
    }
    if (step.key === "glass-2") island2Move("i2-glass", [island2Layout.glassRest, [246, 400], island2Layout.glassRough], 800, undefined, travel);
    if (step.key === "glass-3") island2Move("i2-glass", [island2Layout.glassRough, [354, 396], island2Layout.glassReady], 1100, undefined, travel);
    if (step.key === "glass-4") {
      island2Renderer.glass(false, true);
      const offsets = [0, 0.2, 0.82, 1];
      island2Move("i2-crate", [island2Layout.cabinBase, island2Layout.cabinBase, island2Layout.cabinTop, island2Layout.cabinTop], 2000, offsets, travel);
      island2Move("i2-glass", [island2Layout.glassReady, island2LoadPoint(island2Layout.cabinBase),
        island2LoadPoint(island2Layout.cabinTop), island2Layout.glassTop], 2000, offsets, travel, "peak");
      island2Story.cabin = [...island2Layout.cabinTop];
    }
    if (step.key === "timber-4") {
      const offsets = [0, 0.15, 0.78, 1];
      const base = island2Layout.cabinBase;
      const landing = island2Layout.cabinLanding;
      island2Carry("planks", [island2LoadPoint(base), island2LoadPoint(base), island2LoadPoint(landing), island2Layout.cargoLanding], 1450, offsets, travel);
      island2Move("i2-crate", [base, base, landing, landing], 1450, offsets, travel);
      island2Story.cabin = [...landing];
      element("i2-roof").style.display = "";
      island2Animate("i2-roof", [{ opacity: 0 }, { opacity: 0, offset: 0.8 }, { opacity: 1 }], 1750, "ease-in-out", travel);
    }
    return;
  }
  if (step.kind === "fit-lamp") {
    const travel = Math.ceil(island2Actor("maker", island2Renderer.nodes.lift.point));
    step.duration = travel + 2200;
    const base = island2Layout.cabinBase;
    const top = island2Layout.cabinTop;
    const offsets = [0, .2, .82, 1];
    island2Renderer.lamp(false, true);
    island2Move("i2-crate", [base, base, top, top], 2000, offsets, travel);
    island2Move("i2-lamp", [island2Layout.lampRest, island2LoadPoint(base), island2LoadPoint(top), island2Layout.lamp], 2000, offsets, travel, "peak");
    island2Story.cabin = [...top];
  } else if (step.kind === "signal") {
    island2Story.reaction = true;
    island2Actor("scout", island2Renderer.nodes.balcony.point);
    if (island2CanAnimate()) playSound("island-signal");
  } else if (step.kind === "sail") {
    island2Move("i2-boat", [island2Story.boat, [580, 370], [580, 420], island2Layout.boatDock], 2400);
    island2Story.boat = [...island2Layout.boatDock];
  } else if (step.kind === "unload") {
    island2Story.cargo = "moving";
    element("i2-cargo").style.display = "";
    const offsets = [0, 0.18, 0.4, 0.85, 1];
    const base = island2Layout.cabinBase;
    const landing = island2Layout.cabinLanding;
    island2Move("i2-cargo", [island2Layout.cargoBoat, [537, 402], island2LoadPoint(base),
      island2LoadPoint(landing), island2Layout.cargoLanding], 2200, offsets);
    island2Move("i2-crate", [base, base, base, landing, landing], 2200, offsets);
    island2Story.cabin = [...landing];
    island2Actor("maker", island2Renderer.nodes.balcony.point);
  } else if (step.kind === "lower") {
    island2Move("i2-crate", [island2Story.cabin, island2Layout.cabinBase], 700);
    island2Story.cabin = [...island2Layout.cabinBase];
  } else if (step.kind === "cheer") {
    island2Actor("scout", island2Renderer.nodes.dock.point);
    island2Actor("maker", island2Renderer.nodes.workshop.point);
    island2Actor("gardener", island2Renderer.nodes.farm.point);
    island2Story.celebrating = true;
    renderIsland2();
    if (!document.hidden) playSound("complete");
  } else if (step.kind === "miss") {
    island2Move("i2-boat", [island2Story.boat, [585, 352], island2Layout.boatWaiting], 1800);
    island2Story.boat = [...island2Layout.boatWaiting];
    island2Actor("scout", island2Renderer.nodes.lift.point);
    island2Actor("maker", island2Renderer.nodes.inside.point);
    island2Actor("gardener", island2Renderer.nodes.farm.point);
    island2Story.reaction = true;
  } else if (step.kind === "wait") {
    island2Move("i2-boat", [island2Story.boat, [580, 367], [581, 399]], 1800);
    island2Story.boat = [581, 399];
    island2Actor("maker", island2Renderer.nodes.inside.point);
    island2Actor("gardener", island2Renderer.nodes.farm.point);
    island2Story.reaction = true;
  } else if (step.kind === "produce") {
    island2Story.producing = true;
    island2Actor("maker", island2Renderer.nodes.inside.point);
    island2Actor("gardener", island2Renderer.nodes.farm.point);
    island2Actor("scout", island2Renderer.nodes.cave.point);
    renderIsland2();
  } else if (step.kind === "tea") {
    island2Actor("scout", island2Renderer.nodes.teaLeft.point);
    island2Actor("maker", island2Renderer.nodes.teaRight.point);
    island2Story.reaction = true;
  } else if (step.kind === "pond") {
    step.duration += Math.ceil(island2Actor("gardener", island2Renderer.nodes.farm.point));
    island2Actor("scout", island2Renderer.nodes.spring.point);
    if (island2State.branches.wheel === "pottery") island2Actor("maker", island2Renderer.nodes.potter.point);
    island2Story.reaction = true;
  } else if (step.kind === "pottery") {
    step.duration += Math.ceil(island2Actor("maker", island2Renderer.nodes.potter.point));
    island2Story.reaction = true;
  }
}

function island2CommitStep(step) {
  if (step.kind === "scene") island2Cinema.commit(step);
  if (step.kind === "grow" || step.kind === "reveal") {
    island2Visual[step.id] = step.level;
    if (step.id === "lamp" && step.level >= 2) island2Story.boatSeen = true;
    if (island2CanAnimate()) playSound(step.id === "lamp" ? "island-signal" : "island-grow");
  }
  if (step.kind === "unload") island2Story.cargo = "unloaded";
  if (step.kind === "fit-lamp") island2Story.lampRaised = true;
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
  return island2Track(island2Items.find((item) => item.id === id), island2State.branches).stages[level - 1];
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
    : island2State.branches.wheel === "pottery" && levels.wheel >= 2 ? "pottery" : levels.lamp >= 2 ? "light" : "workshop";
  if (full) return [
    { kind: "signal", text: "Kapitan zauważa obracające się światło. Jest droga do portu!", duration: 900 },
    { kind: "sail", text: "Statek opływa skałę i podchodzi do nowej przystani.", duration: 2500 },
    { kind: "unload", text: "Dźwig odbiera paczkę. Ta sama skrzynia znów pracuje jako winda!", duration: 2300 },
    { kind: "lower", text: "Paczka na tarasie. Pusta kabina wraca po następny ładunek.", duration: 750 },
    { kind: "cheer", text: "Dostawa dotarła na górę. Mała wyspa połączyła się ze światem!", duration: 1000 },
  ];
  const alternate = island2Cinema.ending(levels, island2State.branches);
  if (alternate) return alternate;
  if (island2Story.ending === "pond") return [{ kind: "pond", text: levels.seeds >= 2
    ? "Woda zajęła grządkę. Zamiast zboża mieszkańcy mają staw z liliami!"
    : "Woda zajęła grządkę. Na liście lilii jest jeszcze za wcześnie.", duration: 1700 }];
  if (island2Story.ending === "pottery") return [{ kind: "pottery", text: "Garncarz zamienił krążek w koło do lepienia naczyń. Wyspa znalazła inną drogę!", duration: 1700 }];
  if (levels.lamp >= 2) return [{ kind: levels.lamp >= 3 ? "wait" : "miss",
    text: levels.lamp >= 3 ? "Kapitan widzi latarnię, ale bez gotowej przystani czeka na wodzie…"
      : "Lampa świeci, ale soczewka nie dotarła na szczyt. Statek zawraca…", duration: 2100 }];
  return [{ kind: levels.wheel >= 2 ? "produce" : "tea",
    text: levels.wheel >= 2 ? "Statek jeszcze poczeka. Koło napędza młotek w pracowni!"
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
    const preparation = island2Preparation(item, island2State.levels, island2State.placed,
      island2State.order.length, island2State.branches);
    const clue = preparation?.total && preparation.done < preparation.total
      ? ` Przygotowanie: ${preparation.done}/${preparation.total}. Każdy wybór daje czas na dalszą pracę.`
      : preparation && !preparation.ready ? " Dalsza praca wymaga współpracy z innymi przedmiotami." : "";
    element("island2-status").textContent = `${item.name}: ${island2Stage(id, level)}.${clue}`;
    playSound("click");
    return;
  }
  if (island2State.finished) return;
  const previous = { ...island2State.levels };
  island2Renderer.stopIdle();
  island2State.branches = island2BranchOnPlacement(island2State.levels, island2State.branches, id);
  island2State.order.push(id);
  island2State.placed[id] = island2State.order.length;
  const seeded = { ...island2State.levels, [id]: 1 };
  const result = advanceIsland2(seeded, island2State.placed, island2State.order.length, island2State.branches);
  island2State.levels = result.levels;
  island2State.busy = true;
  island2Queue = [{ kind: "place", id, text: `${item.name} trafia na wyspę.`, duration: 500 }];
  let lampFitted = island2Story.lampRaised;
  const fitLamp = () => {
    island2Queue.push(...island2Cinema.fitLamp(),
      { kind: "lower", text: "Lampa na miejscu. Kabina wraca po następny ładunek.", duration: 750 });
    lampFitted = true;
  };
  const queued = { ...seeded };
  for (const wave of result.waves) for (const change of wave) {
    const key = `${change.id}-${change.level}`;
    if (key === "glass-4" && !lampFitted) fitLamp();
    const action = { ...island2Actions[key] };
    if (key === "seeds-2" && island2State.branches.seeds === "pond") action.text = "Nasiona wpadły w wodę. W stawie pojawiają się lilie!";
    if (key === "wheel-2" && island2State.branches.wheel === "pottery") {
      action.text = "Garncarz zabiera krążek do pracowni. Będzie na nim lepić naczynia!";
      action.actor = "maker";
      action.to = island2Renderer.nodes.wheel.point;
      action.carry = undefined;
    }
    const cinematic = island2Cinema.grow(change, island2State.branches);
    if (cinematic) island2Queue.push(...cinematic);
    else island2Queue.push({ kind: "grow", ...change, key, ...action });
    queued[change.id] = change.level;
    if (key === "wheel-2" && island2State.branches.wheel !== "pottery") {
      island2Queue.push(island2Cinema.scene("wheel-splash", "Koło ruszyło! Trochę zbyt ochoczo…", 900));
    }
    if (key === "glass-4" || key === "timber-4") island2Queue.push({ kind: "lower",
      text: key === "glass-4" ? "Soczewka na miejscu. Kabina wraca na dół." : "Deski na tarasie. Kabina wraca po następny ładunek.", duration: 750 });
  }
  if (!lampFitted && queued.lamp && queued.timber >= 3 && queued.rope >= 3) fitLamp();
  island2Queue.push(...island2Cinema.milestones(queued, island2Story));
  island2Queue.push(...island2Cinema.preparation(previous, queued, island2State.placed,
    island2State.order.length, island2State.branches));
  if (island2State.order.length === 8) island2Queue.push(...island2EndingSteps());
  renderIsland2();
  island2Pump();
}

function finishIsland2() {
  if (island2State.finished) return;
  island2State.finished = true;
  const l = island2State.levels;
  const full = island2Story.ending === "beacon";
  const maxed = island2Items.filter((item) => l[item.id] === island2Track(item, island2State.branches).stages.length).length;
  const late = island2Items.filter((item) => {
    if (island2BranchHint(item.id)) return false;
    const rule = island2Track(item, island2State.branches).growth[l[item.id] - 1];
    return rule && 8 - island2State.placed[item.id] < rule.age &&
      island2NeedsReady(l, rule.needs, island2State.branches);
  }).map((item) => item.name);
  element("island2-results").hidden = false;
  element("island2-result-title").textContent = island2Story.tradeDone
    ? island2Story.leafSail ? "Żeglujący ogrodnicy" : island2Story.craftKind === "leaf" ? "Ogród wypłynął w świat!" : "Mała wyprawa garncarzy"
    : full ? "Witaj w Porcie Świetlików!"
    : island2Story.ending === "pond" ? l.seeds >= 2 ? "Wyspa lilii wodnych" : "Wyspa małego stawu"
      : island2Story.ending === "pottery" ? "Osada garncarzy"
      : island2Story.ending === "light" ? "Światło to nie wszystko" : l.wheel === 1 ? "Herbaciarnia na Skale" : "Wyspa małych rzemieślników";
  const branchAdvice = island2BranchHint("seeds") || island2BranchHint("wheel");
  const advice = island2Story.tradeDone ? "Niezwykła wyprawa wróciła z nowymi nasionami. Inna kolejność tworzy inną historię."
    : full
    ? "Woda, praca mieszkańców, napęd i światło złożyły się w jedną działającą wyspę."
    : branchAdvice || (late.length ? `Wcześniej dodaj: ${late.join(", ")}. Pozostałe przedmioty czekały na ich rozwój.`
      : "Ta wyspa znalazła inne zastosowania. Sprawdź odkryte połączenia poniżej.");
  element("island2-result-text").textContent = `${maxed} / 8 elementów w pełni rozwiniętych. ${advice}`;
  element("island2-status").textContent = island2Story.tradeDone ? "Podarunek dotarł. Teraz ogrodnik ma nowy pomysł!"
    : full ? "Statek w porcie, dostawa na górze. Udało się!"
    : island2Story.ending === "pond" ? "Powstał staw zamiast pola. Mieszkańcy znaleźli inne zastosowanie!"
      : island2Story.ending === "pottery" ? "Krążek napędza dłonie garncarza, nie latarnię."
        : l.lamp >= 3 ? "Statek widzi światło, ale nie ma gdzie bezpiecznie zacumować."
      : l.lamp >= 2 ? "Lampa działa, ale soczewka nie dotarła na szczyt."
        : l.wheel === 1 ? "Nie powstała latarnia. Za to jest wspólna herbata!"
          : "Warsztat pracuje. Do połączenia ze światem zabrakło latarni.";
  element("island2-order").textContent = island2State.order.map((id) => island2Items.find((item) => item.id === id).name).join(" → ");
  for (const item of island2Items) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    const level = l[item.id];
    const track = island2Track(item, island2State.branches);
    summary.textContent = `${item.name} · ${level}/${track.stages.length} — ${island2Stage(item.id, level)}`;
    const explanation = document.createElement("p");
    annotateTerms(explanation, item.explanation, () => island2State.finished);
    details.append(summary, explanation);
    if (level < track.stages.length) {
      const rule = track.growth[level - 1];
      const missing = Object.entries(rule.needs)
        .filter(([id, minimum]) => !island2NeedsReady(l, { [id]: minimum }, island2State.branches))
        .map(([id, minimum]) => id === "wheel" && minimum >= 2 && island2State.branches.wheel === "pottery"
          ? "napęd wodny (krążek został kołem garncarskim)"
          : id === "seeds" && minimum >= 3 && island2State.branches.seeds === "pond"
            ? "zapasy zboża (zamiast pola powstał staw)"
            : island2Items.find((other) => other.id === id).name);
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
  else if (!document.hidden) playSound(island2Story.tradeDone ? "complete" : "finish");
  renderIsland2();
  element("island2-result-title").focus({ preventScroll: true });
}

function startIsland2() {
  island2ClearMotion();
  stopIslandMusic();
  setIslandMusicStage(0);
  island2Queue = [];
  island2Current = undefined;
  island2Skipping = false;
  island2State = { levels: emptyIsland2Levels(), placed: {}, order: [], branches: { seeds: "field", wheel: "drive" }, busy: false, finished: false };
  island2Visual = emptyIsland2Levels();
  island2Story = {
    people: { scout: [...island2Renderer.nodes.spring.point], maker: [...island2Renderer.nodes.inside.point],
      gardener: [...island2Renderer.nodes.rear.point] },
    boat: [...island2Layout.boatWaiting], cabin: [...island2Layout.cabinBase],
    cargo: "hidden", ending: "", celebrating: false, producing: false, reaction: false, lampRaised: false,
    cutawayOpen: false, workshopOpen: false, stoneSaved: false, stoneFlat: false,
    stonePoint: [...island2Layout.coverHome], magnetTaken: false, bridgeBuilt: false, tether: "",
    leafGrown: false, lilyMoved: false, leafFlat: false, leafSail: false, leafPoint: [...island2Layout.lily],
    formsReady: false, crateOpen: false, crateBoat: false, craftKind: "", craftPoint: [...island2Layout.crateRest],
    oarMade: false, oarStowed: false, lidSeat: false, sailing: false, boatSeen: false,
    giftSeen: false, giftReturned: false, tradeDone: false,
  };
  island2Renderer.reset();
  element("island2-results").hidden = true;
  element("island2-explanations").open = false;
  element("island2-learning").replaceChildren();
  showScreen("island2");
  renderIsland2();
  element("island2-status").textContent = "Osiem drobiazgów. Od czego zaczną mieszkańcy?";
  element("island2-title").focus({ preventScroll: true });
}

element("island2-art").innerHTML = island2SceneArtwork;
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
