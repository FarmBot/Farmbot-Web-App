class ThrottlePolicy
  # A time_period object paired with a max limit
  class Rule
    attr_reader :time_period, :limit

    def initialize(time_period, limit)
      @time_period, @limit = time_period, limit
    end
  end
end
