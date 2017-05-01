module FarmEvents
  class Create < Mutations::Command
    using LegacyRefinementsModule
    include FarmEvents::ExecutableHelpers
    executable_fields :optional
    BACKWARDS_END_TIME = "This event starts before it ends. Did you flip the start and end times?"

    required do
      model   :device, class: Device
      integer :repeat, min: 1
      string  :time_unit, in: FarmEvent::UNITS_OF_TIME
    end

    optional do
      time :start_time, default: Time.current
      time :end_time
    end

    def validate
      validate_start_and_end if end_time
      validate_executable
    end

    def execute
      create(FarmEvent, inputs) do |farm_event|
        farm_event.executable = executable
      end
    end

    def validate_start_and_end
      add_error :end_time, :backwards, BACKWARDS_END_TIME if start_time > end_time
    end
  end
end
