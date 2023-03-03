require "spec_helper"

describe FarmEvents::OccurrenceHelpers do
  FE_EXAMPLES = [
    [0, 27, "yearly"],
    [1, 37, "weekly"],
    [6, 57, "daily"],
    [7, 55, "daily"],
    [10, 38, "daily"],
    [13, 4, "weekly"],
    [14, 27, "daily"],
    [15, 24, "daily"],
    [148, 59, "hourly"],
    [151, 58, "hourly"],
    [350, 25, "hourly"],
    [365, 1, "daily"],
    [381, 23, "hourly"],
    [515, 17, "hourly"],
    [876, 10, "hourly"],
    [973, 9, "hourly"],
    [1095, 8, "hourly"],
    [8908, 59, "minutely"],
    [37543, 14, "minutely"],
    [40431, 13, "minutely"],
    [43800, 12, "minutely"],
    [47782, 11, "minutely"],
    [58400, 9, "minutely"],
    [65700, 8, "minutely"],
    [75086, 7, "minutely"],
    [525600, 1, "minutely"],
  ]

  it "calculates item count" do
    now = Time.parse("2023-01-01T11:22:33.000Z") # `Time.now + 1.hour` was blinky
    params = { start_time: now, end_time: now + 1.year }
    FE_EXAMPLES.map do |(expected, repeat, time_unit)|
      i = params.merge(repeat: repeat, time_unit: time_unit)
      actual = FarmEvents::OccurrenceHelpers.occurrences(**i)
      expect(actual).to eq(expected)
    end
  end
end
