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
    Wow = Struct.new(:fe, :reg, :do_destroy)

    def temporary_hack
      # Delete all farmevents
      # where executable is a regimen
      # and farmevent.executable.regimen_items.max is > the current time.
      device
        .farm_events
        .where(executable_type: "Regimen")
        .map do |x|
          exctbls    = x.executable.regimen_items || RegimenItem.none
          max_offset = (exctbls.pluck(:time_offset).max || 0)
          Wow.new(x, x.executable, ((x.end_time + max_offset) < DateTime.now))
        end
        .select { |x| x.do_destroy }
        .map    { |x| x.fe.destroy! }
    end
  end
end
