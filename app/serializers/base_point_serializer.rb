class BasePointSerializer < ApplicationSerializer
  attributes :device_id, :name, :pointer_type, :meta, :x, :y, :z

  def meta
    object.meta || {}
  end
end
