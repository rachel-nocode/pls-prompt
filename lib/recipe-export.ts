import type { Recipe } from "./recipe-types";

export function recipeText(recipe: Recipe): string {
  if (recipe.format === "skill") return recipe.files.map(file => `## ${file.name}\n\n${file.content}`).join("\n\n");
  if (recipe.format === "single") return recipe.steps[0]?.text ?? "";
  return recipe.steps.map(step => step.text).join("\n\n");
}
export function recipeMarkdown(recipe: Recipe, version: string): string {
  return `# ${recipe.title}\n\n${recipe.summary}\n\nRecipe version: ${version}\nTool: ${recipe.tool}\n\n## Before you start\n\n${recipe.setup}\n\n${recipeText(recipe)}\n\n## Make it yours\n\n${recipe.customize}\n\n## Known limits\n\n${recipe.limits}\n`;
}
const encoder = new TextEncoder();
function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const value of bytes) { crc ^= value; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
export function recipeZip(files: { name: string; content: string }[]): Uint8Array {
  const chunks: Uint8Array[] = []; const central: Uint8Array[] = []; let offset = 0;
  for (const file of files) {
    if (!/^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.(?:md|txt|json|yaml|yml)$/.test(file.name)) throw new Error("Unsafe recipe filename.");
    const name = encoder.encode(file.name); const body = encoder.encode(file.content); const crc = crc32(body);
    const header = new Uint8Array(30 + name.length); const h = new DataView(header.buffer);
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x800, true); h.setUint16(12, 0x21, true);
    h.setUint32(14, crc, true); h.setUint32(18, body.length, true); h.setUint32(22, body.length, true); h.setUint16(26, name.length, true); header.set(name, 30);
    const entry = new Uint8Array(46 + name.length); const c = new DataView(entry.buffer);
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x800, true); c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true); c.setUint32(20, body.length, true); c.setUint32(24, body.length, true); c.setUint16(28, name.length, true); c.setUint32(42, offset, true); entry.set(name, 46);
    chunks.push(header, body); central.push(entry); offset += header.length + body.length;
  }
  const size = central.reduce((sum, c) => sum + c.length, 0); const end = new Uint8Array(22); const e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, size, true); e.setUint32(16, offset, true);
  const result = new Uint8Array(offset + size + end.length); let cursor = 0;
  for (const part of [...chunks, ...central, end]) { result.set(part, cursor); cursor += part.length; }
  return result;
}
export function recipeDownload(recipe: Recipe, version: string, slug: string) {
  const filename = slug.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 80) || "recipe";
  return recipe.format === "skill"
    ? { bytes: recipeZip([...recipe.files, { name: "PLS-RECIPE.md", content: `# ${recipe.title}\n\nRecipe version: ${version}\nTool: ${recipe.tool}\n\n## Before you start\n\n${recipe.setup}\n\n## Make it yours\n\n${recipe.customize}\n\n## Known limits\n\n${recipe.limits}\n` }]), filename: filename + ".zip", type: "application/zip" }
    : { bytes: encoder.encode(recipeMarkdown(recipe, version)), filename: filename + ".md", type: "text/markdown; charset=utf-8" };
}
