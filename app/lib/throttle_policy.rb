# Handles devices that spin out of control and send too many logs to the server.
# Class Hierarchy:
# ThrottlePolicy
#  \
#   +----> Rule --> TimePeriod
#   |\
#   | `--> Rule --> TimePeriod
#    \_
#      `-> Rule --> TimePeriod
class ThrottlePolicy
  attr_reader :rules

  # Dictionary<TimePeriod, Integer>
  def initialize(namespace, rule_map, now = Time.now)
    @rules = rule_map
      .map { |(period, limit)| Rule.new(namespace, period, limit, now) }
  end

  def track(unique_id, now = Time.now)
    rules.each { |r| r.record_event(unique_id, now) }
  end

  # If throttled, returns the timeperiod when device will be unthrottled
  # returns nil if not throttled
  def is_throttled(unique_id)
    rules
      .map { |rule| rule.violation?(unique_id) }
      .compact
      .max
  end
end
