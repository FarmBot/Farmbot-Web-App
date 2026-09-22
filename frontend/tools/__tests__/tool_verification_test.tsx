import React from "react";
import { render } from "@testing-library/react";
import {
  getToolVerificationPin, ToolVerification,
} from "../tool_verification";
import { ToolVerificationProps } from "../interfaces";
import { bot } from "../../__test_support__/fake_state/bot";
import { fakeSensor } from "../../__test_support__/fake_state/resources";

describe("<ToolVerification />", () => {
  const fakeProps = (): ToolVerificationProps => ({
    sensors: [],
    bot: bot,
  });

  it("renders", () => {
    const { container } = render(<ToolVerification {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("verify");
  });

  it("finds the tool verification sensor by type", () => {
    const sensor = fakeSensor();
    sensor.body.label = "arbitrary sensor";
    sensor.body.type = "tool_verification";
    sensor.body.pin = 42;
    expect(getToolVerificationPin([sensor])).toEqual(42);
  });
});
