import { fakeSequence } from "../../__test_support__/fake_state/resources";
const mockData = {
  lastUrlChunk: "Set me",
  fakeSequences: [fakeSequence()]
};

jest.mock("../../util/urls", () => {
  return {
    urlFriendly: jest.fn(x => x),
    lastUrlChunk: jest.fn(() => mockData.lastUrlChunk)
  };
});

jest.mock("../actions", () => ({ selectSequence: jest.fn() }));

jest.mock("../../resources/selectors", () => {
  return {
    selectAllSequences: jest.fn(() => {
      return mockData.fakeSequences || [];
    })
  };
});

jest.mock("../../redux/store", () => {
  return {
    store: {
      dispatch: jest.fn(),
      getState: jest.fn(() => ({ resources: { index: {} } }))
    }
  };
});

import { setActiveSequenceByName } from "../set_active_sequence_by_name";
import { selectSequence } from "../actions";
import { selectAllSequences } from "../../resources/selectors";

describe("setActiveSequenceByName", () => {
  jest.useFakeTimers();

  it("returns early if there is nothing to compare", () => {
    mockData.lastUrlChunk = "sequences";
    setActiveSequenceByName();
    jest.runAllTimers();
    expect(selectSequence).not.toHaveBeenCalled();
  });

  it("sometimes can't find a sequence by name", () => {
    const body = mockData.fakeSequences[0].body;
    const name = "a different value than " + body.name;
    mockData.lastUrlChunk = name;
    setActiveSequenceByName();
    jest.runAllTimers();
    expect(selectAllSequences).toHaveBeenCalled();
    expect(selectSequence).not.toHaveBeenCalled();
  });

  it("finds a sequence by name", () => {
    const tr = mockData.fakeSequences[0];
    const body = tr.body;
    jest.clearAllTimers();
    mockData.lastUrlChunk = body.name;
    setActiveSequenceByName();
    jest.runAllTimers();
    expect(selectSequence).toHaveBeenCalledWith(tr.uuid);
  });
});
