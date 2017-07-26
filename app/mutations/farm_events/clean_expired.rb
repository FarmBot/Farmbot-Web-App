module FarmEvents
  class CleanExpired < Mutations::Command
    include FarmEvents::ExecutableHelpers

    required do
      model   :device, class: Device
    end

    def execute
      device
        .farm_events
        .where.not(executable_type: "Regimen")
        .where('end_time < ?', DateTime.now)
        .map(&:destroy!)
      temporary_hack
    end

  private

    # Temporary hack to join farm event,
    # regimen and the decision to destroy it.
    Info = Struct.new(:fe, :reg, :do_destroy)

    def temporary_hack
      # Delete all farmevents
      # where executable is a regimen
      # and farmevent.executable.regimen_items.max is > the current time.
      device
        .farm_events
        .where(executable_type: "Regimen")
        .map do |x|
          reg_items      = x.executable.regimen_items || RegimenItem.none
          max_offset     = (reg_items.pluck(:time_offset).max || 0)
          should_destroy = ((x.end_time + max_offset) < DateTime.now)
          Info.new(x, x.executable, should_destroy)
        end
        .select { |x| x.do_destroy }
        .map    { |x| x.fe.destroy! }
    end
  end
end
