module FarmEvents
  module OccurrenceHelpers
    MAX_OCCURRENCES = 500
    TOO_MANY = "Farm events can't have more than #{MAX_OCCURRENCES}" \
    " occurrences (%s occurrences detected)."
    CONVERSION_TABLE = {
      "minutely" => 1,
      "hourly" => 60,
      "daily" => 60 * 24,
      "weekly" => 60 * 24 * 7,
      "monthly" => 60 * 24 * 7 * 30,
      "yearly" => 60 * 24 * 7 * 30 * 12,
    }
    def self.occurrences(start_time:, end_time:, time_unit:, repeat:)
      return 1 if time_unit == "never"
      minutes = [(end_time - start_time) / 60, 1].max.to_f
      t = CONVERSION_TABLE.fetch(time_unit)
      repeat_interval_in_minutes = [t * repeat, 1].max.to_f
      return (minutes / repeat_interval_in_minutes).round
    end

    def validate_occurrences(start_time:, end_time:, time_unit:, repeat:)
      count = FarmEvents::OccurrenceHelpers.occurrences(start_time: start_time,
                                                        end_time: end_time,
                                                        time_unit: time_unit,
                                                        repeat: repeat)
      if count > MAX_OCCURRENCES
        add_error(:occurrences, :too_many, TOO_MANY % [count])
      end
    end
  end
end
