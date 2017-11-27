
jest.mock("axios", function () {
  return {
    default: {
      get: function () {
        return Promise.resolve({
          data: {
            id: 0,
            data: {
              attributes: {
                svg_icon: "<svg>Wow</svg>",
                slug: "lettuce"
              }
            }
          }
        });
      }
    }
  };
});

import { cachedCrop, OpenFarmAPI } from "../icons";
describe("cachedIcon()", () => {
  it("does an HTTP request if the icon can't be found locally", (done) => {
    cachedCrop("lettuce")
      .then(function (item) {
        expect(item.svg_icon).toContain("<svg>Wow</svg>");
        done();
      })
      .catch((error) => {
        expect(error).toBeFalsy();
        done();
      });
  });

  it("has a base URL", () => {
    expect(OpenFarmAPI.OFBaseURL).toContain("openfarm.cc");
  });
});
