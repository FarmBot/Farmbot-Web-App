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

    required do
      integer :repeat
      string  :time_unit, in: FarmEvent::UNITS_OF_TIME
      time    :start_time
      time    :end_time
    end

    def validate
    end

    def execute
      if time_unit == NEVER
        return []
      else
        one_interval = (repeat * TIME[time_unit]).seconds
        return [*(0..59)].map { |i|
          t             = (start_time + (i * one_interval))
          expired       = (t > (end_time || t)) || (t < Time.now)
          # Seeing dates more than 1 year out is confusing.
          too_far_ahead = t > (Time.now + 1.year)
          (expired || too_far_ahead) ? nil : t
        }.compact
      end
    end
  end
end
