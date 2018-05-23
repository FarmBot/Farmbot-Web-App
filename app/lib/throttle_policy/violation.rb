class ThrottlePolicy
  class Violation
    attr_reader :rule

    def initialize(rule)
      @rule = rule
    end

    def ends_at
      @rule.time_period.when_does_next_period_start?
    end

    def <=>(other)
      self.timeframe <=> other.timeframe
    end

    def timeframe
      rule.time_period.time_unit
    end

    def limit
      rule.limit.to_i
    end

    def explanation
      "more than #{limit} logs in #{timeframe.inspect}"
    end
  end
end
