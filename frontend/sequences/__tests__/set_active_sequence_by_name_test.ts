import { fakeSequence } from "../../__test_support__/fake_state/resources";
const mockData = {
  lastUrlChunk: "Set me",
  fakeSequences: [fakeSequence()]
};

jest.mock("../../util/urls", () => ({
  urlFriendly: jest.fn(x => x),
  lastUrlChunk: jest.fn(() => mockData.lastUrlChunk)
}));

jest.mock("../actions", () => ({ selectSequence: jest.fn() }));

jest.mock("../../resources/selectors", () => ({
  selectAllSequences: jest.fn(() => mockData.fakeSequences || []),
}));

jest.mock("../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({ resources: { index: {} } }))
  }
}));

jest.mock("../../account/dev/dev_support", () => ({}));

import { setActiveSequenceByName } from "../set_active_sequence_by_name";
import { selectSequence } from "../actions";
import { selectAllSequences } from "../../resources/selectors";

describe("setActiveSequenceByName", () => {

  it("returns early if there is nothing to compare", () => {
    mockData.lastUrlChunk = "sequences";
    setActiveSequenceByName();
    expect(selectSequence).not.toHaveBeenCalled();
  });

  it("sometimes can't find a sequence by name", () => {
    const body = mockData.fakeSequences[0].body;
    const sequenceName = "a different value than " + body.name;
    mockData.lastUrlChunk = sequenceName;
    setActiveSequenceByName();
    expect(selectAllSequences).toHaveBeenCalled();
    expect(selectSequence).not.toHaveBeenCalled();
  });

  it("finds a sequence by name", () => {
    const tr = mockData.fakeSequences[0];
    const body = tr.body;
    jest.clearAllTimers();
    mockData.lastUrlChunk = body.name;
    setActiveSequenceByName();
    expect(selectSequence).toHaveBeenCalledWith(tr.uuid);
  });
});
