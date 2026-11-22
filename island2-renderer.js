"use strict";

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
    farm: { point: [148, 318], plane: "front" },
    rear: { point: [439, 301], plane: "ground-back" },
    cave: { point: [248, 364], plane: "front" },
    inside: { point: [267, 338], plane: "cave" },
    wheel: { point: [162, 414], plane: "front" },
    mill: { point: [295, 451], plane: "front" },
    landing: { point: [326, 424], plane: "front" },
    generator: { point: [310, 445], plane: "front" },
    lift: { point: [365, 407], plane: "front" },
    dock: { point: [467, 450], plane: "front" },
    stairs: { point: [329, 370], plane: "front" },
    terrace: { point: [309, 244], plane: "terrace" },
    spring: { point: [278, 229], plane: "terrace" },
    behind: { point: [340, 163], plane: "terrace" },
    summit: { point: [468, 168], plane: "peak" },
    balcony: { point: [402, 249], plane: "front" },
    plazaLeft: { point: [245, 450], plane: "front" },
    plazaCenter: { point: [303, 476], plane: "front" },
    plazaRight: { point: [371, 453], plane: "front" },
  };
  const edges = [
    ["rear", "farm", [[461, 331], [381, 376], [257, 363], [184, 345]], "around"],
    ["farm", "cave", [[184, 345]]],
    ["cave", "inside", [], "door"],
    ["cave", "wheel", [[204, 393]]],
    ["cave", "stairs", [[299, 363]]],
    ["wheel", "mill", [[240, 449]]],
    ["mill", "generator", []],
    ["generator", "landing", []],
    ["landing", "stairs", []],
    ["landing", "lift", []],
    ["lift", "dock", [[423, 435]]],
    ["stairs", "terrace", [[338, 342], [342, 315], [346, 286], [351, 263]], "climb"],
    ["terrace", "spring", []],
    ["terrace", "behind", [[299, 200]]],
    ["behind", "summit", [[349, 178], [369, 180], [400, 157], [427, 147]], "climb"],
    ["terrace", "balcony", [[354, 247]], "bridge"],
    ["landing", "plazaLeft", []], ["landing", "plazaCenter", []], ["landing", "plazaRight", []],
  ];

  function svg(tag, attributes = {}) {
    const node = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  }

  function person(role) {
    const root = svg("g", { id: `i2-person-${role}`, class: "i2-person" });
    root.append(svg("ellipse", { class: "i2-person-shadow", cy: 0, rx: 12, ry: 4, fill: "#486b53", opacity: ".2" }));
    const facing = svg("g", { class: "i2-facing" });
    const body = svg("g", { class: "i2-body", stroke: "#627567", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" });
    body.append(svg("path", { class: "i2-leg-back", d: "M-4-18Q-5-9-6-2", stroke: "#94a48d", "stroke-width": "5", fill: "none" }));
    body.append(svg("path", { class: "i2-arm-back", d: "M-6-32Q-13-25-12-19", stroke: "#9baa90", "stroke-width": "4.5", fill: "none" }));
    body.append(svg("ellipse", { cx: 0, cy: -27, rx: 7.5, ry: 12, fill: "#f0e8c5" }));
    body.append(svg("path", { d: "M-3-35Q3-38 4-24", stroke: "#fff9e0", "stroke-width": "3", fill: "none" }));
    body.append(svg("path", { class: "i2-leg-front", d: "M4-18Q5-9 7-2", stroke: "#6b7b66", "stroke-width": "5", fill: "none" }));
    body.append(svg("path", { class: "i2-arm-front", d: "M6-32Q12-25 12-18", stroke: "#6b7b66", "stroke-width": "4.5", fill: "none" }));
    const head = svg("g", { class: "i2-head" });
    head.append(svg("circle", { cy: -47, r: 13, fill: "#faf9df" }));
    head.append(svg("path", { d: "M-10-48Q-7-36 4-36", stroke: "#d7dfbf", "stroke-width": "3.5", fill: "none" }));
    head.append(svg("path", { d: "M-7-52Q-4-57 3-57", stroke: "#fff", "stroke-width": "3", fill: "none" }));
    body.append(head, svg("g", { class: "i2-hand" }));
    facing.append(body);
    root.append(facing);
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
    const working = mode === "work";
    const cheering = mode === "cheer";
    const holding = entity.node.querySelector(".i2-hand").childElementCount > 0;
    const lift = walking ? Math.max(0, front) * 5 : 0;
    const stride = walking ? front * 10 : 0;
    const otherLift = walking ? Math.max(0, back) * 5 : 0;
    const otherStride = walking ? back * 10 : 0;
    const crouch = working ? (1 - Math.cos(phase)) * 2.5 : 0;
    entity.node.querySelector(".i2-facing").setAttribute("transform", `scale(${entity.direction} 1)`);
    body.setAttribute("transform", `translate(0 ${walking ? -Math.abs(front) * 1.7 : cheering ? -Math.max(0, front) * 8 : crouch})`);
    entity.node.querySelector(".i2-leg-front").setAttribute("d", `M4-18Q${4 + stride * .45} ${-9 - lift} ${5 + stride} ${-2 - lift}`);
    entity.node.querySelector(".i2-leg-back").setAttribute("d", `M-4-18Q${-4 + otherStride * .45} ${-9 - otherLift} ${-5 + otherStride} ${-2 - otherLift}`);
    const handY = mode === "climb" || cheering ? -43 - front * 9 : working ? -24 - Math.max(0, front) * 18 : holding ? -25 : -18;
    const handX = working || holding ? 17 : 12 - stride * .55;
    entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q${handX + 2} ${handY - 3} ${handX} ${handY}`);
    entity.node.querySelector(".i2-arm-back").setAttribute("d", `M-6-32Q${-12 - otherStride * .4} ${mode === "climb" || cheering ? -47 + front * 8 : -25} ${-12 - otherStride * .55} ${mode === "climb" || cheering ? -44 + front * 8 : -19}`);
    entity.node.querySelector(".i2-hand").setAttribute("transform", `translate(${handX} ${handY})`);
    entity.node.querySelector(".i2-head").setAttribute("transform", `translate(${working ? 2 : 0} ${working ? crouch * .3 : 0})`);
    entity.node.dataset.pose = mode;
    entity.node.querySelector(".i2-person-shadow").setAttribute("opacity", mode === "climb" ? ".05" : ".2");
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
        pose(entity, context.story.celebrating ? "cheer" : entity.pose, clock / (context.story.celebrating ? 110 : 180));
      }
    }
    const angle = clock / 9;
    const rotate = (id, value) => document.getElementById(id).setAttribute("transform", `rotate(${value})`);
    if (context.levels.wheel >= 2 && context.branches.wheel !== "pottery") rotate("i2-wheel-rotor", angle);
    if (context.levels.rope >= 3) rotate("i2-pulley-rotor", -angle * .7);
    if (context.story.producing) document.getElementById("i2-mill-arm").setAttribute("transform", `translate(0 ${-Math.max(0, Math.sin(clock / 180)) * 18})`);
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
    for (const name of ["background", "sea-back", "base", "ground-back", "walls", "cave", "terrace", "peak-walls", "peak", "front", "sea-front"]) {
      const layer = svg("g", { id: `i2-layer-${name}` });
      if (name === "cave") layer.setAttribute("clip-path", "url(#i2-cave-mask)");
      layers.set(name, layer);
      root.append(layer);
    }
    for (const [id, plane, point, anchor] of [
      ["i2-background", "background", [0, 0], -1000], ["i2-base-terrain", "base", [0, 0], -1000],
      ["i2-middle-walls", "walls", [0, 0], -1000], ["i2-cave", "walls", [0, 0], 1], ["i2-cover", "front", [0, 0], 357],
      ["i2-middle-floor", "terrace", [0, 0], -1000], ["i2-water", "terrace", [0, 0], 230],
      ["i2-peak-walls", "peak-walls", [0, 0], -1000], ["i2-peak-floor", "peak", [0, 0], -1000],
      ["i2-tower", "peak", [0, 0], 191], ["i2-lamp", "peak", [436, 142], 192], ["i2-glass", "front", [193, 330], 360],
      ["i2-beam", "peak", [0, 0], 193], ["i2-seeds", "front", [0, 0], 309], ["i2-stream", "front", [0, 0], 300],
      ["i2-overflow", "front", [0, 0], 308],
      ["i2-cliff-steps", "front", [0, 0], 320], ["i2-scaffold", "front", [0, 0], 380],
      ["i2-crate", "front", [286, 355], 408], ["i2-wheel", "front", [144, 390], 400],
      ["i2-rope-coil", "front", [448, 341], 359], ["i2-copper", "front", [316, 416], 432],
      ["i2-drive", "front", [0, 0], 390], ["i2-wire", "front", [0, 0], 391],
      ["i2-coconut", "front", [214, 416], 428], ["i2-dock", "front", [0, 0], 450],
      ["i2-port-rope", "front", [0, 0], 409], ["i2-cargo", "front", [480, 452], 410],
      ["i2-production", "front", [0, 0], 446], ["i2-cave-lip", "front", [0, 0], 358],
      ["i2-boat", "sea-back", [523, 341], 0],
    ]) register(id, plane, point, anchor);
    for (const [role, point, plane] of [["scout", [309, 244], "terrace"], ["maker", [267, 338], "cave"], ["gardener", [148, 318], "front"]]) {
      const old = document.getElementById(`i2-person-${role}`);
      old.replaceWith(person(role));
      register(`i2-person-${role}`, plane, point);
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
    for (const [role, node] of [["scout", "terrace"], ["maker", "inside"], ["gardener", "rear"]]) {
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
    } else register("i2-parcel", "front", [0, 0], 411);
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

  function glass(raised, moving = false) {
    const entity = entities.get("i2-glass");
    if (moving) { setPlane(entity, "front"); entity.depth = 409; }
    else if (!journeys.has(entity.id)) {
      setPlane(entity, raised ? "peak" : "front");
      entity.depth = raised ? 194 : 360;
    }
  }

  return { mount, position, move, actor, sync, reset, clear, parcel, glass, stopIdle, nodes, entities, journeys };
})();
