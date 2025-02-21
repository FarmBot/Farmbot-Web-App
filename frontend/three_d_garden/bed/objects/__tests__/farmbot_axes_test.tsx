import React from "react";
import { mount } from "enzyme";
import { FarmbotAxes, FarmbotAxesProps } from "../farmbot_axes";
import { clone } from "lodash";
import { INITIAL } from "../../../config";

describe("<FarmbotAxes />", () => {
  const fakeProps = (): FarmbotAxesProps => ({
    config: clone(INITIAL)
  });

  it("renders", () => {
    const wrapper = mount(<FarmbotAxes {...fakeProps()} />);
    expect(wrapper.html()).toContain("extrude");
  });
});
