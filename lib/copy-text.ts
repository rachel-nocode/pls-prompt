export async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return; }
  } catch {}
  const previous = document.activeElement as HTMLElement | null;
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  try {
    input.select();
    if (!document.execCommand("copy")) throw new Error("Copy is unavailable");
  } finally {
    input.remove();
    previous?.focus?.();
  }
}
