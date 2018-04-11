class PlantSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :updated_at, :device_id, :name, :pointer_type,
             :meta, :radius, :x, :y, :z, :openfarm_slug, :planted_at

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
