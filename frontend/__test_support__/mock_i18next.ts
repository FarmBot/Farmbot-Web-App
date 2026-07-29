import { Dictionary } from "farmbot";

export const interpolate = (
  text: string | undefined,
  values: Dictionary<string | number> = {},
): string => (text ?? "").replace(/{{([\s\S]+?)}}/g, (_, key: string) => {
  const interpolationKey = key.trim();
  const value = values[interpolationKey];
  if (value === undefined) {
    throw new Error(`Missing interpolation value: ${interpolationKey}`);
  }
  return String(value);
});

jest.mock("i18next", () => ({
  t: (i: string, translation: Dictionary<string | number> = {}): string =>
    interpolate(i, translation),
  init: jest.fn((_, ok) => ok()),
}));
