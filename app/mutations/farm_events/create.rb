module FarmEvents
  class Create < Mutations::Command
    include FarmEvents::ExecutableHelpers
    executable_fields :optional
    BACKWARDS_END_TIME = "This event starts before it ends. Did you flip the "\
                         "start and end times?"

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
      FarmEvent.create!(inputs.merge(executable: executable))
    end

    def validate_start_and_end
      if (start_time > end_time) && (time_unit != FarmEvent::NEVER)
        add_error :end_time, :backwards, BACKWARDS_END_TIME
      end
    end
  end
end
