import React from "react";
import { render } from "@testing-library/react";
import { FbosButtonRow, FbosButtonRowProps } from "../fbos_button_row";
import { DeviceSetting } from "../../../constants";

describe("<FbosButtonRow />", () => {
  const fakeProps = (): FbosButtonRowProps => ({
    botOnline: true,
    label: DeviceSetting.motors,
    description: "description",
    buttonText: "click",
    color: "green",
    action: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<FbosButtonRow {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("click");
  });
});
