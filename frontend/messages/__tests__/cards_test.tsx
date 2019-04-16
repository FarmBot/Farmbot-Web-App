import * as React from "react";
import { mount } from "enzyme";
import { AlertCard } from "../cards";
import { AlertCardProps } from "../interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { FBSelect } from "../../ui";

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
    const wrapper = mount(<AlertCard {...fakeProps()} />);
    expect(wrapper.text()).toContain("noun: verb (author)");
  });

  it("renders firmware card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "farmbot_os.firmware.missing";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("Firmware missing");
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
