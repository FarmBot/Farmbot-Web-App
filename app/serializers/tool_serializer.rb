class ToolSerializer < ActiveModel::Serializer
  attributes :id, :name, :status

  def status
    # Going to try this temporarily.
    # If performance becomes an issue, I can pull it out or refactor.
    active = ToolSlot.where(tool_id: object.id).any?
    active ? "active" : "inactive"
    # if object.association(:tool_slot).loaded?
    #   "unknown" # Prevent N+1 insanity.
    # else
    #   object.tool_slot ? "active" : "inactive"
    # end
  end
end
