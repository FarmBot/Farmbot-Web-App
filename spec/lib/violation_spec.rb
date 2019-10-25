describe ThrottlePolicy::Violation do
  violation = ThrottlePolicy::Violation
  rule = ThrottlePolicy::Rule
  time_period = ThrottlePolicy::TimePeriod

  it "is comparable" do
    smaller = violation.new(rule.new("X", time_period.new(1.minute), 10))
    bigger = violation.new(rule.new("X", time_period.new(1.day), 10))
    medium = violation.new(rule.new("X", time_period.new(1.hour), 10))
    violations = [medium, smaller, bigger]
    result = violations.sort
    expect(result.first).to be(smaller)
    expect(result.last).to be(bigger)
  end
end
