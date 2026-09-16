import "@testing-library/jest-dom/vitest";

/**
 * jsdom n'implémente pas `matchMedia`. `components/Modal.tsx` s'en sert pour
 * détecter le format mobile : sans ce stub, tout rendu incluant un modal lève
 * « window.matchMedia is not a function ».
 *
 * Le stub répond « ne correspond pas », ce qui place les tests en disposition
 * bureau — le comportement par défaut attendu par les suites existantes.
 */
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
