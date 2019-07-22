module Images
  class GeneratePolicy < Mutations::Command
    BUCKET = ENV.fetch("GCS_BUCKET") { "YOU_MUST_CONFIG_GOOGLE_CLOUD_STORAGE" }
    KEY = ENV.fetch("GCS_KEY") { "YOU_MUST_CONFIG_GCS_KEY" }
    SECRET = ENV.fetch("GCS_ID") { "YOU_MUST_CONFIG_GCS_ID" }

    def execute
      {
        verb: "POST",
        url: "//storage.googleapis.com/#{BUCKET}/",
        form_data: {
          "key" => random_filename,
          "acl" => "public-read",
          "Content-Type" => "image/jpeg",
          "policy" => policy,
          "signature" => policy_signature,
          "GoogleAccessId" => KEY,
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
