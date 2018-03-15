class ToolSerializer < ActiveModel::Serializer
  attributes :id, :name, :status

  def status
    active = ToolSlot.where(tool_id: object.id).any?
    active ? "active" : "inactive"
  end
end
