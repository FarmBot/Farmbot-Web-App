import { template, templateSettings } from "lodash";
import { Dictionary } from "farmbot";

templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const mockTemplate = template;

jest.mock("i18next", () => ({
  t: (i: string, translation: Dictionary<string> = {}): string => {
    const precompiledTemplate = mockTemplate(i);
    return precompiledTemplate(translation);
  },
  init: jest.fn()
}));
