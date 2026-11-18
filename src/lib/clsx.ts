// clsx utility (inline since we don't want to add another dep)
export function clsx(...args: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return args
    .flatMap(arg => {
      if (!arg) return [];
      if (typeof arg === 'string') return [arg];
      return Object.entries(arg)
        .filter(([, v]) => v)
        .map(([k]) => k);
    })
    .join(' ');
}
