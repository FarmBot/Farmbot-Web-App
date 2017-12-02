import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  findSlotByToolId,
  getFeeds,
  selectAllLogs,
  findResourceById,
  isKind,
  groupPointsByType,
  findPointerByTypeAndId,
  findToolSlot,
  findPlant,
  selectCurrentToolSlot,
  getSequenceByUUID,
  toArray,
  findAllById,
  toolsInUse,
  hasId,
  findFarmEventById,
  maybeFindToolById,
  findToolById,
  findSequenceById,
  findRegimenById,
  maybeFindPlantById
} from "../selectors";
import { resourceReducer, emptyState } from "../reducer";
import { TaggedTool, TaggedToolSlotPointer, SpecialStatus } from "../tagged_resources";
import { createOK } from "../actions";
import { generateUuid } from "../util";
import {
  fakeWebcamFeed, fakeSequence
} from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import * as _ from "lodash";

const TOOL_ID = 99;
const SLOT_ID = 100;
const fakeTool: TaggedTool = {
  kind: "Tool",
  specialStatus: SpecialStatus.SAVED,
  uuid: generateUuid(TOOL_ID, "Tool"),
  body: {
    name: "yadda yadda",
    id: TOOL_ID
  }
};
const fakeSlot: TaggedToolSlotPointer = {
  kind: "Point",
  specialStatus: SpecialStatus.SAVED,
  uuid: generateUuid(SLOT_ID, "Point"),
  body: {
    tool_id: TOOL_ID,
    pointer_type: "ToolSlot",
    radius: 0,
    x: 0,
    y: 0,
    z: 0,
    name: "wow",
    pointer_id: SLOT_ID,
    meta: {}
  }
};
const fakeIndex = buildResourceIndex().index;

describe("findSlotByToolId", () => {
  it("returns undefined when not found", () => {
    const state = resourceReducer(buildResourceIndex(), createOK(fakeTool));
    expect(state.index.byKindAndId["Tool." + fakeTool.body.id]);
    const result = findSlotByToolId(state.index, TOOL_ID);
    expect(result).toBeFalsy();
  });

  it("returns something when there is a match", () => {
    const initialState = buildResourceIndex();
    const state = [createOK(fakeTool), createOK(fakeSlot)]
      .reduce(resourceReducer, initialState);
    const result = findSlotByToolId(state.index, TOOL_ID);
    expect(result).toBeTruthy();
    if (result) { expect(result.kind).toBe("Point"); }
  });
});

describe("getFeeds", () => {
  it("returns empty array", () => {
    expect(getFeeds(emptyState().index).length).toBe(0);
  });

  it("finds the only WebcamFeed", () => {
    const feed = fakeWebcamFeed();
    const state = [{
      type: Actions.RESOURCE_READY,
      payload: {
        name: "WebcamFeed",
        data: feed
      }
    }].reduce(resourceReducer, emptyState());
    expect(getFeeds(state.index)[0].body).toEqual(feed);
  });
});

describe("selectAllLogs", () => {
  it("stays truthful to its name by finding all logs", () => {
    const results = selectAllLogs(fakeIndex);
    expect(results.length).toBeGreaterThan(0);
    const kinds = _(results).map("kind").uniq().value();
    expect(kinds.length).toEqual(1);
    expect(kinds[0]).toEqual("Log");
  });
});

describe("findResourceById()", () => {
  it("returns UUID", () => {
    const uuid = findResourceById(fakeIndex, "Sequence", 23);
    expect(uuid).toContain("Sequence.23");
  });

  it("throws error", () => {
    const findUuid = () =>
      findResourceById(fakeIndex, "Sequence", NaN);
    expect(findUuid).toThrow("UUID not found for id NaN");
  });
});

describe("isKind()", () => {
  it("is", () => {
    const ret = isKind("Sequence")(fakeSequence());
    expect(ret).toBeTruthy();
  });

  it("isn't", () => {
    const ret = isKind("Tool")(fakeSequence());
    expect(ret).toBeFalsy();
  });
});

describe("groupPointsByType()", () => {
  it("returns points", () => {
    const points = groupPointsByType(fakeIndex);
    const expectedKeys = ["Plant", "GenericPointer", "ToolSlot"];
    expect(expectedKeys.every(key => key in points)).toBeTruthy();
  });
});

describe("findPointerByTypeAndId()", () => {
  it("throws error", () => {
    const find = () => findPointerByTypeAndId(fakeIndex, "Other", 0);
    expect(find).toThrow("Tried to fetch bad point Other 0");
  });
});

describe("findToolSlot()", () => {
  it("throws error", () => {
    const find = () => findToolSlot(fakeIndex, "bad");
    expect(find).toThrow("ToolSlotPointer not found: bad");
  });
});

describe("findPlant()", () => {
  it("throws error", () => {
    console.warn = jest.fn();
    const find = () => findPlant(fakeIndex, "bad");
    expect(find).toThrowError();
    expect(console.warn).toBeCalled();
  });
});

describe("selectCurrentToolSlot()", () => {
  it("throws error", () => {
    const find = () => selectCurrentToolSlot(fakeIndex, "bad");
    expect(find).toThrowError();
  });
});

describe("getSequenceByUUID()", () => {
  it("throws error", () => {
    console.warn = jest.fn();
    const find = () => getSequenceByUUID(fakeIndex, "bad");
    expect(find).toThrow("BAD Sequence UUID");
    expect(console.warn).toBeCalled();
  });
});

describe("toArray()", () => {
  it("returns array", () => {
    const array = toArray(fakeIndex);
    expect(array.length).toEqual(fakeIndex.all.length);
  });
});

describe("findAllById()", () => {
  it("returns", () => {
    const result = findAllById(fakeIndex, [23], "Sequence");
    expect(result.length).toEqual(1);
  });
});

describe("toolsInUse()", () => {
  it("returns tools", () => {
    const activeTools = toolsInUse(fakeIndex);
    expect(activeTools.length).toBeGreaterThan(0);
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
    const find = () => findFarmEventById(fakeIndex, 0);
    expect(find).toThrow("Bad farm_event id: 0");
  });
});

describe("maybeFindToolById()", () => {
  it("not found", () => {
    const result = maybeFindToolById(fakeIndex, 0);
    expect(result).toBeUndefined();
  });
});

describe("findToolById()", () => {
  it("throws error", () => {
    const find = () => findToolById(fakeIndex, 0);
    expect(find).toThrow("Bad tool id: 0");
  });
});

describe("findSequenceById()", () => {
  it("throws error", () => {
    const find = () => findSequenceById(fakeIndex, 0);
    expect(find).toThrow("Bad sequence id: 0");
  });
});

describe("findRegimenById()", () => {
  it("throws error", () => {
    const find = () => findRegimenById(fakeIndex, 0);
    expect(find).toThrow("Bad regimen id: 0");
  });
});

describe("maybeFindPlantById()", () => {
  it("not found", () => {
    const result = maybeFindPlantById(fakeIndex, 0);
    expect(result).toBeUndefined();
  });
});
