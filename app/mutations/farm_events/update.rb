module FarmEvents
  class Update < Mutations::Command
    NOT_YOURS = 'Not your farm_event.'
    using LegacyRefinementsModule
    include FarmEvents::ExecutableHelpers
    executable_fields :optional

    required do
      model :farm_event, class: FarmEvent
      model :device,     class: Device
    end

    optional do
      integer :repeat,    min: 1
      string  :time_unit, in: FarmEvent::UNITS_OF_TIME
      time    :start_time
      time    :end_time
    end

    def validate
      validate_executable if (executable_id || executable_type)
      validate_ownership
    end

    def execute
      p = inputs.except(:farm_event)
      p[:end_time] = (p[:start_time] + 1.minute) if is_one_time_event
      update_attributes(farm_event, )
    end

    def validate_ownership
      raise Errors::Forbidden, NOT_YOURS if farm_event.device != device
    end

    def is_one_time_event
      (time_unit || farm_event.time_unit) == FarmEvent::NEVER
    end
  end
end
