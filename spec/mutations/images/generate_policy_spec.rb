require "spec_helper"

describe Images::GeneratePolicy do
  it "has a policy object (Hash)" do
    policy = Images::GeneratePolicy.new.send(:policy)
    expiration = Time.parse(policy.fetch(:expiration))
    one_hour = (Time.now + 1.hour).utc
    time_diff = (one_hour - expiration).round
    expect(time_diff).to be >= 0
    expect(time_diff).to be <= 1

    conditions = policy.fetch(:conditions).map(&:to_a).map(&:flatten)
    {
      0 => eq([:bucket, "YOU_MUST_CONFIG_GOOGLE_CLOUD_STORAGE"]),
      2 => eq([:acl, "public-read"]),
      3 => eq([:eq, "$Content-Type", "image/jpeg"]),
      4 => eq(["content-length-range", 1, 7340032]),
    }.map do |(index, meet_expectation)|
      expect(conditions[index]).to meet_expectation
    end
  end
end
