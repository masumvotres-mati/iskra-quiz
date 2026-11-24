"use strict";

const island2View = { scaleY: .81, top: 90, height: 740, depth: 332 };
const island2Sea = ([x, y]) => [x, y + island2View.depth - 160];

const island2Iso = (() => {
  const slope = 112 / 248;
  const unit = 24;
  const project = ([x, y, z = 0]) => [318 + (x - y) * unit, 350 + (x + y) * unit * slope - z * unit];
  const unproject = ([x, y], height = 0) => {
    const across = (x - 318) / unit;
    const away = (y + height - 350) / (unit * slope);
    return [(away + across) / 2, (away - across) / 2, height / unit];
  };
  const face = (plane) => plane === "ground" ? `matrix(.707107 ${slope * .707107} -.707107 ${slope * .707107} 0 0)`
    : `matrix(.9 ${slope * .9 * (plane === "y" ? -1 : 1)} 0 1 0 0)`;
  const path = (points) => `M${points.map((point) => point.map((n) => +n.toFixed(3)).join(" ")).join("L")}Z`;
  const box = (x, y, width, depth, height, colors = ["#f3ce8c", "#e1ae6b", "#bd8b52"]) => {
    const p = (a, b, z) => [x + a - b, y + (a + b) * slope - z];
    return `<path stroke="none" d="${path([p(-width / 2, -depth / 2, height), p(width / 2, -depth / 2, height),
      p(width / 2, depth / 2, height), p(-width / 2, depth / 2, height)])}" fill="${colors[0]}"/>
      <path stroke="none" d="${path([p(-width / 2, depth / 2, height), p(width / 2, depth / 2, height),
        p(width / 2, depth / 2, 0), p(-width / 2, depth / 2, 0)])}" fill="${colors[1]}"/>
      <path stroke="none" d="${path([p(width / 2, -depth / 2, height), p(width / 2, depth / 2, height),
        p(width / 2, depth / 2, 0), p(width / 2, -depth / 2, 0)])}" fill="${colors[2]}"/>`;
  };
  const disc = (radius, thickness, plane, front, edge, contents = "") => {
    const offset = plane === "ground" ? [0, thickness] : [thickness, -thickness * slope];
    return `<g data-iso-solid="disc" data-iso-plane="${plane}">
      <g transform="translate(${offset.join(" ")})"><g transform="${face(plane)}"><circle r="${radius}" fill="${edge}"/></g></g>
      <g data-iso-face="${plane}" transform="${face(plane)}"><circle r="${radius}" fill="${front}"/>${contents}</g></g>`;
  };
  const cubeGrid = () => {
    return `<g stroke="none">
      <rect x="-124" y="-124" width="248" height="248" fill="url(#i2-tiles-top)" transform="matrix(1 ${slope} -1 ${slope} 318 350)"/>
      <rect x="-124" width="248" height="${island2View.depth}" fill="url(#i2-tiles-left)" transform="matrix(1 ${slope} 0 1 194 ${350 + 124 * slope})"/>
      <rect x="-124" width="248" height="${island2View.depth}" fill="url(#i2-tiles-right)" transform="matrix(-1 ${slope} 0 1 442 ${350 + 124 * slope})"/>
      </g>`;
  };
  const tilePattern = (id, height, reverse = false) => {
    const width = 248 / 12, near = reverse ? width - .65 : .65, far = reverse ? .65 : width - .65;
    const top = id === "i2-tiles-top";
    return `<pattern id="${id}" width="${width}" height="${height}" patternUnits="userSpaceOnUse">
      <path d="M${near} ${height - .65}V.65H${far}" fill="none" stroke="${top ? "#ffffff" : "#e5c595"}" stroke-width=".9" opacity="${top ? .1 : .22}"/>
      <path d="M${far} .65V${height - .65}H${near}" fill="none" stroke="${top ? "#000000" : "#5d402b"}" stroke-width=".65" opacity="${top ? .19 : .16}"/>
      </pattern>`;
  };
  return { slope, unit, project, unproject, face, box, disc, cubeGrid, tilePattern };
})();

const island2Layout = {
  wheelRest: [244, 400], wheelDrive: [237, 418], wheelPottery: [244, 400],
  crateRest: [432, 391], cabinBase: [416, 373], cabinTop: [416, 225], cabinLanding: [416, 284],
  rope: [396, 289], copper: [328, 425], spring: [237, 316], farm: [157, 333],
  glassRest: [188, 374], glassRough: [291, 386], glassReady: [378, 400], glassTop: [471, 190],
  lamp: [471, 205], lampRest: [497, 358], cargoLanding: [445, 285], cargoBoat: island2Sea([567, 550]),
  boatWaiting: island2Sea([574, 304]), boatDock: island2Sea([574, 558]), loadOffset: [0, -29],
  coverHome: [341, 380], coverBench: [292, 406], coverBridge: [283, 432],
  lily: [177, 323], fish: [157, 340], craftShore: island2Sea([566, 540]), craftSea: island2Sea([510, 566]),
};

const island2Lighting = (() => {
  const direction = new DOMPoint(-.65, -.76 / island2View.scaleY, 0, 0);
  const lightHeight = .6 / island2View.scaleY;
  const sum = (direction.y + lightHeight) / island2Iso.slope;
  const sun = [(sum + direction.x) / 2, (sum - direction.x) / 2, lightHeight];
  const sunLength = Math.hypot(...sun);
  function local(matrix, width = 1, height = 1) {
    const point = direction.matrixTransform(matrix.inverse());
    const x = point.x / width;
    const y = point.y / height;
    const length = Math.hypot(x, y);
    return { x: x / length, y: y / length };
  }
  function paint(gradient, matrix, width, height) {
    const light = local(matrix, width, height);
    if (gradient.tagName === "radialGradient") {
      gradient.setAttribute("cx", .5 + light.x * .28);
      gradient.setAttribute("cy", .5 + light.y * .28);
    } else {
      gradient.setAttribute("x1", .5 + light.x * .55);
      gradient.setAttribute("y1", .5 + light.y * .55);
      gradient.setAttribute("x2", .5 - light.x * .55);
      gradient.setAttribute("y2", .5 - light.y * .55);
    }
  }
  function reflection(node, matrix) {
    const light = local(matrix);
    node.setAttribute("transform", `rotate(${Math.atan2(light.y, light.x) * 180 / Math.PI + 120})`);
  }
  const intensity = (normal) => .22 + .78 * Math.max(0,
    normal.reduce((value, n, i) => value + n * sun[i] / sunLength, 0));
  return { local, paint, reflection, intensity };
})();

