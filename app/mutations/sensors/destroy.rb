module Sensors
  class Destroy < Mutations::Command
    required { model :sensor, class: Sensor }
    IN_USE = "Can't delete sensor because the following sequences are still " \
             "using it: %s"
    EDGE_NODE_NAME = "sensor_id"

    def validate
      Sequence.if_still_using(sensor) do |sequences|
        names = sequences.pluck(:name)
        add_error :sensor, :in_use, (IN_USE % names) if names.present?
      end
    end

    def execute
      sensor.destroy!
    end
  end
end
