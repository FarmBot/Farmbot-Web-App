import { selectImage } from "../actions";
import { Actions } from "../../../constants";

describe("selectImage", () => {
  it("selects one image", () => {
    const payload = "my uuid";
    const result = selectImage(payload);
    expect(result.type).toEqual(Actions.SELECT_IMAGE);
    expect(result.payload).toEqual(payload);
  });

  it("selects no image", () => {
    const payload = undefined;
    const result = selectImage(payload);
    expect(result.type).toEqual(Actions.SELECT_IMAGE);
    expect(result.payload).toEqual(payload);
  });
});
