jest.mock("../../devices/actions", () => ({ updateConfig: jest.fn() }));

jest.mock("../../api/crud", () => ({ destroy: jest.fn() }));

const fakeBulletin: Bulletin = {
  content: "Alert content.",
  href: "https://farm.bot",
  href_label: "See more",
  type: "info",
  slug: "slug",
  title: "Announcement",
};

let mockData: Bulletin | undefined = fakeBulletin;
jest.mock("../actions", () => ({
  fetchBulletinContent: jest.fn(() => Promise.resolve(mockData)),
  seedAccount: jest.fn(),
}));

jest.mock("../../session", () => ({ Session: { clear: jest.fn() } }));

jest.mock("../../history", () => ({ push: jest.fn() }));

import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: { getState: () => mockState, dispatch: jest.fn() },
}));

let mockShouldDisplay = false;
jest.mock("../../farmware/state_to_props", () => ({
  shouldDisplayFeature: () => mockShouldDisplay,
}));

import React from "react";
import { mount } from "enzyme";
import { AlertCard, changeFirmwareHardware } from "../cards";
import { AlertCardProps, Bulletin } from "../interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { FBSelect } from "../../ui";
import { destroy } from "../../api/crud";
import { updateConfig } from "../../devices/actions";
import { Session } from "../../session";
import { push } from "../../history";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeWizardStepResult } from "../../__test_support__/fake_state/resources";

describe("<AlertCard />", () => {
  const fakeProps = (): AlertCardProps => ({
    alert: {
      created_at: 123,
      problem_tag: "author.noun.verb",
      priority: 100,
      slug: "slug",
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
    p.alert.created_at = 1555555555;
    p.timeSettings.hour24 = false;
    p.timeSettings.utcOffset = 0;
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("Your device has no firmware");
    expect(wrapper.find(".fa-times").length).toEqual(0);
    expect(wrapper.text()).toContain("Apr");
    expect(wrapper.text()).toContain("Select one");
  });

  it("renders firmware card with pre-filled selection", () => {
    const p = fakeProps();
    p.alert.problem_tag = "farmbot_os.firmware.missing";
    p.alert.created_at = 1555555555;
    p.timeSettings.hour24 = false;
    p.timeSettings.utcOffset = 0;
    p.apiFirmwareValue = "arduino";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("Your device has no firmware");
    expect(wrapper.find(".fa-times").length).toEqual(0);
    expect(wrapper.text()).toContain("Apr");
    expect(wrapper.text()).not.toContain("Select one");
    expect(wrapper.text()).toContain("Arduino/RAMPS (Genesis v1.2)");
    expect(JSON.stringify(wrapper.find(FBSelect).props().list))
      .not.toContain("v1.6");
  });

  it("renders firmware card with new boards", () => {
    mockShouldDisplay = true;
    const p = fakeProps();
    p.alert.problem_tag = "farmbot_os.firmware.missing";
    p.alert.created_at = 1555555555;
    p.timeSettings.hour24 = false;
    p.timeSettings.utcOffset = 0;
    p.apiFirmwareValue = "arduino";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("Your device has no firmware");
    expect(JSON.stringify(wrapper.find(FBSelect).props().list))
      .toContain("v1.6");
    mockShouldDisplay = false;
  });

  it("renders seed data card", () => {
    mockShouldDisplay = false;
    const p = fakeProps();
    p.alert.problem_tag = "api.seed_data.missing";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("FarmBot");
    expect(JSON.stringify(wrapper.find(FBSelect).props().list))
      .not.toContain("v1.6");
    wrapper.find(FBSelect).simulate("change");
  });

  it("renders seed data card with new models", () => {
    mockShouldDisplay = true;
    const p = fakeProps();
    p.alert.problem_tag = "api.seed_data.missing";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("FarmBot");
    expect(JSON.stringify(wrapper.find(FBSelect).props().list))
      .toContain("v1.6");
    mockShouldDisplay = false;
  });

  it("renders setup card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.setup.not_completed";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("wizard");
    wrapper.find("a").simulate("click");
    expect(push).toHaveBeenCalledWith("/app/designer/setup");
    expect(wrapper.text().toLowerCase()).toContain("get started");
  });

  it("renders setup card: partially complete", () => {
    const stepResult = fakeWizardStepResult();
    stepResult.body.answer = true;
    mockState.resources = buildResourceIndex([stepResult]);
    const p = fakeProps();
    p.alert.problem_tag = "api.setup.not_completed";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("continue setup");
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

  it("renders demo account card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.demo_account.in_use";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("currently using");
    wrapper.find("a").first().simulate("click");
    wrapper.find("a").last().simulate("click");
    expect(Session.clear).toHaveBeenCalledTimes(2);
  });

  it("renders loading bulletin card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.bulletin.unread";
    const wrapper = mount(<AlertCard {...p} />);
    ["Loading", "Slug"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("has no content to load for bulletin card", async () => {
    mockData = undefined;
    const p = fakeProps();
    p.alert.problem_tag = "api.bulletin.unread";
    const wrapper = await mount(<AlertCard {...p} />);
    ["Unable to load content.", "Slug"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("renders loaded bulletin card", async () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.bulletin.unread";
    mockData = fakeBulletin;
    mockData.href_label = "See more";
    mockData.type = "info";
    const wrapper = await mount(<AlertCard {...p} />);
    ["Loading...", "Slug"].map(string =>
      expect(wrapper.text()).not.toContain(string));
    ["Announcement", "Alert content.", "See more"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("renders loaded bulletin card with missing fields", async () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.bulletin.unread";
    mockData = fakeBulletin;
    mockData.href_label = undefined;
    mockData.type = "unknown";
    const wrapper = await mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("Find out more");
  });

  it("hides incorrect time", () => {
    const p = fakeProps();
    p.alert.problem_tag = "farmbot_os.firmware.missing";
    p.alert.created_at = 0;
    p.timeSettings.hour24 = false;
    p.timeSettings.utcOffset = 0;
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).not.toContain("Jan 1, 12:00am");
  });
});

describe("changeFirmwareHardware()", () => {
  it("changes firmware hardware value", () => {
    changeFirmwareHardware(jest.fn())({ label: "Arduino", value: "arduino" });
    expect(updateConfig).toHaveBeenCalledWith({ firmware_hardware: "arduino" });
  });

  it("doesn't change firmware hardware value", () => {
    changeFirmwareHardware(jest.fn())({ label: "Arduino", value: "" });
    expect(updateConfig).not.toHaveBeenCalled();
  });

  it("doesn't change firmware hardware value: no dispatch", () => {
    changeFirmwareHardware(undefined)({ label: "Arduino", value: "arduino" });
    expect(updateConfig).not.toHaveBeenCalled();
  });
});
