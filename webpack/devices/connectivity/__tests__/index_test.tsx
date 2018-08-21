import * as React from "react";
import { render, mount } from "enzyme";
import { ConnectivityPanel } from "../index";
import { StatusRowProps } from "../connectivity_row";
import * as _ from "lodash";
import { SpecialStatus } from "farmbot";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("<ConnectivityPanel/>", () => {
  function test() {
    const onRefresh = jest.fn();
    const statusRow = {
      connectionName: "AB",
      from: "A",
      to: "B",
      connectionStatus: false,
      children: "Can't do things with stuff."
    };
    const rowData: StatusRowProps[] = _.fill(Array(5), statusRow);

    return {
      component: <ConnectivityPanel
        onRefresh={onRefresh}
        rowData={rowData}
        status={SpecialStatus.SAVED}
        fbosInfo={bot.hardware.informational_settings}>
        <p>I am a child component.</p>
      </ConnectivityPanel>,
      rowData: rowData
    };
  }

  it("renders the default use case", () => {
    const testcase = test();
    const el = render(testcase.component);
    expect(el.text()).toContain("I am a child");
    expect(el.text()).toContain(testcase.rowData[0].children);
  });

  it("sets hovered connection", () => {
    const testcase = test();
    const el = mount<ConnectivityPanel>(testcase.component);
    el.find(".saucer").last().simulate("mouseEnter");
    expect(el.instance().state.hoveredConnection).toEqual("AB");
  });
});
