jest.mock("../../resources/selectors", () => {
  return {
    all: jest.fn((x) => x)
  };
});

import {
  unsavedCheck,
  stopThem,
  dontStopThem
} from "../subscribers";
import {
  buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import { WebAppConfig } from "../../config_storage/web_app_configs";
import {
  SpecialStatus,
  TaggedWebAppConfig
} from "../../resources/tagged_resources";
import { Everything } from "../../interfaces";

describe("unsavedCheck", () => {
  function setItUp(specialStatus: SpecialStatus, body: Partial<WebAppConfig>) {
    const config: TaggedWebAppConfig = {
      kind: "WebAppConfig",
      uuid: "WebAppConfig.1.1",
      specialStatus,
      body: (body as any)
    };
    return { resources: buildResourceIndex([config]) } as Everything;
  }
  it("knows when to attach the correct event handlers", () => {
    unsavedCheck(setItUp(SpecialStatus.DIRTY, { discard_unsaved: false }));
    expect(window.onbeforeunload).toBe(stopThem);
    unsavedCheck(setItUp(SpecialStatus.SAVED, { discard_unsaved: false }));
    expect(window.onbeforeunload).toBe(dontStopThem);
    unsavedCheck(setItUp(SpecialStatus.DIRTY, { discard_unsaved: true }));
    expect(window.onbeforeunload).toBe(dontStopThem);
    expect(stopThem()).toBe("You have unsaved work.");
  });
});
