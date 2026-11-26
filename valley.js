"use strict";

const valleyItems = [
  { id: "shovel", name: "Łopata", stages: ["Narzędzie", "Schody w skale", "Podziemny magazyn"],
    growth: [{ age: 1, needs: { timber: 1 } }, { age: 2, needs: { water: 2, timber: 2 } }],
    explanation: "Najpierw mieszkaniec wycina dojście do górnego tarasu. Potem wykorzystuje odsłoniętą warstwę skały na magazyn. Wykopy i zejścia powstają podczas pracy, nie same.", sources: ["history-6"] },
  { id: "water", name: "Woda", stages: ["Dzban przy źródle", "Wykopany dopływ", "Zastawka i nawadnianie"],
    growth: [{ age: 0, needs: { shovel: 1 } }, { age: 1, needs: { timber: 2, rope: 1 } }],
    explanation: "Dzban wskazuje mieszkańcom źródło. Dopiero łopata pozwala wykopać dopływ, a drewno i lina pomagają regulować nurt. Płynąca woda może napędzać koło.", sources: ["history-6", "history-64"] },
  { id: "timber", name: "Deski", stages: ["Materiał na warsztat", "Most nad wąwozem", "Dwie stacje poczty"],
    growth: [{ age: 1, needs: { shovel: 1 } }, { age: 2, needs: { rope: 2, wheel: 2 } }],
    explanation: "Te same deski najpierw tworzą warsztat, potem most i podpory poczty. Most jest prawdziwą drogą mieszkańców między dwoma tarasami.", sources: ["history-4"] },
  { id: "wheel", name: "Krążek", stages: ["Drewniany krążek", "Wybrane zastosowanie", "Gotowy transport"],
    growth: [{ age: 1, needs: { timber: 1 } }, { age: 2, needs: { rope: 2, water: 3 } }],
    explanation: "Przy pierwszej budowie mieszkaniec sprawdza, czy jest gotowy nurt. Jeśli tak, montuje łopatki koła wodnego. Bez nurtu robi koła wózka. Gotowe urządzenie nie zmienia roli bez przebudowy.", sources: ["history-10", "history-64"] },
  { id: "rope", name: "Lina", stages: ["Zwój", "Liny mostu", "Pętla kolejki"],
    growth: [{ age: 0, needs: { timber: 2 } }, { age: 1, needs: { timber: 3, wheel: 3 } }],
    explanation: "Lina wzmacnia most i biegnie między stacjami. W wariancie wodnym koło porusza zamkniętą pętlą, która niesie kosz. Sama lina nie dostarcza energii.", sources: ["history-64"] },
  { id: "seeds", name: "Nasiona", stages: ["Zasiew", "Zielony ogród", "Kwiaty i nowe nasiona"],
    growth: [{ age: 1, needs: { water: 2 } }, { age: 3, needs: { glass: 2, water: 3 } }],
    explanation: "Mieszkaniec sieje poza kanałem i doprowadza wodę do korzeni. Czas, nawodnienie i gotowa szklarnia pozwalają rozwinąć ogród. To umowne reguły tej baśniowej doliny, nie instrukcja uprawy.", sources: ["history-4", "history-6"] },
  { id: "glass", name: "Szkło", stages: ["Tafle", "Szklarnia na tarasie", "Kwitnąca szklarnia"],
    growth: [{ age: 0, needs: { timber: 2 } }, { age: 0, needs: { seeds: 3, water: 3 } }],
    explanation: "Tafle są oglądane od razu, a po zbudowaniu mostu przenoszone do ram szklarni. Szkło przepuszcza światło, nie jest źródłem energii. W tej grze chroni młode rośliny.", sources: ["history-22"] },
  { id: "cloth", name: "Płótno", stages: ["Złożona tkanina", "Dach nad ładunkiem", "Poczta ogrodników"],
    growth: [{ age: 0, needs: { timber: 3, rope: 2 } }, { age: 0, needs: { rope: 3, seeds: 3 } }],
    explanation: "Płótno chroni zapasy i mieszkańców. Przy ręcznym wózku powstaje osłonięte miejsce pakowania, a przy kolejce zadaszona stacja i kosz. Transport łączy warsztat i ogród na drugim tarasie.", sources: ["history-4"] },
];

function emptyValleyLevels() {
  return Object.fromEntries(valleyItems.map(({ id }) => [id, 0]));
}

function advanceValley(levels, placed, turn, branch = "") {
  const next = { ...levels }, changes = [];
  let mode = branch;
  while (true) {
    const canalPending = next.water === 1 && next.shovel > 0;
    if (next.wheel === 1 && !mode && turn - placed.wheel >= 1 && next.timber &&
        !canalPending) mode = next.water >= 2 ? "water" : "cart";
    const wave = valleyItems.filter((item) => {
      if (!next[item.id] || item.id === "wheel" && !mode) return false;
      const rule = item.id === "wheel" && next.wheel === 2 && mode === "cart"
        ? { age: 2, needs: { seeds: 2, cloth: 2 } } : item.growth[next[item.id] - 1];
      return rule && turn - placed[item.id] >= rule.age &&
        Object.entries(rule.needs).every(([id, level]) => next[id] >= level);
    }).map(({ id }) => ({ id, level: next[id] + 1 }));
    if (!wave.length) break;
    wave.forEach((change) => { next[change.id] = change.level; changes.push(change); });
  }
  return { levels: next, branch: mode, changes };
}

