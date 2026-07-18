import {
  farmEventSchedulePath, readFarmEventScheduleTarget,
} from "../navigation";
import { Path } from "../../internal_urls";

describe("farm event navigation", () => {
  it("builds and reads a scheduled executable target", () => {
    const path = farmEventSchedulePath("Sequence", 42);
    expect(path).toEqual(Path.farmEvents("add")
      + "?executable_type=Sequence&executable_id=42");
    expect(readFarmEventScheduleTarget(path.split("?")[1])).toEqual({
      executableType: "Sequence",
      executableId: 42,
    });
    expect(readFarmEventScheduleTarget(
      "?executable_type=Regimen&executable_id=7")).toEqual({
      executableType: "Regimen",
      executableId: 7,
    });
  });

  it("rejects invalid targets", () => {
    expect(readFarmEventScheduleTarget("?executable_type=Other&executable_id=1"))
      .toBeUndefined();
    expect(readFarmEventScheduleTarget(
      "?executable_type=Sequence&executable_id=0")).toBeUndefined();
  });
});
