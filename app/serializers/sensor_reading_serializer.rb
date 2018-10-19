class SensorReadingSerializer < ApplicationSerializer
  attributes :id, :created_at, :mode, :pin, :value, :x, :y, :z
end
