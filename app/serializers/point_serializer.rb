class PointSerializer < ActiveModel::Serializer
  attributes :created_at, :updated_at, :device_id, :meta, :name, :pointer_type,
             :radius, :x, :y, :z
  attribute :openfarm_slug, if: :plant?
  attribute :tool_id,       if: :tool_slot?

  def plant?
    object.pointer.is_a? Plant
  end

  def tool_slot?
    object.pointer.is_a? ToolSlot
  end

  def openfarm_slug
    object.pointer.openfarm_slug
  end

  def tool_id
    object.pointer.tool_id
  end

  def meta
    object.meta || {}
  end
end
