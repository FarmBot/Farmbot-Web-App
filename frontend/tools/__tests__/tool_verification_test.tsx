import React from "react";
import { mount } from "enzyme";
import { ToolVerification } from "../tool_verification";
import { ToolVerificationProps } from "../interfaces";
import { bot } from "../../__test_support__/fake_state/bot";

describe("<ToolVerification />", () => {
  const fakeProps = (): ToolVerificationProps => ({
    sensors: [],
    bot: bot,
  });

  it("renders", () => {
    const wrapper = mount(<ToolVerification {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("verify");
  });
});
