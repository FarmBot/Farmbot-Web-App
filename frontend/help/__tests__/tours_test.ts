jest.mock("../../history", () => ({ history: { push: jest.fn() } }));

import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: { getState: () => mockState },
}));

import { tourPageNavigation, TOUR_STEPS, Tours } from "../tours";
import { history } from "../../history";
import {
  fakeTool, fakeFbosConfig,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";

describe("tourPageNavigation()", () => {
  const testCase = (el: string, expected?: string) => {
    tourPageNavigation(el);
    expected
      ? expect(history.push).toHaveBeenCalledWith(expected)
      : expect(history.push).toHaveBeenCalled();
  };

  it("covers all cases", () => {
    testCase(".farm-designer");
    testCase(".plant-inventory-panel");
    testCase(".farm-event-panel");
    testCase(".move");
    testCase(".peripherals-widget");
    testCase(".sequence-list-panel");
    testCase(".designer-regimen-list-panel-content");
    testCase(".tool-list");
    testCase(".toolbay-list");
    testCase(".tools");
    testCase(".tool-slots");
    testCase(".tools-panel");
    testCase(".photos");
    testCase(".logs-table");
    testCase(".settings-panel-content");
  });

  it("includes steps based on tool count", () => {
    const getTargets = () =>
      Object.values(TOUR_STEPS()[Tours.gettingStarted]).map(t => t.target);
    mockState.resources = buildResourceIndex([]);
    expect(getTargets()).not.toContain(".tool-slots");
    mockState.resources = buildResourceIndex([fakeTool()]);
    expect(getTargets()).toContain(".tool-slots");
  });

  it("has correct content based on board version", () => {
    const getTitles = () =>
      Object.values(TOUR_STEPS()[Tours.gettingStarted]).map(t => t.title);
    mockState.resources = buildResourceIndex([]);
    expect(getTitles()).toContain("Add tools and slots");
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
});
