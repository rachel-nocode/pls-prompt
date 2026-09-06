export const demoHeaders = {
  "Content-Type": "text/html; charset=utf-8",
  "Content-Security-Policy": "sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "private, no-store",
};
export function uploadedDemoDocument(html: string) {
  const readiness = "<script>(()=>{let failed=false;addEventListener('error',()=>{failed=true});addEventListener('load',()=>parent.postMessage({type:failed?'pls-demo-error':'pls-demo-ready'},'*'))})()</script>";
  return /<!doctype[^>]*>/i.test(html) ? html.replace(/<!doctype[^>]*>/i, match => match + readiness) : "<!doctype html>" + readiness + html;
}
