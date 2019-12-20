class SensorReadingSerializer < ApplicationSerializer
  attributes :mode, :pin, :value, :x, :y, :z, :read_at
  # This is for legacy support reasons.
  # Very old sensor_readings will have a
  # read_at value of `nil`, so we pre-populate it
  # to `created_at` for the convinience of API users.
  def read_at
    object.read_at || object.created_at
  end
end
