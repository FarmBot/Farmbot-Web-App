module FarmEvents
  class CleanExpired < Mutations::Command
    include FarmEvents::ExecutableHelpers

    required do
      model   :device, class: Device
    end

    def execute
      device
        .farm_events
        .where('end_time < ?', DateTime.now)
        .map(&:destroy!)
    end
  end
end
