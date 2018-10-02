jest.mock("../../../api/crud", () => ({ edit: jest.fn() }));

import * as React from "react";
import { shallow } from "enzyme";
import { ToolBayNumberCol, TBNumColProps } from "../toolbay_number_column";
import { edit } from "../../../api/crud";
import { fakeToolSlot } from "../../../__test_support__/fake_state/resources";

describe("<ToolBayNumberCol />", () => {
  const fakeProps = (): TBNumColProps => ({
    axis: "x",
    value: 0,
    dispatch: jest.fn(),
    slot: fakeToolSlot(),
  });

  it("edits value", () => {
    const p = fakeProps();
    const wrapper = shallow(<ToolBayNumberCol {...p} />);
    wrapper.find("BlurableInput").simulate("commit", {
      currentTarget: { value: "1.23" }
    });
    expect(edit).toHaveBeenCalledWith(p.slot, { x: 1.23 });
  });
});
