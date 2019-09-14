import * as React from "react";
import { mount } from "enzyme";
import { Connectivity, ConnectivityProps } from "../connectivity";
import { bot } from "../../../__test_support__/fake_state/bot";
import { StatusRowProps } from "../connectivity_row";
import { fill } from "lodash";
import { fakePings } from "../../../__test_support__/fake_state/pings";

describe("<Connectivity />", () => {
  const statusRow = {
    connectionName: "AB",
    from: "A",
    to: "B",
    connectionStatus: false,
    children: "Can't do things with stuff."
  };
  const rowData: StatusRowProps[] = fill(Array(5), statusRow);
  const flags = {
    userMQTT: false,
    userAPI: false,
    botMQTT: false,
    botAPI: false,
    botFirmware: false,
  };

  const fakeProps = (): ConnectivityProps => ({
    bot,
    rowData,
    flags,
    pings: fakePings()
  });

  it("sets hovered connection", () => {
    const wrapper = mount<Connectivity>(<Connectivity {...fakeProps()} />);
    wrapper.find(".saucer").at(6).simulate("mouseEnter");
    expect(wrapper.instance().state.hoveredConnection).toEqual("AB");
  });
});
