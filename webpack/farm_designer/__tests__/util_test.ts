let mockPromise: Promise<{} | void> = Promise.resolve();
jest.mock("axios", () => ({
  default: { get: () => mockPromise }
}));

import { executableType, OFSearch } from "../util";
import { Actions } from "../../constants";

describe("executableType", () => {
  it("handles expected values", () => {
    expect(executableType("Sequence")).toEqual("Sequence");
    expect(executableType("Regimen")).toEqual("Regimen");
  });

  it("throws when given bad data", () => {
    expect(() => executableType("Nope")).toThrowError();
  });
});

describe("OFSearch()", () => {
  it("searches: no image", async () => {
    mockPromise = Promise.resolve({ data: { data: [{ attributes: {} }] } });
    const dispatch = jest.fn();
    await OFSearch("mint")(dispatch);
    await expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OF_SEARCH_RESULTS_OK, payload: [
        { crop: {}, image: "/app-resources/img/generic-plant.svg" }]
    });
    await expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.OF_SEARCH_RESULTS_NO
    }));
  });

  it("searches: image", async () => {
    mockPromise = Promise.resolve({
      data: {
        included: [{ id: 0, attributes: { thumbnail_url: "thumbnail_url" } }],
        data: [{
          attributes: {},
          relationships: { pictures: { data: [{ id: 0 }] } }
        }]
      }
    });
    const dispatch = jest.fn();
    await OFSearch("mint")(dispatch);
    await expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OF_SEARCH_RESULTS_OK, payload: [
        { crop: {}, image: "thumbnail_url" }]
    });
    await expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.OF_SEARCH_RESULTS_NO
    }));
  });

  it("fails search", async () => {
    mockPromise = Promise.reject();
    const dispatch = jest.fn();
    await OFSearch("mint")(dispatch);
    await expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.OF_SEARCH_RESULTS_OK
    }));
    await expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OF_SEARCH_RESULTS_NO, payload: undefined
    });
  });
});
