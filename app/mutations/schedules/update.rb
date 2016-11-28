module Schedules
  class Update < Mutations::Command
    using LegacyRefinementsModule

    required do
      model :schedule, class: Schedule
      model :device, class: Device
    end

    optional do
      string :sequence_id
      integer :repeat
      string :time_unit, in: Schedule::UNITS_OF_TIME
      time :start_time
      time :end_time
    end

    def execute
      update_attributes(schedule, inputs.except(:schedule))
    end
  end
end
