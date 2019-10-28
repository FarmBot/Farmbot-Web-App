describe ThrottlePolicy::Violation do
  violation = ThrottlePolicy::Violation
  rule = ThrottlePolicy::Rule
  time_period = ThrottlePolicy::TimePeriod

  it "is comparable" do
    smaller = violation.new(rule.new("X", 1.minute, 10, Time.now))
    bigger = violation.new(rule.new("X", 1.day, 10, Time.now))
    medium = violation.new(rule.new("X", 1.hour, 10, Time.now))
    violations = [medium, smaller, bigger]
    result = violations.sort
    expect(result.first).to be(smaller)
    expect(result.last).to be(bigger)
  end
end
