class ToolSerializer < ApplicationSerializer
  attributes :name,
             :status,
             :flow_rate_ml_per_s,
             :seeder_tip_z_offset,
             :type,
             :utm_mountable,
             :effector_offset_x,
             :effector_offset_y,
             :effector_offset_z

  def status
    # The attribute `tool_slot_id` is added via a special SQL query.
    # SEE: ToolsController::INDEX_QUERY
    object[:tool_slot_id] ? "active" : "inactive"
  end
end
