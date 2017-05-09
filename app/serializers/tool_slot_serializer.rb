class ToolSlotSerializer < ActiveModel::Serializer
  attributes :id, :tool_id, :name, :x, :y, :z

  Point::SHARED_FIELDS.each do |f|
    define_method(f) { object.point.send(f) }
  end

end
