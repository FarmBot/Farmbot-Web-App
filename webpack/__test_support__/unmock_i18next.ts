import { template, templateSettings } from "lodash";
import { Dictionary } from "farmbot";

templateSettings.interpolate = /{{([\s\S]+?)}}/g;

jest.mock("i18next", () => ({
  t: (i: string, translation: Dictionary<string> = {}): string => {
    const precompiledTemplate = template(i);
    return precompiledTemplate(translation);
  },
  init: jest.fn()
}));
