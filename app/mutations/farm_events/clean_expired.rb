module FarmEvents
  class CleanExpired < Mutations::Command
    include FarmEvents::ExecutableHelpers

    required do
      model   :device, class: Device
    end

    def execute
      if device.timezone
        clean_regular_events
        clean_regimen_events
      end
    end

  private

    def clean_regular_events
      device
        .farm_events
        .where
        .not(executable_type: "Regimen")
        .where('end_time < ?', DateTime.now)
        .map(&:destroy!)
    end

    def timezone
      @timezone ||= device.timezone or raise "Set Timezone Please"
    end

    def now
      @now ||= DateTime.now.in_time_zone(timezone)
    end

    Info = Struct.new(:fe, :reg, :should_destroy?)

    def clean_regimen_events
      device
        .farm_events
        .where(executable_type: "Regimen")
        .map do |x|
          reg_items      = x.executable.regimen_items || RegimenItem.none
          max_offset     = (reg_items.pluck(:time_offset).max || 0)
          should_destroy = ((x.end_time.in_time_zone(timezone).midnight + (max_offset / 1000)) < now)
          Info.new(x, x.executable, should_destroy)
        end
        .select { |x| x.should_destroy? }
        .map    { |x| x.fe.destroy! }
    end
  end
end
