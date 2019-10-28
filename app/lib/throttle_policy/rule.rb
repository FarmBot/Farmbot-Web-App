class ThrottlePolicy
  # A time_period object paired with a max limit
  class Rule
    attr_reader :time_period, :limit

    def initialize(namespace, time_period, limit, now = Time.now)
      @time_period = ThrottlePolicy::TimePeriod.new(namespace, time_period, now)
      @limit = limit
    end

    # returns the timeperiod when device will be
    # unthrottled. returns `nil` if not throttled
    def violation?(unique_id)
      if (time_period.usage_count_for(unique_id) > limit)
        Violation.new(self)
      end
    end

    def record_event(unique_id, now)
      time_period.record_event(unique_id, now)
    end
  end
end
