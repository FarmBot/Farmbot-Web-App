import * as React from "react";
import { LangToggle } from "../lang_toggle";
import { mount } from "enzyme";
import { Session } from "../../session";
import { BooleanSetting } from "../../session_keys";

describe("<LangToggle/>", () => {
  it("allows toggling between English and local i18n", () => {
    jest.mock("../../i18n", () => {
      return {
        detectLanguage: () => {
          return Promise.resolve({
            nsSeparator: "",
            keySeparator: "",
            lng: "es",
            resources: {
              es: { translation: {} }
            }
          });
        }
      };
    });
    let el = mount(<LangToggle />);
    expect(Session.getBool(BooleanSetting.DISABLE_I18N)).toBeFalsy();
    expect(el.text().toLocaleLowerCase()).toContain("set page to english");
    el.find("a").first().simulate("click");
    el.update();
    expect(Session.getBool(BooleanSetting.DISABLE_I18N)).toBeTruthy();
    expect(el.text().toLocaleLowerCase()).not.toContain("set page to english");
    expect(el.text().toLocaleLowerCase()).toContain("internationalize page");
  });
});
