"use strict";

const island2Layout = {
  wheelRest: [244, 400], wheelDrive: [237, 418], wheelPottery: [237, 418],
  crateRest: [432, 391], cabinBase: [416, 373], cabinTop: [416, 225], cabinLanding: [416, 284],
  rope: [396, 289], copper: [328, 425],
  glassRest: [188, 374], glassRough: [291, 386], glassReady: [378, 400], glassTop: [471, 190],
  lamp: [471, 205], lampRest: [497, 358], cargoLanding: [445, 285], cargoBoat: [567, 438],
  boatWaiting: [574, 304], boatDock: [574, 446], loadOffset: [0, -29],
};

function island2LoadPoint(point) {
  return point.map((value, index) => value + island2Layout.loadOffset[index]);
}

const island2Renderer = (() => {
  const ns = "http://www.w3.org/2000/svg";
  const entities = new Map();
  const journeys = new Map();
  const layers = new Map();
  let frame;
  let context;
  let idleAt = 0;
  let idleRole = 0;
  let previous = 0;
  let clock = 0;
  const nodes = {
    farm: { point: [135, 367], plane: "front" },
    rear: { point: [340, 331], plane: "ground-back" },
    cave: { point: [340, 389], plane: "front" },
    inside: { point: [333, 378], plane: "cave" },
    workshop: { point: [379, 398], plane: "front" },
    potter: { point: [269, 415], plane: "front" },
    teaLeft: { point: [204, 402], plane: "front" },
    teaRight: { point: [283, 408], plane: "front" },
    wheel: { point: [195, 396], plane: "front" },
    mill: { point: [287, 432], plane: "front" },
    landing: { point: [377, 421], plane: "front" },
    generator: { point: [367, 422], plane: "front" },
    lift: { point: [383, 382], plane: "front" },
    dock: { point: [507, 400], plane: "front" },
    stairs: { point: [383, 370], plane: "front" },
    terrace: { point: [282, 327], plane: "terrace" },
    spring: { point: [204, 336], plane: "terrace" },
    behind: { point: [237, 283], plane: "ground-back" },
    summit: { point: [439, 286], plane: "peak" },
    balcony: { point: [427, 294], plane: "peak" },
  };
  const edges = [
    ["rear", "farm", [[278, 341], [249, 348], [204, 357]], "around"],
    ["farm", "cave", [[219, 365], [283, 389]]],
    ["cave", "inside", [], "door"],
    ["cave", "workshop", []],
    ["cave", "potter", [[284, 406]]],
    ["wheel", "teaLeft", []], ["mill", "teaRight", []],
    ["cave", "wheel", [[287, 409]]],
    ["cave", "stairs", [[377, 393]]],
    ["wheel", "mill", [[236, 414]]],
    ["mill", "generator", []],
    ["generator", "landing", []],
    ["landing", "stairs", []],
    ["landing", "lift", []],
    ["lift", "dock", [[446, 402]]],
    ["stairs", "terrace", [[377, 395], [282, 393]]],
    ["terrace", "spring", []],
    ["terrace", "behind", [[282, 297], [268, 283]]],
    ["stairs", "summit", [[405, 347], [405, 313]], "climb"],
    ["summit", "balcony", []],
  ];

  function svg(tag, attributes = {}) {
    const node = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  }

  function person(role) {
    const root = svg("g", { id: `i2-person-${role}`, class: "i2-person" });
    root.append(svg("ellipse", { class: "i2-person-shadow", cy: 0, rx: 12, ry: 4, fill: "#486b53", opacity: ".2" }));
    const figure = svg("g", { transform: "scale(.76)" });
    const facing = svg("g", { class: "i2-facing" });
    const body = svg("g", { class: "i2-body", stroke: "#3d5347", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" });
    const limb = (name, d, back = false) => [
      svg("path", { class: name, d, stroke: "#3d5347", "stroke-width": "7", fill: "none" }),
      svg("path", { class: `${name}-core`, d, stroke: back ? "#dedec4" : "#fffdee", "stroke-width": "3.5", fill: "none" }),
    ];
    body.append(...limb("i2-leg-back", "M-4-18Q-5-9-6-2", true));
    body.append(...limb("i2-arm-back", "M-6-32Q-13-25-12-19", true));
    body.append(svg("path", { d: "M-8-35q8-5 16 0l2 14q-10 7-20 0Z", fill: "#fffdee" }));
    body.append(svg("path", { d: "M-8-25q8 4 16 0", stroke: { maker: "#ce8e70", gardener: "#83a86b", scout: "#c4a765" }[role], "stroke-width": "3.5", fill: "none" }));
    body.append(...limb("i2-leg-front", "M4-18Q5-9 7-2"));
    body.append(...limb("i2-arm-front", "M6-32Q12-25 12-18"));
    const head = svg("g", { class: "i2-head" });
    head.append(svg("circle", { cy: -47, r: 12, fill: "#fffef2" }));
    head.append(svg("path", { d: "M-9-47Q-7-37 3-37", stroke: "#dedec4", "stroke-width": "2.5", fill: "none" }));
    head.append(svg("circle", { cx: 5, cy: -48, r: 1.5, fill: "#3d5347", stroke: "none" }));
    const hand = svg("g", { class: "i2-hand" });
    const tool = svg("g", { class: "i2-task-prop", stroke: "#514f3e", "stroke-width": "2.5", "stroke-linejoin": "round" });
    tool.append(svg("path", { d: role === "gardener" ? "M0 0 8 8m-2-2 4-2 4 5-4 3Z"
      : role === "maker" ? "M0 0 7-9m-3 1 4-3 6 6-4 3Z"
        : "M-4-7 5-11 13-7V3L5 7-4 3Zm0 0 9 4 8-4M5-3V7", fill: role === "gardener" ? "#b9c9a8" : "#edc98a" }));
    hand.append(tool);
    body.append(head, hand);
    facing.append(body);
    figure.append(facing);
    root.append(figure);
    return root;
  }

  function register(id, plane, point = [0, 0], depth) {
    const node = document.getElementById(id);
    if (!node) throw new Error(`Brak elementu sceny: ${id}`);
    const entity = { id, node, plane, point: [...point], depth, direction: 1, pose: "idle",
      initial: { plane, point: [...point], depth } };
    entities.set(id, entity);
    node.dataset.plane = plane;
    layers.get(plane).append(node);
    return entity;
  }

  function setPlane(entity, plane) {
    if (plane === entity.plane) return;
    entity.plane = plane;
    entity.node.dataset.plane = plane;
    layers.get(plane).append(entity.node);
  }

  function place(entity, point) {
    entity.point = [...point];
    entity.node.setAttribute("transform", `translate(${point[0]} ${point[1]})`);
    entity.node.style.transform = "";
  }

  function position(id, point, plane) {
    const entity = entities.get(id);
    if (!entity) {
      document.getElementById(id).style.transform = `translate(${point[0]}px, ${point[1]}px)`;
      return;
    }
    if (journeys.has(id)) return;
    if (plane) setPlane(entity, plane);
    if (id === "i2-boat") setPlane(entity, point[1] < 397 ? "sea-back" : "sea-front");
    place(entity, point);
  }

  function nearest(point) {
    return Object.keys(nodes).reduce((best, key) =>
      Math.hypot(...nodes[key].point.map((value, index) => value - point[index])) <
      Math.hypot(...nodes[best].point.map((value, index) => value - point[index])) ? key : best, "farm");
  }

  function route(origin, destination) {
    const start = nearest(origin);
    const end = nearest(destination);
    const queue = [[start]];
    const visited = new Set([start]);
    let chain = [];
    while (queue.length) {
      const path = queue.shift();
      const key = path.at(-1);
      if (key === end) { chain = path; break; }
      for (const [a, b] of edges) {
        const next = a === key ? b : b === key ? a : undefined;
        if (next && !visited.has(next)) {
          visited.add(next);
          queue.push([...path, next]);
        }
      }
    }
    const result = [{ point: origin, plane: nodes[start].plane, mode: "walk" }];
    if (Math.hypot(origin[0] - nodes[start].point[0], origin[1] - nodes[start].point[1]) > 4) {
      result.push({ ...nodes[start], mode: "walk" });
    }
    for (let index = 1; index < chain.length; index++) {
      const from = chain[index - 1];
      const to = chain[index];
      const [a, , points, mode = "walk"] = edges.find(([a, b]) => a === from && b === to || a === to && b === from);
      const waypoints = a === from ? points : [...points].reverse();
      for (const point of waypoints) result.push({ point,
        plane: mode === "climb" ? "front" : mode === "around" ? point[1] > 335 ? "front" : "ground-back" : nodes[from].plane, mode });
      result.push({ ...nodes[to], mode });
    }
    return result;
  }

  function pose(entity, mode, phase = 0) {
    const body = entity.node.querySelector(".i2-body");
    if (!body) return;
    const front = Math.sin(phase);
    const back = -front;
    const walking = mode === "walk" || mode === "climb";
    const working = mode === "work" || mode === "repair";
    const tending = mode === "tend";
    const shaping = mode === "shape";
    const carrying = mode === "cargo";
    const chatting = mode === "chat";
    const cheering = mode === "cheer";
    const holding = Boolean(entity.node.querySelector("#i2-parcel"));
    const lift = walking ? Math.max(0, front) * 5 : 0;
    const stride = walking ? front * 10 : 0;
    const otherLift = walking ? Math.max(0, back) * 5 : 0;
    const otherStride = walking ? back * 10 : 0;
    const crouch = working || tending ? (1 - Math.cos(phase)) * 2.5 : 0;
    if (shaping) entity.direction = -1;
    if (tending || carrying) entity.direction = 1;
    if (mode === "repair") entity.direction = entity.point[0] > 350 ? -1 : 1;
    if (chatting) entity.direction = entity.point[0] < island2Layout.wheelRest[0] ? 1 : -1;
    entity.node.querySelector(".i2-facing").setAttribute("transform", `scale(${entity.direction} 1)`);
    body.setAttribute("transform", `translate(0 ${walking ? -Math.abs(front) * 1.7 : cheering ? -Math.max(0, front) * 8 : crouch})`);
    entity.node.querySelector(".i2-leg-front").setAttribute("d", `M4-18Q${4 + stride * .45} ${-9 - lift - crouch * .4} ${5 + stride} ${-2 - lift - crouch}`);
    entity.node.querySelector(".i2-leg-back").setAttribute("d", `M-4-18Q${-4 + otherStride * .45} ${-9 - otherLift - crouch * .4} ${-5 + otherStride} ${-2 - otherLift - crouch}`);
    const handY = mode === "climb" || cheering ? -43 - front * 9 : shaping ? -50 + front * 3
      : tending ? -23 + front * 3 : chatting ? -31 + front * 2 : carrying || holding ? -26 : working ? -24 - Math.max(0, front) * 18 : -18;
    const handX = shaping ? 19 : working || holding || tending || carrying ? 17 : 12 - stride * .55;
    entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q${handX + 2} ${handY - 3} ${handX} ${handY}`);
    entity.node.querySelector(".i2-arm-back").setAttribute("d", shaping || carrying
      ? `M-6-32Q8 ${handY - 5} 15 ${handY}`
      : `M-6-32Q${-12 - otherStride * .4} ${mode === "climb" || cheering ? -47 + front * 8 : -25} ${-12 - otherStride * .55} ${mode === "climb" || cheering ? -44 + front * 8 : -19}`);
    for (const limb of ["i2-leg-front", "i2-leg-back", "i2-arm-front", "i2-arm-back"]) {
      entity.node.querySelector(`.${limb}-core`).setAttribute("d", entity.node.querySelector(`.${limb}`).getAttribute("d"));
    }
    entity.node.querySelector(".i2-hand").setAttribute("transform", `translate(${handX} ${handY})`);
    entity.node.querySelector(".i2-head").setAttribute("transform", `translate(${working || shaping ? 2 : 0} ${shaping ? 1 : working ? crouch * .3 : 0})`);
    entity.node.dataset.pose = mode;
    entity.node.querySelector(".i2-person-shadow").setAttribute("opacity", mode === "climb" ? ".05" : ".2");
    entity.node.querySelector(".i2-task-prop").style.display = tending || mode === "repair" || carrying ? "" : "none";
  }

  function move(id, points, duration, offsets, options = {}) {
    const entity = entities.get(id);
    if (!entity) throw new Error(`Ruch niezarejestrowanego elementu: ${id}`);
    journeys.delete(id);
    if (!context?.live) {
      place(entity, points.at(-1));
      if (options.path) {
        setPlane(entity, options.path.at(-1).plane);
        entity.pose = options.idle ? "idle" : "work";
      }
      if (options.plane) setPlane(entity, options.plane);
      if (id === "i2-boat") setPlane(entity, points.at(-1)[1] < 397 ? "sea-back" : "sea-front");
      return;
    }
    journeys.set(id, {
      points, duration, offsets: offsets || points.map((_, index) => index / (points.length - 1)),
      start: performance.now() + (options.delay || 0), ...options,
    });
    place(entity, points[0]);
    wake();
  }

  function actor(role, destination, idle = false, delay = 0) {
    const entity = entities.get(`i2-person-${role}`);
    const path = route(entity.point, destination);
    const distances = path.slice(1).map((step, index) => Math.hypot(step.point[0] - path[index].point[0], step.point[1] - path[index].point[1]));
    const total = distances.reduce((sum, length) => sum + length, 0);
    let distance = 0;
    const offsets = [0, ...distances.map((length) => { distance += length; return distance / Math.max(total, 1); })];
    const duration = Math.max(200, total / (idle ? .1 : .2));
    const target = path.at(-1).point;
    if (!idle) context.story.people[role] = [...target];
    entity.pose = "walk";
    if (total < 2) {
      entity.pose = idle ? "idle" : "work";
      return 250;
    }
    move(entity.id, path.map((step) => step.point), duration, offsets, { path, idle, role, delay });
    return duration;
  }

  function depth(entity) {
    return entity.depth ?? entity.point[1] + (entity.id.startsWith("i2-person-") ? 0 : 16);
  }

  function sort() {
    for (const [name, layer] of layers) {
      const sorted = [...entities.values()].filter((entity) => entity.plane === name)
        .sort((a, b) => depth(a) - depth(b) || a.id.localeCompare(b.id));
      for (let index = 0; index < sorted.length; index++) {
        if (layer.children[index] !== sorted[index].node) layer.insertBefore(sorted[index].node, layer.children[index] || null);
      }
    }
  }

  function settledPose(entity) {
    if (context.story.ending === "workshop" && context.levels.wheel === 1 && entity.id !== "i2-person-gardener") return "chat";
    if (entity.id === "i2-person-maker") {
      if (context.branches.wheel === "pottery" && context.levels.wheel >= 2) return "shape";
      if (context.levels.timber >= 2) return "repair";
    }
    if (entity.id === "i2-person-gardener" && context.levels.seeds >= 2) return "tend";
    if (entity.id === "i2-person-scout" && context.story.ending === "beacon") return "cargo";
    return "idle";
  }

  function mechanisms(now = performance.now()) {
    const cabin = entities.get("i2-crate");
    document.getElementById("i2-lift-rope").setAttribute("d", `M416 163V${Math.max(164, cabin.point[1] - 61)}`);
    let tip = [537, 365];
    let hook = [537, 419];
    const delivery = journeys.get("i2-cargo");
    if (delivery && context.story.cargo === "moving") {
      const progress = Math.max(0, (now - delivery.start) / delivery.duration);
      if (progress < .4) {
        const load = entities.get("i2-cargo").point;
        hook = [load[0], load[1] - 20];
        tip = [hook[0], hook[1] - 45];
      } else {
        const returning = Math.min(1, (progress - .4) / .2);
        const load = island2LoadPoint(island2Layout.cabinBase);
        hook = [load[0] + (537 - load[0]) * returning, load[1] - 20 + (419 - load[1] + 20) * returning];
        tip = [hook[0], hook[1] - (45 + 9 * returning)];
      }
    }
    const boom = `M448 325 ${tip[0]} ${tip[1]}`;
    document.getElementById("i2-crane-boom").setAttribute("d", boom);
    document.getElementById("i2-crane-boom-core").setAttribute("d", boom);
    document.getElementById("i2-crane-line").setAttribute("d", `M${tip[0]} ${tip[1]} ${hook[0]} ${hook[1]}`);
    document.getElementById("i2-crane-hook").setAttribute("transform", `translate(${hook[0]} ${hook[1]})`);
  }

  function tick(now) {
    frame = undefined;
    if (!context?.live) return;
    clock += previous ? Math.min(50, now - previous) : 0;
    previous = now;
    for (const [id, journey] of journeys) {
      if (now < journey.start) continue;
      const entity = entities.get(id);
      const progress = Math.min(1, (now - journey.start) / journey.duration);
      let index = journey.offsets.findIndex((offset) => offset > progress) - 1;
      if (index < 0) index = journey.points.length - 2;
      const span = journey.offsets[index + 1] - journey.offsets[index];
      const elapsed = span > 0 ? (progress - journey.offsets[index]) / span : 1;
      const fraction = journey.path ? elapsed : elapsed * elapsed * (3 - 2 * elapsed);
      const a = journey.points[index];
      const b = journey.points[index + 1];
      place(entity, a.map((value, axis) => value + (b[axis] - value) * fraction));
      if (journey.path) {
        const step = journey.path[index + 1];
        setPlane(entity, elapsed < .5 ? journey.path[index].plane : step.plane);
        entity.direction = b[0] < a[0] ? -1 : 1;
        pose(entity, step.mode === "climb" ? "climb" : "walk", clock / 75);
      } else if (id === "i2-boat") setPlane(entity, entity.point[1] < 397 ? "sea-back" : "sea-front");
      if (progress === 1) {
        journeys.delete(id);
        if (journey.path) {
          setPlane(entity, journey.path.at(-1).plane);
          entity.pose = journey.idle ? "idle" : "work";
          context.story.people[journey.role] = [...entity.point];
        }
        if (journey.plane) setPlane(entity, journey.plane);
      }
    }
    for (const entity of entities.values()) {
      if (entity.id.startsWith("i2-person-") && !journeys.has(entity.id)) {
        const mode = context.finished || !context.busy ? settledPose(entity) : context.story.celebrating ? "cheer" : entity.pose;
        pose(entity, mode, clock / (context.story.celebrating ? 110 : 180));
      }
    }
    const angle = clock / 9;
    const rotate = (id, value) => document.getElementById(id).setAttribute("transform", `rotate(${value})`);
    if (context.levels.wheel >= 2 && context.branches.wheel !== "pottery") rotate("i2-wheel-rotor", angle);
    if (context.levels.rope >= 3) rotate("i2-pulley-rotor", -angle * .7);
    if (context.story.producing) document.getElementById("i2-mill-arm").setAttribute("transform", `translate(0 ${-Math.max(0, Math.sin(clock / 180)) * 5})`);
    if (context.branches.wheel === "pottery" && context.levels.wheel >= 2) rotate("i2-table-rotor", angle * .5);
    if (context.levels.lamp >= 3) document.getElementById("i2-beam-pivot").setAttribute("transform", `scale(${Math.cos(clock / 1000)} 1)`);
    if (context.levels.lamp >= 3) document.getElementById("i2-lens-rings").setAttribute("transform", `scale(${.65 + Math.abs(Math.cos(clock / 1000)) * .35} 1)`);
    if (!context.busy && !context.finished && now > idleAt) {
      const roles = ["scout", "maker", "gardener"];
      const role = roles[idleRole++ % roles.length];
      const entity = entities.get(`i2-person-${role}`);
      if (entity.node.style.display !== "none" && !journeys.has(entity.id)) {
        const visits = role === "scout" ? ["behind", "terrace", "spring"] : role === "maker" ? ["cave", "landing", "wheel"] : ["farm", "cave"];
        const destination = visits[Math.floor(idleRole / 3) % visits.length];
        actor(role, nodes[destination].point, true);
      }
      idleAt = now + 2600;
    }
    mechanisms(now);
    sort();
    wake();
  }

  function wake() {
    if (frame === undefined && context?.live) frame = requestAnimationFrame(tick);
  }

  function freeze() {
    cancelAnimationFrame(frame);
    frame = undefined;
    previous = 0;
    for (const [id, journey] of journeys) {
      const entity = entities.get(id);
      if (!journey.idle) {
        place(entity, journey.points.at(-1));
        if (journey.path) setPlane(entity, journey.path.at(-1).plane);
        if (journey.plane) setPlane(entity, journey.plane);
      }
      if (journey.role) context.story.people[journey.role] = [...entity.point];
      if (id === "i2-boat") setPlane(entity, entity.point[1] < 397 ? "sea-back" : "sea-front");
      entity.pose = "idle";
      pose(entity, "idle");
    }
    journeys.clear();
    sort();
  }

  function stopIdle() {
    for (const [id, journey] of journeys) if (journey.idle) {
      const entity = entities.get(id);
      context.story.people[journey.role] = [...entity.point];
      entity.pose = "idle";
      journeys.delete(id);
    }
    idleAt = performance.now() + 2500;
  }

  function mount() {
    const root = document.querySelector("#island2-art > svg");
    for (const name of ["background", "sea-back", "base", "ground-back", "walls", "cave", "terrace", "peak", "front", "sea-front"]) {
      const layer = svg("g", { id: `i2-layer-${name}` });
      if (name === "cave") layer.setAttribute("clip-path", "url(#i2-cave-mask)");
      layers.set(name, layer);
      root.append(layer);
    }
    for (const [id, plane, point, anchor] of [
      ["i2-background", "background", [0, 0], -1000], ["i2-base-terrain", "base", [0, 0], -1000],
      ["i2-middle-walls", "walls", [0, 0], -1000], ["i2-cave", "walls", [0, 0], 1], ["i2-cover", "front", [0, 0], 382],
      ["i2-water", "walls", [0, 0], 230],
      ["i2-tower", "peak", [0, 0], -1000], ["i2-lamp", "front", island2Layout.lampRest, 360], ["i2-glass", "front", island2Layout.glassRest, 401],
      ["i2-beam", "peak", [0, 0], 189], ["i2-seeds", "front", [0, 0], 356], ["i2-stream", "front", [0, 0], 339],
      ["i2-overflow", "front", [0, 0], 355],
      ["i2-cliff-steps", "front", [0, 0], 368], ["i2-scaffold", "front", [0, 0], 372], ["i2-scaffold-short", "front", [0, 0], 372],
      ["i2-crate", "front", island2Layout.crateRest, 374], ["i2-wheel", "front", island2Layout.wheelRest, 420],
      ["i2-rope-coil", "front", island2Layout.rope, 290], ["i2-copper", "front", island2Layout.copper, 436],
      ["i2-drive", "front", [0, 0], 390], ["i2-wire", "front", [0, 0], 391],
      ["i2-dock", "front", [0, 0], 413],
      ["i2-port-rope", "front", [0, 0], 375], ["i2-cargo", "front", island2Layout.cargoBoat, 376],
      ["i2-production", "cave", [0, 0], 365], ["i2-cave-lip", "front", [0, 0], 383],
      ["i2-boat", "sea-back", island2Layout.boatWaiting, 0],
    ]) register(id, plane, point, anchor);
    for (const [role, name] of [["scout", "spring"], ["maker", "inside"], ["gardener", "rear"]]) {
      const old = document.getElementById(`i2-person-${role}`);
      old.replaceWith(person(role));
      register(`i2-person-${role}`, nodes[name].plane, nodes[name].point);
    }
    document.getElementById("i2-person-scout").querySelector(".i2-facing").append(document.getElementById("i2-reaction"));
    document.getElementById("i2-reaction").setAttribute("transform", "translate(0 -77)");
    for (const entity of entities.values()) place(entity, entity.point);
    sort();
  }

  function sync(next) {
    context = next;
    if (!next.live) freeze();
    else wake();
    if (!next.busy || next.finished) for (const entity of entities.values()) {
      if (entity.id.startsWith("i2-person-") && !journeys.has(entity.id)) pose(entity, settledPose(entity), .9);
    }
    mechanisms();
    sort();
  }

  function reset() {
    freeze();
    clock = 0;
    idleAt = performance.now() + 1600;
    idleRole = 0;
    for (const entity of entities.values()) {
      setPlane(entity, entity.initial.plane);
      place(entity, entity.initial.point);
      entity.depth = entity.initial.depth;
      entity.direction = 1;
      entity.pose = "idle";
    }
    for (const id of ["i2-wheel-rotor", "i2-table-rotor", "i2-pulley-rotor", "i2-mill-arm"]) {
      document.getElementById(id).setAttribute("transform", "translate(0 0)");
    }
    document.getElementById("i2-beam-pivot").setAttribute("transform", "scale(1 1)");
    document.getElementById("i2-lens-rings").setAttribute("transform", "scale(1 1)");
    for (const [role, node] of [["scout", "spring"], ["maker", "inside"], ["gardener", "rear"]]) {
      const entity = entities.get(`i2-person-${role}`);
      entity.pose = "idle";
      setPlane(entity, nodes[node].plane);
      place(entity, nodes[node].point);
      pose(entity, "idle");
    }
  }

  function parcel(node, carrier) {
    entities.delete("i2-parcel");
    if (carrier) {
      document.getElementById(`i2-person-${carrier}`).querySelector(".i2-hand").append(node);
      node.setAttribute("transform", "translate(2 2) scale(.65)");
    } else register("i2-parcel", "front", [0, 0], 376);
  }

  function clear() {
    freeze();
    entities.delete("i2-parcel");
    journeys.delete("i2-parcel");
    document.getElementById("i2-parcel")?.remove();
    for (const entity of entities.values()) if (entity.id.startsWith("i2-person-")) {
      entity.pose = "idle";
      pose(entity, "idle");
    }
  }

  function elevate(id, raised, moving = false) {
    const entity = entities.get(id);
    if (moving) { setPlane(entity, "front"); entity.depth = 375; }
    else if (!journeys.has(entity.id)) {
      setPlane(entity, raised ? "peak" : "front");
      entity.depth = raised ? id === "i2-glass" ? 194 : 192 : entity.point[1] + 2;
    }
  }

  const glass = (raised, moving) => elevate("i2-glass", raised, moving);
  const lamp = (raised, moving) => elevate("i2-lamp", raised, moving);
  return { mount, position, move, actor, sync, reset, clear, parcel, glass, lamp, stopIdle, nodes, entities, journeys };
})();
