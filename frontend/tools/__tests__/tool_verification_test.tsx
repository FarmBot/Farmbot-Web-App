import React from "react";
import { render } from "@testing-library/react";
import { ToolVerification } from "../tool_verification";
import { ToolVerificationProps } from "../interfaces";
import { bot } from "../../__test_support__/fake_state/bot";

describe("<ToolVerification />", () => {
  const fakeProps = (): ToolVerificationProps => ({
    sensors: [],
    bot: bot,
  });

  it("renders", () => {
    const { container } = render(<ToolVerification {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("verify");
  });
});
