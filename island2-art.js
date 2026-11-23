"use strict";

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
    return `<path d="${path([p(-width / 2, -depth / 2, height), p(width / 2, -depth / 2, height),
      p(width / 2, depth / 2, height), p(-width / 2, depth / 2, height)])}" fill="${colors[0]}"/>
      <path d="${path([p(-width / 2, depth / 2, height), p(width / 2, depth / 2, height),
        p(width / 2, depth / 2, 0), p(-width / 2, depth / 2, 0)])}" fill="${colors[1]}"/>
      <path d="${path([p(width / 2, -depth / 2, height), p(width / 2, depth / 2, height),
        p(width / 2, depth / 2, 0), p(width / 2, -depth / 2, 0)])}" fill="${colors[2]}"/>`;
  };
  const disc = (radius, thickness, plane, front, edge, contents = "") => {
    const offset = plane === "ground" ? [0, thickness] : [thickness, -thickness * slope];
    return `<g data-iso-solid="disc" data-iso-plane="${plane}">
      <g transform="translate(${offset.join(" ")})"><g transform="${face(plane)}"><circle r="${radius}" fill="${edge}"/></g></g>
      <g data-iso-face="${plane}" transform="${face(plane)}"><circle r="${radius}" fill="${front}"/>${contents}</g></g>`;
  };
  const cubeGrid = () => {
    const p = (a, b, z) => `${318 + a - b} ${510 + (a + b) * slope - z}`;
    const lines = [];
    for (let i = 1; i < 12; i++) {
      const n = -124 + 248 * i / 12;
      lines.push(`M${p(n, -124, 160)}L${p(n, 124, 160)}L${p(n, 124, 0)}`);
      lines.push(`M${p(-124, n, 160)}L${p(124, n, 160)}L${p(124, n, 0)}`);
    }
    for (let i = 1; i < 8; i++) lines.push(`M${p(-124, 124, i * 20)}L${p(124, 124, i * 20)}L${p(124, -124, i * 20)}`);
    return `<path d="${lines.join("")}" fill="none" stroke="#755536" stroke-width=".8" opacity=".3"/>`;
  };
  return { slope, unit, project, unproject, face, box, disc, cubeGrid };
})();

