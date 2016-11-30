class ToolSlotSerializer < ActiveModel::Serializer
  attributes :id, :tool_bay_id, :name, :x, :y, :z
end
