export function publicRequestRejection(request: Request): Response | null {
  const path = new URL(request.url).pathname;
  if (/^\/(?:library|profile|studio|submit|signin-with-chatgpt|signout-with-chatgpt)(?:\/|$)/.test(path) || /^\/api\/(?:library|studio|uploads)(?:\/|$)/.test(path)) {
    return new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD", "Cache-Control": "no-store" } });
  }
  return null;
}
