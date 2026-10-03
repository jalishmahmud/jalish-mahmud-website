// Keep the existing CSS Module class and add a stable hook for the optional
// design stylesheet. Both designs render the same components and markup.
export function withDesignStyles(base, namespace) {
  return new Proxy(base, {
    get(target, key) {
      const value = target[key];
      return typeof value === "string" ? `${value} design-${namespace}-${String(key)}` : value;
    },
  });
}
