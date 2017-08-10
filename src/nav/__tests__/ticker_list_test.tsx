import * as React from "react";
import { mount } from "enzyme";

import { TickerList } from "../ticker_list";
import { Log } from "../../interfaces";

describe("<TickerList />", () => {
  let log: Log = {
    id: 1234567,
    message: "Farmbot is up and Running!",
    meta: {
      type: "info"
    },
    channels: [
      "toast"
    ],
    created_at: 1501703421
  };

  it("shows log message and datetime", () => {
    let wrapper = mount(
      <TickerList
        logs={[log]}
        tickerListOpen={false}
        toggle={jest.fn()}
      />
    );
    expect(wrapper.text()).toContain("Farmbot is up and Running!");
    expect(wrapper.text()).toContain("Aug 2, 12:50pm");
  });

  it("shows empty log message", () => {
    let wrapper = mount(
      <TickerList
        logs={[]}
        tickerListOpen={false}
        toggle={jest.fn()}
      />
    );
    expect(wrapper.text()).toContain("No logs yet.");
  });

  it("opens ticker", () => {
    let wrapper = mount(
      <TickerList
        logs={[log, log]}
        tickerListOpen={true}
        toggle={jest.fn()}
      />
    );
    expect(wrapper.text()).toContain("Aug 2, 12:50pmFarmbot is up and Running!");
  });
});
