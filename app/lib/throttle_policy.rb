class ThrottlePolicy
  attr_reader :rules

  # Dictionary<Throttler, Intger>
  def initialize(policy_rules)
    @rules = policy_rules.map { |rule_set| Rule.new(*rule_set) }
  end

  def track(unique_id, now = Time.now)
    rules.each { |r| r.throttler.record_event(unique_id, now) }
  end

  # If throttled, returns the timeperiod when device will be unthrottled
  # returns nil if not throttled
  def is_throttled(unique_id)
    rules
      .map do |rule|
        is_violation = rule.throttler.usage_count_for(unique_id) > rule.limit
        is_violation ? Violation.new(rule) : nil
      end
      .compact
      .max
  end
end
