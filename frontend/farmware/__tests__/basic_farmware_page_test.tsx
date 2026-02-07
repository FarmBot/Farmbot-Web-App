const mockDevice = { execScript: jest.fn((_) => Promise.resolve({})) };

import React from "react";
import { mount } from "enzyme";
import { BasicFarmwarePage, BasicFarmwarePageProps } from "../basic_farmware_page";
import { fakeFarmware } from "../../__test_support__/fake_farmwares";
import * as deviceModule from "../../device";

beforeEach(() => {
  jest.spyOn(deviceModule, "getDevice")
    .mockImplementation(() => mockDevice as never);
});

afterEach(() => {
  jest.restoreAllMocks();
});
describe("<BasicFarmwarePage />", () => {
  const fakeProps = (): BasicFarmwarePageProps => ({
    farmwareName: "My Farmware",
    farmware: fakeFarmware("My Farmware"),
    botOnline: true,
  });

  it("renders without inputs", () => {
    const wrapper = mount(<BasicFarmwarePage {...fakeProps()} />);
    expect(wrapper.text()).toContain("No inputs provided.");
  });

  it("runs Farmware", () => {
    const wrapper = mount(<BasicFarmwarePage {...fakeProps()} />);
    wrapper.find("button").first().simulate("click");
    expect(mockDevice.execScript).toHaveBeenCalledWith("My Farmware", []);
  });

  it("renders Farmware pending install", () => {
    const p = fakeProps();
    p.farmware && (p.farmware.installation_pending = true);
    const wrapper = mount(<BasicFarmwarePage {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("pending installation");
    expect(wrapper.find("button").first().props().disabled).toEqual(true);
  });
});
