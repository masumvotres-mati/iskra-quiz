"use strict";

const island2ActorScale = 1.04;

const island2Layout = {
  wheelRest: [244, 400], wheelDrive: [237, 418], wheelPottery: [237, 418],
  crateRest: [432, 391], cabinBase: [416, 373], cabinTop: [416, 225], cabinLanding: [416, 284],
  rope: [396, 289], copper: [328, 425],
  glassRest: [188, 374], glassRough: [291, 386], glassReady: [378, 400], glassTop: [471, 190],
  lamp: [471, 205], lampRest: [497, 358], cargoLanding: [445, 285], cargoBoat: [567, 550],
  boatWaiting: [574, 304], boatDock: [574, 558], loadOffset: [0, -29],
  coverHome: [341, 380], coverBench: [284, 401], coverBridge: [283, 446],
  lily: [177, 323], fish: [157, 340], craftShore: [566, 540], craftSea: [510, 566],
};

function island2LoadPoint(point) {
  return point.map((value, index) => value + island2Layout.loadOffset[index]);
}

const island2Renderer = (() => {
  const ns = "http://www.w3.org/2000/svg";
  const entities = new Map();
  const journeys = new Map();
  const layers = new Map();
  const acts = new Map();
  const followers = new Map();
  const assemblies = new Map();
  let frame;
  let context;
  let idleAt = 0;
  let idleRole = 0;
  let previous = 0;
  let clock = 0;
  let wheelAngle = 0;
  let tableAngle = 0;
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
    dock: { point: [507, 541], plane: "dock" },
    dockTop: { point: [507, 400], plane: "front" },
    stairs: { point: [383, 370], plane: "front" },
    terrace: { point: [282, 327], plane: "terrace" },
    spring: { point: [204, 336], plane: "terrace" },
    behind: { point: [237, 283], plane: "ground-back" },
    summit: { point: [439, 286], plane: "peak" },
    balcony: { point: [427, 294], plane: "peak" },
    lantern: { point: [501, 240], plane: "gallery" },
    upperLoad: { point: [455, 241], plane: "gallery" },
    tunnel: { point: [238, 470], plane: "underground" },
    bridge: { point: [283, 438], plane: "front" },
    pondEdge: { point: [155, 359], plane: "front" },
    shore: { point: [524, 503], plane: "dock" },
    shoreTop: { point: [524, 362], plane: "front" },
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
    ["lift", "dockTop", [[446, 402]]],
    ["dockTop", "dock", [], "climb"],
    ["stairs", "terrace", [[377, 395], [282, 393]]],
    ["terrace", "spring", []],
    ["terrace", "behind", [[282, 297], [268, 283]]],
    ["stairs", "summit", [[405, 347], [405, 313]], "climb"],
    ["summit", "balcony", []],
    ["balcony", "upperLoad", [[427, 263], [435, 239]], "climb"],
    ["upperLoad", "lantern", [[463, 226]]],
    ["inside", "tunnel", [[317, 410], [289, 447], [254, 463]], "crawl", "cutaway"],
    ["wheel", "bridge", [[236, 414]], "walk", "bridge"],
    ["bridge", "generator", [], "walk", "bridge"],
    ["farm", "pondEdge", []], ["lift", "shoreTop", [[481, 375]]],
    ["shoreTop", "shore", [[507, 400], [507, 483]], "climb"],
    ["dock", "shore", [[524, 520]]],
  ];

  function svg(tag, attributes = {}) {
    const node = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  }

  function person(role) {
    const root = svg("g", { id: `i2-person-${role}`, class: "i2-person", stroke: "none" });
    root.append(svg("ellipse", { class: "i2-person-shadow", cy: 0, rx: 12, ry: 12 * island2Iso.slope, fill: "#486b53", opacity: ".2" }));
    const figure = svg("g", { transform: `scale(${island2ActorScale})` });
    const facing = svg("g", { class: "i2-facing" });
    const body = svg("g", { class: "i2-body", stroke: "#3d5347", "stroke-width": "2.5", "stroke-linecap": "round", "stroke-linejoin": "round" });
    const limb = (name, d, back = false) => [
      svg("path", { class: name, d, stroke: "#3d5347", "stroke-width": "7", fill: "none" }),
      svg("path", { class: `${name}-core`, d, stroke: back ? "#ecebb0" : "#ffffd1", "stroke-width": "3.5", fill: "none" }),
    ];
    body.append(...limb("i2-leg-back", "M-4-18Q-5-9-6-2", true));
    body.append(...limb("i2-arm-back", "M-6-32Q-13-25-12-19", true));
    body.append(svg("path", { d: "M-8-35Q0-39 8-35q7 13 0 18-8 5-16-1-5-7 0-17Z", fill: "#ffffd1" }));
    body.append(svg("path", { d: "M3-36q6 0 5 4 5 13-1 16l-5 1q7-11 1-21Z", fill: "#e9e9a1", stroke: "none" }));
    body.append(...limb("i2-leg-front", "M4-18Q5-9 7-2"));
    body.append(...limb("i2-arm-front", "M6-32Q12-25 12-18"));
    const head = svg("g", { class: "i2-head" });
    head.append(svg("circle", { cy: -47, r: 13, fill: "#ffffd1" }));
    head.append(svg("circle", { class: "i2-eye", cx: 5, cy: -48, r: 1.5, fill: "#3d5347", stroke: "none" }));
    head.append(svg("circle", { class: "i2-eye-far", cx: -1, cy: -49, r: 1.2, fill: "#3d5347", stroke: "none" }));
    head.append(svg("path", { class: "i2-mouth", d: "", fill: "#3d5347", stroke: "none" }));
    const hand = svg("g", { class: "i2-hand" });
    const tool = svg("g", { class: "i2-task-prop", stroke: "#514f3e", "stroke-width": "2.5", "stroke-linejoin": "round" });
    tool.append(svg("path", { d: role === "gardener" ? "M0 0 8 8m-2-2 4-2 4 5-4 3Z"
      : role === "maker" ? "M0 0 7-9m-3 1 4-3 6 6-4 3Z"
        : "M-4-7 5-11 13-7V3L5 7-4 3Zm0 0 9 4 8-4M5-3V7", fill: role === "gardener" ? "#b9c9a8" : "#edc98a" }));
    hand.append(tool);
    hand.append(svg("path", { class: "i2-dig-tool", d: "M0 0 11 12m-5-3 9-5 5 9-9 5Z",
      fill: "#b9c9a8", stroke: "#514f3e", "stroke-width": "2.5", display: "none" }));
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
      height: 0, heading: [1, island2Iso.slope], initial: { plane, point: [...point], depth } };
    entities.set(id, entity);
    node.dataset.plane = plane;
    layers.get(plane).append(node);
    return entity;
  }

  function setPlane(entity, plane) {
    if (entity.id.startsWith("i2-person-")) entity.height = plane === "gallery" ? 175
      : plane === "peak" ? 88 : plane === "underground" ? -60 : plane === "dock" ? -141 : 0;
    if (plane === entity.plane) return;
    entity.plane = plane;
    entity.node.dataset.plane = plane;
    layers.get(plane).append(entity.node);
  }

  function place(entity, point) {
    entity.point = [...point];
    const height = entity.height + (entity.id === "i2-glass" ? 15 : 0);
    entity.grid = island2Iso.unproject(point, height);
    const projected = island2Iso.project(entity.grid);
    entity.node.setAttribute("transform", `translate(${projected[0]} ${projected[1]})`);
    entity.node.style.transform = "";
  }

  function boatPlane(point) {
    const [x, y] = island2Iso.unproject(point, -160);
    return x > 124 / island2Iso.unit || y > 124 / island2Iso.unit ? "sea-front" : "sea-back";
  }

  function position(id, point, plane) {
    const entity = entities.get(id);
    if (!entity) {
      document.getElementById(id).style.transform = `translate(${point[0]}px, ${point[1]}px)`;
      return;
    }
    if (journeys.has(id) || followers.has(id)) return;
    if (plane) setPlane(entity, plane);
    if (id === "i2-boat") setPlane(entity, boatPlane(point));
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
      for (const [a, b, , , requirement] of edges) {
        if (requirement === "cutaway" && !context.story.cutawayOpen || requirement === "bridge" && !context.story.bridgeBuilt) continue;
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
        plane: mode === "climb" ? "front" : mode === "crawl" ? "underground"
          : mode === "around" ? point[1] > 335 ? "front" : "ground-back" : nodes[from].plane, mode });
      result.push({ ...nodes[to], mode });
    }
    if (Math.hypot(result.at(-1).point[0] - destination[0], result.at(-1).point[1] - destination[1]) > 2) {
      result.push({ point: destination, plane: nodes[end].plane, mode: "walk" });
    }
    return result;
  }

  function pose(entity, mode, phase = 0, progress = 0) {
    const body = entity.node.querySelector(".i2-body");
    if (!body) return;
    const front = Math.sin(phase);
    const back = -front;
    const walking = ["walk", "climb", "run", "heavy", "umbrella"].includes(mode);
    const working = mode === "work" || mode === "repair";
    const tending = mode === "tend";
    const shaping = mode === "shape";
    const carrying = mode === "cargo";
    const balancing = mode === "balance";
    const chatting = mode === "chat";
    const cheering = mode === "cheer";
    const holding = Boolean(entity.node.querySelector("#i2-parcel"))
      || [...followers.values()].some((link) => link.hand && link.target === entity.id);
    const lift = walking ? Math.max(0, front) * 5 : 0;
    const stride = walking ? front * (mode === "heavy" ? 5 : mode === "run" ? 12 : 10) : 0;
    const otherLift = walking ? Math.max(0, back) * 5 : 0;
    const otherStride = walking ? back * (mode === "heavy" ? 5 : mode === "run" ? 12 : 10) : 0;
    const crouch = working || tending ? (1 - Math.cos(phase)) * 2.5 : 0;
    if (shaping) entity.direction = -1;
    if (tending || carrying) entity.direction = 1;
    if (mode === "repair") entity.direction = entity.point[0] > 350 ? -1 : 1;
    if (chatting) entity.direction = entity.point[0] < island2Layout.wheelRest[0] ? 1 : -1;
    entity.node.querySelector(".i2-facing").setAttribute("transform", `scale(${entity.direction} 1)`);
    body.setAttribute("transform", `translate(0 ${walking ? -Math.abs(front) * 1.7 : cheering ? -Math.max(0, front) * 8 : crouch})`);
    const heading = entity.heading || [1, island2Iso.slope];
    const stepX = Math.abs(heading[0]);
    entity.node.querySelector(".i2-leg-front").setAttribute("d", `M4-18Q${4 + stride * stepX * .45} ${-9 - lift - crouch * .4} ${5 + stride * stepX} ${-2 - lift - crouch + stride * heading[1]}`);
    entity.node.querySelector(".i2-leg-back").setAttribute("d", `M-4-18Q${-4 + otherStride * stepX * .45} ${-9 - otherLift - crouch * .4} ${-5 + otherStride * stepX} ${-2 - otherLift - crouch + otherStride * heading[1]}`);
    const handY = mode === "climb" || cheering ? -43 - front * 9 : shaping ? -50 + front * 3
      : tending ? -23 + front * 3 : chatting ? -31 + front * 2 : carrying || holding ? -26 : working ? -24 - Math.max(0, front) * 18 : -18;
    const handX = shaping ? 19 : working || holding || tending || carrying ? 17 : 12 - stride * .55;
    entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q${handX + 2} ${handY - 3} ${handX} ${handY}`);
    entity.node.querySelector(".i2-arm-back").setAttribute("d", shaping || carrying
      ? `M-6-32Q8 ${handY - 5} 15 ${handY}`
      : `M-6-32Q${-12 - otherStride * .4} ${mode === "climb" || cheering ? -47 + front * 8 : -25} ${-12 - otherStride * .55} ${mode === "climb" || cheering ? -44 + front * 8 : -19}`);
    let activeHand = [handX, handY];
    if (mode === "push" || mode === "pull") {
      body.setAttribute("transform", `translate(${front * 1.5} ${2 + Math.abs(front) * 2}) skewX(-12)`);
      entity.node.querySelector(".i2-leg-front").setAttribute("d", `M4-18Q15-9 ${16 + front * 5} ${-2 - Math.max(0, front) * 3}`);
      entity.node.querySelector(".i2-leg-back").setAttribute("d", `M-4-18Q-12-10 ${-13 - front * 5} ${-2 - Math.max(0, -front) * 3}`);
      entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q19-33 24 ${-27 + front * 2}`);
      entity.node.querySelector(".i2-arm-back").setAttribute("d", `M-6-32Q10-36 22 ${-31 + front * 2}`);
      activeHand = [24, -27 + front * 2];
    } else if (balancing) {
      activeHand = [0, -23];
      entity.node.querySelector(".i2-arm-front").setAttribute("d", "M6-32Q12-25 0-23");
      entity.node.querySelector(".i2-arm-back").setAttribute("d", "M-6-32Q-12-25 0-23");
    } else if (mode === "kneel" || mode === "dig" || mode === "polish") {
      body.setAttribute("transform", "translate(0 10)");
      entity.node.querySelector(".i2-leg-front").setAttribute("d", "M4-18Q20-13 18-12");
      entity.node.querySelector(".i2-leg-back").setAttribute("d", "M-4-18Q-12-4-16-12");
      activeHand = [mode === "polish" ? 20 + front * 5 : 20, mode === "dig" ? -25 + front * 9 : -21 + front * 2];
      entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q24-26 ${activeHand.join(" ")}`);
    } else if (mode === "crawl") {
      body.setAttribute("transform", "translate(-18 10) rotate(75 0 -18)");
      entity.node.querySelector(".i2-leg-front").setAttribute("d", `M4-18Q14 ${-11 + front * 3}-2-11`);
      entity.node.querySelector(".i2-leg-back").setAttribute("d", `M-4-18Q-12 ${-10 - front * 3}-10-15`);
      entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q19-35 17 ${-43 + front * 3}`);
      entity.node.querySelector(".i2-arm-back").setAttribute("d", `M-6-32Q8-40 11 ${-45 - front * 3}`);
      activeHand = [17, -43 + front * 3];
    } else if (mode === "sit" || mode === "row") {
      body.setAttribute("transform", `translate(0 ${12 + (mode === "row" ? front * 1.5 : 0)})`);
      entity.node.querySelector(".i2-leg-front").setAttribute("d", "M4-18Q20-18 20-12");
      entity.node.querySelector(".i2-leg-back").setAttribute("d", "M-4-18Q-13-17-16-12");
      activeHand = [22 + (mode === "row" ? front * 7 : 0), -29 + (mode === "row" ? Math.cos(phase) * 5 : 0)];
      entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q20-37 ${activeHand.join(" ")}`);
      entity.node.querySelector(".i2-arm-back").setAttribute("d", `M-6-32Q9-35 ${activeHand[0] - 4} ${activeHand[1] - 2}`);
    } else if (mode === "startle") {
      body.setAttribute("transform", `translate(0 ${-Math.sin(progress * Math.PI) * 18})`);
      entity.node.querySelector(".i2-arm-front").setAttribute("d", "M6-32Q20-40 18-54");
      entity.node.querySelector(".i2-arm-back").setAttribute("d", "M-6-32Q-20-40-18-54");
      activeHand = [18, -54];
    } else if (mode === "look" || mode === "shelter" || mode === "offer" || mode === "umbrella") {
      activeHand = mode === "look" ? [11, -47] : mode === "shelter" || mode === "umbrella" ? [15, -43] : [25, -27];
      entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q20-39 ${activeHand.join(" ")}`);
    }
    for (const limb of ["i2-leg-front", "i2-leg-back", "i2-arm-front", "i2-arm-back"]) {
      entity.node.querySelector(`.${limb}-core`).setAttribute("d", entity.node.querySelector(`.${limb}`).getAttribute("d"));
    }
    entity.node.querySelector(".i2-hand").setAttribute("transform", `translate(${activeHand.join(" ")})`);
    entity.node.querySelector(".i2-head").setAttribute("transform", `translate(${working || shaping ? 2 : 0} ${shaping ? 1 : working ? crouch * .3 : 0})`);
    entity.node.dataset.pose = mode;
    entity.node.querySelector(".i2-person-shadow").setAttribute("opacity", ["climb", "crawl", "row", "sit"].includes(mode) ? ".05" : ".2");
    entity.node.querySelector(".i2-task-prop").style.display = tending || mode === "repair" || carrying ? "" : "none";
    entity.node.querySelector(".i2-dig-tool").setAttribute("display", mode === "dig" ? "" : "none");
    entity.node.querySelector(".i2-mouth").setAttribute("d", mode === "startle" || mode === "look" ? "M4-41a3 4 0 1 0 6 0 3 4 0 1 0-6 0" : "");
    const away = walking && heading[1] < -.25;
    entity.node.querySelector(".i2-eye").style.display = away ? "none" : "";
    entity.node.querySelector(".i2-eye-far").style.display = away || Math.abs(heading[1]) < .2 ? "none" : "";
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
      if (id === "i2-boat") setPlane(entity, boatPlane(points.at(-1)));
      return;
    }
    journeys.set(id, {
      points, duration, offsets: offsets || points.map((_, index) => index / (points.length - 1)),
      start: performance.now() + (options.delay || 0), ...options,
    });
    place(entity, points[0]);
    wake();
  }

  function actor(role, destination, idle = false, delay = 0, options = {}) {
    const entity = entities.get(`i2-person-${role}`);
    const path = route(entity.point, destination);
    const distances = path.slice(1).map((step, index) => Math.hypot(step.point[0] - path[index].point[0], step.point[1] - path[index].point[1]));
    const total = distances.reduce((sum, length) => sum + length, 0);
    let distance = 0;
    const offsets = [0, ...distances.map((length) => { distance += length; return distance / Math.max(total, 1); })];
    const duration = Math.max(200, total / (idle ? .1 : options.gait === "run" ? .29 : options.gait === "heavy" ? .13 : .2));
    const target = path.at(-1).point;
    if (!idle) context.story.people[role] = [...target];
    entity.pose = "walk";
    if (total < 2) {
      entity.pose = idle ? "idle" : "work";
      return 250;
    }
    move(entity.id, path.map((step) => step.point), duration, offsets, { path, idle, role, delay, length: total, ...options });
    return duration;
  }

  function depth(entity) {
    return entity.depth ?? entity.point[1] + entity.height + (entity.id === "i2-glass" ? 15 : 0);
  }

  function act(role, mode, duration, delay = 0, direction) {
    const entity = entities.get(`i2-person-${role}`);
    acts.set(entity.id, { mode, duration, start: performance.now() + delay, direction });
    if (!context?.live) {
      if (direction) entity.direction = direction;
      pose(entity, mode, .9, .5);
    }
    wake();
  }

  function follow(id, target, offset = [0, 0], options = {}) {
    journeys.delete(id);
    followers.set(id, { target, offset, from: [...entities.get(id).point], start: performance.now(), ...options });
    updateFollowers(Boolean(options.hand));
  }

  function release(id) {
    followers.delete(id);
    const entity = entities.get(id);
    entity.depth = entity.initial.depth;
    if (entity.id.startsWith("i2-person-") && context) context.story.people[entity.id.slice(10)] = [...entity.point];
  }

  function updateFollowers(hands) {
    const root = document.querySelector("#island2-art > svg");
    for (const [id, link] of followers) {
      if (Boolean(link.hand) !== hands) continue;
      const entity = entities.get(id);
      const target = entities.get(link.target);
      let point = target.point;
      if (hands) {
        const hand = target.node.querySelector(".i2-hand");
        let matrix = new DOMMatrix();
        for (let node = hand; node !== root; node = node.parentElement) {
          const transform = node.transform.baseVal.consolidate()?.matrix;
          if (transform) matrix = new DOMMatrix([transform.a, transform.b, transform.c, transform.d, transform.e, transform.f]).multiply(matrix);
        }
        const origin = new DOMPoint(0, 0).matrixTransform(matrix);
        point = [origin.x, origin.y];
      }
      const desired = link.to || point.map((value, axis) => value + link.offset[axis]);
      const blend = link.blend && context?.live ? Math.min(1, (performance.now() - link.start) / link.blend) : 1;
      place(entity, desired.map((value, axis) => link.from[axis] + (value - link.from[axis]) * blend));
      if (!context?.live) link.blend = 0;
      setPlane(entity, link.plane || target.plane);
      entity.depth = depth(target) + (link.depthBias ?? 1);
    }
    if (hands) gripHands();
  }

  function gripHands() {
    for (const [id, link] of followers) {
      if (!link.hand || !["i2-glass", "i2-lamp"].includes(id)) continue;
      const carrier = entities.get(link.target);
      const prop = entities.get(id);
      const body = carrier.node.querySelector(".i2-body");
      const matrix = body.getCTM().inverse().multiply(prop.node.getCTM());
      const grips = id === "i2-glass" ? carrier.plane === "gallery" ? [[10, -4], [10, 12]]
        : [[-12, -12 * island2Iso.slope], [12, 12 * island2Iso.slope]] : [[8, -12]];
      grips.forEach((point, index) => {
        const contact = new DOMPoint(...point).matrixTransform(matrix);
        const side = index ? "front" : id === "i2-lamp" ? "front" : "back";
        const shoulder = side === "front" ? 6 : -6;
        const d = `M${shoulder}-32Q${(shoulder + contact.x) / 2} ${Math.max(-25, contact.y + 6)} ${contact.x} ${contact.y}`;
        carrier.node.querySelector(`.i2-arm-${side}`).setAttribute("d", d);
        carrier.node.querySelector(`.i2-arm-${side}-core`).setAttribute("d", d);
      });
    }
    for (const carrier of entities.values()) {
      if (!carrier.workGrip) continue;
      const { prop, side } = carrier.workGrip;
      const face = document.getElementById(prop).querySelector("[data-iso-face]");
      const body = carrier.node.querySelector(".i2-body");
      const matrix = body.getCTM().inverse().multiply(face.getCTM());
      [-1, 1].forEach((hand, i) => {
        const contact = new DOMPoint(side * 25, hand * 5).matrixTransform(matrix);
        const name = i ? "front" : "back";
        const d = `M${i ? 6 : -6}-32Q${contact.x * .65} ${contact.y + 10} ${contact.x} ${contact.y}`;
        carrier.node.querySelector(`.i2-arm-${name}`).setAttribute("d", d);
        carrier.node.querySelector(`.i2-arm-${name}-core`).setAttribute("d", d);
      });
    }
  }

  const bounded = (value) => Math.max(0, Math.min(1, value));
  const smooth = (value) => { const t = bounded(value); return t * t * (3 - 2 * t); };

  function wheelPose(amount, pottery = false) {
    const root = document.getElementById("i2-tabletop");
    const solid = root.querySelector("[data-iso-solid]");
    const ground = [.707107, .707107 * island2Iso.slope, -.707107, .707107 * island2Iso.slope];
    const upright = [.9, .9 * island2Iso.slope, 0, 1];
    const matrix = ground.map((value, i) => value + (upright[i] - value) * amount);
    const transform = `matrix(${matrix.join(" ")} 0 0)`;
    root.setAttribute("transform", `translate(0 ${-26 - 12 * amount})`);
    solid.querySelector("[data-iso-face]").setAttribute("transform", transform);
    solid.firstElementChild.setAttribute("transform", `translate(${5 * amount} ${5 - (5 + 5 * island2Iso.slope) * amount})`);
    solid.firstElementChild.firstElementChild.setAttribute("transform", transform);
    document.getElementById("i2-table-feet").setAttribute("transform", `translate(0 -23) scale(1 ${Math.max(.02, 1 - amount)}) translate(0 23)`);
    document.getElementById("i2-waterwheel").setAttribute("transform", `scale(1 ${Math.max(.01, amount)})`);
    document.querySelectorAll("#i2-paddles .i2-paddle").forEach((paddle, index) => {
      const unfold = smooth((amount - .55 - index * .035) / .2);
      paddle.setAttribute("transform", `rotate(${index * 45}) translate(0 -22) scale(1 ${Math.max(.01, unfold)}) translate(0 22)`);
    });
    solid.dataset.isoPlane = amount > .5 ? "x" : "ground";
    document.getElementById("i2-paddles").style.display = amount > .55 ? "" : "none";
    if (pottery) document.getElementById("i2-pottery").setAttribute("transform", "translate(0 -26) scale(1 1) translate(0 26)");
  }

  function assembly(name, duration, delay, update) {
    if (!context?.live) { update(1); return; }
    assemblies.set(name, { start: performance.now() + delay, duration, update });
    update(0);
    wake();
  }

  function buildWheel(duration, delay = 0, pottery = false) {
    assembly("wheel", duration, delay, (t) => {
      if (pottery) {
        wheelPose(0);
        const height = .12 + .88 * smooth(t);
        document.getElementById("i2-pottery").style.display = "";
        document.getElementById("i2-pottery").setAttribute("transform", `translate(0 -26) scale(1 ${height}) translate(0 26)`);
        tableAngle = -t * 270;
        document.getElementById("i2-table-rotor").setAttribute("transform", `rotate(${tableAngle})`);
      } else {
        const amount = smooth((t - .12) / .72);
        document.getElementById("i2-waterwheel").style.display = amount > .15 ? "" : "none";
        wheelPose(amount);
        wheelAngle = -t * 70;
        document.getElementById("i2-wheel-rotor").setAttribute("transform", `rotate(${wheelAngle})`);
      }
    });
  }

  function buildCabin(duration, delay = 0) {
    assembly("cabin", duration, delay, (t) => {
      const open = smooth(t / .45);
      const build = smooth((t - .25) / .7);
      const towerNode = document.getElementById("i2-tower");
      const mask = document.getElementById("i2-tower-growth-rect");
      towerNode.style.display = "";
      towerNode.setAttribute("clip-path", "url(#i2-tower-growth)");
      mask.setAttribute("y", 374 - build * 270);
      mask.setAttribute("height", build * 270);
      document.getElementById("i2-crate-box").setAttribute("transform", `scale(1 ${1 - .7 * open})`);
      document.getElementById("i2-cabin-detail").style.display = "";
      document.getElementById("i2-cabin-detail").setAttribute("transform", `scale(1 ${.1 + .9 * build})`);
      document.getElementById("i2-lid-board").setAttribute("transform", `translate(0 ${-19 * build}) scale(${1 + .16 * build})`);
      if (context.levels.rope >= 2) for (const id of ["i2-scaffold", "i2-scaffold-front"]) {
        const node = document.getElementById(id);
        node.style.display = "";
        node.setAttribute("transform", `translate(0 374) scale(1 ${.3 + .7 * build}) translate(0 -374)`);
      }
      if (t === 1) {
        towerNode.removeAttribute("clip-path");
        entities.get("i2-person-maker").workGrip = null;
      }
    });
  }

  function syncAssemblies() {
    if (!assemblies.has("wheel")) wheelPose(context.levels.wheel >= 2 && context.branches.wheel !== "pottery" ? 1 : 0,
      context.branches.wheel === "pottery");
  }

  function perform(role, points, duration, mode, delay = 0, direction = 1, plane = "front") {
    const id = `i2-person-${role}`;
    context.story.people[role] = [...points.at(-1)];
    const lengths = points.slice(1).map((point, index) => Math.hypot(point[0] - points[index][0], point[1] - points[index][1]));
    const total = lengths.reduce((sum, length) => sum + length, 0);
    let cursor = 0;
    const offsets = [0, ...lengths.map((length) => { cursor += length; return cursor / Math.max(1, total); })];
    move(id, points, duration, offsets, { path: points.map((point) => ({ point, plane, mode: "walk" })), length: total, role, delay });
    act(role, mode, duration, delay, direction);
  }

  function sort() {
    for (const layer of new Set(layers.values())) {
      const sorted = [...entities.values()].filter((entity) => entity.node.parentNode === layer)
        .sort((a, b) => depth(a) - depth(b) || a.id.localeCompare(b.id));
      for (let index = 0; index < sorted.length; index++) {
        if (layer.children[index] !== sorted[index].node) layer.insertBefore(sorted[index].node, layer.children[index] || null);
      }
    }
  }

  function settledPose(entity) {
    if (entity.id === "i2-person-scout" && context.story.sailing) return context.story.leafSail || context.story.craftKind === "leaf" ? "sit" : "row";
    if (context.story.ending === "workshop" && context.levels.wheel === 1 && entity.id !== "i2-person-gardener") return "chat";
    if (entity.id === "i2-person-maker") {
      if (context.branches.wheel === "pottery" && context.levels.wheel >= 2) return "shape";
      if (context.levels.timber >= 2) return "repair";
    }
    if (entity.id === "i2-person-gardener" && context.story.giftReturned) return "offer";
    if (entity.id === "i2-person-gardener" && context.levels.seeds >= 2) return "tend";
    if (entity.id === "i2-person-scout" && context.story.ending === "beacon") return "cargo";
    return "idle";
  }

  function mechanisms(now = performance.now()) {
    const stone = entities.get("i2-cover");
    stone.depth = stone.point[1] + 2;
    if (context.story.crateBoat) entities.get("i2-crate").depth = entities.get("i2-crate").point[1] + 2;
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
    const tether = document.getElementById("i2-tether");
    tether.style.display = context.story.tether ? "" : "none";
    if (context.story.tether) {
      const owner = entities.get(`i2-person-${context.story.tether}`);
      tether.setAttribute("d", `M${owner.point[0]} ${owner.point[1] - 12} ${stone.point[0]} ${stone.point[1] - 6}`);
    }
  }

  function tick(now) {
    frame = undefined;
    if (!context?.live) return;
    const elapsedTime = previous ? Math.min(50, now - previous) : 0;
    clock += elapsedTime;
    previous = now;
    for (const [name, animation] of assemblies) {
      if (now < animation.start) continue;
      const t = bounded((now - animation.start) / animation.duration);
      animation.update(t);
      if (t === 1) assemblies.delete(name);
    }
    for (const [id, journey] of journeys) {
      if (now < journey.start) continue;
      const entity = entities.get(id);
      const time = Math.min(1, (now - journey.start) / journey.duration);
      const progress = journey.path ? time * time * (3 - 2 * time) : time;
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
        const length = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        entity.heading = [(b[0] - a[0]) / length, (b[1] - a[1]) / length];
        entity.height = step.mode === "climb" ? step.plane === "dock" ? Math.min(0, 400 - entity.point[1])
          : Math.max(0, (step.plane === "gallery" ? 404 : 374) - entity.point[1])
          : entity.plane === "gallery" ? 175 : entity.plane === "peak" ? 88 : entity.plane === "underground" ? -60 : entity.plane === "dock" ? -141 : 0;
        const gait = step.mode === "climb" ? "climb" : step.mode === "crawl" ? "crawl" : journey.gait || "walk";
        const acting = acts.get(id);
        if (acting && now >= acting.start && now < acting.start + acting.duration) {
          if (acting.direction) entity.direction = acting.direction;
          pose(entity, acting.mode, (now - acting.start) / 160, (now - acting.start) / acting.duration);
        } else pose(entity, gait, progress * journey.length / 7);
      } else if (id === "i2-boat") setPlane(entity, boatPlane(entity.point));
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
    if (context.story.crateBoat) entities.get("i2-crate").depth = entities.get("i2-crate").point[1] + 2;
    updateFollowers(false);
    for (const entity of entities.values()) {
      if (entity.id.startsWith("i2-person-") && !journeys.has(entity.id)) {
        const performance = acts.get(entity.id);
        if (performance && now >= performance.start && now < performance.start + performance.duration) {
          if (performance.direction) entity.direction = performance.direction;
          pose(entity, performance.mode, (now - performance.start) / 160,
            (now - performance.start) / performance.duration);
        } else {
          const mode = context.finished || !context.busy || entity.id === "i2-person-scout" && context.story.sailing
            ? settledPose(entity) : context.story.celebrating ? "cheer" : entity.pose;
          pose(entity, mode, clock / (context.story.celebrating ? 110 : 180));
        }
      }
    }
    updateFollowers(true);
    const rotate = (id, value) => document.getElementById(id).setAttribute("transform", `rotate(${value})`);
    if (context.levels.wheel >= 2 && context.branches.wheel !== "pottery") {
      wheelAngle += elapsedTime / 9;
      rotate("i2-wheel-rotor", wheelAngle);
    }
    if (context.levels.rope >= 3) rotate("i2-pulley-rotor",
      (entities.get("i2-crate").point[1] - island2Layout.cabinBase[1]) / 10 * 180 / Math.PI);
    if (context.story.producing) document.getElementById("i2-mill-arm").setAttribute("transform", `translate(0 ${-Math.max(0, Math.sin(clock / 180)) * 5})`);
    if (context.branches.wheel === "pottery" && context.levels.wheel >= 2) {
      tableAngle += elapsedTime / 18;
      rotate("i2-table-rotor", tableAngle);
    }
    if (context.levels.lamp >= 3) document.getElementById("i2-beam-pivot").setAttribute("transform", `scale(${Math.cos(clock / 1000)} 1)`);
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
    if (context.story.oarMade) document.getElementById("i2-lid-paddle").setAttribute("transform",
      `rotate(${context.story.sailing && !context.story.leafSail ? -15 + Math.sin(clock / 180) * 22 : 0})`);
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
    for (const animation of assemblies.values()) animation.update(1);
    assemblies.clear();
    for (const [id, journey] of journeys) {
      const entity = entities.get(id);
      if (!journey.idle) {
        place(entity, journey.points.at(-1));
        if (journey.path) setPlane(entity, journey.path.at(-1).plane);
        if (journey.plane) setPlane(entity, journey.plane);
      }
      if (journey.role) context.story.people[journey.role] = [...entity.point];
      if (id === "i2-boat") setPlane(entity, boatPlane(entity.point));
      entity.pose = "idle";
      entity.workGrip = null;
      pose(entity, "idle");
    }
    journeys.clear();
    acts.clear();
    updateFollowers(false);
    updateFollowers(true);
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
    for (const name of ["background", "sea-back", "base", "floor", "underground", "world", "cave", "optics", "sea-front"]) {
      const layer = svg("g", { id: `i2-layer-${name}` });
      if (name === "cave") layer.setAttribute("clip-path", "url(#i2-cave-mask)");
      if (name === "underground") layer.setAttribute("clip-path", "url(#i2-under-mask)");
      layers.set(name, layer);
      root.append(layer);
    }
    for (const name of ["ground-back", "walls", "terrace", "peak", "front", "gallery"]) layers.set(name, layers.get("world"));
    layers.set("dock", layers.get("sea-front"));
    for (const [id, plane, point, anchor] of [
      ["i2-background", "background", [0, 0], -1000], ["i2-base-terrain", "base", [0, 0], -1000],
      ["i2-cutaway", "base", [0, 0], 1], ["i2-magnet", "underground", [254, 475], 476],
      ["i2-middle-walls", "walls", [0, 0], 382], ["i2-cave", "walls", [0, 0], 1], ["i2-cover", "front", island2Layout.coverHome],
      ["i2-water", "walls", [0, 0], 316],
      ["i2-tower", "peak", [0, 0], 374], ["i2-lamp", "front", island2Layout.lampRest], ["i2-glass", "front", island2Layout.glassRest],
      ["i2-gallery-rail", "front", [0, 0], 410],
      ["i2-tea", "front", island2Layout.wheelRest, 401],
      ["i2-beam", "optics", [0, 0], 189], ["i2-seeds", "front", [0, 0], 356], ["i2-stream", "floor", [0, 0], 339],
      ["i2-overflow", "floor", [0, 0], 355],
      ["i2-outfall", "floor", [0, 0], 615], ["i2-cliff-ladder", "front", [0, 0], 413],
      ["i2-cliff-steps", "front", [0, 0], 368], ["i2-scaffold", "front", [0, 0], 363],
      ["i2-scaffold-front", "front", [0, 0], 363 + 52 * island2Iso.slope], ["i2-scaffold-short", "front", [0, 0], 372],
      ["i2-crate", "front", island2Layout.crateRest, 374], ["i2-wheel", "front", island2Layout.wheelRest, 420],
      ["i2-crate-lid", "front", island2Layout.crateRest, 376],
      ["i2-lily", "front", island2Layout.lily, 355], ["i2-fish", "front", island2Layout.fish, 356],
      ["i2-rope-coil", "front", island2Layout.rope, 290], ["i2-copper", "front", island2Layout.copper, 436],
      ["i2-drive", "front", [0, 0], 390], ["i2-wire", "front", [0, 0], 391],
      ["i2-dock", "sea-front", [0, 141], 413],
      ["i2-port-rope", "front", [0, 0], 375], ["i2-cargo", "front", island2Layout.cargoBoat, 376],
      ["i2-production", "cave", [0, 0], 365], ["i2-cave-lip", "front", [0, 0], 383],
      ["i2-splash", "front", [0, 0], 450], ["i2-gift", "front", [0, 0], 450],
      ["i2-tether", "front", [0, 0], 447],
      ["i2-reflection", "front", [0, 0], 449],
      ["i2-boat", "sea-back", island2Layout.boatWaiting, 0],
    ]) register(id, plane, point, anchor);
    const room = entities.get("i2-middle-walls").node;
    room.append(entities.get("i2-cave").node, layers.get("cave"), entities.get("i2-cave-lip").node);
    const tower = entities.get("i2-tower").node;
    tower.insertBefore(layers.get("optics"), document.getElementById("i2-roof"));
    for (const [role, name] of [["scout", "spring"], ["maker", "inside"], ["gardener", "rear"]]) {
      const old = document.getElementById(`i2-person-${role}`);
      old.replaceWith(person(role));
      register(`i2-person-${role}`, nodes[name].plane, nodes[name].point);
    }
    document.getElementById("i2-person-scout").querySelector(".i2-facing").append(document.getElementById("i2-reaction"));
    document.getElementById("i2-reaction").setAttribute("transform", "translate(0 -77)");
    for (const entity of entities.values()) place(entity, entity.point);
    follow("i2-crate-lid", "i2-crate", [0, 0], { depthBias: 2 });
    sort();
  }

  function sync(next) {
    context = next;
    syncAssemblies();
    if (!next.live) freeze();
    else wake();
    if (!next.busy || next.finished) for (const entity of entities.values()) {
      if (entity.id.startsWith("i2-person-") && !journeys.has(entity.id)) pose(entity, settledPose(entity), .9);
    }
    mechanisms();
    updateFollowers(false);
    updateFollowers(true);
    sort();
  }

  function reset() {
    freeze();
    followers.clear();
    clock = 0;
    wheelAngle = 0;
    tableAngle = 0;
    idleAt = performance.now() + 1600;
    idleRole = 0;
    for (const entity of entities.values()) {
      setPlane(entity, entity.initial.plane);
      place(entity, entity.initial.point);
      entity.depth = entity.initial.depth;
      entity.direction = 1;
      entity.pose = "idle";
      entity.height = 0;
      entity.heading = [1, island2Iso.slope];
      entity.workGrip = null;
    }
    for (const id of ["i2-wheel-rotor", "i2-table-rotor", "i2-pulley-rotor", "i2-mill-arm"]) {
      document.getElementById(id).setAttribute("transform", "translate(0 0)");
    }
    for (const id of ["i2-crate-box", "i2-cabin-detail"]) document.getElementById(id).removeAttribute("transform");
    document.getElementById("i2-tower").removeAttribute("clip-path");
    wheelPose(0);
    document.getElementById("i2-beam-pivot").setAttribute("transform", "scale(1 1)");
    document.getElementById("i2-lens-rings").setAttribute("transform", "scale(1 1)");
    document.getElementById("i2-lid-paddle").setAttribute("transform", "rotate(0)");
    for (const [role, node] of [["scout", "spring"], ["maker", "inside"], ["gardener", "rear"]]) {
      const entity = entities.get(`i2-person-${role}`);
      entity.pose = "idle";
      setPlane(entity, nodes[node].plane);
      place(entity, nodes[node].point);
      pose(entity, "idle");
    }
    follow("i2-crate-lid", "i2-crate", [0, 0], { depthBias: 2 });
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
      entity.workGrip = null;
      pose(entity, "idle");
    }
  }

  function elevate(id, raised, moving = false) {
    const entity = entities.get(id);
    if (moving) { setPlane(entity, "front"); entity.depth = 375; }
    else if (!journeys.has(entity.id)) {
      setPlane(entity, raised ? "optics" : "front");
      entity.depth = raised ? id === "i2-glass" ? 194 : 192 : entity.point[1] + 2;
    }
  }

  const glass = (raised, moving) => elevate("i2-glass", raised, moving);
  const lamp = (raised, moving) => elevate("i2-lamp", raised, moving);
  function discPlane(id, plane) {
    const node = document.getElementById(id);
    const solid = node.querySelector("[data-iso-solid]");
    solid.dataset.isoPlane = plane;
    solid.querySelector("[data-iso-face]").setAttribute("transform", island2Iso.face(plane));
    const back = solid.firstElementChild;
    back.setAttribute("transform", plane === "ground" ? "translate(0 5)" : `translate(5 ${-5 * island2Iso.slope})`);
    back.firstElementChild.setAttribute("transform", island2Iso.face(plane));
  }
  return { mount, position, move, actor, act, perform, follow, release, sync, reset, clear, parcel,
    glass, lamp, discPlane, buildWheel, buildCabin, stopIdle, nodes, entities, journeys, followers, acts, assemblies };
})();
