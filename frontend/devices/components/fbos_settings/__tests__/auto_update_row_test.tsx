jest.mock("../../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import { AutoUpdateRow } from "../auto_update_row";
import { mount } from "enzyme";
import { AutoUpdateRowProps } from "../interfaces";
import { fakeState } from "../../../../__test_support__/fake_state";
import { edit, save } from "../../../../api/crud";
import { fakeFbosConfig } from "../../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex, fakeDevice
} from "../../../../__test_support__/resource_index_builder";

describe("<AutoUpdateRow/>", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): AutoUpdateRowProps => ({
    timeFormat: "12h",
    shouldDisplay: jest.fn(() => true),
    device: fakeDevice(),
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    sourceFbosConfig: () => ({ value: 1, consistent: true })
  });

  it("renders", () => {
    const wrapper = mount(<AutoUpdateRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("auto update");
  });

  it("toggles auto-update on", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 0, consistent: true });
    const wrapper = mount(<AutoUpdateRow {...p} />);
    wrapper.find("button").at(1).simulate("click");
    expect(edit).toHaveBeenCalledWith(fakeConfig, { os_auto_update: true });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });

  it("toggles auto-update off", () => {
    const p = fakeProps();
    p.sourceFbosConfig = () => ({ value: 1, consistent: true });
    const wrapper = mount(<AutoUpdateRow {...p} />);
    wrapper.find("button").at(1).simulate("click");
    expect(edit).toHaveBeenCalledWith(fakeConfig, { os_auto_update: false });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });
});
