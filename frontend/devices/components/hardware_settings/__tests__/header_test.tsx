import * as React from "react";
import { Header } from "../header";
import { mount } from "enzyme";

describe("<Header/>", () => {
  it("renders", () => {
    const fn = jest.fn();
    const el = mount(<Header
      title="FOO"
      expanded={true}
      name={"motors"}
      dispatch={fn} />);
    expect(el.text()).toContain("FOO");
    expect(el.find(".fa-minus").length).toBe(1);
  });
});
