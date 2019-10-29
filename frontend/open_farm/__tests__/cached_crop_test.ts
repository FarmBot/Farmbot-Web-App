const mockResponse: { promise: Promise<{}> } = {
  promise: Promise.resolve({
    data: {
      id: 0,
      data: {
        attributes: {
          svg_icon: "<svg>Wow</svg>",
          slug: "lettuce"
        }
      }
    }
  })
};

jest.mock("axios", () => ({
  get: jest.fn(() => mockResponse.promise)
}));

jest.unmock("../cached_crop");
import { cachedCrop } from "../cached_crop";
import axios from "axios";
import { times } from "lodash";

describe("cachedIcon()", () => {
  it("does an HTTP request if the icon can't be found locally", async () => {
    times(10, () => cachedCrop("lettuce"));
    const item1 = await cachedCrop("lettuce");
    expect(item1.svg_icon).toContain("<svg>Wow</svg>");
    const item2 = await cachedCrop("lettuce");
    expect(item2.slug).toBe(item1.slug);
    expect(item2.svg_icon).toBe(item1.svg_icon);
    expect(item2.spread).toBe(undefined);
    expect(axios.get).toHaveBeenCalledTimes(1);
  });

  it("handles unexpected responses from OpenFarm", async () => {
    const old = mockResponse.promise;
    mockResponse.promise = Promise.resolve({ data: {} });
    const radish = await cachedCrop("radish");
    expect(radish.spread).toBeUndefined();
    expect(radish.svg_icon).toBeUndefined();
    mockResponse.promise = old;
  });
});
