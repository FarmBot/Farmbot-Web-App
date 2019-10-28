class ThrottlePolicy
  # A time_period object paired with a max limit
  class Rule
    attr_reader :time_period, :limit

    def initialize(namespace, time_period, limit, now = Time.now)
      @namespace = namespace
      @time_period = ThrottlePolicy::TimePeriod.new(time_period, now)
      @limit = limit
    end

    def violation?(unique_id)
      time_period.usage_count_for(unique_id) > limit
    end

    def record_event(unique_id, now)
      time_period.record_event(unique_id, now)
    end
  end
end
