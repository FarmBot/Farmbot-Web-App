jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { TimezoneRow } from "../timezone_row";
import { TimezoneRowProps } from "../interfaces";
import { edit } from "../../../api/crud";
import { Content } from "../../../constants";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";

describe("<TimezoneRow />", () => {
  const fakeProps = (): TimezoneRowProps => ({
    device: fakeDevice(),
    dispatch: jest.fn(),
  });

  it("warns about timezone mismatch", () => {
    const p = fakeProps();
    p.device.body.timezone = "different";
    const osSettings = mount(<TimezoneRow {...p} />);
    expect(osSettings.text()).toContain(Content.DIFFERENT_TZ_WARNING);
  });

  it("select timezone", () => {
    const p = fakeProps();
    const osSettings = mount<TimezoneRow>(<TimezoneRow {...p} />);
    const selector = shallow(<div>{osSettings.instance().Selector()}</div>);
    selector.find("TimezoneSelector").simulate("update", "fake timezone");
    expect(edit).toHaveBeenCalledWith(p.device, { timezone: "fake timezone" });
  });
});
