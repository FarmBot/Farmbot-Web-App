# Track the number of occurrences of an event over time.
#
# Given:
#   * A fixed size duration (1 minute, 1 week etc)
#   * An event (In our case, log creation)
#   * An initiator id (eg: device_id)
#
# Produces:
#   * A table of event counts for the current time period, indexed by
#     the initiator ID.
class ThrottlePolicy
  class TimePeriod
    attr_reader :time_unit, :current_period

    def initialize(namespace, duration, now = Time.now)
    end
  end
end
