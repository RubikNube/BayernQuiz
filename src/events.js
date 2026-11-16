// Keep DOM subscriptions scoped to the component that created them.
export function createEvents() {
  const controller = new AbortController();
  return {
    on(target, type, listener, options = {}) {
      target.addEventListener(type, listener, { ...options, signal: controller.signal });
    },
    destroy() { controller.abort(); },
  };
}
