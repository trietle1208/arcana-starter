/** Fills {placeholders} in a label: fill('Pile {n}', { n: 2 }) → 'Pile 2'. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}
