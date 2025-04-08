import React from "react";
import { mount } from "enzyme";
import { UtilitiesPost, UtilitiesPostProps } from "../utilities_post";
import { INITIAL } from "../../../config";
import { clone } from "lodash";

describe("<UtilitiesPost />", () => {
  const fakeProps = (): UtilitiesPostProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const wrapper = mount(<UtilitiesPost {...fakeProps()} />);
    expect(wrapper.html()).toContain("utilities-post");
  });
});
