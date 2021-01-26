import { bulkToggleControlPanel, toggleControlPanel } from "../toggle_section";

describe("toggleControlPanel()", () => {
  it("toggles", () => {
    const action = toggleControlPanel("axis_settings");
    expect(action.payload).toEqual("axis_settings");
  });
});

describe("bulkToggleControlPanel()", () => {
  it("toggles", () => {
    const action = bulkToggleControlPanel(true);
    expect(action.payload).toEqual(true);
  });
});
