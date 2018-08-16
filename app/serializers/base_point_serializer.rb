class BasePointSerializer < ActiveModel::Serializer
  attributes :id, :created_at, :updated_at, :device_id, :name, :pointer_type,
             :meta, :x, :y, :z, :odelay

  def odelay
    "odelay!"
  end

  def meta
    object.meta || {}
  end
end
