module FarmEvents
  class Create < Mutations::Command
    using LegacyRefinementsModule
    NO_EXECUTABLE = "You must provide a valid executable_id and "\
                    "executable_type for a Sequence or Regimen object."
    required do
      integer :executable_id
      string :executable_type, in: ["Sequence", "Regimen"]
      model :device, class: Device
      integer :repeat
      string :time_unit, in: FarmEvent::UNITS_OF_TIME
    end

    optional do
      time :start_time, default: Time.current
      time :end_time
    end

    def validate
        add_error :executable, :not_found, NO_EXECUTABLE unless executable
    end

    def execute
      create(FarmEvent, inputs) do |farm_event|
        farm_event.executable = executable
        farm_event.next_time = farm_event.calculate_next_occurence
      end
    end

    private

    def executable
      @executable ||= klass.where(id: executable_id).first
    end

    def klass
      ({"Sequence" => Sequence, "Regimen"  => Regimen })[executable_type]
    end
  end
end
