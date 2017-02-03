module FarmEvents
  class Create < Mutations::Command
    using LegacyRefinementsModule

    required do
      duck :executable, to: []
      model :executable, class: [Sequence, Regimen]
      model :device, class: Device
      integer :repeat
      string :time_unit, in: FarmEvent::UNITS_OF_TIME
    end

    optional do
      time :start_time, default: Time.current
      time :end_time
    end

    def execute
      Rollbar.info("-- ENDPOINT REQUIRES UPDATES --")
      create(FarmEvent, inputs) do |sched|
        sched.next_time = sched.calculate_next_occurence
      end
    end
  end
end