const island2Water = (() => {
  const unit = island2Iso.unit;
  const spring = island2Iso.unproject(island2Layout.spring);
  const inlet = [spring[0], spring[1] + 26 / unit, 0];
  const wheel = island2Iso.unproject(island2Layout.wheelDrive);
  const farm = island2Iso.unproject(island2Layout.farm);
  const edge = [124 / unit, wheel[1], 0];
  const route = [inlet, [inlet[0], wheel[1], 0], wheel, edge];
  const irrigation = [[inlet[0], farm[1], 0], farm];
  const width = 22, surface = -6;
  const level = (point, z) => [point[0], point[1], z / unit];
  const flow = route.map((point) => level(point, surface));
  const sourceFlow = [level(spring, surface), flow[0]];
  const fall = [flow.at(-1), level(edge, -island2View.depth)];
  const pool = [edge[0] + .33, edge[1] + .33, -island2View.depth / unit];
  const xy = (point) => island2Iso.project(point).map((value) => +value.toFixed(3));
  const path = (points, close = false) => `M${points.map((point) => xy(point).join(" ")).join("L")}${close ? "Z" : ""}`;
  const around = (point, half, z) => [[-half, -half], [-half, half], [half, half], [half, -half]]
    .map(([u, v]) => [point[0] + u / unit, point[1] + v / unit, z / unit]);
  function strip(a, b, span, z) {
    const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
    const normal = [-dy / length * span / unit / 2, dx / length * span / unit / 2];
    return path([[a[0] + normal[0], a[1] + normal[1], z / unit],
      [b[0] + normal[0], b[1] + normal[1], z / unit],
      [b[0] - normal[0], b[1] - normal[1], z / unit],
      [a[0] - normal[0], a[1] - normal[1], z / unit]], true);
  }
  function hollow(id, opening, water, contents = "") {
    return `<defs><clipPath id="${id}"><path d="${opening}"/></clipPath></defs>
      <path class="i2-water-bank" d="${opening}" fill="#169e60"/>
      <g clip-path="url(#${id})"><g id="${id}-water"><path class="i2-water-surface" d="${water}" fill="url(#i2-water-texture)"/>${contents}</g></g>`;
  }
  function footprint(routes, z) {
    return routes.flatMap((points) => points.slice(1).map((point, index) => strip(points[index], point, width, z))).join("")
      + routes.flatMap((points) => points.slice(1, -1)).map((p) => path(around(p, width / 2, z), true)).join("")
      + path(around(spring, 24, z), true);
  }
  function channel(id, routes, lip = "") {
    const segments = routes.flatMap((points) => points.slice(1).map((point, index) => [points[index], point]));
    const currents = segments.filter(([a, b]) => Math.hypot(a[0] - b[0], a[1] - b[1]) * unit > 36)
      .map(([a, b], index) => {
        const from = a.map((n, i) => n + (b[i] - n) * .2);
        const to = a.map((n, i) => n + (b[i] - n) * .34);
        const start = xy(from), end = xy(b);
        return `<path class="i2-current" d="${strip(from, to, 4, surface)}" fill="#a3cff6"
          style="--dx:${(end[0] - start[0]) * .6}px;--dy:${(end[1] - start[1]) * .6}px;animation-delay:${-index * .8}s"/>`;
      }).join("");
    return hollow(id, footprint(routes, 0) + lip, footprint(routes, surface), currents);
  }
  const springShape = around(spring, 24, 0);
  const springPoint = xy(level(spring, surface));
  const ripples = `<g transform="matrix(1 ${island2Iso.slope} -1 ${island2Iso.slope} ${springPoint.join(" ")})">
    <path class="i2-source-shimmer" d="M-14-6q3-2 6 0m7 13q3-2 6 0m3-18q3-2 6 0"
      fill="none" stroke="#4a99d8" stroke-width="1" opacity=".45"/>
    </g>`;
  const springMesh = springFrame(1);
  const source = `<defs><clipPath id="i2-spring-cut"><path d="${path(springShape, true)}"/></clipPath></defs>
    <path class="i2-water-bank" d="${path(springShape, true)}" fill="#169e60"/>
    <g clip-path="url(#i2-spring-cut)">
      <path id="i2-spring-floor" d="${springMesh.floor}" fill="#b8996f"/>
      <path id="i2-spring-left-wall" d="${springMesh.left}" fill="#715333"/>
      <path id="i2-spring-right-wall" d="${springMesh.right}" fill="#967044"/>
      <path id="i2-spring-left-lip" class="i2-water-bank" d="${springMesh.leftLip}" fill="#169e60"/>
      <path id="i2-spring-right-lip" class="i2-water-bank" d="${springMesh.rightLip}" fill="#169e60"/>
      <g id="i2-spring-cut-water"><path class="i2-water-surface" d="${springMesh.water}" fill="url(#i2-water-texture)"/>${ripples}</g>
    </g>`;
  const gatePoint = (u, z = 0) => [spring[0] + u / unit, spring[1] + 26 / unit, z / unit];
  const gate = [-14, 14].map((v) => {
    const [x, y] = xy(gatePoint(v));
    return island2Iso.box(x, y, 3, 3, 14, ["#e6c286", "#bb945d", "#927044"]);
  }).join("") + `<path id="i2-valve-board" d="${path([gatePoint(-12, 8), gatePoint(12, 8), gatePoint(12, 2), gatePoint(-12, 2)], true)}" fill="#d2a668"/>
    <path id="i2-valve-cord" d="${path([gatePoint(0, 8), gatePoint(0, 17)])}" fill="none" stroke="#8a744d" stroke-width="1.3"/>`;
  const gateCord = (lift) => path([gatePoint(0, 8 + lift), gatePoint(0, 17)]);
  const [wx, wy] = xy(level(wheel, surface));
  const [fx, fy] = xy(fall[1]);
  const [px, py] = xy(pool);
  const fallPoint = (offset, z) => [edge[0], edge[1] + offset / unit, z / unit];
  const fallFrame = (t) => {
    const bottom = surface + (-island2View.depth - surface) * t * t;
    return path([fallPoint(width / 2, surface), fallPoint(-width / 2, surface),
      fallPoint(-width / 2, bottom), fallPoint(width / 2, bottom)], true);
  };
  const lipShape = path([fallPoint(-width / 2, 0), fallPoint(width / 2, 0),
    fallPoint(width / 2, surface), fallPoint(-width / 2, surface)], true);
  const mainRoute = [spring, ...route];
  const channels = `<defs><clipPath id="i2-channel-top"><path d="M70 350 318 238 566 350 318 462Z"/><path d="${lipShape}"/></clipPath>
      <clipPath id="i2-channel-cut-reveal"><path/></clipPath><clipPath id="i2-channel-wet-reveal"><path/></clipPath></defs>
    <g clip-path="url(#i2-channel-top)"><g id="i2-channel-ground">${channel("i2-main-cut", [mainRoute, irrigation], lipShape)}</g></g>
    <path id="i2-waterfall" d="${fallFrame(1)}" fill="#348fe8"/>
    <g id="i2-wheel-flow" fill="none" stroke="#abd5f7" stroke-width="1.1"><path d="M${wx - 9} ${wy + 1}q9 4 18 0m-14-1 1-3m8 2 2-3"/></g>
    <g id="i2-bypass-flow" fill="none" stroke="#9bc8f1" stroke-width=".7"><path d="M${wx - 5} ${wy + 1}l10 4.516"/></g>
    <g id="i2-fall-impact" transform="translate(${fx} ${fy})" fill="none" stroke="#badff9" stroke-width="1">
      <path class="i2-fall-splash" d="M-9 0q9 6 18 0m-14-1-2-5m8 5 3-4"/>
    </g><g id="i2-dig-crumbs" fill="#99724c" stroke="none" style="display:none">
      <path d="m-2-2 3-1 1 3-3 1Z"/><path d="m-2-2 3-1 1 3-3 1Z"/><path d="m-2-2 3-1 1 3-3 1Z"/>
    </g>`;
  const basin = `<ellipse cx="${px}" cy="${py}" rx="26" ry="${26 * island2Iso.slope}" fill="#7ce7ef" stroke="#4aa5bb" stroke-width="1"/>
    <path d="M${px - 14} ${py + 1}q14 9 28-1m-21-5q7 6 14 0" fill="none" stroke="#d3ffff" stroke-width="1.5"/>`;
  const pondShape = [[-22, -18], [9, -18], [9, -24], [25, -24], [25, 13], [15, 13], [15, 22], [-22, 22]]
    .map(([u, v]) => [farm[0] + u / unit, farm[1] + v / unit, 0]);
  const pond = hollow("i2-pond-cut", path(pondShape, true),
    path(pondShape.map((point) => level(point, surface)), true));
  const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) * unit;
  const routeLength = mainRoute.slice(1).reduce((sum, point, i) => sum + distance(mainRoute[i], point), 0);
  function portion(points, remaining) {
    const result = [points[0]];
    for (let i = 1; i < points.length && remaining > 1e-8; i++) {
      const length = distance(points[i - 1], points[i]), amount = Math.min(1, remaining / length);
      result.push(points[i - 1].map((n, axis) => n + (points[i][axis] - n) * amount));
      remaining -= length;
    }
    return result;
  }
  function development(t) {
    const routesAt = (progress) => [portion(mainRoute, routeLength * progress),
      portion(irrigation, Math.max(0, routeLength * progress - distance(spring, irrigation[0])))];
    const ground = routesAt(t), wet = Math.max(0, (t - .12) / .88);
    return { cut: footprint(ground, 0) + (t === 1 ? lipShape : ""),
      water: footprint(routesAt(wet), surface) + (wet === 1 ? lipShape : ""), head: xy(ground[0].at(-1)) };
  }
  const bankPath = [[spring[0], spring[1] + 44 / unit, 0], route[1], wheel, [edge[0] - 20 / unit, edge[1], 0]]
    .map(([u, v]) => xy([u + 16 / unit, v - 16 / unit, 0]));
  function springFrame(t) {
    const dig = Math.min(1, t / .35), depth = 24 * dig * dig * (3 - 2 * dig);
    const wet = Math.max(0, (t - .35) / .65), waterZ = -24 + (24 + surface) * wet;
    const wall = (a, b, top, bottom) => path([level(springShape[a], top), level(springShape[b], top),
      level(springShape[b], bottom), level(springShape[a], bottom)], true);
    return { floor: path(springShape.map((point) => level(point, -depth)), true),
      left: wall(0, 1, -Math.min(2, depth), -depth), right: wall(3, 0, -Math.min(2, depth), -depth),
      leftLip: wall(0, 1, 0, -Math.min(2, depth)), rightLip: wall(3, 0, 0, -Math.min(2, depth)),
      water: path(springShape.map((point) => level(point, waterZ)), true), opacity: Math.min(1, wet * 6) };
  }
  return { route, irrigation, flow, sourceFlow, fall, pool, source, gate, channels, basin, pond, width, surface,
    development, bankPath, springFrame, fallFrame, gateCord };
})();

