module FarmEvents
  module OccurenceHelpers
    MAX_OCCURENCES = 500
    TOO_MANY = "FarmEvents can't have more than #{MAX_OCCURENCES} occurences"
    CONVERSION_TABLE = {
      "minutely" => 1,
      "hourly" => 60,
      "daily" => 60 * 24,
      "weekly" => 60 * 24 * 7,
      "monthly" => 60 * 24 * 7 * 30,
      "yearly" => 60 * 24 * 7 * 30 * 12,
    }

    def self.occurences(start_time:, end_time:, time_unit:, repeat:)
      return 1 if time_unit == "never"
      minutes = [(end_time - start_time) / 60, 1].max.to_f
      t = CONVERSION_TABLE.fetch(time_unit)
      repeat_interval_in_minutes = [t * repeat, 1].max.to_f
      return (minutes / repeat_interval_in_minutes).round
    end

    def validate_occurences(start_time:, end_time:, time_unit:, repeat:)
      count = FarmEvents::OccurenceHelpers.occurences(start_time: start_time,
                                                      end_time: end_time,
                                                      time_unit: time_unit,
                                                      repeat: repeat)
      if count > MAX_OCCURENCES
        add_error(:occurences, :too_many, TOO_MANY)
      end
    end
  end
end
