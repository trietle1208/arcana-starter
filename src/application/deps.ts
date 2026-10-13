/** Time and ids come in from outside so tests can pin them (the same seam drawReading uses). */
export interface Deps {
  now: () => Date;
  newId: () => string;
}

export function resolveDeps(deps: Partial<Deps> = {}): Deps {
  return {
    now: deps.now ?? (() => new Date()),
    newId: deps.newId ?? (() => crypto.randomUUID()),
  };
}
