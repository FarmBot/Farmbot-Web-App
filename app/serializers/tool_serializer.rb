class ToolSerializer < ActiveModel::Serializer
  attributes :id, :name, :status, :pullout_direction

  def status
    active = ToolSlot.where(tool_id: object.id).any?
    active ? "active" : "inactive"
  end
end
