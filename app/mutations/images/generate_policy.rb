require "google/cloud/storage"
require "google/cloud/storage/file"

module Images
  class GeneratePolicy < Mutations::Command
    HMM = "GCS NOT SETUP!"
    # # Is there a better way to reach in and grab the ActiveStorage configs?
    # CONFIG = YAML.load(ERB.new(File.read("config/storage.yml")).result(binding)).fetch("google")

    def execute
      {
        verb: "POST",
        url: "//storage.googleapis.com/#{bucket_name || HMM}/",
        form_data: {
          "key" => file_path,
          "acl" => "public-read",
          "Content-Type" => "image/jpeg",
          "policy" => post_object[:policy] || HMM,
          "signature" => post_object[:signature] || HMM,
          "GoogleAccessId" => post_object[:GoogleAccessId] || HMM,
          "file" => "REPLACE_THIS_WITH_A_BINARY_JPEG_FILE",
        },
        instructions: "Send a 'form-data' request to the URL provided. " \
                      "Then POST the resulting URL as an 'attachment_url' " \
                      "(json) to api/images/.",
      }
    end

    private

    def bucket_name
      ENV["GCS_BUCKET"]
    end

    def bucket
      json_key = ENV["GOOGLE_CLOUD_KEYFILE_JSON"]
      json_key && Google::Cloud::Storage.new.bucket(bucket_name)
    end

    def post_object
      @post_object ||= bucket ?
        bucket.post_object(file_path, policy: policy).fields : {}
    end

    def policy
      @policy ||= {
        expiration: (Time.now + 1.hour).utc.xmlschema,
        conditions: [
          { bucket: bucket_name },
          { key: file_path },
          { acl: "public-read" },
          [:eq, "$Content-Type", "image/jpeg"],
          ["content-length-range", 1, 7.megabytes],
        ],
      }
    end

    # The image URL in the "untrusted bucket" in Google Cloud Storage
    def file_path
      @range ||= "temp1/#{SecureRandom.uuid}.jpg"
    end
  end
end
