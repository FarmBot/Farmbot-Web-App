jest.mock("fastclick", () => ({
  attach: jest.fn(),
}));

jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { App, AppProps } from "../app";
import { mount } from "enzyme";
import { bot } from "../__test_support__/fake_state/bot";
import { fakeUser } from "../__test_support__/fake_state/resources";

describe("<App />: Controls Pop-Up", () => {
  function fakeProps(): AppProps {
    return {
      dispatch: jest.fn(),
      loaded: [],
      logs: [],
      user: fakeUser(),
      bot: bot
    };
  }

  function controlsPopUp(page: string, exists: boolean) {
    it(`doesn't render controls pop-up on ${page} page`, () => {
      Object.defineProperty(location, "pathname", {
        value: "/app/" + page, configurable: true
      });
      const wrapper = mount(<App {...fakeProps() } />);
      if (exists) {
        expect(wrapper.html()).toContain("controls-popup");
      } else {
        expect(wrapper.html()).not.toContain("controls-popup");
      }
    });
  }

  controlsPopUp("designer", true);
  controlsPopUp("designer/plants", true);
  controlsPopUp("controls", false);
  controlsPopUp("device", true);
  controlsPopUp("sequences", true);
  controlsPopUp("sequences/for_regimens", true);
  controlsPopUp("regimens", false);
  controlsPopUp("tools", true);
  controlsPopUp("farmware", true);
  controlsPopUp("account", false);

});

describe.skip("<App />: Loading", () => {
  function fakeProps(): AppProps {
    return {
      dispatch: jest.fn(),
      loaded: [],
      logs: [],
      user: fakeUser(),
      bot: bot
    };
  }

  it("MUST_LOADs not loaded", () => {
    const wrapper = mount(<App {...fakeProps() } />);
    expect(wrapper.html()).toContain("spinner");
  });

  it("MUST_LOADs partially loaded", () => {
    const p = fakeProps();
    p.loaded = ["sequences"];
    const wrapper = mount(<App {...p } />);
    expect(wrapper.html()).toContain("spinner");
  });

  it("MUST_LOADs loaded", () => {
    const p = fakeProps();
    p.loaded = ["sequences", "regimens", "farm_events", "points"];
    const wrapper = mount(<App {...p } />);
    expect(wrapper.html()).not.toContain("spinner");
  });
});

describe("<App />: NavBar", () => {
  function fakeProps(): AppProps {
    return {
      dispatch: jest.fn(),
      loaded: [],
      logs: [],
      user: fakeUser(),
      bot: bot
    };
  }

  it("displays links", () => {
    const wrapper = mount(<App {...fakeProps() } />);
    expect(wrapper.text())
      .toContain("Farm DesignerControlsDeviceSequencesRegimensToolsFarmware");
  });

  it("displays ticker", () => {
    const wrapper = mount(<App {...fakeProps() } />);
    expect(wrapper.text()).toContain("No logs yet.");
  });
});
