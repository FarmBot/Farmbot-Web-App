const mockDevice = { sync: jest.fn(() => Promise.resolve()) };
jest.mock("../../../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import { AutoSyncRow } from "../auto_sync_row";
import { mount } from "enzyme";
import { Content } from "../../../../constants";
import { AutoSyncRowProps } from "../interfaces";
import { fakeState } from "../../../../__test_support__/fake_state";
import { edit, save } from "../../../../api/crud";
import { fakeFbosConfig } from "../../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../../../__test_support__/resource_index_builder";

describe("<AutoSyncRow/>", () => {
  const fakeConfig = fakeFbosConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): AutoSyncRowProps => ({
    dispatch: jest.fn(x => x(jest.fn(), () => state)),
    sourceFbosConfig: () => ({ value: true, consistent: true })
  });

  it("renders", () => {
    const wrapper = mount(<AutoSyncRow {...fakeProps()} />);
    ["AUTO SYNC", Content.AUTO_SYNC]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("toggles", () => {
    const wrapper = mount(<AutoSyncRow {...fakeProps()} />);
    wrapper.find("button").simulate("click");
    expect(edit).toHaveBeenCalledWith(fakeConfig, { auto_sync: false });
    expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
  });
});
