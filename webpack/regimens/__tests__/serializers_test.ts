import { regimenSerializer } from "../serializers";
import { fakeRegimen } from "../../__test_support__/fake_state/resources";

describe("regimenSerializer()", () => {
  it("returns formatted regimen", () => {
    const regimen = fakeRegimen().body;
    regimen.name = "Fake Regimen";
    regimen.color = "blue";
    regimen.regimen_items = [];
    const ret = regimenSerializer(regimen);
    expect(ret).toEqual({
      color: "blue",
      name: "Fake Regimen",
      regimen_items: []
    });
  });
});
