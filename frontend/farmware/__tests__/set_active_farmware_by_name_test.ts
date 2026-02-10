import { farmwareUrlFriendly } from "../set_active_farmware_by_name";

describe("farmwareUrlFriendly", () => {
  it("replaces hyphens with underscores", () => {
    expect(farmwareUrlFriendly("plant-detection")).toEqual("plant_detection");
  });

  it("keeps underscores", () => {
    expect(farmwareUrlFriendly("my_farmware")).toEqual("my_farmware");
  });
});
