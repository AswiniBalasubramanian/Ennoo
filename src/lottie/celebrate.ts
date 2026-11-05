/* Lottie (Bodymovin JSON) for the "goal created" moment, built in code so it ships with the app:
   a blue badge pops in, a white check draws itself, a ring pulses out and confetti bursts around it.
   400×400 canvas, 60 fps, plays once (~2 s) and rests on the final frame. */

type RGB = [number, number, number];
const hex = (h: string): RGB => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB;
const ease = { i: { x: [0.2], y: [1] }, o: { x: [0.3], y: [0] } };
const back = { i: { x: [0.3], y: [1.5] }, o: { x: [0.4], y: [0] } }; // overshoot for the pop
const still = (k: unknown) => ({ a: 0, k });
const anim = (frames: [number, number[]][], e = ease) => ({
  a: 1,
  k: frames.map(([t, s], n) => (n < frames.length - 1 ? { t, s, ...e } : { t, s })),
});
const tr = { ty: "tr", p: still([0, 0]), a: still([0, 0]), s: still([100, 100]), r: still(0), o: still(100) };
const fill = (c: RGB) => ({ ty: "fl", c: still([...c, 1]), o: still(100), r: 1 });
const stroke = (c: RGB, w: number) => ({ ty: "st", c: still([...c, 1]), o: still(100), w: still(w), lc: 2, lj: 2 });

let ind = 0;
const layer = (nm: string, ks: Record<string, unknown>, it: unknown[], ip = 0) => ({
  ddd: 0, ind: ++ind, ty: 4, nm, sr: 1, ao: 0, ip, op: 180, st: 0, bm: 0,
  ks: { o: still(100), r: still(0), p: still([200, 200, 0]), a: still([0, 0, 0]), s: still([100, 100, 100]), ...ks },
  shapes: [{ ty: "gr", nm, it: [...it, tr] }],
});

const BLUE = hex("#0054fb"), WHITE: RGB = [1, 1, 1];
const PALETTE = ["#0054fb", "#4d86f7", "#8db4ff", "#f5b301", "#12b76a", "#f97066"].map(hex);

// the white check, drawn on with a trim path once the badge has landed
const check = layer("check", {}, [
  { ty: "sh", ks: still({ c: false, v: [[-30, 2], [-9, 23], [32, -20]], i: [[0, 0], [0, 0], [0, 0]], o: [[0, 0], [0, 0], [0, 0]] }) },
  { ty: "tm", s: still(0), e: anim([[26, [0]], [52, [100]]]), o: still(0), m: 1 },
  stroke(WHITE, 13),
]);

const badge = layer("badge", { s: anim([[0, [0, 0, 100]], [24, [100, 100, 100]]], back) }, [
  { ty: "el", p: still([0, 0]), s: still([150, 150]) },
  fill(BLUE),
]);

// two soft rings pulsing out behind the badge
const ring = (delay: number, nm: string) => layer(nm, {
  s: anim([[delay, [60, 60, 100]], [delay + 50, [175, 175, 100]]]),
  o: anim([[delay, [70]], [delay + 50, [0]]]),
}, [{ ty: "el", p: still([0, 0]), s: still([150, 150]) }, stroke(hex("#8db4ff"), 6)]);

// confetti: 18 pieces fly out on even angles with a little jitter, spin, then fade
const confetti = Array.from({ length: 18 }, (_, n) => {
  const a = (n / 18) * Math.PI * 2 + (n % 2 ? 0.12 : -0.08);
  const dist = 120 + ((n * 37) % 50);
  const [x, y] = [200 + Math.cos(a) * dist, 200 + Math.sin(a) * dist];
  const start = 14 + (n % 3) * 3;
  const c = PALETTE[n % PALETTE.length];
  const shape = n % 3 === 0
    ? { ty: "el", p: still([0, 0]), s: still([12, 12]) }
    : { ty: "rc", p: still([0, 0]), s: still(n % 3 === 1 ? [16, 7] : [7, 16]), r: still(2) };
  return layer(`bit-${n}`, {
    p: anim([[start, [200 + Math.cos(a) * 60, 200 + Math.sin(a) * 60, 0]], [start + 40, [x, y + 14, 0]]]),
    r: anim([[start, [0]], [start + 70, [n % 2 ? 300 : -260]]]),
    o: anim([[start, [100]], [start + 44, [100]], [start + 70, [0]]]),
    s: anim([[start - 1, [0, 0, 100]], [start, [100, 100, 100]]]),
  }, [shape, fill(c)], start - 1);
});

// layer order: first in the list draws on top
export const celebrate = {
  v: "5.7.4", fr: 60, ip: 0, op: 120, w: 400, h: 400, nm: "Goal created", ddd: 0, assets: [],
  layers: [check, badge, ring(16, "ring-a"), ring(30, "ring-b"), ...confetti],
};

/* Confetti pops only, for the photo-carousel welcome: three bursts from different points, staggered */
const burst = (cx: number, cy: number, delay: number, count: number, seed: number) => Array.from({ length: count }, (_, n) => {
  const a = (n / count) * Math.PI * 2 + seed;
  const dist = 70 + ((n * 29 + seed * 10) % 60);
  const start = delay + (n % 3) * 2;
  const c = PALETTE[(n + seed * 3) % PALETTE.length];
  const shape = n % 3 === 0
    ? { ty: "el", p: still([0, 0]), s: still([10, 10]) }
    : { ty: "rc", p: still([0, 0]), s: still(n % 3 === 1 ? [14, 6] : [6, 14]), r: still(2) };
  return layer(`pop-${seed}-${n}`, {
    p: anim([[start, [cx, cy, 0]], [start + 36, [cx + Math.cos(a) * dist, cy + Math.sin(a) * dist + 18, 0]]]),
    r: anim([[start, [0]], [start + 70, [n % 2 ? 320 : -280]]]),
    o: anim([[start, [100]], [start + 40, [100]], [start + 66, [0]]]),
    s: anim([[start - 1, [0, 0, 100]], [start, [100, 100, 100]]]),
  }, [shape, fill(c)], start - 1);
});
export const pops = {
  v: "5.7.4", fr: 60, ip: 0, op: 150, w: 400, h: 400, nm: "Pops", ddd: 0, assets: [],
  layers: [...burst(200, 170, 6, 16, 0), ...burst(90, 120, 30, 12, 1), ...burst(310, 230, 48, 12, 2)],
};
