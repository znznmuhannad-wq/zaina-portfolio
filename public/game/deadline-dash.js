/* =========================================================================
   DEADLINE DASH — a tiny endless runner starring pixel-Zaina.
   Loaded on demand by showGameSection() (portfolio.runtime.js), so it costs
   nothing until someone opens the "Mini Game" folder.

   World units: the playfield is always 300 units tall; its width follows the
   canvas aspect ratio. Everything is drawn in those units and scaled once.
   ========================================================================= */
(function () {
  'use strict';

  var ASSETS = '/game/';
  var VH = 300;              // virtual height
  var GROUND = 262;          // y of the ground line
  var C = {
    grid: '#7686FC', line: 'rgba(255,255,255,0.13)', ground: '#5B66D6', dash: '#8E98FF',
    ink: '#2C2C2C', lilac: '#E9D8FF', white: '#FFFFFF', gold: '#FFE27A',
    coral: '#E36A67', teal: '#428A97', yellow: '#F2B11C', pink: '#FF6FB5'
  };

  /* ---------- 5x7 bitmap font (uppercase, digits, a few symbols) ---------- */
  var FONT = {
    'A':'01110100011000111111100011000110001','B':'11110100011000111110100011000111110',
    'C':'01110100011000010000100001000101110','D':'11110100011000110001100011000111110',
    'E':'11111100001000011110100001000011111','F':'11111100001000011110100001000010000',
    'G':'01110100011000010111100011000101111','H':'10001100011000111111100011000110001',
    'I':'01110001000010000100001000010001110','J':'00111000100001000010000101001001100',
    'K':'10001100101010011000101001001010001','L':'10000100001000010000100001000011111',
    'M':'10001110111010110101100011000110001','N':'10001100011100110101100111000110001',
    'O':'01110100011000110001100011000101110','P':'11110100011000111110100001000010000',
    'Q':'01110100011000110001101011001001101','R':'11110100011000111110101001001010001',
    'S':'01111100001000001110000010000111110','T':'11111001000010000100001000010000100',
    'U':'10001100011000110001100011000101110','V':'10001100011000110001100010101000100',
    'W':'10001100011000110101101011010101010','X':'10001100010101000100010101000110001',
    'Y':'10001100010101000100001000010000100','Z':'11111000010001000100010001000011111',
    '0':'01110100011001110101110011000101110','1':'00100011000010000100001000010001110',
    '2':'01110100010000100010001000100011111','3':'11111000100010000010000011000101110',
    '4':'00010001100101010010111110001000010','5':'11111100001111000001000011000101110',
    '6':'00110010001000011110100011000101110','7':'11111000010001000100010000100001000',
    '8':'01110100011000101110100011000101110','9':'01110100011000101111000010001001100',
    ' ':'00000000000000000000000000000000000','!':'00100001000010000100001000000000100',
    '?':'01110100010000100010001000000000100','.':'00000000000000000000000000110001100',
    ',':'00000000000000000000011000010001000',':':'00000011000110000000011000110000000',
    '#':'01010010101111101010111110101001010','-':'00000000000000011111000000000000000',
    '+':'00000001000010011111001000010000000',"'":'00100001000100000000000000000000000',
    '/':'00001000100001000100010000100010000','*':'00000010101111111111011100010000000'
  };

  function textWidth(str, s) { return str.length * 6 * s - s; }
  function drawText(ctx, str, x, y, s, color, align, shadow) {
    str = String(str).toUpperCase();
    var w = textWidth(str, s);
    if (align === 'center') x -= w / 2; else if (align === 'right') x -= w;
    x = Math.round(x); y = Math.round(y);
    if (shadow) drawText(ctx, str, x + s, y + s, s, shadow, 'left', null);
    ctx.fillStyle = color;
    for (var i = 0; i < str.length; i++) {
      var g = FONT[str[i]] || FONT['?'];
      for (var p = 0; p < 35; p++) if (g.charCodeAt(p) === 49) ctx.fillRect(x + (p % 5) * s, y + ((p / 5) | 0) * s, s, s);
      x += 6 * s;
    }
  }

  /* ---------- tiny pixel icons ---------- */
  var ICONS = {
    coffee: { pal: { d: C.ink, w: '#FFFFFF', c: '#EADBC8', b: '#A86B3C', s: '#FF6FB5' },
      map: ['....ss....','..dddsdd..','.dwwwwwwd.','dwwwwwwwwd','.dddddddd.','.dccccccd.','.dbbbbbbd.','.dbbbbbbd.','..dbbbbd..','..dbbbbd..','..dddddd..'] },
    heart: { pal: { d: C.ink, p: C.pink, h: '#FFC2E0' },
      map: ['.dd...dd.','dphd.dppd','dhppdpppd','dpppppppd','.dpppppd.','..dpppd..','...dpd...','....d....'] },
    bug: { pal: { d: C.ink, g: '#7BD88F', w: '#FFFFFF' },
      map: ['..d...d..','...d.d...','.ddgggdd.','dgggggggd','dgwdgdwgd','dgggggggd','.dgdgdgd.','..d.d.d..'] },
    spark: { pal: { w: '#FFFFFF' }, map: ['..w..', '..w..', 'wwwww', '..w..', '..w..'] }
  };
  function drawIcon(ctx, name, x, y, px) {
    var ic = ICONS[name];
    for (var r = 0; r < ic.map.length; r++) for (var c = 0; c < ic.map[r].length; c++) {
      var k = ic.map[r][c]; if (k === '.') continue;
      ctx.fillStyle = ic.pal[k]; ctx.fillRect(x + c * px, y + r * px, px, px);
    }
  }
  function iconSize(name, px) { var m = ICONS[name].map; return { w: m[0].length * px, h: m.length * px }; }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* ---------- content ---------- */
  var OBSTACLES = [
    { lines: ['DEADLINE'], color: C.coral, ink: C.white, w: 50, h: 34 },
    { lines: ['REVISION', '#7'], color: C.teal, ink: C.white, w: 50, h: 42 },
    { lines: ['ASAP'], color: C.yellow, ink: C.ink, w: 34, h: 30 },
    { lines: ['CLIENT', 'FEEDBACK'], color: '#B54F4D', ink: C.white, w: 58, h: 48 },
    { lines: ['BUG'], color: '#2D6874', ink: C.white, w: 36, h: 36, bug: true }
  ];
  var BUBBLES = ['MAKE THE LOGO BIGGER?', 'CAN IT POP MORE?', 'QUICK SMALL CHANGE', 'USE COMIC SANS?'];
  var TILES = [['PS', '#001E36', '#31A8FF'], ['AI', '#330000', '#FF9A00'], ['ID', '#49021F', '#FF3366'], ['PR', '#00005B', '#9999FF'], ['AE', '#00005B', '#9999FF']];
  var OVER_LINES = ['THE CLIENT WANTED IT YESTERDAY', 'REVISION #8 INCOMING', 'SHE NEEDS MORE COFFEE', "CTRL+Z DOESN'T WORK HERE", 'THE DEADLINE WON THIS ROUND'];

  /* ---------- storage (never trusted to exist) ---------- */
  function loadHi() { try { return +localStorage.getItem('zc-dash-hi') || 0; } catch (e) { return 0; } }
  function saveHi(v) { try { localStorage.setItem('zc-dash-hi', String(v)); } catch (e) {} }

  /* ---------- game ---------- */
  var G = null;

  function loadImages(cb) {
    var names = ['walk', 'stand', 'happy', 'smile', 'think', 'wink'], imgs = {}, left = names.length;
    names.forEach(function (n) {
      var im = new Image();
      im.onload = im.onerror = function () { if (--left === 0) cb(imgs); };
      im.src = ASSETS + n + '.webp';
      imgs[n] = im;
    });
  }

  function create(stage) {
    var canvas = stage.querySelector('canvas');
    var ctx = canvas.getContext('2d');
    var g = {
      stage: stage, canvas: canvas, ctx: ctx, imgs: null, raf: 0, last: 0,
      VW: 500, scale: 1, dpr: 1,
      state: 'loading', hi: loadHi(), lockUntil: 0, newHi: false, overLine: '',
      t: 0, speed: 0, dist: 0, bonus: 0, score: 0, gridX: 0, groundX: 0,
      player: null, obstacles: [], items: [], particles: [], pops: [], sparks: [],
      face: 'smile', faceUntil: 0, shieldUntil: 0, spawnIn: 0, itemIn: 0,
      holding: false, jumpBuffer: 0, paused: false, visible: false
    };
    G = g;
    resize();
    for (var i = 0; i < 9; i++) g.sparks.push({ x: Math.random() * 900, y: 30 + Math.random() * 170, s: 1 + Math.random() * 1.5, tw: Math.random() * 6 });
    reset();
    bind();
    loadImages(function (imgs) { g.imgs = imgs; g.state = 'ready'; });
    g.last = performance.now();
    g.raf = requestAnimationFrame(loop);
  }

  function resize() {
    var g = G; if (!g) return;
    var r = g.stage.getBoundingClientRect();
    var w = Math.max(240, r.width), h = Math.max(200, r.height);
    g.dpr = Math.min(window.devicePixelRatio || 1, 2);
    g.canvas.width = Math.round(w * g.dpr); g.canvas.height = Math.round(h * g.dpr);
    g.canvas.style.width = w + 'px'; g.canvas.style.height = h + 'px';
    g.scale = h / VH; g.VW = w / g.scale;
  }

  function reset() {
    var g = G;
    g.player = { x: 0, y: GROUND, vy: 0, w: 48, h: 82, onGround: true, coyote: 0, land: 0, phase: 0, dustIn: 0 };
    g.obstacles = []; g.items = []; g.particles = []; g.pops = [];
    g.t = 0; g.speed = 230; g.dist = 0; g.bonus = 0; g.score = 0;
    g.spawnIn = 1.1; g.itemIn = 0.8; g.shieldUntil = 0; g.face = 'smile'; g.faceUntil = 0; g.newHi = false;
  }

  function start() { var g = G; reset(); g.state = 'running'; g.paused = false; g.canvas.focus({ preventScroll: true }); }

  /* ---------- input ---------- */
  function press() {
    var g = G; if (!g) return;
    var now = performance.now();
    if (g.state === 'ready') { start(); return; }
    if (g.state === 'over') { if (now >= g.lockUntil) start(); return; }
    if (g.paused) { g.paused = false; g.last = now; return; }
    g.holding = true; g.jumpBuffer = 0.12;
  }
  function release() { var g = G; if (!g) return; g.holding = false; if (g.player.vy < -300) g.player.vy = -300; }

  function onKey(e) {
    var g = G; if (!g || g.stage.offsetParent === null) return;
    var k = e.code;
    if (k !== 'Space' && k !== 'ArrowUp' && k !== 'KeyW') return;
    var engaged = g.state === 'running' || document.activeElement === g.canvas || g.visible;
    if (!engaged) return;
    e.preventDefault();
    if (e.type === 'keydown') { if (!e.repeat) press(); } else release();
  }
  function onDown(e) { e.preventDefault(); G.canvas.focus({ preventScroll: true }); press(); }
  function onUp() { release(); }
  function onVis() { if (document.hidden && G && G.state === 'running') G.paused = true; }

  var ro = null, io = null;
  function bind() {
    var g = G;
    window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey);
    g.canvas.addEventListener('pointerdown', onDown); window.addEventListener('pointerup', onUp);
    document.addEventListener('visibilitychange', onVis);
    if ('ResizeObserver' in window) { ro = new ResizeObserver(resize); ro.observe(g.stage); } else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (en) {
        if (!G) return;
        G.visible = en[0].isIntersecting;
        if (!G.visible && G.state === 'running') G.paused = true;
      }, { threshold: 0.3 });
      io.observe(g.stage);
    }
  }
  function unbind() {
    window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey);
    if (G) G.canvas.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp); document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('resize', resize);
    if (ro) { ro.disconnect(); ro = null; } if (io) { io.disconnect(); io = null; }
  }

  /* ---------- update ---------- */
  function setFace(name, secs) { G.face = name; G.faceUntil = G.t + secs; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  function spawnObstacle() {
    var g = G, x = g.VW + 30;
    if (g.dist > 2600 && Math.random() < 0.22) {
      var txt = BUBBLES[(Math.random() * BUBBLES.length) | 0];
      g.obstacles.push({ kind: 'bubble', text: txt, x: x, y: GROUND - 118, w: textWidth(txt, 1) + 16, h: 22 });
    } else {
      var o = OBSTACLES[(Math.random() * OBSTACLES.length) | 0];
      g.obstacles.push({ kind: 'block', o: o, x: x, y: GROUND - o.h, w: o.w, h: o.h });
      if (g.dist > 4000 && Math.random() < 0.25) { var o2 = OBSTACLES[2]; g.obstacles.push({ kind: 'block', o: o2, x: x + o.w + 2, y: GROUND - o2.h, w: o2.w, h: o2.h }); }
    }
    var gap = g.speed * rand(0.95, 1.7) + 120;
    g.spawnIn = gap / g.speed;
  }

  function spawnItem() {
    var g = G, r = Math.random(), x = g.VW + 30, y = GROUND - rand(55, 140);
    if (r < 0.16) g.items.push({ kind: 'coffee', x: x, y: y, w: 20, h: 22 });
    else if (r < 0.58) { var t = TILES[(Math.random() * TILES.length) | 0]; g.items.push({ kind: 'tile', t: t, x: x, y: y, w: 22, h: 22 }); }
    else g.items.push({ kind: 'heart', x: x, y: y, w: 18, h: 16 });
    g.itemIn = rand(0.9, 2.2);
  }

  function hit(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

  function dust(x, y, n, spread) {
    for (var i = 0; i < n; i++) G.particles.push({ x: x, y: y, vx: -rand(20, 70) - G.speed * 0.15, vy: -rand(10, spread), life: rand(0.25, 0.5), age: 0, s: rand(2, 4) });
  }

  function update(dt) {
    var g = G, p = g.player;
    g.t += dt;
    if (g.state !== 'running' || g.paused) {
      g.gridX = (g.gridX + dt * 25) % 48;
      return;
    }
    g.speed = Math.min(600, g.speed + dt * 7);
    var dx = g.speed * dt;
    g.dist += dx; g.gridX = (g.gridX + dx * 0.35) % 48; g.groundX = (g.groundX + dx) % 40;
    p.x = Math.max(36, g.VW * 0.16);

    // jump with buffer + coyote time; releasing early cuts the jump (variable height)
    g.jumpBuffer -= dt; p.coyote -= dt;
    if (g.jumpBuffer > 0 && (p.onGround || p.coyote > 0)) {
      p.vy = -690; p.onGround = false; p.coyote = 0; g.jumpBuffer = 0; dust(p.x + 18, GROUND, 6, 60);
    }
    p.vy += 1850 * dt; p.y += p.vy * dt;
    if (p.y >= GROUND) {
      if (!p.onGround) { p.land = 0.12; dust(p.x + 20, GROUND, 8, 50); }
      p.y = GROUND; p.vy = 0; p.onGround = true; p.coyote = 0.08;
    } else if (p.onGround) { p.onGround = false; }
    p.land = Math.max(0, p.land - dt);
    p.phase += dt * (8 + g.speed / 40);
    if (p.onGround) { p.dustIn -= dt; if (p.dustIn <= 0) { dust(p.x + 14, GROUND, 1, 25); p.dustIn = 0.09; } }

    g.spawnIn -= dt; if (g.spawnIn <= 0) spawnObstacle();
    g.itemIn -= dt; if (g.itemIn <= 0) spawnItem();

    var box = { x: p.x + 12, y: p.y - p.h + 8, w: p.w - 24, h: p.h - 10 };
    var shield = g.t < g.shieldUntil;

    for (var i = g.obstacles.length - 1; i >= 0; i--) {
      var o = g.obstacles[i]; o.x -= dx * (o.kind === 'bubble' ? 1.12 : 1);
      if (o.x + o.w < -20) { g.obstacles.splice(i, 1); continue; }
      if (!o.dead && hit(box, { x: o.x + 3, y: o.y + 3, w: o.w - 6, h: o.h - 3 })) {
        if (shield) { o.dead = true; g.bonus += 15; g.pops.push({ x: o.x, y: o.y - 8, txt: 'SMASHED!', age: 0 }); dust(o.x + o.w / 2, o.y + o.h / 2, 14, 120); }
        else { gameOver(); return; }
      }
      if (o.dead) o.y += dt * 260;
    }
    for (var j = g.items.length - 1; j >= 0; j--) {
      var it = g.items[j]; it.x -= dx;
      if (it.x + it.w < -20) { g.items.splice(j, 1); continue; }
      if (hit(box, it)) {
        g.items.splice(j, 1);
        if (it.kind === 'coffee') { g.bonus += 50; g.shieldUntil = g.t + 4; setFace('wink', 1.6); g.pops.push({ x: it.x, y: it.y, txt: 'CAFFEINATED!', age: 0 }); }
        else if (it.kind === 'tile') { g.bonus += 25; setFace('happy', 0.7); g.pops.push({ x: it.x, y: it.y, txt: '+25', age: 0 }); }
        else { g.bonus += 10; setFace('happy', 0.6); g.pops.push({ x: it.x, y: it.y, txt: '+10', age: 0 }); }
      }
    }
    for (var k = g.particles.length - 1; k >= 0; k--) { var q = g.particles[k]; q.age += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 160 * dt; if (q.age > q.life) g.particles.splice(k, 1); }
    for (var m = g.pops.length - 1; m >= 0; m--) { g.pops[m].age += dt; if (g.pops[m].age > 0.9) g.pops.splice(m, 1); }
    if (g.t > g.faceUntil) g.face = 'smile';
    g.score = Math.floor(g.dist / 12) + g.bonus;
  }

  function gameOver() {
    var g = G;
    g.state = 'over'; g.lockUntil = performance.now() + 650; g.holding = false;
    g.overLine = OVER_LINES[(Math.random() * OVER_LINES.length) | 0];
    if (g.score > g.hi) { g.hi = g.score; g.newHi = true; saveHi(g.hi); }
    dust(g.player.x + 24, g.player.y - 40, 18, 160);
  }

  /* ---------- draw ---------- */
  function drawFaceBox(ctx, name, cx, y, size) {
    var g = G, img = g.imgs && g.imgs[name];
    ctx.fillStyle = C.ink; roundRect(ctx, cx - size / 2 - 2, y - 2, size + 4, size + 4, 7); ctx.fill();
    ctx.fillStyle = C.lilac; roundRect(ctx, cx - size / 2, y, size, size, 6); ctx.fill();
    if (img && img.complete && img.naturalWidth) {
      ctx.save(); roundRect(ctx, cx - size / 2, y, size, size, 6); ctx.clip();
      var w = size * 1.25, h = w * img.naturalHeight / img.naturalWidth;
      ctx.drawImage(img, cx - w / 2, y + size * 0.12, w, h); ctx.restore();
    }
  }

  function drawPlayer(ctx) {
    var g = G, p = g.player, img = g.imgs && (g.state === 'ready' ? g.imgs.stand : g.imgs.walk);
    if (!img || !img.naturalWidth) return;
    var h = p.h + 6, w = h * img.naturalWidth / img.naturalHeight;
    var running = g.state === 'running' && !g.paused;
    var bob = running && p.onGround ? -Math.abs(Math.sin(p.phase)) * 5 : (g.state === 'ready' ? Math.sin(g.t * 3) * 1.5 : 0);
    var rot = 0, sx = 1, sy = 1;
    if (running) {
      rot = p.onGround ? Math.sin(p.phase) * 0.06 + 0.05 : 0.16;   // goofy waddle, leans into jumps
      if (p.land > 0) { sy = 0.86; sx = 1.12; }
    }
    if (g.state === 'over') rot = -0.45;
    var footX = p.x + w / 2, footY = p.y + bob;
    if (g.t < g.shieldUntil && g.state === 'running') {                // coffee shield
      ctx.save(); ctx.globalAlpha = 0.35 + 0.2 * Math.sin(g.t * 18); ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.ellipse(footX, footY - h / 2, w * 0.72, h * 0.6, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.fillStyle = 'rgba(44,44,44,0.22)';                              // shadow
    var sh = Math.max(0.35, 1 - (GROUND - p.y) / 160);
    ctx.beginPath(); ctx.ellipse(footX, GROUND + 2, w * 0.38 * sh, 4 * sh, 0, 0, Math.PI * 2); ctx.fill();
    ctx.save(); ctx.translate(footX, footY); ctx.rotate(rot); ctx.scale(sx, sy);
    ctx.imageSmoothingEnabled = true; ctx.drawImage(img, -w / 2, -h, w, h); ctx.restore();
  }

  function draw() {
    var g = G, ctx = g.ctx, s = g.scale * g.dpr, VW = g.VW;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // sky: purple grid like the character sheet
    ctx.fillStyle = C.grid; ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = C.line;
    for (var x = -g.gridX; x < VW; x += 48) ctx.fillRect(x, 0, 2, GROUND);
    for (var y = 0; y < GROUND; y += 48) ctx.fillRect(0, y, VW, 2);
    g.sparks.forEach(function (sp) {
      var sx = ((sp.x - g.dist * 0.08) % (VW + 40) + VW + 40) % (VW + 40) - 20;
      ctx.globalAlpha = 0.45 + 0.4 * Math.sin(g.t * 2 + sp.tw); drawIcon(ctx, 'spark', sx, sp.y, sp.s); ctx.globalAlpha = 1;
    });

    // ground
    ctx.fillStyle = C.ink; ctx.fillRect(0, GROUND, VW, 3);
    ctx.fillStyle = C.ground; ctx.fillRect(0, GROUND + 3, VW, VH - GROUND);
    ctx.fillStyle = C.dash;
    for (var gx = -g.groundX; gx < VW; gx += 40) ctx.fillRect(gx, GROUND + 12, 20, 3);

    // items
    g.items.forEach(function (it) {
      var fy = it.y + Math.sin(g.t * 4 + it.x * 0.05) * 2;
      if (it.kind === 'coffee') drawIcon(ctx, 'coffee', it.x, fy, 2);
      else if (it.kind === 'heart') drawIcon(ctx, 'heart', it.x, fy, 2);
      else {
        ctx.fillStyle = C.ink; roundRect(ctx, it.x - 1.5, fy - 1.5, it.w + 3, it.h + 3, 5); ctx.fill();
        ctx.fillStyle = it.t[1]; roundRect(ctx, it.x, fy, it.w, it.h, 4); ctx.fill();
        drawText(ctx, it.t[0], it.x + it.w / 2 + 0.5, fy + 7.5, 1, it.t[2], 'center');
      }
    });

    // obstacles
    g.obstacles.forEach(function (o) {
      if (o.kind === 'bubble') {
        ctx.fillStyle = C.ink; roundRect(ctx, o.x - 2, o.y - 2, o.w + 4, o.h + 4, 7); ctx.fill();
        ctx.fillStyle = C.white; roundRect(ctx, o.x, o.y, o.w, o.h, 6); ctx.fill();
        ctx.fillStyle = C.ink; ctx.fillRect(o.x + 10, o.y + o.h + 2, 6, 4); ctx.fillStyle = C.white; ctx.fillRect(o.x + 12, o.y + o.h, 3, 4);
        drawText(ctx, o.text, o.x + o.w / 2, o.y + 7.5, 1, C.ink, 'center');
        return;
      }
      ctx.save(); if (o.dead) { ctx.globalAlpha = 0.6; }
      ctx.fillStyle = 'rgba(44,44,44,0.3)'; ctx.fillRect(o.x + 4, o.y + 4, o.w, o.h);
      ctx.fillStyle = C.ink; roundRect(ctx, o.x - 2, o.y - 2, o.w + 4, o.h + 4, 5); ctx.fill();
      ctx.fillStyle = o.o.color; roundRect(ctx, o.x, o.y, o.w, o.h, 4); ctx.fill();
      if (o.o.bug) drawIcon(ctx, 'bug', o.x + o.w / 2 - 9, o.y + 6, 2);
      var lines = o.o.lines, ty = o.y + (o.o.bug ? o.h - 11 : o.h / 2 - lines.length * 4.5 + 1);
      lines.forEach(function (ln, i) { drawText(ctx, ln, o.x + o.w / 2 + 0.5, ty + i * 9, 1, o.o.ink, 'center'); });
      ctx.restore();
    });

    // particles
    ctx.fillStyle = C.lilac;
    g.particles.forEach(function (q) { ctx.globalAlpha = Math.max(0, 1 - q.age / q.life); ctx.fillRect(q.x, q.y, q.s, q.s); });
    ctx.globalAlpha = 1;

    drawPlayer(ctx);
    ctx.imageSmoothingEnabled = false;

    // floating score pops
    g.pops.forEach(function (pp) { ctx.globalAlpha = 1 - pp.age / 0.9; drawText(ctx, pp.txt, pp.x, pp.y - pp.age * 30, 1, C.gold, 'left', C.ink); });
    ctx.globalAlpha = 1;

    // HUD
    drawText(ctx, 'SCORE ' + pad(g.score), 10, 12, 2, C.white, 'left', C.ink);
    drawText(ctx, 'HI ' + pad(g.hi), VW - 10, 12, 2, C.white, 'right', C.ink);
    drawFaceBox(ctx, g.state === 'over' ? (g.newHi ? 'wink' : 'think') : (g.state === 'ready' ? 'happy' : g.face), VW / 2, 8, 30);

    // overlays
    if (g.state === 'loading') centerText(ctx, ['LOADING...'], VW);
    if (g.state === 'ready') {
      panel(ctx, VW, 56, 104);
      drawText(ctx, 'DEADLINE DASH', VW / 2, 72, 3, C.white, 'center', C.ink);
      drawText(ctx, 'OUTRUN THE DEADLINES. GRAB COFFEE!', VW / 2, 106, 1, C.lilac, 'center');
      if (Math.sin(g.t * 5) > -0.2) drawText(ctx, 'PRESS SPACE OR TAP TO RUN', VW / 2, 132, 1, C.gold, 'center', C.ink);
    }
    if (g.state === 'running' && g.paused) { panel(ctx, VW, 90, 40); drawText(ctx, 'PAUSED - TAP TO GO', VW / 2, 104, 2, C.white, 'center', C.ink); }
    if (g.state === 'over') {
      ctx.fillStyle = 'rgba(44,44,44,0.35)'; ctx.fillRect(0, 0, VW, VH);
      panel(ctx, VW, 62, 128);
      drawText(ctx, g.newHi ? 'NEW HIGH SCORE!' : 'DEADLINE MISSED!', VW / 2, 76, 2, g.newHi ? C.gold : C.white, 'center', C.ink);
      drawText(ctx, g.overLine, VW / 2, 102, 1, C.lilac, 'center');
      drawText(ctx, 'SCORE ' + pad(g.score), VW / 2, 124, 2, C.white, 'center', C.ink);
      if (performance.now() >= g.lockUntil && Math.sin(g.t * 5) > -0.2) drawText(ctx, 'SPACE / TAP TO TRY AGAIN', VW / 2, 158, 1, C.gold, 'center', C.ink);
    }
  }
  function pad(n) { n = String(n); while (n.length < 5) n = '0' + n; return n; }
  function panel(ctx, VW, y, h) {
    var w = Math.min(VW - 24, 300);
    ctx.fillStyle = C.ink; roundRect(ctx, VW / 2 - w / 2 - 2, y - 2, w + 4, h + 4, 10); ctx.fill();
    ctx.fillStyle = 'rgba(91,102,214,0.96)'; roundRect(ctx, VW / 2 - w / 2, y, w, h, 9); ctx.fill();
  }
  function centerText(ctx, lines, VW) { lines.forEach(function (l, i) { drawText(ctx, l, VW / 2, 130 + i * 14, 2, C.white, 'center', C.ink); }); }

  function loop(now) {
    if (!G) return;
    var dt = Math.min(0.033, (now - G.last) / 1000); G.last = now;
    update(dt); draw();
    G.raf = requestAnimationFrame(loop);
  }

  /* ---------- public API ---------- */
  window.DeadlineDash = {
    mount: function (stage) {
      if (G && G.stage === stage) {           // re-opened: resume drawing at the start screen
        if (!G.raf) { G.state = G.imgs ? 'ready' : 'loading'; reset(); bind(); resize(); G.last = performance.now(); G.raf = requestAnimationFrame(loop); }
        return;
      }
      create(stage);
    },
    state: function () { return G ? (G.paused ? 'paused' : G.state) : 'none'; },
    stop: function () {
      if (!G) return;
      cancelAnimationFrame(G.raf); G.raf = 0; unbind();
      if (G.state === 'running') G.state = 'ready';
    }
  };
})();
