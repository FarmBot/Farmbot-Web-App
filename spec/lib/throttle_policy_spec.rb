require "spec_helper"
NOW = Time.new("2018-05-18T09:38:02.259-05:00")

describe Throttler do
  it "initializes" do
    policy = ThrottlePolicy.new(Throttler.new(1.minute, NOW) => 1_000,
                                Throttler.new(1.hour,   NOW) => 10_000,
                                Throttler.new(1.day,    NOW) => 100_000)
    expect(policy.rules).to be
    expect(policy.rules.map(&:limit).sort).to eq([1000, 10000, 100000])
    actual   = policy.rules.map(&:throttle).map(&:time_unit_in_seconds).sort
    expected = [1.minute, 1.hour, 1.day]
    expect(actual).to eq(expected)
  end
end
