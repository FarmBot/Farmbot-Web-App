# Handles devices that spin out of control and send too many logs to the server.
class ThrottlePolicy
  attr_reader :rules

  TIME_UNITS = [:minute,
                :hour,
                :day]

  def initialize(namespace, rule_map)
    # rule_map.map do |(unit, _)|
    #   raise "BAD TIME UNIT" unless TIME_UNITS.include?(unit)
    # end
    @namespace = namespace
    @rule_map = rule_map
  end

  def track(unique_id)
  end

  def is_throttled(unique_id)
  end
end
