# Track the number of occurences of an event over time.
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
    attr_reader :time_unit,
                :current_period, # Slice time into fixed size windows
                :entries

    def initialize(active_support_duration, now = Time.now)
      @time_unit = active_support_duration
      reset_everything now
    end


    def record_event(unique_id, now = Time.now)
      period = calculate_period(now)
      case period <=> current_period
      when -1 then return                         # Out of date- don't record.
      when  0 then increment_count_for(unique_id) # Right on schedule.
      when  1 then reset_everything(now)          # Clear out old data.
      end
    end

    def usage_count_for(unique_id)
      @entries[unique_id] || 0
    end

    def when_does_next_period_start?
      Time.at(current_period * time_unit.to_i) + time_unit
    end

  private

    def reset_everything(now)
      @current_period = calculate_period(now)
      @entries        = {}
    end

    def increment_count_for(unique_id)
      @entries[unique_id] ||= 0
      @entries[unique_id]  += 1
    end

    # Returns integer representation of current clock period
    def calculate_period(time)
      (time.to_i / @time_unit)
    end
  end
end
