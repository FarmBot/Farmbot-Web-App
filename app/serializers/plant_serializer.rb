class PlantSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :updated_at, :device_id, :meta, :name,
             :openfarm_slug, :plant_status, :planted_at, :pointer_type, :radius,
             :x, :y, :z,

  def x
    object.x.round
  end

  def y
    object.y.round
  end

  def z
    object.z.round
  end

  def meta
    object.meta || {}
  end
end
