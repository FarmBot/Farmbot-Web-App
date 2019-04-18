jest.mock("../../devices/actions", () => ({ updateConfig: jest.fn() }));

jest.mock("../../api/crud", () => ({ destroy: jest.fn() }));

import * as React from "react";
import { mount } from "enzyme";
import { AlertCard, changeFirmwareHardware } from "../cards";
import { AlertCardProps } from "../interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { FBSelect } from "../../ui";
import { destroy } from "../../api/crud";
import { updateConfig } from "../../devices/actions";

describe("<AlertCard />", () => {
  const fakeProps = (): AlertCardProps => ({
    alert: {
      created_at: 123,
      problem_tag: "author.noun.verb",
      priority: 100,
      uuid: "uuid",
    },
    apiFirmwareValue: undefined,
    timeSettings: fakeTimeSettings(),
    dispatch: jest.fn(),
  });

  it("renders unknown card", () => {
    const p = fakeProps();
    p.alert.id = 1;
    p.findApiAlertById = () => "uuid";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("noun: verb (author)");
    wrapper.find(".fa-times").simulate("click");
    expect(destroy).toHaveBeenCalledWith("uuid");
  });

  it("renders firmware card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "farmbot_os.firmware.missing";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("Your device has no firmware");
    expect(wrapper.find(".fa-times").length).toEqual(0);
  });

  it("renders seed data card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.seed_data.missing";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("FarmBot");
    wrapper.find(FBSelect).simulate("change");
  });

  it("renders tour card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.tour.not_taken";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("tour");
  });

  it("renders welcome card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.user.not_welcomed";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("Welcome");
  });

  it("renders documentation card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.documentation.unread";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("Learn");
  });
});

describe("changeFirmwareHardware()", () => {
  it("changes firmware hardware value", () => {
    changeFirmwareHardware(jest.fn())({ label: "Arduino", value: "arduino" });
    expect(updateConfig).toHaveBeenCalledWith({ firmware_hardware: "arduino" });
  });
});
