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
import { fireEvent, render, waitFor } from "@testing-library/react";
import axios from "axios";
import {
  AlertCard, changeFirmwareHardware, ReSeedAccount, SEED_DATA_OPTIONS,
} from "../cards";
import { AlertCardProps, Bulletin } from "../interfaces";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
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
import * as ui from "../../ui";

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
let fbSelectSpy: jest.SpyInstance;

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
  sessionClearSpy = jest.spyOn(Session, "clear")
    .mockImplementation(() => undefined as never);
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation(((props: import("../../ui/new_fb_select").FBSelectProps & {
      customNullLabel?: string;
    }) =>
      React.createElement("button", {
        className: "fb-select-mock",
        "data-list": JSON.stringify(props.list),
        onClick: () => props.onChange?.({ label: "", value: "selection" }),
      }, props.selectedItem?.label || props.customNullLabel || "")) as never);
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
  fbSelectSpy.mockRestore();
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
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent).toContain("noun: verb (author)");
    fireEvent.click(container.querySelector(".fa-times") as Element);
    expect(crud.destroy).toHaveBeenCalledWith("uuid");
  });

  it("renders firmware card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "farmbot_os.firmware.missing";
    p.alert.created_at = 1555555555;
    p.timeSettings.hour24 = false;
    p.timeSettings.utcOffset = 0;
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent).toContain("Your device has no firmware");
    expect(container.querySelectorAll(".fa-times").length).toEqual(0);
    expect(container.textContent).toContain("Apr");
    expect(container.textContent).toContain("2019");
    expect(container.textContent).toContain("Select one");
  });

  it("renders firmware card with pre-filled selection", () => {
    const p = fakeProps();
    p.alert.problem_tag = "farmbot_os.firmware.missing";
    p.alert.created_at = 1555555555;
    p.timeSettings.hour24 = false;
    p.timeSettings.utcOffset = 0;
    p.apiFirmwareValue = "arduino";
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent).toContain("Your device has no firmware");
    expect(container.querySelectorAll(".fa-times").length).toEqual(0);
    expect(container.textContent).toContain("Apr");
    expect(container.textContent).not.toContain("Select one");
    expect(container.textContent).toContain("Arduino/RAMPS (Genesis v1.2)");
    expect(container.querySelector(".fb-select-mock")?.getAttribute("data-list"))
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
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent).toContain("Your device has no firmware");
    expect(container.querySelector(".fb-select-mock")?.getAttribute("data-list"))
      .toContain("v1.1");
  });

  it("renders seed data card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.seed_data.missing";
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent).toContain("FarmBot");
    expect(container.querySelector(".fb-select-mock")?.getAttribute("data-list"))
      .toContain("v1.1");
    fireEvent.click(container.querySelector(".fb-select-mock") as Element);
  });

  it("renders seed data card with new models", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.seed_data.missing";
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent).toContain("FarmBot");
    expect(container.querySelector(".fb-select-mock")?.getAttribute("data-list"))
      .toContain("v1.1");
  });

  it("renders setup card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.setup.not_completed";
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("wizard");
    fireEvent.click(container.querySelector("a") as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.setup());
    expect(container.textContent?.toLowerCase()).toContain("get started");
  });

  it("renders setup card: partially complete", () => {
    const stepResult = fakeWizardStepResult();
    stepResult.body.answer = true;
    mockState.resources = buildResourceIndex([stepResult]);
    const p = fakeProps();
    p.alert.problem_tag = "api.setup.not_completed";
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("continue setup");
  });

  it("navigates to tours page", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.tour.not_taken";
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent).toContain("tour");
    fireEvent.click(container.querySelector(".link-button") as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.tours());
  });

  it("renders welcome card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.user.not_welcomed";
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent).toContain("Welcome");
  });

  it("renders documentation card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.documentation.unread";
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent).toContain("Learn");
  });

  it("renders demo account card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.demo_account.in_use";
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent).toContain("currently using");
    const links = container.querySelectorAll("a");
    fireEvent.click(links[0] as Element);
    fireEvent.click(links[links.length - 1] as Element);
    expect(Session.clear).toHaveBeenCalledTimes(2);
  });

  it("renders loading bulletin card", () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.bulletin.unread";
    const { container } = render(<AlertCard {...p} />);
    ["Loading", "Slug"].map(string =>
      expect(container.textContent).toContain(string));
  });

  it("has no content to load for bulletin card", async () => {
    mockData = undefined;
    const p = fakeProps();
    p.alert.problem_tag = "api.bulletin.unread";
    const { container } = render(<AlertCard {...p} />);
    await waitFor(() =>
      expect(container.textContent).toContain("Unable to load content."));
    ["Unable to load content.", "Slug"].map(string =>
      expect(container.textContent).toContain(string));
  });

  it("renders loaded bulletin card", async () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.bulletin.unread";
    mockData = fakeBulletin;
    mockData.href_label = "See more";
    mockData.type = "info";
    const { container } = render(<AlertCard {...p} />);
    await waitFor(() =>
      expect(container.textContent).toContain("Announcement"));
    ["Loading...", "Slug"].map(string =>
      expect(container.textContent).not.toContain(string));
    ["Announcement", "Alert content.", "See more"].map(string =>
      expect(container.textContent).toContain(string));
  });

  it("renders loaded bulletin card with missing fields", async () => {
    const p = fakeProps();
    p.alert.problem_tag = "api.bulletin.unread";
    mockData = fakeBulletin;
    mockData.href_label = undefined;
    mockData.type = "unknown";
    const { container } = render(<AlertCard {...p} />);
    await waitFor(() =>
      expect(container.textContent).toContain("Find out more"));
  });

  it("hides incorrect time", () => {
    const p = fakeProps();
    p.alert.problem_tag = "farmbot_os.firmware.missing";
    p.alert.created_at = 0;
    p.timeSettings.hour24 = false;
    p.timeSettings.utcOffset = 0;
    const { container } = render(<AlertCard {...p} />);
    expect(container.textContent).not.toContain("Jan 1, 12:00am");
  });

  it("doesn't show current year", () => {
    const p = fakeProps();
    p.alert.problem_tag = "farmbot_os.firmware.missing";
    p.alert.created_at = Date.now().valueOf() / 1000;
    p.timeSettings.hour24 = false;
    p.timeSettings.utcOffset = 0;
    const { container } = render(<AlertCard {...p} />);
    const currentYear = moment().format("YYYY");
    expect(container.textContent).not.toContain(currentYear);
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
    const { container } = render(<ReSeedAccount />);
    fireEvent.click(container.querySelector(".fb-select-mock") as Element);
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[buttons.length - 1] as Element);
    expect(mockSeedAccount).toHaveBeenCalledWith({
      label: "",
      value: "selection",
    });
  });
});
