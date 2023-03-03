import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import * as Selector from "../selectors";
import { TaggedTool, TaggedToolSlotPointer } from "farmbot";
import { saveOK } from "../actions";
import { hasId, arrayUnwrap } from "../util";
import {
  fakeWebcamFeed, fakeSequence, fakeToolSlot, fakeUser, fakeWizardStepResult,
} from "../../__test_support__/fake_state/resources";
import { resourceReducer, emptyState } from "../reducer";
import { resourceReady, newTaggedResource } from "../../sync/actions";
import { chain } from "lodash";

const TOOL_ID = 99;
const SLOT_ID = 100;
const fakeTool: TaggedTool = arrayUnwrap(newTaggedResource("Tool", {
  name: "yadda yadda",
  flow_rate_ml_per_s: 0,
  id: TOOL_ID
}));
const fakeSlot: TaggedToolSlotPointer = arrayUnwrap(newTaggedResource("Point",
  {
    tool_id: TOOL_ID,
    pointer_type: "ToolSlot",
    x: 0,
    y: 0,
    z: 0,
    name: "wow",
    pointer_id: SLOT_ID,
    meta: {},
    pullout_direction: 0,
    gantry_mounted: false,
  }));

const fakeIndex = buildResourceIndex().index;

describe("findSlotByToolId", () => {
  it("returns undefined when not found", () => {
    const state = resourceReducer(buildResourceIndex(), saveOK(fakeTool));
    expect(state.index.byKindAndId["Tool." + fakeTool.body.id])
      .toEqual(fakeTool.uuid);
    const result = Selector.findSlotByToolId(state.index, TOOL_ID);
    expect(result).toBeFalsy();
  });

  it("returns something when there is a match", () => {
    const initialState = buildResourceIndex();
    const state = [saveOK(fakeTool), saveOK(fakeSlot)]
      .reduce(resourceReducer, initialState);
    const result = Selector.findSlotByToolId(state.index, TOOL_ID);
    expect(result).toBeTruthy();
    if (result) { expect(result.kind).toBe("Point"); }
  });
});

describe("getFeeds", () => {
  it("returns empty array", () => {
    expect(Selector.selectAllWebcamFeeds(emptyState().index).length).toBe(0);
  });

  it("finds the only WebcamFeed", () => {
    const feed = fakeWebcamFeed();
    const state = [
      resourceReady("WebcamFeed", feed),
    ].reduce(resourceReducer, emptyState());
    expect(Selector.selectAllWebcamFeeds(state.index)[0].body).toEqual(feed.body);
  });
});

describe("getWizardStepResults", () => {
  it("returns empty array", () => {
    expect(Selector.selectAllWizardStepResults(emptyState().index).length).toBe(0);
  });

  it("finds the only WizardStepResult", () => {
    const feed = fakeWizardStepResult();
    const state = [
      resourceReady("WizardStepResult", feed),
    ].reduce(resourceReducer, emptyState());
    expect(Selector.selectAllWizardStepResults(state.index)[0].body)
      .toEqual(feed.body);
  });
});

describe("selectAllLogs", () => {
  it("stays truthful to its name by finding all logs", () => {
    const results = Selector.selectAllLogs(fakeIndex);
    expect(results.length).toBeGreaterThan(0);
    const kinds = chain(results).map("kind").uniq().value();
    expect(kinds.length).toEqual(1);
    expect(kinds[0]).toEqual("Log");
  });
});

describe("findUuid()", () => {
  it("returns UUID", () => {
    const uuid = Selector.findUuid(fakeIndex, "Sequence", 23);
    expect(uuid).toContain("Sequence.23");
  });

  it("throws error", () => {
    const findUuid = () =>
      Selector.findUuid(fakeIndex, "Sequence", NaN);
    expect(findUuid).toThrow("UUID not found for id NaN");
  });
});

describe("findPointerByTypeAndId()", () => {
  it("throws error", () => {
    const find = () => Selector.findPointerByTypeAndId(fakeIndex, "Other", 0);
    expect(find).toThrow("Tried to fetch bad point Other 0");
  });
});

describe("selectCurrentToolSlot()", () => {
  it("returns tool slot", () => {
    const toolSlot = fakeToolSlot();
    const resourceIndex = buildResourceIndex([toolSlot]).index;
    const result = Selector.selectCurrentToolSlot(resourceIndex, toolSlot.uuid);
    expect(result.uuid).toBe(toolSlot.uuid);
  });

  it("throws error", () => {
    const find = () => Selector.selectCurrentToolSlot(fakeIndex, "bad");
    expect(find).toThrow();
  });
});

