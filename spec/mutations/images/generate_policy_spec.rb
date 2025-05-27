require "spec_helper"

describe Images::GeneratePolicy do
  it "has a policy object (Hash)" do
    with_modified_env(GCS_BUCKET: "") do
      policy = Images::GeneratePolicy.new.send(:policy)
      expiration = Time.parse(policy.fetch(:expiration))
      one_hour = (Time.now + 1.hour).utc
      time_diff = (one_hour - expiration).round
      expect(time_diff).to be >= 0
      expect(time_diff).to be <= 1

      conditions = policy.fetch(:conditions).map(&:to_a).map(&:flatten)
      {
        0 => eq([:bucket, ""]),
        2 => eq([:acl, "public-read"]),
        3 => eq([:eq, "$Content-Type", "image/jpeg"]),
        4 => eq(["content-length-range", 1, 7340032]),
      }.map do |(index, meet_expectation)|
        expect(conditions[index]).to meet_expectation
      end
    end
  end

  it "has a policy object (GCS)" do
    allow(Google::Cloud::Storage).to receive(:new)
      .and_return(double(bucket: double()))

    with_modified_env(
      GOOGLE_CLOUD_KEYFILE_JSON: "key",
      GCS_BUCKET: "gcs",
    ) do
      policy = Images::GeneratePolicy.new.send(:policy)
      expiration = Time.parse(policy.fetch(:expiration))
      one_hour = (Time.now + 1.hour).utc
      time_diff = (one_hour - expiration).round
      expect(time_diff).to be >= 0
      expect(time_diff).to be <= 1

      conditions = policy.fetch(:conditions).map(&:to_a).map(&:flatten)
      {
        0 => eq([:bucket, "gcs"]),
        2 => eq([:acl, "public-read"]),
        3 => eq([:eq, "$Content-Type", "image/jpeg"]),
        4 => eq(["content-length-range", 1, 7340032]),
      }.map do |(index, meet_expectation)|
        expect(conditions[index]).to meet_expectation
      end
    end
  end
end