const valley = (() => {
  const ns = "http://www.w3.org/2000/svg";
  const scale = .68;
  const points = {
    source: [173, 281], garden: [144, 352], bench: [251, 362], wheel: [315, 351],
    station: [328, 343], far: [455, 284], greenhouse: [483, 279],
  };
  const rests = {
    shovel: [111, 323], water: [165, 281], timber: [263, 357], wheel: [301, 321],
    rope: [321, 308], seeds: [135, 338], glass: [195, 366], cloth: [307, 355],
  };
  const locations = { shovel: "source", water: "source", timber: "bench", wheel: "wheel",
    rope: "station", seeds: "garden", glass: "greenhouse", cloth: "station" };
  const roles = { shovel: "scout", water: "scout", timber: "maker", wheel: "maker",
    rope: "maker", seeds: "gardener", glass: "scout", cloth: "gardener" };
  const grips = { shovel: [0, -16], water: [-6, -16], timber: [7, -6], wheel: [0, -12],
    rope: [8, -5], seeds: [0, -8], glass: [-8, -10], cloth: [-10, -8], parcel: [0, -8] };
  const twoHanded = new Set(["prop-timber", "prop-glass", "prop-cloth"]);
  const actors = {};
  let state;
  let visual;
  let queue = [];
  let current;
  let frame;
  let ambient;
  let generation = 0;
  let paused = false;
  let skipping = false;
  let built;
  let parcelOwner = "";
  let rotor = 0;
  let lastFrame = 0;
  let stepSerial = 0;
  const node = (id) => document.getElementById(`v-${id}`);
  const smooth = (t) => t * t * (3 - 2 * t);
  const mix = (a, b, t) => a.map((n, i) => n + (b[i] - n) * t);
  const animated = () => !paused && !skipping && !motionPreference.matches && !document.hidden &&
    !element("island").hidden;
  const sound = (name) => { if (animated()) playSound(name); };
  const make = (tag, attrs = {}) => {
    const result = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([name, value]) => result.setAttribute(name, value));
    return result;
  };
  function show(id, visible) {
    node(id).style.display = visible ? "" : "none";
  }
  function sort() {
    const world = node("world");
    [...world.children].sort((a, b) => +a.dataset.depth - +b.dataset.depth)
      .forEach((child) => world.append(child));
  }
  function position(id, point, depth = point[1]) {
    const target = node(id);
    target.setAttribute("transform", `translate(${point.join(" ")})`);
    target.dataset.depth = depth;
  }
  function hand(role, side) {
    const actor = actors[role], point = actor[side];
    return [actor.point[0] + point[0] * scale, actor.point[1] + point[1] * scale];
  }
  function carriedPoint(role, id) {
    const grip = grips[id.replace("prop-", "")];
    return hand(role, "front").map((n, i) => n - grip[i]);
  }
  function worldPoint(id) {
    let matrix = new DOMMatrix();
    for (let part = node(id); part.tagName !== "svg"; part = part.parentElement) {
      const local = part.transform?.baseVal.consolidate()?.matrix;
      if (local) matrix = new DOMMatrix([local.a, local.b, local.c, local.d, local.e, local.f]).multiply(matrix);
    }
    return [matrix.e, matrix.f];
  }
  function contactOverlay(role, visible, both = twoHanded.has(actors[role].carry)) {
    const actor = actors[role], overlay = node(`contact-${role}`);
    overlay.replaceChildren();
    overlay.dataset.depth = actor.point[1] + .9;
    if (visible) for (const side of both ? ["front", "back"] : ["front"]) {
      const [cx, cy] = hand(role, side);
      overlay.append(make("circle", { cx, cy, r: 2 }));
    }
  }
  function touch(role, id) {
    const actor = actors[role], root = worldPoint(id), grip = grips[id.replace("prop-", "")];
    const front = root.map((n, i) => (n + grip[i] - actor.point[i]) / scale);
    arm(actor, "front", front);
    if (twoHanded.has(id)) arm(actor, "back", [front[0] - actor.direction * 5, front[1] + 1]);
    contactOverlay(role, true, twoHanded.has(id));
  }
  function arm(actor, side, contact) {
    const shoulder = [side === "front" ? 6 : -6, -31];
    const dx = contact[0] - shoulder[0], dy = contact[1] - shoulder[1];
    const span = Math.hypot(dx, dy);
    if (!Number.isFinite(span) || span > 28.05) throw new Error(`Chwyt poza zasięgiem: ${actor.node.id}, ${side}, ${span.toFixed(1)}.`);
    const bend = Math.sqrt(Math.max(0, 196 - span * span / 4));
    const sign = side === "front" ? 1 : -1;
    const ux = span > .001 ? dx / span : 1, uy = span > .001 ? dy / span : 0;
    const elbow = [shoulder[0] + dx / 2 - uy * bend * sign,
      shoulder[1] + dy / 2 + ux * bend * sign];
    actor.node.querySelector(`.v-arm-${side}`).setAttribute("d",
      `M${shoulder.join(" ")}L${elbow.join(" ")}L${contact.join(" ")}`);
    actor.node.querySelector(`.v-hand-${side}`).setAttribute("transform", `translate(${contact.join(" ")})`);
    actor[side] = contact;
  }
  function pose(role, mode = "idle", phase = 0) {
    const actor = actors[role], swing = Math.sin(phase), d = actor.direction;
    for (const [side, sign] of [["front", 1], ["back", -1]]) {
      const step = mode === "walk" ? swing * sign * 7 : 0;
      actor.node.querySelector(`.v-leg-${side}`).setAttribute("d",
        `M${sign * 4}-13Q${sign * 6 + step / 2} -7 ${sign * 6 + step} ${-1 - Math.max(0, step) * .3}`);
      const held = actor.carry ? side === "front" || twoHanded.has(actor.carry) : mode === "offer";
      const contact = held ? [d * (side === "front" ? 18 : 13), -21]
        : mode === "work" || mode === "dig" ? [d * (14 + swing * 2), -21 + swing * 3]
          : [sign * 12 - (mode === "walk" ? step * .7 : 0), -19];
      arm(actor, side, contact);
    }
    actor.pose = mode;
    actor.node.dataset.pose = mode;
    if (actor.carry) {
      position(actor.carry, carriedPoint(role, actor.carry), actor.point[1] + .3);
    }
    if (parcelOwner === role) position("parcel", carriedPoint(role, "parcel"), actor.point[1] + .5);
    contactOverlay(role, actor.carry || parcelOwner === role);
  }
  function actorAt(role, point, mode = "idle", phase = 0) {
    const actor = actors[role];
    if (Math.abs(point[0] - actor.point[0]) > .05) actor.direction = point[0] < actor.point[0] ? -1 : 1;
    actor.point = [...point];
    position(`person-${role}`, point);
    pose(role, mode, phase);
  }
  function route(from, to) {
    const a = from[0] > 398, b = to[0] > 398;
    if ((a || b) && !built.bridge) throw new Error("Brak mostu między tarasami.");
    let path;
    if (a !== b) {
      path = a ? [from, [420, 270], [350, 323], ...route([350, 323], to).slice(1)]
        : [...route(from, [350, 323]), [420, 270], to];
    } else if (a) path = [from, [462, 274], to];
    else {
      const highFrom = from[1] < 300, highTo = to[1] < 300;
      if (highFrom && highTo) return [from, to];
      const ground = { garden: [144, 352], west: [180, 365], front: [232, 382],
        bench: [267, 365], north: [178, 318], stair: [231, 315], bank: [263, 330],
        crossing: [291, 343], wheel: [315, 351], station: [328, 343] };
      const links = [["garden", "west"], ["west", "front"], ["front", "bench"],
        ["garden", "north"], ["north", "stair"], ["stair", "bank"], ["bench", "bank"],
        ["bank", "crossing"], ["crossing", "wheel"], ["wheel", "station"]];
      const nearest = (point) => Object.keys(ground).reduce((best, id) =>
        Math.hypot(...ground[id].map((n, i) => n - point[i])) <
          Math.hypot(...ground[best].map((n, i) => n - point[i])) ? id : best, "garden");
      const start = highFrom ? "stair" : nearest(from), end = highTo ? "stair" : nearest(to);
      const pending = [[start]], visited = new Set([start]);
      let chain;
      while (pending.length) {
        const candidate = pending.shift(), last = candidate.at(-1);
        if (last === end) { chain = candidate; break; }
        for (const [a, b] of links) {
          const next = a === last ? b : b === last ? a : undefined;
          if (next && !visited.has(next)) { visited.add(next); pending.push([...candidate, next]); }
        }
      }
      if (!chain) throw new Error("Nie ma suchego dojścia do wybranego miejsca.");
      path = [from, ...(highFrom ? [[269, 273]] : []), ...chain.map((id) => ground[id]),
        ...(highTo ? [[269, 273]] : []), to];
    }
    return path.filter((point, index) => !index || Math.hypot(point[0] - path[index - 1][0], point[1] - path[index - 1][1]) > .1);
  }
  function add(label, text, duration, update = () => {}, finish = () => {}) {
    queue.push(() => ({ label, text, duration, update, finish }));
  }
  function walk(role, to, text, carry) {
    queue.push(() => {
      const actor = actors[role], path = route(actor.point, to);
      if (carry) actor.carry = carry;
      const lengths = path.slice(1).map((point, i) => Math.hypot(point[0] - path[i][0], point[1] - path[i][1]));
      const total = lengths.reduce((a, b) => a + b, 0);
      return { label: "walk", text, duration: Math.max(200, total * 7), update(t) {
        let distance = smooth(t) * total, index = 0;
        while (index < lengths.length - 1 && distance > lengths[index]) distance -= lengths[index++];
        const point = lengths.length ? mix(path[index], path[index + 1], distance / Math.max(.001, lengths[index])) : to;
        actorAt(role, point, "walk", t * total / 5);
        sort();
      }, finish() { actorAt(role, to, "offer"); } };
    });
  }
  function work(role, text, duration = 850, update = () => {}) {
    add("work", text, duration, (t) => { pose(role, "work", t * 18); update(t); }, () => pose(role));
  }
  function take(role, id, text) {
    queue.push(() => {
      const from = node(id).transform.baseVal.consolidate().matrix;
      const origin = [from.e, from.f];
      actors[role].direction = origin[0] < actors[role].point[0] ? -1 : 1;
      pose(role, "offer");
      const target = carriedPoint(role, id);
      return { label: "take", text, duration: 350, update(t) {
        position(id, mix(origin, target, smooth(t)), actors[role].point[1] + .3);
        touch(role, id);
      }, finish() { actors[role].carry = id; pose(role, "offer"); sort(); } };
    });
  }
  function put(role, id, to, text, hide = false) {
    queue.push(() => {
      const from = worldPoint(id);
      actors[role].carry = "";
      actors[role].direction = to[0] + grips[id.replace("prop-", "")][0] < actors[role].point[0] ? -1 : 1;
      pose(role, "offer");
      return { label: "put", text, duration: 350, update(t) {
        position(id, mix(from, to, smooth(t)), actors[role].point[1] + .3);
        touch(role, id);
      }, finish() { position(id, to); if (hide) show(id, false); pose(role); sort(); } };
    });
  }
  function build(id, role, text, duration = 1000) {
    queue.push(() => {
      const target = node(id), before = target.getAttribute("clip-path");
      target.style.display = "";
      const box = target.getBBox();
      target.setAttribute("clip-path", "url(#v-build-mask)");
      const mask = document.querySelector("#v-build-mask rect");
      return { label: `build-${id}`, text, duration, update(t) {
        pose(role, "work", t * 18);
        mask.setAttribute("x", box.x - 3);
        mask.setAttribute("y", box.y - 3);
        mask.setAttribute("width", (box.width + 6) * smooth(t));
        mask.setAttribute("height", box.height + 6);
      }, finish() {
        if (before) target.setAttribute("clip-path", before); else target.removeAttribute("clip-path");
        pose(role);
      } };
    });
  }
  function upgrade(id, level) {
    queue.push(() => {
      visual[id] = level;
      render();
      sound(level === 3 ? "island2-max" : "island2-level");
      const button = element(`valley-pick-${id}`);
      button.classList.add("upgrading");
      return { label: "upgrade", text: `${valleyItems.find((item) => item.id === id).name}: ${valleyItems.find((item) => item.id === id).stages[level - 1]}.`,
        duration: 650, update(t) {
        const focus = { shovel: level === 2 ? [250, 300] : [170, 424], water: [191, 270],
          timber: level === 2 ? [383, 297] : [345, 297], wheel: state.branch === "water" ? [291, 327] : [287, 343],
          rope: [395, 239], seeds: [153, 326], glass: [515, 249],
          cloth: state.branch === "water" ? [345, 287] : [166, 323] };
        const [x, y] = focus[id];
        node("effects").innerHTML = `<ellipse cx="${x}" cy="${y - 14}" rx="${18 + 25 * t}" ry="${22 + 15 * t}" fill="url(#v-gold)" opacity="${1 - t}"/>
          <ellipse cx="${x}" cy="${y}" rx="${8 + t * 25}" ry="${(8 + t * 25) * .45}" fill="none" stroke="#ffe189" stroke-width="${3 - t}" opacity="${1 - t}"/>
          ${Array.from({ length: level === 3 ? 8 : 5 }, (_, index) => {
            const angle = index * Math.PI * 2 / (level === 3 ? 8 : 5), spread = 12 + smooth(t) * 23;
            return `<path d="M0-4 1-1 4 0 1 1 0 4-1 1-4 0-1-1Z" transform="translate(${x + Math.cos(angle) * spread} ${y - 17 + Math.sin(angle) * spread * .8})"
              fill="#fff3a2" opacity="${1 - t}"/>`;
          }).join("")}`;
      }, finish() {
        button.classList.remove("upgrading");
        node("effects").replaceChildren();
        render();
      } };
    });
  }
  function placement(id) {
    const item = valleyItems.find((entry) => entry.id === id), role = roles[id], rest = rests[id];
    add("place", `${item.name} trafia na dolny taras.`, 400, (t) => {
      show(`prop-${id}`, true);
      position(`prop-${id}`, [rest[0], rest[1] - (1 - smooth(t)) * 55], rest[1]);
    }, () => { visual[id] = 1; sound("island-place"); render(); });
    const grip = grips[id], reach = [rest[0] + grip[0] - 18 * scale, rest[1] + grip[1] + 21 * scale];
    walk(role, reach, "Mieszkaniec podchodzi obejrzeć nowy przedmiot.");
    if (id === "shovel") {
      take(role, "prop-shovel", "Chwyta trzonek łopaty.");
      walk(role, points.source, "Przy górnym tarasie widać wilgotną szczelinę.");
      work(role, "Odsłania szczelinę. Woda będzie potrzebna do sprawdzenia źródła.");
      put(role, "prop-shovel", [points.source[0] + 13, points.source[1] - 3], "Łopata zostaje obok planowanego wykopu.");
    } else if (id === "seeds") {
      take(role, "prop-seeds", "Zabiera woreczek z nasionami.");
      walk(role, points.garden, "Zasiew powstanie na suchym brzegu, nie w kanale.");
      build("bed", role, "Mieszkaniec przygotowuje ziemię i sieje między bruzdami.", 1000);
      put(role, "prop-seeds", [133, 345], "Woreczek z resztą nasion spoczywa obok grządki.");
      add("sown", "Teraz przyda się nawodnienie.", 150, () => {}, () => { built.bed = true; });
    } else if (id === "timber") {
      take(role, "prop-timber", "Deski trzeba najpierw przenieść do warsztatu.");
      walk(role, points.bench, "Mieszkaniec niesie drewno obiema dłońmi.");
      put(role, "prop-timber", [253, 353], "Deski leżą przy miejscu pracy.");
      build("workshop", role, "Z zapasowych bloczków i desek powstaje mały warsztat.", 1000);
      add("workshop-ready", "Warsztat jest gotowy.", 100, () => {}, () => { built.workshop = true; });
    } else {
      work(role, id === "glass" ? state.levels.timber >= 2
        ? "Od razu czyści i sprawdza tafle. Gotowy most pozwoli od razu przenieść je do szklarni."
        : "Od razu czyści i sprawdza krawędzie tafli. Do przeniesienia ich na drugi taras potrzebny będzie most."
        : id === "wheel" ? "Sprawdza oś krążka i spogląda na planowany odpływ."
          : id === "water" ? "Zagląda do wilgotnej szczeliny. Dzban pomaga zauważyć źródło, ale kanał trzeba wykopać."
            : id === "rope" ? "Rozwija koniec liny i mierzy odległość do drugiego tarasu."
              : "Rozwija róg tkaniny i sprawdza, jak osłonić przyszły ładunek.", 750);
    }
  }
  function change({ id, level }) {
    const role = roles[id];
    if (id === "water" && level === 2) {
      walk(role, points.source, "Jest łopata i woda. Można otworzyć dopływ.");
      take(role, "prop-shovel", "Narzędzie wraca do dłoni.");
      work(role, "Łopata otwiera nieckę źródła.", 800, (t) => {
        show("source", true); node("source").style.opacity = String(smooth(t));
      });
      add("dig-channel", "Mieszkaniec wykopuje kanał. Woda wypełnia wykop za nim.", 2200, (t) => {
        show("channel", true);
        node("channel").setAttribute("clip-path", "url(#v-build-mask)");
        const mask = document.querySelector("#v-build-mask rect");
        mask.setAttribute("x", 170); mask.setAttribute("y", 250);
        mask.setAttribute("width", 155); mask.setAttribute("height", 125 * smooth(t));
        const path = [[173, 281], [269, 273], [231, 315], [317, 351]];
        const part = Math.min(2, Math.floor(t * 3)), progress = Math.min(1, t * 3 - part);
        actorAt(role, mix(path[part], path[part + 1], smooth(progress)), "dig", t * 30);
        sort();
      }, () => {
        built.channel = true; node("channel").removeAttribute("clip-path"); show("fall", true);
        sound("island2-flow");
      });
      put(role, "prop-shovel", [329, 350], "Łopata spoczywa na suchym brzegu.");
    } else if (id === "water" && level === 3) {
      walk(role, [201, 289], "Do brzegów źródła można przytwierdzić zastawkę.");
      build("sluice", role, "Montuje drewnianą zastawkę i wiąże jej uchwyt liną.", 1000);
      add("sluice-ready", "Przepływ jest pod kontrolą.", 100, () => {}, () => { built.sluice = true; });
    } else if (id === "shovel") {
      walk(role, level === 2 ? [253, 302] : [201, 378], level === 2
        ? "Cięższe materiały trzeba bezpiecznie wnieść na górny taras."
        : "Pod ogrodem można urządzić chłodny magazyn na zapasy.");
      build(level === 2 ? "stairs" : "tunnel", role, level === 2
        ? "Kolejne stopnie zostają wykute w skale." : "Wykop odsłania wnętrze skały, podłogę i drewniane podpory.", 1300);
      add("terrain-ready", "Przebudowa zostaje częścią doliny.", 100, () => {}, () => {
        built[level === 2 ? "stairs" : "tunnel"] = true;
      });
    } else if (id === "timber" && level === 2) {
      walk(role, [337, 330], "Warsztat przygotowuje przejście nad wąwozem.");
      build("bridge", role, "Deski trafiają kolejno między skalne brzegi.", 1700);
      add("bridge-ready", "Most jest gotowy. Teraz można dojść na drugi taras.", 100, () => {}, () => { built.bridge = true; });
    } else if (id === "timber") {
      walk(role, points.station, "Poczta potrzebuje dwóch solidnych stacji.");
      build("station", role, "Majster ustawia dolną podporę i koło prowadzące.", 1100);
      walk(role, points.far, "Drugą podporę trzeba zanieść przez most.");
      build("remote", role, "Po drugiej stronie powstaje druga stacja.", 1100);
      add("stations-ready", "Obie podpory stoją na skale.", 100, () => {}, () => { built.stations = true; });
    } else if (id === "wheel" && level === 2) {
      walk(role, points.wheel, state.branch === "water" ? "Przy odpływie jest już nurt. Krążek może dostać łopatki."
        : "Nurt jeszcze nie płynie. Krążek przyda się do wózka.");
      build(state.branch === "water" ? "wheel" : "cart", role, state.branch === "water"
        ? "Oś spoczywa na podporach, a łopatki schodzą w płynącą wodę."
        : "Majster osadza koła na osi i mocuje do nich skrzynię.", 1400);
      add("wheel-ready", "Urządzenie zachowa wybrane zastosowanie.", 100, () => {}, () => {
        built.wheel = true; show("prop-wheel", false);
        startAmbient();
      });
    } else if (id === "rope" && level === 2) {
      walk(role, points.station, "Lina wzmocni przejście nad wąwozem.");
      work(role, "Przywiązuje pierwszy koniec do drewnianej podpory.");
      walk(role, points.far, "Przenosi wolny koniec przez istniejący most.");
      work(role, "Napina linę po drugiej stronie mostu.");
      add("rope-ready", "Oba brzegi są połączone.", 100, () => {}, () => { built.ropes = true; });
    } else if (id === "glass" && level === 2) {
      const grip = grips.glass, rest = rests.glass;
      walk(role, [rest[0] + grip[0] - 18 * scale, rest[1] + grip[1] + 21 * scale], "Most jest gotowy. Można zabrać przygotowane tafle.");
      take(role, "prop-glass", "Obiema dłońmi chwyta brzeg szkła.");
      walk(role, points.greenhouse, "Niesie szkło przez most do ram na słonecznym tarasie.");
      put(role, "prop-glass", [504, 267], "Tafle opierają się o podstawę szklarni.", true);
      add("show-glass", "Ramy czekają na ostatnie tafle.", 100, () => {}, () => { visual.glass = 2; render(); });
      build("greenhouse", role, "Tafle wypełniają ramy. Widać dach, boki i grubość podstawy.", 1500);
      add("glass-ready", "Szklarnia jest gotowa.", 100, () => {}, () => { built.greenhouse = true; });
    } else if (id === "rope" && level === 3) {
      walk(role, points.station, state.branch === "water" ? "Napęd może teraz poruszać pętlą liny."
        : "Lina przyda się do zabezpieczenia ładunku wózka.");
      if (state.branch === "water") {
        build("cable", role, "Łączy koła prowadzące pętlą i zakłada przekładnię od koła wodnego.", 1100);
        build("gondola", role, "Drewniany kosz zostaje zawieszony na pętli.", 1000);
      } else work(role, "Wiąże ładunek do skrzyni. Wózek pozostaje ręcznym transportem.");
      add("transport-ready", "Poczta ma już czym przewozić nasiona.", 100, () => {}, () => { built.transport = true; });
    } else if (id === "cloth" && level === 2) {
      const grip = grips.cloth, rest = rests.cloth;
      walk(role, [rest[0] + grip[0] - 18 * scale, rest[1] + grip[1] + 21 * scale], "Tkaninę trzeba przenieść do miejsca montażu.");
      take(role, "prop-cloth", "Chwyta złożone płótno.");
      walk(role, state.branch === "cart" ? [148, 352] : points.station, "Niesie materiał do miejsca montażu.");
      put(role, "prop-cloth", state.branch === "cart" ? [164, 348] : [345, 325], "Układa tkaninę przy podporze.", true);
      if (state.branch === "cart") {
        add("show-awning", "Powstanie osłona dla ogrodników i ładunku.", 100, () => {}, () => { visual.cloth = 2; render(); });
        build("awning", role, "Rozciąga płótno na drewnianych słupkach przy ogrodzie.", 1000);
      } else work(role, "Przywiązuje osłonę do gotowej stacji. Reszta płótna osłoni kosz.", 1000);
      add("cloth-ready", "Materiał ma teraz podpory zamiast unosić się nad ziemią.", 100, () => {}, () => { built.cloth = true; });
    } else if (id === "seeds") {
      walk(role, points.garden, level === 2 ? "Woda dotarła do korzeni." : "Ogród dostaje wodę, czas i miejsce dla nowych sadzonek.");
      work(role, level === 2 ? "Ogrodnik dogląda pierwszych kiełków." : "Kwiaty się otwierają. Do woreczka trafiają nowe nasiona.", 1300,
        (t) => {
          document.querySelectorAll(".v-sprout,.v-flower").forEach((plant) => {
            if (plant.classList.contains(level === 2 ? "v-sprout" : "v-flower")) {
              plant.style.display = ""; plant.setAttribute("transform", `scale(1 ${.1 + .9 * smooth(t)})`);
            }
          });
        });
    } else {
      walk(role, points[locations[id]], id === "water" ? "Regulacja nurtu ułatwi podlewanie i napęd."
        : id === "glass" ? "Do gotowej szklarni trafiają kwitnące sadzonki." : "Można dokończyć przygotowanie poczty.");
      work(role, id === "water" ? "Montuje drewnianą zastawkę i wiąże jej uchwyt liną."
        : id === "wheel" ? state.branch === "water" ? "Zakłada przekładnię na oś koła." : "Sprawdza koła i wiąże skrzynię."
          : id === "glass" ? "Ogrodnik ustawia sadzonki na podłodze szklarni." : "Ostatnie wiązania są gotowe.", 1000);
    }
    upgrade(id, level);
  }
  function parcelTrip() {
    const water = state.branch === "water" && built.transport;
    const to = water ? [330, 319] : [270, 347];
    walk("gardener", points.garden, "Ogród ma nasiona na pierwszą dostawę.");
    add("parcel-take", "Ogrodnik podnosi woreczek z nasionami.", 350, (t) => {
      show("parcel", true); pose("gardener", "offer");
      position("parcel", mix([145, 343], carriedPoint("gardener", "parcel"), smooth(t)));
    }, () => { parcelOwner = "gardener"; });
    walk("gardener", to, water ? "Niesie nasiona do wiszącego kosza." : "Niesie nasiona do skrzyni na kołach.");
    queue.push(() => {
      const from = worldPoint("parcel"), destination = water ? [345, 308] : [287, 337];
      parcelOwner = "";
      return { label: "parcel-load", text: "Ładunek opiera się o dno, a dłonie zostają wolne.", duration: 450,
        update(t) { position("parcel", mix(from, destination, smooth(t)), water ? 336 : 361); },
        finish() {
          const parent = node(water ? "car-load" : "cart-body");
          parent.append(node("parcel"));
          node("parcel").setAttribute("transform", water ? "translate(0 0) scale(.8)" : "translate(0 -17) scale(.8)");
          pose("gardener");
        } };
    });
    if (water) {
      walk("scout", [458, 258], "Drugi mieszkaniec przechodzi mostem odebrać przesyłkę.");
      add("cable-delivery", "Nurt porusza liną. Kosz z nasionami jedzie do szklarni.", 2800, (t) => {
        const q = smooth(t), point = mix([345, 322], [445, 259], q);
        point[1] += 15 * q * (1 - q);
        position("gondola", point, 345);
      }, () => {
        built.carAtFar = true;
        sound("island-signal");
      });
    } else {
      walk("maker", [317, 338], "Majster chwyta dyszel wózka.");
      add("cart-delivery", "Koła toczą się po deskach mostu. Ten wariant poczty napędzają mieszkańcy.", 2600, (t) => {
        const path = [[287, 354], [350, 323], [420, 270], [458, 276]];
        const n = Math.min(2, Math.floor(t * 3)), q = smooth(Math.min(1, t * 3 - n));
        const point = mix(path[n], path[n + 1], q);
        position("cart", point, point[1] + 5);
        actors.maker.direction = -1;
        actorAt("maker", [point[0] + 30, point[1] - 16], "walk", t * 40);
        actors.maker.direction = -1; pose("maker", "offer", t * 40);
        sort();
      }, () => { built.cartAtFar = true; });
    }
    const receiver = water ? "scout" : "maker";
    if (!water) walk(receiver, [442, 267], "Mieszkaniec odchodzi od dyszla i podchodzi po woreczek.");
    queue.push(() => {
      const from = worldPoint("parcel");
      node("world").append(node("parcel")); position("parcel", from);
      pose(receiver, "offer");
      return { label: "parcel-unload", text: "Mieszkaniec wyjmuje woreczek z transportu.", duration: 450,
        update(t) { position("parcel", mix(from, carriedPoint(receiver, "parcel"), smooth(t)), actors[receiver].point[1] + .5); },
        finish() { parcelOwner = receiver; pose(receiver, "offer"); } };
    });
    walk(receiver, points.greenhouse, "Ostatni odcinek przesyłka pokonuje w dłoniach, nie sama w powietrzu.");
    add("parcel-deliver", "Nasiona spoczywają na podstawie szklarni. Dostawa dotarła.", 450, (t) => {
      const from = carriedPoint(receiver, "parcel");
      position("parcel", mix(from, [493, 269], smooth(t)), 277);
    }, () => { parcelOwner = ""; position("parcel", [493, 269], 277); pose(receiver); });
    add("delivered", "Pierwsza przesyłka dotarła!", 250, () => {}, () => { built.delivered = true; });
  }
  function render() {
    if (!state) return;
    const scene = element("island-scene");
    scene.dataset.live = String(animated());
    scene.dataset.branch = state.branch || "undecided";
    scene.dataset.busy = String(state.busy);
    element("island").classList.toggle("is-finished", state.finished);
    show("meadow", visual.water >= 2);
    show("source", visual.water >= 2);
    show("sluice", built.sluice);
    show("far-meadow", visual.glass >= 3);
    const grass = visual.seeds >= 3 ? 420 : visual.seeds >= 2 ? 210 : visual.water >= 2 ? 95 : 0;
    node("grass-radius").setAttribute("rx", grass);
    node("grass-radius").setAttribute("ry", grass * .45);
    show("channel", built.channel);
    show("fall", built.channel);
    show("workshop", built.workshop);
    show("stairs", built.stairs);
    show("tunnel", built.tunnel);
    show("bed", built.bed);
    show("bridge", built.bridge);
    show("bridge-ropes", built.ropes);
    show("wheel", built.wheel && state.branch === "water");
    show("cart", built.wheel && state.branch === "cart");
    show("station", built.stations);
    show("remote", built.stations);
    show("greenhouse", built.greenhouse);
    show("cable", built.transport && state.branch === "water");
    show("gondola", built.transport && state.branch === "water");
    show("awning", built.cloth && state.branch === "cart");
    show("car-roof", built.cloth);
    show("drive-belt", visual.wheel >= 3);
    document.querySelectorAll("#island-scene .v-stage").forEach((part) => {
      part.style.display = visual[part.dataset.item] >= +part.dataset.level ? "" : "none";
    });
    if (visual.seeds >= 3) document.querySelectorAll(".v-sprout").forEach((part) => { part.style.display = "none"; });
    element("island-count").textContent = `${state.order.length} / ${valleyItems.length}`;
    element("island-level-count").textContent = `${valleyItems.filter(({ id }) => visual[id] === 3).length} MAX`;
    element("island-controls").setAttribute("aria-busy", String(state.busy));
    element("island-skip").hidden = !state.busy;
    element("island-motion").setAttribute("aria-pressed", String(paused));
    element("island-motion").textContent = paused ? "Wznów animacje" : "Pauza animacji";
    valleyItems.forEach((item) => {
      const button = element(`valley-pick-${item.id}`), level = visual[item.id];
      button.disabled = state.busy;
      button.classList.toggle("placed", level > 0);
      button.classList.toggle("maxed", level === 3);
      button.querySelector("small").textContent = level === 3 ? "MAX" : level ? `0${level}` : "Dodaj";
      button.setAttribute("aria-label", level ? `${item.name}: ${item.stages[level - 1]}. Obejrzyj.` : `Dodaj: ${item.name}`);
    });
    node("description").textContent = `Dolina. ${state.order.length} z 8 przedmiotów. ` +
      valleyItems.filter(({ id }) => visual[id]).map((item) => `${item.name}: ${item.stages[visual[item.id] - 1]}`).join(". ");
    sort();
    if (!element("island").hidden) setIslandMusicStage(visual.seeds >= 3 ? 2 : visual.water >= 2 ? 1 : 0);
  }
  function idle() {
    Object.keys(actors).forEach((role) => pose(role));
    sort();
  }
  function finish() {
    state.busy = false;
    skipping = false;
    current = undefined;
    element("island-scene").dataset.phase = "idle";
    idle();
    if (state.order.length === valleyItems.length) {
      state.finished = true;
      const full = built.delivered && state.branch === "water" && Object.values(state.levels).every((level) => level === 3);
      const title = built.delivered ? full ? "Poczta kwiatowa nad wąwozem!" : "Pierwsza przesyłka ogrodników!"
        : visual.seeds >= 2 ? "Ogród pod chmurami" : "Mała pracownia nad wąwozem";
      element("island-result-title").textContent = title;
      element("island-result-score").textContent = built.delivered
        ? state.branch === "water" ? "Woda porusza kolejką, a ogród dzieli się nasionami." : "Zamiast kolejki powstała poczta z ręcznym wózkiem."
        : "Nie wszystko zostało połączone. Inna kolejność otworzy inne możliwości.";
      element("island-build-order").textContent = state.order.map((id) => valleyItems.find((item) => item.id === id).name).join(" → ");
      element("island-results").hidden = false;
      element("island-learning").replaceChildren();
      valleyItems.forEach((item) => {
        const details = document.createElement("details"), summary = document.createElement("summary"), text = document.createElement("p");
        const level = visual[item.id];
        summary.textContent = `${item.name} · ${level}/3 — ${item.stages[level - 1]}`;
        text.textContent = item.explanation;
        details.append(summary, text);
        const rule = item.id === "wheel" && state.branch === "cart" && level === 2
          ? { needs: { seeds: 2, cloth: 2 } } : item.growth[level - 1];
        if (rule) {
          const hint = document.createElement("p"), missing = Object.entries(rule.needs)
            .filter(([id, min]) => state.levels[id] < min).map(([id]) => valleyItems.find((entry) => entry.id === id).name);
          hint.textContent = missing.length ? `Do kolejnego etapu potrzebne były: ${missing.join(", ")}.`
            : "Warunki są gotowe, ale przedmiot trafił do doliny zbyt późno na dalszy rozwój.";
          details.append(hint);
        }
        for (const id of item.sources) {
          const panel = document.createElement("div");
          panel.className = "feedback";
          appendStudySources(panel, questionBank.find((question) => question.id === id), () => state.finished);
          details.append(panel);
        }
        element("island-learning").append(details);
      });
      element("island-result-title").focus({ preventScroll: true });
      if (!document.hidden && !element("island").hidden) playSound(full ? "complete" : "finish");
    }
    render();
    element("island-status").textContent = state.finished ? built.delivered ? "Dostawa dotarła. Dolina odpoczywa."
      : "Każda kolejność zostawia własną dolinę. Spróbuj połączyć ogród z drugim tarasem."
      : "Co dodasz teraz? Dotknij użytego przedmiotu, aby obejrzeć jego etap.";
    startAmbient();
  }
  function pump() {
    while (queue.length) {
      const factory = queue.shift();
      current = factory();
      current.serial = ++stepSerial;
      element("island-scene").dataset.phase = current.label;
      element("island-status").textContent = current.text;
      if (animated()) {
        const token = generation, start = performance.now(), step = current;
        step.update(0);
        const tick = (now) => {
          if (token !== generation) return;
          const t = Math.min(1, (now - start) / step.duration);
          step.update(t);
          if (t < 1) frame = requestAnimationFrame(tick);
          else {
            frame = undefined; step.finish?.(); current = undefined; pump();
          }
        };
        frame = requestAnimationFrame(tick);
        return;
      }
      current.update(1); current.finish?.(); current = undefined;
    }
    finish();
  }
  function settle() {
    if (!state?.busy) return;
    generation++;
    cancelAnimationFrame(frame); frame = undefined;
    skipping = true;
    if (current) { current.update(1); current.finish?.(); current = undefined; }
    pump();
  }
  function stop() {
    generation++;
    cancelAnimationFrame(frame); cancelAnimationFrame(ambient);
    frame = undefined; ambient = undefined; lastFrame = 0;
    queue = []; current = undefined;
    node("effects").replaceChildren();
  }
  function startAmbient() {
    cancelAnimationFrame(ambient); ambient = undefined; lastFrame = 0;
    if (!animated() || !built.wheel || state.branch !== "water") return;
    const token = generation;
    const tick = (now) => {
      if (token !== generation || !animated()) { ambient = undefined; return; }
      rotor -= lastFrame ? Math.min(50, now - lastFrame) / 16 : 0;
      lastFrame = now; node("rotor").setAttribute("transform", `rotate(${rotor})`);
      ambient = requestAnimationFrame(tick);
    };
    ambient = requestAnimationFrame(tick);
  }
  function start() {
    stop();
    state = { levels: emptyValleyLevels(), placed: {}, branch: "", order: [], busy: false, finished: false };
    visual = emptyValleyLevels();
    built = { channel: false, bed: false, workshop: false, stairs: false, tunnel: false,
      bridge: false, wheel: false, ropes: false, stations: false, greenhouse: false, cloth: false,
      transport: false, delivered: false, carAtFar: false, cartAtFar: false };
    parcelOwner = ""; rotor = 0; skipping = false;
    const world = node("world");
    if (node("parcel").parentNode !== world) world.append(node("parcel"));
    node("parcel").replaceChildren(make("use", { href: "#v-token-seeds" }));
    show("parcel", false);
    node("source").style.opacity = "1";
    node("rotor").removeAttribute("transform");
    element("island-controls").querySelectorAll(".upgrading").forEach((button) => button.classList.remove("upgrading"));
    document.querySelectorAll("#island-scene [clip-path='url(#v-build-mask)']").forEach((part) => part.removeAttribute("clip-path"));
    for (const [role, point] of [["scout", [213, 353]], ["maker", [265, 376]], ["gardener", [125, 346]]]) {
      actors[role] = { node: node(`person-${role}`), point, direction: 1, carry: "" };
      actorAt(role, point);
    }
    for (const [id, point] of Object.entries(rests)) { position(`prop-${id}`, point); show(`prop-${id}`, false); }
    position("gondola", [345, 322], 335); position("cart", [287, 354], 360);
    element("island-results").hidden = true;
    element("island-learning").replaceChildren();
    element("island-explanations").open = false;
    showScreen("island");
    render();
    element("island-scene").dataset.phase = "idle";
    element("island-status").textContent = "Osiem drobiazgów i dwa brzegi. Od czego zaczną mieszkańcy?";
    element("island-title").focus({ preventScroll: true });
  }
  function pick(id) {
    if (element("island").hidden || state.busy) return;
    const item = valleyItems.find((entry) => entry.id === id);
    if (!item) { notifyCourse("Nie rozpoznano przedmiotu doliny."); return; }
    if (state.levels[id]) {
      element("island-status").textContent = `${item.name}: ${item.stages[visual[id] - 1]}. ${item.explanation}`;
      playSound("click"); return;
    }
    if (state.finished) return;
    startAmbient();
    state.order.push(id); state.placed[id] = state.order.length;
    const result = advanceValley({ ...state.levels, [id]: 1 }, state.placed, state.order.length, state.branch);
    state.levels = result.levels; state.branch = result.branch; state.busy = true;
    placement(id);
    result.changes.forEach(change);
    if (state.order.length === 8 && state.levels.seeds >= 2 && state.levels.timber >= 2 &&
        (state.branch === "cart" && state.levels.wheel >= 3 ||
          state.branch === "water" && state.levels.rope >= 3 && state.levels.timber >= 3)) {
      queue.push(() => {
        const rest = queue;
        queue = []; parcelTrip(); queue.push(...rest);
        return { label: "delivery-ready", text: "Mieszkańcy przygotowują pierwszą przesyłkę.", duration: 100, update() {} };
      });
    }
    render(); pump();
  }
  element("island-scene").innerHTML = valleyArt.svg;
  element("island-controls").replaceChildren();
  valleyItems.forEach((item) => {
    const button = document.createElement("button");
    button.id = `valley-pick-${item.id}`; button.className = "valley-choice"; button.type = "button";
    button.dataset.feedbackSound = "";
    button.innerHTML = `<svg viewBox="-25 -40 50 52" aria-hidden="true"><use href="#v-token-${item.id}"/></svg><span>${item.name}</span><small>Dodaj</small>`;
    button.addEventListener("click", () => pick(item.id));
    element("island-controls").append(button);
  });
  for (const id of ["open", "reset", "replay"]) element(`island-${id}`).addEventListener("click", start);
  element("island-skip").addEventListener("click", settle);
  element("island-motion").addEventListener("click", () => {
    paused = !paused;
    if (paused) settle();
    render(); startAmbient();
  });
  element("island-exit").addEventListener("click", () => {
    settle(); stop(); showScreen("welcome"); element("island-scene").dataset.live = "false";
    element("island-open").focus();
  });
  motionPreference.addEventListener("change", () => {
    if (!state) return;
    if (motionPreference.matches) settle();
    render(); startAmbient();
  });
  document.addEventListener("visibilitychange", () => {
    if (!state) return;
    if (document.hidden) settle();
    render(); startAmbient();
  });
  document.addEventListener("iskra-screen-change", () => {
    if (!state) return;
    if (element("island").hidden) { settle(); stop(); }
  });
  return { start, pick, settle, get state() { return state; }, get visual() { return visual; },
    get built() { return built; }, get current() { return current; }, get queueLength() { return queue.length; },
    get animating() { return frame !== undefined; }, actors, hand };
})();