describe("getSequenceByUUID()", () => {
  it("throws error", () => {
    console.warn = jest.fn();
    const find = () => Selector.getSequenceByUUID(fakeIndex, "bad");
    expect(find).toThrow("BAD Sequence UUID");
    expect(console.warn).toHaveBeenCalled();
  });
});

describe("getUserAccountSettings", () => {
  it("throws exceptions when user is not loaded", () => {
    const boom = () => Selector
      .getUserAccountSettings(buildResourceIndex([]).index);
    expect(boom)
      .toThrow("PROBLEM: Tried to fetch user before it was available.");
  });
});

describe("maybeGetSequence", () => {
  it("returns undefined", () => {
    const i = buildResourceIndex([]);
    const result = Selector.maybeGetSequence(i.index, undefined);
    expect(result).toBe(undefined);
  });

  it("returns a sequence", () => {
    const s = fakeSequence();
    const i = buildResourceIndex([s]);
    const result = Selector.maybeGetSequence(i.index, s.uuid);
    expect(result).toBeTruthy();
    expect(result?.uuid).toBe(s.uuid);
  });
});

describe("hasId()", () => {
  it("has", () => {
    const result = hasId(fakeIndex, "Sequence", 23);
    expect(result).toBeTruthy();
  });
});

describe("findFarmEventById()", () => {
  it("throws error", () => {
    const find = () => Selector.findFarmEventById(fakeIndex, 0);
    expect(find).toThrow("Bad farm_event id: 0");
  });
});

describe("maybeFindToolById()", () => {
  it("not found", () => {
    const result = Selector.maybeFindToolById(fakeIndex, 0);
    expect(result).toBeUndefined();
  });
});

describe("findToolById()", () => {
  it("throws error", () => {
    const find = () => Selector.findToolById(fakeIndex, 0);
    expect(find).toThrow("Bad tool id: 0");
  });
});

describe("findSequenceById()", () => {
  it("throws error", () => {
    const find = () => Selector.findSequenceById(fakeIndex, 0);
    expect(find).toThrow("Bad sequence id: 0");
  });
});

describe("findRegimenById()", () => {
  it("throws error", () => {
    const find = () => Selector.findRegimenById(fakeIndex, 0);
    expect(find).toThrow("Bad regimen id: 0");
  });
});

describe("findFolderById()", () => {
  it("throws error", () => {
    const find = () => Selector.findFolderById(fakeIndex, 0);
    expect(find).toThrow("Bad folder id: 0");
  });
});

describe("maybeFindPlantById()", () => {
  it("not found", () => {
    const result = Selector.maybeFindPlantById(fakeIndex, 0);
    expect(result).toBeUndefined();
  });
});

describe("getDeviceAccountSettings", () => {
  const DEV1 = fakeDevice();
  DEV1.uuid = "Device.416.0";

  const DEV2 = fakeDevice();
  DEV2.uuid = "Device.417.0";

  it("crashes if < 1", () => {
    const { index } = buildResourceIndex([]);
    const kaboom = () => Selector.getDeviceAccountSettings(index);
    expect(kaboom).toThrow(/before it was loaded/);
  });

  it("crashes if > 1", () => {
    const { index } = buildResourceIndex([DEV1, DEV2]);
    const kaboom = () => Selector.getDeviceAccountSettings(index);
    expect(kaboom).toThrow(/more than 1/);
  });

  it("returns exactly one device", () => {
    const { index } = buildResourceIndex([DEV1]);
    const result = Selector.getDeviceAccountSettings(index);
    expect(result.kind).toBe("Device");
  });
});

describe("getUserAccountSettings()", () => {
  it("fetches user", () => {
    const user = fakeUser();
    const { index } = buildResourceIndex([user]);
    const result = Selector.getUserAccountSettings(index);
    expect(result?.uuid).toEqual(user.uuid);
  });

  it("errors while fetching user: no user", () => {
    const { index } = buildResourceIndex([]);
    expect(() => Selector.getUserAccountSettings(index)).toThrow(
      /before it was available/);
  });

  it("errors while fetching user: more than one user", () => {
    const { index } = buildResourceIndex([fakeUser(), fakeUser()]);
    expect(() => Selector.getUserAccountSettings(index)).toThrow(
      /Expected 1 user. Got: 2/);
  });
});
