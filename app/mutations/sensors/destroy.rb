module Sensors
  class Destroy < Mutations::Command
    required { model :sensor, class: Sensor }
    IN_USE = "Can't delete sensor because the following sequences are still " \
             "using it: %s"
    EDGE_NODE_NAME = "sensor_id"

    def validate
      puts "TODO: Implement `still_in_use?`"
    end

    def execute
      sensor.destroy!
    end

  private

    # def sequences_using_it
    #   @sequences_using_it ||= EdgeNode
    #     .where(kind: EDGE_NODE_NAME, value: sensor.id)
    #     .pluck(:sequence_id)
    # end

    # def not_in_use?
      # names = Sequence.where(id: sequences_using_it).pluck(:name).join(", ")
      # add_error :sensor, :in_use, (IN_USE % [names]) if names.present?
    # end
  end
end
