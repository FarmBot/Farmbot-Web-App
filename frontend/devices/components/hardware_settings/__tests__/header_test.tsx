import * as React from "react";
import { Header } from "../header";
import { shallow } from "enzyme";

describe("<Header/>", () => {
  it("renders", () => {
    const fn = jest.fn();
    const el = shallow(<Header
      title="FOO"
      expanded={true}
      name={"motors"}
      dispatch={fn} />);
    expect(el.text()).toContain("FOO");
    expect(el.find(".fa-minus").length).toBe(1);
  });
});
