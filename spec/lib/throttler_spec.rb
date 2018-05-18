require "spec_helper"

describe Throttler do
  NOW = Time.new("2018-05-18T09:38:02.259-05:00")

  it "sets a time unit window size" do
    expected_time_period = 25246440
    one_min              = Throttler.new(1.minute, NOW)

    expect(one_min.current_period).to eq(expected_time_period)
    expect(one_min.time_unit_in_seconds).to eq(60)
    expect(one_min.entries).to eq({})
  end

  it "increments the count" do
    t   = Throttler.new(1.minute, NOW)
    uid = 123

    # Ignore events from the past.
    t.record_event(uid, NOW - 90)
    expect(t.usage_count_for(uid)).to eq(0)

    # Record events from the present
    t.record_event(uid, NOW + 30)
    expect(t.usage_count_for(uid)).to eq(1)

    # Keep recording events from the present
    t.record_event(uid, NOW + 31)
    expect(t.usage_count_for(uid)).to eq(2)

    # Invalidate cache when time window passes
    t.record_event(uid, NOW + 75)
    expect(t.usage_count_for(uid)).to eq(0)
  end
end
