require "spec_helper"

describe Throttler do
  let(:stub_time) { Time.new(2018, 5, 18, 9, 38, 25) }

  it "sets a time unit window size" do
    expected_time_period = stub_time.to_i / 1.minute.to_i
    one_min              = Throttler.new(1.minute, stub_time)
    expect(one_min.current_period).to eq(expected_time_period)
    expect(one_min.time_unit_in_seconds).to eq(60)
    expect(one_min.entries).to eq({})
  end

  it "increments the count" do
    t   = Throttler.new(1.minute, stub_time)
    uid = 123

    # Ignore events from the past.
    t.record_event(uid, stub_time - 90)
    expect(t.usage_count_for(uid)).to eq(0)

    # Record events from the present
    t.record_event(uid, stub_time + 30)
    expect(t.usage_count_for(uid)).to eq(1)

    # Keep recording events from the present
    t.record_event(uid, stub_time + 31)
    expect(t.usage_count_for(uid)).to eq(2)

    # Invalidate cache when time window passes
    t.record_event(uid, stub_time + 75)
    expect(t.usage_count_for(uid)).to eq(0)
  end

  it "tells you when the next time period starts" do
    one_hour  = Throttler.new(1.hour, stub_time)
    next_hour = one_hour.when_does_next_period_start?
    expect(next_hour).to be_kind_of(Time)
    expect(next_hour.hour).to be(stub_time.hour + 1)
    expect(next_hour.min).to  be(0)
  end
end