const island2Stone = (() => {
  const outline = [[-17, 0], [17, 0], [19, 29], [12, 47], [-9, 51], [-18, 35]];
  const faces = [[5, 4, 3, 2, 1, 0], [6, 7, 8, 9, 10, 11],
    ...outline.map((_, i) => [i, (i + 1) % 6, (i + 1) % 6 + 6, i + 6])];
  const origin = island2Iso.project([0, 0, 0]);
  const project = (point) => island2Iso.project(point.map((n) => n / island2Iso.unit)).map((n, i) => n - origin[i]);
  const path = (points, close = false) => `M${points.map((p) => project(p).map((n) => +n.toFixed(3)).join(" ")).join("L")}${close ? "Z" : ""}`;
  function normal(a, b, c) {
    const u = b.map((n, i) => n - a[i]), v = c.map((n, i) => n - a[i]);
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const length = Math.hypot(...n);
    return n.map((value) => value / length);
  }
  function hull(points) {
    const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const turn = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const edge = (values) => {
      const result = [];
      for (const point of values) {
        while (result.length > 1 && turn(result.at(-2), result.at(-1), point) <= 0) result.pop();
        result.push(point);
      }
      return result.slice(0, -1);
    };
    return [...edge(sorted), ...edge([...sorted].reverse())];
  }
  function frame(tilt, yaw) {
    const rotate = ([u, v, z]) => {
      const across = v * Math.cos(tilt) + (z - 25.5) * Math.sin(tilt);
      return [(u * Math.cos(yaw) - across * Math.sin(yaw)) * .7,
        (u * Math.sin(yaw) + across * Math.cos(yaw)) * .7,
        ((z - 25.5) * Math.cos(tilt) - v * Math.sin(tilt)) * .7];
    };
    const vertices = [9, -9].flatMap((v) => outline.map(([u, z]) => rotate([u, v, z])));
    const base = Math.min(...vertices.map((p) => p[2]));
    for (const point of vertices) point[2] -= base;
    const visible = faces.map((indices, index) => {
      const points = indices.map((i) => vertices[i]);
      const n = normal(...points.slice(0, 3));
      const light = island2Lighting.intensity(n);
      const color = [112, 126, 101].map((dark, i) => Math.round(dark + ([211, 219, 191][i] - dark) * light));
      return { index, normal: n, d: path(points, true), fill: `rgb(${color.join(" ")})`,
        depth: points.reduce((sum, p) => sum + p[0] + p[1] + p[2] * 2 * island2Iso.slope, 0) / points.length };
    }).filter((f) => f.normal[0] + f.normal[1] + f.normal[2] * 2 * island2Iso.slope > 1e-6)
      .sort((a, b) => a.depth - b.depth);
    const cracks = [9.04, -9.04].map((v, index) => {
      const points = [[-6, v, 39], [-1, v, 28], [-7, v, 17], [-1, v, 28], [8, v, 21]]
        .map(rotate).map(([x, y, z]) => [x, y, z - base]);
      return visible.some((face) => face.index === index) ? path(points) : "";
    });
    const projected = vertices.map(project);
    const boundary = hull(projected);
    const ground = vertices.map(([x, y]) => project([x, y, 0]));
    return { vertices, faces: visible, cracks,
      anchor: project(vertices.slice(6).reduce((sum, point) => sum.map((n, i) => n + point[i] / 6), [0, 0, 0])),
      outline: `M${boundary.map((p) => p.map((n) => +n.toFixed(3)).join(" ")).join("L")}Z`,
      shadow: [Math.min(...ground.map((p) => p[0])), Math.max(...ground.map((p) => p[0])),
        Math.min(...ground.map((p) => p[1])), Math.max(...ground.map((p) => p[1]))] };
  }
  return { frame, thickness: 18 * .7 };
})();

