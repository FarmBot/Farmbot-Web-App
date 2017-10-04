import * as React from "react";
import { render } from "enzyme";
import { MustBeOnline } from "../must_be_online";

describe("<MustBeOnline/>", function () {
  it("Covers content when status is 'unknown'", function () {
    const elem = <MustBeOnline status="unknown">
      <span>Covered</span>
    </MustBeOnline>;
    const overlay = render(elem).find("div");
    expect(overlay.hasClass("unavailable")).toBeTruthy();
  });

  it("Covers content when status is undefined", function () {
    const elem = <MustBeOnline status={undefined}>
      <span>Covered</span>
    </MustBeOnline>;
    const overlay = render(elem).find("div");
    expect(overlay.hasClass("unavailable")).toBeTruthy();
    expect(overlay.hasClass("banner")).toBeTruthy();
  });

  it("Uncovered when locked open", function () {
    const elem = <MustBeOnline status="unknown" lockOpen={true}>
      <span>Uncovered</span>
    </MustBeOnline>;
    const overlay = render(elem).find("div");
    expect(overlay.hasClass("unavailable")).toBeFalsy();
    expect(overlay.hasClass("banner")).toBeFalsy();
  });

  it("Doesn't show banner", function () {
    const elem = <MustBeOnline status="unknown" hideBanner={true}>
      <span>Uncovered</span>
    </MustBeOnline>;
    const overlay = render(elem).find("div");
    expect(overlay.hasClass("unavailable")).toBeTruthy();
    expect(overlay.hasClass("banner")).toBeFalsy();
  });
});
