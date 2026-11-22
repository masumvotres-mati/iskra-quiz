"use strict";

const island2SceneArtwork = `
<svg viewBox="0 0 640 580" role="img" aria-labelledby="i2-art-title i2-art-description" xmlns="http://www.w3.org/2000/svg">
<title id="i2-art-title">Wyspa małych spraw</title>
<desc id="i2-art-description">Mały świat, w którym mieszkańcy odkrywają przejścia, przerabiają przedmioty i pomagają sobie w nieoczekiwanych zadaniach.</desc>
<defs>
 <clipPath id="i2-cave-mask"><path d="M325 383v-39a15 15 0 0 1 30 0v39Z"/></clipPath>
 <clipPath id="i2-under-mask"><path d="m210 425 80 36v35l-80-36Z"/></clipPath>
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
 <rect width="640" height="580" fill="#fffbed"/>
 <path d="M0 258q170-10 320 0t320-2v324H0Z" fill="#cfeae7"/>
 <g fill="#fff" opacity=".8"><path d="M79 222q-8-14 7-20 1-16 17-17 16-1 20 12 20-2 22 15 11 1 11 10Z"/><path d="M507 111q-4-10 7-14 2-15 17-13 13-4 18 9 16-2 18 11 10 0 12 7Z"/></g>
 <path d="m66 400 247 112q5 3 10 0l247-112 8 8-254 115q-6 3-13 0L59 408Z" fill="#a8d1c7" opacity=".45"/>
 <path d="m71 400 241 110q6 3 12 0l242-110" fill="none" stroke="#f4fff1" stroke-width="4" stroke-linecap="round"/>
 <g class="i2-waves" stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".8"><path d="M38 401h23m-6 69h28m36 60h31m287-8h35m112-23h22M548 327h29M24 337h19"/></g>
</g>
<g id="i2-base-terrain" stroke="#3d5847" stroke-width="4" stroke-linejoin="round">
 <path d="m70 350 248-112 248 112v48L318 510 70 398Z" fill="#91b96b"/>
 <path d="M70 350 318 462v48L207 460l-6-9-15-1L70 398Z" fill="#9fc472"/>
 <path d="M318 462 566 350v48l-126 57-9-3-7 10-106 48Z" fill="#6da568"/>
 <path d="M79 346 310 242q8-4 16 0l231 104q9 4 0 8L326 458q-8 4-16 0L79 354q-9-4 0-8Z" fill="#b9da7c"/>
 <path d="m88 353 221 100q9 4 18 0l221-100" fill="none" stroke="#dcebb0" stroke-width="3"/>
</g>
<g id="i2-cutaway" stroke="#55735a" stroke-width="3" stroke-linejoin="round"><path d="m208 422 84 38v39l-84-38Z" fill="#78926e"/><path d="m212 428 76 34v30l-76-34Z" fill="#354d43"/><path d="m213 452 73 33" stroke="#b09a68" stroke-width="4"/><path d="m216 434 7 3m55 37 6 3" stroke="#67795d" stroke-width="2.5"/></g>
<g id="i2-magnet"><use href="#i2-magnet-token"/></g>
<g id="i2-middle-walls" stroke="#3d5847" stroke-width="4" stroke-linejoin="round">
 <ellipse cx="335" cy="374" rx="43" ry="17" fill="#9abb79" stroke="none"/>
 <path d="M296 366v-44q0-25 38-26 40 0 40 26v44l-34 16Z" fill="#b9c9ae"/>
 <path d="M351 307q23 2 23 15v44l-23 11Z" fill="#98b69e"/>
 <path d="M294 316q-2-29 40-30 41 1 42 30l-9 5q-32-14-65 0Z" fill="#d5ddbc"/>
 <path d="m303 329 13-5m44-3 8 3m-13 36 11-5" fill="none" stroke="#9bad93" stroke-width="2.5"/>
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
<g id="i2-water" stroke="#3d5847" stroke-width="4" stroke-linejoin="round">
 <ellipse cx="237" cy="316" rx="35" ry="15" fill="#a2c777" stroke="none"/>
 <path d="M207 312q-3-47 31-50 30 5 31 50l-30 15Z" fill="#b9c9a8"/><path d="M238 262q30 6 31 50l-30 15Z" fill="#98b58e"/>
 <path d="M216 290q21-13 43 0v10q-21 13-43 0Z" fill="#9db3a0" stroke-width="3"/>
 <ellipse cx="237" cy="290" rx="21" ry="9" fill="#83d1d6" stroke-width="3"/>
 <path d="M236 276q-10 12 0 15 11-3 0-15Z" fill="#8bd9df" stroke-width="2.5"/>
 <g id="i2-valve" stroke-width="3"><path d="m222 315 28 1v12l-28-1Z" fill="#e7b874"/><path d="M236 318v-15m-7 0h14" fill="none"/></g>
</g>
<g id="i2-stream" fill="none" stroke-linecap="round">
 <path d="m218 306-40 27" stroke="#699b94" stroke-width="8"/>
 <path class="i2-flow" d="m218 306-40 27" stroke="#addfd4" stroke-width="4" stroke-dasharray="9 12"/>
 <g id="i2-wheel-flow">
 <path d="M237 299q15 8 15 28v16q-1 8-8 12" stroke="#4f929a" stroke-width="14"/>
 <path class="i2-flow" d="M237 299q15 8 15 28v16q-1 8-8 12" stroke="#9ee4e5" stroke-width="8" stroke-dasharray="12 10"/>
 <path d="M245 418q10 13 25 14 13 1 13 16v52" stroke="#78b8b8" stroke-width="8"/>
 <path class="i2-flow" d="M245 418q10 13 25 14 13 1 13 16v52" stroke="#c1ebdf" stroke-width="3" stroke-dasharray="10 12"/>
 </g>
 <g id="i2-bypass-flow"><path d="M237 299q25 12 30 44l27 26v61l-11 17v53" stroke="#78b8b8" stroke-width="6"/><path class="i2-flow" d="M237 299q25 12 30 44l27 26v61l-11 17v53" stroke="#c1ebdf" stroke-width="3" stroke-dasharray="10 12"/></g>
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
 <path d="M394 374v-69h7v69m30 0v-69h7v69" fill="#d3a66b"/><path d="M390 302h52v10h-52Z" fill="#edc98a"/>
 <path d="m388 375 10-5 12 5-11 5m24-5 11-5 12 5-11 5" fill="#c79b61"/>
 <circle cx="416" cy="321" r="9" fill="#edc98a"/><path d="M416 330v26m-4 0q4 9 8 0" fill="none" stroke="#8a774f"/>
</g>
<g id="i2-scaffold" stroke="#514f3e" stroke-width="3" stroke-linejoin="round">
 <path d="M394 374V144h7v230m30 0V144h7v230" fill="#d3a66b"/><path d="M390 136h52v11h-52Z" fill="#edc98a"/>
 <path d="m388 375 10-5 12 5-11 5m24-5 11-5 12 5-11 5" fill="#c79b61"/>
 <path id="i2-lift-rope" d="M416 163v149" fill="none" stroke="#8a774f" stroke-width="2.5"/>
 <g transform="translate(416 153)"><g id="i2-pulley-rotor"><circle r="10" fill="#edc780"/><path d="M-6 0H6M0-6V6" fill="none" stroke-width="2.5"/></g></g>
</g>
<g id="i2-tower" stroke="#3d5847" stroke-width="4" stroke-linejoin="round">
 <ellipse cx="474" cy="362" rx="35" ry="15" fill="#a1bc80" stroke="none"/>
 <path d="M447 360V219l26-12 27 12v141l-26 14Z" fill="#fff5d8"/><path d="M474 219 500 207v153l-26 14Z" fill="#ddd5b1"/>
 <path d="m448 288 26 12 25-12v16l-25 12-26-12Z" fill="#d98f71" stroke="none"/>
 <path d="M461 367v-31q12-15 23 0v31l-11 6Z" fill="#728f7c" stroke-width="3"/>
 <path d="m435 216 38-17 36 17-36 17Z" fill="#f1d49e"/>
 <ellipse cx="471" cy="215" rx="30" ry="10" fill="#ead1a0" stroke-width="3"/>
 <path d="M442 169v46m58-46v46m-29-53v44" fill="none" stroke="#687e6c" stroke-width="4"/>
 <ellipse cx="471" cy="169" rx="30" ry="7" fill="none" stroke="#687e6c" stroke-width="3"/>
 <path d="M454 209v4h34v-4" fill="none" stroke="#a99059" stroke-width="3"/>
 <path d="M449 284v-41q10-9 19 0v41l-9 4Z" fill="#728f7c" stroke-width="3"/>
 <path d="m405 289 34-15 24 10-35 16Z" fill="#e4b979" stroke-width="3"/><path d="m415 285 23 11m-10-17 23 11M407 285v-13l31-14v13m-28 22v10m43-17v10" fill="none" stroke="#8a754f" stroke-width="2.5"/>
 <g id="i2-roof"><path d="m433 169 39-27 43 27q-42 9-82 0Z" fill="#d98f71"/><path d="m472 142 43 27q-22 5-42 5Z" fill="#bc765d"/><path d="M472 142v-12l18 5-17 6" fill="#edc780" stroke-width="3"/></g>
</g>
<g id="i2-drive" fill="none" stroke-linecap="round"><path d="m252 384 62 35" stroke="#696849" stroke-width="7"/><path class="i2-running-belt" d="m252 384 62 35" stroke="#d3b778" stroke-width="3" stroke-dasharray="7 12"/></g>
<path id="i2-wire" d="M348 420 377 407V346l30-13 39 17V243l25-11" fill="none" stroke="#ba8c58" stroke-width="3"/>
<g id="i2-dock" stroke="#65563e" stroke-width="3.5" stroke-linejoin="round">
 <path d="m460 397 38-17 36 16-38 17Z" fill="#e6bc7e"/><path d="m470 393 35 16m-24-21 35 16m-24-21 35 16M466 400v17m62-17v17" fill="none" stroke-width="2.5"/><path d="M487 391v-15m22 7v-15" fill="none" stroke-width="4"/>
</g>
<g id="i2-port-rope" stroke-linecap="round" stroke-linejoin="round" fill="none"><path id="i2-crane-boom" d="M448 325 537 365" stroke="#514f3e" stroke-width="10"/><path id="i2-crane-boom-core" d="M448 325 537 365" stroke="#e0b574" stroke-width="6"/><circle cx="448" cy="325" r="7" fill="#edc98a" stroke="#514f3e" stroke-width="3"/><path id="i2-crane-line" d="M537 365v54" stroke="#8a774f" stroke-width="2.5"/><path id="i2-crane-hook" d="M-4 0v5q4 8 8 0" transform="translate(537 419)" stroke="#514f3e" stroke-width="3"/></g>
<g id="i2-wheel" stroke="#514f3e" stroke-width="3.5" stroke-linejoin="round">
 <g id="i2-table-feet"><path d="m-17-20-4 19m38-19 4 19" fill="none" stroke-width="5"/></g>
 <g id="i2-waterwheel"><path d="M-23 0v-31m46 31v-31" fill="none" stroke="#7f805c" stroke-width="5"/><g transform="translate(0 -38) scale(.86 1)"><circle r="34" fill="#cb9b60"/><g id="i2-wheel-rotor"><g id="i2-paddles" fill="#edc98d"><path d="M-8-41H8v15H-8Zm0 67H8v15H-8ZM-41-8h15V8h-15Zm67 0h15V8H26ZM-34-25l10-10 11 15-10 10Zm47 45 10-10 11 15-10 10Zm11-55 10 10-15 11-10-10Zm-48 45 10 10-11 15-10-10Z"/><circle r="24" fill="#d3a368"/><path d="M0-24v48m-21-36 42 24m-42 0 42-24" stroke="#f1cc91" stroke-width="5"/></g></g><circle r="5" fill="#6d6246"/></g></g>
 <g id="i2-tabletop"><ellipse cy="-23" rx="28" ry="12.5" fill="#dba867"/><g transform="translate(0 -26) scale(1 .45)"><g id="i2-table-rotor"><circle r="28" fill="#f0cd8b"/><path d="M-24-11 24 11m-48 0 48-22" fill="none" stroke="#d8ae6d" stroke-width="2.5"/></g></g></g>
 <g id="i2-tea" stroke-width="2.5"><path d="M-7-29v-10H6v10q-7 5-13 0m13-8q10-3 5 5H6" fill="#fff9e2"/><path d="M0-44q-3-4 0-7" fill="none" stroke="#fff9e2"/></g>
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
 <path d="M-5-26v-5q5-7 10 0v5" fill="none"/><path d="M-9 0v-24H9V0m-23 2h28m-27-27h26" fill="#eac076"/><path d="M-5-20H5V-3H-5Z" fill="#788c76" stroke-width="2.5"/><path id="i2-bulb" d="M0-3v-6q-8-11 0-14 8 3 0 14" fill="#ffe38b"/>
</g>
<g id="i2-glass" stroke="#3d7375" stroke-width="3"><ellipse rx="12" ry="15" fill="#a6e0df"/><g id="i2-glass-roughness" fill="#d3e2d0" stroke="none"><path d="M-9-9q10-8 17 0l-2 4H-6Z"/><path d="M-10-2H8v6H-9Z"/><path d="M-8 7H7q-7 10-15 0Z"/></g><g id="i2-lens-rings"><path d="m-5-3 8-6" fill="none" stroke="#f1ffed" stroke-width="3" stroke-linecap="round"/></g></g>
<g id="i2-beam" pointer-events="none"><g transform="translate(471 190)"><g id="i2-beam-pivot"><path d="M0 0 147-25v58Z" fill="#ffe6a0" opacity=".35"/></g></g></g>
<g id="i2-boat" stroke="#3d5847" stroke-width="3.5" stroke-linejoin="round"><g class="i2-boat-bob">
 <ellipse cy="17" rx="43" ry="8" fill="#a0ccc4" stroke="none"/>
 <path d="m-40-7 80-2-13 24h-48Z" fill="#78a9a0"/><path d="m-32-7 63-1-6 8h-49Z" fill="#e1b779"/>
 <path d="M-3-10v-83l-29 65h29m6-59 29 53H3" fill="#fff6d8"/><path d="m-1-94 18 6-18 7" fill="#d98f71"/>
 <circle cx="-14" cy="6" r="3" fill="#f4d395"/><circle cx="7" cy="6" r="3" fill="#f4d395"/>
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
