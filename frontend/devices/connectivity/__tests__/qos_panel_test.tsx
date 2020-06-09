import * as React from "react";
import { QosPanel, QosPanelProps } from "../qos_panel";
import { fakePings } from "../../../__test_support__/fake_state/pings";
import { mount } from "enzyme";

describe("<QosPanel />", () => {
  const fakeProps = (): QosPanelProps => ({
    pings: fakePings(),
  });

  it("renders", () => {
    const wrapper = mount(<QosPanel {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("percent ok: 50 %");
  });
});
