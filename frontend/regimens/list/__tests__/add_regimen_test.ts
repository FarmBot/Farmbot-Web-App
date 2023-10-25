import { Path } from "../../../internal_urls";
const mockPath = Path.mock(Path.regimens());
jest.mock("../../../history", () => ({
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));

jest.mock("../../set_active_regimen_by_name", () => ({
  setActiveRegimenByName: jest.fn()
}));

import { addRegimen } from "../add_regimen";
import { Actions } from "../../../constants";
import { push } from "../../../history";
import { setActiveRegimenByName } from "../../set_active_regimen_by_name";

describe("addRegimen()", () => {
  it("dispatches a new regimen onclick", () => {
    const dispatch = jest.fn();
    addRegimen(0)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.INIT_RESOURCE,
      payload: expect.objectContaining({
        kind: "Regimen"
      })
    });
    expect(push).toHaveBeenCalledWith(Path.regimens("New_Regimen_0"));
    expect(setActiveRegimenByName).toHaveBeenCalled();
  });
});
