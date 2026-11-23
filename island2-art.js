"use strict";

const island2Blueprint = (() => {
  const ground = (u, v, height = 0) => {
    const across = (u - 318) / 22.627417;
    const away = (v - 350) / 10.182338;
    return [(across + away) / 2, height, (away - across) / 2];
  };
  const point = (u, v, height = 0) => ground(u, v, height);
  const cabin = point(416, 373);
  const tower = point(473, 367);
  return {
    ground, sea: -1.72,
    positions: {
      water: point(237, 315), seeds: point(157, 333), wheel: point(244, 400),
      crate: point(432, 391), copper: point(328, 425),       glass: point(188, 374, .38),
      rope: point(396, 289, .16), lamp: point(497, 358, .35),
      cover: point(340, 382, .87), magnet: [2.7, -1.03, 5.13],
      cabin, tower, boat: point(574, 304, -1.53), lily: point(177, 323, .1),
      fish: point(157, 340, .1), gift: point(567, 438, -1),
    },
    nodes: {
      farm: point(135, 367), spring: point(204, 336), terrace: point(282, 327),
      rear: point(340, 331), cave: point(340, 389), inside: point(333, 378),
      workshop: point(379, 398), potter: point(269, 415), wheel: point(195, 396),
      landing: point(377, 421), generator: point(367, 422), lift: point(383, 382),
      mill: point(287, 432), bridge: [0, .24, 3.2], pondEdge: point(155, 359),
      shore: [5.1, 0, 1.1], dock: point(507, 400), teaLeft: point(204, 402),
      teaRight: point(283, 408), hatch: [1.4, -1.51, 1.1], stairs: [2.4, -1.51, 3.4],
      tunnel: [2.2, -1.51, 5.15],
      shoreLow: [6.05, -1.35, 1.1],
      upper: [tower[0] - .67, 5.13, tower[2] + .77],
      gallery: [tower[0] - .67, 3.12, tower[2] + .77],
      loadingExit: [cabin[0] + .707107, .14, cabin[2] + .707107],
      loadingOutside: [cabin[0] + 1.59099, 0, cabin[2] - .176777],
      ladderBase: [tower[0] - .55, 0, tower[2] + 1],
    },
    edges: [
      ["farm", "cave"], ["farm", "spring"], ["spring", "terrace"], ["terrace", "cave"],
      ["rear", "cave"], ["cave", "inside"], ["cave", "workshop"], ["cave", "potter"],
      ["cave", "wheel"], ["wheel", "teaLeft"], ["wheel", "mill"], ["mill", "teaRight"],
      ["mill", "generator"], ["generator", "landing"], ["landing", "lift"],
      ["lift", "shore"], ["shore", "dock"], ["farm", "pondEdge"],
      ["inside", "hatch", "descend"], ["hatch", "stairs", "crawl"], ["stairs", "tunnel", "crawl"],
      ["lift", "loadingExit"], ["loadingExit", "loadingOutside"], ["loadingOutside", "ladderBase"],
      ["ladderBase", "gallery", "climb"], ["gallery", "upper", "climb"],
      ["shore", "shoreLow", "steps"],
      ["wheel", "bridge", "bridge"], ["bridge", "generator", "bridge"],
    ],
  };
})();

