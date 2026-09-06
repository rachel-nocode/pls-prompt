type Point = [number, number, number, number];
const points: Point[] = [];
for (let a = 0; a <= Math.PI; a += .018) for (let r = 1.52; r <= 1.85; r += .055) for (const z of [-.34, .34]) points.push([Math.cos(a) * r, .4 + Math.sin(a) * r, z, .38 + .5 * Math.sin(a)]);
for (const side of [-1, 1]) for (let y = -1.48; y < .4; y += .034) for (let x = 1.52; x <= 1.85; x += .07) for (const z of [-.34, .34]) points.push([x * side, y, z, .42 + (x - 1.52)]);
for (let a = 0; a < Math.PI * 2; a += .012) for (const r of [1.1, 1.35, 1.65, 2.25, 2.32, 2.5]) points.push([Math.cos(a) * r, -1.42 - (r > 2 ? .14 : 0), Math.sin(a) * r * .62, .24 + .3 * Math.max(0, Math.sin(a))]);
for (let a = 0; a < Math.PI; a += .05) for (let b = 0; b < Math.PI * 2; b += .065) points.push([.68 * Math.sin(a) * Math.cos(b), .5 + .68 * Math.cos(a), .68 * Math.sin(a) * Math.sin(b), .2 + .78 * Math.max(0, Math.cos(a) * .65 - Math.sin(a) * Math.cos(b) * .35)]);
export function asciiPortal(phase = 0) {
  const width = 150, height = 58; const grid = new Array(width * height).fill(" "); const depth = new Float32Array(width * height).fill(-Infinity); const chars = " .,:;+=ox%#@";
  const yaw = -.25 + Math.sin(phase) * .045;
  for (const [x, y, z, light] of points) {
    const px = x * Math.cos(yaw) + z * Math.sin(yaw); const pz = z * Math.cos(yaw) - x * Math.sin(yaw);
    const col = Math.round(width / 2 + px * 25); const row = Math.round(34 - y * 12 + pz * 4);
    if (col < 0 || col >= width || row < 0 || row >= height) continue;
    const index = row * width + col;
    if (pz > depth[index]) { depth[index] = pz; grid[index] = chars[Math.min(chars.length - 1, Math.max(1, Math.floor(light * 10)))]; }
  }
  return Array.from({ length: height }, (_, row) => grid.slice(row * width, (row + 1) * width).join("")).join("\n");
}
