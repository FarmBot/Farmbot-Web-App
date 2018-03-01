class PointSerializer < ActiveModel::Serializer
  attributes  :id, :created_at, :updated_at, :device_id, :meta, :name,
              :pointer_type, :radius, :x, :y, :z
  attribute :openfarm_slug,     if: :plant?
  attribute :planted_at,        if: :plant?
  attribute :tool_id,           if: :tool_slot?
  attribute :pullout_direction, if: :tool_slot?

  def x
    object.x.round
  end

  def y
    object.y.round
  end

  def z
    object.z.round
  end

  def openfarm_slug
    object.pointer.openfarm_slug
  end

  def planted_at
    object.pointer.planted_at
  end

  def pullout_direction
    object.pointer.pullout_direction
  end

  def tool_id
    object.pointer.tool_id
  end

  def meta
    object.meta || {}
  end

  def plant?
    object.pointer.is_a? Plant
  end

  def tool_slot?
    object.pointer.is_a? ToolSlot
  end
end
