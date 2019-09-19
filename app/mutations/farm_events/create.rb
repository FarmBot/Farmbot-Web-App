module FarmEvents
  class Create < Mutations::Command
    include FarmEvents::ExecutableHelpers
    include FarmEvents::FragmentHelpers
    using Sequences::CanonicalCeleryHelpers

    has_executable_fields

    BACKWARDS_END_TIME = "This event starts before it ends. Did you flip the " \
                         "start and end times?"

    BAD_START_TIME = "FarmEvent start time needs to be in the future, not" +
                     " the past."
    required do
      model :device, class: Device
      integer :repeat, min: 1
      string :time_unit, in: FarmEvent::UNITS_OF_TIME
    end

    optional do
      time :start_time, default: Time.current, after: Time.now - 20.years
      time :end_time, before: Time.now + 20.years
      body
    end

    def validate
      validate_end_time
      validate_executable
    end

    def execute
      FarmEvent.auto_sync_debounce do
        FarmEvent.transaction do
          p = inputs.merge(executable: executable)
          # Needs to be set this way for cleanup operations:
          p[:end_time] = (p[:start_time] + 1.minute) if is_one_time_event
          p.delete(:body)
          wrap_fragment_with(FarmEvent.create!(p))
        end
      end
    rescue CeleryScript::TypeCheckError => q
      add_error :farm_event, :farm_event, q.message
    end

    def validate_end_time
      no_go = end_time && (start_time > end_time) && !is_one_time_event
      add_error :end_time, :backwards, BACKWARDS_END_TIME if no_go
    end

    def is_one_time_event
      time_unit == FarmEvent::NEVER
    end
  end
end
