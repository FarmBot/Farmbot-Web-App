import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: {
    getState: () => mockState,
    dispatch: jest.fn(),
  },
}));

import React from "react";
import { shallow } from "enzyme";
import { MustBeOnline, isBotUp, MBOProps } from "../must_be_online";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeUser } from "../../__test_support__/fake_state/resources";

describe("<MustBeOnline/>", () => {
  const fakeProps = (): MBOProps => ({
    networkState: "down",
    syncStatus: "sync_now",
  });

  it("covers content when status is 'unknown'", () => {
    const elem = <MustBeOnline {...fakeProps()}>
      <span>Covered</span>
    </MustBeOnline>;
    const overlay = shallow(elem).find("div");
    expect(overlay.hasClass("unavailable")).toBeTruthy();
  });

  it("is uncovered when locked open", () => {
    localStorage.setItem("myBotIs", "online");
    const p = fakeProps();
    const overlay = shallow(<MustBeOnline {...p} />).find("div");
    expect(overlay.hasClass("unavailable")).toBeFalsy();
    expect(overlay.hasClass("banner")).toBeFalsy();
    localStorage.clear();
  });

  it("doesn't show banner", () => {
    const p = fakeProps();
    p.hideBanner = true;
    const overlay = shallow(<MustBeOnline {...p} />).find("div");
    expect(overlay.hasClass("unavailable")).toBeTruthy();
    expect(overlay.hasClass("banner")).toBeFalsy();
  });
});

describe("isBotUp()", () => {
  it("is up", () => {
    expect(isBotUp("synced")).toBeTruthy();
  });

  it("is locked open", () => {
    const user = fakeUser();
    user.body.email = "123@farmbot.guest";
    mockState.resources = buildResourceIndex([user]);
    expect(isBotUp(undefined)).toBeTruthy();
  });

  it("is not up", () => {
    mockState.resources = buildResourceIndex([]);
    expect(isBotUp("unknown")).toBeFalsy();
    expect(isBotUp("maintenance")).toBeFalsy();
    expect(isBotUp(undefined)).toBeFalsy();
  });
});
