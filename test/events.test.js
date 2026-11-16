import test from 'node:test';
import assert from 'node:assert/strict';
import { createEvents } from '../src/events.js';

test('destroying a view removes its handlers without removing another view’s handlers', () => {
  const target = new EventTarget();
  const first = createEvents();
  const second = createEvents();
  let oldCalls = 0;
  let newCalls = 0;
  first.on(target, 'click', () => oldCalls++);
  second.on(target, 'click', () => newCalls++, { once: true });
  first.destroy();
  target.dispatchEvent(new Event('click'));
  target.dispatchEvent(new Event('click'));
  assert.equal(oldCalls, 0);
  assert.equal(newCalls, 1);
  second.destroy();
});
