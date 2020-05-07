import * as React from "react";
import { shallow } from "enzyme";
import { LaptopSplash } from "../laptop_splash";

describe("<LaptopSplash />", () => {
  it("renders", () => {
    const wrapper = shallow(<LaptopSplash className={""} />);
    expect(wrapper.find("video").length).toEqual(1);
  });
});
