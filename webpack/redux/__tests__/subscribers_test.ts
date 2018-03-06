import {
  unsavedCheck,
  stopThem,
  dontStopThem
} from "../subscribers";
import {
  buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import { WebAppConfig } from "../../config_storage/web_app_configs";
import { SpecialStatus, TaggedWebAppConfig } from "../../resources/tagged_resources";
import { Everything } from "../../interfaces";

describe("unsavedCheck", () => {
  function setItUp(specialStatus: SpecialStatus, body: Partial<WebAppConfig>) {

    const config: TaggedWebAppConfig = {
      kind: "WebAppConfig",
      uuid: "NOT SET HERE!",
      specialStatus,
      body: (body as any)
    };

    return { resources: buildResourceIndex([config]) } as Everything;
  }
  function nope() { }

  it("stops users if they have unsaved work", () => {
    window.onbeforeunload = nope;
    unsavedCheck(setItUp(SpecialStatus.DIRTY, { discard_unsaved: false }));
    expect(window.onbeforeunload).toBe(stopThem);
  });

  it("attaches dontStopThem", () => {
    window.onbeforeunload = nope;
    unsavedCheck(setItUp(SpecialStatus.SAVED, { discard_unsaved: false }));
    expect(window.onbeforeunload).toBe(dontStopThem);
    expect(stopThem()).toBe("You have unsaved work.");
  });

  it("skips checks when user decides so", () => {
    window.onbeforeunload = nope;
    unsavedCheck(setItUp(SpecialStatus.DIRTY, { discard_unsaved: true }));
    expect(window.onbeforeunload).toBe(dontStopThem);
  });
});
