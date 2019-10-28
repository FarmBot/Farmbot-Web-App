# Handles devices that spin out of control and send too many logs to the server.
# Class Hierarchy:
# ThrottlePolicy has => Rules creates => Violation
# Violation has => Rule has => TimePeriod
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
      .map do |rule|
      rule.violation?(unique_id) ? Violation.new(rule) : nil
    end
      .compact
      .max
  end
end
