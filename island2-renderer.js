"use strict";

const island2ActorScale = .56;
const island2ActorScaleY = island2ActorScale / island2View.scaleY;

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
  const upgrades = new Map();
  let upgradeLayer;
  let upgradeSequence = 0;
  let frame;
  let context;
  let previous = 0;
  let clock = 0;
  let wheelAngle = 0;
  let generatorAngle = 0;
  let tableAngle = 0;
  let shovelAngle = -15;
  let stonePose = { tilt: 0, yaw: 0 };
  let stoneFrame;
  const nodes = {
    farm: { point: [135, 367], plane: "front" },
    rear: { point: [340, 331], plane: "ground-back" },
    cave: { point: [340, 389], plane: "front" },
    inside: { point: [333, 378], plane: "cave" },
    workshop: { point: [379, 398], plane: "front" },
    potter: { point: [267, 392], plane: "front" },
    teaLeft: { point: [204, 389], plane: "front" },
    teaRight: { point: [283, 408], plane: "front" },
    wheel: { point: [195, 383], plane: "front" },
    mill: { point: [287, 423], plane: "front" },
    landing: { point: [377, 421], plane: "front" },
    generator: { point: [351, 429], plane: "front" },
    lift: { point: [383, 382], plane: "front" },
    dock: { point: island2Sea([507, 541]), plane: "dock" },
    dockTop: { point: [507, 400], plane: "front" },
    stairs: { point: [383, 370], plane: "front" },
    terrace: { point: [282, 327], plane: "terrace" },
    spring: { point: [204, 336], plane: "terrace" },
    behind: { point: [237, 283], plane: "ground-back" },
    summit: { point: [439, 286], plane: "peak" },
    balcony: { point: [435, 288], plane: "peak" },
    lantern: { point: [488, 212], plane: "gallery" },
    upperLoad: { point: [455, 241], plane: "gallery" },
    tunnel: { point: [238, 480], plane: "underground" },
    bridge: { point: [283, 424], plane: "front", height: island2Stone.thickness },
    pondEdge: { point: [155, 359], plane: "front" },
    shore: { point: island2Sea([524, 503]), plane: "dock" },
    shoreTop: { point: [524, 362], plane: "front" },
  };
  const edges = [
    ["rear", "farm", [[278, 341], [249, 348], [204, 357]], "around"],
    ["farm", "cave", [[219, 365], [283, 389]]],
    ["cave", "inside", [], "door", "workshop"],
    ["cave", "workshop", []],
    ["cave", "potter", [[284, 406]]],
    ["wheel", "teaLeft", []], ["mill", "teaRight", []],
    ["cave", "wheel", [[287, 409]]],
    ["cave", "stairs", [[377, 393]]],
    ["wheel", "mill", [[236, 402]]],
    ["mill", "generator", []],
    ["generator", "landing", []],
    ["landing", "stairs", []],
    ["landing", "lift", []],
    ["lift", "dockTop", [[446, 402]]],
    ["dockTop", "dock", [], "climb"],
    ["stairs", "terrace", [[377, 395], [282, 393]]],
    ["terrace", "spring", [[252, 347], [217, 347]]],
    ["terrace", "behind", [[294, 323], [294, 295], [268, 283]]],
    ["stairs", "summit", [[405, 347], [405, 313]], "climb"],
    ["summit", "balcony", []],
    ["balcony", "upperLoad", [[427, 263], [435, 239]], "climb"],
    ["upperLoad", "lantern", [[463, 226]]],
    ["inside", "tunnel", [[317, 410], [289, 457], [254, 473]], "crawl", "cutaway"],
    ["wheel", "bridge", [[236, 414]], "walk", "bridge"],
    ["bridge", "generator", [], "walk", "bridge"],
    ["farm", "pondEdge", []], ["lift", "shoreTop", [[481, 375]]],
    ["shoreTop", "shore", [[507, 400], island2Sea([507, 483])], "climb"],
    ["dock", "shore", [island2Sea([524, 520])]],
  ];

  function svg(tag, attributes = {}) {
    const node = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, value);
    return node;
  }

  function worldPoint(node, point = new DOMPoint()) {
    const root = document.querySelector("#island2-art > svg");
    let matrix = new DOMMatrix();
    for (let current = node; current !== root; current = current.parentElement) {
      const transform = current.transform.baseVal.consolidate()?.matrix;
      if (transform) matrix = new DOMMatrix([transform.a, transform.b, transform.c, transform.d, transform.e, transform.f]).multiply(matrix);
    }
    return point.matrixTransform(matrix);
  }

  function person(role) {
    const root = svg("g", { id: `i2-person-${role}`, class: "i2-person", stroke: "none" });
    root.append(svg("ellipse", { class: "i2-person-shadow", cy: 0, rx: 12 * island2ActorScale,
      ry: 12 * island2ActorScale * island2Iso.slope, fill: "#486b53", opacity: ".2" }));
    const figure = svg("g", { transform: `scale(${island2ActorScale} ${island2ActorScaleY})` });
    const facing = svg("g", { class: "i2-facing" });
    for (const material of ["head", "body"]) {
      const gradient = document.getElementById(`i2-skin-${material}`).cloneNode(true);
      gradient.id = `i2-skin-${material}-${role}`;
      document.querySelector("#island2-art svg defs").append(gradient);
    }
    const body = svg("g", { class: "i2-body", stroke: "#34372b", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round" });
    const limb = (name, d, back = false) => [
      svg("path", { class: name, d, stroke: "#34372b", "stroke-width": "8.5", fill: "none" }),
      svg("path", { class: `${name}-core`, d, stroke: back ? "#ecee9d" : "#ffffad", "stroke-width": "5.5", fill: "none" }),
    ];
    body.append(...limb("i2-leg-back", "M-4-12Q-5-7-6-2", true));
    body.append(...limb("i2-arm-back", "M-6-32Q-13-25-12-19", true));
    body.append(...limb("i2-leg-front", "M4-12Q5-7 7-2"));
    body.append(...limb("i2-arm-front", "M6-32Q12-25 12-18"));
    body.append(svg("path", { d: "M-9-34Q0-39 9-34q5 9 1 17-2 7-10 7t-10-7q-4-9 1-17Z", fill: `url(#i2-skin-body-${role})` }));
    const head = svg("g", { class: "i2-head" });
    head.append(svg("circle", { cy: -45, r: 15, fill: `url(#i2-skin-head-${role})` }));
    const palm = (side, x, y) => svg("circle", { class: `i2-palm-${side}`, cx: x, cy: y, r: 3.8, fill: "#ffffad" });
    const hand = svg("g", { class: "i2-hand" });
    const tool = svg("g", { class: "i2-task-prop", stroke: "#514f3e", "stroke-width": "2.5", "stroke-linejoin": "round" });
    tool.append(svg("path", { d: role === "gardener" ? "M0 0 8 8m-2-2 4-2 4 5-4 3Z"
      : role === "maker" ? "M0 0 7-9m-3 1 4-3 6 6-4 3Z"
        : "M-4-7 5-11 13-7V3L5 7-4 3Zm0 0 9 4 8-4M5-3V7", fill: role === "gardener" ? "#b9c9a8" : "#edc98a" }));
    hand.append(tool);
    hand.append(svg("path", { class: "i2-dig-tool", d: "M0 0 11 12m-5-3 9-5 5 9-9 5Z",
      fill: "#b9c9a8", stroke: "#514f3e", "stroke-width": "2.5", display: "none" }));
    body.append(head, palm("back", -12, -19), palm("front", 12, -18), hand);
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
    if (id.startsWith("i2-person-")) {
      const role = id.slice("i2-person-".length);
      entity.lighting = { head: document.getElementById(`i2-skin-head-${role}`),
        body: document.getElementById(`i2-skin-body-${role}`) };
    }
    entities.set(id, entity);
    node.dataset.plane = plane;
    layers.get(plane).append(node);
    return entity;
  }

  function setPlane(entity, plane) {
    if (entity.id.startsWith("i2-person-")) entity.height = plane === "gallery" ? 175
      : plane === "peak" ? 88 : plane === "underground" ? -70 : plane === "dock" ? 19 - island2View.depth : 0;
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
    const [x, y] = island2Iso.unproject(point, -island2View.depth);
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
    return Object.keys(nodes).filter((key) => key !== "bridge" || context?.story.bridgeBuilt).reduce((best, key) =>
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
        if (requirement === "cutaway" && !context.story.cutawayOpen ||
            requirement === "bridge" && !context.story.bridgeBuilt ||
            requirement === "workshop" && !context.story.workshopOpen) continue;
        const next = a === key ? b : b === key ? a : undefined;
        if (next && !visited.has(next)) {
          visited.add(next);
          queue.push([...path, next]);
        }
      }
    }
    if (!chain.length) throw new Error(`Brak drogi między ${start} i ${end}.`);
    const result = [{ point: origin, plane: nodes[start].plane, mode: "walk",
      height: Math.hypot(origin[0] - nodes[start].point[0], origin[1] - nodes[start].point[1]) < 2 ? nodes[start].height : undefined }];
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
    const walking = ["walk", "climb", "run", "heavy", "umbrella", "channel"].includes(mode);
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
    const crouch = working || tending ? 3 + (1 - Math.cos(phase)) * 2.25 : 0;
    if (shaping) entity.direction = -1;
    if (tending || carrying) entity.direction = 1;
    if (chatting) entity.direction = entity.point[0] < island2Layout.wheelRest[0] ? 1 : -1;
    entity.node.querySelector(".i2-facing").setAttribute("transform", `scale(${entity.direction} 1)`);
    body.setAttribute("transform", `translate(0 ${walking ? -Math.abs(front) * 1.7 : cheering ? -Math.max(0, front) * 8 : crouch}) rotate(${working || tending ? 12 + front * 3 : 0} 0 -12)`);
    const heading = entity.heading || [1, island2Iso.slope];
    const stepX = Math.abs(heading[0]);
    entity.node.querySelector(".i2-leg-front").setAttribute("d", `M4-12Q${4 + stride * stepX * .45} ${-7 - lift - crouch * .4} ${5 + stride * stepX} ${-2 - lift - crouch + stride * heading[1]}`);
    entity.node.querySelector(".i2-leg-back").setAttribute("d", `M-4-12Q${-4 + otherStride * stepX * .45} ${-7 - otherLift - crouch * .4} ${-5 + otherStride * stepX} ${-2 - otherLift - crouch + otherStride * heading[1]}`);
    const handY = mode === "channel" ? -22 + front * 2 : mode === "climb" || cheering ? -43 - front * 9 : shaping ? -50 + front * 3
      : tending ? -23 + front * 3 : chatting ? -31 + front * 2 : carrying || holding ? -26 : working ? -24 - Math.max(0, front) * 18 : -18;
    const handX = mode === "channel" ? -18 * entity.direction : shaping ? 19 : working || holding || tending || carrying ? 17 : 12 - stride * .55;
    entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q${handX + 2} ${handY - 3} ${handX} ${handY}`);
    entity.node.querySelector(".i2-arm-back").setAttribute("d", shaping || carrying
      ? `M-6-32Q8 ${handY - 5} 15 ${handY}`
      : `M-6-32Q${-12 - otherStride * .4} ${mode === "climb" || cheering ? -47 + front * 8 : -25} ${-12 - otherStride * .55} ${mode === "climb" || cheering ? -44 + front * 8 : -19}`);
    let activeHand = [handX, handY];
    if (mode === "push" || mode === "pull") {
      body.setAttribute("transform", mode === "pull" ? `translate(0 4) rotate(${-10 + front * 2} 0 -12)`
        : `translate(${front * 1.5} ${2 + Math.abs(front) * 2}) skewX(-12)`);
      entity.node.querySelector(".i2-leg-front").setAttribute("d", `M4-12Q15-7 ${16 + front * 5} ${-2 - Math.max(0, front) * 3}`);
      entity.node.querySelector(".i2-leg-back").setAttribute("d", `M-4-12Q-12-7 ${-13 - front * 5} ${-2 - Math.max(0, -front) * 3}`);
      entity.node.querySelector(".i2-arm-front").setAttribute("d", mode === "pull" ? "M6-32Q16-33 13-26" : `M6-32Q19-33 24 ${-27 + front * 2}`);
      entity.node.querySelector(".i2-arm-back").setAttribute("d", mode === "pull" ? "M-6-32Q4-37 11-29" : `M-6-32Q10-36 22 ${-31 + front * 2}`);
      activeHand = mode === "pull" ? [13, -26] : [24, -27 + front * 2];
    } else if (balancing) {
      activeHand = [0, -23];
      entity.node.querySelector(".i2-arm-front").setAttribute("d", "M6-32Q12-25 0-23");
      entity.node.querySelector(".i2-arm-back").setAttribute("d", "M-6-32Q-12-25 0-23");
    } else if (mode === "kneel" || mode === "dig" || mode === "polish") {
      body.setAttribute("transform", "translate(0 7) rotate(14 0 -12)");
      activeHand = [mode === "polish" ? 20 + front * 5 : 20, mode === "dig" ? -25 + front * 9 : -21 + front * 2];
      entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q24-26 ${activeHand.join(" ")}`);
    } else if (mode === "crawl") {
      body.setAttribute("transform", "translate(-18 10) rotate(75 0 -18)");
      entity.node.querySelector(".i2-leg-front").setAttribute("d", `M4-12Q14 ${-8 + front * 3}-2-8`);
      entity.node.querySelector(".i2-leg-back").setAttribute("d", `M-4-12Q-12 ${-7 - front * 3}-10-12`);
      entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q19-35 17 ${-43 + front * 3}`);
      entity.node.querySelector(".i2-arm-back").setAttribute("d", `M-6-32Q8-40 11 ${-45 - front * 3}`);
      activeHand = [17, -43 + front * 3];
    } else if (mode === "sit" || mode === "row") {
      body.setAttribute("transform", `translate(0 ${12 + (mode === "row" ? front * 1.5 : 0)})`);
      entity.node.querySelector(".i2-leg-front").setAttribute("d", "M4-12Q17-17 18-12");
      entity.node.querySelector(".i2-leg-back").setAttribute("d", "M-4-12Q-13-16-15-12");
      activeHand = [22 + (mode === "row" ? front * 7 : 0), -29 + (mode === "row" ? Math.cos(phase) * 5 : 0)];
      entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q20-37 ${activeHand.join(" ")}`);
      entity.node.querySelector(".i2-arm-back").setAttribute("d", `M-6-32Q9-35 ${activeHand[0] - 4} ${activeHand[1] - 2}`);
    } else if (mode === "startle") {
      body.setAttribute("transform", `translate(0 ${-Math.sin(progress * Math.PI) * 18})`);
      entity.node.querySelector(".i2-arm-front").setAttribute("d", "M6-32Q20-40 18-54");
      entity.node.querySelector(".i2-arm-back").setAttribute("d", "M-6-32Q-20-40-18-54");
      activeHand = [18, -54];
    } else if (mode === "look" || mode === "shelter" || mode === "offer" || mode === "umbrella") {
      activeHand = mode === "look" ? [18, -43] : mode === "shelter" || mode === "umbrella" ? [15, -43] : [25, -27];
      entity.node.querySelector(".i2-arm-front").setAttribute("d", `M6-32Q20-39 ${activeHand.join(" ")}`);
    }
    if (working || tending || ["kneel", "dig", "polish", "push", "pull"].includes(mode)) {
      const inverse = body.transform.baseVal.consolidate().matrix.inverse();
      const kneeling = ["kneel", "dig", "polish"].includes(mode);
      for (const side of [-1, 1]) {
        const x = mode === "push" || mode === "pull" ? side === 1 ? 16 + front * 5 : -13 - front * 5
          : kneeling ? side === 1 ? 14 : -11 : side * 8;
        const raised = mode === "push" || mode === "pull" ? Math.max(0, front * side) * 3 : 0;
        const foot = new DOMPoint(x, -2 - raised).matrixTransform(inverse);
        const leg = side === 1 ? "front" : "back";
        entity.node.querySelector(`.i2-leg-${leg}`).setAttribute("d",
          `M${side * 4}-12Q${side * (kneeling ? 15 : 8)} -5 ${foot.x} ${foot.y}`);
      }
    }
    if (mode === "dig" && entity.sowing) {
      entity.node.querySelector(".i2-arm-back").setAttribute("d",
        `M-6-32Q-13-23 ${-12 + Math.sin(entity.sowing * Math.PI * 4) * 5} -17`);
    }
    for (const limb of ["i2-leg-front", "i2-leg-back", "i2-arm-front", "i2-arm-back"]) {
      entity.node.querySelector(`.${limb}-core`).setAttribute("d", entity.node.querySelector(`.${limb}`).getAttribute("d"));
    }
    entity.node.querySelector(".i2-hand").setAttribute("transform", `translate(${activeHand.join(" ")})`);
    entity.node.querySelector(".i2-head").setAttribute("transform", `translate(${working || shaping ? 2 : 0} ${shaping ? 1 : working ? crouch * .3 : 0})`);
    entity.node.dataset.pose = mode;
    entity.node.querySelector(".i2-person-shadow").setAttribute("opacity", ["climb", "crawl", "row", "sit"].includes(mode) ? ".05" : ".2");
    entity.node.querySelector(".i2-task-prop").style.display = tending || mode === "repair" || carrying ? "" : "none";
    const holdsShovel = followers.get("i2-shovel")?.target === entity.id;
    entity.node.querySelector(".i2-dig-tool").setAttribute("display",
      (mode === "dig" || mode === "channel") && !holdsShovel ? "" : "none");
    entity.node.querySelector(".i2-dig-tool").setAttribute("transform", mode === "channel" && entity.direction === 1 ? "scale(-1 1)" : "");
    syncPalms(entity);
    lightPerson(entity, body);
  }

  function lightPerson(entity, body) {
    const matrix = new DOMMatrix().scaleSelf(1, 1 / island2View.scaleY).scaleSelf(entity.direction, 1)
      .multiplySelf(body.transform.baseVal.consolidate().matrix);
    const parcel = entity.node.querySelector("#i2-parcel");
    if (parcel) {
      const inverse = matrix.inverse();
      parcel.setAttribute("transform", `translate(2 2) matrix(${inverse.a * .65} ${inverse.b * .65} ${inverse.c * .65} ${inverse.d * .65} 0 0)`);
    }
    const signature = [matrix.a, matrix.b, matrix.c, matrix.d].join(",");
    if (entity.lightPose === signature) return;
    entity.lightPose = signature;
    island2Lighting.paint(entity.lighting.head, matrix, 30, 30);
    island2Lighting.paint(entity.lighting.body, matrix, 22, 28);
  }

  function setPalm(entity, side, point) {
    const palm = entity.node.querySelector(`.i2-palm-${side}`);
    palm.setAttribute("cx", point.x);
    palm.setAttribute("cy", point.y);
  }

  function syncPalms(entity) {
    for (const side of ["front", "back"]) {
      const path = entity.node.querySelector(`.i2-arm-${side}`);
      setPalm(entity, side, path.getPointAtLength(path.getTotalLength()));
    }
  }

  function move(id, points, duration, offsets, options = {}) {
    const entity = entities.get(id);
    if (!entity) throw new Error(`Ruch niezarejestrowanego elementu: ${id}`);
    journeys.delete(id);
    if (!context?.live) {
      place(entity, points.at(-1));
      if (options.path) {
        setPlane(entity, options.path.at(-1).plane);
        if (options.path.at(-1).height !== undefined) entity.height = options.path.at(-1).height;
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
    for (const [id, link] of followers) {
      if (Boolean(link.hand) !== hands) continue;
      const entity = entities.get(id);
      const target = entities.get(link.target);
      let point = target.point;
      if (hands) {
        const hand = target.node.querySelector(".i2-hand");
        const origin = worldPoint(hand);
        point = [origin.x, origin.y];
      }
      const desired = link.to || point.map((value, axis) => value + link.offset[axis]);
      const blend = link.blend && context?.live ? Math.min(1, (performance.now() - link.start) / link.blend) : 1;
      place(entity, desired.map((value, axis) => link.from[axis] + (value - link.from[axis]) * blend));
      if (!context?.live) link.blend = 0;
      setPlane(entity, link.plane || target.plane);
      entity.depth = depth(target) + (link.depthBias ?? 1);
      if (link.support) entity.depth = Math.max(entity.depth, depth(entities.get(link.support)) + 1);
      if (hands && ["i2-tea", "i2-clay"].includes(id) && nearTable(entity)) {
        entity.depth = Math.max(entity.depth, depth(entities.get("i2-wheel")) + 1);
      }
    }
    if (hands) gripHands();
  }

  function gripHands() {
    for (const [id, link] of followers) {
      if (!link.hand || !["i2-glass", "i2-lamp", "i2-shovel", "i2-clay", "i2-tea", "i2-magnet"].includes(id)) continue;
      const carrier = entities.get(link.target);
      const prop = entities.get(id);
      const body = carrier.node.querySelector(".i2-body");
      const surface = id === "i2-magnet" ? document.getElementById("i2-found-magnet") : prop.node;
      const matrix = body.getCTM().inverse().multiply(surface.getCTM());
      const grips = id === "i2-glass" ? carrier.plane === "gallery" ? [[10, -4], [10, 12]]
        : [[-12, -12 * island2Iso.slope], [12, 12 * island2Iso.slope]]
        : id === "i2-lamp" ? [[8, -12]] : id === "i2-tea" ? [[10, -34]]
          : id === "i2-magnet" ? [[-11, -10], [11, -10]] : [[0, 0]];
      grips.forEach((point, index) => {
        const contact = new DOMPoint(...point).matrixTransform(matrix);
        const side = index || !["i2-glass", "i2-magnet"].includes(id) ? "front" : "back";
        const shoulder = side === "front" ? 6 : -6;
        const d = `M${shoulder}-32Q${(shoulder + contact.x) / 2} ${Math.max(-25, contact.y + 6)} ${contact.x} ${contact.y}`;
        carrier.node.querySelector(`.i2-arm-${side}`).setAttribute("d", d);
        carrier.node.querySelector(`.i2-arm-${side}-core`).setAttribute("d", d);
        setPalm(carrier, side, contact);
      });
    }
    for (const carrier of entities.values()) {
      if (!carrier.workGrip || context?.live && carrier.workGrip.start > performance.now()) continue;
      const { prop, side, kind } = carrier.workGrip;
      const owner = document.getElementById(prop);
      const face = kind ? owner : owner.querySelector("[data-iso-face]");
      const body = carrier.node.querySelector(".i2-body");
      const matrix = body.getCTM().inverse().multiply(face.getCTM());
      [-1, 1].forEach((hand, i) => {
        const local = kind === "pottery" ? new DOMPoint(i ? 14 : 7, i ? -34 : -35)
          : kind === "generator" ? new DOMPoint(i ? -8 : -13, i ? -17 : -13)
          : kind === "valve" ? owner.getPointAtLength(owner.getTotalLength() * (i ? .65 : .35))
            : new DOMPoint(side * 25, hand * 5);
        const contact = new DOMPoint(local.x, local.y).matrixTransform(matrix);
        const name = i ? "front" : "back";
        const d = `M${i ? 6 : -6}-32Q${contact.x * .65} ${contact.y + 10} ${contact.x} ${contact.y}`;
        carrier.node.querySelector(`.i2-arm-${name}`).setAttribute("d", d);
        carrier.node.querySelector(`.i2-arm-${name}-core`).setAttribute("d", d);
        setPalm(carrier, name, contact);
      });
    }
    updateContactLayers();
  }

  function nearTable(entity) {
    const table = entities.get("i2-wheel");
    return Math.abs(entity.point[0] - table.point[0]) < 42 &&
      entity.point[1] > table.point[1] - 48 && entity.point[1] < table.point[1] + 30;
  }

  function updateContactLayers() {
    const viewport = document.querySelector("#island2-art > svg");
    for (const role of ["scout", "maker", "gardener"]) {
      const owner = entities.get(`i2-person-${role}`);
      if (!owner?.contactLayer) continue;
      const held = ["i2-tea", "i2-clay"].some((id) =>
        followers.get(id)?.hand && followers.get(id).target === owner.id && nearTable(entities.get(id)));
      const working = ["i2-tabletop", "i2-pottery"].includes(owner.workGrip?.prop) &&
        (!context?.live || !owner.workGrip.start || performance.now() >= owner.workGrip.start);
      const magnet = followers.get("i2-magnet");
      const assembling = magnet?.hand && magnet.target === owner.id && magnet.support ||
        owner.workGrip?.kind === "generator" &&
        (!context?.live || !owner.workGrip.start || performance.now() >= owner.workGrip.start);
      const active = (held || working || assembling) && owner.node.parentNode === layers.get("world");
      owner.contactLayer.node.style.display = active ? "" : "none";
      if (!active) continue;
      const matrix = viewport.getCTM().inverse().multiply(owner.node.querySelector(".i2-body").getCTM());
      owner.contactLayer.node.setAttribute("transform",
        `matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})`);
      owner.contactLayer.depth = depth(entities.get(assembling ? "i2-copper" : "i2-wheel")) + 3;
      owner.contactParts.forEach(([source, copy]) => {
        for (const key of source.tagName === "path" ? ["d"] : ["cx", "cy"]) copy.setAttribute(key, source.getAttribute(key));
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
    root.setAttribute("transform", `translate(0 ${-26 - 5 * amount})`);
    solid.querySelector("[data-iso-face]").setAttribute("transform", transform);
    solid.firstElementChild.setAttribute("transform", `translate(${5 * amount} ${5 - (5 + 5 * island2Iso.slope) * amount})`);
    solid.firstElementChild.firstElementChild.setAttribute("transform", transform);
    const faceMatrix = solid.querySelector("[data-iso-face]").transform.baseVal.consolidate().matrix;
    island2Lighting.paint(document.getElementById("i2-wood-round"), faceMatrix, 60, 60);
    island2Lighting.reflection(document.getElementById("i2-wood-highlight"), faceMatrix);
    document.getElementById("i2-table-feet").setAttribute("transform", `translate(0 -23) scale(1 ${Math.max(.02, 1 - amount)}) translate(0 23)`);
    document.getElementById("i2-waterwheel").setAttribute("transform", `scale(1 ${Math.max(.01, amount)})`);
    document.querySelectorAll("#i2-paddles .i2-paddle").forEach((paddle, index) => {
      const unfold = smooth((amount - .55 - index * .035) / .2);
      paddle.setAttribute("transform", `rotate(${index * 45}) translate(0 -22) scale(1 ${Math.max(.01, unfold)}) translate(0 22)`);
    });
    solid.dataset.isoPlane = amount > .5 ? "x" : "ground";
    document.getElementById("i2-paddles").style.display = amount > .55 ? "" : "none";
    if (pottery) {
      document.getElementById("i2-pottery").setAttribute("transform", "translate(0 -26) scale(1 1) translate(0 26)");
      island2Lighting.paint(document.getElementById("i2-pot-round"), new DOMMatrix(), 38, 23);
    }
  }

  function assembly(name, duration, delay, update) {
    if (!context?.live) { update(1); return; }
    assemblies.set(name, { start: performance.now() + delay, duration, update });
    update(0);
    wake();
  }

  function shovelPose(angle) {
    shovelAngle = angle;
    document.getElementById("i2-shovel-pose").setAttribute("transform", `rotate(${angle})`);
  }

  function turnShovel(angle, duration = 350) {
    const from = shovelAngle;
    assembly("shovel", duration, 0, (t) => shovelPose(from + (angle - from) * smooth(t)));
  }

  function digField(duration) {
    const field = document.getElementById("i2-seeds");
    const clods = document.getElementById("i2-field-clods");
    const seeds = document.getElementById("i2-sowing-seeds");
    const gardener = entities.get("i2-person-gardener");
    const sow = context.branches.seeds === "field";
    const markers = [...document.querySelectorAll("#i2-seeds .i2-seed-first ellipse")];
    field.setAttribute("clip-path", "url(#i2-field-work-mask)");
    clods.style.display = "";
    assembly("field", duration, 0, (t) => {
      document.querySelector("#i2-field-work-mask path").setAttribute("d", island2Work.fieldClip(smooth(t)));
      const tip = worldPoint(document.getElementById("i2-shovel-pose"), new DOMPoint(0, 20));
      [...clods.children].forEach((node, i) => {
        const p = (t * 6 + i / 3) % 1;
        node.setAttribute("transform", `translate(${tip.x - 8 + i * 5 + p * 6} ${tip.y - 3 - Math.sin(p * Math.PI) * 9})`);
        node.setAttribute("opacity", 1 - p);
      });
      const planting = bounded((t - .67) / .33);
      gardener.sowing = sow ? planting : 0;
      seeds.style.display = sow && planting > 0 && t < 1 ? "" : "none";
      if (sow) {
        const palm = gardener.node.querySelector(".i2-palm-back");
        const from = worldPoint(palm, new DOMPoint(+palm.getAttribute("cx"), +palm.getAttribute("cy")));
        const to = [[139, 331], [157, 326], [173, 338]];
        [...seeds.children].forEach((node, i) => {
          const p = bounded((planting - i * .12) / .64);
          node.setAttribute("transform", `translate(${from.x + (to[i][0] - from.x) * p} ${from.y + (to[i][1] - from.y) * p - Math.sin(p * Math.PI) * 7})`);
          node.setAttribute("opacity", p > 0 && p < 1 ? 1 : 0);
          markers[i].style.opacity = p === 1 ? "1" : "0";
        });
      }
      if (t === 1) {
        field.removeAttribute("clip-path");
        clods.style.display = "none";
        seeds.style.display = "none";
        gardener.sowing = 0;
        markers.forEach((node) => { node.style.opacity = ""; });
      }
    });
  }

  function knockDoor(duration) {
    const from = { ...stonePose };
    assembly("stone", duration, 0, (t) => drawStone(from.tilt,
      from.yaw + Math.sin(t * Math.PI * 6) * .06 * (1 - t)));
  }

  function braceSource(duration) {
    const pieces = [...document.getElementById("i2-valve").children];
    assembly("source-brace", duration, 0, (t) => {
      pieces.forEach((node, i) => { node.style.opacity = t === 1 ? "" : String(smooth(t * 2 - i / 8)); });
    });
  }

  function operateSluice(duration) {
    assembly("sluice", duration, 0, (t) => {
      const lift = t === 1 ? 0 : Math.sin(t * Math.PI) * 4;
      document.getElementById("i2-valve-board").setAttribute("transform", `translate(0 ${-lift})`);
      document.getElementById("i2-valve-cord").setAttribute("d", island2Water.gateCord(lift));
    });
  }

  function growMagnet(duration, delay = 0) {
    assembly("magnet", duration, delay, (t) => {
      const scale = .5 + .5 * smooth(t);
      document.getElementById("i2-found-magnet").setAttribute("transform", `translate(0 ${3 * (1 - smooth(t))}) scale(${scale})`);
    });
  }

  function revealCutaway(duration, onMetal) {
    const opening = document.getElementById("i2-cutaway");
    const underground = layers.get("underground");
    const clods = document.getElementById("i2-cliff-clods");
    let noticed = false;
    opening.setAttribute("clip-path", "url(#i2-cutaway-work-mask)");
    underground.setAttribute("clip-path", "url(#i2-cutaway-work-mask)");
    clods.style.display = "";
    assembly("cutaway", duration, 0, (t) => {
      document.querySelector("#i2-cutaway-work-mask path").setAttribute("d", island2Work.cutawayClip(smooth(t)));
      [...clods.children].forEach((node, i) => {
        const p = Math.max(0, Math.min(1, (t - i * .12) / .64));
        node.setAttribute("transform", `translate(${225 + i * 25 + p * 5} ${448 + i * 12 + p * p * 65})`);
        node.setAttribute("opacity", p > 0 ? 1 - p : 0);
      });
      document.getElementById("i2-magnet-glint").setAttribute("opacity",
        t > .55 && t < 1 ? Math.sin((t - .55) / .45 * Math.PI * 2) ** 2 : 0);
      if (!noticed && t > .6 && t < 1) { noticed = true; onMetal?.(); }
      if (t === 1) {
        opening.removeAttribute("clip-path");
        underground.setAttribute("clip-path", "url(#i2-under-mask)");
        clods.style.display = "none";
      }
    });
  }

  function fillSpring(duration, delay = 0, onWet) {
    let sounded = false;
    assembly("spring", duration, delay, (t) => {
      const shape = island2Water.springFrame(t);
      for (const [part, d] of [["floor", shape.floor], ["left-wall", shape.left], ["right-wall", shape.right],
        ["left-lip", shape.leftLip], ["right-lip", shape.rightLip]]) {
        document.getElementById(`i2-spring-${part}`).setAttribute("d", d);
      }
      document.querySelector("#i2-water .i2-water-surface").setAttribute("d", shape.water);
      document.getElementById("i2-spring-cut-water").setAttribute("opacity", shape.opacity);
      document.querySelector("#i2-water .i2-source-shimmer").style.display = t < .8 ? "none" : "";
      if (!sounded && t > .35 && t < 1) { sounded = true; onWet?.(); }
    });
  }

  function digChannel(duration) {
    const ground = document.getElementById("i2-channel-ground");
    const water = document.getElementById("i2-main-cut-water");
    const crumbs = document.getElementById("i2-dig-crumbs");
    ground.setAttribute("clip-path", "url(#i2-channel-cut-reveal)");
    water.setAttribute("clip-path", "url(#i2-channel-wet-reveal)");
    crumbs.style.display = "";
    assembly("channel", duration, 0, (t) => {
      const shape = island2Water.development(t);
      document.querySelector("#i2-channel-cut-reveal path").setAttribute("d", shape.cut);
      document.querySelector("#i2-channel-wet-reveal path").setAttribute("d", shape.water);
      [...crumbs.children].forEach((node, i) => {
        const phase = (t * 12 + i / 3) % 1;
        node.setAttribute("transform", `translate(${shape.head[0] + 14 + i * 3 + phase * 7} ${shape.head[1] - Math.sin(phase * Math.PI) * 7})`);
        node.setAttribute("opacity", 1 - phase);
      });
      if (t === 1) {
        ground.removeAttribute("clip-path");
        water.removeAttribute("clip-path");
        crumbs.style.display = "none";
      }
    });
  }

  function fillFall(duration) {
    assembly("waterfall", duration, 0, (t) => {
      document.getElementById("i2-waterfall").setAttribute("d", island2Water.fallFrame(t));
    });
  }

  function drawStone(tilt, yaw) {
    stonePose = { tilt, yaw };
    stoneFrame = island2Stone.frame(tilt, yaw);
    const root = document.getElementById("i2-rock-solid");
    for (const face of root.children) face.style.display = "none";
    for (const face of stoneFrame.faces) {
      const node = root.querySelector(`[data-rock-face="${face.index}"]`);
      node.style.display = "";
      node.setAttribute("d", face.d);
      node.setAttribute("fill", face.fill);
      root.append(node);
    }
    document.getElementById("i2-rock-outline").setAttribute("d", stoneFrame.outline);
    [...document.getElementById("i2-rock-cracks").children].forEach((node, i) => node.setAttribute("d", stoneFrame.cracks[i]));
    const [left, right, back, front] = stoneFrame.shadow;
    const shadow = document.getElementById("i2-rock-contact");
    shadow.setAttribute("cx", (left + right) / 2);
    shadow.setAttribute("cy", (back + front) / 2);
    shadow.setAttribute("rx", (right - left) / 2);
    shadow.setAttribute("ry", (front - back) / 2);
  }

  function rockPose(flat, bridge) {
    if (!assemblies.has("stone")) drawStone(flat ? Math.PI / 2 : 0, flat && !bridge ? -Math.PI / 4 : 0);
  }

  function turnStone(flat, bridge, duration, delay = 0) {
    const from = { ...stonePose };
    const target = { tilt: flat ? Math.PI / 2 : 0, yaw: flat && !bridge ? -Math.PI / 4 : 0 };
    assembly("stone", duration, delay, (t) => drawStone(from.tilt + (target.tilt - from.tilt) * smooth(t),
      from.yaw + (target.yaw - from.yaw) * smooth(t)));
  }

  function buildWheel(duration, delay = 0, pottery = false) {
    const fromTable = tableAngle;
    assembly("wheel", duration, delay, (t) => {
      if (pottery) {
        wheelPose(0);
        const height = .12 + .88 * smooth(t);
        document.getElementById("i2-pottery").style.display = "";
        document.getElementById("i2-pottery").setAttribute("transform", `translate(0 -26) scale(1 ${height}) translate(0 26)`);
        island2Lighting.paint(document.getElementById("i2-pot-round"),
          document.getElementById("i2-pottery").transform.baseVal.consolidate().matrix, 38, 23);
        document.getElementById("i2-clay").style.opacity = String(1 - smooth(t));
        document.getElementById("i2-pottery").style.opacity = String(smooth(t));
        tableAngle = fromTable - t * 270;
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
    const path = points.map((point) => ({ point, plane, mode: "walk",
      height: context.story.bridgeBuilt && point.every((n, i) => Math.abs(n - nodes.bridge.point[i]) < .01)
        ? nodes.bridge.height : undefined }));
    move(id, points, duration, offsets, { path, length: total, role, delay,
      gait: mode === "channel" || mode === "walk" ? mode : undefined });
    if (mode !== "channel" && mode !== "walk") act(role, mode, duration, delay, direction);
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
    return "idle";
  }

  function mechanisms(now = performance.now()) {
    const table = entities.get("i2-wheel");
    table.depth = table.point[1] + (context.levels.wheel >= 2 && context.branches.wheel !== "pottery" ? 2 : 13.6);
    entities.get("i2-seeds").depth = context.story.usingShovel === "gardener" ? 349 : 356;
    const stone = entities.get("i2-cover");
    stone.depth = stone.point[1] + 4;
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
        tip = [hook[0], 325 + (hook[0] - 448) * island2Iso.slope];
      } else {
        const returning = Math.min(1, (progress - .4) / .2);
        const load = island2LoadPoint(island2Layout.cabinBase);
        hook = [load[0] + (537 - load[0]) * returning, load[1] - 20 + (419 - load[1] + 20) * returning];
        tip = [hook[0], 325 + (hook[0] - 448) * island2Iso.slope];
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
      const palm = owner.node.querySelector(".i2-palm-front");
      const hand = worldPoint(palm, new DOMPoint(+palm.getAttribute("cx"), +palm.getAttribute("cy")));
      tether.setAttribute("d", `M${hand.x} ${hand.y} ${stone.point[0] + stoneFrame.anchor[0]} ${stone.point[1] + stoneFrame.anchor[1]}`);
    }
  }

  function removeUpgrade(key) {
    const effect = upgrades.get(key);
    if (!effect) return;
    if (effect.filterBefore === null) effect.target.removeAttribute("filter");
    else effect.target.setAttribute("filter", effect.filterBefore);
    effect.filter.remove();
    effect.root.remove();
    effect.button.classList.remove("upgrading");
    upgrades.delete(key);
  }

  function clearUpgrades() {
    for (const key of upgrades.keys()) removeUpgrade(key);
  }

  function upgrade(id, level, maxed) {
    if (!context?.live || document.hidden) return;
    const nodeId = id === "timber" ? level >= 4 ? "i2-tower" : "i2-crate"
      : id === "rope" ? context.levels.timber >= 3 ? "i2-scaffold" : "i2-scaffold-short" : `i2-${id}`;
    const item = entities.get(nodeId);
    if (!item) throw new Error(`Brak przedmiotu dla efektu ulepszenia: ${id}`);
    removeUpgrade(id);
    const viewport = document.querySelector("#island2-art > svg");
    const bounds = item.node.getBBox();
    const matrix = viewport.getCTM().inverse().multiply(item.node.getCTM());
    const center = new DOMPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2).matrixTransform(matrix);
    const flat = id === "glass" && context.story.glassPlane === "ground";
    const foot = id === "water" ? [237, 316] : id === "seeds" ? [157, 333]
      : id === "rope" ? context.levels.timber >= 3 ? [431, 158] : [420, 375]
      : id === "timber" && level >= 4 ? [470, 360] : id === "glass" ? [0, flat ? 5 : 15] : [0, 0];
    const bottom = new DOMPoint(...foot).matrixTransform(matrix);
    const radius = Math.max(16, Math.min(60, bounds.width * .58 + 4));
    const filterId = `i2-level-flash-${++upgradeSequence}`;
    const filter = svg("filter", { id: filterId, x: "-45%", y: "-30%", width: "190%", height: "160%", "color-interpolation-filters": "sRGB" });
    const flood = svg("feFlood", { "flood-color": "#ffdb45", "flood-opacity": ".9", result: "gold" });
    filter.append(flood, svg("feComposite", { in: "gold", in2: "SourceAlpha", operator: "in", result: "tint" }),
      svg("feGaussianBlur", { in: "tint", stdDeviation: "3.5", result: "halo" }));
    const merge = svg("feMerge");
    merge.append(svg("feMergeNode", { in: "halo" }), svg("feMergeNode", { in: "SourceGraphic" }), svg("feMergeNode", { in: "tint" }));
    filter.append(merge);
    viewport.querySelector("defs").append(filter);
    const root = svg("g", { "data-upgrade": id, "data-level": level, "data-maxed": String(maxed), "aria-hidden": "true" });
    const aura = svg("ellipse", { cx: center.x, cy: center.y, rx: radius * (flat ? 1.1 : 1.5),
      ry: Math.max(flat ? 8 : 32, Math.min(80, bounds.height * (flat ? .8 : .6))), fill: "url(#i2-level-aura)" });
    const ring = svg("ellipse", { cx: bottom.x, cy: bottom.y, fill: "none", stroke: "#fff3a0", "stroke-width": "4" });
    const rim = svg("ellipse", { cx: bottom.x, cy: bottom.y, fill: "none", stroke: "#ffbf24", "stroke-width": "2" });
    root.append(aura, ring, rim);
    const stars = Array.from({ length: maxed ? 9 : 6 }, (_, index) => {
      const star = svg("path", { d: "M0-8 2-2 7 0 2 2 0 8-2 2-7 0-2-2Z",
        fill: index % 2 ? "#fff9c0" : "#ffd33d", stroke: "#fff5a2", "stroke-width": ".8" });
      root.append(star);
      return star;
    });
    upgradeLayer.append(root);
    const button = document.getElementById(`island2-pick-${id}`);
    button.classList.add("upgrading");
    const filterBefore = item.node.getAttribute("filter");
    item.node.setAttribute("filter", `url(#${filterId})`);
    upgrades.set(id, { root, filter, filterBefore, flood, target: item.node, button, aura, ring, rim, stars,
      center, bottom, radius, maxed, flat, born: performance.now(), duration: maxed ? 1320 : 1050 });
    updateUpgrades(performance.now());
    wake();
  }

  function updateUpgrades(now) {
    for (const [key, effect] of upgrades) {
      const t = bounded((now - effect.born) / effect.duration);
      if (t === 1) { removeUpgrade(key); continue; }
      const spread = 1 - (1 - t) ** 3;
      effect.flood.setAttribute("flood-color", t < .08 ? "#fff4b0" : "#ffd12e");
      effect.flood.setAttribute("flood-opacity", (1 - smooth(t / .58)) * .9);
      effect.aura.setAttribute("opacity", (1 - t) * .75);
      const radius = 5 + spread * effect.radius * (effect.flat ? .65 : 1);
      for (const [ring, inset] of [[effect.ring, 0], [effect.rim, 5]]) {
        ring.setAttribute("rx", radius + inset);
        ring.setAttribute("ry", (radius + inset) * island2Iso.slope);
        ring.setAttribute("opacity", (1 - t) ** 2);
      }
      effect.stars.forEach((star, index) => {
        const angle = index / effect.stars.length * Math.PI * 2 - Math.PI / 2;
        const x = effect.center.x + Math.cos(angle) * (12 + spread * effect.radius);
        const y = effect.center.y + Math.sin(angle) * (effect.flat ? 6 + spread * 7 : 14 + spread * Math.min(45, effect.radius))
          - t * (effect.flat ? 5 : 22);
        const size = (.45 + Math.sin(Math.min(1, t * 1.25) * Math.PI) * .8) * (1 - t)
          * (index % 2 ? .7 : effect.maxed ? 1.25 : 1.1);
        star.setAttribute("transform", `translate(${x} ${y}) scale(1 ${1 / island2View.scaleY}) rotate(${t * 70 + index * 35}) scale(${size})`);
        star.setAttribute("opacity", 1 - t);
      });
    }
  }

  function tick(now) {
    frame = undefined;
    if (!context?.live) return;
    const elapsedTime = previous ? Math.min(50, now - previous) : 0;
    clock += elapsedTime;
    previous = now;
    for (const [id, action] of acts) if (now >= action.start + action.duration) acts.delete(id);
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
        const length = Math.hypot(b[0] - a[0], (b[1] - a[1]) * island2View.scaleY) || 1;
        entity.heading = [(b[0] - a[0]) / length, (b[1] - a[1]) * island2View.scaleY / length];
        entity.height = step.mode === "climb" ? step.plane === "dock" ? Math.min(0, 400 - entity.point[1])
          : Math.max(0, (step.plane === "gallery" ? 404 : 374) - entity.point[1])
          : entity.plane === "gallery" ? 175 : entity.plane === "peak" ? 88 : entity.plane === "underground" ? -70 : entity.plane === "dock" ? 19 - island2View.depth : 0;
        if (journey.path[index].height !== undefined || step.height !== undefined) {
          entity.height = (journey.path[index].height || 0) * (1 - fraction) + (step.height || 0) * fraction;
        }
        const gait = step.mode === "climb" ? "climb" : step.mode === "crawl" ? "crawl" : journey.gait || "walk";
        const acting = acts.get(id);
        if (acting && now >= acting.start && now < acting.start + acting.duration) {
          if (acting.direction) entity.direction = acting.direction;
          pose(entity, acting.mode, (now - acting.start) / 160, (now - acting.start) / acting.duration);
        } else pose(entity, gait, progress * journey.length / (7 * island2ActorScale));
      } else if (id === "i2-boat") setPlane(entity, boatPlane(entity.point));
      if (progress === 1) {
        journeys.delete(id);
        if (journey.path) {
          setPlane(entity, journey.path.at(-1).plane);
          if (journey.path.at(-1).height !== undefined) entity.height = journey.path.at(-1).height;
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
      wheelAngle -= elapsedTime / 9;
      rotate("i2-wheel-rotor", wheelAngle);
    }
    if (context.levels.wheel >= 3 && context.branches.wheel !== "pottery") {
      generatorAngle -= elapsedTime / 9;
      rotate("i2-generator-pulley", generatorAngle);
      rotate("i2-generator-rotor", generatorAngle);
    }
    if (context.levels.rope >= 3) rotate("i2-pulley-rotor",
      (entities.get("i2-crate").point[1] - island2Layout.cabinBase[1]) / 10 * 180 / Math.PI);
    if (context.story.producing) document.getElementById("i2-mill-arm").setAttribute("transform", `translate(0 ${-Math.max(0, Math.sin(clock / 180)) * 5})`);
    const shaping = acts.get("i2-person-maker");
    if (context.branches.wheel === "pottery" && context.levels.wheel >= 2 &&
        shaping?.mode === "shape" && now >= shaping.start && now < shaping.start + shaping.duration) {
      tableAngle += elapsedTime / 18;
      rotate("i2-table-rotor", tableAngle);
    }
    if (context.levels.lamp >= 3) document.getElementById("i2-beam-pivot").setAttribute("transform", `scale(${Math.cos(clock / 1000)} 1)`);
    if (context.story.oarMade) document.getElementById("i2-lid-paddle").setAttribute("transform",
      `rotate(${context.story.sailing && !context.story.leafSail ? -15 + Math.sin(clock / 180) * 22 : 0})`);
    mechanisms(now);
    updateUpgrades(now);
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
        if (journey.path) {
          setPlane(entity, journey.path.at(-1).plane);
          if (journey.path.at(-1).height !== undefined) entity.height = journey.path.at(-1).height;
        }
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
      ["i2-cutaway", "base", [0, 0], 1], ["i2-magnet", "underground", [254, 485], 486],
      ["i2-shovel", "front", island2Work.shovelRest, 350], ["i2-clay", "front", island2Work.clayBank, 340],
      ["i2-field-clods", "front", [0, 0], 360], ["i2-cliff-clods", "front", [0, 0], 520],
      ["i2-sowing-seeds", "front", [0, 0], 360],
      ["i2-door-knock", "front", [0, 0], 391],
      ["i2-middle-walls", "walls", [0, 0], 382], ["i2-cave", "walls", [0, 0], 1], ["i2-cover", "front", island2Layout.coverHome],
      ["i2-water", "floor", [0, 0], 340],
      ["i2-tower", "peak", [0, 0], 374], ["i2-lamp", "front", island2Layout.lampRest], ["i2-glass", "front", island2Layout.glassRest],
      ["i2-gallery-rail", "front", [0, 0], 430],
      ["i2-tea", "front", island2Layout.wheelRest, 401],
      ["i2-beam", "optics", [0, 0], 189], ["i2-seeds", "front", [0, 0], 356], ["i2-stream", "floor", [0, 0], 339],
      ["i2-overflow", "floor", [0, 0], 355],
      ["i2-outfall", "sea-back", [0, 0], 615], ["i2-cliff-ladder", "front", [0, 0], 413],
      ["i2-scaffold", "front", [0, 0], 363],
      ["i2-scaffold-front", "front", [0, 0], 375], ["i2-scaffold-short", "front", [0, 0], 372],
      ["i2-crate", "front", island2Layout.crateRest, 374], ["i2-wheel", "front", island2Layout.wheelRest, 420],
      ["i2-crate-lid", "front", island2Layout.crateRest, 376],
      ["i2-lily", "front", island2Layout.lily, 355], ["i2-fish", "front", island2Layout.fish, 356],
      ["i2-rope-coil", "front", island2Layout.rope, 290], ["i2-copper", "front", island2Layout.copper, 436],
      ["i2-drive", "front", [0, 0], 390], ["i2-wire", "front", [0, 0], 391],
      ["i2-dock", "sea-front", [0, island2Sea([0, 141])[1]], 399],
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
    for (const role of ["scout", "maker", "gardener"]) {
      const owner = entities.get(`i2-person-${role}`);
      const overlay = svg("g", { id: `i2-contact-${role}`, stroke: "#34372b", "stroke-width": "1.8",
        "stroke-linecap": "round", "stroke-linejoin": "round", "pointer-events": "none", style: "display:none" });
      root.append(overlay);
      owner.contactLayer = register(overlay.id, "front", [0, 0], 0);
      owner.contactParts = [...owner.node.querySelectorAll(
        ".i2-arm-front,.i2-arm-front-core,.i2-arm-back,.i2-arm-back-core,.i2-palm-front,.i2-palm-back")].map((source) => {
        const copy = source.cloneNode(false);
        overlay.append(copy);
        return [source, copy];
      });
    }
    document.getElementById("i2-person-scout").querySelector(".i2-facing").append(document.getElementById("i2-reaction"));
    document.getElementById("i2-reaction").setAttribute("transform", "translate(0 -77)");
    upgradeLayer = svg("g", { id: "i2-upgrade-effects", "pointer-events": "none" });
    root.append(upgradeLayer);
    for (const [id, width, height] of [["i2-stone-cap", 80, 36], ["i2-stone-wall", 80, 86],
      ["i2-magnet-red", 36, 35], ["i2-pot-round", 38, 23]]) {
      island2Lighting.paint(document.getElementById(id), new DOMMatrix(), width, height);
    }
    for (const entity of entities.values()) place(entity, entity.point);
    drawStone(0, 0);
    document.querySelector("#i2-water .i2-water-surface").setAttribute("d", island2Water.springFrame(1).water);
    document.getElementById("i2-waterfall").setAttribute("d", island2Water.fallFrame(1));
    document.getElementById("i2-channel-ground").removeAttribute("clip-path");
    document.getElementById("i2-main-cut-water").removeAttribute("clip-path");
    document.getElementById("i2-dig-crumbs").style.display = "none";
    follow("i2-crate-lid", "i2-crate", [0, 0], { depthBias: 2 });
    follow("i2-tea", "i2-wheel", [0, 0], { depthBias: 1 });
    sort();
  }

  function sync(next) {
    context = next;
    syncAssemblies();
    if (!next.live) { clearUpgrades(); freeze(); }
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
    clearUpgrades();
    freeze();
    followers.clear();
    clock = 0;
    wheelAngle = 0;
    generatorAngle = 0;
    tableAngle = 0;
    shovelPose(-15);
    for (const entity of entities.values()) {
      setPlane(entity, entity.initial.plane);
      place(entity, entity.initial.point);
      entity.depth = entity.initial.depth;
      entity.direction = 1;
      entity.pose = "idle";
      entity.height = 0;
      entity.heading = [1, island2Iso.slope];
      entity.workGrip = null;
      entity.sowing = 0;
    }
    for (const id of ["i2-wheel-rotor", "i2-table-rotor", "i2-pulley-rotor", "i2-generator-pulley", "i2-generator-rotor", "i2-mill-arm"]) {
      document.getElementById(id).setAttribute("transform", "translate(0 0)");
    }
    for (const id of ["i2-crate-box", "i2-cabin-detail"]) document.getElementById(id).removeAttribute("transform");
    document.getElementById("i2-clay").style.opacity = "";
    document.getElementById("i2-pottery").style.opacity = "";
    document.getElementById("i2-found-magnet").setAttribute("transform", "translate(0 3) scale(.5)");
    document.getElementById("i2-tower").removeAttribute("clip-path");
    wheelPose(0);
    drawStone(0, 0);
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
    follow("i2-tea", "i2-wheel", [0, 0], { depthBias: 1 });
    updateContactLayers();
  }

  function parcel(node, carrier) {
    entities.delete("i2-parcel");
    if (carrier) {
      const owner = entities.get(`i2-person-${carrier}`);
      owner.node.querySelector(".i2-hand").append(node);
      node.setAttribute("transform", "translate(2 2) scale(.65)");
      lightPerson(owner, owner.node.querySelector(".i2-body"));
    } else register("i2-parcel", "front", [0, 0], 376);
  }

  function clear(keepUpgrades = false) {
    if (!keepUpgrades) clearUpgrades();
    freeze();
    entities.delete("i2-parcel");
    journeys.delete("i2-parcel");
    document.getElementById("i2-parcel")?.remove();
    for (const entity of entities.values()) if (entity.id.startsWith("i2-person-")) {
      entity.pose = "idle";
      entity.workGrip = null;
      pose(entity, "idle");
    }
    updateContactLayers();
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
    const matrix = solid.querySelector("[data-iso-face]").transform.baseVal.consolidate().matrix;
    island2Lighting.paint(document.getElementById("i2-glass-round"), matrix, 28, 28);
    island2Lighting.reflection(document.getElementById("i2-lens-rings"), matrix);
  }
  return { mount, position, move, actor, act, perform, follow, release, sync, reset, clear, parcel,
    glass, lamp, discPlane, buildWheel, buildCabin, fillSpring, digChannel, fillFall, rockPose, turnStone,
    shovelPose, turnShovel, digField, knockDoor, braceSource, operateSluice, revealCutaway, growMagnet, upgrade,
    stopIdle, nodes, entities, journeys, followers, acts, assemblies, upgrades };
})();
