// Exports every activity and category icon to assets/icons as SVG (default and selected colours).
import { createServer } from "vite";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";

const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { svg } = await server.ssrLoadModule("/scripts/export-icons.tsx");
  const { activities, groupInfo } = await server.ssrLoadModule("/src/data.ts");
  // the app's colours: ink outline + blue fill, and the selected state in brand blue + light blue
  const looks = { default: ["#0b1220", "#4D86F7"], selected: ["#0054fb", "#8DB4FF"] };
  const out = "assets/icons";
  rmSync(out, { recursive: true, force: true });
  let n = 0;
  for (const [look, [fg, tint]] of Object.entries(looks)) {
    for (const a of activities) {
      const dir = `${out}/${look}/activities/${a.group.toLowerCase()}`;
      mkdirSync(dir, { recursive: true });
      writeFileSync(`${dir}/${a.id}.svg`, svg(a.Icon, fg, tint)); n++;
    }
    mkdirSync(`${out}/${look}/categories`, { recursive: true });
    for (const [g, v] of Object.entries(groupInfo)) { writeFileSync(`${out}/${look}/categories/${g.toLowerCase()}.svg`, svg(v.Icon, fg, tint)); n++; }
  }
  console.log(`wrote ${n} icons to ${out}`);
} finally {
  await server.close();
}
