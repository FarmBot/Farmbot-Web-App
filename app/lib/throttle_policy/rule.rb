class ThrottlePolicy
  # A time_period object paired with a max limit
  class Rule
    attr_reader :time_period, :limit

    def initialize(namespace, time_period, limit)
      @namespace = namespace
      @time_period, @limit = time_period, limit
    end
  end
end
