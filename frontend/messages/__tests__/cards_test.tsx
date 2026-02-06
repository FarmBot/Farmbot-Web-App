let mockFeatureBoolean = false;

const fakeBulletin: Bulletin = {
  content: "Alert content.",
  href: "https://farm.bot",
  href_label: "See more",
  type: "info",
  slug: "slug",
  title: "Announcement",
};

let mockData: Bulletin | undefined = fakeBulletin;
const mockSeedAccount = jest.fn();

import { fakeState } from "../../__test_support__/fake_state";
import { store } from "../../redux/store";
const mockState = fakeState();

import React from "react";
import { mount, shallow } from "enzyme";
import axios from "axios";
import {
  AlertCard, changeFirmwareHardware, ReSeedAccount, SEED_DATA_OPTIONS,
} from "../cards";
import { AlertCardProps, Bulletin } from "../interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { FBSelect } from "../../ui";
import * as crud from "../../api/crud";
import * as deviceActions from "../../devices/actions";
import * as shouldDisplay from "../../devices/should_display";
import * as messageActions from "../actions";
import { Session } from "../../session";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeWizardStepResult } from "../../__test_support__/fake_state/resources";
import { Path } from "../../internal_urls";
import { API } from "../../api";
import moment from "moment";

API.setBaseUrl("");

let originalGetState: typeof store.getState;
let originalDispatch: typeof store.dispatch;
let destroySpy: jest.SpyInstance;
let updateConfigSpy: jest.SpyInstance;
let shouldDisplayFeatureSpy: jest.SpyInstance;
let fetchBulletinContentSpy: jest.SpyInstance;
let seedAccountSpy: jest.SpyInstance;
let axiosDeleteSpy: jest.SpyInstance;
let sessionClearSpy: jest.SpyInstance;

beforeEach(() => {
  mockFeatureBoolean = false;
  mockData = fakeBulletin;
  mockSeedAccount.mockClear();
  mockState.resources = fakeState().resources;
  originalGetState = store.getState;
  originalDispatch = store.dispatch;
  (store as unknown as { getState: () => typeof mockState }).getState =
    () => mockState;
  (store as unknown as { dispatch: jest.Mock }).dispatch = jest.fn();
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  updateConfigSpy = jest.spyOn(deviceActions, "updateConfig")
    .mockImplementation(jest.fn());
  shouldDisplayFeatureSpy = jest.spyOn(shouldDisplay, "shouldDisplayFeature")
    .mockImplementation(() => mockFeatureBoolean);
  fetchBulletinContentSpy = jest.spyOn(messageActions, "fetchBulletinContent")
    .mockImplementation(() => Promise.resolve(mockData) as never);
  seedAccountSpy = jest.spyOn(messageActions, "seedAccount")
    .mockImplementation(() => mockSeedAccount as never);
  axiosDeleteSpy = jest.spyOn(axios, "delete").mockResolvedValue({} as never);
  sessionClearSpy = jest.spyOn(Session, "clear").mockImplementation(jest.fn());
});

afterEach(() => {
  (store as unknown as { getState: typeof store.getState }).getState =
    originalGetState;
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch =
    originalDispatch;
  destroySpy.mockRestore();
  updateConfigSpy.mockRestore();
  shouldDisplayFeatureSpy.mockRestore();
  fetchBulletinContentSpy.mockRestore();
  seedAccountSpy.mockRestore();
  axiosDeleteSpy.mockRestore();
  sessionClearSpy.mockRestore();
});

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
    expect(crud.destroy).toHaveBeenCalledWith("uuid");
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
    expect(wrapper.text()).toContain("2019");
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
      .toContain("v1.1");
  });

  it("renders firmware card with new boards", () => {
    mockFeatureBoolean = true;
    const p = fakeProps();
    p.alert.problem_tag = "farmbot_os.firmware.missing";
    p.alert.created_at = 1555555555;
    p.timeSettings.hour24 = false;
    p.timeSettings.utcOffset = 0;
    p.apiFirmwareValue = "arduino";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("Your device has no firmware");
    expect(JSON.stringify(wrapper.find(FBSelect).props().list))
      .toContain("v1.1");
  });

  it("renders seed data card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.seed_data.missing";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("FarmBot");
    expect(JSON.stringify(wrapper.find(FBSelect).props().list))
      .toContain("v1.1");
    wrapper.find(FBSelect).simulate("change");
  });

  it("renders seed data card with new models", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.seed_data.missing";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("FarmBot");
    expect(JSON.stringify(wrapper.find(FBSelect).props().list))
      .toContain("v1.1");
  });

  it("renders setup card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.setup.not_completed";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("wizard");
    wrapper.find("a").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.setup());
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

  it("navigates to tours page", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.tour.not_taken";
    const wrapper = mount(<AlertCard {...p} />);
    expect(wrapper.text()).toContain("tour");
    wrapper.find(".link-button").first().simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.tours());
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

  it("doesn't show current year", () => {
    const p = fakeProps();
    p.alert.problem_tag = "farmbot_os.firmware.missing";
    p.alert.created_at = Date.now().valueOf() / 1000;
    p.timeSettings.hour24 = false;
    p.timeSettings.utcOffset = 0;
    const wrapper = mount(<AlertCard {...p} />);
    const currentYear = moment().format("YYYY");
    expect(wrapper.text()).not.toContain(currentYear);
  });
});

describe("changeFirmwareHardware()", () => {
  it("changes firmware hardware value", () => {
    changeFirmwareHardware(jest.fn())({ label: "Arduino", value: "arduino" });
    expect(deviceActions.updateConfig)
      .toHaveBeenCalledWith({ firmware_hardware: "arduino" });
  });

  it("doesn't change firmware hardware value", () => {
    changeFirmwareHardware(jest.fn())({ label: "Arduino", value: "" });
    expect(deviceActions.updateConfig).not.toHaveBeenCalled();
  });

  it("doesn't change firmware hardware value: no dispatch", () => {
    changeFirmwareHardware(undefined)({ label: "Arduino", value: "arduino" });
    expect(deviceActions.updateConfig).not.toHaveBeenCalled();
  });
});

describe("SEED_DATA_OPTIONS()", () => {
  it("returns options", () => {
    mockFeatureBoolean = false;
    expect(SEED_DATA_OPTIONS().length).toEqual(17);
  });

  it("returns more options", () => {
    mockFeatureBoolean = true;
    expect(SEED_DATA_OPTIONS().length).toEqual(19);
  });
});

describe("<ReSeedAccount />", () => {
  it("changes selection", () => {
    window.confirm = () => true;
    const wrapper = shallow(<ReSeedAccount />);
    wrapper.find(FBSelect).simulate("change", { label: "", value: "selection" });
    wrapper.find("button").last().simulate("click");
    expect(mockSeedAccount).toHaveBeenCalledWith({ label: "", value: "selection" });
  });
});