const island2Work = (() => {
  const farm = island2Iso.unproject(island2Layout.farm);
  const point = (u, v) => island2Iso.project([farm[0] + u / 24, farm[1] + v / 24, 0]);
  function fieldClip(t) {
    const [a, b, c, d] = [[-26, -26], [-26, 26], [-26 + 52 * t, 26], [-26 + 52 * t, -26]]
      .map(([u, v]) => point(u, v));
    return `M${a[0]} ${a[1] - 3}L${b[0]} ${b[1] + 4}L${c[0]} ${c[1] + 4}L${d[0]} ${d[1] - 3}Z`;
  }
  const cutawayClip = (t) => `M210 425 290 461V${461 + 45 * t}L210 ${425 + 45 * t}Z`;
  return { shovelRest: [111, 325], clayBank: [210, 348], fieldClip, cutawayClip };
})();

const island2SceneArtwork = `
<svg viewBox="0 ${island2View.top} 640 ${island2View.height}" width="640" height="${island2View.height * island2View.scaleY}" preserveAspectRatio="none" role="img" aria-labelledby="i2-art-title i2-art-description" xmlns="http://www.w3.org/2000/svg">
<title id="i2-art-title">Wyspa małych spraw</title>
<desc id="i2-art-description">Mały świat, w którym mieszkańcy odkrywają przejścia, przerabiają przedmioty i pomagają sobie w nieoczekiwanych zadaniach.</desc>
<defs>
 ${island2Iso.tilePattern("i2-tiles-top", 248 / 12)}
 ${island2Iso.tilePattern("i2-tiles-left", island2View.depth / 12)}
 ${island2Iso.tilePattern("i2-tiles-right", island2View.depth / 12, true)}
 <pattern id="i2-water-texture" width="${248 / 6}" height="${248 / 6}" patternUnits="userSpaceOnUse"
   patternTransform="matrix(1 ${island2Iso.slope} -1 ${island2Iso.slope} 318 ${350 - island2Water.surface})">
  <rect width="${248 / 6}" height="${248 / 6}" fill="#78baf6"/>
  <path d="M3 5q2-1 4 0m9-2 3 1m11 5q2-1 4 0M8 18l3-1m11 1q2-1 4 0m9 7 3 1M3 31q2-1 4 0m11 5 3-1m8 2q2-1 4 0M34 3l3 1M28 29l3-1M12 27q2-1 4 0M18 10l3 1M3 22l3 1M35 35l3-1M24 39l3 1"
    fill="none" stroke="#398fd8" stroke-width="1" opacity=".65" stroke-linecap="round"/>
  <path d="M9 10l4 1m13-8 3-1M17 23l4 1m11-7 4 1M6 38l4-1M23 31l4 1M1 14l3-1M36 10l3 1"
    fill="none" stroke="#a3d2fb" stroke-width="1" opacity=".65" stroke-linecap="round"/>
 </pattern>
 <clipPath id="i2-cave-mask"><path d="M325 383v-39a15 15 0 0 1 30 0v39Z"/></clipPath>
 <clipPath id="i2-under-mask"><path d="m210 425 80 36v45l-80-36Z"/></clipPath>
 <clipPath id="i2-field-work-mask"><path/></clipPath>
 <clipPath id="i2-cutaway-work-mask"><path/></clipPath>
 <clipPath id="i2-meadow-mask"><ellipse id="i2-meadow-radius" cx="157" cy="333" rx="0" ry="0"/></clipPath>
 <clipPath id="i2-tower-growth"><rect id="i2-tower-growth-rect" x="425" y="130" width="100" height="250"/></clipPath>
 <radialGradient id="i2-skin-head" cx="30%" cy="23%" r="85%"><stop stop-color="#ffffdc"/><stop offset=".58" stop-color="#ffffad"/><stop offset="1" stop-color="#d9dd86"/></radialGradient>
 <linearGradient id="i2-skin-body" x2="95%" y2="35%"><stop stop-color="#ffffc2"/><stop offset=".65" stop-color="#f8fba7"/><stop offset="1" stop-color="#d8dd85"/></linearGradient>
 <linearGradient id="i2-wood-round" x1="15%" y1="0%" x2="85%" y2="100%"><stop stop-color="#ffe2a6"/><stop offset=".46" stop-color="#ebbd72"/><stop offset="1" stop-color="#bc8440"/></linearGradient>
 <radialGradient id="i2-stone-cap" cx="34%" cy="22%" r="90%"><stop stop-color="#fff0ca"/><stop offset=".6" stop-color="#e6d3a4"/><stop offset="1" stop-color="#bba16c"/></radialGradient>
 <linearGradient id="i2-stone-wall" x2="100%" y2="0%"><stop stop-color="#e7d4a2"/><stop offset=".58" stop-color="#d7be8b"/><stop offset="1" stop-color="#ac8e5e"/></linearGradient>
 <radialGradient id="i2-glass-round" cx="28%" cy="22%" r="90%"><stop stop-color="#d4ffff" stop-opacity=".85"/><stop offset=".5" stop-color="#7ee4ed" stop-opacity=".75"/><stop offset="1" stop-color="#3fb0c2" stop-opacity=".95"/></radialGradient>
 <radialGradient id="i2-pot-round" cx="35%" cy="25%" r="90%"><stop stop-color="#ffd49c"/><stop offset=".55" stop-color="#dda16d"/><stop offset="1" stop-color="#b67448"/></radialGradient>
 <linearGradient id="i2-magnet-red" x1="15%" y1="5%" x2="85%" y2="95%"><stop stop-color="#ffab61"/><stop offset=".42" stop-color="#ed6a3d"/><stop offset="1" stop-color="#b63526"/></linearGradient>
 <g id="i2-magnet-solid" stroke="#34372b" stroke-width="1.8" stroke-linejoin="round">
  <path d="M-16-6V-25Q-16-39 0-39 16-39 16-25V-6H6V-25Q6-30 0-30-6-30-6-25V-6Z" fill="#8d3529" transform="translate(4 -1.8)"/>
  <path d="M-16-6V-25Q-16-39 0-39 16-39 16-25V-6H6V-25Q6-30 0-30-6-30-6-25V-6Z" fill="url(#i2-magnet-red)"/>
  <path d="M6-6V-25Q6-30 0-30L4-31.8Q10-31.8 10-26.8V-7.8Z" fill="#9e3829" stroke-width="1"/>
  <path d="M-16-14H-6V-6H-16Zm22 0H16V-6H6Z" fill="#f3f5da"/>
  <path d="m-13-28q1-7 9-7" fill="none" stroke="#ffd398" stroke-width="2.5" stroke-linecap="round"/>
 </g>
 <g id="i2-magnet-token"><use href="#i2-magnet-solid" transform="translate(0 3) scale(.5)"/></g>
 <radialGradient id="i2-glow"><stop stop-color="#ffe486" stop-opacity=".65"/><stop offset="1" stop-color="#ffe486" stop-opacity="0"/></radialGradient>
 <radialGradient id="i2-level-aura"><stop stop-color="#fffbc5" stop-opacity=".95"/><stop offset=".4" stop-color="#ffe16b" stop-opacity=".7"/><stop offset="1" stop-color="#ffbf24" stop-opacity="0"/></radialGradient>
 <g id="i2-box" stroke="#514f3e" stroke-width="3.5" stroke-linejoin="round">
  <path d="m-21-26 21-10 22 10v17L0 1-21-9Z" fill="#e1ae6b"/>
  <path d="m-21-26 21 9 22-9-22-10Z" fill="#f3ce8c"/><path d="M0-17V1l22-10v-17Z" fill="#c68e54"/>
  <path d="m-13-26 14 6 13-6M-14-14l7 3m14 0 8-3" fill="none" stroke-width="2.5"/>
 </g>
 <g id="i2-ear" fill="#efc663" stroke="#695e3d" stroke-width="2.5" stroke-linecap="round">
  <path d="M0 0v-31m0 16-7-8m7 1 7-8" fill="none"/><ellipse cx="-5" cy="-23" rx="3.5" ry="6" transform="rotate(-35 -5 -23)"/><ellipse cx="5" cy="-29" rx="3.5" ry="6" transform="rotate(35 5 -29)"/><ellipse cy="-36" rx="3.5" ry="6"/>
 </g>
</defs>
<g id="i2-background">
 <rect width="640" height="${island2View.top + island2View.height}" fill="#64c8f4"/>
 <path d="m72 ${355 + island2View.depth} 248 112 248-112 47 14-266 121-277-125Z" fill="#172e30" opacity=".8"/>
 <g class="i2-waves" stroke="#c3f6ff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"><path d="M26 ${375 + island2View.depth}h18m8 88h28m448-80h22m32-55h23M548 327h29M24 337h19"/></g>
</g>
<g id="i2-base-terrain" stroke="#654c30" stroke-width="1.5" stroke-linejoin="round">
 ${island2Iso.box(318, 350 + island2View.depth, 248, 248, island2View.depth, ["#b18860", "#9a774f", "#816343"])}
 <path d="M70 350 318 238 566 350 318 462Z" fill="#25e98b" stroke="none" clip-path="url(#i2-meadow-mask)"/>
 ${island2Iso.cubeGrid()}
</g>
<g id="i2-cutaway" stroke="none">
 <path d="m210 425 80 36v45l-80-36Z" fill="#493c30"/>
 <g clip-path="url(#i2-under-mask)">
  <path d="m219 421 82 37v45l-82-37Z" fill="#715a40"/>
  <path d="M210 425V470L219 466V421Z" fill="#604a35"/>
  <path d="M210 470 290 506 299 502 219 466Z" fill="#c0a070"/>
  <path d="M210 425 290 461 299 457 219 421Z" fill="#856847"/>
 </g>
</g>
<g id="i2-magnet"><g id="i2-found-magnet" transform="translate(0 3) scale(.5)"><use href="#i2-magnet-solid"/></g>
 <path id="i2-magnet-glint" d="M0-23V-18m-10 4 5 2m12-7-3 4" fill="none" stroke="#fff4b8" stroke-width="1.5" opacity="0"/>
</g>
<g id="i2-middle-walls" stroke="#333027" stroke-width="2" stroke-linejoin="round">
 <ellipse cx="335" cy="374" rx="43" ry="17" fill="#435132" opacity=".28" stroke="none"/>
 <path d="M296 366v-44q0-25 38-26 40 0 40 26v44l-34 16Z" fill="url(#i2-stone-wall)"/>
 <path d="M351 307q23 2 23 15v44l-23 11Z" fill="#8f7048" stroke="none" opacity=".14"/>
 <ellipse cx="334" cy="317" rx="40" ry="18" fill="#b49a65"/>
 <ellipse cx="334" cy="313" rx="40" ry="18" fill="url(#i2-stone-cap)"/>
 <path d="m303 337 13-5m44-3 8 3m-13 28 11-5" fill="none" stroke="#a78d65" stroke-width="1.5"/>
</g>
<g id="i2-cave" stroke="#3d5847" stroke-width="3.5">
 <path d="M325 381v-37a15 15 0 0 1 30 0v37l-15 7Z" fill="#354d43"/>
 <path d="m327 375 13-6 13 6-13 6Z" fill="#cfb482" stroke="none"/>
 <path d="M327 375 340 381V388L327 383Z" fill="#b29160" stroke="none"/>
 <path d="M340 381 353 375V383L340 388Z" fill="#90724b" stroke="none"/>
 ${island2Iso.box(343, 374, 12, 7, 18, ["#e1bd82", "#c89d62", "#9d7849"])}
</g>
<path id="i2-cave-lip" d="M323 381v-37a17 17 0 0 1 34 0v37" fill="none" stroke="#7f9b83" stroke-width="4"/>
<g id="i2-door-knock" fill="none" stroke="#f4cf67" stroke-width="2" stroke-linecap="round">
 <path d="m354 346 5-5m-2 14 7-1m-20-15 1-7"/>
</g>
<g id="i2-cover" stroke-linejoin="round">
 <ellipse id="i2-rock-contact" fill="#435132" opacity=".28" stroke="none"/>
 <g id="i2-rock-solid" stroke="none">${Array.from({ length: 8 }, (_, i) => `<path data-rock-face="${i}"/>`).join("")}</g>
 <path id="i2-rock-outline" fill="none" stroke="#66725b" stroke-width="1.3"/>
 <g id="i2-rock-cracks" fill="none" stroke="#718064" stroke-width="1.1" opacity=".75"><path/><path/></g>
</g>
<g id="i2-water" stroke="none">
 ${island2Water.source}
 <g id="i2-valve">${island2Water.gate}</g>
</g>
<g id="i2-stream" stroke-linecap="round" stroke-linejoin="round">${island2Water.channels}</g>
<g id="i2-outfall">${island2Water.basin}</g>
<g id="i2-overflow">${island2Water.pond}</g>
<g id="i2-seeds" stroke="#3d5847" stroke-width="3" stroke-linejoin="round">
 <g class="i2-field-bed">
 ${island2Iso.box(157, 336, 52, 52, 3, ["#c59b67", "#a57b4e", "#8d643e"])}
 <path d="m116 333 41-18 40 18-40 18Z" fill="#cda16b" stroke="none"/>
 <path d="m133 332 25-11m-11 20 25-11" stroke="#e5c38b" stroke-width="2.5"/>
 </g>
 <g class="i2-field-basin" stroke="none">
  <path d="m105 333 52-23 52 23-52 23Z" fill="#806646"/>
  <path d="M105 333 157 310V316L116 337Z" fill="#6f573d"/>
  <path d="M157 310 209 333 198 337 157 316Z" fill="#9b7a50"/>
  <path d="m116 337 41-21 41 21-41 19Z" fill="#b9a17c"/>
  <g fill="#89bfc9"><ellipse cx="145" cy="339" rx="4" ry="1.8"/><ellipse cx="170" cy="336" rx="3" ry="1.35"/></g>
 </g>
 <g id="i2-shovel" stroke-linejoin="round"><g id="i2-shovel-pose" transform="rotate(-15)">
  <path d="M-1.8 0H1.8V11H-1.8Z" fill="#bd925a"/>
  <path d="M0 0H1.8V11H0Z" fill="#8f693e"/>
  <path d="M-5-11Q0-15 5-11V-3Q0 4-5-3ZM-2.5-9V-4Q0-1 2.5-4V-9Q0-11-2.5-9Z" fill="#caa36c" fill-rule="evenodd" stroke="#8f693e" stroke-width="1"/>
  <path d="M-4 6H8L7 15Q2 23-3 15Z" fill="#718d83"/>
  <path d="M-6 7H6L5 16Q0 24-5 16Z" fill="#b8cdc2"/>
  <path d="M-4 9H0V19Q-3 17-4 14Z" fill="#dde9dc"/>
 </g></g>
 <g id="i2-clay" stroke="none">
  <ellipse cy="-1" rx="13" ry="5.9" fill="#956643"/>
  <path d="M-13-3Q-14-13-5-14 3-20 11-11 17-2 7 1-5 5-13-3Z" fill="#c49468"/>
  <path d="M-10-7Q-8-14-2-12 5-15 9-9 0-12-10-7Z" fill="#dfb185"/>
 </g>
 <g id="i2-field-clods" fill="#ac7e4c" stroke="none" style="display:none">
  <path d="m-2-2 4-1 1 4-4 1Z"/><path d="m-2-2 4-1 1 4-4 1Z"/><path d="m-2-2 4-1 1 4-4 1Z"/>
 </g>
 <g id="i2-sowing-seeds" fill="#f7d793" stroke="none" style="display:none">
  <ellipse rx="2" ry=".9"/><ellipse rx="2" ry=".9"/><ellipse rx="2" ry=".9"/>
 </g>
 <g id="i2-cliff-clods" fill="#9a774f" stroke="none" style="display:none">
  <path d="m-5-3 8-2 3 7-9 1Z"/><path d="m-5-3 8-2 3 7-9 1Z"/><path d="m-5-3 8-2 3 7-9 1Z"/>
 </g>
 <g class="i2-seed-first" fill="#f7d793" stroke="none"><ellipse cx="139" cy="331" rx="4" ry="2.5"/><ellipse cx="157" cy="326" rx="4" ry="2.5"/><ellipse cx="173" cy="338" rx="4" ry="2.5"/></g>
 <g class="i2-sprouts" fill="#7ab46b"><path d="M139 332v-17m0 8q-13-2-9-10 11 0 9 10m0-5q10-10 13-1-2 8-13 6M174 338v-19m0 10q-13-2-10-11 12 0 10 11m0-5q10-12 14-3-3 8-14 8"/></g>
 <g class="i2-harvest"><use href="#i2-ear" x="135" y="332"/><use href="#i2-ear" x="157" y="324"/><use href="#i2-ear" x="178" y="339"/><path d="m111 344 19 8-4 13-19-8Z" fill="#edc58b"/><path d="m111 348 16 7" fill="none" stroke-width="2.5"/></g>
 <g id="i2-pond"><path d="M134 329q-13-7-19 0-5 9 11 13 16 1 16-9l-8-4 3 9" fill="#91bd71" stroke="none"/></g>
</g>
<g id="i2-lily" stroke="#47754e" stroke-width="3"><g id="i2-lily-body"><path d="M-6 0q-11-12 5-14 20-2 23 8 4 13-17 15L-6 0 7-3Z" fill="#a0ce79"/><path d="m4-2 11-5M4-2l9 5" fill="none" stroke="#d5e9a1" stroke-width="2.5"/><path id="i2-lily-stem" d="M4 3v23" fill="none" stroke="#6b9455" stroke-width="4"/></g></g>
<g id="i2-fish" fill="#efac63" stroke="#696849" stroke-width="2.5"><path d="M-10 0Q0-12 11 0 0 11-10 0Zm-1 0-7-6v12Z"/><circle cx="4" cy="-1" r="1.5" fill="#354d43" stroke="none"/></g>
<g id="i2-scaffold-short" stroke="#514f3e" stroke-width="3" stroke-linejoin="round">
 ${island2Iso.box(394, 363, 6, 6, 69)}
 ${island2Iso.box(446, 363 + 52 * island2Iso.slope, 6, 6, 69)}
 ${island2Iso.box(420, 307, 58, 6, 8)}
 <circle cx="416" cy="321" r="9" fill="#edc98a"/><path d="M416 330v26m-4 0q4 9 8 0" fill="none" stroke="#8a774f"/>
</g>
<g id="i2-scaffold" stroke="#514f3e" stroke-width="3" stroke-linejoin="round">
 ${island2Iso.box(431, 158, 36, 6, 6)}
 <circle cx="442" cy="163" r="2" fill="#946d3c" stroke-width="1"/>
 <path id="i2-lift-rope" d="M416 163v149" fill="none" stroke="#8a774f" stroke-width="2.5"/>
 <g transform="translate(416 153)">${island2Iso.disc(10, 4, "x", "#edc780", "#ad8955",
   '<g id="i2-pulley-rotor"><path d="M-6 0H6M0-6V6" fill="none" stroke-width="2.5"/></g>')}</g>
</g>
<g id="i2-scaffold-front" stroke="#514f3e" stroke-width="3" stroke-linejoin="round">
 <path d="M441 373V217m0 12h6m-6 54h6m-6 78h6" fill="none" stroke="#969980" stroke-width="2"/>
</g>
<g id="i2-tower" stroke="#3d5847" stroke-width="4" stroke-linejoin="round">
 <ellipse cx="474" cy="362" rx="35" ry="15" fill="#435132" opacity=".26" stroke="none"/>
 ${island2Iso.box(470, 360, 30, 30, 145, ["#fffbe8", "#fff5d8", "#ddd5b1"])}
 <path d="m440 285 30 13.55v15L440 300Z" fill="#e7aa85" stroke="none"/>
 <path d="m470 298.55 30-13.55v15l-30 13.55Z" fill="#be805f" stroke="none"/>
 <g transform="translate(455 366.77)"><path d="M-13 0v-28q13-17 26 0V0Z" transform="${island2Iso.face("x")}" fill="#728f7c" stroke-width="2"/></g>
 <ellipse cx="471" cy="215" rx="23" ry="10.39" fill="#ead1a0" stroke-width="2"/>
 <path d="M442 145v70m58-70v70m-29-77v68" fill="none" stroke="#687e6c" stroke-width="4"/>
 <ellipse cx="471" cy="145" rx="30" ry="7" fill="none" stroke="#687e6c" stroke-width="3"/>
 <path d="M454 209v4h34v-4" fill="none" stroke="#a99059" stroke-width="3"/>
 ${island2Iso.box(472, 246, 34, 42, 6, ["#f4cb81", "#d4a465", "#b27a42"])}
 <path d="m442 246 5 13m58-13-11 13" fill="none" stroke="#a98c5d" stroke-width="3"/>
 ${island2Iso.box(445, 291, 32, 22, 6, ["#e4b979", "#c89c64", "#aa7d4d"])}
 <path d="m426 291 14 14m22-14-6 14" fill="none" stroke="#8a754f" stroke-width="2"/>
 <g stroke="#8a754f" stroke-width="2.5" fill="none"><path d="M426 282v-58m12 63.42v-58"/>
 <path d="m426 233 12 5.42m-12 5 12 5.42m-12 5 12 5.42m-12 5 12 5.42m-12 5 12 5.42"/></g>
 <g id="i2-roof" transform="translate(0 -24)"><path d="m433 169 39-27 43 27q-42 9-82 0Z" fill="#f0773b"/><path d="m472 142 43 27q-22 5-42 5Z" fill="#c7542e"/><path d="M472 142v-12l18 5-17 6" fill="#ffdc35" stroke-width="3"/></g>
</g>
<g id="i2-gallery-rail" fill="none" stroke="#8a754f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
 <path d="M434 242v-8l34 15.35 42-18.97v8m-42 10.97v8"/>
</g>
<g id="i2-drive" fill="none" stroke-linecap="round"><path d="M252 384 308 416" stroke="#696849" stroke-width="7"/><path class="i2-running-belt" d="M252 384 308 416" stroke="#d3b778" stroke-width="3" stroke-dasharray="7 12"/></g>
<path id="i2-wire" d="M348 420 377 407V346l30-13 39 17V243l25-11" fill="none" stroke="#ba8c58" stroke-width="3"/>
<g id="i2-dock" stroke="#65563e" stroke-width="3.5" stroke-linejoin="round">
 <path d="m460 397 38-17 36 16-38 17Z" fill="#e6bc7e"/><path d="m470 393 35 16m-24-21 35 16m-24-21 35 16M466 400v36m62-36v36" fill="none" stroke-width="2.5"/><path d="M487 391v-15m22 7v-15" fill="none" stroke-width="4"/>
</g>
<g id="i2-cliff-ladder" fill="none" stroke="#745330" stroke-width="3" stroke-linecap="round">
 <path d="M501 390V${385 + island2View.depth}M515 396V${391 + island2View.depth}"/>
 ${Array.from({ length: 14 + Math.round((island2View.depth - 160) / 10) }, (_, i) => `<path d="m501 ${398 + i * 10} 14 6.32" stroke="#e9c07e" stroke-width="2.5"/>`).join("")}
 ${island2Iso.box(524, 351 + island2View.depth, 16, 14, 8, ["#eac182", "#bf8b4e", "#956734"])}
</g>
<g id="i2-port-rope" stroke-linecap="round" stroke-linejoin="round" fill="none"><path id="i2-crane-boom" d="M448 325 537 365" stroke="#514f3e" stroke-width="10"/><path id="i2-crane-boom-core" d="M448 325 537 365" stroke="#e0b574" stroke-width="6"/><circle cx="448" cy="325" r="7" fill="#edc98a" stroke="#514f3e" stroke-width="3"/><path id="i2-crane-line" d="M537 365v54" stroke="#8a774f" stroke-width="2.5"/><path id="i2-crane-hook" d="M-4 0v5q4 8 8 0" transform="translate(537 419)" stroke="#514f3e" stroke-width="3"/></g>
<g id="i2-wheel" stroke="#514f3e" stroke-width="3.5" stroke-linejoin="round">
 <g id="i2-table-feet"><path d="m-17-20-4 19m38-19 4 19" fill="none" stroke-width="5"/></g>
 <g id="i2-waterwheel"><path d="M-23-10v-31m46 52v-31" fill="none" stroke="#876b3c" stroke-width="5"/></g>
 <g id="i2-tabletop" transform="translate(0 -26)">${island2Iso.disc(30, 5, "ground", "url(#i2-wood-round)", "#936435",
   `<g id="i2-wheel-rotor"><g id="i2-table-rotor"><path d="M-21 8Q0 15 21 7" fill="none" stroke="#a97840" stroke-width="1" opacity=".55"/></g>
    <g id="i2-paddles" fill="#f3cb82">${Array.from({ length: 8 }, (_, i) =>
      `<g class="i2-paddle" transform="rotate(${i * 45})"><path d="M-6-36H6v14H-6Z"/><path d="M6-36l4-2v14l-4 2Z" fill="#b17c42"/></g>`).join("")}</g>
    <circle r="4" fill="#72512e"/></g><g id="i2-wood-highlight"><path d="M-23-8Q-15-25 9-24" fill="none" stroke="#fff1c1" stroke-width="3.5" stroke-linecap="round"/></g>`)}</g>
 <g id="i2-tea" stroke-width="2.5"><path d="M-7-39v10q7 6 14 0v-10m0 2q10-3 6 5H7" fill="#fff9e2"/><ellipse cy="-39" rx="7" ry="3.16" fill="#d8c39c"/><path d="M-4-38q4 2 8 0M0-44q-3-4 0-7" fill="none" stroke="#fff9e2"/></g>
 <g id="i2-pottery"><path d="M-7-48v6q-12 3-12 10 1 7 19 7t19-7q0-7-12-10v-6Z" fill="url(#i2-pot-round)"/><ellipse cy="-48" rx="7" ry="3.5" fill="#76533f"/><path id="i2-pot-tie" d="M-11-40q11 11 22 0M0-35v10m-3-7 6-5" fill="none" stroke="#7d7047" stroke-width="3"/></g>
</g>
<g id="i2-crate" stroke="#514f3e" stroke-width="3.5" stroke-linejoin="round">
 <g id="i2-crate-ripple" fill="none" stroke="#e6faf1" stroke-width="2.5" stroke-linecap="round"><path d="M-32 1q-7 6 2 10m60-10q7 6-2 10m-44 0 14 4 14-4"/></g>
 <g id="i2-crate-box"><path d="M-21-26 0-17l22-9v17L0 1-21-9Z" fill="#dfac69"/><path d="M0-17V1l22-10v-17Z" fill="#bd8b52"/><path d="m-14-14 7 3m14 0 8-3" fill="none" stroke-width="2.5"/><g id="i2-saw-cuts" fill="none" stroke="#926e45" stroke-width="2.5"><path d="m-15-18 3 4m5 1 3 4m11-4 3-4"/></g></g>
 <g id="i2-crate-open"><path d="m-21-26 21-10 22 10-22 9Z" fill="#5b725c"/><path d="m-20-26 20 9 21-9" fill="none"/><path d="m5-24 10-4 8 6-10 4Z" fill="#d99d6d" stroke-width="2.5"/></g>
 <g id="i2-cabin-detail"><path d="m-21-48 21-10 22 10v38L0 0-21-10Z" fill="#d3a365"/><path d="M0-38 22-48v38L0 0Z" fill="#b88954"/><path d="m-17-43 14 6v22l-14-6Zm22 6 12-6v22L5-15Z" fill="#6e7660"/><path d="m-23-8 23 10 24-11" fill="none"/></g>
</g>
<g id="i2-crate-lid" stroke="#514f3e" stroke-width="3.5" stroke-linejoin="round"><g id="i2-lid-board"><path d="m-21-26 21-10 22 10-22 9Z" fill="#f3ce8c"/><path d="m-13-26 14 6 13-6" fill="none" stroke-width="2.5"/></g><g id="i2-lid-paddle"><path d="M0-18v39m0-5-7 6 1 13q6 7 12 0l1-13Z" fill="#edc98a" stroke-linecap="round"/></g></g>
<g id="i2-rope-coil" stroke="#8a744d" stroke-width="3.5" fill="none"><ellipse cy="-4" rx="14" ry="6"/><ellipse cy="-9" rx="14" ry="6"/><path d="M14-9q16 0 9 14" stroke-linecap="round"/></g>
<g id="i2-copper" stroke="#514f3e" stroke-width="3" stroke-linejoin="round">
 <g id="i2-loose-coil" fill="none" stroke="#cc8d68" stroke-width="5"><path d="M-20-2h6v-17q0-12 8-9t8 11V-1q0 9 7 7t7-10v-15q0-9 7-7t7 10v13"/></g>
 <g id="i2-generator">
  <path d="m-25-12 25-11 26 11v12L0 11-25 0Z" fill="#c6d0b4"/><path d="M0-1v12L26 0v-12Z" fill="#96a78e"/>
  <path d="M-20-9-1-17.58" fill="none" stroke="#66756b" stroke-width="2"/>
  <g transform="translate(-20 -9)" stroke-width="1.2">${island2Iso.disc(6, 3, "x", "#d0b882", "#8b764f",
    '<g id="i2-generator-pulley"><path d="M-4 0H4M0-4V4" stroke="#80683f" stroke-width="1.1"/></g>')}</g>
  <use id="i2-generator-magnet" href="#i2-magnet-solid"/>
  <g transform="translate(-1 -17.58)" stroke-width="1.2">${island2Iso.disc(5.5, 2, "x", "#e8b47e", "#a57750",
    '<g id="i2-generator-rotor"><path d="M-3-4H3V4H-3Zm2 0V-4m2 8V-4" fill="none" stroke="#905c35" stroke-width="1"/></g>')}</g>
 </g>
 <g id="i2-sparks" fill="none" stroke="#d7a640" stroke-width="3"><path d="m23-28 5-7m0 18 8-2"/></g>
</g>
<g id="i2-lamp" stroke="#63593f" stroke-width="3" stroke-linejoin="round">
 <circle id="i2-light-halo" cy="-13" r="37" fill="url(#i2-glow)" stroke="none"/>
 <path d="M-5-26v-5q5-7 10 0v5" fill="none"/>
 ${island2Iso.box(0, 0, 12, 9, 24, ["#f5d795", "#eac076", "#ba9255"])}
 <path d="m-8-20 8 3v15l-8-3Zm11 3 6-3v15L3-2Z" fill="#788c76" stroke-width="2.5"/>
 <path id="i2-bulb" d="M-3-6v-5q-5-9 0-11 6 3 0 11" fill="#ffe38b"/>
</g>
<g id="i2-glass" stroke="#3d7375" stroke-width="3">
 ${island2Iso.disc(14, 5, "x", "url(#i2-glass-round)", "#2e99ae",
   '<g id="i2-glass-roughness" fill="#d3e2d0" stroke="none"><path d="M-9-9q10-8 17 0l-2 4H-6Z"/><path d="M-10-2H8v6H-9Z"/><path d="M-8 7H7q-7 10-15 0Z"/></g><g id="i2-lens-rings"><path d="M-9-8Q-5-14 2-12-2-10-5-4-7 0-9-3Z" fill="#f1ffff" opacity=".9" stroke="none"/></g>')}
 </g>
<g id="i2-beam" pointer-events="none" stroke="none"><g transform="translate(471 190)"><g id="i2-beam-pivot"><path d="M0 0 147-25v58Z" fill="#ffe6a0" opacity=".35"/></g></g></g>
<g id="i2-boat" stroke="#3d5847" stroke-width="3.5" stroke-linejoin="round"><g class="i2-boat-bob">
 <ellipse cy="19" rx="44" ry="12" fill="#a0ccc4" stroke="none"/>
 <path d="m-45-21 61 28 23 0-14 16-57-25Z" fill="#78a9a0"/>
 <path d="m16 7 23 0-14 16-9-3Z" fill="#5b8d85"/>
 <path d="m-23-30-22 9 61 28 23 0-1-10Z" fill="#e1b779"/>
 <path d="m-24-25-10 4 51 23 14-1Z" fill="#f0cf96" stroke-width="2.5"/>
 <g transform="translate(0 -10)"><g transform="${island2Iso.face("x")}">
 <path d="M-3 0v-83l-29 65h29m6-59 29 53H3" fill="#fff6d8"/><path d="m-1-84 18 6-18 7" fill="#d98f71"/>
 <circle cx="-14" cy="15" r="3" fill="#f4d395"/><circle cx="7" cy="15" r="3" fill="#f4d395"/>
 </g></g>
</g></g>
<g id="i2-cargo"><use href="#i2-box" transform="scale(.55)"/></g>
<g id="i2-gift" stroke="#5b6848" stroke-width="2.5" stroke-linejoin="round"><path d="M-8-12H8V8H-8Z" fill="#fff0b7"/><path d="M0 3v-10m0 5q-9-1-6-7 8 0 6 7m0-3q7-7 10-1-3 6-10 5" fill="#93b96c"/></g>
<g id="i2-splash" fill="none" stroke="#91dadd" stroke-width="4" stroke-linecap="round"><path d="M-16 2q-2-14-11-16M-6-2v-20m15 22q6-19 17-20M18 7l13-3"/></g>
<g id="i2-production" stroke="#514f3e" stroke-width="2.5" stroke-linejoin="round"><g id="i2-mill-arm"><path d="M347 361v-13h-6" fill="none" stroke="#c4a06a" stroke-width="3"/><path d="m339 346 8 3v6l-8-3Z" fill="#edc98a"/></g></g>
<g id="i2-people"><g id="i2-person-scout"></g><g id="i2-person-maker"></g><g id="i2-person-gardener"></g></g>
<g id="i2-held" pointer-events="none"></g>
<path id="i2-tether" d="" fill="none" stroke="#9b7b4f" stroke-width="3" stroke-linecap="round"/>
<path id="i2-reflection" d="" fill="none" stroke="#f4d36d" stroke-width="3" stroke-dasharray="7 9" opacity=".8"/>
<g id="i2-reaction"></g>
</svg>`;
