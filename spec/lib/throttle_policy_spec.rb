require "spec_helper"
NOW = Time.new("2018-05-18T09:38:02.259-05:00")

klass = ThrottlePolicy::TimePeriod
describe klass do
  let(:policy) do
    ThrottlePolicy.new("rspec", { 1.minute => 1,
                                 1.hour => 10,
                                 1.day => 100 }, NOW)
  end

  it "initializes" do
    expect(policy.rules).to be
    expect(policy.rules.map(&:limit).sort).to eq([1, 10, 100])
    actual = policy.rules.map(&:time_period).map(&:time_unit).sort
    expected = [1.minute, 1.hour, 1.day]
    expect(actual).to eq(expected)
  end

  it "tracks things" do
    count1 = policy.rules.map(&:time_period).map { |t| t.usage_count_for(123) }
    expect(count1).to eq([0, 0, 0])
    5.times { policy.track(123, NOW + 1) }
    count2 = policy.rules.map(&:time_period).map { |t| t.usage_count_for(123) }
    expect(count2).to eq([5, 5, 5])
  end

  it "returns the cool down end time when the ID is throttled" do
    5.times { policy.track(123, NOW + 1) }
    result = policy.is_throttled(123)
    expect(result).to be_kind_of(ThrottlePolicy::Violation)
  end

  it "ignores the block when it's over the limit" do
    expect(policy.is_throttled 123).to be nil
  end
end
