jest.mock("../../history", () => ({ history: { push: jest.fn() } }));

import { tourPageNavigation } from "../tours";
import { history } from "../../history";

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
    testCase(".photos");
    testCase(".logs-table");
    testCase(".app-settings-widget");
  });
});
