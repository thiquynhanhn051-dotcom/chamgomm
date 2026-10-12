/* CHẠM GỐM — bộ vẽ minh họa gốm bằng SVG (không cần ảnh ngoài) */
(function () {
  const C = {
    blue: '#80AEE8', blueSoft: '#D7E6F8', blueDeep: '#3F78C0',
    wine: '#5B0015', wine2: '#8A2A40', wineSoft: '#EAD7D9', night: '#2E0009',
    ivory: '#F7F2E0', paper: '#EBE2C6', eel: '#B07F46', eel2: '#6E4421'
  };
  const col = (x) => C[x] || x;
  let uid = 0;
  const rnd = (seed) => { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };

  const SH = {
    vase:   { d: 'M84 22H116V46C116 64 152 84 152 128C152 164 132 178 100 178C68 178 48 164 48 128C48 84 84 64 84 46Z', t: 22, rx: 16, c: [100, 128], base: 178, sw: 52 },
    jar:    { d: 'M78 50H122C122 64 160 78 160 120C160 158 134 176 100 176C66 176 40 158 40 120C40 78 78 64 78 50Z', t: 50, rx: 22, c: [100, 120], base: 176, sw: 58 },
    cup:    { d: 'M52 70H148C148 132 140 172 100 172C60 172 52 132 52 70Z', t: 70, rx: 48, c: [100, 116], base: 172, sw: 46, handle: 'M147 88C180 84 180 136 143 138' },
    bowl:   { d: 'M26 94H174C174 148 142 172 100 172C58 172 26 148 26 94Z', t: 94, rx: 74, c: [100, 132], base: 172, sw: 70 },
    teapot: { d: 'M54 102C54 70 146 70 146 102C146 142 130 164 100 164C70 164 54 142 54 102Z', t: 76, rx: 0, c: [100, 120], base: 164, sw: 52,
              handle: 'M56 98C12 90 14 148 62 142', spout: 'M142 106C168 102 170 84 180 72L190 80C180 102 168 128 140 130Z', lid: 'M80 78C80 56 120 56 120 78Z' }
  };

  function flower(cx, cy, r, fill, center) {
    let p = '';
    for (let i = 0; i < 5; i++) {
      p += `<ellipse cx="${cx}" cy="${(cy - r * 0.6).toFixed(1)}" rx="${(r * 0.42).toFixed(1)}" ry="${(r * 0.5).toFixed(1)}" fill="${fill}" transform="rotate(${i * 72} ${cx} ${cy})"/>`;
    }
    return p + `<circle cx="${cx}" cy="${cy}" r="${(r * 0.2).toFixed(1)}" fill="${center || 'rgba(0,0,0,.18)'}"/>`;
  }

  function setInner(o) {
    const a = col(o.a || 'blue'), b = col(o.b || 'blueSoft'), ac = col(o.accent || 'wine');
    return `<ellipse cx="100" cy="177" rx="78" ry="6" fill="${C.wine}" opacity=".15"/>
      <rect x="32" y="98" width="136" height="76" rx="12" fill="${a}"/>
      <rect x="26" y="76" width="148" height="30" rx="10" fill="${b}"/>
      <rect x="92" y="76" width="16" height="98" fill="${ac}"/>
      <path d="M100 76C78 40 52 50 64 68C72 80 94 76 100 76Z" fill="${ac}"/>
      <path d="M100 76C122 40 148 50 136 68C128 80 106 76 100 76Z" fill="${ac}"/>
      <circle cx="100" cy="76" r="7" fill="${ac}"/>
      ${flower(60, 138, 14, b, a)}`;
  }

  function potInner(type, o) {
    o = o || {};
    if (type === 'set') return setInner(o);
    const s = SH[type] || SH.vase;
    const a = col(o.a || 'blue'), b = col(o.b || o.a || 'blueSoft'), ac = col(o.accent || 'wine');
    const id = 'g' + (++uid);
    const rand = rnd(uid + 3);
    const [cx, cy] = s.c;
    let h = `<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient><clipPath id="c${id}"><path d="${s.d}"/></clipPath></defs>`;
    h += `<ellipse cx="100" cy="${s.base + 5}" rx="${s.sw + 8}" ry="5" fill="${C.wine}" opacity=".16"/>`;
    if (s.handle) h += `<path d="${s.handle}" fill="none" stroke="url(#${id})" stroke-width="9" stroke-linecap="round"/>`;
    if (s.spout) h += `<path d="${s.spout}" fill="url(#${id})"/>`;
    h += `<path d="${s.d}" fill="url(#${id})"/>`;
    h += `<g clip-path="url(#c${id})">`;
    h += `<ellipse cx="${cx - 24}" cy="${cy - 4}" rx="9" ry="${type === 'bowl' ? 22 : 38}" fill="#fff" opacity=".22" transform="rotate(8 ${cx - 24} ${cy})"/>`;
    const deco = o.deco || 'none';
    if (deco === 'band') {
      h += `<rect x="0" y="${cy - 14}" width="200" height="8" fill="${ac}" opacity=".92"/><rect x="0" y="${cy + 2}" width="200" height="3" fill="${ac}" opacity=".92"/>`;
    } else if (deco === 'dots') {
      for (let i = 0; i < 16; i++) {
        h += `<circle cx="${(cx - 44 + rand() * 88).toFixed(1)}" cy="${(cy - 40 + rand() * 76).toFixed(1)}" r="${(1.4 + rand() * 1.6).toFixed(1)}" fill="${ac}" opacity=".72"/>`;
      }
    } else if (deco === 'flower') {
      h += flower(cx, cy, 22, ac, a) + flower(cx - 36, cy + 24, 9, ac, a) + flower(cx + 38, cy - 20, 8, ac, a);
    } else if (deco === 'drip') {
      [[56, 36], [76, 58], [98, 42], [120, 64], [142, 34]].forEach(([x, l]) => {
        h += `<rect x="${x - 8}" y="${s.t - 12}" width="16" height="${l + 12}" rx="8" fill="${ac}" opacity=".94"/>`;
      });
      h += `<rect x="0" y="${s.t - 12}" width="200" height="14" fill="${ac}" opacity=".94"/>`;
    }
    h += '</g>';
    if (s.lid) {
      h += `<path d="${s.lid}" fill="url(#${id})"/><circle cx="100" cy="54" r="6" fill="${ac}"/><rect x="76" y="76" width="48" height="4" rx="2" fill="${ac}" opacity=".8"/>`;
    } else {
      h += `<ellipse cx="100" cy="${s.t}" rx="${s.rx}" ry="6" fill="rgba(46,0,9,.4)"/><ellipse cx="100" cy="${s.t}" rx="${s.rx}" ry="6" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.5"/>`;
    }
    return h;
  }

  function pot(type, o) {
    o = o || {};
    const bg = o.bg ? `<rect width="200" height="200" rx="28" fill="${col(o.bg)}"/>` : '';
    return `<svg viewBox="0 0 200 200" role="img" aria-label="${o.label || 'Món gốm thủ công'}" xmlns="http://www.w3.org/2000/svg">${bg}${potInner(type, o)}</svg>`;
  }

  const SCHEMES = [
    { bg: 'blue', circ: 'ivory', a: 'wine', b: 'wine2', ac: 'ivory' },
    { bg: 'wine', circ: 'blue', a: 'ivory', b: 'paper', ac: 'blue' },
    { bg: 'paper', circ: 'blueSoft', a: 'blue', b: 'blueSoft', ac: 'wine' },
    { bg: 'blueSoft', circ: 'wine', a: 'ivory', b: 'paper', ac: 'wine' },
    { bg: 'wine2', circ: 'wine', a: 'blue', b: 'blueSoft', ac: 'wine' }
  ];
  const TYPES = ['vase', 'teapot', 'jar', 'cup', 'bowl', 'vase', 'jar'];
  const DECOS = ['flower', 'band', 'dots', 'drip'];

  function cover(seed, o) {
    o = o || {};
    const sc = SCHEMES[seed % SCHEMES.length];
    const t1 = o.type || TYPES[(seed * 3) % TYPES.length];
    const t2 = TYPES[(seed * 5 + 2) % TYPES.length];
    const t3 = TYPES[(seed * 2 + 4) % TYPES.length];
    const W = o.wide ? 640 : 400;
    const cxx = o.wide ? 330 + ((seed % 3) - 1) * 40 : 220 + (seed % 3) * 30;
    const fl = col(sc.circ === 'wine' ? 'blue' : sc.ac);
    let h = `<svg viewBox="0 0 ${W} 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">`;
    h += `<rect width="${W}" height="300" fill="${col(sc.bg)}"/>`;
    h += `<circle cx="${cxx}" cy="150" r="118" fill="${col(sc.circ)}" opacity=".92"/>`;
    h += `<circle cx="${cxx}" cy="150" r="136" fill="none" stroke="${col(sc.circ)}" stroke-width="1.5" stroke-dasharray="3 7" opacity=".7"/>`;
    h += `<svg x="${cxx - 105}" y="48" width="230" height="230" viewBox="0 0 200 200">${potInner(t1, { a: sc.a, b: sc.b, accent: sc.ac, deco: DECOS[seed % 4] })}</svg>`;
    h += `<svg x="${(o.wide ? 120 : 28) + (seed % 2) * 20}" y="156" width="124" height="124" viewBox="0 0 200 200">${potInner(t2, { a: sc.b, b: sc.a, accent: sc.ac, deco: DECOS[(seed + 2) % 4] })}</svg>`;
    if (o.wide) h += `<svg x="${cxx + 150}" y="170" width="104" height="104" viewBox="0 0 200 200">${potInner(t3, { a: sc.b, b: sc.a, accent: sc.ac, deco: DECOS[(seed + 1) % 4] })}</svg>`;
    h += flower(36, 44, 14, fl) + flower(W - 34, 52, 10, fl) + flower(W - 48, 262, 12, fl);
    h += `<path transform="scale(${W / 400} 1)" d="M0 284C60 268 120 300 200 284S340 268 400 286V300H0Z" fill="${C.wine}" opacity=".18"/>`;
    return h + '</svg>';
  }

  function heroArt() {
    const vase = 'M250 150H350V204C350 252 442 292 442 404C442 504 392 546 300 546C208 546 158 504 158 404C158 292 250 252 250 204Z';
    let rings = '';
    for (let y = 120; y <= 600; y += 28) rings += `<path d="M120 ${y}C220 ${y + 10} 380 ${y + 10} 480 ${y}" stroke="#fff" stroke-opacity=".2" stroke-width="2.4" fill="none"/>`;
    const embers = [[80, 560, 0], [520, 520, 1.4], [120, 330, 2.6], [500, 250, 0.8], [60, 160, 3.2], [540, 380, 2]]
      .map(([x, y, d]) => `<circle class="ember" cx="${x}" cy="${y}" r="4" fill="${C.blue}" style="animation-delay:${d}s"/>`).join('');
    return `<svg viewBox="0 0 600 700" role="img" aria-label="Minh họa nghệ nhân tạo hình bình gốm trên bàn xoay" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.blueSoft}"/></linearGradient>
        <clipPath id="hvc"><path d="${vase}"/></clipPath>
      </defs>
      <circle cx="300" cy="330" r="270" fill="${C.wine2}" opacity=".55"/>
      <circle class="spin" cx="300" cy="330" r="300" fill="none" stroke="${C.blue}" stroke-opacity=".5" stroke-width="1.5" stroke-dasharray="4 12"/>
      ${flower(86, 120, 30, C.blue, C.wine)}${flower(520, 150, 22, C.ivory, C.wine)}${flower(500, 600, 26, C.blue, C.wine)}
      <path d="${vase}" fill="url(#hv)"/>
      <g clip-path="url(#hvc)"><g class="ringflow">${rings}</g>
        <ellipse cx="232" cy="400" rx="16" ry="96" fill="#fff" opacity=".28" transform="rotate(6 232 400)"/>
        <rect x="150" y="250" width="300" height="9" fill="${C.wine}" opacity=".85"/><rect x="150" y="272" width="300" height="3" fill="${C.wine}" opacity=".85"/>
        ${flower(300, 420, 44, C.wine, C.blue)}
      </g>
      <ellipse cx="300" cy="150" rx="50" ry="10" fill="${C.night}" opacity=".5"/>
      <ellipse cx="300" cy="556" rx="196" ry="30" fill="${C.ivory}"/>
      <ellipse cx="300" cy="548" rx="176" ry="22" fill="${C.paper}"/>
      <path d="M186 580H414L392 650H208Z" fill="${C.blue}"/>
      <rect x="170" y="648" width="260" height="22" rx="11" fill="${C.ivory}"/>
      ${embers}
    </svg>`;
  }

  window.ART = { C, col, pot, potInner, cover, heroArt, flower };
})();
