import React from "react";
import { render } from "@testing-library/react";
import { SingleSettingRow, SingleSettingRowProps } from "../single_setting_row";
import { DeviceSetting } from "../../../constants";

describe("<SingleSettingRow />", () => {
  const fakeProps = (): SingleSettingRowProps => ({
    label: DeviceSetting.motors,
    tooltip: "text",
    children: <p>child</p>,
    settingType: "button",
  });

  it("renders", () => {
    const p = fakeProps();
    const { container } = render(<SingleSettingRow {...p} />);
    expect(container.textContent).toContain("child");
  });
});
