import * as React from "react";
import { testGrid } from "./generate_grid_test";
import { GridInput, InputCell, InputCellProps } from "../grid_input";
import { mount, shallow } from "enzyme";
import { BlurableInput } from "../../../../ui/blurable_input";

describe("<GridInput/>", () => {
  it("renders", () => {
    const cb = jest.fn();
    const props = ({
      disabled: false,
      grid: testGrid,
      xy_swap: true,
      onChange: jest.fn(() => cb)
    });
    const text = mount(<GridInput {...props} />).text();
    ["Starting X", "starting Y", "# of plants", "Spacing (MM)"].map(txt => {
      expect(text).toContain(txt);
    });
  });
});

describe("<InputCell/>", () => {
  it("triggers callacks", () => {
    const p: InputCellProps = {
      gridKey: "numPlantsH",
      xy_swap: false,
      onChange: jest.fn(),
      grid: testGrid
    };
    const el = shallow(<InputCell {...p} />);
    el.find(BlurableInput).first().simulate("commit", { currentTarget: { value: "6" } });
    expect(p.onChange).toHaveBeenCalledWith(p.gridKey, 6);
  });
});
