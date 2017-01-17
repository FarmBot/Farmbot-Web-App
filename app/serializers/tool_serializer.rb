class ToolSerializer < ActiveModel::Serializer
  attributes :id, :name, :status

  def status
    if object.association(:tool_slot).loaded?
      "unknown" # Prevent N+1 insanity.
    else
      object.tool_slot ? "active" : "inactive"
    end
  end
end
