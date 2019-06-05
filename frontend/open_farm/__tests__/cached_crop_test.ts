jest.mock("axios", () => ({
  get: () => Promise.resolve({
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
}));

jest.unmock("../cached_crop");
import { cachedCrop } from "../cached_crop";

describe("cachedIcon()", () => {
  it("does an HTTP request if the icon can't be found locally", (done) => {
    cachedCrop("lettuce")
      .then((item) => {
        expect(item.svg_icon).toContain("<svg>Wow</svg>");
        done();
      })
      .catch((error) => {
        expect(error).toBeFalsy();
        done();
      });
  });
});
