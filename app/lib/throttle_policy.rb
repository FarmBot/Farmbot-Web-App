# Handles devices that spin out of control and send too many logs to the server.
# Class Hierarchy:
# ThrottlePolicy has => Rules creates => Violation
# Violation has => Rule has => TimePeriod
class ThrottlePolicy
  attr_reader :rules

  # Dictionary<TimePeriod, Integer>
  def initialize(namespace, policy_rules, now = Time.now)
    @rules = policy_rules.map do |(time_period, limit)|
      tp = ThrottlePolicy::TimePeriod.new(time_period, now)
      Rule.new(namespace, tp, limit)
    end
  end

  def track(unique_id, now = Time.now)
    rules.each { |r| r.time_period.record_event(unique_id, now) }
  end

  # If throttled, returns the timeperiod when device will be unthrottled
  # returns nil if not throttled
  def is_throttled(unique_id)
    rules
      .map do |rule|
      is_violation = rule.time_period.usage_count_for(unique_id) > rule.limit
      is_violation ? Violation.new(rule) : nil
    end
      .compact
      .max
  end
end
