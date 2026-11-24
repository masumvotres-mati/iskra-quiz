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
      { prop, actor, direction, to, support, key: `${prefix}-carry` }),
    scene("prop-put", "Dopiero podpora przejmuje ciężar.", 650,
      { prop, actor, direction, to, support, key: `${prefix}-setdown` }),
  ];
  const fitLamp = () => [
    ...supportSteps("i2-lamp", "maker", island2Layout.cabinBase, "lamp-load", 1, "cabin"),
    scene("prop-lift", "Kabina podaje lampę do górnego podestu.", 1600),
    ...supportSteps("i2-lamp", "maker", island2Layout.lamp, "lamp-upper", -1, "light"),
  ];
  const unloadCargo = () => [
    { kind: "unload", text: "Dźwig podnosi paczkę ze statku, obraca ramię i odkłada ładunek w kabinie.", duration: 2300 },
    ...supportSteps("i2-cargo", "maker", island2Layout.cargoLanding, "cargo-unload", -1),
  ];
  const parkOar = () => {
    island2Story.oarResting = true;
    island2Renderer.follow("i2-crate-lid", "i2-crate", [6, -6], { depthBias: 3, blend: 350 });
  };

  function walk(step, role, destination, mode, work = 700, direction, gait) {
    const travel = Math.ceil(island2Renderer.actor(role, destination, false, 0,
      { gait, facing: gait === "heavy" ? direction : undefined }));
    island2Renderer.act(role, mode, work, travel, direction);
    step.duration = Math.max(step.duration, travel + work);
    return travel;
  }

  function destination(step) {
    return step.support === "stone" ? island2Renderer.supportPoint("i2-cover", [0, -5], true) : step.to;
  }

  function polish(step, role) {
    const stone = point("i2-cover");
    const travel = walk(step, role, [stone[0] + 23, stone[1] + 4], "polish", 1000, -1);
    island2Renderer.entities.get(`i2-person-${role}`).workGrip =
      { prop: "i2-glass", kind: "polish", start: performance.now() + travel };
  }

  const shovelPickup = () => [
    scene("shovel-approach", "Mieszkaniec podchodzi po łopatę.", 250),
    scene("shovel-take", "Chwyta drewniany trzonek.", 450),
  ];

  function afterPlacement(id) {
    if (id === "seeds") return [
      ...shovelPickup(),
      scene("field-ready", "Łopata przyda się do przygotowania ziemi.", 550),
      scene("field-dig", island2State.branches.seeds === "pond"
        ? "W mokrej ziemi powstaje niecka. Do kanału potrzebny będzie jeszcze następny ruch."
        : "Mieszkaniec przekopuje grządkę i dosiewa ziarna z zapasów. Kanał może wykopać dopiero później.", 1400,
        { caption: island2State.branches.seeds === "pond" ? "Tu jest mokro. Powstaje niecka."
          : "Najpierw grządka i zasiew. Kanał najwcześniej w następnym ruchu." }),
      scene("shovel-return", "Gotowe. Narzędzie wraca obok grządki.", 450),
      scene("shovel-put", "Łopata czeka na kolejne zadanie.", 450),
    ];
    if (id === "timber" && !island2Story.workshopOpen) return [
      scene("workshop-notice", "Po stuknięciu skrzyni ktoś odpowiada zza zablokowanych drzwi!", 850,
        { caption: "Stuk, stuk… Ktoś jest za kamieniem!" }),
      scene("source-ready", "Mieszkaniec podchodzi do kamienia zasłaniającego wyjście.", 400),
      scene("source-push", "Powstaje szczelina. Uwięziony majster może wyjść i pomóc.", 850),
      scene("source-team-ready", "Teraz pchają razem.", 500),
      scene("source-team", "Płyta staje się ławą roboczą, a majster zostaje przy warsztacie.", 1350),
    ];
    return [];
  }

  function grow(change, branches) {
    const key = `${change.id}-${change.level}`;
    if (key === "wheel-2") return [
      scene("wheel-assess", branches.wheel === "pottery"
        ? "Obok stolika nie płynie jeszcze strumień. Przy źródle jest za to mokra glina."
        : "Mieszkaniec zauważa strumień obok stolika. Woda może poruszać łopatki.", 650,
      { pottery: branches.wheel === "pottery", caption: branches.wheel === "pottery"
        ? "Bez nurtu — ręczne koło garncarskie." : "Jest nurt — można dodać łopatki!" }),
      ...supportSteps("i2-tea", "scout", [340, 382], "tea-save", 1, "bench"),
      ...(branches.wheel === "pottery" ? [
        scene("pottery-clay-approach", "Mieszkaniec idzie po mokrą glinę z brzegu źródła.", 250,
          { caption: "Przy źródle jest mokra glina." }),
        scene("pottery-clay-take", "Podnosi miękką bryłę obiema dłońmi.", 500),
        scene("pottery-clay-carry", "Glina jedzie na ten sam drewniany blat.", 250),
        scene("pottery-clay-set", "Bryła spoczywa na stoliku, nie w powietrzu.", 550),
      ] : []),
      scene("wheel-team-ready", "Najpierw dłonie pod blat. Razem będzie łatwiej.", 300,
        { pottery: branches.wheel === "pottery" }),
      scene("wheel-build", branches.wheel === "pottery" ? "Dłonie podnoszą ścianki glinianego naczynia."
        : "Ten sam blat obraca się, nogi składają, a łopatki rozkładają po kolei.", 1700,
        { pottery: branches.wheel === "pottery" }),
      scene("wheel-place", branches.wheel === "pottery"
        ? "Ręczne koło zostaje na suchym brzegu. Późniejszy kanał nie zmieni jego zadania."
        : "Gotowe łopatki trafiają w nurt i woda wprawia koło w ruch.", 1000),
      reveal(change, branches.wheel === "pottery" ? "Koło garncarskie jest gotowe." : "Strumień porusza łopatki koła."),
    ];
    if (key === "timber-3") return [
      scene("cabin-ready", "Skrzynia przyda się jeszcze raz.", 400),
      scene("cabin-move", "Mieszkaniec prowadzi skrzynię pod prowadnice.", 1200),
      scene("cabin-build", "Wieko unosi się na słupkach, a konstrukcja wyrasta od podstawy.", 1900),
      reveal(change, "Ta sama skrzynia pracuje teraz jako kabina."),
    ];
    if (key === "glass-2" || key === "glass-3") {
      const actor = key === "glass-2" ? "scout" : "maker";
      return [...supportSteps("i2-glass", actor, island2Layout.glassRough, key, -1, "stone"),
        scene("glass-polish-contact", "Szklany krążek leży płasko na powierzchni szlifowania.", 1000,
          { actor, rough: key === "glass-2" }),
        ...(key === "glass-3" ? supportSteps("i2-glass", actor, island2Layout.glassReady, "glass-ready", -1, "rack") : []),
        reveal(change, key === "glass-2" ? "Brzeg szkła jest wyrównany." : "Soczewka jest gotowa do przeniesienia.")];
    }
    if (key === "glass-4") return [
      ...supportSteps("i2-glass", "maker", island2LoadPoint(island2Layout.cabinBase), "glass-load", 1, "cabin"),
      scene("prop-lift", "Soczewka spoczywa w uchwycie kabiny, a lina ją podnosi.", 1600),
      ...supportSteps("i2-glass", "scout", island2Layout.glassTop, "glass-upper", -1, "optic"),
      reveal(change, "Soczewka jest osadzona w latarni."),
    ];
    if (key === "water-2") return [
      scene("source-brace-fetch", "Majster bierze drewno ze skrzyni, żeby umocnić źródło.", 400,
        { actor: "maker", carry: "planks" }),
      scene("source-brace-carry", "Przenosi podpory do źródła. Samo źródło nie wykopuje kanału.", 250,
        { actor: "maker", carry: "planks" }),
      scene("source-brace", "Drewniane wsporniki trzymają brzeg. Do strumienia nadal potrzebna jest łopata.", 900,
        { actor: "maker", carry: "planks" }),
      reveal(change, "Brzeg źródła jest umocniony."),
    ];
    if (key === "water-3") return [
      scene("source-control-ready", "Kanał już płynie. Lina pozwoli podnosić zastawkę.", 300),
      scene("source-control", "Majster ciągnie linę. Zastawka unosi się i wraca na miejsce.", 1200),
      reveal(change, "Przepływ jest pod kontrolą."),
    ];
    if (key === "seeds-2") return [
      ...shovelPickup(),
      scene("source-channel-ready", "Teraz można wyprowadzić wodę ze źródła.", 400,
        { caption: "Jest źródło. Łopata wyznaczy kanał." }),
      scene("source-channel", "Łopata otwiera kanał, a woda podąża za mieszkańcem.", 2800,
        { caption: "Jest źródło. Łopata wyznacza kanał." }),
      scene("source-clue", "Pod nowym wykopem osypuje się ziemia. W odsłoniętej wnęce błyszczy metal!", 1000,
        { caption: "Wykop odsłonił metal w ścianie wyspy!" }),
      scene("source-fall", "Woda dociera do krawędzi i spada do zatoki!", 800,
        { caption: "Pod kanałem błyszczy metal — warto to zapamiętać." }),
      scene("shovel-bank-return", "Mieszkaniec wraca suchym brzegiem i odnosi łopatę.", 2600,
        { caption: branches.wheel === "pottery" ? "Gotowe koło garncarskie zostaje na suchym brzegu." : "" }),
      scene("shovel-put", "Kanał już płynie. Łopata może odpocząć.", 450),
      reveal(change, branches.seeds === "pond" ? "Woda napełnia mokrą nieckę — powstaje staw." : "Kanał nawadnia przygotowaną grządkę."),
    ];
    if (key === "copper-2") return [
      scene("magnet-peer", "Do drutu przyda się zauważony wcześniej metal. Mieszkaniec wraca do odsłoniętej wnęki.", 600,
        { caption: "Drut już jest. Wróćmy po zauważony magnes." }),
      scene("magnet-crawl", "Przejście za warsztatem prowadzi do widocznego znaleziska — nie trzeba kopać kolejnej dziury.", 400),
      scene("magnet-take", "Magnes! Teraz drut ma z czym współpracować.", 650, { actor: "scout", carry: "magnet" }),
      scene("magnet-return", "Znalazca niesie część do majsterkowicza.", 500, { actor: "scout", carry: "magnet" }),
      scene("magnet-connect", "Ty trzymaj magnes, ja nawinę drut.", 950, { actor: "scout", carry: "magnet" }),
      reveal(change, "Zwojnica i magnes są już połączone."),
    ];
    if (key === "copper-3") return [
      scene("wire-approach", "Majster podchodzi do zacisku prądnicy.", 350),
      scene("wire-source", "Przykręca przewód do zacisku. Drugi koniec zostaje w dłoni.", 650),
      scene("wire-carry", "Wnosi wolny koniec przewodu na galerię latarni.", 350),
      scene("wire-plug", "Dłonie osadzają końcówkę w górnym zacisku.", 850),
      scene("wire-seat", "Oba końce są zamocowane. Przewód układa się przy konstrukcji.", 800),
      reveal(change, "Prądnica jest połączona z latarnią."),
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
    const steps = [];
    if (!story.bridgeBuilt && levels.seeds >= 2 && levels.glass >= 3 && levels.rope >= 2) steps.push(
      scene("bridge-ready", "Szlifowanie skończone. Kamienna płyta jest znów wolna.", 650),
      scene("bridge-haul", "Płyta zamiast kolejnej deski? Powstaje mostek nad odpływem!", 1400),
      scene("bridge-approach", "Przejście już gotowe. Zapasy można przenieść nad wodą.", 2200, { actor: "gardener", carry: "food" }),
      scene("bridge-cross", "Suchą nogą na drugą stronę!", 900, { actor: "gardener", carry: "food" }),
      scene("bridge-deliver", "Teraz zapasy mają krótszą drogę do pracowni.", 1700, { actor: "gardener", carry: "food" }),
    );
    if (!story.driveChecked && levels.wheel >= 3 && levels.copper >= 3) steps.push(
      scene("drive-clear", "Majster odsuwa dłonie od obracającego się pasa i sprawdza napęd z boku.", 350),
      scene("drive-check", "Pas wraca drugim biegiem i obejmuje oba koła pasowe.", 1000),
    );
    return steps;
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
    if (leaf) steps.push(scene("leaf-reach", "Mieszkaniec przykuca na brzegu i sięga po łodygę.", 400),
      scene("leaf-pick", "Nie tylko ozdoba stawu. Ten liść może dać cień!", 850),
      scene("leaf-shelter", "Parasol na chwilę. A za chwilę…", 600));
    if (leaf && !crate) steps.push(
      scene("leaf-receiver", "Drugi mieszkaniec podchodzi po liść od strony suchego brzegu.", 400),
      scene("leaf-offer", "Ogrodnik opuszcza liść, żeby bezpiecznie podać łodygę.", 650),
    );
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
      scene("trade-moor", "Łódki podpływają burta w burtę. Paczka czeka na pokładzie.", 1000),
      scene("trade-exchange", "Gliniane formy albo zielony podarunek za nowe nasiona.", 950));
    if (crate && !leaf) steps.push(scene("gift-stow", "Paczka spoczywa na skrzyni. Dłonie są znów wolne do wiosłowania.", 650));
    steps.push(scene("trade-return", "Teraz jest z czym wrócić do ogrodnika.", 2300));
    if (crate && !leaf) steps.push(scene("gift-retrieve", "Przy brzegu mieszkaniec odkłada wiosło i zabiera paczkę.", 650));
    steps.push(
      scene("craft-land", "Ładunek trzeba jeszcze dostarczyć.", 900),
      scene("gift-return", "Nowe nasiona! Jedna wyprawa daje początek kolejnej historii.", 900));
    return steps;
  }

  function start(step) {
    const story = island2Story;
    const name = step.scene;
    if (name === "shovel-approach") {
      walk(step, "gardener", [97, 344], "offer", 250, 1);
    } else if (name === "shovel-take") {
      story.usingShovel = "gardener";
      island2Renderer.act("gardener", "offer", step.duration, 0, 1);
      island2Renderer.follow("i2-shovel", "i2-person-gardener", [0, 0], { hand: true, blend: 350 });
      island2Renderer.turnShovel(-35);
    } else if (name === "field-ready") {
      island2Renderer.perform("gardener", [[97, 344], [135, 350]], step.duration, "walk");
    } else if (name === "field-dig") {
      story.fieldWorking = true;
      renderIsland2();
      island2Renderer.act("gardener", "dig", step.duration, 0, 1);
      island2Renderer.digField(step.duration);
      sound("island-effort");
    } else if (name === "shovel-return") {
      island2Renderer.perform("gardener", [[135, 350], [97, 344]], step.duration, "walk");
    } else if (name === "shovel-bank-return") {
      island2Renderer.perform("gardener", [...island2Water.bankPath].reverse()
        .concat([[217, 347], [156, 361], [97, 344]]), step.duration, "walk");
    } else if (name === "shovel-put") {
      island2Renderer.act("gardener", "offer", step.duration, 0, 1);
      island2Renderer.follow("i2-shovel", "i2-person-gardener", [0, 0],
        { hand: true, to: island2Work.shovelRest, blend: 300 });
      island2Renderer.turnShovel(-15);
    } else if (name === "workshop-notice") {
      story.knocking = true;
      renderIsland2();
      walk(step, "scout", [368, 383], "look", 850, -1);
      island2Renderer.knockDoor(step.duration);
      sound("island2-knock");
    } else if (name === "source-brace-fetch") {
      walk(step, "maker", [405, 401], "offer", 400, 1);
      island2Carry("planks", [], 1);
    } else if (name === "source-brace-carry") {
      walk(step, "maker", at("spring"), "offer", 250, 1, "heavy");
      island2Carry("planks", [], 1);
    } else if (name === "source-brace") {
      story.sourceBracing = true;
      renderIsland2();
      island2Carry("planks", [], 1);
      island2Renderer.act("maker", "repair", step.duration, 0, 1);
      island2Renderer.braceSource(step.duration);
      sound("island-effort");
    } else if (name === "source-control-ready") {
      walk(step, "maker", at("spring"), "offer", 300, 1);
    } else if (name === "source-control") {
      story.sourceControlling = true;
      renderIsland2();
      island2Renderer.act("maker", "pull", step.duration, 0, 1);
      island2Renderer.entities.get("i2-person-maker").workGrip = { prop: "i2-valve-cord", kind: "valve" };
      island2Renderer.operateSluice(step.duration);
    } else if (name === "wheel-assess") {
      walk(step, "scout", step.pottery ? at("teaLeft") : [205, 383], "look", 650, 1);
    } else if (name === "pottery-clay-approach") {
      walk(step, "scout", [224, 366], "offer", 250, -1);
    } else if (name === "pottery-clay-take") {
      story.clayTaken = true;
      renderIsland2();
      island2Renderer.act("scout", "offer", step.duration, 0, -1);
      island2Renderer.follow("i2-clay", "i2-person-scout", [0, 0], { hand: true, blend: 400 });
    } else if (name === "pottery-clay-carry") {
      walk(step, "scout", [263, 392], "offer", 200, -1, "heavy");
    } else if (name === "pottery-clay-set") {
      island2Renderer.act("scout", "offer", step.duration, 0, -1);
      island2Renderer.follow("i2-clay", "i2-person-scout", [0, 0],
        { hand: true, to: [244, 374], blend: 500 });
    } else if (name === "prop-approach" || name === "prop-carry") {
      const location = name === "prop-approach" ? point(step.prop) : destination(step);
      const offset = step.prop === "i2-lamp" ? [-8, 12] : step.prop === "i2-tea" ? [-10, 34] : [0, 0];
      const reach = island2Renderer.carryOffset(step.prop, step.direction, offset);
      const stone = point("i2-cover");
      const onStone = step.prop === "i2-glass" && (name === "prop-approach"
        ? story.glassSupport === "stone" : step.support === "stone");
      const feet = onStone ? [stone[0] + 23, stone[1] + 4]
        : location[1] < 260 ? at(name === "prop-approach" ? "upperLoad" : "lantern")
          : location[1] < 300 && name === "prop-approach" ? at("balcony")
            : location.map((n, i) => n - reach[i]);
      walk(step, step.actor, feet, location[1] < 300 && name === "prop-approach" ? "kneel" : "offer",
        150, step.direction, name === "prop-carry" ? "heavy" : "walk");
    } else if (name === "prop-take") {
      island2Renderer.act(step.actor, point(step.prop)[1] < 300 ? "kneel" : "offer", step.duration, 0, step.direction);
      if (step.prop === "i2-glass") {
        story.glassHeld = true;
        element("i2-glass-shadow").style.display = "none";
        island2Renderer.turnGlass("x");
      }
      island2Renderer.follow(step.prop, `i2-person-${step.actor}`, step.prop === "i2-lamp" ? [-8, 12] : step.prop === "i2-tea" ? [-10, 34] : [0, 0],
        { hand: true, blend: 600 });
    } else if (name === "prop-put") {
      step.to = destination(step);
      island2Renderer.act(step.actor, step.to[1] < 260 ? "kneel" : "offer", step.duration, 0, step.direction);
      if (step.prop === "i2-glass" && step.support === "stone") island2Renderer.turnGlass("ground");
      island2Renderer.follow(step.prop, `i2-person-${step.actor}`, [0, 0],
        { hand: true, to: step.to, blend: 600 });
    } else if (name === "wheel-team-ready") {
      walk(step, "scout", [220, 392], "kneel", 300, 1);
      walk(step, "maker", step.pottery ? [267, 392] : [275, 399], step.pottery ? "shape" : "kneel", 300, -1);
    } else if (name === "wheel-build") {
      for (const [role, side] of [["scout", -1], ["maker", 1]]) {
        island2Renderer.act(role, step.pottery ? role === "maker" ? "shape" : "push" : "offer",
          step.pottery && role === "scout" ? 350 : step.duration, 0, side === -1 ? 1 : -1);
        island2Renderer.entities.get(`i2-person-${role}`).workGrip = step.pottery && role === "maker"
          ? { prop: "i2-pottery", kind: "pottery" } : { prop: "i2-tabletop", side };
      }
      island2Renderer.buildWheel(step.duration, 0, step.pottery);
      sound("island-effort");
    } else if (name === "wheel-place") {
      if (island2State.branches.wheel === "pottery") {
        island2Renderer.act("maker", "shape", step.duration, 0, -1);
        island2Renderer.entities.get("i2-person-maker").workGrip = { prop: "i2-pottery", kind: "pottery" };
        return;
      }
      const a = island2Layout.wheelRest;
      const b = island2Layout.wheelDrive;
      island2Move("i2-wheel", [a, [244, 409], b], step.duration);
      for (const [role, start, side] of [["scout", [220, 392], -1], ["maker", [275, 399], 1]]) {
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
      polish(step, step.actor);
    } else if (name === "source-ready") {
      walk(step, "scout", [368, 383], "look", 400, -1);
    } else if (name === "source-push") {
      island2Renderer.perform("scout", [[368, 383], [349, 389]], 850, "push", 0, -1);
      island2Move("i2-cover", [island2Layout.coverHome, [322, 386]], 850);
      sound("island-effort");
    } else if (name === "source-team-ready") {
      walk(step, "scout", [348, 389], "look", 500, -1);
      walk(step, "maker", [345, 409], "look", 500, -1);
    } else if (name === "source-team") {
      island2Renderer.perform("scout", [[348, 389], [318, 409]], 1300, "push", 0, -1);
      island2Renderer.perform("maker", [[345, 409], [315, 429]], 1300, "push", 0, -1);
      island2Move("i2-cover", [[322, 386], island2Layout.coverBench], 1300);
      island2Renderer.turnStone(true, false, 450, 850);
    } else if (name === "source-channel-ready") {
      island2Renderer.perform("gardener", [[97, 344], [156, 361], [217, 347], island2Water.bankPath[0]],
        1100, "walk");
      step.duration = 1100;
      island2Renderer.turnShovel(35);
    } else if (name === "source-channel") {
      story.channelDug = true;
      renderIsland2();
      island2Renderer.perform("gardener", island2Water.bankPath, step.duration, "channel");
      island2Renderer.digChannel(step.duration);
      sound("island2-flow");
    } else if (name === "source-clue") {
      story.cutawayOpen = true;
      renderIsland2();
      island2Renderer.act("gardener", "kneel", step.duration, 0, -1);
      island2Renderer.revealCutaway(step.duration, () => sound("island-discover"));
    } else if (name === "source-fall") {
      story.waterfallStarted = true;
      renderIsland2();
      island2Renderer.fillFall(step.duration);
      island2Renderer.act("gardener", "offer", step.duration, 0, -1);
    } else if (name === "magnet-peer") {
      walk(step, "scout", at("inside"), "kneel", 600, -1);
      sound("island-notice");
    } else if (name === "magnet-crawl") {
      walk(step, "scout", at("tunnel"), "crawl", 400, 1);
    } else if (name === "magnet-take") {
      island2Renderer.act("scout", "crawl", 650, 0, 1);
      story.magnetHeld = true;
      island2Renderer.follow("i2-magnet", "i2-person-scout", [0, 0], { hand: true, blend: 450 });
      sound("island-discover");
    } else if (name === "magnet-return") {
      walk(step, "scout", at("generator"), "offer", 500, -1, "heavy");
    } else if (name === "magnet-connect") {
      const travel = walk(step, "maker", [island2Layout.copper[0] - 28, island2Layout.copper[1] + 3], "repair", 950, 1);
      island2Renderer.act("scout", "offer", travel + 950, 0, -1);
      island2Renderer.follow("i2-magnet", "i2-person-scout", [0, 0],
        { hand: true, to: island2Layout.copper, blend: travel + 950, support: "i2-copper" });
      island2Renderer.growMagnet(700, travel + 200);
      island2Renderer.entities.get("i2-person-maker").workGrip =
        { prop: "i2-generator", kind: "generator", start: performance.now() + travel };
      element("i2-generator").style.display = "";
      element("i2-generator-base").style.display = "";
      island2Animate("i2-generator", [{ opacity: 0 }, { opacity: 1 }], 700, "ease-in-out", travel + 200);
      island2Animate("i2-generator-base", [{ opacity: 0 }, { opacity: 1 }], 700, "ease-in-out", travel + 200);
      island2Animate("i2-loose-coil", [{ opacity: 1 }, { opacity: 0 }], 700, "ease-in-out", travel + 200);
    } else if (name === "drive-clear") {
      walk(step, "maker", [386, 405], "look", 350, -1);
    } else if (name === "drive-check") {
      island2Renderer.act("maker", "look", step.duration, 0, -1);
    } else if (name === "wire-approach") {
      walk(step, "maker", at("generator"), "kneel", 350, -1);
    } else if (name === "wire-source") {
      story.wireLaying = true;
      story.wireHeld = "maker";
      renderIsland2();
      island2Renderer.act("maker", "kneel", step.duration, 0, -1);
      island2Renderer.entities.get("i2-person-maker").workGrip = { prop: "i2-wire-lead", kind: "wire", end: false };
    } else if (name === "wire-carry") {
      walk(step, "maker", at("lantern"), "look", 350, -1);
    } else if (name === "wire-plug") {
      island2Renderer.act("maker", "kneel", step.duration, 0, -1);
      island2Renderer.entities.get("i2-person-maker").workGrip = { prop: "i2-wire-lead", kind: "wire", end: true };
    } else if (name === "wire-seat") {
      story.wireHeld = "";
      island2Renderer.seatWire(step.duration);
    } else if (name === "bridge-ready") {
      walk(step, "scout", [315, 420], "look", 650, -1);
      walk(step, "maker", at("workshop"), "look", 650, -1);
      sound("island-notice");
    } else if (name === "bridge-haul") {
      story.tether = "scout";
      island2Renderer.perform("scout", [[315, 420], [314, 444]], 1400, "pull", 0, -1);
      island2Renderer.act("maker", "look", 1400, 0, -1);
      island2Move("i2-cover", [island2Layout.coverBench, island2Layout.coverBridge], 1400);
      island2Renderer.turnStone(true, true, 1000, 400);
      sound("island-effort");
    } else if (name === "bridge-approach") {
      const path = [point("i2-person-gardener"), at("wheel"), [236, 402], [269, 420], at("bridge")];
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
      polish(step, island2Visual.water >= 2 ? "maker" : "scout");
    } else if (name === "leaf-grow") {
      walk(step, "gardener", at("pondEdge"), "look", 1200, 1);
      island2Renderer.growLeaf(1000);
      const glass = point("i2-glass");
      element("i2-reflection").style.display = "";
      element("i2-reflection").setAttribute("d", `M${glass.join(" ")} ${island2Layout.fish.join(" ")}`);
      island2Animate("i2-reflection", [{ opacity: 0 }, { opacity: .8 }, { opacity: 0 }], 1100);
      sound("island-discover");
    } else if (name === "forms-bundle") {
      const makerTravel = walk(step, "maker", at("potter"), "repair", 1300, -1);
      const gardenerTravel = walk(step, "gardener", [220, 392], "offer", 900, 1);
      island2Renderer.entities.get("i2-person-maker").workGrip =
        { prop: "i2-pottery", kind: "pottery", start: performance.now() + makerTravel };
      island2Renderer.entities.get("i2-person-gardener").workGrip =
        { prop: "i2-tabletop", side: -1, start: performance.now() + gardenerTravel };
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
    } else if (name === "leaf-reach") {
      walk(step, "gardener", at("pondEdge"), "reach", 400, 1);
    } else if (name === "leaf-pick") {
      story.lilyMoved = true;
      island2Renderer.act("gardener", "reach", step.duration, 0, 1);
      element("i2-lily-contact").style.display = "none";
      element("i2-lily-stem").style.display = "";
      island2Renderer.follow("i2-lily", "i2-person-gardener", island2Leaf.carry, { hand: true, blend: 600 });
    } else if (name === "leaf-shelter") {
      island2Renderer.act("gardener", "shelter", step.duration, 0, 1);
      island2Renderer.follow("i2-lily", "i2-person-gardener", island2Leaf.carry, { hand: true, blend: 600 });
    } else if (name === "leaf-receiver") {
      walk(step, "scout", at("receiver"), "shelter", 400, -1);
    } else if (name === "leaf-offer") {
      island2Renderer.act("gardener", "offer", step.duration, 0, 1);
      island2Renderer.follow("i2-lily", "i2-person-gardener", island2Leaf.carry, { hand: true, blend: 450 });
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
        island2Renderer.follow("i2-lily", "i2-person-scout", island2Leaf.carry, { hand: true, blend: 450 });
        island2Renderer.act("scout", "shelter", 1100, 0, -1);
      }
    } else if (name === "craft-ready") {
      if (story.craftKind === "crate") {
        walk(step, "scout", [405, 401], "push", 600, 1);
        if (story.leafSail) island2Renderer.follow("i2-lily", "i2-person-gardener", island2Leaf.carry, { hand: true, blend: 400 });
        else walk(step, "maker", at("shore"), "offer", 600, -1);
      } else walk(step, "scout", at("shore"), "shelter", 600, 1, "umbrella");
    } else if (name === "craft-launch") {
      if (story.craftKind === "crate") {
        story.crateBoat = true;
        story.craftPoint = [...island2Layout.craftShore];
        island2Renderer.move("i2-crate", [island2Layout.crateRest, [524, 372], island2Layout.craftShore],
          step.duration, [0, .6, 1], { ballistic: true, plane: "sea-front" });
        island2Renderer.perform("scout", [[405, 401], [497, 382]], 900, "push", 0, 1, "front", "idle");
      } else {
        story.leafFlat = true;
        island2Renderer.release("i2-lily");
        const origin = point("i2-lily");
        island2Renderer.move("i2-lily", [origin, island2Layout.craftShore],
          step.duration, [0, 1], { ballistic: true, plane: "sea-front" });
        island2Renderer.act("scout", "offer", 450, 0, 1);
        story.leafPoint = [...island2Layout.craftShore];
      }
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
      island2Renderer.raiseLeafSail(750);
      sound("island-discover");
    } else if (name === "trade-sail" || name === "trade-return") {
      if (name === "trade-return" && story.oarMade && story.oarResting) {
        story.oarResting = false;
        island2Renderer.follow("i2-crate-lid", "i2-person-scout", [0, 0], { hand: true, blend: 350, depthBias: 3 });
      }
      const craft = story.craftKind === "crate" ? "i2-crate" : "i2-lily";
      const destination = name === "trade-sail" ? island2Layout.craftSea : island2Layout.craftShore;
      island2Move(craft, [point(craft), island2Sea([565, 556]), destination], 2200, undefined, 0, "sea-front");
      if (story.craftKind === "crate") story.craftPoint = [...destination];
      else story.leafPoint = [...destination];
      if (name === "trade-sail") {
        story.boatSeen = true;
        element("i2-boat").style.display = "";
        island2Move("i2-boat", [story.boat, island2Sea([612, 390]), island2Sea([612, 510]), island2Sea([589, 551])], 2300);
        story.boat = island2Sea([589, 551]);
      } else {
        island2Move("i2-boat", [point("i2-boat"), island2Sea([612, 510]), island2Sea([612, 390]), island2Layout.boatWaiting], 2200);
        story.boat = [...island2Layout.boatWaiting];
      }
    } else if (name === "trade-moor") {
      const craft = story.craftKind === "crate" ? "i2-crate" : "i2-lily";
      const destination = island2Sea([528, story.craftKind === "crate" ? 588 : 575]);
      const boat = island2Sea([579, 567]);
      island2Move(craft, [point(craft), destination], step.duration, undefined, 0, "sea-front");
      island2Move("i2-boat", [point("i2-boat"), boat], step.duration);
      if (story.craftKind === "crate") story.craftPoint = [...destination];
      else story.leafPoint = [...destination];
      story.boat = [...boat];
      island2Renderer.act("scout", "sit", step.duration, 0, 1);
      if (story.oarMade) parkOar();
      story.giftSeen = true;
      element("i2-gift").style.display = "";
      island2Renderer.follow("i2-gift", "i2-boat", island2Layout.giftOnBoat, { depthBias: 1 });
    } else if (name === "trade-exchange") {
      island2Renderer.act("scout", "sit", step.duration, 0, 1);
      island2Renderer.follow("i2-gift", "i2-person-scout", [0, 0], { hand: true, blend: 500 });
      sound("island-discover");
    } else if (name === "gift-stow") {
      island2Renderer.act("scout", "sit", step.duration, 0, 1);
      island2Renderer.follow("i2-gift", "i2-person-scout", [0, 0],
        { hand: true, to: point("i2-crate").map((n, i) => n + island2Layout.giftOnCrate[i]), blend: 450 });
    } else if (name === "gift-retrieve") {
      parkOar();
      island2Renderer.act("scout", "sit", step.duration, 0, 1);
      island2Renderer.follow("i2-gift", "i2-person-scout", [0, 0], { hand: true, blend: 450 });
    } else if (name === "craft-land") {
      island2Renderer.release("i2-person-scout");
      const origin = point("i2-person-scout");
      island2Renderer.perform("scout", [origin, at("shore")], 900, "climb", 0, -1, "front");
      if (story.oarMade) story.oarStowed = true;
      walk(step, "gardener", at("farm"), "offer", 900, 1);
    } else if (name === "gift-return") {
      walk(step, "scout", [170, 372], "offer", 900, -1, "heavy");
      walk(step, "gardener", [151, 372], "offer", 900, 1);
      walk(step, "maker", island2State.branches.wheel === "pottery" ? at("potter") : at("workshop"), "repair", 700, -1);
    } else throw new Error(`Nieznana scena wyspy: ${name}`);
  }

  function commit(step) {
    const story = island2Story;
    if (step.scene === "prop-take" && step.prop === "i2-glass") {
      story.glassPlane = "x";
      island2Renderer.discPlane("i2-glass", "x");
    }
    if (step.scene === "prop-put") {
      island2Renderer.release(step.prop);
      island2Position(step.prop, step.to);
      if (step.prop === "i2-glass") {
        story.glassHeld = false;
        story.glassPoint = [...step.to];
        story.glassSupport = step.support;
        story.glassPlane = step.support === "stone" ? "ground" : "x";
        island2Renderer.discPlane(step.prop, story.glassPlane);
        const support = { stone: "i2-cover", rack: "i2-glass-stand", cabin: "i2-crate" }[step.support];
        if (support) {
          island2Renderer.follow("i2-glass", support, [0, step.support === "stone" ? -5 : -14],
            { surface: step.support === "stone", depthBias: 2 });
          island2Renderer.follow("i2-glass-shadow", support, [0, 0],
            { surface: step.support === "stone", depthBias: 1 });
        }
        if (step.support === "optic") island2Visual.glass = 4;
      }
      if (step.prop === "i2-lamp") story.lampPoint = [...step.to];
      if (step.prop === "i2-tea") { story.teaStored = true; story.teaPoint = [...step.to]; }
      if (step.prop === "i2-cargo") story.cargo = "unloaded";
      if (step.support === "cabin" && step.prop !== "i2-glass") island2Renderer.follow(step.prop, "i2-crate", [0, 0], { depthBias: 1 });
      if (step.prop === "i2-lamp" && step.support === "light") story.lampRaised = true;
      sound("island2-touch");
    }
    switch (step.scene) {
      case "workshop-notice": story.knocking = false; break;
      case "field-dig": story.fieldWorking = false; story.fieldPrepared = true; break;
      case "shovel-put":
        island2Renderer.release("i2-shovel");
        story.shovelPoint = [...island2Work.shovelRest];
        story.usingShovel = "";
        island2Position("i2-shovel", story.shovelPoint);
        break;
      case "source-brace":
        story.sourceBracing = false;
        island2Visual.water = 2;
        break;
      case "source-control":
        story.sourceControlling = false;
        island2Visual.water = 3;
        break;
      case "pottery-clay-set":
        story.clayPoint = [244, 374];
        island2Renderer.follow("i2-clay", "i2-wheel", [0, -26], { depthBias: 1 });
        break;
      case "wheel-build":
        island2Visual.wheel = 2;
        story.wheelPoint = [...island2Layout.wheelRest];
        if (island2State.branches.wheel === "pottery") {
          story.clayUsed = true;
          island2Renderer.release("i2-clay");
        }
        break;
      case "wheel-place":
        story.wheelPoint = [...(island2State.branches.wheel === "pottery"
          ? island2Layout.wheelPottery : island2Layout.wheelDrive)];
        break;
      case "cabin-move": story.cratePoint = [...island2Layout.cabinBase]; break;
      case "cabin-build":
        island2Visual.timber = 3;
        story.cratePoint = undefined;
        story.cabin = [...island2Layout.cabinBase];
        break;
      case "source-push":
        story.workshopOpen = true;
        story.stoneSaved = true;
        story.stonePoint = [322, 386];
        break;
      case "source-team":
        story.stoneFlat = true;
        story.stonePoint = [...island2Layout.coverBench];
        break;
      case "source-channel":
        story.channelFilled = true;
        break;
      case "source-fall":
        story.waterfallLanded = true;
        sound("island-splash");
        break;
      case "magnet-take": story.magnetTaken = true; break;
      case "magnet-connect":
        island2Renderer.release("i2-magnet");
        story.magnetHeld = false;
        island2Visual.copper = 2;
        break;
      case "drive-check": story.driveChecked = true; break;
      case "wire-plug": story.wirePlugged = true; break;
      case "wire-seat":
        story.wireLaying = false;
        island2Visual.copper = 3;
        break;
      case "gift-stow":
        island2Renderer.follow("i2-gift", "i2-crate", island2Layout.giftOnCrate, { depthBias: 3 });
        break;
      case "craft-launch": sound("island-splash"); break;
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

  return { afterPlacement, grow, milestones, preparation, ending, start, commit, scene, fitLamp, unloadCargo };
})();
