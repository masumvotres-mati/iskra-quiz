"use strict";

const island2Renderer = (() => {
  const entities = new Map();
  const actors = new Map();
  const sockets = new Map();
  const tweens = [];
  const particles = [];
  let context;
  let renderer;
  let scene;
  let camera;
  let models;
  let world;
  let terrain;
  let workshop;
  let tower;
  let frame;
  let lastTime = 0;
  let clock = 0;
  let ready = false;
  let quiet = false;
  let onInspect;
  let onFailure;
  let channels;
  let liftCable;
  let crane;
  let powerShaft;
  let cameraYaw = 0;
  let cameraPitch = 0;
  let targetYaw = 0;
  let targetPitch = 0;
  const target = () => new THREE.Vector3(0, 2.1, 0);
  const vector = (point) => point?.isVector3 ? point.clone() : new THREE.Vector3(...point);
  const positionOf = (object) => object.getWorldPosition(new THREE.Vector3());
  const quaternionOf = (object) => object.getWorldQuaternion(new THREE.Quaternion());
  const ease = (t) => t * t * (3 - 2 * t);
  const nodes = Object.fromEntries(Object.entries(island2Blueprint.nodes).map(([name, point]) => [name, { point }]));

  function audio(kind) {
    if (!quiet && context?.live && !document.hidden) playSound(kind);
  }

  function tween(duration, update, finish = () => {}, delay = 0) {
    if (!context?.live) {
      update(1);
      finish();
      return;
    }
    update(0);
    tweens.push({ start: performance.now() + delay, duration, update, finish, done: false });
    wake();
  }

  function finishStep(silent = false) {
    quiet = silent;
    for (const animation of tweens.splice(0)) if (!animation.done) {
      animation.update(1);
      animation.finish();
      animation.done = true;
    }
    quiet = false;
    for (const actor of actors.values()) {
      actor.moving = false;
      actor.reach = null;
      actor.reachSocket = null;
      actor.crouch = 0;
    }
    updateWorld(0);
  }

  function entity(id) {
    const result = entities.get(id);
    if (!result) throw new Error(`Nieznany przedmiot 3D: ${id}`);
    return result;
  }

  function socket(name) {
    const result = sockets.get(name);
    if (!result) throw new Error(`Brak uchwytu 3D: ${name}`);
    return result;
  }

  function register(id, model, point, rotation = [0, 0, 0]) {
    model.root.position.fromArray(point);
    model.root.rotation.set(...rotation);
    model.root.traverse((node) => { node.userData.entity = id; });
    world.add(model.root);
    model.id = id;
    model.owner = { type: "support", name: "ground" };
    model.home = { parent: world, position: model.root.position.clone(), quaternion: model.root.quaternion.clone() };
    model.homeGrips = model.grips.map((grip) => grip.clone());
    model.support = ["glass", "lamp", "lily", "fish", "cover"].includes(id) ? 0
      : id === "magnet" ? -1.51 : point[1];
    model.homeSupport = model.support;
    model.heldBy = null;
    model.picked = false;
    model.sideGripAmount = 0;
    model.homeOneHand = Boolean(model.oneHand);
    entities.set(id, model);
    return model;
  }

  function makeSocket(parent, name, point, rotation = [0, 0, 0], floor = 0, stand) {
    const node = models.socket(parent, name, point, rotation);
    node.userData.floor = floor;
    if (stand) node.userData.stand = stand;
    sockets.set(name, node);
    return node;
  }

  function mountProp(id, name, flip = false) {
    const item = entity(id);
    const support = socket(name);
    support.add(item.root);
    item.root.position.set(0, 0, 0);
    item.root.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), flip ? Math.PI : 0);
    item.owner = { type: "socket", name };
    item.heldBy = null;
    item.support = support.userData.floor;
  }

  function nearest(point) {
    let best;
    let distance = Infinity;
    for (const [name, node] of Object.entries(nodes)) {
      if (["hatch", "stairs", "tunnel"].includes(name) && !context.story.cutawayOpen) continue;
      if (name === "upper" && context.levels.timber < 3) continue;
      const gap = vector(node.point).distanceToSquared(point);
      if (gap < distance) { best = name; distance = gap; }
    }
    return best;
  }

  function route(from, to) {
    const start = nearest(from);
    const end = nearest(to);
    const queue = [[start]];
    const seen = new Set([start]);
    let chain;
    while (queue.length) {
      const path = queue.shift();
      if (path.at(-1) === end) { chain = path; break; }
      for (const [a, b, mode] of island2Blueprint.edges) {
        if (mode === "bridge" && !context.story.bridgeBuilt) continue;
        if ((mode === "crawl" || mode === "descend") && !context.story.cutawayOpen) continue;
        if (mode === "climb" && context.levels.timber < 3) continue;
        const next = a === path.at(-1) ? b : b === path.at(-1) ? a : null;
        if (next && !seen.has(next)) { seen.add(next); queue.push([...path, next]); }
      }
    }
    if (!chain) throw new Error(`Brak drogi 3D: ${start} → ${end}`);
    const points = [from.clone()];
    const modes = [];
    for (let i = 0; i < chain.length; i++) {
      const point = vector(nodes[chain[i]].point);
      if (point.distanceTo(points.at(-1)) < .03) continue;
      const edge = i ? island2Blueprint.edges.find(([a, b]) =>
        a === chain[i - 1] && b === chain[i] || b === chain[i - 1] && a === chain[i]) : null;
      points.push(point);
      modes.push(edge?.[2] || "walk");
    }
    if (to.distanceTo(points.at(-1)) > .03) { points.push(to.clone()); modes.push("walk"); }
    return { points, modes };
  }

  function targetPoint(to) {
    if (Array.isArray(to) || to?.isVector3) return vector(to);
    if (nodes[to]) return vector(nodes[to].point);
    if (to?.prop) {
      const item = entity(to.prop);
      const center = positionOf(item.root);
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternionOf(item.root));
      forward.y = 0;
      const flat = forward.lengthSq() < .1;
      if (flat) forward.set(0, 0, 1);
      forward.normalize();
      const across = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternionOf(item.root));
      if (flat) across.set(1, 0, 0);
      center.addScaledVector(forward, flat ? .9 : .6).addScaledVector(across, (to.side || 0) * .34);
      center.y = item.support || 0;
      return center;
    }
    if (sockets.has(to)) {
      const support = socket(to);
      if (support.userData.stand) return vector(support.userData.stand);
      const point = positionOf(support);
      point.y = support.userData.floor || 0;
      return point.add(new THREE.Vector3(0, 0, .55));
    }
    const item = entity(to);
    if (item.owner.type === "socket") return targetPoint(item.owner.name);
    if (item.stand) return vector(item.stand);
    const point = positionOf(item.root);
    const floor = item.owner.type === "socket" ? socket(item.owner.name).userData.floor : item.support;
    point.y = floor || 0;
    return point.add(new THREE.Vector3(0, 0, .55));
  }

  function walk(role, to, gait = "walk") {
    const actor = actors.get(role);
    if (actor.root.parent !== world) world.attach(actor.root);
    actor.holder = null;
    const destination = targetPoint(to);
    const journey = route(positionOf(actor.root), destination);
    const lengths = journey.points.slice(1).map((point, i) => point.distanceTo(journey.points[i]));
    const total = lengths.reduce((sum, length) => sum + length, 0);
    const duration = Math.max(220, total / (gait === "run" ? .0044 : gait === "heavy" ? .00225 : .0033));
    actor.moving = true;
    tween(duration, (time) => {
      let distance = ease(time) * total;
      let segment = 0;
      while (segment < lengths.length - 1 && distance > lengths[segment]) distance -= lengths[segment++];
      const span = lengths[segment] || 1;
      actor.root.position.copy(journey.points[segment]).lerp(journey.points[segment + 1] || journey.points[segment], distance / span);
      const direction = (journey.points[segment + 1] || destination).clone().sub(journey.points[segment]);
      if (direction.x * direction.x + direction.z * direction.z > .001) actor.root.rotation.y = Math.atan2(direction.x, direction.z);
      actor.pose = journey.modes[segment] === "crawl" ? "crawl"
        : ["climb", "descend"].includes(journey.modes[segment]) ? "climb" : gait;
      actor.phase = ease(time) * total * 9;
    }, () => {
      actor.root.position.copy(destination);
      actor.moving = false;
      actor.pose = "idle";
    });
    return duration;
  }

  function face(role, point) {
    const actor = actors.get(role);
    const direction = vector(point).sub(positionOf(actor.root));
    actor.root.rotation.y = Math.atan2(direction.x, direction.z);
  }

  function pose(role, mode, duration = 700, facing) {
    const actor = actors.get(role);
    if (facing) face(role, Array.isArray(facing) ? facing : positionOf(entity(facing).root));
    actor.pose = mode;
    tween(duration, (t) => { actor.phase = t * Math.PI * 4; actor.pose = mode; });
    return duration;
  }

  function pickup(role, id, duration = 700) {
    const actor = actors.get(role);
    const item = entity(id);
    if (actor.held) throw new Error(`${role} ma już zajęte ręce: ${actor.held}`);
    if (item.heldBy) throw new Error(`${id} jest już trzymany przez ${item.heldBy}`);
    if (["planks", "cargo"].includes(id) && item.owner.name === "crate.load" && item.root.getWorldPosition(new THREE.Vector3()).y > 2) {
      item.oneHand = true;
      const local = item.root.worldToLocal(positionOf(actor.root));
      item.grips = [new THREE.Vector3(Math.sign(local.x) * .2, .1, 0), new THREE.Vector3(Math.sign(local.x) * .2, .1, 0)];
    }
    if (id === "lid" && !context.story.oarMade) item.grips = [new THREE.Vector3(-.3, 0, .45), new THREE.Vector3(.3, 0, .45)];
    const initialWorld = positionOf(item.root);
    face(role, initialWorld);
    const crawling = actor.root.position.y < -.5;
    actor.pose = crawling ? "crawl" : "reach";
    const floor = positionOf(actor.root).y;
    const low = crawling ? 0 : Math.max(0, Math.min(.48, floor + .9 - initialWorld.y));
    actor.crouch = low;
    const lean = id === "lid" || ["planks", "cargo"].includes(id) && floor > 2 ? .12 : 0;
    actor.lean = lean;
    actor.carry.position.set(id === "lamp" ? .5 : 0,
      crawling ? .43 : (id === "lily" ? 1.85 : id === "lamp" ? .62 : .98) - low,
      (crawling ? .58 : id === "lily" ? .35 : id === "lamp" ? .3 : .5) + lean);
    world.updateMatrixWorld(true);
    const shoulderLeft = actor.root.localToWorld(new THREE.Vector3(-.2, 1.05 - low, 0));
    const shoulderRight = actor.root.localToWorld(new THREE.Vector3(.2, 1.05 - low, 0));
    const grip0 = item.root.localToWorld(item.grips[0].clone());
    const grip1 = item.root.localToWorld(item.grips[1].clone());
    actor.gripSwap = shoulderLeft.distanceToSquared(grip1) + shoulderRight.distanceToSquared(grip0)
      < shoulderLeft.distanceToSquared(grip0) + shoulderRight.distanceToSquared(grip1);
    actor.carry.attach(item.root);
    const from = item.root.position.clone();
    const rotation = item.root.quaternion.clone();
    const alternateRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    const heldRotation = item.receiveGrip ? new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), item.receiveSide * Math.PI / 2)
      : rotation.angleTo(alternateRotation) < rotation.angleTo(new THREE.Quaternion()) ? alternateRotation : new THREE.Quaternion();
    if (id === "lid" && !context.story.oarMade) {
      heldRotation.setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
      if (actor.gripSwap) heldRotation.premultiply(alternateRotation);
    }
    if (id === "lid" && context.story.oarMade) heldRotation.setFromEuler(new THREE.Euler(0, 0, 1.1));
    item.heldBy = role;
    item.owner = { type: "hands", name: role };
    actor.held = id;
    const oldGrips = item.grips.map((grip) => grip.clone());
    tween(duration, (t) => {
      actor.crouch = low * (1 - ease(t));
      actor.lean = lean * (1 - ease(t));
      item.root.position.copy(from).lerp(new THREE.Vector3(), ease(t));
      if (id === "lid") item.root.position.y += Math.sin(t * Math.PI) * .12;
      item.root.quaternion.copy(rotation).slerp(heldRotation, ease(t));
      if (id === "lily") {
        item.grips[0].copy(oldGrips[0]).lerp(new THREE.Vector3(0, -.68, 0), ease(t));
        item.grips[1].copy(oldGrips[1]).lerp(new THREE.Vector3(0, -.52, 0), ease(t));
      } else if (id === "lid" && !context.story.oarMade) {
        item.grips[0].copy(oldGrips[0]).lerp(new THREE.Vector3(-.3, 0, 0), ease(t));
        item.grips[1].copy(oldGrips[1]).lerp(new THREE.Vector3(.3, 0, 0), ease(t));
      }
    }, () => {
      item.root.position.set(0, 0, 0);
      item.root.quaternion.copy(heldRotation);
      actor.pose = "carry";
      actor.crouch = 0;
      actor.lean = 0;
    });
    return duration;
  }

  function deposit(role, id, destination, duration = 700) {
    const actor = actors.get(role);
    const item = entity(id);
    if (item.heldBy !== role) throw new Error(`${role} nie trzyma przedmiotu ${id}`);
    const support = socket(destination);
    if (destination === "crate.load") support.position.y = id === "glass" ? .82 : .61;
    face(role, positionOf(support));
    actor.pose = "reach";
    const from = item.root.position.clone();
    const rotation = item.root.quaternion.clone();
    const oldGrips = item.grips.map((grip) => grip.clone());
    const low = Math.max(0, Math.min(.48, positionOf(actor.root).y + .9 - positionOf(support).y));
    world.updateMatrixWorld(true);
    const supportPosition = positionOf(support);
    const supportRotation = quaternionOf(support);
    const flipRotation = supportRotation.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI));
    const cost = (quaternion) => [-1, 1].reduce((sum, side) => {
      if (item.oneHand && side === -1) return sum;
      const shoulder = actor.root.localToWorld(new THREE.Vector3(side * .2, 1.05 - low, 0));
      const index = actor.gripSwap ? side === -1 ? 1 : 0 : side === -1 ? 0 : 1;
      return sum + shoulder.distanceToSquared(item.grips[index].clone().applyQuaternion(quaternion).add(supportPosition));
    }, 0);
    const flip = cost(flipRotation) < cost(supportRotation);
    tween(duration, (t) => {
      world.updateMatrixWorld(true);
      const end = actor.carry.worldToLocal(positionOf(support));
      const endRotation = quaternionOf(actor.carry).invert().multiply(flip ? flipRotation : supportRotation);
      item.root.position.copy(from).lerp(end, ease(t));
      if (id === "lid" && !context.story.oarMade) item.root.position.y += Math.sin(t * Math.PI) * .2;
      item.root.quaternion.copy(rotation).slerp(endRotation, ease(t));
      if (id === "lid" && !context.story.oarMade) {
        item.grips[0].copy(oldGrips[0]).lerp(new THREE.Vector3(-.3, 0, .45), ease(t));
        item.grips[1].copy(oldGrips[1]).lerp(new THREE.Vector3(.3, 0, .45), ease(t));
      }
      actor.crouch = low * ease(t);
    }, () => {
      mountProp(id, destination, flip);
      actor.held = null;
      actor.pose = "idle";
      actor.crouch = 0;
      audio("island-contact");
    });
    return duration;
  }

  function attach(id, destination) {
    const item = entity(id);
    if (item.heldBy) actors.get(item.heldBy).held = null;
    mountProp(id, destination);
  }

  function moveMachine(id, destination, duration = 1300) {
    const item = entity(id);
    if (item.heldBy) throw new Error(`Ruch maszyny nie może wyrwać ${id} z dłoni`);
    const from = positionOf(item.root);
    const to = vector(destination);
    if (item.root.parent !== world) world.attach(item.root);
    item.owner = { type: "machine", name: id };
    tween(duration, (t) => item.root.position.copy(from).lerp(to, ease(t)), () => { item.root.position.copy(to); });
    return duration;
  }

  function fall(id, duration = 850) {
    const item = entity(id);
    item.root.visible = true;
    const end = item.root.position.clone();
    let hit = false;
    tween(duration, (t) => {
      const flight = Math.min(1, t / .63);
      const bounce = t > .63 ? Math.sin((t - .63) / .37 * Math.PI) * .14 * (1 - t) : 0;
      item.root.position.copy(end);
      item.root.position.y += t < .63 ? 1.5 * (1 - flight * flight) : bounce;
      item.root.scale.setScalar(t > .63 ? 1 + Math.sin((t - .63) * Math.PI * 5) * .035 * (1 - t) : 1);
      if (!hit && t >= .63) { hit = true; burst(end, "dust"); audio("island-land"); }
    }, () => { item.root.position.copy(end); item.root.scale.setScalar(1); });
    return duration;
  }

  function upgrade(id, level, duration = 900) {
    const item = entity(id === "timber" ? "crate" : id);
    const start = item.presentation || 1;
    tween(duration, (t) => {
      item.presentation = start + (level - start) * ease(t);
      stageModels(true);
    }, () => {
      item.presentation = level;
      burst(positionOf(item.root), "spark");
      audio("island-assemble");
    });
    return duration;
  }

  function work(role, mode, id, duration = 900) {
    const actor = actors.get(role);
    actor.pose = mode;
    actor.reach = id && !sockets.has(id) ? id : null;
    actor.reachSocket = id && sockets.has(id) ? id : null;
    if (id) {
      const object = sockets.has(id) ? socket(id) : entity(id).root;
      face(role, positionOf(object));
      const height = positionOf(object).y;
      actor.crouch = Math.max(0, Math.min(.48, actor.root.position.y + .9 - height));
      world.updateMatrixWorld(true);
      const left = actor.root.localToWorld(new THREE.Vector3(-.2, 1.05 - actor.crouch, 0));
      const right = actor.root.localToWorld(new THREE.Vector3(.2, 1.05 - actor.crouch, 0));
      const a = object.localToWorld(sockets.has(id) ? new THREE.Vector3(-.12, 0, 0) : entity(id).grips[0].clone());
      const b = object.localToWorld(sockets.has(id) ? new THREE.Vector3(.12, 0, 0) : entity(id).grips[1].clone());
      actor.workSwap = left.distanceToSquared(b) + right.distanceToSquared(a) < left.distanceToSquared(a) + right.distanceToSquared(b);
    }
    tween(duration, (t) => {
      actor.pose = mode;
      actor.phase = t * Math.PI * 5;
    });
    return duration;
  }

  function gripProfile(id, profile, duration = 500) {
    const item = entity(id);
    if (profile === "receive") {
      item.sideGripAmount = 0;
      item.receiveGrip = true;
      item.oneHand = true;
      const local = item.root.worldToLocal(vector(nodes.upperLoad.point));
      item.receiveSide = Math.sign(local.x) || 1;
      item.grips = [new THREE.Vector3(item.receiveSide * .35, .35, 0), new THREE.Vector3(item.receiveSide * .35, .35, 0)];
      return 120;
    }
    const actor = actors.get(item.heldBy);
    if (!actor) throw new Error("Zmiana chwytu wymaga podtrzymywania przedmiotu.");
    const from = item.grips.map((point) => point.clone());
    const rotation = item.root.quaternion.clone();
    const endRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
    actor.gripSwap = false;
    tween(duration, (t) => {
      item.sideGripAmount = ease(t);
      item.root.quaternion.copy(rotation).slerp(endRotation, ease(t));
      item.grips[0].copy(from[0]).lerp(new THREE.Vector3(.354, -.354, 0), ease(t));
      item.grips[1].copy(from[1]).lerp(new THREE.Vector3(.354, .354, 0), ease(t));
      if (t > .2) item.oneHand = false;
    }, () => { item.oneHand = false; item.receiveGrip = false; });
    return duration;
  }

  function push(id, roles, destination, rotation, duration = 1600) {
    const item = entity(id);
    const start = positionOf(item.root);
    const end = vector(destination);
    const oldRotation = quaternionOf(item.root);
    const targetRotation = rotation ? new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)) : oldRotation;
    world.attach(item.root);
    const offsets = roles.map((role) => positionOf(actors.get(role).root).sub(start));
    const oldYaw = new THREE.Euler().setFromQuaternion(oldRotation).y;
    const newYaw = new THREE.Euler().setFromQuaternion(targetRotation).y;
    roles.forEach((role, i) => {
      const actor = actors.get(role);
      actor.pose = "push";
      actor.moving = true;
      actor.lean = .08;
      actor.touch = { id, grips: roles.length === 1 ? item.grips.map((grip) => grip.clone())
        : [new THREE.Vector3(i === 0 ? -.44 : .15, -.15, .12), new THREE.Vector3(i === 0 ? -.15 : .44, -.15, .12)] };
      face(role, start);
      world.updateMatrixWorld(true);
      const left = actor.root.localToWorld(new THREE.Vector3(-.2, .8, 0));
      const right = actor.root.localToWorld(new THREE.Vector3(.2, .8, 0));
      const a = item.root.localToWorld(actor.touch.grips[0].clone());
      const b = item.root.localToWorld(actor.touch.grips[1].clone());
      actor.touch.swap = left.distanceToSquared(b) + right.distanceToSquared(a) < left.distanceToSquared(a) + right.distanceToSquared(b);
    });
    tween(duration, (t) => {
      item.root.position.copy(start).lerp(end, ease(t));
      item.root.quaternion.copy(oldRotation).slerp(targetRotation, ease(t));
      item.root.updateWorldMatrix(true, true);
      roles.forEach((role, i) => {
        const actor = actors.get(role);
        const offset = offsets[i].clone();
        if (id === "cover") {
          const flat = Math.abs(new THREE.Vector3(0, 0, 1).applyQuaternion(targetRotation).y) > .9;
          if (flat) offset.lerp(new THREE.Vector3(roles.length === 1 ? 0 : i === 0 ? -.45 : .45, -end.y, .9), ease(t));
        } else offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), (newYaw - oldYaw) * ease(t));
        actor.root.position.copy(item.root.position).add(offset);
        actor.root.position.y = 0;
        face(role, positionOf(item.root));
        actor.crouch = id === "cover"
          ? Math.abs(new THREE.Vector3(0, 0, 1).applyQuaternion(item.root.quaternion).y) * .48
          : Math.min(.48, Math.max(0, 1.05 - (item.root.position.y + .25)));
        if (id === "cover") {
          actor.root.updateWorldMatrix(true, false);
          actor.touch.swap = false;
          actor.touch.grips = [-1, 1].map((side) => {
            const local = item.root.worldToLocal(actor.root.localToWorld(new THREE.Vector3(side * .2, 1.06 - actor.crouch, .08)));
            return new THREE.Vector3(THREE.MathUtils.clamp(local.x, -.45, .45),
              THREE.MathUtils.clamp(local.y, -.74, .74), .14);
          });
        }
        actor.phase = t * Math.PI * 5;
      });
    }, () => {
      item.root.position.copy(end);
      item.root.quaternion.copy(targetRotation);
      item.owner = { type: "support", name: id === "cover" ? "stone" : "ground" };
      item.support = 0;
      for (const role of roles) {
        const actor = actors.get(role);
        actor.touch = null; actor.crouch = 0; actor.lean = 0; actor.moving = false; actor.pose = "idle";
      }
      if (id === "cover") {
        const support = socket("cover.polish");
        support.userData.stand = [end.x + .55, 0, end.z];
      }
      audio("island-contact");
    });
    return duration;
  }

  function excavate(duration = 900) {
    tween(duration, (t) => {
      terrain.plug.scale.y = Math.max(.02, 1 - ease(t));
      terrain.plug.position.y = -1.55 + .615 * (1 - ease(t));
    }, () => { terrain.plug.visible = false; audio("island-contact"); });
    return duration;
  }

  function ride(role, craft, duration = 1000) {
    const actor = actors.get(role);
    const support = socket(`${craft}.rider`);
    const start = positionOf(actor.root);
    world.attach(actor.root);
    actor.pose = "climb";
    tween(duration, (t) => {
      const end = positionOf(support);
      actor.root.position.copy(start).lerp(end, ease(t));
      actor.root.position.y += Math.sin(t * Math.PI) * .2;
    }, () => {
      support.add(actor.root);
      actor.root.position.set(0, 0, 0);
      actor.root.quaternion.identity();
      const scale = support.getWorldScale(new THREE.Vector3());
      actor.root.scale.set(1 / scale.x, 1 / scale.y, 1 / scale.z);
      actor.holder = support;
      actor.pose = craft === "crate" && !context.story.leafSail ? "row" : "sit";
    });
    return duration;
  }

  function sail(id, destination, duration = 2200) {
    const item = entity(id);
    const start = positionOf(item.root);
    const end = vector(destination);
    world.attach(item.root);
    item.owner = { type: "water", name: "sea" };
    tween(duration, (t) => {
      item.root.position.copy(start).lerp(end, ease(t));
      item.root.position.y += Math.sin(t * Math.PI * 4) * .025;
      const direction = end.clone().sub(start);
      const heading = Math.atan2(direction.x, direction.z) + Math.PI / 2;
      item.root.rotation.y = end.z === 7 ? heading * (1 - ease(Math.max(0, (t - .7) / .3))) : heading;
    }, () => item.root.position.copy(end));
    return duration;
  }

  function disembark(role, duration = 1000) {
    const actor = actors.get(role);
    const start = positionOf(actor.root);
    world.attach(actor.root);
    actor.holder = null;
    const end = vector(nodes.shoreLow.point);
    actor.pose = "climb";
    tween(duration, (t) => actor.root.position.copy(start).lerp(end, ease(t)), () => {
      actor.root.position.copy(end);
      actor.pose = "idle";
    });
    return duration;
  }

  function handoff(id, fromRole, toRole, duration = 1000) {
    const item = entity(id);
    const giver = actors.get(fromRole);
    const receiver = actors.get(toRole);
    if (item.heldBy !== fromRole) throw new Error(`Przekazanie ${id} wymaga podtrzymywania przez ${fromRole}`);
    if (receiver.held) throw new Error(`${toRole} nie ma wolnych rąk do odebrania ${id}`);
    const from = item.root.position.clone();
    face(fromRole, positionOf(receiver.root));
    face(toRole, positionOf(giver.root));
    giver.lean = .18; receiver.lean = .18; receiver.pendingProp = id;
    updateWorld(0);
    const exchange = positionOf(giver.carry).lerp(positionOf(receiver.carry), .5);
    tween(duration, (t) => {
      if (t < .55) {
        const local = giver.carry.worldToLocal(exchange.clone());
        item.root.position.copy(from).lerp(local, ease(t / .55));
        receiver.reach = t > .4 ? id : null;
      } else {
        if (item.heldBy === fromRole) {
          receiver.carry.attach(item.root);
          giver.held = null;
          receiver.held = id;
          receiver.pendingProp = null;
          item.heldBy = toRole;
          item.owner = { type: "hands", name: toRole };
          item.transferStart = item.root.position.clone();
          receiver.reach = null;
          world.updateMatrixWorld(true);
          const a = item.root.localToWorld(item.grips[0].clone());
          const b = item.root.localToWorld(item.grips[1].clone());
          const left = receiver.root.localToWorld(new THREE.Vector3(-.2, 1.05, 0));
          const right = receiver.root.localToWorld(new THREE.Vector3(.2, 1.05, 0));
          receiver.gripSwap = left.distanceToSquared(b) + right.distanceToSquared(a) < left.distanceToSquared(a) + right.distanceToSquared(b);
        }
        item.root.position.copy(item.transferStart).lerp(new THREE.Vector3(), ease((t - .55) / .45));
      }
    }, () => {
      item.root.position.set(0, 0, 0); receiver.reach = null; receiver.pendingProp = null;
      giver.lean = 0; receiver.lean = 0;
    });
    return duration;
  }

  function segment(node, a, b, radius = 1) {
    const delta = b.clone().sub(a);
    node.position.copy(a).add(b).multiplyScalar(.5);
    node.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
    node.scale.set(radius, Math.max(.001, delta.length()), radius);
  }

  function arm(actor, side, shoulder, targetPoint) {
    const local = actor.root.worldToLocal(targetPoint.clone());
    const direction = local.clone().sub(shoulder);
    const actualDistance = direction.length();
    const distance = Math.min(.738, Math.max(.03, actualDistance));
    direction.normalize();
    const length1 = .38;
    const length2 = .36;
    const along = (length1 * length1 - length2 * length2 + distance * distance) / (2 * distance);
    const height = Math.sqrt(Math.max(0, length1 * length1 - along * along));
    const pole = new THREE.Vector3(side, -.22, .45);
    pole.addScaledVector(direction, -pole.dot(direction)).normalize();
    const elbow = shoulder.clone().addScaledVector(direction, along).addScaledVector(pole, height);
    const hand = shoulder.clone().addScaledVector(direction, distance);
    segment(actor.limbs[`upperArm${side}`], shoulder, elbow);
    segment(actor.limbs[`forearm${side}`], elbow, hand);
    actor.limbs[`hand${side}`].position.copy(hand);
    actor.contact[side] = Math.max(0, actualDistance - distance);
  }

  function animatePerson(actor, dt) {
    const T = THREE;
    const mode = actor.pose;
    const crawling = mode === "crawl";
    const sitting = mode === "sit" || mode === "row";
    const walking = ["walk", "heavy", "run", "climb", "steps", "push"].includes(mode) && actor.moving;
    const phase = actor.moving ? actor.phase : clock * 4.5;
    const bob = walking ? Math.abs(Math.sin(phase)) * .035 : 0;
    const lower = actor.crouch || (["dig", "kneel", "polish"].includes(mode) ? .27 : 0);
    const hipY = crawling ? .25 : sitting ? .32 : .53 - lower + bob;
    actor.pelvis.position.y = hipY;
    actor.body.rotation.x = crawling ? Math.PI / 2 : 0;
    actor.body.position.set(0, crawling ? .12 : .3, crawling ? .05 : 0);
    actor.torsoOutline.position.copy(actor.body.position);
    actor.torsoOutline.quaternion.copy(actor.body.quaternion);
    actor.head.position.set(0, crawling ? .34 : .88, crawling ? .46 : actor.lean || 0);
    actor.head.rotation.x = ["polish", "kneel", "dig"].includes(mode) ? .18 : mode === "look" ? -.15 : 0;
    const carried = actor.held || actor.pendingProp;
    const sideGrip = carried === "glass" ? entity("glass").sideGripAmount : 0;
    actor.carry.position.set(carried === "lamp" ? .5 : -.2 * sideGrip,
      carried === "lily" ? 1.85 - lower + bob : carried === "lamp" ? .62 - lower + bob : crawling ? .43 : sitting ? .86 : .98 - lower + bob,
      (carried === "lily" ? .35 : carried === "lamp" ? .3 : crawling ? .58 : .5 - .2 * sideGrip) + (actor.lean || 0));
    actor.carry.rotation.set(0, 0, mode === "row" ? Math.sin(phase) * .3 : 0);
    for (const side of [-1, 1]) {
      const stride = walking ? Math.sin(phase + (side === 1 ? 0 : Math.PI)) : 0;
      const hip = new T.Vector3(side * .12, hipY, 0);
      const foot = new T.Vector3(side * .14, walking ? Math.max(0, stride) * (mode === "steps" ? .25 : .1) : .045, crawling ? -.3 : sitting ? .45 : stride * .21);
      if (sitting) foot.y = .2;
      const knee = hip.clone().lerp(foot, .5).add(new T.Vector3(0, 0, crawling || sitting || lower ? .23 : .12));
      segment(actor.limbs[`thigh${side}`], hip, knee);
      segment(actor.limbs[`shin${side}`], knee, foot);
      actor.limbs[`foot${side}`].position.copy(foot);
      const shoulder = new T.Vector3(side * .2, crawling ? .43 : hipY + .53, crawling ? .14 : actor.lean || 0);
      let hand;
      if (actor.held && !(entity(actor.held).oneHand && side === -1)) {
        const prop = entity(actor.held);
        const index = actor.gripSwap ? side === -1 ? 1 : 0 : side === -1 ? 0 : 1;
        hand = prop.root.localToWorld(prop.grips[index].clone());
      } else if (actor.touch) {
        const prop = entity(actor.touch.id);
        const index = actor.touch.swap ? side === -1 ? 1 : 0 : side === -1 ? 0 : 1;
        hand = prop.root.localToWorld(actor.touch.grips[index].clone());
      } else if (actor.reachSocket) {
        const contact = socket(actor.reachSocket);
        hand = contact.localToWorld(new T.Vector3((actor.workSwap ? -side : side) * .12, 0, 0));
      } else if (actor.reach) {
        const prop = entity(actor.reach);
        const contact = mode === "polish" && side === 1
          ? new T.Vector3(Math.sin(phase) * .17, Math.cos(phase) * .12, .115)
          : prop.grips[actor.workSwap ? side === -1 ? 1 : 0 : side === -1 ? 0 : 1].clone();
        hand = prop.root.localToWorld(contact);
      } else if (mode === "climb" && side === -1) {
        const base = vector(island2Blueprint.positions.tower);
        const underground = Math.hypot(actor.root.position.x - 1.4, actor.root.position.z - 1.1) < 1;
        const post = underground ? new T.Vector3(1.1, 0, 1.1)
          : base.clone().add(new T.Vector3(-.35, 0, .78));
        post.y = actor.root.position.y + 1.28;
        hand = post;
      } else {
        const local = crawling ? new T.Vector3(side * .23, .1, .58)
          : ["startle", "cheer"].includes(mode) ? new T.Vector3(side * .37, 1.5, .15)
            : ["push", "pull"].includes(mode) ? new T.Vector3(side * .25, .75, .6)
              : ["polish", "shape", "dig"].includes(mode) ? new T.Vector3(side * .22, .73 - lower, .5 + Math.sin(phase) * .08)
                : new T.Vector3(side * .25, .7 - lower, walking ? -stride * .17 : .1);
        hand = actor.root.localToWorld(local);
      }
      arm(actor, side, shoulder, hand);
    }
    actor.tool.visible = mode === "dig" || mode === "repair";
    if (actor.tool.visible) {
      actor.tool.position.copy(actor.limbs.hand1.position);
      actor.tool.quaternion.copy(actor.limbs.forearm1.quaternion);
    }
  }

  function burst(point, kind) {
    if (!context?.live || quiet) return;
    for (let i = 0; i < 6; i++) {
      const node = models.box(world, [.06, .06, .06], point.toArray(), kind === "spark" ? 0xf2d680 : 0xc3b58a);
      particles.push({ node, origin: point.clone(), born: performance.now(),
        velocity: new THREE.Vector3(Math.cos(i * 1.05) * .8, .8 + i * .06, Math.sin(i * 1.05) * .8) });
    }
  }

  function stageModels(animated = false) {
    if (!context) return;
    const l = context.levels;
    const s = context.story;
    const alternate = context.branches;
    for (const id of ["water", "seeds", "wheel", "copper", "glass", "rope", "lamp"]) entity(id).root.visible = l[id] > 0;
    entity("crate").root.visible = l.timber > 0;
    entity("lid").root.visible = l.timber > 0;
    entity("cover").root.visible = !s.workshopOpen || s.stoneSaved;
    entity("magnet").root.visible = s.cutawayOpen && !s.magnetTaken || entity("magnet").heldBy !== null || entity("magnet").owner.name === "copper.magnet";
    terrain.plug.visible = !s.cutawayOpen;
    terrain.rim.visible = s.cutawayOpen;
    channels.visible = l.water >= 2;
    actors.get("maker").root.visible = s.workshopOpen || l.water >= 2;
    actors.get("gardener").root.visible = l.seeds >= 2;
    entity("boat").root.visible = s.boatSeen;
    actors.get("merchant").root.visible = s.boatSeen;
    const crop = entity("seeds");
    crop.parts.pond.visible = alternate.seeds === "pond" && l.seeds >= 2;
    crop.parts.earth.visible = !crop.parts.pond.visible;
    crop.parts.plants.visible = alternate.seeds !== "pond" && l.seeds === 2;
    crop.parts.ears.visible = alternate.seeds !== "pond" && l.seeds >= 3;
    const plantAge = l.seeds ? context.turn - context.placed.seeds : 0;
    crop.parts.plants.scale.y = .6 + Math.min(1, plantAge / 4) * .6;
    const wheel = entity("wheel");
    const wheelStage = animated ? wheel.presentation || l.wheel : l.wheel;
    const driving = alternate.wheel !== "pottery" && wheelStage >= 1.5;
    const conversion = alternate.wheel === "pottery" ? 0 : Math.min(1, Math.max(0, wheelStage - 1));
    wheel.parts.drive.visible = conversion > 0;
    wheel.parts.drive.scale.y = Math.max(.02, conversion);
    wheel.parts.table.visible = true;
    wheel.parts.legs.scale.y = Math.max(.03, 1 - conversion);
    wheel.parts.axle.position.y = .8 + .48 * conversion;
    wheel.parts.axle.rotation.set(-Math.PI / 2 * (1 - conversion), Math.PI / 4 * conversion, 0);
    wheel.parts.disc.scale.set(1, 1, 1);
    wheel.parts.rotor.visible = true;
    wheel.parts.pot.visible = alternate.wheel === "pottery" && l.wheel >= 2;
    wheel.parts.tie.visible = alternate.wheel === "pottery" && l.wheel >= 3;
    wheel.parts.cup.visible = l.wheel > 0;
    const paddleScale = Math.min(1, Math.max(.04, (wheelStage - 1) * 2));
    wheel.parts.rotor.children.filter((paddle) => paddle !== wheel.parts.disc).forEach((paddle) => {
      paddle.scale.y = paddleScale;
      paddle.visible = driving;
    });
    const crate = entity("crate");
    const woodStage = animated ? crate.presentation || l.timber : l.timber;
    crate.parts.cabin.visible = woodStage > 2;
    crate.parts.cabin.scale.y = Math.max(.03, Math.min(1, woodStage - 2));
    const opened = context.story.crateBoat ? 0 : Math.max(0, Math.min(1, woodStage - 2));
    crate.parts.frontPanel.rotation.x = opened * Math.PI / 2;
    crate.parts.sidePanel.rotation.z = -opened * Math.PI / 2;
    crate.sockets.lid.position.y = s.lidSeat ? .3 : .79 + .91 * Math.max(0, Math.min(1, woodStage - 2));
    crate.parts.boatSeat.visible = s.crateBoat && !s.lidSeat;
    const lid = entity("lid");
    lid.parts.board.visible = !s.oarMade;
    lid.parts.paddle.visible = s.oarMade;
    lid.parts.board.scale.x = s.lidSeat ? .84 : 1;
    lid.parts.board.scale.z = s.lidSeat ? .84 : 1;
    const copper = entity("copper");
    const copperStage = animated ? copper.presentation || l.copper : l.copper;
    copper.parts.loose.visible = copperStage < 1.5;
    copper.parts.built.visible = copperStage >= 1.5;
    copper.parts.coils.forEach((coil, i) => { coil.scale.setScalar(Math.min(1, Math.max(.05, (copperStage - 1) * 6 - i))); });
    const glass = entity("glass");
    const age = l.glass ? context.turn - context.placed.glass : 0;
    glass.parts.rough.material.opacity = l.glass >= 3 ? 0 : Math.max(.12, .65 - age * .12);
    glass.parts.rough.visible = l.glass < 3;
    const rope = entity("rope");
    rope.parts.coil.visible = l.rope === 1;
    rope.parts.short.visible = l.rope >= 2 && l.timber < 3;
    rope.parts.frame.visible = l.rope >= 2 && l.timber >= 3;
    rope.parts.drum.visible = l.rope >= 2;
    tower.root.visible = l.timber >= 3;
    tower.roof.visible = l.timber >= 4;
    tower.beam.visible = l.lamp >= 3;
    entity("lamp").parts.glow.intensity = l.lamp >= 2 && entity("glass").owner.name === "tower.optic" ? .55 : 0;
    entity("lily").root.visible = alternate.seeds === "pond" && l.seeds >= 2;
    entity("fish").root.visible = alternate.seeds === "pond" && l.seeds >= 2;
    entity("lily").parts.stem.visible = s.lilyMoved && !s.leafFlat;
    entity("lily").root.scale.setScalar(s.leafGrown ? 1.35 : 1);
    entity("gift").root.visible = s.giftSeen;
    entity("cargo").root.visible = s.cargo !== "hidden";
    entity("food").root.visible = Boolean(entity("food").active);
    entity("planks").root.visible = Boolean(entity("planks").active);
    liftCable.visible = l.rope >= 2 && l.timber >= 3;
    crane.root.visible = l.rope >= 4;
    powerShaft.visible = l.wheel >= 3 && context.branches.wheel !== "pottery";
    if (!animated) {
      for (const [id, level] of [["wheel", l.wheel], ["crate", l.timber], ["copper", l.copper]]) entity(id).presentation = level;
    }
  }

  function updateWorld(dt) {
    world.updateMatrixWorld(true);
    for (const actor of actors.values()) animatePerson(actor, dt);
    world.updateMatrixWorld(true);
    const l = context?.levels;
    if (l?.wheel >= 2 && context.branches.wheel !== "pottery") entity("wheel").parts.rotor.rotation.z = -clock * 1.45;
    else entity("wheel").parts.rotor.rotation.z = 0;
    if (l?.wheel >= 2 && context.branches.wheel === "pottery") entity("wheel").parts.pot.rotation.y = clock * 1.4;
    if (l?.rope >= 3) entity("rope").parts.pulley.rotation.z = entity("crate").root.position.y / .26;
    if (liftCable.visible) {
      const top = positionOf(entity("rope").parts.pulley).add(new THREE.Vector3(0, -.26, 0));
      const bottom = positionOf(entity("crate").sockets.lid).add(new THREE.Vector3(0, .05, 0));
      segment(liftCable, top, bottom);
    }
    if (crane.root.visible) {
      const pivot = crane.pivot;
      const hook = positionOf(crane.hook);
      const tip = new THREE.Vector3(hook.x, Math.max(3.9, hook.y + .75), hook.z);
      segment(crane.boom, pivot, tip);
      segment(crane.cable, tip, hook);
    }
    if (powerShaft.visible) {
      const start = positionOf(entity("wheel").root.getObjectByName("axle"));
      const end = positionOf(entity("copper").parts.core);
      segment(powerShaft, start, end);
    }
    tower.optics.rotation.y = l?.lamp >= 3 ? Math.sin(clock * .6) * .65 : 0;
  }

  function cameraPosition(immediate = false) {
    cameraYaw += (targetYaw - cameraYaw) * (immediate ? 1 : .12);
    cameraPitch += (targetPitch - cameraPitch) * (immediate ? 1 : .12);
    const azimuth = Math.PI / 4 + cameraYaw;
    const elevation = .468 + cameraPitch;
    const distance = 33.25;
    const look = target();
    camera.position.set(Math.sin(azimuth) * Math.cos(elevation) * distance,
      Math.sin(elevation) * distance, Math.cos(azimuth) * Math.cos(elevation) * distance).add(look);
    camera.lookAt(look);
  }

  function draw() {
    if (!ready || !context || document.getElementById("island2").hidden) return;
    cameraPosition(!context.live);
    renderer.render(scene, camera);
  }

  function tick(now) {
    frame = undefined;
    if (!context?.live || !ready || document.hidden) return;
    const dt = lastTime ? Math.min(.05, (now - lastTime) / 1000) : 0;
    lastTime = now;
    clock += dt;
    for (const animation of tweens) if (!animation.done && now >= animation.start) {
      const time = Math.min(1, (now - animation.start) / animation.duration);
      animation.update(time);
      if (time === 1) { animation.done = true; animation.finish(); }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      const time = (now - particle.born) / 1000;
      if (time > .6) { world.remove(particle.node); particles.splice(i, 1); continue; }
      particle.node.position.copy(particle.origin).addScaledVector(particle.velocity, time);
      particle.node.position.y -= time * time * 2;
      particle.node.scale.setScalar(.06 * (1 - time / .6));
    }
    updateWorld(dt);
    draw();
    wake();
  }

  function wake() {
    if (frame === undefined && context?.live && ready && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function resize() {
    if (!renderer) return;
    const holder = document.getElementById("island2-art");
    const width = holder.clientWidth || Math.min(innerWidth - 24, 640);
    const height = width * 580 / 640;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    draw();
  }

  function mount(inspect, failure) {
    onInspect = inspect;
    onFailure = failure;
    if (renderer) { resize(); return ready; }
    const holder = document.getElementById("island2-art");
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-label", "Trójwymiarowa wyspa. Przesuń w bok, aby zmienić punkt widzenia.");
    canvas.setAttribute("role", "img");
    holder.replaceChildren(canvas);
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "low-power" });
    } catch (error) {
      console.error("Nie udało się uruchomić sceny 3D.", error);
      holder.textContent = "Grafika 3D jest niedostępna. Włącz WebGL w przeglądarce lub wybierz inną grę.";
      notifyCourse("Ta przeglądarka nie uruchomiła grafiki WebGL. Pozostałe gry i nauka nadal działają.");
      return false;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfff9e9);
    scene.fog = new THREE.Fog(0xfff9e9, 65, 110);
    camera = new THREE.PerspectiveCamera(32, 640 / 580, .1, 100);
    const ambient = new THREE.HemisphereLight(0xfffbed, 0x8ba7a0, 1.15);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xfff7e7, 1.65);
    sun.position.set(-4, 18, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
    sun.shadow.normalBias = .035;
    sun.shadow.bias = -.0003;
    scene.add(sun);
    models = createIsland2Models();
    world = models.group("world");
    scene.add(world);
    const sea = models.mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshPhongMaterial({ color: 0x76c7df, specular: 0xc8eeff, shininess: 45 }), world, [0, island2Blueprint.sea, 0]);
    sea.rotation.x = -Math.PI / 2;
    sea.receiveShadow = false;
    for (const [a, b] of [[[-5.53, -1.69, -5.53], [5.53, -1.69, -5.53]],
      [[5.53, -1.69, -5.53], [5.53, -1.69, 5.53]], [[5.53, -1.69, 5.53], [-5.53, -1.69, 5.53]],
      [[-5.53, -1.69, 5.53], [-5.53, -1.69, -5.53]]]) models.tube(world, [a, b], .03, 0xe2f7ec);
    terrain = models.terrain();
    world.add(terrain.root);
    for (const [x, y] of [[5.45, -.3], [5.65, -.65], [5.85, -1], [6.05, -1.35]]) {
      models.box(world, [x === 6.05 ? 1.1 : .55, .22, 1.8], [x, y - .11, 1.1], models.colors.stone);
    }
    workshop = models.workshop();
    const door = vector(island2Blueprint.ground(340, 382));
    workshop.root.position.copy(door).sub(new THREE.Vector3(.82, 0, .82));
    world.add(workshop.root);
    for (const x of [1.1, 1.7]) models.cylinder(world, .035, .035, 2.95, [x, -.075, 1.1], models.colors.darkWood, 8);
    for (let i = 0; i < 10; i++) models.box(world, [.6, .045, .06], [1.4, -1.4 + i * .29, 1.1], models.colors.wood);
    const p = island2Blueprint.positions;
    register("water", models.water(), p.water);
    register("seeds", models.crops(), p.seeds);
    register("wheel", models.wheelModel(), p.wheel);
    const cup = models.entity("cup", entity("wheel").parts.cup, [[.13, .13, 0], [.13, .13, 0]]);
    cup.oneHand = true;
    register("cup", cup, cup.root.getWorldPosition(new THREE.Vector3()).toArray());
    makeSocket(entity("wheel").parts.table, "wheel.cup", [.08, .86, .04]);
    makeSocket(workshop.root, "workshop.cup", [-.12, .845, -.23], [0, 0, 0], 0,
      workshop.root.position.clone().add(new THREE.Vector3(.5, 0, .2)).toArray());
    entity("wheel").stand = vector(p.wheel).add(new THREE.Vector3(0, 0, 1.25)).toArray();
    register("crate", models.crate(), p.crate);
    entity("crate").stand = vector(p.crate).add(new THREE.Vector3(0, 0, .9)).toArray();
    register("lid", models.lid(), p.crate);
    register("cover", models.stone(), p.cover, [0, Math.PI / 4, 0]);
    register("magnet", models.magnet(), p.magnet);
    register("copper", models.generator(), p.copper);
    register("glass", models.glass(), p.glass, [0, Math.PI, 0]);
    register("lamp", models.lamp(), p.lamp);
    register("rope", models.rope(), p.cabin, [0, Math.PI / 4, 0]);
    register("lily", models.leaf(), vector(p.seeds).add(new THREE.Vector3(.23, .17, -.1)).toArray());
    register("fish", models.fish(), vector(p.seeds).add(new THREE.Vector3(-.2, .19, .13)).toArray());
    register("boat", models.ship(), p.boat);
    register("cargo", models.packet("cargo"), p.gift);
    register("gift", models.packet("gift", 0xf3da96), p.gift);
    register("food", models.packet("food", 0xdca46a), p.seeds);
    register("planks", models.packet("planks"), p.crate);
    liftCable = models.cylinder(world, .025, .025, 1, [0, 0, 0], 0x8d7952, 8);
    powerShaft = models.cylinder(world, .065, .065, 1, [0, 0, 0], models.colors.darkWood, 10);
    crane = { root: models.group("crane"), pivot: vector(p.tower).add(new THREE.Vector3(.1, 2.4, .55)) };
    world.add(crane.root);
    crane.boom = models.cylinder(crane.root, .075, .095, 1, [0, 0, 0], models.colors.wood, 8);
    crane.cable = models.cylinder(crane.root, .022, .022, 1, [0, 0, 0], 0x8d7952, 6);
    crane.hook = models.group("hook");
    crane.hook.position.copy(vector(p.cabin).add(new THREE.Vector3(.9, 1, .9)));
    crane.root.add(crane.hook);
    const hookMetal = models.mesh(new THREE.TorusGeometry(.09, .025, 6, 12, Math.PI * 1.5), models.colors.metal, crane.hook);
    hookMetal.position.y = -.06;
    makeSocket(crane.hook, "crane.load", [0, -.22, 0], [0, 0, 0], 0);
    channels = models.group("channels");
    const course = [
      [p.water[0], 1.08, p.water[2] + .55], [-2.8, .15, 1.4], [-1, .1, 2.5],
      [.8, .1, 3.8], [2.2, .1, 4.48], [1.55, .1, 5.13], [.9, -.05, 5.78], [.9, -1.68, 6.1],
    ];
    models.tube(channels, course, .11, 0x7d9777);
    models.tube(channels, course.map(([x, y, z]) => [x, y + .045, z]), .065, models.colors.water);
    world.add(channels);
    tower = models.towerModel();
    tower.root.position.fromArray(p.tower);
    world.add(tower.root);
    const crate = entity("crate");
    crate.sockets.load.rotation.y = 0;
    sockets.set("crate.load", crate.sockets.load);
    sockets.set("crate.lid", crate.sockets.lid);
    sockets.set("crate.rider", crate.sockets.rider);
    sockets.set("crate.sail", crate.sockets.sail);
    sockets.set("lily.rider", entity("lily").sockets.rider);
    crate.sockets.rider.position.y = .025;
    crate.sockets.sail.position.y = 1.55;
    makeSocket(crate.root, "crate.seat", [0, .3, 0], [0, 0, 0], 0,
      vector(p.crate).add(new THREE.Vector3(0, 0, .95)).toArray());
    makeSocket(crate.root, "crate.oar", [0, .72, .45], [0, 0, Math.PI / 2], 0);
    for (const x of [-.4, .4]) models.box(crate.root, [.07, .12, .13], [x, .68, .45], models.colors.darkWood);
    makeSocket(entity("boat").root, "boat.gift", [-.75, .48, 0], [0, 0, 0], -1.23);
    const garden = vector(p.seeds).add(new THREE.Vector3(.95, .575, .85));
    models.box(world, [.6, .4, .5], [garden.x, .2, garden.z], models.colors.stone);
    makeSocket(world, "gift.garden", garden.toArray(), [0, 0, 0], 0,
      garden.clone().add(new THREE.Vector3(0, -.575, .5)).toArray());
    crate.sockets.lid.userData.floor = 0;
    crate.sockets.lid.userData.stand = vector(p.crate).add(new THREE.Vector3(0, 0, .95)).toArray();
    entity("magnet").stand = [2.7, -1.51, 4.52];
    entity("lily").stand = vector(p.seeds).add(new THREE.Vector3(.23, 0, .9)).toArray();
    const floorLoad = vector(p.cabin).add(new THREE.Vector3(0, .14, .62).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4));
    crate.sockets.load.userData.floor = .14;
    crate.sockets.load.userData.stand = floorLoad.toArray();
    const upperLoad = vector(p.cabin).add(new THREE.Vector3(.94, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4));
    upperLoad.y = 4.7;
    nodes.upperLoad = { point: upperLoad.toArray() };
    nodes.upper = { point: [p.tower[0] - .68, 4.7, p.tower[2] + .88] };
    nodes.gallery = { point: [p.tower[0] - .55, 3.12, p.tower[2] + 1] };
    nodes.lowerLoad = { point: [upperLoad.x, 3.12, upperLoad.z] };
    nodes.lift = { point: floorLoad.toArray() };
    nodes.inside = { point: [1.4, 0, 1.1] };
    island2Blueprint.edges.push(["upper", "upperLoad"]);
    island2Blueprint.edges.push(["gallery", "lowerLoad"]);
    for (const z of [.78, 1.22]) models.cylinder(tower.root, .027, .027, 4.85, [-.35, 2.425, z], models.colors.metal, 8);
    for (let i = 0; i < 16; i++) models.box(tower.root, [.06, .04, .44], [-.35, .14 + i * .29, 1], models.colors.metal);
    makeSocket(tower.optics, "tower.optic", [0, 0, .68], [0, Math.PI, 0], 4.7, nodes.upper.point);
    makeSocket(tower.optics, "tower.light", [0, -.15, .5], [0, Math.PI, 0], 4.7,
      [p.tower[0], 4.7, p.tower[2] + .95]);
    makeSocket(tower.root, "tower.cargo", [-.45, 3.5, .5], [0, 0, 0], 3.12,
      vector(p.tower).add(new THREE.Vector3(-.45, 3.12, 1.05)).toArray());
    models.box(tower.root, [.72, .12, .5], [-.45, 3.26, .5], models.colors.wood);
    sockets.set("copper.magnet", entity("copper").sockets.magnet);
    entity("copper").sockets.magnet.userData.floor = 0;
    entity("copper").sockets.magnet.userData.stand = vector(p.copper).add(new THREE.Vector3(0, 0, -.85)).toArray();
    makeSocket(entity("wheel").root, "wheel.shape", [0, 1.16, .3], [0, 0, 0], 0,
      vector(p.wheel).add(new THREE.Vector3(0, 0, 1.05)).toArray());
    makeSocket(entity("wheel").root, "wheel.axle", [.15, 1.28, .15], [0, Math.PI / 4, 0], 0,
      vector(island2Blueprint.ground(237, 418)).add(new THREE.Vector3(.6, 0, .6)).toArray());
    makeSocket(entity("water").root, "water.valve", [0, .88, .68], [0, Math.PI, 0], 0,
      vector(p.water).add(new THREE.Vector3(0, 0, 1.35)).toArray());
    makeSocket(entity("rope").root, "rope.crank", [0, .88, .43], [0, Math.PI, 0], 0,
      vector(p.cabin).add(new THREE.Vector3(.65, 0, .65)).toArray());
    makeSocket(entity("copper").root, "copper.coil", [0, .62, -.17], [0, 0, 0], 0,
      vector(p.copper).add(new THREE.Vector3(0, 0, -.85)).toArray());
    makeSocket(entity("cover").root, "cover.polish", [0, 0, .14], [0, 0, Math.PI], 0);
    makeSocket(crate.sockets.lid, "crate.polish", [0, .09, 0], [-Math.PI / 2, 0, Math.PI], 0,
      vector(p.crate).add(new THREE.Vector3(0, 0, .65)).toArray());
    sockets.set("boat.cargo", entity("boat").sockets.cargo);
    const bank = vector(island2Blueprint.ground(507, 400));
    makeSocket(world, "dock.cargo", bank.clone().add(new THREE.Vector3(0, .65, 0)).toArray(), [0, 0, 0], 0, bank.toArray());
    for (const [role, node] of [["scout", "spring"], ["maker", "inside"], ["gardener", "rear"], ["merchant", "dock"]]) {
      const person = models.person(role);
      person.root.position.fromArray(nodes[node].point);
      person.pose = "idle"; person.phase = 0; person.contact = {}; person.held = null; person.crouch = 0;
      actors.set(role, person);
      world.add(person.root);
    }
    makeSocket(entity("boat").root, "boat.merchant", [-.95, .3, 0]);
    socket("boat.merchant").add(actors.get("merchant").root);
    actors.get("merchant").root.position.set(0, 0, 0);
    actors.get("merchant").holder = socket("boat.merchant");
    makeSocket(world, "workshop.delivery", door.clone().add(new THREE.Vector3(0, .2, 0)).toArray(), [0, 0, 0], 0,
      door.clone().add(new THREE.Vector3(0, 0, .55)).toArray());
    makeSocket(tower.root, "tower.materials", [-.65, 4.875, .55], [0, 0, 0], 4.7,
      vector(p.tower).add(new THREE.Vector3(-.65, 4.7, 1.10)).toArray());
    const dock = models.group("dock");
    for (let i = 0; i < 5; i++) models.box(dock, [.31, .18, 1.2], [-.65 + i * .32, 0, 0], models.colors.wood);
    for (const x of [-.65, .65]) for (const z of [-.45, .45]) models.cylinder(dock, .055, .065, 1.75, [x, -.8, z], models.colors.darkWood, 8);
    dock.position.copy(bank).add(new THREE.Vector3(0, -.04, 0));
    models.box(dock, [1.35, .12, .65], [-.65, 0, 0], models.colors.wood);
    models.box(dock, [.8, .16, 1.0], [-1.0, -.06, 0], models.colors.darkWood);
    for (const x of [-.65, .65]) for (const z of [-.45, .45]) {
      const ripple = models.mesh(new THREE.TorusGeometry(.14, .018, 4, 16), 0xd7f2ef, dock, [x, island2Blueprint.sea + .05, z]);
      ripple.rotation.x = Math.PI / 2;
    }
    world.add(dock);
    sockets.set("dock.model", dock);
    mountProp("lid", "crate.lid");
    mountProp("cup", "wheel.cup");
    const down = { x: 0, y: 0, yaw: 0, pitch: 0, active: false, dragged: false };
    canvas.addEventListener("pointerdown", (event) => {
      down.x = event.clientX; down.y = event.clientY; down.yaw = targetYaw; down.pitch = targetPitch;
      down.active = true; down.dragged = false;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!context?.live && !down.active) return;
      const dx = event.clientX - down.x;
      const dy = event.clientY - down.y;
      if (down.active && Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) {
        down.dragged = true;
        targetYaw = THREE.MathUtils.clamp(down.yaw - dx * .0015, -.14, .14);
        targetPitch = THREE.MathUtils.clamp(down.pitch + dy * .0008, -.07, .07);
      } else if (!down.active && event.pointerType === "mouse") {
        const bounds = canvas.getBoundingClientRect();
        targetYaw = (event.clientX - bounds.left - bounds.width / 2) / bounds.width * .05;
      }
      if (!context?.live && down.dragged) { cameraPosition(true); draw(); }
    });
    canvas.addEventListener("pointercancel", () => { down.active = false; });
    canvas.addEventListener("pointerup", (event) => {
      if (down.active && !down.dragged && !context?.busy) {
        const bounds = canvas.getBoundingClientRect();
        const ray = new THREE.Raycaster();
        ray.setFromCamera(new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1), camera);
        const hit = ray.intersectObjects([...entities.values()].filter((item) => item.root.visible).map((item) => item.root), true)[0];
        if (hit) onInspect?.(hit.object.userData.entity);
      }
      down.active = false;
    });
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      ready = false;
      cancel();
      notifyCourse("Przerwano wyświetlanie grafiki 3D. Odśwież stronę, aby wznowić grę.");
      onFailure?.();
    });
    new ResizeObserver(resize).observe(holder);
    ready = true;
    resize();
    return true;
  }

  function reset(next) {
    cancel();
    context = next;
    clock = 0;
    targetYaw = 0; targetPitch = 0; cameraYaw = 0; cameraPitch = 0;
    for (const item of entities.values()) {
      item.home.parent.add(item.root);
      item.root.position.copy(item.home.position);
      item.root.quaternion.copy(item.home.quaternion);
      item.root.scale.setScalar(1);
      item.owner = { type: "support", name: "ground" };
      item.heldBy = null;
      item.support = item.homeSupport;
      item.presentation = 0;
      item.active = false;
      item.grips = item.homeGrips.map((grip) => grip.clone());
      item.sideGripAmount = 0;
      item.oneHand = item.homeOneHand;
      item.receiveGrip = false;
    }
    mountProp("lid", "crate.lid");
    mountProp("cup", "wheel.cup");
    mountProp("cargo", "boat.cargo");
    entity("lily").parts.canopy.rotation.set(0, 0, 0);
    socket("crate.lid").userData.stand = vector(island2Blueprint.positions.crate).add(new THREE.Vector3(0, 0, .95)).toArray();
    entity("crate").sockets.load.userData.floor = .14;
    entity("crate").sockets.load.position.y = .82;
    entity("crate").sockets.load.userData.stand = [...nodes.lift.point];
    for (const [role, node] of [["scout", "spring"], ["maker", "inside"], ["gardener", "rear"], ["merchant", "dock"]]) {
      const actor = actors.get(role);
      world.add(actor.root);
      actor.root.position.fromArray(nodes[node].point);
      actor.root.quaternion.identity();
      actor.root.scale.setScalar(1);
      actor.held = null; actor.holder = null; actor.pose = "idle"; actor.crouch = 0; actor.reach = null; actor.reachSocket = null; actor.touch = null;
      actor.lean = 0; actor.pendingProp = null;
    }
    socket("boat.merchant").add(actors.get("merchant").root);
    actors.get("merchant").root.position.set(0, 0, 0);
    actors.get("merchant").holder = socket("boat.merchant");
    sync(next);
  }

  function sync(next) {
    context = next;
    if (!ready) return;
    stageModels();
    sockets.get("dock.model").visible = next.levels.timber >= 4 && next.levels.rope >= 4;
    if (next.live && !document.hidden) wake();
    else {
      cancelAnimationFrame(frame);
      frame = undefined;
      lastTime = 0;
      updateWorld(0);
      if (!next.busy) draw();
    }
  }

  function cancel() {
    cancelAnimationFrame(frame);
    frame = undefined;
    lastTime = 0;
    tweens.length = 0;
    for (const particle of particles) world?.remove(particle.node);
    particles.length = 0;
    if (context) context.live = false;
  }

  function lift(height, duration = 1400) {
    const item = entity("crate");
    const destination = positionOf(item.root); destination.y = height;
    const from = positionOf(item.root);
    const floor = height > 3.5 ? 4.7 : height > 1 ? 3.12 : .14;
    tween(duration, (t) => item.root.position.copy(from).lerp(destination, ease(t)), () => {
      item.root.position.copy(destination);
      item.sockets.load.userData.floor = floor;
      item.sockets.load.userData.stand = floor > 4 ? [...nodes.upperLoad.point]
        : floor > 1 ? [...nodes.lowerLoad.point] : [...nodes.lift.point];
    });
    return duration;
  }

  function cameraReset() {
    targetYaw = 0; targetPitch = 0;
    if (!context?.live) { cameraPosition(true); draw(); }
  }

  function storyAction(action) {
    const craftId = context.story.craftKind === "crate" ? "crate" : "lily";
    const sea = island2Blueprint.sea;
    const launch = () => new THREE.Vector3(craftId === "crate" ? 7.3 : 7.9, sea + (craftId === "crate" ? -.1 : .06), 1.1);
    if (action.action === "hold-leaf" || action.action === "seat-fit") return 300;
    if (action.action === "craft-prepare") {
      if (action.useCrate) audio("island-notice");
      return 500;
    }
    if (action.action === "carve-oar") {
      const lid = entity("lid");
      lid.root.rotation.set(0, 0, Math.PI / 2);
      lid.grips = [new THREE.Vector3(0, .2, 0), new THREE.Vector3(0, -.2, 0)];
      const stand = positionOf(lid.root).add(new THREE.Vector3(0, -.79, .68));
      socket("crate.lid").userData.stand = stand.toArray();
      burst(positionOf(entity("lid").root), "dust");
      audio("island-assemble");
      return 500;
    }
    if (action.action === "craft-launch" || action.action === "leaf-launch") {
      const id = action.action === "leaf-launch" ? "lily" : "crate";
      const item = entity(id);
      const actor = item.heldBy && actors.get(item.heldBy);
      if (actor) actor.held = null;
      item.heldBy = null;
      world.attach(item.root);
      item.owner = { type: "falling", name: "shore" };
      const start = positionOf(item.root);
      const end = launch();
      const rotation = item.root.quaternion.clone();
      if (id === "lily") context.story.leafFlat = true;
      tween(1200, (t) => {
        item.root.position.copy(start).lerp(end, t);
        item.root.position.y = start.y + (end.y - start.y) * t * t;
        item.root.quaternion.copy(rotation).slerp(new THREE.Quaternion(), ease(t));
      }, () => {
        item.root.position.copy(end);
        item.owner = { type: "water", name: "sea" };
        audio("island-splash");
      });
      return 1200;
    }
    if (action.action === "craft-board") return ride("scout", craftId);
    if (action.action === "trade-stand" || action.action === "trade-sit") {
      const actor = actors.get("scout");
      const from = actor.root.position.y;
      const end = action.action === "trade-sit" ? 0 : craftId === "crate" ? .115 : .333;
      actor.pose = action.action === "trade-sit" ? "sit" : "idle";
      tween(700, (t) => { actor.root.position.y = from + (end - from) * ease(t); });
      return 700;
    }
    if (action.action === "leaf-pass" || action.action === "oar-pass") {
      return handoff(action.action === "leaf-pass" ? "lily" : "lid",
        action.action === "leaf-pass" ? "gardener" : "maker", "scout");
    }
    if (action.action === "leaf-fit") {
      entity("lily").parts.canopy.rotation.z = Math.PI / 2;
      entity("lily").parts.canopy.rotation.y = .65;
      return deposit("scout", "lily", "crate.sail", 1000);
    }
    if (action.action === "craft-voyage") {
      context.story.sailing = true;
      context.story.boatSeen = true;
      sail("boat", [3.8, -1.53, 7], 2300);
      actors.get("scout").pose = craftId === "crate" && !context.story.leafSail ? "row" : "sit";
      return sail(craftId, [craftId === "crate" ? 1.65 : 1.15, launch().y, 7], 2300);
    }
    if (action.action === "gift-ready") {
      mountProp("gift", "boat.gift");
      context.story.giftSeen = true;
      return 350;
    }
    if (action.action === "gift-take") return pickup("merchant", "gift");
    if (action.action === "oar-stow") return deposit("scout", "lid", "crate.oar");
    if (action.action === "gift-exchange") return handoff("gift", "merchant", "scout");
    if (action.action === "craft-return") {
      sail("boat", [10, -1.53, 0], 2300);
      actors.get("scout").pose = "sit";
      return sail(craftId, launch(), 2300);
    }
    if (action.action === "craft-land") return disembark("scout");
    if (action.action === "gift-return") {
      burst(positionOf(entity("gift").root), "spark");
      audio("island-discover");
      return 600;
    }
    if (action.action === "supply") {
      const item = entity(action.prop);
      world.add(item.root);
      const source = action.prop === "food" ? vector(island2Blueprint.positions.seeds).add(new THREE.Vector3(.9, .2, .75))
        : vector(island2Blueprint.positions.cabin).add(new THREE.Vector3(.5, .2, 1));
      item.root.position.copy(source);
      item.root.quaternion.identity();
      item.owner = { type: "support", name: "ground" };
      item.support = 0;
      item.active = true;
      return 250;
    }
    if (action.action === "consume") { entity(action.prop).active = false; return 250; }
    if (action.action === "leaf-grow") {
      tween(1100, (t) => entity("lily").root.scale.setScalar(1 + .35 * ease(t)), () => audio("island-discover"));
      return 1100;
    }
    if (action.action === "splash" || action.action === "fish-jump") {
      const actor = actors.get(action.actor || "scout");
      actor.pose = "startle";
      if (action.action === "fish-jump") {
        const fish = entity("fish");
        const start = positionOf(fish.root);
        tween(1100, (t) => {
          fish.root.position.copy(start);
          fish.root.position.y += Math.sin(t * Math.PI) * 1.1;
          fish.root.rotation.z = Math.sin(t * Math.PI * 2) * .8;
        }, () => { fish.root.position.copy(start); burst(start, "spark"); audio("island-splash"); });
      } else {
        burst(positionOf(entity("wheel").root).add(new THREE.Vector3(0, .4, .5)), "spark");
        audio("island-splash");
      }
      return 1100;
    }
    if (action.action === "celebrate") {
      for (const actor of actors.values()) actor.pose = "cheer";
      return 800;
    }
    if (action.action === "ship-dock") return sail("boat", [7.3, -1.53, -.5], 2200);
    if (action.action === "crane-grab") {
      const cargo = entity("cargo");
      context.story.cargo = "moving";
      cargo.root.visible = true;
      const start = positionOf(crane.hook);
      const load = positionOf(cargo.root).add(new THREE.Vector3(0, .22, 0));
      const above = load.clone(); above.y = 3.2;
      tween(1700, (t) => {
        crane.hook.position.copy(t < .65 ? start.clone().lerp(above, ease(t / .65))
          : above.clone().lerp(load, ease((t - .65) / .35)));
      }, () => {
        socket("crane.load").attach(cargo.root);
        cargo.root.position.set(0, 0, 0);
        cargo.owner = { type: "socket", name: "crane.load" };
        audio("island-contact");
      });
      return 1700;
    }
    if (action.action === "crane-deliver") {
      const start = positionOf(crane.hook);
      const above = start.clone(); above.y = 3.4;
      const end = vector(island2Blueprint.positions.cabin).add(new THREE.Vector3(.9, 1, .9));
      const highEnd = end.clone(); highEnd.y = 3.4;
      tween(2200, (t) => {
        crane.hook.position.copy(t < .3 ? start.clone().lerp(above, ease(t / .3))
          : t < .75 ? above.clone().lerp(highEnd, ease((t - .3) / .45))
            : highEnd.clone().lerp(end, ease((t - .75) / .25)));
      }, () => {
        socket("crane.load").userData.floor = 0;
        socket("crane.load").userData.stand = end.clone().add(new THREE.Vector3(0, -1, .55)).toArray();
      });
      return 2200;
    }
    throw new Error(`Nieobsługiwana czynność 3D: ${action.action}`);
  }

  function snapshot() {
    return {
      ready, triangles: renderer?.info.render.triangles, calls: renderer?.info.render.calls,
      camera: { yaw: cameraYaw, pitch: cameraPitch, perspective: Boolean(camera?.isPerspectiveCamera) },
      entities: Object.fromEntries([...entities].map(([id, item]) => [id, { owner: { ...item.owner },
        position: positionOf(item.root).toArray(), visible: item.root.visible, heldBy: item.heldBy }])),
      contacts: Object.fromEntries([...actors].map(([role, actor]) => [role, { ...actor.contact }])),
      tweens: tweens.filter((animation) => !animation.done).length,
    };
  }

  return { mount, reset, sync, cancel, finishStep, walk, face, pose, pickup, deposit, attach,
    moveMachine, fall, upgrade, lift, work, gripProfile, push, excavate, ride, sail, disembark, handoff,
    cameraReset, snapshot, storyAction, entity, socket, nodes, entities, actors,
    get ready() { return ready; }, get camera() { return camera; }, get scene() { return scene; } };
})();
