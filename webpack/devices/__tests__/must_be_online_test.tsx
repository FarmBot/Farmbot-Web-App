import * as React from "react";
import { shallow } from "enzyme";
import { MustBeOnline, isBotUp } from "../must_be_online";

describe("<MustBeOnline/>", function () {
  it("Covers content when status is 'unknown'", function () {
    const elem = <MustBeOnline networkState="down" syncStatus={"sync_now"}>
      <span>Covered</span>
    </MustBeOnline>;
    const overlay = shallow(elem).find("div");
    expect(overlay.hasClass("unavailable")).toBeTruthy();
  });

  it("Uncovered when locked open", function () {
    const elem = <MustBeOnline networkState="down" syncStatus={"sync_now"} lockOpen={true}>
      <span>Uncovered</span>
    </MustBeOnline>;
    const overlay = shallow(elem).find("div");
    expect(overlay.hasClass("unavailable")).toBeFalsy();
    expect(overlay.hasClass("banner")).toBeFalsy();
  });

  it("Doesn't show banner", function () {
    const elem = <MustBeOnline networkState="down" syncStatus={"sync_now"} hideBanner={true}>
      <span>Uncovered</span>
    </MustBeOnline>;
    const overlay = shallow(elem).find("div");
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
