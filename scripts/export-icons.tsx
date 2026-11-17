/*
  Builds one SVG per activity (and per category) from the same icons the app draws.
  Combo and trio icons, which the app lays out with HTML spans, are flattened into a single SVG
  using the same offsets as combo() and trio() in src/sportIcons.tsx.
  Run with: node scripts/export-icons.mjs
*/
import type { ComponentType } from "react";
import { renderToStaticMarkup } from "react-dom/server";

type Any = ComponentType<any>;
const S = 256;

// pull each <svg>…</svg> out of the rendered markup, in document order
const svgs = (html: string) => html.match(/<svg[\s\S]*?<\/svg>/g) ?? [];
const at = (svg: string, x: number, y: number) => svg.replace(/^<svg/, `<svg x="${+x.toFixed(2)}" y="${+y.toFixed(2)}"`);

function compose(Icon: Any) {
  const html = renderToStaticMarkup(<Icon size={S} weight="duotone" />);
  const list = svgs(html);
  if (html.startsWith("<svg")) return { body: html, box: [0, 0, S, S] };
  if (html.includes("position:relative")) {
    // combo: main bottom-left at 0.84, badge top-right at 0.48, optional second badge top-left at 0.44
    const m = Math.round(S * 0.84), b = Math.round(S * 0.48);
    let body = at(list[0], 0, S - m) + at(list[1], S - b + S * 0.08, -S * 0.06);
    if (list[2]) body += at(list[2], -S * 0.04, -S * 0.1);
    return { body, box: [list[2] ? -S * 0.04 : 0, list[2] ? -S * 0.1 : -S * 0.06, S * 1.08, S] };
  }
  // trio: three at half size in a row, vertically centred
  const s = Math.round(S * 0.5), g = S * 0.02, y = (S - s) / 2;
  const body = list.map((v, i) => at(v, i * (s + g), y)).join("");
  return { body, box: [0, y, 3 * s + 2 * g, y + s] };
}

export function svg(Icon: Any, fg: string, tint: string) {
  const { body: raw, box } = compose(Icon);
  // square, centred view box with a little air so nothing touches the edge
  const [x0, y0, x1, y1] = box, side = Math.max(x1 - x0, y1 - y0) * 1.04, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const vb = [cx - side / 2, cy - side / 2, side, side].map((n) => +n.toFixed(2)).join(" ");
  // Phosphor's 20%-opacity duotone layer becomes the solid tint, as .duo-icon paints it in the app
  const body = raw
    .replace(/<([a-z]+)([^>]*?)\sopacity="0\.2"([^>]*?)>/g, (_t, tag, a, b) => `<${tag}${(a + b).replace(/fill="[^"]*"/, "")} fill="${tint}">`)
    .replace(/currentColor/g, fg)
    .replace(/var\(--white, #fff\)/g, "#ffffff");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="${vb}" fill="none">${body}</svg>\n`;
}
