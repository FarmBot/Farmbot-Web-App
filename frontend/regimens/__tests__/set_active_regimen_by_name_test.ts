jest.mock("../actions", () => ({ selectRegimen: jest.fn() }));

import {
  fakeRegimen,
} from "../../__test_support__/fake_state/resources";
const regimen = fakeRegimen();
regimen.body.name = "regimen";
const mockRegimens = [regimen];
jest.mock("../../resources/selectors", () => ({
  selectAllRegimens: jest.fn(() => mockRegimens),
  selectAllPlantPointers: jest.fn(() => []),
  findUuid: jest.fn(),
}));

jest.mock("../../redux/store", () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({ resources: { index: {} } }))
  }
}));

import { setActiveRegimenByName } from "../set_active_regimen_by_name";
import { selectRegimen } from "../actions";
import { selectAllRegimens } from "../../resources/selectors";
import { Path } from "../../internal_urls";

describe("setActiveRegimenByName()", () => {
  it("returns early if there is nothing to compare", () => {
    location.pathname = Path.mock(Path.regimens());
    setActiveRegimenByName();
    expect(selectRegimen).not.toHaveBeenCalled();
  });

  it("sometimes can't find a regimen by name", () => {
    const regimen = mockRegimens[0];
    location.pathname = Path.mock(Path.regimens("not_" + regimen.body.name));
    setActiveRegimenByName();
    expect(selectAllRegimens).toHaveBeenCalled();
    expect(selectRegimen).not.toHaveBeenCalled();
  });

  it("finds a regimen by name", () => {
    const regimen = mockRegimens[0];
    jest.clearAllTimers();
    location.pathname = Path.mock(Path.regimens(regimen.body.name));
    setActiveRegimenByName();
    expect(selectRegimen).toHaveBeenCalledWith(regimen.uuid);
  });
});
