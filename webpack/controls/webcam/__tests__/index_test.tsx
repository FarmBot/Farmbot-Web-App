import * as React from "react";
import { mount } from "enzyme";
import { WebcamPanel } from "../index";

describe("<WebcamPanel/>", () => {
  it("toggles form states", () => {
    const props = { feeds: [], dispatch: jest.fn() };
    const el = mount(<WebcamPanel {...props} />);
    expect(el.text()).toContain("edit");
    el.find("button").first().simulate("click");
    el.update();
    expect(el.text()).toContain("view");
  });
});
