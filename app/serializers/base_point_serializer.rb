class BasePointSerializer < ApplicationSerializer
  attributes :id, :created_at, :updated_at, :device_id, :name, :pointer_type,
             :meta, :x, :y, :z

  def meta
    object.meta || {}
  end
end
