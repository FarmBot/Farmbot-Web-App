class SensorReadingSerializer < ApplicationSerializer
  attributes :mode, :pin, :value, :x, :y, :z
end
