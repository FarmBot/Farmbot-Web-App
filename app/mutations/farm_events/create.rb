module FarmEvents
  class Create < Mutations::Command
    using LegacyRefinementsModule
    include FarmEvents::ExecutableHelpers
    executable_fields :required

    required do
      model   :device, class: Device
      integer :repeat
      string  :time_unit, in: FarmEvent::UNITS_OF_TIME
    end

    optional do
      time :start_time, default: Time.current
      time :end_time
    end

    def validate
      validate_executable
    end

    def execute
      create(FarmEvent, inputs) do |farm_event|
        farm_event.executable = executable
        farm_event.next_time = farm_event.calculate_next_occurence
      end
    end

    private
  end
end
