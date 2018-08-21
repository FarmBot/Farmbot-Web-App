import * as React from "react";
import { shallow } from "enzyme";
import { MustBeOnline, isBotUp, MBOProps } from "../must_be_online";

describe("<MustBeOnline/>", () => {
  const fakeProps = (): MBOProps => ({
    networkState: "down",
    syncStatus: "sync_now",
  });

  it("Covers content when status is 'unknown'", () => {
    const elem = <MustBeOnline {...fakeProps()}>
      <span>Covered</span>
    </MustBeOnline>;
    const overlay = shallow(elem).find("div");
    expect(overlay.hasClass("unavailable")).toBeTruthy();
  });

  it("is uncovered when locked open", () => {
    const p = fakeProps();
    p.lockOpen = true;
    const overlay = shallow(<MustBeOnline {...p} />).find("div");
    expect(overlay.hasClass("unavailable")).toBeFalsy();
    expect(overlay.hasClass("banner")).toBeFalsy();
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

  it("is not up", () => {
    expect(isBotUp("unknown")).toBeFalsy();
    expect(isBotUp("maintenance")).toBeFalsy();
    expect(isBotUp(undefined)).toBeFalsy();
  });
});