const island2SceneArtwork = `
<svg viewBox="0 0 640 690" role="img" aria-labelledby="i2-art-title i2-art-description" xmlns="http://www.w3.org/2000/svg">
<title id="i2-art-title">Wyspa małych spraw</title>
<desc id="i2-art-description">Mały świat, w którym mieszkańcy odkrywają przejścia, przerabiają przedmioty i pomagają sobie w nieoczekiwanych zadaniach.</desc>
<defs>
 <clipPath id="i2-cave-mask"><path d="M325 383v-39a15 15 0 0 1 30 0v39Z"/></clipPath>
 <clipPath id="i2-under-mask"><path d="m210 425 80 36v35l-80-36Z"/></clipPath>
 <clipPath id="i2-meadow-mask"><ellipse id="i2-meadow-radius" cx="157" cy="333" rx="0" ry="0"/></clipPath>
 <clipPath id="i2-tower-growth"><rect id="i2-tower-growth-rect" x="425" y="130" width="100" height="250"/></clipPath>
 <g id="i2-magnet-token" fill="none" stroke="#cf836d" stroke-width="6"><path d="M-7 0v-12q7-12 14 0V0"/><path d="M-7-3v5m14-5v5" stroke="#fff1d2" stroke-width="5"/></g>
 <radialGradient id="i2-glow"><stop stop-color="#ffe486" stop-opacity=".65"/><stop offset="1" stop-color="#ffe486" stop-opacity="0"/></radialGradient>
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
 <rect width="640" height="690" fill="#64c8f4"/>
 <path d="m72 515 248 112 248-112 47 14-266 121-277-125Z" fill="#3088a5" opacity=".45"/>
 <g class="i2-waves" stroke="#c3f6ff" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"><path d="M26 535h18m8 88h28m448-80h22m32-55h23M548 327h29M24 337h19"/></g>
</g>
<g id="i2-base-terrain" stroke="#654c30" stroke-width="1.5" stroke-linejoin="round">
 ${island2Iso.box(318, 510, 248, 248, 160, ["#bc9463", "#a58050", "#795d3a"])}
 <path d="M70 350 318 238 566 350 318 462Z" fill="#93dc52" stroke="none" clip-path="url(#i2-meadow-mask)"/>
 ${island2Iso.cubeGrid()}
</g>
<g id="i2-cutaway" stroke="#55735a" stroke-width="3" stroke-linejoin="round"><path d="m208 422 84 38v39l-84-38Z" fill="#78926e"/><path d="m212 428 76 34v30l-76-34Z" fill="#354d43"/><path d="m213 452 73 33" stroke="#b09a68" stroke-width="4"/><path d="m216 434 7 3m55 37 6 3" stroke="#67795d" stroke-width="2.5"/></g>
<g id="i2-magnet"><use href="#i2-magnet-token"/></g>
<g id="i2-middle-walls" stroke="#333027" stroke-width="2" stroke-linejoin="round">
 <ellipse cx="335" cy="374" rx="43" ry="17" fill="#635a35" opacity=".17" stroke="none"/>
 <path d="M296 366v-44q0-25 38-26 40 0 40 26v44l-34 16Z" fill="#e1cf9d"/>
 <path d="M351 307q23 2 23 15v44l-23 11Z" fill="#bfa678"/>
 <ellipse cx="334" cy="313" rx="40" ry="18" fill="#f3e1b5"/>
 <path d="m303 337 13-5m44-3 8 3m-13 28 11-5" fill="none" stroke="#a78d65" stroke-width="1.5"/>
</g>
<g id="i2-cave" stroke="#3d5847" stroke-width="3.5">
 <path d="M325 381v-37a15 15 0 0 1 30 0v37l-15 7Z" fill="#354d43"/>
 <path d="m327 375 13-6 13 6v8l-13 5-13-5Z" fill="#c5a06f" stroke-width="2.5"/>
 <path d="m339 355 12 5v8l-12-5m2 1v10m9-7v9" fill="#e1b779" stroke-width="2.5"/>
</g>
<path id="i2-cave-lip" d="M323 381v-37a17 17 0 0 1 34 0v37" fill="none" stroke="#7f9b83" stroke-width="4"/>
<g id="i2-cover" stroke="#3d5847" stroke-width="3.5" stroke-linejoin="round">
 <g id="i2-cover-panel"><path d="M-17 0v-35q0-18 17-18t17 18v34L0 6Z" fill="#bdcbae"/><path d="m-10-44 7 11-5 13m5-13 13 9" fill="none" stroke="#829b7d" stroke-width="2.5"/></g>
 <g id="i2-stone-bridge-face"><path d="M-23.5-15.675 11.5 .075Q29.5 8.175 29.5 13.275 29.5 18.375 11.5 10.275L-22.5-5.025-29.5-13.275Z" fill="#bdcbae" stroke-width="3"/><path d="M20.5 6.225 9.5 3.375-3.5-3.975M9.5 3.375 .5 3.225" fill="none" stroke="#829b7d" stroke-width="2.5"/></g>
</g>
<g id="i2-water" stroke="#2b3030" stroke-width="2" stroke-linejoin="round">
 <ellipse cx="237" cy="316" rx="35" ry="15" fill="#4a693c" opacity=".18" stroke="none"/>
 <path d="M207 312q-3-47 31-50 30 5 31 50l-30 15Z" fill="#d8cd9d"/><path d="M238 262q30 6 31 50l-30 15Z" fill="#b6a879"/>
 <path d="M216 290q21-13 43 0v10q-21 13-43 0Z" fill="#a29168" stroke-width="2"/>
 <ellipse cx="237" cy="290" rx="21" ry="9.48" fill="#23b5f1" stroke-width="2"/>
 <path d="M236 276q-10 12 0 15 11-3 0-15Z" fill="#77e9ff" stroke-width="1.5"/>
 <g id="i2-valve" stroke-width="3"><path d="m222 315 28 1v12l-28-1Z" fill="#e7b874"/><path d="M236 318v-15m-7 0h14" fill="none"/></g>
</g>
<g id="i2-stream" fill="none" stroke-linecap="round">
 <path d="m218 306-40 27" stroke="#699b94" stroke-width="8"/>
 <path class="i2-flow" d="m218 306-40 27" stroke="#addfd4" stroke-width="4" stroke-dasharray="9 12"/>
 <g id="i2-wheel-flow">
 <path d="M237 299q15 8 15 28v16q-1 8-8 12" stroke="#4f929a" stroke-width="14"/>
 <path class="i2-flow" d="M237 299q15 8 15 28v16q-1 8-8 12" stroke="#9ee4e5" stroke-width="8" stroke-dasharray="12 10"/>
 <path d="M245 418q10 13 25 14 13 1 13 16v164" stroke="#359fac" stroke-width="8"/>
 <path class="i2-flow" d="M245 418q10 13 25 14 13 1 13 16v164" stroke="#a8f4ee" stroke-width="3" stroke-dasharray="10 12"/>
 </g>
 <g id="i2-bypass-flow"><path d="M237 299q25 12 30 44l27 26v61l-11 17v165" stroke="#359fac" stroke-width="6"/><path class="i2-flow" d="M237 299q25 12 30 44l27 26v61l-11 17v165" stroke="#a8f4ee" stroke-width="3" stroke-dasharray="10 12"/></g>
</g>
<g id="i2-outfall" stroke="#3b9eb6" stroke-width="1.5">
 <ellipse cx="283" cy="615" rx="26" ry="11.74" fill="#7ce7ef"/>
 <path d="M269 616q14 9 28-1m-21-5q7 6 14 0m-10-4-4-7m12 7 6-7" fill="none" stroke="#d3ffff" stroke-width="2"/>
</g>
<g id="i2-overflow"><path d="M109 327q10-8 28-8 15-14 32-3 23 0 35 14 9 11-16 17-22 14-41 5-29-1-38-13-7-7 0-12Z" fill="#86cacf" stroke="#58969b" stroke-width="3"/><path d="m128 333 29-13 28 13" fill="none" stroke="#c7eddf" stroke-width="3"/></g>
<g id="i2-seeds" stroke="#3d5847" stroke-width="3" stroke-linejoin="round">
 <g class="i2-field-bed">
 <path d="m105 333 52-23 52 23-52 23Z" fill="#b58c5b"/><path d="m116 333 41-18 40 18-40 18Z" fill="#cda16b" stroke="none"/>
 <path d="m133 332 25-11m-11 20 25-11" stroke="#e5c38b" stroke-width="2.5"/>
 </g>
 <g class="i2-seed-first" fill="#f7d793" stroke="none"><ellipse cx="139" cy="331" rx="4" ry="2.5"/><ellipse cx="157" cy="326" rx="4" ry="2.5"/><ellipse cx="173" cy="338" rx="4" ry="2.5"/></g>
 <g class="i2-sprouts" fill="#7ab46b"><path d="M139 332v-17m0 8q-13-2-9-10 11 0 9 10m0-5q10-10 13-1-2 8-13 6M174 338v-19m0 10q-13-2-10-11 12 0 10 11m0-5q10-12 14-3-3 8-14 8"/></g>
 <g class="i2-harvest"><use href="#i2-ear" x="135" y="332"/><use href="#i2-ear" x="157" y="324"/><use href="#i2-ear" x="178" y="339"/><path d="m111 344 19 8-4 13-19-8Z" fill="#edc58b"/><path d="m111 348 16 7" fill="none" stroke-width="2.5"/></g>
 <g id="i2-pond"><path d="M109 327q10-8 28-8 15-14 32-3 23 0 35 14 9 11-16 17-22 14-41 5-29-1-38-13-7-7 0-12Z" fill="#83cbd2"/><path d="M116 331q14-9 26-5m24 19 24-9" fill="none" stroke="#bce9dd" stroke-width="3"/><path d="M134 329q-13-7-19 0-5 9 11 13 16 1 16-9l-8-4 3 9" fill="#91bd71"/></g>
</g>
<g id="i2-lily" stroke="#47754e" stroke-width="3"><g id="i2-lily-body"><path d="M-6 0q-11-12 5-14 20-2 23 8 4 13-17 15L-6 0 7-3Z" fill="#a0ce79"/><path d="m4-2 11-5M4-2l9 5" fill="none" stroke="#d5e9a1" stroke-width="2.5"/><path id="i2-lily-stem" d="M4 3v23" fill="none" stroke="#6b9455" stroke-width="4"/></g></g>
<g id="i2-fish" fill="#efac63" stroke="#696849" stroke-width="2.5"><path d="M-10 0Q0-12 11 0 0 11-10 0Zm-1 0-7-6v12Z"/><circle cx="4" cy="-1" r="1.5" fill="#354d43" stroke="none"/></g>
<path id="i2-cliff-steps" d="m286 368 14-6m-20-4 14-6m-19-4 14-6" fill="none" stroke="#a9c783" stroke-width="3" stroke-linecap="round"/>
<g id="i2-scaffold-short" stroke="#514f3e" stroke-width="3" stroke-linejoin="round">
 ${island2Iso.box(394, 363, 6, 6, 69)}
 ${island2Iso.box(446, 363 + 52 * island2Iso.slope, 6, 6, 69)}
 ${island2Iso.box(420, 307, 58, 6, 8)}
 <circle cx="416" cy="321" r="9" fill="#edc98a"/><path d="M416 330v26m-4 0q4 9 8 0" fill="none" stroke="#8a774f"/>
</g>
<g id="i2-scaffold" stroke="#514f3e" stroke-width="3" stroke-linejoin="round">
 ${island2Iso.box(394, 363, 6, 6, 230)}
 ${island2Iso.box(420, 146, 58, 6, 8)}
 <path id="i2-lift-rope" d="M416 163v149" fill="none" stroke="#8a774f" stroke-width="2.5"/>
 <g transform="translate(416 153)">${island2Iso.disc(10, 4, "x", "#edc780", "#ad8955",
   '<g id="i2-pulley-rotor"><path d="M-6 0H6M0-6V6" fill="none" stroke-width="2.5"/></g>')}</g>
</g>
<g id="i2-scaffold-front" stroke="#514f3e" stroke-width="3" stroke-linejoin="round">
 ${island2Iso.box(446, 363 + 52 * island2Iso.slope, 6, 6, 230)}
</g>
<g id="i2-tower" stroke="#3d5847" stroke-width="4" stroke-linejoin="round">
 <ellipse cx="474" cy="362" rx="35" ry="15" fill="#a1bc80" stroke="none"/>
 <path d="M447 360V219l26-12 27 12v141l-26 14Z" fill="#fff5d8"/><path d="M474 219 500 207v153l-26 14Z" fill="#ddd5b1"/>
 <path d="m448 288 26 12 25-12v16l-25 12-26-12Z" fill="#d98f71" stroke="none"/>
 <path d="M461 367v-31q12-15 23 0v31l-11 6Z" fill="#728f7c" stroke-width="3"/>
 <path d="m435 216 38-17 36 17-36 17Z" fill="#f1d49e"/>
 <ellipse cx="471" cy="215" rx="30" ry="10" fill="#ead1a0" stroke-width="3"/>
 <path d="M442 145v70m58-70v70m-29-77v68" fill="none" stroke="#687e6c" stroke-width="4"/>
 <ellipse cx="471" cy="145" rx="30" ry="7" fill="none" stroke="#687e6c" stroke-width="3"/>
 <path d="M454 209v4h34v-4" fill="none" stroke="#a99059" stroke-width="3"/>
 <path d="M449 284v-41q10-9 19 0v41l-9 4Z" fill="#728f7c" stroke-width="3"/>
 ${island2Iso.box(470, 246, 40, 46, 6, ["#f4cb81", "#d4a465", "#b27a42"])}
 <path d="m435 246 12 20m60-20-13 20" fill="none" stroke="#a98c5d" stroke-width="3"/>
 <path d="m405 289 34-15 24 10-35 16Z" fill="#e4b979" stroke-width="3"/><path d="m415 285 23 11m-10-17 23 11M407 285v-13l31-14v13m-28 22v10m43-17v10" fill="none" stroke="#8a754f" stroke-width="2.5"/>
 <g stroke="#8a754f" stroke-width="2.5" fill="none"><path d="M426 282v-58m12 63.42v-58"/>
 <path d="m426 233 12 5.42m-12 5 12 5.42m-12 5 12 5.42m-12 5 12 5.42m-12 5 12 5.42"/></g>
 <g id="i2-roof" transform="translate(0 -24)"><path d="m433 169 39-27 43 27q-42 9-82 0Z" fill="#f0773b"/><path d="m472 142 43 27q-22 5-42 5Z" fill="#c7542e"/><path d="M472 142v-12l18 5-17 6" fill="#ffdc35" stroke-width="3"/></g>
</g>
<g id="i2-gallery-rail" fill="none" stroke="#8a754f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
 <path d="M427 240v-9l40 18 46-21v9m-46 12v9"/>
</g>
<g id="i2-drive" fill="none" stroke-linecap="round"><path d="m252 384 62 35" stroke="#696849" stroke-width="7"/><path class="i2-running-belt" d="m252 384 62 35" stroke="#d3b778" stroke-width="3" stroke-dasharray="7 12"/></g>
<path id="i2-wire" d="M348 420 377 407V346l30-13 39 17V243l25-11" fill="none" stroke="#ba8c58" stroke-width="3"/>
<g id="i2-dock" stroke="#65563e" stroke-width="3.5" stroke-linejoin="round">
 <path d="m460 397 38-17 36 16-38 17Z" fill="#e6bc7e"/><path d="m470 393 35 16m-24-21 35 16m-24-21 35 16M466 400v36m62-36v36" fill="none" stroke-width="2.5"/><path d="M487 391v-15m22 7v-15" fill="none" stroke-width="4"/>
</g>
<g id="i2-cliff-ladder" fill="none" stroke="#745330" stroke-width="3" stroke-linecap="round">
 <path d="M501 390v155m14-149v155"/>
 ${Array.from({ length: 14 }, (_, i) => `<path d="m501 ${398 + i * 10} 14 6.32" stroke="#e9c07e" stroke-width="2.5"/>`).join("")}
 ${island2Iso.box(524, 511, 16, 14, 8, ["#eac182", "#bf8b4e", "#956734"])}
</g>
<g id="i2-port-rope" stroke-linecap="round" stroke-linejoin="round" fill="none"><path id="i2-crane-boom" d="M448 325 537 365" stroke="#514f3e" stroke-width="10"/><path id="i2-crane-boom-core" d="M448 325 537 365" stroke="#e0b574" stroke-width="6"/><circle cx="448" cy="325" r="7" fill="#edc98a" stroke="#514f3e" stroke-width="3"/><path id="i2-crane-line" d="M537 365v54" stroke="#8a774f" stroke-width="2.5"/><path id="i2-crane-hook" d="M-4 0v5q4 8 8 0" transform="translate(537 419)" stroke="#514f3e" stroke-width="3"/></g>
<g id="i2-wheel" stroke="#514f3e" stroke-width="3.5" stroke-linejoin="round">
 <g id="i2-table-feet"><path d="m-17-20-4 19m38-19 4 19" fill="none" stroke-width="5"/></g>
 <g id="i2-waterwheel"><path d="M-23-10v-31m46 52v-31" fill="none" stroke="#876b3c" stroke-width="5"/></g>
 <g id="i2-tabletop" transform="translate(0 -26)">${island2Iso.disc(30, 5, "ground", "#e8b466", "#a7783e",
   `<g id="i2-wheel-rotor"><g id="i2-table-rotor"><path d="M-25-10 25 10m-50 0 50-20" fill="none" stroke="#bd894c" stroke-width="1.5"/></g>
    <g id="i2-paddles" fill="#f3cb82">${Array.from({ length: 8 }, (_, i) =>
      `<g class="i2-paddle" transform="rotate(${i * 45})"><path d="M-6-36H6v14H-6Z"/><path d="M6-36l4-2v14l-4 2Z" fill="#b17c42"/></g>`).join("")}</g>
    <circle r="4" fill="#72512e"/></g>`)}</g>
 <g id="i2-tea" stroke-width="2.5"><path d="M-7-39v10q7 6 14 0v-10m0 2q10-3 6 5H7" fill="#fff9e2"/><ellipse cy="-39" rx="7" ry="3.16" fill="#d8c39c"/><path d="M-4-38q4 2 8 0M0-44q-3-4 0-7" fill="none" stroke="#fff9e2"/></g>
 <g id="i2-pottery"><path d="M-7-48v6q-12 3-12 10 1 7 19 7t19-7q0-7-12-10v-6Z" fill="#dc9d6c"/><ellipse cy="-48" rx="7" ry="3.5" fill="#76533f"/><path d="M-17-33q17 7 34 0" fill="none" stroke="#f1c99b" stroke-width="2.5"/><path id="i2-pot-tie" d="M-11-40q11 11 22 0M0-35v10m-3-7 6-5" fill="none" stroke="#7d7047" stroke-width="3"/></g>
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
 <g id="i2-generator"><path d="m-25-12 25-11 26 11v12L0 11-25 0Z" fill="#b3c2a5"/><path d="M0-1v12L26 0v-12Z" fill="#90aa91"/><path d="M-13-13v-13q0-10 13-7t13 14v14" fill="none" stroke="#c97f68" stroke-width="8"/><path d="M-13-13v5m26-1v5" stroke="#fff4d5" stroke-width="8"/><path d="m-8-15 14-6 10 6-14 6Z" fill="#e8b47e"/><path d="m-4-18 9 6m-3-9 9 6" stroke="#a57750" stroke-width="2.5"/></g>
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
 ${island2Iso.disc(14, 5, "x", "#a6e0df", "#70b2b5",
   '<g id="i2-glass-roughness" fill="#d3e2d0" stroke="none"><path d="M-9-9q10-8 17 0l-2 4H-6Z"/><path d="M-10-2H8v6H-9Z"/><path d="M-8 7H7q-7 10-15 0Z"/></g><g id="i2-lens-rings"><path d="m-5-3 8-6" fill="none" stroke="#f1ffed" stroke-width="3" stroke-linecap="round"/></g>')}
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
