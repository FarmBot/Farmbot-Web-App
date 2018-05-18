require "spec_helper"
NOW = Time.new("2018-05-18T09:38:02.259-05:00")

describe Throttler do
  let(:policy)  do
    policy = ThrottlePolicy.new(Throttler.new(1.minute, NOW) => 1,
                                Throttler.new(1.hour,   NOW) => 10,
                                Throttler.new(1.day,    NOW) => 100)
  end

  it "initializes" do
    expect(policy.rules).to be
    expect(policy.rules.map(&:limit).sort).to eq([1, 10, 100])
    actual   = policy.rules.map(&:throttler).map(&:time_unit_in_seconds).sort
    expected = [1.minute, 1.hour, 1.day]
    expect(actual).to eq(expected)
  end

  it "tracks things" do
    count1 = policy.rules.map(&:throttler).map{|t| t.usage_count_for(123)}
    expect(count1).to eq([0, 0, 0])
    5.times { policy.track(123, NOW + 1) }
    count2 = policy.rules.map(&:throttler).map{|t| t.usage_count_for(123)}
    expect(count2).to eq([5, 5, 5])
  end

  it "calls a block when usage limits are under the threshhold" do
    uid = 123
    flag = {value: false}
    policy.attempt_throttled_action(uid) { flag[:value] = true }
    expect(flag[:value]).to be true
  end

  it "ignores the block when it's over the limit" do
    uid = 123
    flag = { value: false }
    5.times { policy.track(123, NOW + 1) }
    policy.attempt_throttled_action(uid) { flag[:value] = true }
    expect(flag[:value]).to be false
  end
end
