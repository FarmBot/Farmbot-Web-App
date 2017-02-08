class PointSerializer < ActiveModel::Serializer
  attributes :id, :x, :y, :z, :radius, :created_at, :meta
end
