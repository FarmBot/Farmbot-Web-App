class BasePointSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :updated_at, :device_id, :name, :pointer_type,
             :meta, :x, :y, :z

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
