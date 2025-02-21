import React from "react";
import { mount } from "enzyme";
import { Desk, DeskProps } from "../desk";
import { clone } from "lodash";
import { INITIAL } from "../../../config";

describe("<Desk />", () => {
  const fakeProps = (): DeskProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const wrapper = mount(<Desk {...fakeProps()} />);
    expect(wrapper.html()).toContain("desk");
  });
});
