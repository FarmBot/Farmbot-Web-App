class ToolSlotSerializer < BasePointSerializer
  attributes :tool_id,
             :pullout_direction,
             :gantry_mounted,
             :mount_offset_x,
             :mount_offset_y,
             :mount_offset_z,
             :mount_stage
end
