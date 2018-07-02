const mockDevice = {
  installFarmware: jest.fn(() => Promise.resolve({})),
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { FarmwareList, FarmwareListProps } from "../farmware_list";
import { fakeFarmwares, fakeFarmware } from "../../__test_support__/fake_farmwares";
import { clickButton } from "../../__test_support__/helpers";
import { Actions } from "../../constants";

describe("<FarmwareList />", () => {
  const fakeProps = (): FarmwareListProps => {
    return {
      dispatch: jest.fn(),
      current: undefined,
      farmwares: fakeFarmwares(),
      showFirstParty: false,
      firstPartyFarmwareNames: [],
    };
  };

  it("renders", () => {
    const wrapper = mount<{}>(<FarmwareList {...fakeProps()} />);
    ["Photos",
      "Camera Calibration",
      "Weed Detector",
      "My Farmware",
      "My Fake Farmware",
      "Install new Farmware",
      "Install",
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("doesn't install a new farmware without URL", () => {
    const p = fakeProps();
    const wrapper =
      mount<FarmwareList>(<FarmwareList {...p} />);
    expect(wrapper.instance().state.packageUrl).toEqual("");
    window.alert = jest.fn();
    clickButton(wrapper, 0, "Install");
    expect(window.alert).toHaveBeenCalledWith("Enter a URL");
    expect(mockDevice.installFarmware).not.toHaveBeenCalled();
  });

  const FAKE_INSTALL_URL = "https://foo.bar/manifest.json";

  it("changes install URL", () => {
    const wrapper =
      shallow<FarmwareList>(<FarmwareList {...fakeProps()} />);
    expect(wrapper.instance().state.packageUrl).toEqual("");
    wrapper.find("input").simulate("change", {
      currentTarget: { value: FAKE_INSTALL_URL }
    });
    expect(wrapper.instance().state.packageUrl).toEqual(FAKE_INSTALL_URL);
  });

  it("installs a new farmware", () => {
    const p = fakeProps();
    const wrapper = mount<{}>(<FarmwareList {...p} />);
    wrapper.setState({ packageUrl: FAKE_INSTALL_URL });
    window.alert = jest.fn();
    clickButton(wrapper, 0, "Install");
    expect(window.alert).not.toHaveBeenCalled();
    expect(mockDevice.installFarmware).toHaveBeenCalledWith(FAKE_INSTALL_URL);
  });

  it("doesn't show 1st-party Farmware", () => {
    const p = fakeProps();
    const farmware = fakeFarmware();
    farmware.name = "Fake First-Party Farmware";
    p.farmwares["farmware_1"] = farmware;
    p.firstPartyFarmwareNames = ["Fake First-Party Farmware"];
    p.showFirstParty = false;
    const wrapper = mount<{}>(<FarmwareList {...p} />);
    expect(wrapper.text()).not.toContain("Fake First-Party Farmware");
  });

  it("shows 1st-party Farmware", () => {
    const p = fakeProps();
    const farmware = fakeFarmware();
    farmware.name = "Fake First-Party Farmware";
    p.farmwares["farmware_1"] = farmware;
    p.firstPartyFarmwareNames = ["Fake First-Party Farmware"];
    p.showFirstParty = true;
    const wrapper = mount<{}>(<FarmwareList {...p} />);
    expect(wrapper.text()).toContain("Fake First-Party Farmware");
  });

  it("navigates to Farmware", () => {
    const p = fakeProps();
    const wrapper = shallow(<FarmwareList {...p} />);
    wrapper.find("Link").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_FARMWARE,
      payload: "Photos"
    });
  });
});
