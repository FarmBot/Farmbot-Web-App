class ToolSerializer < ActiveModel::Serializer
  attributes :id, :name, :status

  def status
    object[:tool_slot_id] ? "active" : "inactive"
  end
end
