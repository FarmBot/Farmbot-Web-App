import * as React from "react";
import { render } from "enzyme";
import { ConnectivityPanel } from "../index";
import { StatusRowProps } from "../connectivity_row";

describe("<ConnectivityPanel/>", () => {
  it("renders the default use case", () => {
    const onRefresh = jest.fn();
    const rowData: StatusRowProps[] = [
      {
        from: "A",
        to: "B",
        connectionStatus: false,
        children: "Cant do things with stuff."
      }
    ];
    const testCase = <ConnectivityPanel
      onRefresh={onRefresh}
      rowData={rowData}
      status={undefined}>
      <p>I am a child component.</p>
    </ConnectivityPanel>;
    const el = render(testCase);
    expect(el.text()).toContain("I am a child");
    expect(el.text()).toContain(rowData[0].children)
  });
});
