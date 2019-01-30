import { fakeRegimen } from "../../__test_support__/fake_state/resources";
const mockData = {
  lastUrlChunk: "Set me",
  fakeRegimens: [fakeRegimen()]
};

jest.mock("../../util/urls", () => {
  return {
    urlFriendly: jest.fn(x => x),
    lastUrlChunk: jest.fn(() => mockData.lastUrlChunk)
  };
});

jest.mock("../actions", () => ({ selectRegimen: jest.fn() }));

jest.mock("../../resources/selectors", () => {
  return {
    selectAllRegimens: jest.fn(() => {
      return mockData.fakeRegimens || [];
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

import { setActiveRegimenByName } from "../set_active_regimen_by_name";
import { selectRegimen } from "../actions";
import { selectAllRegimens } from "../../resources/selectors";

describe("setActiveRegimenByName", () => {

  it("returns early if there is nothing to compare", () => {
    mockData.lastUrlChunk = "regimens";
    setActiveRegimenByName();
    expect(selectRegimen).not.toHaveBeenCalled();
  });

  it("sometimes can't find a regimen by name", () => {
    const body = mockData.fakeRegimens[0].body;
    const name = "a different value than " + body.name;
    mockData.lastUrlChunk = name;
    setActiveRegimenByName();
    expect(selectAllRegimens).toHaveBeenCalled();
    expect(selectRegimen).not.toHaveBeenCalled();
  });

  it("finds a regimen by name", () => {
    const tr = mockData.fakeRegimens[0];
    const body = tr.body;
    jest.clearAllTimers();
    mockData.lastUrlChunk = body.name;
    setActiveRegimenByName();
    expect(selectRegimen).toHaveBeenCalledWith(tr.uuid);
  });
});
