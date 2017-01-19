module FarmEvents
  class Update < Mutations::Command
    using LegacyRefinementsModule

    required do
      model :farm_event, class: FarmEvent
      model :device, class: Device
    end

    optional do
      # string :sequence_id
      integer :repeat
      string :time_unit, in: FarmEvent::UNITS_OF_TIME
      time :start_time
      time :end_time
    end

    def execute
      Rollbar.info("-- ENDPOINT REQUIRES UPDATES --")
      update_attributes(farm_event, inputs.except(:farm_event))
    end
  end
end
