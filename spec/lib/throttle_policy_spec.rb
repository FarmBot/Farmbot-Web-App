require "spec_helper"

describe ThrottlePolicy do
  it "detects throttle conditions" do
    t = ThrottlePolicy.new("rspec_xyz", min: 64, hour: 32, day: 1)

    t.track("x")
    expect(t.violation_for("x")).to eq(nil)

    t.track("x")
    violation = t.violation_for("x")
    expect(violation).to be
    expected = (Time.now + 1.day).day
    expect(expected).to eq(violation.ends_at.day)
    expect(violation.explanation).to eq("more than 1 / day")
  end
end
