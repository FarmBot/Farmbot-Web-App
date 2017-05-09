class PlantSerializer < ActiveModel::Serializer
  attributes :id, :x, :y, :radius, :name, :openfarm_slug,
             :created_at, :device_id

  Point::SHARED_FIELDS.each do |f|
    define_method(f) { object.point.send(f) }
  end
end
