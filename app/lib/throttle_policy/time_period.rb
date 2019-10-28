# Track the number of occurrences of an event over time.
#
# Given:
#   * A fixed size duration (1 minute, 1 week etc)
#   * An event (In our case, log creation)
#   * An initiator id (eg: device_id)
#
# Produces:
#   * A table of event counts for the current time period, indexed by
#     the initiator ID.
class ThrottlePolicy
  class TimePeriod
    attr_reader :time_unit, :current_period

    def initialize(namespace, duration, now = Time.now)
      @time_unit = duration
      @namespace = namespace
      reset_everything(now)
    end

    def record_event(unique_id, now = Time.now)
      period = calculate_period(now)
      case period <=> current_period
      when -1 then return                        # Out of date- don't record.
      when 0 then increment_count_for(unique_id) # Right on schedule.
      when 1 then reset_everything(now)          # Clear out old data.
      end
    end

    def usage_count_for(unique_id)
      fetch(unique_id)
    end

    def when_does_next_period_start?
      Time.at(current_period * time_unit.to_i) + time_unit
    end

    private

    def reset_everything(now)
      @current_period = calculate_period(now)
      reset_cache
    end

    def increment_count_for(unique_id)
      incr(unique_id)
    end

    # Returns integer representation of current clock period
    def calculate_period(time)
      (time.to_i / @time_unit)
    end

    def redis
      Rails.cache.redis
    end

    def cache_key(unique_id)
      [@namespace, current_period.to_i, unique_id].join(":")
    end

    def incr(unique_id)
      redis.incr(cache_key(unique_id))
    end

    def fetch(unique_id)
      (redis.get(cache_key(unique_id)) || "0").to_i
    end

    def reset_cache
      keys = redis.keys([@namespace, "*"].join(":"))
      redis.del(*keys) unless keys.empty?
    end
  end
end
