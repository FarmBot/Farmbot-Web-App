require "spec_helper"

describe ConfigHelpers::ActiveStorage do
  it "returns :google when all required env vars are set" do
    with_modified_env(
      GOOGLE_CLOUD_KEYFILE_JSON: "key",
      GCS_PROJECT: "project",
      GCS_BUCKET: "bucket",
    ) do
      expect(described_class.service).to eq(:google)
    end
  end

  it "returns :local when no required env vars are set" do
    with_modified_env(
      GOOGLE_CLOUD_KEYFILE_JSON: nil,
      GCS_PROJECT: nil,
      GCS_BUCKET: nil,
    ) do
      expect(described_class.service).to eq(:local)
    end
  end
end