function createIsland2Models() {
  const T = THREE;
  const colors = {
    ink: 0x354a3c, grass: 0xb7d877, earth: 0x9bbd72, stone: 0xbac8aa,
    wood: 0xe7b97a, darkWood: 0xb98b53, ivory: 0xfff6df, teal: 0x79b6a8,
    water: 0x79c6d1, clay: 0xda9a6a, coral: 0xd78e72, metal: 0x7d9583,
  };
  const materials = new Map();
  const geometries = new Map();
  const gradient = new T.DataTexture(new Uint8Array([105, 178, 232, 255]), 4, 1, T.RedFormat);
  gradient.minFilter = T.NearestFilter;
  gradient.magFilter = T.NearestFilter;
  gradient.needsUpdate = true;
  const material = (color) => {
    if (!materials.has(color)) materials.set(color, new T.MeshToonMaterial({ color, gradientMap: gradient }));
    return materials.get(color);
  };
  const geometry = (key, make) => {
    if (!geometries.has(key)) geometries.set(key, make());
    return geometries.get(key);
  };
  const group = (name = "") => {
    const root = new T.Group();
    root.name = name;
    return root;
  };
  const mesh = (shape, color, parent, position = [0, 0, 0]) => {
    const node = new T.Mesh(shape, typeof color === "number" ? material(color) : color);
    node.position.fromArray(position);
    node.castShadow = true;
    node.receiveShadow = true;
    parent?.add(node);
    return node;
  };
  const box = (parent, size, position, color = colors.wood) => {
    const node = mesh(geometry("box", () => new T.BoxGeometry()), color, parent, position);
    node.scale.fromArray(size);
    return node;
  };
  const ball = (parent, radius, position, color = colors.ivory, stretch = [1, 1, 1]) => {
    const node = mesh(geometry("sphere", () => new T.SphereGeometry(1, 16, 12)), color, parent, position);
    node.scale.set(radius * stretch[0], radius * stretch[1], radius * stretch[2]);
    return node;
  };
  const cylinder = (parent, top, bottom, height, position, color, segments = 16) =>
    mesh(new T.CylinderGeometry(top, bottom, height, segments), color, parent, position);
  const tube = (parent, points, radius, color, closed = false) => {
    const curve = new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p)), closed);
    return mesh(new T.TubeGeometry(curve, Math.max(12, points.length * 6), radius, 6, closed), color, parent);
  };
  const ring = (parent, radius, thickness, position, color, arc = Math.PI * 2) =>
    mesh(new T.TorusGeometry(radius, thickness, 6, 24, arc), color, parent, position);
  const socket = (parent, name, position, rotation = [0, 0, 0]) => {
    const node = group(name);
    node.position.fromArray(position);
    node.rotation.set(...rotation);
    parent.add(node);
    return node;
  };
  const entity = (name, root, grips = [[-.25, 0, 0], [.25, 0, 0]]) => ({
    name, root, grips: grips.map((p) => new T.Vector3(...p)), parts: {}, sockets: {}, home: null,
  });

  function terrain() {
    const root = group("island");
    const cap = new T.Shape();
    cap.moveTo(-5.5, -5.5); cap.lineTo(5.5, -5.5); cap.lineTo(5.5, 5.5); cap.lineTo(-5.5, 5.5);
    const hatch = new T.Path();
    hatch.moveTo(.9, .7); hatch.lineTo(.9, 1.9); hatch.lineTo(1.9, 1.9); hatch.lineTo(1.9, .7);
    cap.holes.push(hatch);
    const surface = mesh(new T.ExtrudeGeometry(cap, { depth: .2, bevelEnabled: true, bevelSize: .08, bevelThickness: .06, bevelSegments: 2, steps: 1 }), colors.grass, root);
    surface.rotation.x = Math.PI / 2;
    surface.position.y = -.06;
    box(root, [11, 1.45, .2], [0, -.92, -5.45], colors.earth);
    box(root, [.2, 1.45, 11], [-5.45, -.92, 0], colors.earth);
    box(root, [.2, 1.45, 11], [5.45, -.92, 0], 0x79a46e);
    box(root, [6.2, 1.45, .2], [-2.4, -.92, 5.45], colors.earth);
    box(root, [1.1, 1.45, .2], [4.95, -.92, 5.45], colors.earth);
    box(root, [3.7, .22, .2], [2.55, -.3, 5.45], colors.earth);
    box(root, [11, .13, 11], [0, -1.65, 0], colors.earth);
    box(root, [3.7, .06, 3.9], [2.55, -1.55, 3.5], 0x746e50);
    box(root, [.1, 1.2, 3.6], [.72, -.95, 3.6], 0x6d805f);
    box(root, [.1, 1.2, 3.6], [4.35, -.95, 3.6], 0x6d805f);
    const plug = box(root, [3.7, 1.23, .24], [2.55, -.94, 5.45], colors.earth);
    const rim = group("cutaway-rim");
    box(rim, [3.85, .09, .3], [2.55, -.4, 5.5], 0xb7c18e);
    box(rim, [.12, 1.23, .3], [.72, -.97, 5.5], 0xb7c18e);
    box(rim, [.12, 1.23, .3], [4.38, -.97, 5.5], 0xb7c18e);
    root.add(rim);
    return { root, plug, rim };
  }

  function workshop() {
    const root = group("workshop");
    const wall = mesh(new T.CylinderGeometry(1.16, 1.23, 1.92, 24, 1, true, .4, Math.PI * 2 - .8), colors.stone, root, [0, .96, 0]);
    wall.rotation.y = Math.PI / 4;
    const roof = ball(root, 1.28, [0, 2.03, 0], 0xd7dfba, [1, .34, 1]);
    const front = socket(root, "door", [.82, 0, .82], [0, Math.PI / 4, 0]);
    const arch = ring(front, .46, .06, [0, 1.4, 0], colors.metal, Math.PI);
    arch.rotation.z = 0;
    cylinder(front, .06, .06, 1.4, [-.46, .7, 0], colors.metal);
    cylinder(front, .06, .06, 1.4, [.46, .7, 0], colors.metal);
    box(root, [.7, .09, .38], [.16, .8, -.23], colors.wood);
    box(root, [.08, .75, .08], [-.12, .38, -.23], colors.darkWood);
    box(root, [.08, .75, .08], [.44, .38, -.23], colors.darkWood);
    cylinder(root, .1, .13, .22, [.38, .95, -.24], colors.metal);
    socket(root, "bench", [.1, .91, -.2], [Math.PI / 2, 0, 0]);
    return { root, roof, wall, sockets: { door: front, bench: root.getObjectByName("bench") } };
  }

  function water() {
    const root = group("water");
    ball(root, .9, [0, .55, 0], colors.stone, [1, .85, .8]);
    cylinder(root, .5, .61, .22, [0, 1.02, 0], colors.metal);
    cylinder(root, .44, .44, .04, [0, 1.15, 0], colors.water);
    const drops = ball(root, .13, [0, 1.52, 0], colors.water, [1, 1.4, 1]);
    const valve = group("valve");
    box(valve, [.75, .3, .11], [0, .35, .63]);
    cylinder(valve, .035, .035, .38, [0, .68, .68], colors.darkWood);
    const wheel = ring(valve, .15, .035, [0, .88, .68], colors.darkWood);
    root.add(valve);
    return entity("water", root, [[-.5, .45, .5], [.5, .45, .5]]);
  }

  function crops() {
    const root = group("seeds");
    box(root, [2.1, .12, 1.3], [0, .01, 0], 0xbb925b);
    const earth = box(root, [1.95, .04, 1.15], [0, .1, 0], 0xcea16a);
    const plants = group("plants");
    const ears = group("ears");
    for (const [x, z] of [[-.6, -.25], [0, .18], [.6, -.22]]) {
      cylinder(plants, .025, .04, .6, [x, .4, z], 0x6b9b56, 8);
      ball(plants, .2, [x - .1, .35, z], 0x83b96c, [1, .4, .45]).rotation.z = -.45;
      ball(plants, .2, [x + .1, .48, z], 0x83b96c, [1, .4, .45]).rotation.z = .45;
      cylinder(ears, .025, .04, .9, [x, .55, z], 0xad9d53, 8);
      for (let i = 0; i < 3; i++) ball(ears, .1, [x + (i % 2 ? -.06 : .06), .9 + i * .12, z], 0xf0cd69, [.7, 1.4, .65]);
    }
    const pond = cylinder(root, .98, 1.05, .07, [0, .13, 0], colors.water, 24);
    pond.scale.z = .65;
    root.add(plants, ears);
    const result = entity("seeds", root);
    result.parts = { earth, plants, ears, pond };
    return result;
  }

  function wheelModel() {
    const root = group("wheel");
    const table = group("table");
    const legs = group("legs");
    for (const x of [-.54, .54]) for (const z of [-.4, .4]) cylinder(legs, .06, .075, .77, [x, .38, z], colors.darkWood, 8);
    table.add(legs);
    const cup = group("cup");
    cylinder(cup, .12, .1, .22, [0, .11, 0], colors.ivory, 12);
    ring(cup, .08, .025, [.13, .13, 0], colors.ivory).rotation.y = Math.PI / 2;
    cup.position.set(.08, .86, .04);
    table.add(cup);
    const drive = group("waterwheel");
    const axle = group("axle");
    axle.position.y = 1.42;
    axle.rotation.y = Math.PI / 4;
    const disc = cylinder(axle, .96, .96, .14, [0, 0, 0], colors.wood, 24);
    disc.rotation.x = Math.PI / 2;
    const rotor = group("rotor");
    for (let i = 0; i < 8; i++) {
      const paddle = group();
      paddle.rotation.z = i * Math.PI / 4;
      box(paddle, [.36, .44, .62], [0, 1.12, 0], colors.wood);
      box(paddle, [.1, 1.0, .15], [0, .54, .17], 0xf0cd8b);
      rotor.add(paddle);
    }
    ball(axle, .16, [0, 0, .21], colors.metal);
    axle.add(rotor);
    rotor.add(disc);
    box(drive, [.14, 1.42, .18], [-.7, .71, .15], colors.darkWood);
    box(drive, [.14, 1.42, .18], [.7, .71, .15], colors.darkWood);
    const pot = group("pot");
    const profile = [[.1, 0], [.43, .06], [.52, .3], [.43, .5], [.21, .64], [.21, .78]]
      .map(([x, y]) => new T.Vector2(x, y));
    mesh(new T.LatheGeometry(profile, 20), colors.clay, pot);
    cylinder(pot, .18, .18, .015, [0, .77, 0], 0x74533d, 16);
    pot.position.y = .87;
    const tie = ring(pot, .44, .027, [0, .3, 0], 0x8c784f);
    tie.rotation.x = Math.PI / 2;
    table.add(pot);
    root.add(table, drive, axle);
    const result = entity("wheel", root, [[-.35, .8, .72], [.35, .8, .72]]);
    result.parts = { table, drive, rotor, cup, pot, tie, legs, disc, axle };
    return result;
  }

  function crate() {
    const root = group("crate");
    const boxRoot = group("box");
    box(boxRoot, [1.3, .12, 1.0], [0, .08, 0]);
    box(boxRoot, [1.3, .65, .08], [0, .39, -.48]);
    box(boxRoot, [.08, .65, 1.0], [-.61, .39, 0], colors.darkWood);
    const frontPanel = group("front-panel");
    frontPanel.position.set(0, .14, .48);
    box(frontPanel, [1.3, .58, .08], [0, .29, 0]);
    const sidePanel = group("side-panel");
    sidePanel.position.set(.61, .14, 0);
    box(sidePanel, [.08, .58, 1], [0, .29, 0], colors.darkWood);
    boxRoot.add(frontPanel, sidePanel);
    for (const x of [-.44, .44]) {
      box(boxRoot, [.08, .67, .06], [x, .4, -.54], 0xf1cd8d);
      box(frontPanel, [.08, .6, .06], [x, .29, .055], 0xf1cd8d);
    }
    const cabin = group("cabin");
    for (const x of [-.6, .6]) for (const z of [-.45, .45]) box(cabin, [.09, 1.55, .09], [x, .85, z], colors.darkWood);
    box(cabin, [1.32, .1, .1], [0, 1.62, -.47], colors.wood);
    box(cabin, [1.32, .1, .1], [0, 1.62, .47], colors.wood);
    box(cabin, [.88, .07, .3], [0, .4, 0], colors.darkWood);
    for (const x of [-.39, .39]) box(cabin, [.07, .14, .2], [x, .82, 0], colors.darkWood);
    const load = socket(root, "load", [0, .82, 0]);
    const rider = socket(root, "rider", [0, .65, .04]);
    const sail = socket(root, "sail", [-.28, .65, -.37], [0, .15, 0]);
    const lid = socket(root, "lid", [0, .79, 0]);
    root.add(boxRoot, cabin);
    const result = entity("crate", root, [[-.43, .4, .55], [.43, .4, .55]]);
    const boatSeat = box(boxRoot, [.85, .09, .3], [0, .3, 0], colors.wood);
    cylinder(boxRoot, .11, .13, .21, [-.28, .24, -.37], colors.darkWood, 12);
    result.parts = { box: boxRoot, cabin, boatSeat, frontPanel, sidePanel };
    result.sockets = { load, rider, sail, lid };
    return result;
  }

  function lid() {
    const root = group("lid");
    const board = box(root, [1.3, .09, 1.04], [0, 0, 0]);
    const paddle = group("paddle");
    cylinder(paddle, .045, .045, 1.25, [0, -.2, 0], colors.wood, 8);
    box(paddle, [.37, .45, .09], [0, -.95, 0], colors.wood);
    root.add(paddle);
    const result = entity("lid", root, [[.3, 0, .45], [-.3, 0, .45]]);
    result.parts = { board, paddle };
    return result;
  }

  function stone() {
    const root = group("cover");
    const slab = box(root, [1.05, 1.73, .2], [0, 0, 0], colors.stone);
    tube(root, [[-.24, .55, .12], [-.03, .18, .12], [-.18, -.18, .12]], .024, 0x7d977b);
    tube(root, [[-.03, .18, .12], [.32, -.1, .12]], .024, 0x7d977b);
    const result = entity("cover", root, [[-.49, -.15, .1], [.49, -.15, .1]]);
    result.parts = { slab };
    return result;
  }

  function magnet() {
    const root = group("magnet");
    const curve = ring(root, .25, .085, [0, .13, 0], colors.coral, Math.PI);
    for (const x of [-.25, .25]) {
      cylinder(root, .085, .085, .43, [x, -.08, 0], colors.coral, 10);
      cylinder(root, .086, .086, .12, [x, -.32, 0], colors.ivory, 10);
    }
    const result = entity("magnet", root, [[0, .25, 0], [0, .25, 0]]);
    result.oneHand = true;
    return result;
  }

  function generator() {
    const root = group("copper");
    const loose = tube(root, [[-.6, .1, 0], [-.4, .6, 0], [-.2, .15, 0], [0, .6, 0], [.2, .15, 0], [.4, .6, 0], [.6, .15, 0]], .055, colors.coral);
    const built = group("generator");
    box(built, [1.5, .26, .9], [0, .18, 0], colors.metal);
    const core = cylinder(built, .11, .11, .85, [0, .62, 0], 0x9aaf97);
    core.rotation.z = Math.PI / 2;
    const coils = [];
    for (let i = 0; i < 6; i++) {
      const turn = ring(built, .2, .038, [-.3 + i * .12, .62, 0], colors.coral);
      turn.rotation.y = Math.PI / 2;
      coils.push(turn);
    }
    const mount = socket(root, "magnet", [0, .65, -.17]);
    root.add(built);
    const result = entity("copper", root);
    result.parts = { loose, built, coils, core };
    result.sockets = { magnet: mount };
    return result;
  }

  function glass() {
    const root = group("glass");
    const glassMaterial = new T.MeshPhongMaterial({ color: 0x93d8e2, transparent: true, opacity: .58, shininess: 110, depthWrite: false });
    const lens = mesh(new T.CylinderGeometry(.38, .38, .075, 24), glassMaterial, root);
    lens.rotation.x = Math.PI / 2;
    ring(root, .39, .037, [0, 0, 0], 0x648f88);
    const rough = mesh(new T.SphereGeometry(.37, 16, 10), new T.MeshPhongMaterial({ color: 0xd1dfcd, transparent: true, opacity: .58, shininess: 3, depthWrite: false }), root);
    rough.scale.z = .13;
    lens.castShadow = false;
    rough.castShadow = false;
    const result = entity("glass", root, [[-.49, 0, 0], [.49, 0, 0]]);
    result.parts = { lens, rough };
    return result;
  }

  function lamp() {
    const root = group("lamp");
    cylinder(root, .24, .28, .11, [0, -.28, 0], colors.darkWood, 16);
    for (const x of [-.19, .19]) box(root, [.04, .58, .04], [x, .01, 0], colors.wood);
    cylinder(root, .23, .26, .09, [0, .3, 0], colors.wood, 16);
    ring(root, .14, .025, [0, .44, 0], colors.darkWood, Math.PI);
    const bulb = ball(root, .13, [0, -.02, 0], 0xffde7b, [1, 1.3, 1]);
    const glow = new T.PointLight(0xffd982, 0, 4, 2);
    root.add(glow);
    const result = entity("lamp", root, [[0, .43, 0], [0, .43, 0]]);
    result.oneHand = true;
    result.parts = { bulb, glow };
    return result;
  }

  function leaf() {
    const root = group("lily");
    const canopy = group("canopy");
    const shape = new T.Shape();
    shape.moveTo(0, -.08);
    shape.bezierCurveTo(-.95, -.65, -.9, .55, -.15, .65);
    shape.bezierCurveTo(.8, .9, 1.05, -.4, .3, -.55);
    shape.lineTo(0, -.08);
    const blade = mesh(new T.ExtrudeGeometry(shape, { depth: .045, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 1, steps: 1, curveSegments: 14 }), 0x91c66e, canopy);
    blade.rotation.x = -Math.PI / 2;
    tube(canopy, [[0, .07, 0], [.32, .08, -.3], [.62, .05, -.32]], .022, 0xc6dc91);
    tube(canopy, [[0, .07, 0], [-.31, .09, -.12], [-.57, .05, -.1]], .022, 0xc6dc91);
    root.add(canopy);
    const stem = cylinder(root, .045, .06, .9, [0, -.45, 0], 0x739951, 10);
    const result = entity("lily", root, [[.2, 0, .5], [-.2, 0, .5]]);
    result.parts = { blade, stem, canopy };
    result.sockets = { rider: socket(root, "rider", [0, -.21, 0]) };
    return result;
  }

  function rope() {
    const root = group("rope");
    const coil = group("coil");
    for (let i = 0; i < 3; i++) ring(coil, .34, .045, [0, .08 + i * .07, 0], 0x9b8150).rotation.x = Math.PI / 2;
    root.add(coil);
    const frame = group("frame");
    for (const x of [-.73, .73]) box(frame, [.16, 6.85, .18], [x, 3.42, -.62], colors.wood);
    box(frame, [1.8, .2, .24], [0, 6.8, -.62], colors.darkWood);
    box(frame, [.14, .14, .8], [0, 6.62, -.26], colors.darkWood);
    const pulley = cylinder(frame, .26, .26, .12, [0, 6.5, .1], colors.wood, 16);
    pulley.rotation.x = Math.PI / 2;
    const short = group("short-frame");
    for (const x of [-.7, .7]) box(short, [.16, 1.8, .2], [x, .9, 0], colors.wood);
    box(short, [1.7, .2, .24], [0, 1.8, 0], colors.darkWood);
    const drum = cylinder(root, .23, .23, .38, [0, .88, .15], colors.darkWood, 16);
    drum.rotation.x = Math.PI / 2;
    ring(root, .18, .04, [0, .88, .39], colors.wood);
    root.add(frame, short);
    const result = entity("rope", root);
    result.parts = { coil, frame, short, pulley, drum };
    return result;
  }

  function towerModel() {
    const root = group("tower");
    box(root, [1.18, 5.4, 1.18], [0, 2.7, 0], colors.ivory);
    box(root, [1.2, .4, 1.2], [0, 2.4, 0], colors.coral);
    box(root, [1.5, .16, 1.5], [0, 5.4, 0], colors.wood);
    for (const x of [-.62, .62]) for (const z of [-.62, .62]) cylinder(root, .045, .045, 1.0, [x, 5.98, z], colors.metal, 8);
    const roof = mesh(new T.ConeGeometry(1.08, .83, 4), colors.coral, root, [0, 6.96, 0]);
    roof.rotation.y = Math.PI / 4;
    const upper = box(root, [2.0, .12, 1.85], [-.4, 4.64, .35], colors.wood);
    const lower = box(root, [1.8, .12, 1.85], [-.5, 3.06, .35], colors.wood);
    const optics = socket(root, "optics", [0, 6, 0]);
    cylinder(root, .23, .23, .3, [0, 5.58, 0], colors.metal, 16);
    box(optics, [.9, .07, .16], [0, -.4, .68], colors.darkWood);
    box(optics, [.13, .12, .75], [0, -.4, .3], colors.darkWood);
    for (const x of [-.42, .42]) box(optics, [.07, .2, .14], [x, 0, .68], colors.metal);
    box(optics, [.3, .16, .3], [0, -.51, .5], colors.metal);
    const beam = socket(optics, "beam", [0, 0, .68]);
    const ray = mesh(new T.ConeGeometry(1.2, 6.5, 24, 1, true), new T.MeshBasicMaterial({ color: 0xffe6a1, transparent: true, opacity: .12, side: T.DoubleSide, depthWrite: false }), beam, [0, 0, 3.25]);
    ray.rotation.x = -Math.PI / 2;
    return { root, roof, upper, lower, optics, beam };
  }

  function ship() {
    const root = group("boat");
    const hull = ball(root, 1, [0, .05, 0], colors.teal, [1.2, .35, .55]);
    box(root, [2.2, .1, .75], [0, .25, 0], colors.wood);
    cylinder(root, .035, .045, 2.8, [0, 1.65, 0], colors.darkWood, 8);
    const sailShape = new T.Shape();
    sailShape.moveTo(-.06, 0); sailShape.lineTo(-.06, 2.3); sailShape.lineTo(-1.04, .2); sailShape.closePath();
    const sail = mesh(new T.ExtrudeGeometry(sailShape, { depth: .045, bevelEnabled: false }), colors.ivory, root, [0, .45, 0]);
    root.rotation.y = -.15;
    const result = entity("boat", root);
    result.parts = { hull, sail };
    result.sockets = { cargo: socket(root, "cargo", [.55, .475, 0]) };
    return result;
  }

  function fish() {
    const root = group("fish");
    ball(root, .3, [0, 0, 0], 0xeeb15f, [1.4, .5, .55]);
    const tail = mesh(new T.ConeGeometry(.2, .35, 3), 0xeeb15f, root, [-.46, 0, 0]);
    tail.rotation.z = Math.PI / 2;
    ball(root, .035, [.19, .09, .13], colors.ink);
    return entity("fish", root);
  }

  function packet(name, color = colors.wood) {
    const root = group(name);
    box(root, [.45, .35, .3], [0, 0, 0], color);
    box(root, [.055, .37, .32], [0, 0, 0], 0xf1d495);
    return entity(name, root, [[-.2, 0, 0], [.2, 0, 0]]);
  }

  function person(role) {
    const root = group(`person-${role}`);
    const pelvis = group("pelvis");
    pelvis.position.y = .53;
    root.add(pelvis);
    const body = ball(pelvis, .24, [0, .3, 0], colors.ivory, [.76, 1.25, .65]);
    const head = group("head");
    head.position.set(0, .88, 0);
    const skull = ball(head, .29, [0, 0, 0], colors.ivory);
    const outlineMaterial = new T.MeshBasicMaterial({ color: 0x425448, side: T.BackSide });
    const outline = new T.Mesh(skull.geometry, outlineMaterial);
    outline.scale.setScalar(.31);
    head.add(outline);
    const torsoOutline = new T.Mesh(body.geometry, outlineMaterial);
    torsoOutline.position.copy(body.position);
    torsoOutline.scale.copy(body.scale).multiplyScalar(1.09);
    pelvis.add(torsoOutline);
    for (const x of [-.095, .095]) ball(head, .025, [x, .045, .264], colors.ink);
    pelvis.add(head);
    const belt = cylinder(pelvis, .18, .18, .065, [0, .2, 0], { scout: 0xc7ab69, maker: colors.coral, gardener: 0x87a86a, merchant: colors.teal }[role], 12);
    const limbs = {};
    for (const side of [-1, 1]) {
      for (const part of ["upperArm", "forearm", "thigh", "shin"]) limbs[`${part}${side}`] =
        cylinder(root, part.includes("Arm") || part === "forearm" ? .065 : .075, .075, 1, [0, 0, 0], colors.ivory, 8);
      limbs[`hand${side}`] = ball(root, .075, [0, 0, 0], colors.ivory);
      limbs[`foot${side}`] = ball(root, .08, [0, 0, 0], colors.ivory, [1, .65, 1.5]);
    }
    const carry = socket(root, "carry", [0, .98, .5]);
    const tool = group("tool");
    box(tool, [.055, .55, .055], [0, -.12, 0], colors.darkWood);
    box(tool, [.25, .14, .1], [0, .15, 0], colors.metal);
    root.add(tool);
    return { root, pelvis, body, torsoOutline, head, belt, limbs, carry, tool, role };
  }

  return { colors, material, group, mesh, box, ball, cylinder, tube, socket, entity,
    terrain, workshop, water, crops, wheelModel, crate, lid, stone, magnet,
    generator, glass, lamp, leaf, rope, towerModel, ship, fish, packet, person };
}
