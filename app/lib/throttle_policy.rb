#
class ThrottlePolicy
  attr_reader :rules

  # A throttler object paired with a max limit
  class Rule
    attr_reader :throttler, :limit

    def initialize(throttler, limit)
      @throttler, @limit = throttler, limit
    end
  end

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
        is_over = rule.throttler.usage_count_for(unique_id) > rule.limit
        is_over ? rule.throttler.when_does_next_period_start? : nil
      end
      .compact
      .max
  end
end
