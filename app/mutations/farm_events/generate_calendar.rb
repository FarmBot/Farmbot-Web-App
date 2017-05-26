module FarmEvents
  # Used to calculate next 60ish occurences or so of a FarmEvent.
  class GenerateCalendar < Mutations::Command
    NEVER = FarmEvent::NEVER.to_s
    TIME = { "minutely" => 60,
             "hourly"   => 60 * 60,
             "daily"    => 60 * 60 * 24,
             "weekly"   => 60 * 60 * 24 * 7,
             "monthly"  => 60 * 60 * 24 * 30, # Not perfect...
             "yearly"   => 60 * 60 * 24 * 365 }

    UNIT_TRANSLATION = { "minutely" => :minutes,
                         "hourly"   => :hours,
                         "daily"    => :days,
                         "weekly"   => :weeks,
                         "monthly"  => :months,
                         "yearly"   => :years }
    required do
      integer :repeat
      string  :time_unit, in: FarmEvent::UNITS_OF_TIME
      time    :start_time
    end

    optional do
      time    :end_time
    end

    def execute
      # Does the input have a valid repeat?
      # Is it in the future?
      # Then generate a calendar.
      # Otherwise, return a "partial calendar" that is either empty or (in the
      # case of one-off events) has only one date in it (start_time).
      (every ? full_calendar : partial_calendar)
    end

    def full_calendar
      throw "NO NO NO!!!" if start_time && end_time && (start_time > end_time)
      options = { starts: start_time }
      options[:until] = end_time if end_time
      return Montrose
        .every(every, options)
        .take(60)
        .reject { |x| end_time ? x > (end_time + 1.second) : false  } # clear events beyon the end time
        .reject { |x| x <= Time.now }                                 # Clear past events
    end

    def partial_calendar
      in_future? ? [start_time] : []
    end

    def the_unit
      UNIT_TRANSLATION[time_unit]
    end

    def every
      (the_unit != NEVER) && the_unit && repeat.send(the_unit)
    end

    def in_future?
      start_time > Time.now
    end
  end
end
