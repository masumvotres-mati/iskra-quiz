"use strict";

const valleyArt = (() => {
  const slope = .45;
  const path = (points) => `M${points.map((point) => point.join(" ")).join("L")}Z`;
  const box = (x, y, width, depth, height, colors = ["#f3ce8c", "#dfb47a", "#ba8e57"]) => {
    const p = (u, v, z) => [x + u - v, y + (u + v) * slope - z];
    return `<path d="${path([p(-width / 2, -depth / 2, height), p(width / 2, -depth / 2, height),
      p(width / 2, depth / 2, height), p(-width / 2, depth / 2, height)])}" fill="${colors[0]}"/>
      <path d="${path([p(-width / 2, depth / 2, height), p(width / 2, depth / 2, height),
        p(width / 2, depth / 2, 0), p(-width / 2, depth / 2, 0)])}" fill="${colors[1]}"/>
      <path d="${path([p(width / 2, -depth / 2, height), p(width / 2, depth / 2, height),
        p(width / 2, depth / 2, 0), p(width / 2, -depth / 2, 0)])}" fill="${colors[2]}"/>`;
  };
  const diamond = (x, y, u, v) => path([[x - u + v, y - (u + v) * slope],
    [x + u + v, y + (u - v) * slope], [x + u - v, y + (u + v) * slope],
    [x - u - v, y + (v - u) * slope]]);
  const land = (points, depth, colors) => {
    const [left, back, right, front] = points;
    return `<path d="${path([left, front, [front[0], front[1] + depth], [left[0], left[1] + depth]])}" fill="${colors[1]}"/>
      <path d="${path([front, right, [right[0], right[1] + depth], [front[0], front[1] + depth]])}" fill="${colors[2]}"/>
      <path d="${path([left, back, right, front])}" fill="${colors[0]}"/>`;
  };
  const board = (a, b, width, thickness = 3, stone = false) => {
    const offset = [width / 2, width * slope / 2];
    const top = [a.map((n, i) => n - offset[i]), b.map((n, i) => n - offset[i]),
      b.map((n, i) => n + offset[i]), a.map((n, i) => n + offset[i])];
    return `<path d="${path([top[2], top[3], top[3].map((n, i) => n + (i ? thickness : 0)),
      top[2].map((n, i) => n + (i ? thickness : 0))])}" fill="${stone ? "#b49a70" : "#b68e59"}"/>
      <path d="${path(top)}" fill="${stone ? "#dfcba4" : "#e7c68f"}"/>`;
  };
  const bridgePoints = [[350, 323], [420, 270]];
  const bridge = Array.from({ length: 19 }, (_, i) => {
    const a = bridgePoints[0].map((n, j) => n + (bridgePoints[1][j] - n) * i / 19);
    const b = bridgePoints[0].map((n, j) => n + (bridgePoints[1][j] - n) * (i + .85) / 19);
    return board(a, b, 36);
  }).join("");
  const stairs = Array.from({ length: 12 }, (_, i) => {
    const a = [269 - i * 3.2, 273 + i * 3.5];
    return board(a, [a[0] - 3.2, a[1] + 1.5], 18, 3.5, true);
  }).join("");
  const flower = (color) => `<ellipse cy="1" rx="8" ry="3" fill="#5b7d44" opacity=".15"/>
    <path d="M-1 0V-22H1V0Z" fill="#679b50"/>
    <path d="M0-6Q-12-5-11-15-3-15 0-6Z" fill="#8cba65"/>
    <path d="M1-10Q5-20 12-18 12-11 1-10Z" fill="#72a756"/>
    <g fill="${color}"><ellipse cy="-26" rx="5" ry="8"/><ellipse cx="-7" cy="-21" rx="8" ry="5" transform="rotate(25 -7 -21)"/>
      <ellipse cx="7" cy="-21" rx="8" ry="5" transform="rotate(-25 7 -21)"/><ellipse cy="-17" rx="7" ry="5"/></g>
    <circle cy="-22" r="4" fill="#ffdf87"/>`;
  const token = {
    shovel: `<path d="M-1-26H2V-4H-1Z" fill="#bd925a"/><path d="M-6-4H7L5 5Q0 12-5 5Z" fill="#adc4b7"/><path d="M-3-3H0V8Q-4 5-3-3Z" fill="#dce8d6"/><path d="M-5-35H5V-26H-5ZM-2-32V-28H2V-32Z" fill="#d5b17b" fill-rule="evenodd"/>`,
    water: `<path d="M-9-17Q-14-23-8-27L-3-26V-31H5V-26Q14-22 11-9L7 1H-7Z" fill="#d9b780"/><path d="M5-26Q13-18 7-5L4 0H8Q17-17 9-24Z" fill="#b88d55"/><ellipse cy="-26" rx="5" ry="2.3" fill="#77baf6"/><path d="M-9-21Q-17-24-16-15-16-9-10-10" fill="none" stroke="#c6a16c" stroke-width="3"/>`,
    timber: box(0, 0, 25, 7, 7) + box(-3, -7, 25, 7, 6),
    wheel: `<g transform="matrix(.9 .405 0 1 0 -12)"><path d="M14 0A14 14 0 1 0-14 0 14 14 0 1 0 14 0ZM10 0A10 10 0 1 0-10 0 10 10 0 1 0 10 0Z" fill="#d9b47a" fill-rule="evenodd"/><path d="M-11 0H11M0-11V11m-8-8 16 16M-8 8 8-8" stroke="#e9c78e" stroke-width="2.5"/><circle r="3" fill="#ac8350"/></g>`,
    rope: `<g transform="matrix(1 .45 -1 .45 0 -6)" fill="none" stroke-width="3"><circle r="13" stroke="#ad8852"/><circle r="10" stroke="#cfac76"/><circle r="7" stroke="#e5c996"/></g><path d="M12-1q8 6 6 10" fill="none" stroke="#cfac76" stroke-width="2"/>`,
    seeds: `<path d="M-8-17Q-12-6-9 0 0 7 9 0 12-6 7-17Z" fill="#e2c58d"/><path d="M4-17Q13-3 5 3 12 0 10-9L7-17Z" fill="#bd9b61"/><ellipse cy="-17" rx="8" ry="3.3" fill="#a78b59"/><path d="M-2-9V-3M-2-7q-6-7-7-2 2 4 7 2m0 1q6-8 7-3-1 4-7 3" fill="none" stroke="#7e9d55" stroke-width="1.7"/>`,
    glass: `<path d="m-12-23 23 10V3L-12-7Z" fill="#87d7df" opacity=".8"/><path d="m-12-23 23 10 3-2-23-10Z" fill="#d4f7ed"/><path d="M11-13l3-2V1l-3 2Z" fill="#51aab7"/><path d="m-8-18 11 5m-8 6 12 5" stroke="#e8ffff" stroke-width="1.4"/>`,
    cloth: `<path d="m-14-12 17-8 13 6v10L-1 6-14 0Z" fill="#e5a56e"/><path d="m-14-12 13 6 17-8-13-6Z" fill="#f3c28d"/><path d="M-1-6V6l17-10v-10Z" fill="#c9885d"/><path d="m-10-10 13-6m-7 10 13-6" fill="none" stroke="#ffe0ad" stroke-width="1"/>`,
    parcel: box(0, 0, 10, 8, 11) + `<path d="M-4-10 4-6V2" fill="none" stroke="#a9814d" stroke-width="2"/>`,
    bloom: flower("#f3ba83"),
  };
  const people = ["scout", "maker", "gardener"].map((role) => `<g id="v-person-${role}" data-depth="0">
    <ellipse class="v-shadow" cy="0" rx="8" ry="3" fill="#556e43" opacity=".2"/>
    <g class="v-person-body" transform="scale(.68)">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path class="v-leg-back" d="M-4-13-6-1" stroke="#c6ce88" stroke-width="6"/>
        <path class="v-arm-back" d="M-6-31-12-18" stroke="#d7dd92" stroke-width="6"/>
        <path class="v-leg-front" d="M4-13 6-1" stroke="#f8fba7" stroke-width="6"/>
        <path class="v-arm-front" d="M6-31 12-18" stroke="#f8fba7" stroke-width="6"/>
      </g>
      <path d="M-8-32Q0-37 8-32Q13-18 5-12H-5Q-13-18-8-32Z" fill="url(#v-skin-body)"/>
      <circle cy="-46" r="13" fill="url(#v-skin-head)"/>
      <g class="v-hand-back"><circle r="3" fill="#f7f9a5"/></g>
      <g class="v-hand-front"><circle r="3" fill="#ffffb6"/></g>
    </g></g>`).join("");
  const assets = `<g id="v-workshop" data-depth="354" transform="translate(231 347)">
      <ellipse cy="2" rx="29" ry="12" fill="#56683b" opacity=".15"/>
      <path d="M-27-37H27V-2Q0 19-27-2Z" fill="url(#v-stone)"/>
      <ellipse cy="-37" rx="27" ry="12" fill="#edddb6"/>
      <path d="M-9 7V-14Q-9-27 4-25 16-23 16-11V7Z" fill="#66704d"/>
      ${box(2, 3, 10, 8, 6)}
      <g class="v-stage" data-item="timber" data-level="3">${box(-3, -43, 21, 14, 8)}
        <path d="m-28-46 26-21 30 23-25 10Z" fill="#d59b67"/><path d="m-28-46 25 12 31-10L2-67Z" fill="#e4b47d"/></g>
    </g>
    <g id="v-sluice" transform="translate(213 280)" data-depth="282">
      ${box(-11, 0, 3, 3, 17)}${box(11, 10, 3, 3, 17)}
      <path d="M-11-8 11 2V-6L-11-16Z" fill="#d0aa72"/>
      <path d="M0-11V-25" stroke="#9e8457" stroke-width="1.5"/>
      <path d="m-4-25 8 3" stroke="#e1c28a" stroke-width="2"/>
    </g>
    <g id="v-wheel" transform="translate(291 344)" data-depth="346">
      <g class="v-wheel-support">${box(-18, 1, 3, 3, 23)}${box(18, 14, 3, 3, 23)}</g>
      <g id="v-waterwheel" transform="matrix(.9 .405 0 1 0 -19)"><g id="v-rotor">
        <path d="M23 0A23 23 0 1 0-23 0 23 23 0 1 0 23 0ZM18 0A18 18 0 1 0-18 0 18 18 0 1 0 18 0Z" fill="#dcb97f" fill-rule="evenodd"/>
        <path d="M-20 0H20M0-20V20M-14-14 14 14M-14 14 14-14" stroke="#ebca92" stroke-width="3"/>
        ${Array.from({ length: 8 }, (_, i) => `<g transform="rotate(${i * 45})"><path d="M-7-27H7V-20H-7Z" fill="#be955e"/><path d="M-7-27H7L10-29H-4Z" fill="#ebc68c"/></g>`).join("")}
        <circle r="4" fill="#a7804d"/></g></g>
    </g>
    <g id="v-cart" transform="translate(287 354)" data-depth="360">
      <g id="v-cart-body">${box(0, -6, 25, 13, 9)}
        ${[-19, 17].map((x) => `<g transform="translate(${x} -1) scale(.5)">${token.wheel}</g>`).join("")}
        <path d="m18-9 0-21" fill="none" stroke="#d7af74" stroke-width="3"/>
      </g>
    </g>
    <g id="v-station" data-depth="333" transform="translate(345 328)">
      ${box(0, 2, 18, 14, 5)}
      ${[-15, 15].map((x) => box(x, 0, 3, 3, 62)).join("")}
      ${box(0, -60, 33, 5, 5)}
      <circle cy="-68" r="8" fill="#c6985f"/><circle cx="-2" cy="-70" r="5" fill="#ebca91"/>
      <g class="v-stage" data-item="cloth" data-level="2"><path d="M-23-51 2-65 25-53 0-40Z" fill="#f3c28d"/><path d="M-23-51 0-40V-33L-23-44Z" fill="#d99866"/></g>
    </g>
    <g id="v-remote" data-depth="270" transform="translate(445 265)">
      ${box(0, 2, 18, 14, 5)}
      ${[-15, 15].map((x) => box(x, 0, 3, 3, 62)).join("")}
      ${box(0, -60, 33, 5, 5)}
      <circle cy="-68" r="8" fill="#c6985f"/><circle cx="-2" cy="-70" r="5" fill="#ebca91"/>
    </g>
    <g id="v-greenhouse" transform="translate(515 267)" data-depth="276">
      <g class="v-stage" data-item="glass" data-level="2">
        ${box(0, 0, 28, 23, 5, ["#e6d5aa", "#c5ac7f", "#a58b60"])}
        <path d="M-40-29 0-47 40-29 0-11Z" fill="#b9ece2" opacity=".68"/>
        <path d="M-40-29V-6L0 12V-11Z" fill="#91d3cb" opacity=".6"/>
        <path d="M0-11 40-29V-6L0 12Z" fill="#68b5b5" opacity=".68"/>
        <path d="M-40-29 0-60 40-29 0-11Z" fill="#c9f3e7" opacity=".72"/>
        <path d="M-40-29V-6M0-11V12M40-29V-6M0-60V-11M-40-29 0-11 40-29M-40-29 0-60 40-29" fill="none" stroke="#e5cf9d" stroke-width="2.5"/>
        <path d="m-29-28 15-7m22 13 16-8" stroke="#eefff7" stroke-width="1.5"/>
      </g>
      <g class="v-stage" data-item="glass" data-level="3"><g transform="translate(-10 -2) scale(.65)">${flower("#efb27b")}</g><g transform="translate(13 -4) scale(.7)">${flower("#f2d394")}</g></g>
    </g>
    <g id="v-awning" data-depth="364" transform="translate(166 346)">
      <g class="v-stage" data-item="cloth" data-level="2">${box(-29, 0, 2, 2, 37)}${box(29, 17, 2, 2, 37)}
        <path d="M-33-36 0-51 34-36 0-20Z" fill="#f4c38e"/><path d="M-33-36 0-20V-15L-33-31Z" fill="#d99b68"/>
        <path d="m-19-42 33 16m-22-21 33 16" stroke="#ffe0ae" stroke-width="3"/></g>
    </g>
    ${[[132, 330], [150, 321], [164, 339], [183, 331]].map(([x, y], i) => `<g id="v-plant-${i}" transform="translate(${x} ${y})" data-depth="${y}">
      <g class="v-stage v-sprout" data-item="seeds" data-level="2"><path d="M-1 0V-13H1V0Z" fill="#719951"/><path d="M0-8Q-12-6-12-16-3-18 0-8Z" fill="#a3c77a"/><path d="M1-8Q5-21 13-17 13-8 1-8Z" fill="#7fac61"/></g>
      <g class="v-stage v-flower" data-item="seeds" data-level="3">${flower(i % 2 ? "#f2cd88" : "#efb07b")}</g>
    </g>`).join("")}`;
  const svg = `<svg viewBox="0 100 640 490" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="v-title v-description">
    <title id="v-title">Poczta nad wąwozem</title><desc id="v-description">Dwa skalne tarasy nad zatoką. Mieszkańcy budują ogród, most i pocztę linową.</desc>
    <defs>
      <radialGradient id="v-skin-head" cx=".28" cy=".2" r=".85"><stop stop-color="#ffffdc"/><stop offset=".62" stop-color="#ffffad"/><stop offset="1" stop-color="#d9dd86"/></radialGradient>
      <linearGradient id="v-skin-body"><stop stop-color="#ffffc2"/><stop offset="1" stop-color="#d8dd85"/></linearGradient>
      <linearGradient id="v-stone"><stop stop-color="#ead9b2"/><stop offset=".6" stop-color="#dcc79f"/><stop offset="1" stop-color="#bea57c"/></linearGradient>
      <radialGradient id="v-gold"><stop stop-color="#fff5a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffc13d" stop-opacity="0"/></radialGradient>
      <clipPath id="v-left-top"><path d="M54 318 232 238 410 318 232 398Z"/></clipPath>
      <clipPath id="v-grass-mask"><ellipse id="v-grass-radius" cx="176" cy="324" rx="0" ry="0"/></clipPath>
      <clipPath id="v-channel-mask"><path d="M191 264 237 285V303L280 323V356L302 366" fill="none" stroke="white" stroke-width="1"/></clipPath>
      <clipPath id="v-build-mask"><rect x="0" y="130" width="640" height="450"/></clipPath>
      <pattern id="v-water-texture" width="24" height="18" patternUnits="userSpaceOnUse"><rect width="24" height="18" fill="#78baf6"/><path d="m3 5 4 1m9 6 3-1" fill="none" stroke="#a9d8fa" stroke-width="1"/><path d="m12 3 3 1M3 15l3-1" stroke="#509fdd" stroke-width=".8"/></pattern>
      ${Object.entries(token).map(([id, art]) => `<g id="v-token-${id}">${art}</g>`).join("")}
    </defs>
    <rect x="0" y="100" width="640" height="490" fill="#64c8f4"/>
    <g fill="#e1f6e8" opacity=".48"><ellipse cx="107" cy="176" rx="38" ry="10"/><ellipse cx="132" cy="174" rx="21" ry="8"/><ellipse cx="433" cy="143" rx="30" ry="8"/></g>
    <path d="M53 474 230 555 430 469 602 464 481 552 257 580Z" fill="#246d79" opacity=".25"/>
    <g id="v-rock">
      ${land([[365, 250], [470, 202], [586, 254], [481, 302]], 188, ["#bea072", "#ae8f63", "#8e734e"])}
      <path id="v-far-meadow" d="M365 250 470 202 586 254 481 302Z" fill="#a5c982"/>
      ${land([[54, 318], [232, 238], [410, 318], [232, 398]], 144, ["#c2a376", "#ad8d61", "#94744e"])}
      <g fill="none" stroke="#dbbd91" stroke-width="1" opacity=".18"><path d="m54 361 178 80 178-80M54 414l178 80 178-80M365 296l116 52 105-48m-221 65 116 52 105-48"/></g>
      <g id="v-meadow" clip-path="url(#v-left-top)"><path d="M54 318 232 238 410 318 232 398Z" fill="#88c879" clip-path="url(#v-grass-mask)"/></g>
      ${land([[112, 265], [205, 223], [285, 259], [192, 301]], 40, ["#cbb088", "#b3976c", "#a0845c"])}
      ${Array.from({ length: 5 }, (_, i) => board([269 - i * 7.6, 273 + i * 8.4],
        [264 - i * 7.6, 276 + i * 8.4], 10, 5, true)).join("")}
    </g>
    <g id="v-floor">
      <g id="v-bed"><path d="${diamond(153, 331, 30, 22)}" fill="#a48960"/><path d="${diamond(153, 332, 27, 20)}" fill="#bda37b"/>
        <path d="m124 326 38 17m-27-22 38 17m-26-22 38 17" stroke="#a18b60" stroke-width="1.5"/></g>
      <g id="v-source"><path d="${diamond(191, 264, 21, 18)}" fill="#8d7854"/>
        <path d="${diamond(191, 267, 18, 15)}" fill="#725e41"/>
        <path d="${diamond(191, 271, 18, 15)}" fill="url(#v-water-texture)"/>
        <path d="m181 272 7 2m10-4 5 2" fill="none" stroke="#c2e6fa" stroke-width="1"/></g>
      <g id="v-channel"><path id="v-channel-bank" d="M213 273 237 285V303L280 323V356L302 366M249 309 182 339" fill="none" stroke="#8d7854" stroke-width="15" stroke-linejoin="miter"/>
        <path d="M213 277 232 286V306L275 325V359L300 370M246 313 182 342" fill="none" stroke="#78baf6" stroke-width="10" stroke-linejoin="miter"/>
        <path class="v-current" d="m244 312-9 4m34 7 7 3m-75 9-9 4" fill="none" stroke="#bce1fb" stroke-width="1.5"/>
      </g>
      <g id="v-crossing">${box(275, 343, 32, 12, 4, ["#dfcba4", "#baa078", "#a58b63"])}
        ${box(231, 319, 12, 9, 4, ["#dfcba4", "#baa078", "#a58b63"])}</g>
      <g id="v-stairs">${stairs}</g>
    </g>
    <g id="v-fall"><path d="M294 364 307 369V510L294 505Z" fill="#5ba8ef"/><path d="M296 366V506" stroke="#a6d7f6" stroke-width="2"/>
      <ellipse cx="300" cy="510" rx="20" ry="7" fill="#8fcdf4"/><path d="M288 510q12 7 25 0" fill="none" stroke="#d2edfb" stroke-width="1.2"/></g>
    <g id="v-tunnel"><path d="m136 391 69 31v38l-69-31Z" fill="#5b4935"/><path d="m144 390 67 30v33l-67-30Z" fill="#795f40"/>
      <path d="m136 429 69 31 8-5-69-31Z" fill="#d2b281"/>
      ${box(147, 431, 3, 3, 29)}${box(197, 454, 3, 3, 29)}
      ${box(166, 440, 9, 6, 10)}
    </g>
    <g id="v-bridge">${bridge}
      <path id="v-bridge-ropes" d="M332 315 402 262M368 331 438 278" fill="none" stroke="#a88a5b" stroke-width="2"/>
    </g>
    <g id="v-cable"><path d="M345 260Q395 236 445 197M345 265Q395 241 445 202" fill="none" stroke="#a78d64" stroke-width="2"/>
      <path id="v-drive-belt" d="M308 330 335 308 342 270Q345 263 348 271L341 312 312 334Q306 336 308 330Z" fill="none" stroke="#967b51" stroke-width="2"/>
    </g>
    <g id="v-world">${assets}${people}
      ${["scout", "maker", "gardener"].map((role) => `<g id="v-contact-${role}" fill="#ffffb6" pointer-events="none"></g>`).join("")}
      <g id="v-gondola" transform="translate(345 322)" data-depth="335">
        <path d="M-16-20V-52L0-62 16-52V-20" fill="none" stroke="#bd9b67" stroke-width="2"/>
        ${box(0, 0, 17, 11, 14)}
        <g id="v-car-load" transform="translate(0 -14)"></g>
        <path d="M-28-20 0-7 28-20V-9L0 4-28-9Z" fill="#d7ae75"/>
        <path d="M0-7 28-20V-9L0 4Z" fill="#b88d55"/>
        <g id="v-car-roof"><path d="M-22-48 0-60 22-48 0-37Z" fill="#f5c48d"/><path d="M-22-48 0-37V-31L-22-42Z" fill="#dd9c67"/></g>
      </g>
      ${Object.keys(token).filter((id) => !["parcel", "bloom"].includes(id)).map((id) =>
        `<g id="v-prop-${id}"><use href="#v-token-${id}"/></g>`).join("")}
      <g id="v-parcel"><use href="#v-token-seeds"/></g>
    </g>
    <g id="v-effects" pointer-events="none"></g>
    <g fill="none" stroke="#b9e8ef" stroke-width="1.5" opacity=".6"><path d="M29 475h23m480 57h35M79 548h19m490-102h18"/></g>
  </svg>`;
  return { svg, token, box, board, bridgePoints, slope };
})();
