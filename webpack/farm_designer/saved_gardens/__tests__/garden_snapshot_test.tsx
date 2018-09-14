jest.mock("axios", () => {
  return { default: { post: jest.fn(() => Promise.resolve()) } };
});

jest.mock("../actions", () => ({
  snapshotGarden: jest.fn(),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { GardenSnapshotProps, GardenSnapshot } from "../garden_snapshot";
import { clickButton } from "../../../__test_support__/helpers";
import { error } from "farmbot-toastr";
import { snapshotGarden } from "../actions";

describe("<GardenSnapshot />", () => {
  const fakeProps = (): GardenSnapshotProps => ({
    plantsInGarden: true,
    disabled: false,
  });

  it("saves garden", () => {
    const wrapper = mount(<GardenSnapshot {...fakeProps()} />);
    clickButton(wrapper, 0, "snapshot");
    expect(snapshotGarden).toHaveBeenCalledWith(undefined);
  });

  it("no garden to save", () => {
    const p = fakeProps();
    p.plantsInGarden = false;
    const wrapper = mount(<GardenSnapshot {...p} />);
    clickButton(wrapper, 0, "snapshot");
    expect(snapshotGarden).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(expect.stringContaining(
      "No plants in garden"));
  });

  it("changes name", () => {
    const wrapper = shallow<GardenSnapshot>(<GardenSnapshot {...fakeProps()} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { value: "new name" }
    });
    expect(wrapper.instance().state.name).toEqual("new name");
  });
});
