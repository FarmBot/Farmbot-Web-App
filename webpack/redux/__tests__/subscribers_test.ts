jest.mock("../../resources/selectors", () => {
  return {
    all: jest.fn((x) => x)
  };
});

import { dontExitIfBrowserIsOnHold, stopThem, dontStopThem } from "../subscribers";
import { SpecialStatus } from "../../resources/tagged_resources";
describe("dontExitIfBrowserIsOnHold", () => {
  it("knows when to attach the correct event handlers", () => {
    dontExitIfBrowserIsOnHold({
      resources: {
        index: [
          {
            specialStatus: SpecialStatus.DIRTY
          }
        ]
      }
    } as any);
    expect(window.onbeforeunload).toBe(stopThem);
    dontExitIfBrowserIsOnHold({
      resources: {
        index: [
          {
            specialStatus: SpecialStatus.SAVED
          }
        ]
      }
    } as any);
    expect(window.onbeforeunload).toBe(dontStopThem);
    expect(stopThem()).toBe("You have unsaved work.");
  });
});
