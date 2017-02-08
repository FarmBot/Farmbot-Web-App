module FarmEvents
  class Update < Mutations::Command
    NOT_YOURS = 'Not your farm_event.'
    using LegacyRefinementsModule
    include FarmEvents::ExecutableHelpers
    executable_fields :optional

    required do
      model :farm_event, class: FarmEvent
      model :device, class: Device
    end

    optional do
      integer :repeat
      string  :time_unit, in: FarmEvent::UNITS_OF_TIME
      time    :start_time
      time    :end_time
    end

    def validate
      validate_executable if (executable_id || executable_type)
      validate_ownership
    end

    def execute
      update_attributes(farm_event, inputs.except(:farm_event))
    end

    def validate_ownership
      raise Errors::Forbidden, NOT_YOURS if farm_event.device != device
    end
  end
end
