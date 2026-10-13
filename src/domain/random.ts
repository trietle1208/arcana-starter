export type Rng = () => number; // uniform float in [0, 1)

export const randomInt = (rng: Rng, maxExclusive: number) => Math.floor(rng() * maxExclusive);

/** Production: Web Crypto, available in browsers and Node. */
export function cryptoRng(): Rng {
  const buf = new Uint32Array(1);
  return () => {
    crypto.getRandomValues(buf);
    return buf[0] / 0x1_0000_0000;
  };
}

/** Tests: deterministic mulberry32. Same seed → same sequence. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x1_0000_0000;
  };
}
