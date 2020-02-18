jest.mock("../../history", () => ({ history: { push: jest.fn() } }));

let mockDev = false;
jest.mock("../../account/dev/dev_support", () => ({
  DevSettings: {
    futureFeaturesEnabled: () => mockDev,
  }
}));

import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: { getState: () => mockState },
}));

import { tourPageNavigation, TOUR_STEPS, Tours } from "../tours";
import { history } from "../../history";
import { fakeTool, fakeFbosConfig } from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";

describe("tourPageNavigation()", () => {
  const testCase = (el: string) => {
    tourPageNavigation(el);
    expect(history.push).toHaveBeenCalled();
  };

  it("covers all cases", () => {
    testCase(".farm-designer");
    testCase(".plant-inventory-panel");
    testCase(".farm-event-panel");
    testCase(".move-widget");
    testCase(".peripherals-widget");
    testCase(".device-widget");
    testCase(".sequence-list-panel");
    testCase(".regimen-list-panel");
    testCase(".tool-list");
    testCase(".toolbay-list");
    testCase(".tools");
    testCase(".tool-slots");
    testCase(".tools-panel");
    testCase(".photos");
    testCase(".logs-table");
    testCase(".app-settings-widget");
  });

  it("includes steps based on tool count", () => {
    const getTargets = () =>
      Object.values(TOUR_STEPS()[Tours.gettingStarted]).map(t => t.target);
    mockDev = false;
    mockState.resources = buildResourceIndex([]);
    expect(getTargets()).not.toContain(".tool-slots");
    mockState.resources = buildResourceIndex([fakeTool()]);
    expect(getTargets()).toContain(".tool-slots");
  });

  it("has correct content based on board version", () => {
    const getTitles = () =>
      Object.values(TOUR_STEPS()[Tours.gettingStarted]).map(t => t.title);
    mockDev = false;
    mockState.resources = buildResourceIndex([]);
    expect(getTitles()).toContain("Add tools and tool slots");
    expect(getTitles()).not.toContain("Add seed containers");
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.firmware_hardware = "express_k10";
    mockState.resources = buildResourceIndex([fbosConfig]);
    expect(getTitles()).toContain("Add seed containers and slots");
    expect(getTitles()).not.toContain("Add seed containers");
    mockState.resources = buildResourceIndex([fbosConfig, fakeTool()]);
    expect(getTitles()).not.toContain("Add seed containers and slots");
    expect(getTitles()).toContain("Add seed containers");
  });

  it("includes correct tour steps", () => {
    mockDev = true;
    const targets =
      Object.values(TOUR_STEPS()[Tours.gettingStarted]).map(t => t.target);
    expect(targets).not.toContain(".tools");
    expect(targets).toContain(".tool-list");
    expect(targets).toContain(".toolbay-list");
  });
});
