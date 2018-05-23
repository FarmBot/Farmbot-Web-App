class ThrottlePolicy
  # A throttler object paired with a max limit
  class Rule
    attr_reader :throttler, :limit

    def initialize(throttler, limit)
      @throttler, @limit = throttler, limit
    end
  end
end
