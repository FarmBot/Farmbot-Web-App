import * as React from "react";
import { FbosDetails } from "../auto_update_row";
import { shallow } from "enzyme";
import { bot } from "../../../../__test_support__/fake_state/bot";

describe("<FbosDetails/>", () => {
  it("renders", () => {
    bot.hardware.informational_settings.env = "fakeEnv";
    bot.hardware.informational_settings.commit = "fakeCommit";
    bot.hardware.informational_settings.target = "fakeTarget";
    const wrapper = shallow(<FbosDetails {...bot} />);
    ["Environment", "fakeEnv", "Commit", "fakeCommit", "Target", "fakeTarget"]
      .map(string => expect(wrapper.text()).toContain(string));
  });
});
