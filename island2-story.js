"use strict";

const island2Cinema = (() => {
  const step = (action, text, extra = {}) => ({ kind: "3d", action, text, duration: 700, ...extra });
  const walk = (actor, to, text, scene, gait) => step("walk", text, { actor, to, scene, gait });
  const work = (actor, target, text, scene, mode = "repair", duration = 850) =>
    step("work", text, { actor, target, scene, mode, duration });
  const grab = (actor, prop, text, scene) => step("grab", text, { actor, prop, scene });
  const put = (actor, prop, to, text, scene) => step("put", text, { actor, prop, to, scene });
  const reveal = (id, level, text) => step("upgrade", text, { id, level, scene: `${id}-${level}`, duration: 900 });
  const p = (u, v, y = 0) => island2Blueprint.ground(u, v, y);

  function carry(actor, prop, to, text, scene) {
    return [walk(actor, prop, text, `${scene}-approach`), grab(actor, prop, text, `${scene}-pickup`),
      walk(actor, to, text, `${scene}-carry`, "heavy"), put(actor, prop, to, text, `${scene}-setdown`)];
  }

  function loadGlass(plan) {
    if (plan.glass === "crate.load") return [];
    plan.glass = "crate.load";
    return carry("maker", "glass", "crate.load", "Soczewka trafia z dłoni w uchwyty kabiny.", "glass-load");
  }

  function fitLamp(plan) {
    if (plan.lamp === "tower.light") return [];
    plan.lamp = "tower.light";
    return carry("scout", "lamp", "tower.light", "Latarenkę można bezpiecznie nieść za uchwyt.", "lamp-install");
  }

  function growth(change, plan, levels, branches) {
    const { id, level } = change;
    if (id === "water" && level === 2) return [
      walk("scout", "spring", "Skąd płynie ta woda?", "source-notice"),
      step("pose", "Mieszkaniec zauważa coś pod ziemią.", { actor: "scout", mode: "look", scene: "source-look", sound: "island-notice" }),
      walk("scout", "mill", "Najpierw trzeba odkopać przejście.", "source-dig-approach"),
      work("scout", null, "Jeszcze jeden ruch łopatką…", "source-dig", "dig"),
      step("excavate", "Pod wyspą jest suche przejście.", { scene: "source-cutaway", set: { cutawayOpen: true } }),
      walk("scout", { prop: "cover" }, "Kamień zamyka wejście.", "source-ready"),
      step("push", "Samemu nie będzie łatwo.", { prop: "cover", cast: ["scout"],
        to: p(322, 386, .87), scene: "source-push", set: { workshopOpen: true, stoneSaved: true } }),
      step("cast", "Z drugiej strony ktoś już pomaga!", { cast: [
        { actor: "scout", to: { prop: "cover", side: -1 } },
        { actor: "maker", to: { prop: "cover", side: 1 } }], scene: "source-team-ready" }),
      step("push", "Razem! Kamienna płyta przyda się jeszcze raz.", { prop: "cover", cast: ["scout", "maker"],
        to: [2.15, .13, 2.4], rotation: [-Math.PI / 2, 0, Math.PI / 2], scene: "source-team",
        set: { stoneFlat: true } }),
      reveal(id, level, "Pracownia i podziemny korytarz są otwarte."),
    ];
    if (id === "copper" && level === 2) {
      plan.magnet = "copper.magnet";
      return [
        walk("scout", "inside", "Coś błyszczy w nowym przejściu…", "magnet-peer"),
        walk("scout", "magnet", "Tędy można się przecisnąć.", "magnet-crawl"),
        grab("scout", "magnet", "Znalazł się magnes!", "magnet-take"),
        walk("scout", "copper.magnet", "Trzeba go dostarczyć do zwojnicy.", "magnet-return", "heavy"),
        put("scout", "magnet", "copper.magnet", "Magnes pasuje do uchwytu prądnicy.", "magnet-connect"),
        work("maker", "copper.coil", "Drut zostaje nawinięty na rdzeń.", "magnet-wind"),
        reveal(id, level, "Zwojnica i magnes są już połączone."),
      ];
    }
    if (id === "glass" && level === 2) {
      const support = levels.water >= 2 ? "cover.polish" : "crate.polish";
      const worker = levels.water >= 2 ? "maker" : "scout";
      plan.glass = support;
      return [...carry(worker, "glass", support, "Krążek trzeba podnieść i położyć na podporze.", "glass-polish"),
        work(worker, "glass", "Dłonie dociskają szkło do powierzchni szlifowania.", "glass-polish-work", "polish", 1100),
        reveal(id, level, "Brzeg szkła jest już wstępnie wyrównany.")];
    }
    if (id === "glass" && level === 3) return [
      walk("maker", plan.glass, "Jeszcze jeden brzeg wymaga pracy.", "glass-finish-approach"),
      work("maker", "glass", "Matowa powierzchnia staje się przejrzysta.", "glass-finish", "polish", 1200),
      reveal(id, level, "Gotowa soczewka czeka na przeniesienie."),
    ];
    if (id === "glass" && level === 4) {
      const result = [...fitLamp(plan), ...loadGlass(plan),
        step("lift", "Uchwyty trzymają soczewkę podczas podnoszenia.", { height: 4.42, scene: "glass-lift" }),
        step("grip", "W kabinie jest dość miejsca na bezpieczny chwyt od góry.", { prop: "glass", profile: "receive", scene: "glass-grip-ready" }),
        walk("scout", "upperLoad", "Na górze czeka odbiorca.", "glass-gallery"),
        grab("scout", "glass", "Najpierw dłonie, potem zwolnienie uchwytów.", "glass-handoff"),
        step("grip", "Druga dłoń stabilizuje szkło przed osadzeniem w ramie.", { prop: "glass", profile: "mount", scene: "glass-regrip" }),
        walk("scout", "tower.optic", "Soczewka pozostaje w dłoniach aż do mocowania.", "glass-carry-upper", "heavy"),
        put("scout", "glass", "tower.optic", "Pierścień i dolna podpora przejmują ciężar szkła.", "glass-install"),
        reveal(id, level, "Soczewka jest zamocowana w latarni."),
        step("lift", "Pusta kabina wraca na dół.", { height: 0, scene: "lower" })];
      plan.glass = "tower.optic";
      return result;
    }
    if (id === "timber" && level === 3) {
      const result = [];
      if (plan.glass === "crate.polish") {
        result.push(...carry("maker", "glass", "cover.polish", "Zanim przebudujemy skrzynię, szkło musi dostać nową podporę.", "glass-clear-lid"));
        plan.glass = "cover.polish";
      }
      result.push(walk("maker", { prop: "crate" }, "Ta sama skrzynia zmieni swoje zadanie.", "crate-ready"),
        step("push", "Najpierw skrzynia trafia między prowadnice.", { prop: "crate", cast: ["maker"],
          to: island2Blueprint.positions.cabin, rotation: [0, Math.PI / 4, 0], scene: "crate-position" }),
        reveal(id, level, "Ścianki się rozkładają, a wieko staje się dachem kabiny."));
      return result;
    }
    if (id === "timber" && level === 4) return [
      step("supply", "Deski czekają przy pracowni.", { prop: "planks", scene: "planks-supply" }),
      ...carry("maker", "planks", "crate.load", "Każdy ładunek najpierw trafia w dłonie, potem na podłogę kabiny.", "planks-load"),
      step("lift", "Winda podaje deski do budowniczego.", { height: 4.42, scene: "planks-lift" }),
      walk("maker", "upperLoad", "Budowniczy odbiera ładunek.", "planks-receive"),
      grab("maker", "planks", "Ciężar desek przejmują ręce.", "planks-take"),
      walk("maker", "tower.materials", "Deski trafiają na podest, nie przelatują przez powietrze.", "planks-carry"),
      put("maker", "planks", "tower.materials", "Można zamocować dach.", "planks-setdown"),
      reveal(id, level, "Dach rozkłada się na podporach."),
      step("consume", "Materiał został wykorzystany w konstrukcji.", { prop: "planks", scene: "planks-built" }),
      step("lift", "Kabina wraca po następny ładunek.", { height: 0, scene: "lower" }),
    ];
    if (id === "wheel" && level === 2) return [
      ...carry("scout", "cup", "workshop.cup", "Zanim przebudujemy stolik, filiżanka trafia na półkę w pracowni.", "cup-save"),
      walk("scout", { prop: "wheel" }, "Najpierw trzeba przestawić cały krążek.", "wheel-ready"),
      step("push", "Dłonie prowadzą krążek do nowego miejsca.", { prop: "wheel", cast: ["scout"],
        to: p(237, 418), scene: "wheel-position" }),
      reveal(id, level, branches.wheel === "pottery" ? "Blat staje się kołem garncarskim." : "Nogi się składają, a łopatki rozkładają przy strumieniu."),
      step("splash", "Koło ruszyło! Trochę zbyt ochoczo…", { actor: "scout", scene: "wheel-splash" }),
    ];
    if (id === "seeds" && level === 3 && branches.seeds === "pond") return [
      work("gardener", null, "Ten liść robi się coraz większy…", "leaf-grow", "look", 1100),
      step("leaf-grow", "Mały listek może dostać nowe zastosowanie.", { scene: "leaf-unfurl", set: { leafGrown: true } }),
      reveal(id, level, "Duży liść jest gotowy na nową przygodę."),
    ];
    if (id === "wheel" && level === 3 && branches.wheel === "pottery") return [
      walk("maker", "wheel.shape", "Gliniane formy wymagają ostrożności.", "forms-ready"),
      work("maker", "wheel.shape", "Ręce nadają glinie kształt.", "forms-shape", "shape", 1100),
      reveal(id, level, "Lina zabezpiecza formy na czas podróży."),
    ];
    if (id === "timber" && level === 2) return [
      step("supply", "Ogródek ma zapasy dla majsterkowicza.", { prop: "food", scene: "food-supply", set: { gardenerArrived: true } }),
      ...carry("gardener", "food", "workshop.delivery", "Kosz jest niesiony, a potem odkładany przy wejściu.", "food-delivery"),
      reveal(id, level, "Zapasy pozwalają zająć się pracą."),
      step("consume", "Mieszkańcy korzystają z zapasów.", { prop: "food", scene: "food-used" }),
    ];
    const contacts = { water: "water.valve", rope: "rope.crank", copper: "copper.coil", wheel: branches.wheel === "pottery" ? "wheel.shape" : "wheel.axle" };
    const worker = id === "seeds" ? "gardener" : "maker";
    const where = id === "seeds" ? "farm" : contacts[id] || "workshop";
    return [walk(worker, where, "Każdy etap zaczyna się od podejścia do właściwego miejsca.", `${id}-approach`),
      work(worker, contacts[id] || null, "Praca przy połączonych częściach.", `${id}-work`, id === "seeds" ? "kneel" : "repair", 650),
      reveal(id, level, island2Track(island2Items.find((item) => item.id === id), branches).stages[level - 1])];
  }

  function newStory() {
    return { ending: "", cutawayOpen: false, workshopOpen: false, stoneSaved: false, stoneFlat: false,
      magnetTaken: false, bridgeBuilt: false, boatSeen: false, cargo: "hidden", lampRaised: false,
      leafGrown: false, lilyMoved: false, leafFlat: false, leafSail: false,
      crateBoat: false, crateOpen: false, oarMade: false, oarStowed: false, lidSeat: false,
      sailing: false, giftSeen: false, giftReturned: false, tradeDone: false, craftKind: "", gardenerArrived: false };
  }

  function turn(id, previous, result) {
    const branches = island2State.branches;
    const plan = { glass: island2Renderer.entity("glass").owner.name, lamp: island2Renderer.entity("lamp").owner.name };
    const levels = { ...previous, [id]: 1 };
    const steps = [step("place", `${island2Items.find((item) => item.id === id).name} trafia na wyspę.`, { id, level: 1, duration: 850, scene: `place-${id}` })];
    for (const wave of result.waves) for (const change of wave) {
      steps.push(...growth(change, plan, levels, branches));
      levels[change.id] = change.level;
    }
    if (levels.lamp && levels.timber >= 3 && levels.rope >= 3) steps.push(...fitLamp(plan));
    if (!island2Story.bridgeBuilt && levels.water >= 2 && levels.glass >= 3 && levels.rope >= 2 && levels.timber >= 3) {
      if (plan.glass !== "tower.optic") steps.push(...loadGlass(plan));
      steps.push(walk("scout", { prop: "cover" }, "Podpora do szlifowania znów jest wolna.", "bridge-ready"),
        step("push", "Dłonie i lina prowadzą kamień nad odpływ.", { prop: "cover", cast: ["scout"],
          to: [0, .13, 3.2], rotation: [-Math.PI / 2, 0, Math.PI / 2], scene: "bridge-haul", set: { bridgeBuilt: true } }),
        walk("gardener", "bridge", "Po moście można przejść suchą nogą.", "bridge-cross"));
    }
    if (levels.glass === 2 && previous.glass === 2 && island2State.order.length - island2State.placed.glass < 4) {
      const actor = levels.water >= 2 ? "maker" : "scout";
      steps.push(walk(actor, plan.glass, "Jeszcze jeden brzeg szkła.", "glass-prepare"),
        work(actor, "glass", "Matowa powierzchnia stopniowo znika.", "glass-polish", "polish", 650));
    }
    if (island2State.order.length === 8) steps.push(...ending(levels, branches, plan));
    return steps;
  }

  function ending(levels, branches, plan) {
    const full = island2Items.every((item) => levels[item.id] === item.stages.length);
    island2Story.ending = full ? "beacon" : branches.seeds === "pond" ? "pond"
      : branches.wheel === "pottery" && levels.wheel >= 2 ? "pottery" : levels.lamp >= 2 ? "light" : "workshop";
    if (full) return [
      step("pose", "Światło wskazuje drogę do wyspy.", { actor: "scout", mode: "cheer", scene: "signal", sound: "island-signal" }),
      step("ship-dock", "Statek podpływa do gotowej przystani.", { scene: "sail", duration: 2200 }),
      ...cargoDelivery(),
      step("celebrate", "Cała wyspa pracuje razem.", { scene: "cheer", sound: "complete", duration: 700 }),
    ];
    const leaf = branches.seeds === "pond" && levels.seeds >= 3;
    const crate = branches.wheel === "pottery" && levels.wheel >= 3;
    const result = [];
    if (branches.seeds === "pond" && levels.seeds >= 2) result.push(
      walk("scout", "spring", "Ktoś zainteresował się odbiciem…", "pond-coax"),
      step("fish-jump", "Rybka też chce zobaczyć, co się dzieje!", { scene: "fish-jump" }),
      step("pose", "Mokra niespodzianka.", { actor: "scout", mode: "sit", scene: "splash-recover" }));
    if (leaf || crate) result.push(...voyage(leaf, crate));
    else result.push(walk("maker", branches.wheel === "pottery" ? "wheel.shape" : "workshop", "Wyspa znalazła inne zastosowanie.", "settle"),
      work("maker", branches.wheel === "pottery" ? "wheel.shape" : null, "Mieszkańcy mają już następny pomysł.", "ending-work", branches.wheel === "pottery" ? "shape" : "repair"));
    return result;
  }

  function cargoDelivery() {
    return [
      step("crane-grab", "Hak musi najpierw dotrzeć do ładunku.", { scene: "unload-hook", setAtStart: { cargo: "moving" } }),
      step("crane-deliver", "Ładunek wisi na linie, nie przesuwa się sam.", { scene: "unload" }),
      walk("maker", "crane.load", "Pracownik przejmuje ciężar.", "cargo-receive"),
      grab("maker", "cargo", "Ręce odbierają paczkę z haka.", "cargo-take"),
      walk("maker", "crate.load", "Pracownik niesie paczkę do windy.", "cargo-carry"),
      put("maker", "cargo", "crate.load", "Podłoga kabiny przejmuje ładunek.", "cargo-load"),
      step("lift", "Winda podaje paczkę na podest.", { height: 2.88, scene: "cargo-lift" }),
      walk("maker", "lowerLoad", "Na górze trzeba ją ponownie odebrać.", "cargo-gallery"),
      grab("maker", "cargo", "Paczka wraca w dłonie.", "cargo-pickup-upper"),
      walk("maker", "tower.cargo", "Jeszcze kilka kroków do półki.", "cargo-upper-carry"),
      put("maker", "cargo", "tower.cargo", "Dostawa dotarła na miejsce.", "cargo-setdown"),
      step("lift", "Pusta kabina wraca na dół.", { height: 0, scene: "lower", set: { cargo: "unloaded" } }),
    ];
  }

  function voyage(leaf, crate) {
    const result = [];
    if (leaf) result.push(walk("gardener", "lily", "Ten sam liść może dać cień.", "leaf-approach"),
      grab("gardener", "lily", "Ogrodnik podnosi liść i chwyta łodygę.", "leaf-umbrella"),
      step("hold-leaf", "Liść rozkłada się nad głową.", { scene: "leaf-shade", set: { lilyMoved: true } }));
    result.push(step("craft-prepare", crate ? "Pudełko zmieni się w małą łódkę." : "Liść wystarczy na maleńką tratwę.",
      { scene: "craft-prepare", useCrate: crate, useLeaf: leaf,
        setAtStart: { craftKind: crate ? "crate" : "leaf", crateBoat: crate, crateOpen: crate } }));
    if (crate && leaf) result.push(...carry("maker", "lid", "crate.seat", "To samo wieko staje się siedziskiem.", "craft-seat"),
      step("seat-fit", "Siedzisko opiera się na poprzeczce.", { scene: "seat-fit", set: { lidSeat: true } }));
    if (crate && !leaf) result.push(walk("maker", "lid", "To samo wieko posłuży za wiosło.", "oar-approach"),
      work("maker", "lid", "Z wieka powstaje jedno wiosło.", "oar-carve"),
      step("carve-oar", "Wióry spadają, a wiosło pozostaje na skrzyni.", { scene: "oar-made", set: { oarMade: true } }),
      walk("maker", "lid", "Trzeba podejść do uchwytu wiosła.", "oar-grip-ready"),
      grab("maker", "lid", "Wiosło ma już wygodny uchwyt.", "oar-take"));
    if (crate) result.push(walk("scout", { prop: "crate" }, "Łódkę trzeba przesunąć do brzegu.", "craft-push-ready"),
      step("push", "Dłonie prowadzą skrzynię po ziemi.", { prop: "crate", cast: ["scout"], to: [4.8, 0, 1.1], scene: "craft-push" }),
      step("craft-launch", "Skrzynia zsuwa się na wodę.", { scene: "craft-launch" }));
    if (leaf) result.push(walk("gardener", "shoreLow", "Ogrodnik schodzi po kamiennych stopniach.", "leaf-shore"));
    if (!crate) result.push(step("leaf-launch", "Ogrodnik puszcza liść dopiero nad wodą.", { scene: "leaf-launch", set: { leafFlat: true } }));
    result.push(walk("scout", "shoreLow", "Najpierw trzeba zejść do wody.", "craft-shore"),
      step("craft-board", "Ręce chwytają burtę podczas wsiadania.", { scene: "craft-board" }));
    if (crate && leaf) result.push(step("leaf-pass", "Ogrodnik podaje łodygę podróżnikowi.", { scene: "leaf-pass" }),
      step("leaf-fit", "Łodyga trafia w uchwyt masztu.", { scene: "sail-fit", set: { leafSail: true } }));
    if (crate && !leaf) result.push(walk("maker", "shoreLow", "Wiosło musi dotrzeć do podróżnika.", "oar-shore"),
      step("oar-pass", "Wiosło przechodzi z dłoni do dłoni.", { scene: "oar-pass" }));
    result.push(step("craft-voyage", "Na horyzoncie ktoś zauważył wyprawę.", { scene: "trade-sail" }),
      step("trade-stand", "Podróżnik wstaje, żeby odebrać podarunek.", { scene: "trade-stand" }),
      step("gift-ready", "Kupiec podnosi woreczek z pokładu.", { scene: "gift-ready" }),
      step("gift-take", "Podarunek jest bezpiecznie w dłoniach.", { scene: "gift-take" }));
    if (crate && !leaf) result.push(step("oar-stow", "Wiosło trafia w uchwyty na burcie.", { scene: "oar-stow" }));
    result.push(
      step("gift-exchange", "Podarunek przechodzi z rąk do rąk.", { scene: "trade-exchange" }),
      step("trade-sit", "Podarunek jest już bezpieczny.", { scene: "trade-sit" }),
      step("craft-return", "Jest z czym wrócić do ogrodnika.", { scene: "trade-return" }),
      step("craft-land", "Najpierw trzeba bezpiecznie wysiąść.", { scene: "craft-land" }),
      walk("scout", "gift.garden", "Nasiona są niesione do ogrodnika.", "gift-carry", "heavy"),
      put("scout", "gift", "gift.garden", "Podpora przy grządce przejmuje woreczek.", "gift-return"),
      walk("gardener", "gift.garden", "Ogrodnik ogląda nowe nasiona.", "gift-gardener"),
      work("gardener", "gift", "Nowe nasiona rozpoczynają następną historię.", "gift-open"),
      step("gift-return", "Wyprawa wróciła z podarunkiem.", { scene: "gift-finish",
        set: { giftReturned: true, tradeDone: true, sailing: false } }));
    return result;
  }

  function start(action) {
    if (action.setAtStart) Object.assign(island2Story, action.setAtStart);
    const render = island2Renderer;
    if (action.sound && island2CanAnimate()) playSound(action.sound);
    switch (action.action) {
      case "place": island2Visual[action.id] = 1; return render.fall(action.id === "timber" ? "crate" : action.id);
      case "walk": return render.walk(action.actor, action.to, action.gait);
      case "work": return render.work(action.actor, action.mode, action.target, action.duration);
      case "pose": return render.pose(action.actor, action.mode, action.duration);
      case "grab": return render.pickup(action.actor, action.prop);
      case "put": return render.deposit(action.actor, action.prop, action.to);
      case "cast": return Math.max(...action.cast.map((entry) => render.walk(entry.actor, entry.to)));
      case "push": return render.push(action.prop, action.cast, action.to, action.rotation);
      case "excavate": return render.excavate();
      case "upgrade": return render.upgrade(action.id, action.level, action.duration);
      case "lift": return render.lift(action.height);
      case "grip": return render.gripProfile(action.prop, action.profile);
      default: return render.storyAction(action);
    }
  }

  function commit(action) {
    if (action.set) Object.assign(island2Story, action.set);
    if (action.id === "copper" && action.level >= 2) island2Story.magnetTaken = true;
    if (action.prop === "lamp" && action.action === "put" && action.to === "tower.light") island2Story.lampRaised = true;
  }

  return { turn, start, commit, newStory };
})();
