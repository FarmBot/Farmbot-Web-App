#
class ThrottlePolicy
  attr_reader :rules

  # A throttler object paired with a max limit
  class Rule
    attr_reader :throttle, :limit

    def initialize(throttle, limit)
      @throttle, @limit = throttle, limit
    end
  end

  # Dictionary<Throttler, number>
  def initialize(policy_rules)
    @rules = policy_rules.map { |rule_set| Rule.new(*rule_set) }
  end
end
