import { MountedToolInfo } from "../farm_designer/interfaces";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { ToolTransformProps } from "../tools/interfaces";

export const fakeMountedToolInfo = (): MountedToolInfo => ({
  id: 1,
  name: "fake mounted tool",
  type: "none",
  pulloutDirection: ToolPulloutDirection.POSITIVE_X,
  noUTM: false,
  flipped: false,
});

export const fakeToolTransformProps = (): ToolTransformProps => ({
  xySwap: false,
  quadrant: 2,
});
