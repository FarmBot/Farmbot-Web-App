import { ToolSlotPointer } from "farmbot/dist/resources/api_resources";

export const emptyToolSlotBody = (): ToolSlotPointer => ({
  x: 0,
  y: 0,
  z: 0,
  radius: 25,
  pointer_type: "ToolSlot",
  meta: {},
  tool_id: undefined,
  name: "Tool Slot",
  pullout_direction: 0,
  gantry_mounted: false,
});
