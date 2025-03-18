jest.mock("../../set_active_regimen_by_name", () => ({
  setActiveRegimenByName: jest.fn()
}));

import { addRegimen } from "../add_regimen";
import { Actions } from "../../../constants";
import { setActiveRegimenByName } from "../../set_active_regimen_by_name";
import { Path } from "../../../internal_urls";

describe("addRegimen()", () => {
  it("dispatches a new regimen onclick", () => {
    const dispatch = jest.fn();
    const navigate = jest.fn();
    addRegimen(0, navigate)(dispatch);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.INIT_RESOURCE,
      payload: expect.objectContaining({
        kind: "Regimen"
      })
    });
    expect(navigate).toHaveBeenCalledWith(Path.regimens("New_Regimen_0"));
    expect(setActiveRegimenByName).toHaveBeenCalled();
  });
});
