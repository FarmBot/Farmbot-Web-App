module FarmEvents
  # Used to calculate next 60ish occurrences or so of a FarmEvent.
  class GenerateCalendar < Mutations::Command
    GRACE_PERIOD     = 5.minutes
    NEVER            = FarmEvent::NEVER.to_s
    TIME             = { "minutely" => 60,
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
      time    :origin
      time    :lower_limit
    end

    optional do
      time    :upper_limit
    end

    def execute
      # Does the input have a valid repeat?
      # Is it in the future?
      # Then generate a calendar.
      # Otherwise, return a "partial calendar" that is either empty or (in the
      # case of one-off events) has only one date in it (origin).
      (is_repeating ? full_calendar : partial_calendar)
    end

    def full_calendar
      interval_sec      = TIME[time_unit] * repeat
      upper             = compute_endtime
      # Current time, plus a 5 minute grace period.
      now               = Time.now - GRACE_PERIOD
      # How many items must we skip to get to the first occurence?
      skip_intervals    = ((lower_limit - origin) / interval_sec).ceil
      # At what time does the first event occur?
      first_item        = origin + (skip_intervals * interval_sec).seconds
      list = [first_item]
      60.times do
        item = list.last + interval_sec.seconds
        list.push(item) unless (item >= upper) || (item <= now)
      end

      return list
    end

    def partial_calendar
      in_future? ? [origin] : []
    end

    def the_unit
      UNIT_TRANSLATION[time_unit]
    end

    def is_repeating
      (the_unit != NEVER) && the_unit && repeat.send(the_unit)
    end

    def in_future?
      origin > (Time.now - GRACE_PERIOD)
    end

    def compute_endtime
      next_year = (Time.now + 1.year)
      (upper_limit && (upper_limit < next_year)) ? upper_limit : next_year
    end
  end
end
