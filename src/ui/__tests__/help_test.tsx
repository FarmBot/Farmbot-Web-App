import * as React from "react";
import { Help } from "../help";
import { render } from "enzyme";

describe("<Help />", () => {
  it("renders", () => {
    let wrapper = render(<Help text={"Heyo"} />);
    expect(wrapper).toBeTruthy();
  });

});
