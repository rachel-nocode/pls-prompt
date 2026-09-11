import test from 'node:test';
import assert from 'node:assert/strict';
import { publicRequestRejection } from '../lib/public-request-policy.ts';

const request = (path, method = 'GET') => new Request('https://plsprompt.com' + path, { method, headers: { 'oai-authenticated-user-id': 'former-owner', 'oai-authenticated-user-email': 'owner@example.com' } });
test('public site rejects former account, private export and creator routes even with identity headers', async () => {
  for (const path of ['/library', '/profile', '/studio', '/studio/archive', '/studio/analytics', '/submit', '/signin-with-chatgpt', '/signout-with-chatgpt', '/api/library?export=json', '/api/library?history=private', '/api/library?item=private&export=recipe', '/api/uploads', '/api/studio', '/api/studio/assets']) {
    for (const method of ['GET', 'POST', 'HEAD']) {
      const response = publicRequestRejection(request(path, method));
      assert.equal(response.status, 404, path);
      assert.equal(response.headers.get('location'), null);
      assert.equal(await response.text(), 'Not found');
    }
  }
});
test('public site blocks writes and server actions while permitting public page and download reads', () => {
  for (const path of ['/', '/api/prompts', '/api/recipes/supper-club/download', '/prompts/window-seat', '/demos/window-seat', '/api/lessons/example/complete']) {
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) assert.equal(publicRequestRejection(request(path, method)).status, 405);
  }
  for (const path of ['/', '/api/prompts', '/prompts/supper-club', '/api/recipes/window-seat/download', '/preview-assets/public.png', '/assets/public.md']) {
    for (const method of ['GET', 'HEAD']) assert.equal(publicRequestRejection(request(path, method)), null);
  }
});
