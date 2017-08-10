import * as React from "react";
import { render } from "enzyme";
import { MustBeOnline } from "../must_be_online";

describe("<MustBeOnline/>", function () {
  it("Does not render when status is 'unknown'", function () {
    let elem = <MustBeOnline status="unknown">
      <span>Invisible</span>
    </MustBeOnline>;
    let text = render(elem).text();
    expect(text).not.toContain("Invisible");
  });

  it("Does not render when status is undefined", function () {
    let elem = <MustBeOnline status={undefined} fallback="NOPE!">
      <span>Invisible</span>
    </MustBeOnline>;
    let text = render(elem).text();
    expect(text).not.toContain("Invisible");
    expect(text).toContain("NOPE!");
  });

  it("Renders when locked open", function () {
    let elem = <MustBeOnline status="unknown" lockOpen={true}>
      <span>Visible</span>
    </MustBeOnline>;
    let text = render(elem).text();
    expect(text).toContain("Visible");
  });
});
