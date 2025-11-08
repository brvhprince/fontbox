import preset, { fontboxTailwindPreset } from "./preset";

type TailwindConfig = Record<string, unknown> & {
  presets?: unknown[];
  theme?: Record<string, unknown>;
};

const deepMerge = (target: Record<string, unknown>, source: Record<string, unknown>) => {
  const output: Record<string, unknown> = { ...target };

  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof output[key] === "object" &&
      output[key] !== null &&
      !Array.isArray(output[key])
    ) {
      output[key] = deepMerge(output[key] as Record<string, unknown>, value as Record<string, unknown>);
    } else {
      output[key] = value;
    }
  }

  return output;
};

export const withTailwindPreset = (config: TailwindConfig = {}): TailwindConfig => {
  const { presets = [], theme = {}, ...rest } = config;

  return {
    ...rest,
    presets: [preset, ...presets],
    theme: deepMerge(fontboxTailwindPreset.theme ?? {}, theme ?? {})
  };
};

export const defineTailwindConfig = (config: TailwindConfig = {}): TailwindConfig => withTailwindPreset(config);

export { preset, fontboxTailwindPreset };
