jest.mock("../../actions", () => ({ resetConnectionInfo: jest.fn() }));

import * as React from "react";
import { render, shallow } from "enzyme";
import { ConnectivityPanel } from "../index";
import { SpecialStatus } from "farmbot";
import { bot } from "../../../__test_support__/fake_state/bot";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { resetConnectionInfo } from "../../actions";

describe("<ConnectivityPanel/>", () => {
  const fakeProps = (): ConnectivityPanel["props"] => ({
    bot: bot,
    dispatch: jest.fn(),
    deviceAccount: fakeDevice(),
    status: SpecialStatus.SAVED,
  });

  it("renders the default use case", () => {
    const p = fakeProps();
    const wrapper = render(<ConnectivityPanel {...p} />);
    ["Check Again", "Connectivity"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("resets connection info", () => {
    const p = fakeProps();
    const wrapper = shallow<ConnectivityPanel>(<ConnectivityPanel {...p} />);
    wrapper.instance().refresh();
    expect(p.dispatch).toHaveBeenCalled();
    expect(resetConnectionInfo).toHaveBeenCalled();
  });
});
