import * as React from "react";
import { Header } from "../hardware_settings/header";
import { shallow } from "enzyme";

describe("<Header/>", () => {
  it("renders", () => {
    let fn = jest.fn();
    let el = shallow(<Header
      title="FOO"
      bool={true}
      name={"motors"}
      dispatch={fn} />);
    expect(el.text()).toContain("FOO");
    expect(el.find(".fa-minus").length).toBe(1);
  });
});
