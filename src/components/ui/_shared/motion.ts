/**
 * True when animation should be skipped: the user's Reduce motion setting (<html data-motion>)
 * wins, otherwise the operating system preference. Browser only; on the server it is false.
 */
export function prefersReducedMotion(): boolean {
  if (typeof document === 'undefined') return false;
  const mode = document.documentElement.dataset.motion;
  if (mode === 'reduce') return true;
  if (mode === 'full') return false;
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}
