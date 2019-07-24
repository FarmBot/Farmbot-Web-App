require "google/cloud/storage"
require "google/cloud/storage/file"

module Images
  class GeneratePolicy < Mutations::Command
    BUCKET = ENV.fetch("GCS_BUCKET") { "YOU_MUST_CONFIG_GOOGLE_CLOUD_STORAGE" }
    KEY = ENV.fetch("GCS_KEY") { "YOU_MUST_CONFIG_GCS_KEY" }
    SECRET = ENV.fetch("GCS_ID") { "YOU_MUST_CONFIG_GCS_ID" }

    def execute
      config_string = ERB.new(File.read("config/storage.yml")).result(binding)
      config = YAML.load(config_string).fetch("google")
      stoarge = Google::Cloud::Storage.new
      bucket_name = ENV.fetch("GCS_BUCKET")
      bucket = stoarge.bucket(bucket_name)

      file_path = random_filename
      signer =
        Google::Cloud::Storage::File::SignerV2.from_bucket bucket, file_path

      policy1 = { expiration: Time.now.tomorrow.utc.midnight.xmlschema,
                 conditions: [
        { bucket: bucket_name },
        { key: file_path },
        { acl: "public-read" },
        [:eq, "$Content-Type", "image/jpeg"],
        ["content-length-range", 1, 7.megabytes],
      ] }

      signed_post1 = bucket.post_object file_path, policy: policy1

      {
        verb: "POST",
        url: "//storage.googleapis.com/#{bucket_name}/",
        form_data: {
          "key" => random_filename,
          "acl" => "public-read",
          "Content-Type" => "image/jpeg",
          "policy" => signed_post1.fields.fetch(:policy),
          "signature" => signed_post1.fields.fetch(:signature),
          "GoogleAccessId" => signed_post1.fields.fetch(:GoogleAccessId),
          "file" => "REPLACE_THIS_WITH_A_BINARY_JPEG_FILE",
        },
        instructions: "Send a 'from-data' request to the URL provided." \
                      "Then POST the resulting URL as an 'attachment_url' " \
                      "(json) to api/images/.",
      }
    end

    private

    # The image URL in the "untrusted bucket" in Google Cloud Storage
    def random_filename
      @range ||= "temp1/#{SecureRandom.uuid}.jpg"
    end

    def policy
      @policy ||= Base64.encode64(
        { "expiration" => 1.hour.from_now.utc.xmlschema,
         "conditions" => [
          { "bucket" => BUCKET },
          { "key" => random_filename },
          { "acl" => "public-read" },
          { "Content-Type" => "image/jpeg" },
          ["content-length-range", 1, 7.megabytes],
        ] }.to_json
      ).gsub(/\n/, "")
    end

    def policy_signature
      @policy_signature ||= Base64.encode64(
        OpenSSL::HMAC.digest(OpenSSL::Digest.new("sha1"),
                             SECRET,
                             policy)
      ).gsub("\n", "")
    end
  end
end
