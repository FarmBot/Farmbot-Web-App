/** Name of every env var that the weed detector farmware needs. */
import { Primitive } from "../../../util";
import { WD_KEY_DEFAULTS, EVERY_WD_KEY } from "./constants";

export const isWDENVKey =
  (key: unknown): key is WDENVKey => (EVERY_WD_KEY as string[]).includes("" + key);

/** Weed detector ENV key. */
export type WDENVKey = keyof typeof WD_KEY_DEFAULTS;

/** The entirety of ENV keys that the weed detector app needs to function.
 * Keys like HSV and whatnot. */
export type WD_ENV = Record<WDENVKey, number>;

/** Takes an internally formatted ENV var and formats it in a way that is useful
 * for the weed detector. Eg, convert 0 to "true". */
export type FormatterFn = (key: WDENVKey, val: number) => Primitive;

/** Takes a value from the outside world and parses it for use within this app.
 * Example: Turn "TOP_RIGHT" into the number 3. */
export type ParserFn = (key: WDENVKey, val: string) => number;

/** Object that contains two functions for translation of ENV variable keys. */
export interface Translation {
  /** Translate to output. FE => FBOS */
  format: FormatterFn;
  /** Translate to input. FBOS => FE */
  parse: ParserFn;
}

/** List of "special case" ENV vars from the weed detector that require
 * extra translation. */
export type FormatTranslationMap = Partial<Record<WDENVKey, Translation>>;
