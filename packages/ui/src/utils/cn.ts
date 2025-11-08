export type ClassValue = string | number | null | false | undefined | ClassValue[] | { [key: string]: boolean | null | undefined };

const isObject = (value: unknown): value is Record<string, boolean | null | undefined> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const cn = (...inputs: ClassValue[]): string => {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input && input !== 0) continue;

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
      continue;
    }

    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) {
        classes.push(nested);
      }
      continue;
    }

    if (isObject(input)) {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(" ");
};
