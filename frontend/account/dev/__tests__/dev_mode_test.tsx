jest.mock("../../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(() => () => { }),
  getWebAppConfigValue: jest.fn(() => () => { }),
}));

import { mount } from "enzyme";
import { DevMode } from "../dev_mode";
import * as React from "react";
import { range } from "lodash";
import {
  setWebAppConfigValue,
} from "../../../config_storage/actions";
import { warning } from "../../../toast/toast";

describe("<DevMode/>", () => {
  it("triggers callbacks after 15 clicks", () => {
    console.log = jest.fn();
    const dispatch = jest.fn();
    const el = mount(<DevMode dispatch={dispatch} />);
    range(0, 16).map(() => el.simulate("click"));
    expect(warning).toHaveBeenCalledWith("5 more clicks");
    expect(warning).toHaveBeenCalledWith("10 more clicks");
    expect(setWebAppConfigValue)
      .toHaveBeenCalledWith("show_dev_menu", true);
  });
});
