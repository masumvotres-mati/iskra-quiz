"use strict";

const island2Cinema = (() => {
  const scene = (name, text, duration = 800, extra = {}) => ({ kind: "scene", scene: name, text, duration, ...extra });
  const reveal = (change, text) => ({ kind: "reveal", ...change, text, duration: 180 });
  const at = (name) => island2Renderer.nodes[name].point;
  const point = (id) => [...island2Renderer.entities.get(id).point];
  const sound = (name) => { if (island2CanAnimate()) playSound(name); };
  const supportSteps = (prop, actor, to, prefix, direction = 1, support) => [
    scene("prop-approach", "Najpierw mieszkaniec podchodzi do przedmiotu.", 200,
      { prop, actor, direction, key: `${prefix}-approach` }),
    scene("prop-take", "Dłonie chwytają przedmiot.", 650,
      { prop, actor, direction, key: `${prefix}-pickup` }),
    scene("prop-carry", "Przedmiot pozostaje w dłoniach podczas chodzenia.", 200,
      { prop, actor, direction, to, key: `${prefix}-carry` }),
    scene("prop-put", "Dopiero podpora przejmuje ciężar.", 650,
      { prop, actor, direction, to, support, key: `${prefix}-setdown` }),
  ];
  const fitLamp = () => [
    ...supportSteps("i2-lamp", "maker", island2Layout.cabinBase, "lamp-load", 1, "cabin"),
    scene("prop-lift", "Kabina podaje lampę do górnego podestu.", 1600),
    ...supportSteps("i2-lamp", "maker", island2Layout.lamp, "lamp-upper", -1, "light"),
  ];

  function walk(step, role, destination, mode, work = 700, direction, gait) {
    const travel = Math.ceil(island2Renderer.actor(role, destination, false, 0, { gait }));
    island2Renderer.act(role, mode, work, travel, direction);
    step.duration = Math.max(step.duration, travel + work);
    return travel;
  }

  function grow(change, branches) {
    const key = `${change.id}-${change.level}`;
    if (key === "wheel-2") return [
      ...supportSteps("i2-tea", "scout", [351, 382], "tea-save", 1, "bench"),
      scene("wheel-team-ready", "Najpierw dłonie pod blat. Razem będzie łatwiej.", 300,
        { pottery: branches.wheel === "pottery" }),
      scene("wheel-build", branches.wheel === "pottery" ? "Dłonie podnoszą ścianki glinianego naczynia."
        : "Ten sam blat obraca się, nogi składają, a łopatki rozkładają po kolei.", 1700,
        { pottery: branches.wheel === "pottery" }),
      scene("wheel-place", "Teraz można ostrożnie przestawić gotowy mechanizm.", 1000),
      reveal(change, branches.wheel === "pottery" ? "Koło garncarskie jest gotowe." : "Strumień porusza łopatki koła."),
    ];
    if (key === "timber-3") return [
      scene("cabin-ready", "Skrzynia przyda się jeszcze raz.", 400),
      scene("cabin-move", "Mieszkaniec prowadzi skrzynię pod prowadnice.", 1200),
      scene("cabin-build", "Wieko unosi się na słupkach, a konstrukcja wyrasta od podstawy.", 1900),
      reveal(change, "Ta sama skrzynia pracuje teraz jako kabina."),
    ];
    if (key === "glass-2" || key === "glass-3") {
      const to = key === "glass-2" ? island2Layout.glassRough : island2Layout.glassReady;
      return [...supportSteps("i2-glass", key === "glass-2" ? "scout" : "maker", to, key),
        scene("glass-polish-contact", "Szklany krążek leży płasko na powierzchni szlifowania.", 1000,
          { actor: key === "glass-2" ? "scout" : "maker", to }),
        reveal(change, key === "glass-2" ? "Brzeg szkła jest wyrównany." : "Soczewka jest gotowa do przeniesienia.")];
    }
    if (key === "glass-4") return [
      ...supportSteps("i2-glass", "maker", island2LoadPoint(island2Layout.cabinBase), "glass-load", 1, "cabin"),
      scene("prop-lift", "Soczewka spoczywa w uchwycie kabiny, a lina ją podnosi.", 1600),
      ...supportSteps("i2-glass", "scout", island2Layout.glassTop, "glass-upper", -1, "optic"),
      reveal(change, "Soczewka jest osadzona w latarni."),
    ];
    if (key === "water-2") return [
      scene("source-notice", "Słychać wodę. Ale dokąd ona płynie?", 650),
      scene("source-dig", "Pod ziemią jest pusto…", 900),
      scene("source-ready", "Może uda się odsunąć wejście.", 400),
      scene("source-push", "Ten kamień ani drgnie. Przyda się pomoc!", 850),
      scene("source-team-ready", "Z drugiej strony ktoś już pomaga!", 500),
      scene("source-team", "Razem! Kamienna płyta przyda się jeszcze do czegoś.", 1350),
      reveal(change, "Otwarta pracownia i przejście pod ziemią!"),
    ];
    if (key === "copper-2") return [
      scene("magnet-peer", "Coś błyszczy w nowym przejściu…", 600),
      scene("magnet-crawl", "Tędy można się przecisnąć!", 400),
      scene("magnet-take", "Magnes! Teraz drut ma z czym współpracować.", 650, { actor: "scout", carry: "magnet" }),
      scene("magnet-return", "Znalazca niesie część do majsterkowicza.", 500, { actor: "scout", carry: "magnet" }),
      scene("magnet-connect", "Ty trzymaj magnes, ja nawinę drut.", 950, { actor: "scout", carry: "magnet" }),
      reveal(change, "Zwojnica i magnes są już połączone."),
    ];
    if (key === "seeds-3" && branches.seeds === "pond") return [
      scene("leaf-grow", "Odbicie w szkle zwabia rybkę. A ten liść robi się coraz większy…", 1200),
      reveal(change, "Liść jest już dość duży na nowe zastosowanie."),
    ];
    if (key === "wheel-3" && branches.wheel === "pottery") return [
      scene("forms-bundle", "Woda pomaga formować glinę, lina zabezpiecza delikatne formy w podróży.", 1300),
      reveal(change, "Gliniane formy są związane do transportu."),
    ];
    return null;
  }

  function milestones(levels, story) {
    if (!story.bridgeBuilt && levels.water >= 2 && levels.glass >= 3 && levels.rope >= 2) return [
      scene("bridge-ready", "Szlifowanie skończone. Kamienna płyta jest znów wolna.", 650),
      scene("bridge-haul", "Płyta zamiast kolejnej deski? Powstaje mostek nad odpływem!", 1400),
      scene("bridge-approach", "Przejście już gotowe. Zapasy można przenieść nad wodą.", 2200, { actor: "gardener", carry: "food" }),
      scene("bridge-cross", "Suchą nogą na drugą stronę!", 900, { actor: "gardener", carry: "food" }),
      scene("bridge-deliver", "Teraz zapasy mają krótszą drogę do pracowni.", 1700, { actor: "gardener", carry: "food" }),
    ];
    return [];
  }

  function preparation(previous, levels, placed, turn, branches) {
    if (levels.glass === 2 && previous.glass === 2 && turn - placed.glass < 4) return [
      scene("glass-polish", "Jeszcze jeden brzeg. Szkło staje się coraz gładsze.", 550),
    ];
    return [];
  }

  function ending(levels, branches) {
    const pond = branches.seeds === "pond" && levels.seeds >= 2;
    const leaf = pond && levels.seeds >= 3;
    const crate = branches.wheel === "pottery" && levels.wheel >= 3;
    const steps = [];
    if (pond) steps.push(scene("pond-coax", "Ktoś zainteresował się odbiciem…", 750),
      scene("fish-jump", "O! Rybka też chce zobaczyć, co się dzieje.", 1200),
      scene("splash-recover", "Mokra niespodzianka. Mieszkańcy mają na to sposób.", 650));
    if (!leaf && !crate) return pond ? steps : null;
    if (leaf) steps.push(scene("leaf-pick", "Nie tylko ozdoba stawu. Ten liść może dać cień!", 850),
      scene("leaf-shelter", "Parasol na chwilę. A za chwilę…", 600));
    if (crate) steps.push(scene("craft-inspect", "To pudełko wcale nie musi zostać na brzegu.", 650,
      { useCrate: crate, useLeaf: leaf }));
    steps.push(scene("craft-prepare", crate
      ? leaf ? "Pudełko zostaje łódką, wieko siedziskiem, liść żaglem."
        : "Majsterkowicz zdejmuje wieko. Może z niego wystrugać wiosło!"
      : "Ten sam liść wystarczy na maleńką tratwę.", 1100, { useCrate: crate, useLeaf: leaf }));
    steps.push(scene("craft-ready", "Nie trzeba wszystkiego budować od nowa.", 600),
      scene("craft-launch", "Ostrożnie na wodę!", 1500),
      scene("craft-descend", "Do łódki prowadzi zejście wzdłuż ściany kostki.", 400),
      scene("craft-board", "Mała wyprawa rusza w drogę.", 1000));
    if (leaf && crate) steps.push(scene("sail-bring", "Żagiel jeszcze przed chwilą był parasolem.", 600),
      scene("sail-fit", "Łodyga staje się masztem. Wieko pozostaje siedziskiem.", 750));
    steps.push(scene("trade-sail", "Na horyzoncie ktoś zauważył małych podróżników!", 2500),
      scene("trade-exchange", "Gliniane formy albo zielony podarunek za nowe nasiona.", 950),
      scene("trade-return", "Teraz jest z czym wrócić do ogrodnika.", 2300),
      scene("craft-land", "Ładunek trzeba jeszcze dostarczyć.", 900),
      scene("gift-return", "Nowe nasiona! Jedna wyprawa daje początek kolejnej historii.", 900));
    return steps;
  }

  function start(step) {
    const story = island2Story;
    const name = step.scene;
    if (name === "prop-approach" || name === "prop-carry") {
      const location = name === "prop-approach" ? point(step.prop) : step.to;
      const offset = step.prop === "i2-lamp" ? [-8, 12] : step.prop === "i2-tea" ? [0, 32] : [0, 0];
      const feet = location[1] < 250 ? at(name === "prop-approach" ? "upperLoad" : "lantern")
        : [location[0] - offset[0] - step.direction * 25 * island2ActorScale,
          location[1] - offset[1] + 27 * island2ActorScale];
      walk(step, step.actor, feet, "offer", 150, step.direction, name === "prop-carry" ? "heavy" : "walk");
    } else if (name === "prop-take") {
      island2Renderer.act(step.actor, "offer", step.duration, 0, step.direction);
      if (step.prop === "i2-glass") {
        story.glassHeld = true;
        story.glassPlane = "x";
        island2Renderer.discPlane(step.prop, "x");
      }
      island2Renderer.follow(step.prop, `i2-person-${step.actor}`, step.prop === "i2-lamp" ? [-8, 12] : step.prop === "i2-tea" ? [0, 32] : [0, 0],
        { hand: true, blend: 600 });
    } else if (name === "prop-put") {
      island2Renderer.act(step.actor, "offer", step.duration, 0, step.direction);
      island2Renderer.follow(step.prop, `i2-person-${step.actor}`, [0, 0],
        { hand: true, to: step.to, blend: 600 });
    } else if (name === "wheel-team-ready") {
      walk(step, "scout", [207, 392], "kneel", 300, 1);
      walk(step, "maker", [281, 413], step.pottery ? "shape" : "kneel", 300, -1);
    } else if (name === "wheel-build") {
      for (const [role, side] of [["scout", -1], ["maker", 1]]) {
        island2Renderer.act(role, step.pottery && role === "maker" ? "shape" : "offer", step.duration, 0, side === -1 ? 1 : -1);
        if (!step.pottery) island2Renderer.entities.get(`i2-person-${role}`).workGrip = { prop: "i2-tabletop", side };
      }
      island2Renderer.buildWheel(step.duration, 0, step.pottery);
      sound("island-effort");
    } else if (name === "wheel-place") {
      const a = island2Layout.wheelRest;
      const b = island2Layout.wheelDrive;
      island2Move("i2-wheel", [a, [244, 409], b], step.duration);
      for (const [role, start, side] of [["scout", [207, 392], -1], ["maker", [281, 413], 1]]) {
        island2Renderer.perform(role, [start, [start[0] + b[0] - a[0], start[1] + b[1] - a[1]]],
          step.duration, "push", 0, side === -1 ? 1 : -1);
        island2Renderer.entities.get(`i2-person-${role}`).workGrip = { prop: "i2-tabletop", side };
      }
    } else if (name === "cabin-ready") {
      walk(step, "maker", [405, 401], "kneel", 400, 1);
    } else if (name === "cabin-move") {
      island2Move("i2-crate", [island2Layout.crateRest, island2Layout.cabinBase], step.duration);
      island2Renderer.perform("maker", [[405, 401], [389, 383]], step.duration, "push");
    } else if (name === "cabin-build") {
      island2Renderer.act("maker", "repair", step.duration, 0, 1);
      island2Renderer.buildCabin(step.duration);
      sound("island-effort");
    } else if (name === "prop-lift") {
      story.cabin = [...island2Layout.cabinTop];
      island2Move("i2-crate", [island2Layout.cabinBase, island2Layout.cabinTop], step.duration);
      sound("island-effort");
    } else if (name === "glass-polish-contact") {
      walk(step, step.actor, [step.to[0] + 18, step.to[1] + 17], "polish", 1000, -1);
    } else if (name === "source-notice") {
      walk(step, "scout", at("spring"), "look", 650, 1);
      sound("island-notice");
    } else if (name === "source-dig") {
      walk(step, "scout", at("mill"), "dig", 900, -1);
      sound("island-effort");
    } else if (name === "source-ready") {
      walk(step, "scout", at("workshop"), "look", 400, -1);
    } else if (name === "source-push") {
      island2Renderer.perform("scout", [at("workshop"), [359, 404]], 850, "push", 0, -1);
      island2Move("i2-cover", [island2Layout.coverHome, [322, 386]], 850);
      sound("island-effort");
    } else if (name === "source-team-ready") {
      walk(step, "scout", [358, 389], "look", 500, -1);
      walk(step, "maker", [347, 416], "look", 500, -1);
    } else if (name === "source-team") {
      island2Renderer.perform("scout", [[358, 389], [320, 404]], 1300, "push", 0, -1);
      island2Renderer.perform("maker", [[347, 416], [309, 428]], 1300, "push", 0, -1);
      island2Move("i2-cover", [[322, 386], island2Layout.coverBench], 1300);
      island2Animate("i2-cover-panel", [{ transform: "scaleY(1)" }, { transform: "scaleY(.25)" }], 450, "ease-in-out", 850);
    } else if (name === "magnet-peer") {
      walk(step, "scout", at("inside"), "kneel", 600, -1);
      sound("island-notice");
    } else if (name === "magnet-crawl") {
      walk(step, "scout", at("tunnel"), "crawl", 400, 1);
    } else if (name === "magnet-take") {
      island2Renderer.act("scout", "crawl", 650, 0, 1);
      element("i2-magnet").style.display = "none";
      island2Carry("magnet", [], 1);
      sound("island-discover");
    } else if (name === "magnet-return") {
      walk(step, "scout", at("generator"), "offer", 500, -1, "heavy");
      island2Carry("magnet", [], 1);
    } else if (name === "magnet-connect") {
      const travel = walk(step, "maker", [300, 428], "repair", 950, 1);
      island2Renderer.act("scout", "offer", travel + 950, 0, -1);
      island2Carry("magnet", [], 1);
      element("i2-generator").style.display = "";
      island2Animate("i2-generator", [{ opacity: 0 }, { opacity: 1 }], 700, "ease-in-out", travel + 200);
      island2Animate("i2-loose-coil", [{ opacity: 1 }, { opacity: 0 }], 700, "ease-in-out", travel + 200);
    } else if (name === "bridge-ready") {
      walk(step, "scout", [315, 420], "look", 650, -1);
      walk(step, "maker", at("workshop"), "look", 650, -1);
      sound("island-notice");
    } else if (name === "bridge-haul") {
      story.tether = "scout";
      island2Renderer.perform("scout", [[315, 420], [314, 444]], 1400, "pull", 0, -1);
      island2Renderer.act("maker", "look", 1400, 0, -1);
      island2Move("i2-cover", [island2Layout.coverBench, island2Layout.coverBridge], 1400);
      island2Animate("i2-cover-panel", [{ transform: "scaleY(.25)" },
        { transform: "matrix(0,.3,-1,-.45,-23.5,-10.575)" }], 1000, "ease-in-out", 400);
      sound("island-effort");
    } else if (name === "bridge-approach") {
      const path = [point("i2-person-gardener"), at("wheel"), [236, 414], at("bridge")];
      island2Renderer.perform("gardener", path, 2200, "heavy");
      island2Renderer.actor("scout", at("spring"));
      island2Carry("food", [], 1);
    } else if (name === "bridge-cross") {
      island2Renderer.act("gardener", "balance", 900);
      island2Carry("food", [], 1);
    } else if (name === "bridge-deliver") {
      island2Renderer.perform("gardener", [at("bridge"), [322, 447], [358, 437], at("cave")], 1700, "heavy");
      island2Carry("food", [], 1);
    } else if (name === "wheel-splash") {
      element("i2-splash").style.display = "";
      island2Position("i2-splash", [210, 379]);
      island2Animate("i2-splash", [{ opacity: 0 }, { opacity: 1, offset: .3 }, { opacity: 0 }], 800);
      island2Renderer.act("scout", "startle", 850);
      sound("island-splash");
    } else if (name === "glass-polish") {
      walk(step, island2Visual.water >= 2 ? "maker" : "scout", [309, 407], "polish", 550, -1);
    } else if (name === "leaf-grow") {
      walk(step, "gardener", at("pondEdge"), "look", 1200, 1);
      island2Animate("i2-lily-body", [{ transform: "scale(1)" }, { transform: "scale(1.45)" }], 1000);
      const glass = point("i2-glass");
      element("i2-reflection").style.display = "";
      element("i2-reflection").setAttribute("d", `M${glass.join(" ")} ${island2Layout.fish.join(" ")}`);
      island2Animate("i2-reflection", [{ opacity: 0 }, { opacity: .8 }, { opacity: 0 }], 1100);
      sound("island-discover");
    } else if (name === "forms-bundle") {
      walk(step, "maker", at("potter"), "shape", 1300, -1);
      walk(step, "gardener", at("workshop"), "offer", 900, -1);
    } else if (name === "pond-coax") {
      walk(step, "gardener", at("pondEdge"), "look", 750, 1);
      walk(step, "scout", at("spring"), "look", 750, -1);
    } else if (name === "fish-jump") {
      island2Move("i2-fish", [island2Layout.fish, [177, 286], [202, 311], island2Layout.fish], 1100);
      island2Renderer.act("scout", "startle", 700, 400, -1);
      island2Renderer.act("gardener", "look", 1200, 0, 1);
      element("i2-splash").style.display = "";
      island2Position("i2-splash", [202, 311]);
      island2Animate("i2-splash", [{ opacity: 0 }, { opacity: 1, offset: .4 }, { opacity: 0 }], 1000);
      sound("island-splash");
    } else if (name === "splash-recover") {
      island2Renderer.act("scout", "sit", 650, 0, -1);
      island2Renderer.act("gardener", "look", 650, 0, 1);
    } else if (name === "leaf-pick") {
      story.lilyMoved = true;
      const travel = walk(step, "gardener", at("pondEdge"), "shelter", 850, 1);
      element("i2-lily-stem").style.display = "";
      island2Renderer.follow("i2-lily", "i2-person-gardener", [0, -20], { hand: true, blend: Math.max(400, travel) });
    } else if (name === "leaf-shelter") {
      walk(step, "gardener", [184, 342], "shelter", 600, 1, "umbrella");
      island2Renderer.act("scout", "shelter", step.duration, 0, 1);
    } else if (name === "craft-inspect") {
      story.craftKind = "crate";
      story.leafSail = step.useLeaf;
      walk(step, "maker", [405, 401], "kneel", 650, 1);
    } else if (name === "craft-prepare") {
      story.craftKind = step.useCrate ? "crate" : "leaf";
      story.leafSail = step.useCrate && step.useLeaf;
      if (step.useCrate) {
        island2Renderer.act("maker", "repair", 1100, 0, 1);
        island2Renderer.follow("i2-crate-lid", "i2-person-maker", [0, 26], { hand: true, blend: 350 });
      } else {
        island2Renderer.follow("i2-lily", "i2-person-scout", [0, -20], { hand: true, blend: 450 });
        island2Renderer.act("scout", "shelter", 1100);
      }
    } else if (name === "craft-ready") {
      if (story.craftKind === "crate") {
        walk(step, "scout", [401, 397], "push", 600, 1);
        if (story.leafSail) island2Renderer.follow("i2-lily", "i2-person-gardener", [0, -20], { hand: true, blend: 400 });
        else walk(step, "maker", at("shore"), "offer", 600, -1);
      } else walk(step, "scout", at("shore"), "shelter", 600, 1, "umbrella");
    } else if (name === "craft-launch") {
      if (story.craftKind === "crate") {
        story.crateBoat = true;
        story.craftPoint = [...island2Layout.craftShore];
        island2Move("i2-crate", [island2Layout.crateRest, [524, 372], [545, 420], island2Layout.craftShore],
          1500, [0, .6, .8, 1], 0, "sea-front");
        island2Renderer.perform("scout", [[401, 397], [493, 378], at("shoreTop")], 900, "push");
      } else {
        story.leafFlat = true;
        island2Renderer.release("i2-lily");
        island2Move("i2-lily", [point("i2-lily"), [544, 420], [551, 462], island2Layout.craftShore],
          1400, [0, .28, .66, 1], 0, "sea-front");
        story.leafPoint = [...island2Layout.craftShore];
      }
      sound("island-splash");
    } else if (name === "craft-descend") {
      walk(step, "scout", at("shore"), "look", 400, 1);
    } else if (name === "craft-board") {
      const craft = story.craftKind === "crate" ? "i2-crate" : "i2-lily";
      const offset = story.craftKind === "crate" ? [0, -18] : [0, -5];
      const destination = point(craft).map((value, index) => value + offset[index]);
      island2Renderer.perform("scout", [at("shore"), destination], 1000, "climb", 0, 1, "sea-front");
      if (story.craftKind === "crate" && !story.leafSail) {
        island2Renderer.follow("i2-crate-lid", "i2-person-scout", [0, 0], { hand: true, blend: 500, depthBias: 3 });
      }
    } else if (name === "sail-bring") {
      walk(step, "gardener", at("shore"), "shelter", 600, 1, "umbrella");
    } else if (name === "sail-fit") {
      island2Renderer.follow("i2-lily", "i2-crate", [-15, -50], { depthBias: -2, blend: 750 });
      island2Animate("i2-lily-body", [{ transform: "scale(1.45)" }, { transform: "rotate(-35deg) scale(1.45,2.1)" }], 750);
      sound("island-discover");
    } else if (name === "trade-sail" || name === "trade-return") {
      const craft = story.craftKind === "crate" ? "i2-crate" : "i2-lily";
      const destination = name === "trade-sail" ? island2Layout.craftSea : island2Layout.craftShore;
      island2Move(craft, [point(craft), [565, 556], destination], 2200, undefined, 0, "sea-front");
      if (story.craftKind === "crate") story.craftPoint = [...destination];
      else story.leafPoint = [...destination];
      if (name === "trade-sail") {
        story.boatSeen = true;
        element("i2-boat").style.display = "";
        island2Move("i2-boat", [story.boat, [612, 390], [612, 510], [589, 551]], 2300);
        story.boat = [589, 551];
      } else {
        island2Move("i2-boat", [point("i2-boat"), [612, 510], [612, 390], island2Layout.boatWaiting], 2200);
        story.boat = [...island2Layout.boatWaiting];
      }
    } else if (name === "trade-exchange") {
      story.giftSeen = true;
      island2Position("i2-gift", [568, 543]);
      element("i2-gift").style.display = "";
      island2Renderer.follow("i2-gift", "i2-person-scout", [0, 0], { hand: true, blend: 950 });
      sound("island-discover");
    } else if (name === "craft-land") {
      island2Renderer.release("i2-person-scout");
      const origin = point("i2-person-scout");
      island2Renderer.perform("scout", [origin, at("shore")], 900, "climb", 0, -1, "front");
      if (story.oarMade) story.oarStowed = true;
      walk(step, "gardener", at("farm"), "offer", 900, 1);
    } else if (name === "gift-return") {
      walk(step, "scout", [170, 372], "offer", 900, -1, "heavy");
      walk(step, "gardener", at("farm"), "offer", 900, 1);
      walk(step, "maker", island2State.branches.wheel === "pottery" ? at("potter") : at("workshop"), "repair", 700, -1);
    } else throw new Error(`Nieznana scena wyspy: ${name}`);
  }

  function commit(step) {
    const story = island2Story;
    if (step.scene === "prop-put") {
      island2Renderer.release(step.prop);
      island2Position(step.prop, step.to);
      if (step.prop === "i2-glass") {
        story.glassHeld = false;
        story.glassPoint = [...step.to];
        story.glassPlane = step.support ? "x" : "ground";
        island2Renderer.discPlane(step.prop, story.glassPlane);
      }
      if (step.prop === "i2-lamp") story.lampPoint = [...step.to];
      if (step.prop === "i2-tea") { story.teaStored = true; story.teaPoint = [...step.to]; }
      if (step.support === "cabin") island2Renderer.follow(step.prop, "i2-crate",
        step.prop === "i2-lamp" ? [0, 0] : island2Layout.loadOffset, { depthBias: 1 });
      if (step.prop === "i2-lamp" && step.support === "light") story.lampRaised = true;
      sound("island2-touch");
    }
    switch (step.scene) {
      case "wheel-build":
        island2Visual.wheel = 2;
        story.wheelPoint = [...island2Layout.wheelRest];
        break;
      case "wheel-place":
        story.wheelPoint = [...island2Layout.wheelDrive];
        break;
      case "cabin-move": story.cratePoint = [...island2Layout.cabinBase]; break;
      case "cabin-build":
        island2Visual.timber = 3;
        story.cratePoint = undefined;
        story.cabin = [...island2Layout.cabinBase];
        break;
      case "source-dig": story.cutawayOpen = true; break;
      case "source-push":
        story.workshopOpen = true;
        story.stoneSaved = true;
        story.stonePoint = [322, 386];
        break;
      case "source-team":
        story.stoneFlat = true;
        story.stonePoint = [...island2Layout.coverBench];
        break;
      case "magnet-take": story.magnetTaken = true; break;
      case "bridge-haul":
        story.bridgeBuilt = true;
        story.tether = "";
        story.stonePoint = [...island2Layout.coverBridge];
        break;
      case "leaf-grow": story.leafGrown = true; break;
      case "forms-bundle": story.formsReady = true; break;
      case "craft-prepare":
        story.crateOpen = story.craftKind === "crate";
        if (story.craftKind === "crate") {
          if (story.leafSail) {
            story.lidSeat = true;
            island2Renderer.follow("i2-crate-lid", "i2-crate", [0, 10], { depthBias: 2, blend: 400 });
          } else {
            story.oarMade = true;
            island2Renderer.follow("i2-crate-lid", "i2-person-maker", [0, 0], { hand: true, blend: 300 });
          }
        }
        break;
      case "craft-board": {
        story.sailing = true;
        const craft = story.craftKind === "crate" ? "i2-crate" : "i2-lily";
        island2Renderer.follow("i2-person-scout", craft, story.craftKind === "crate" ? [0, -18] : [0, -5],
          { plane: "sea-front", depthBias: story.craftKind === "crate" ? -1 : 1 });
        break;
      }
      case "craft-land": story.sailing = false; break;
      case "gift-return":
        story.giftReturned = true;
        story.tradeDone = true;
        island2Renderer.follow("i2-gift", "i2-person-gardener", [0, 0], { hand: true, blend: 350 });
        break;
    }
  }

  return { grow, milestones, preparation, ending, start, commit, scene, fitLamp };
})();
