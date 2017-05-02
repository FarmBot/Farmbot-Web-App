class ToolSlotSerializer < ActiveModel::Serializer
  attributes :id, :tool_id, :name, :x, :y, :z
end
