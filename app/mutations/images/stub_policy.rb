module Images
  class StubPolicy < Mutations::Command
    def execute
      {
        verb:    "POST",
        url:     "#{$API_URL}/api/images/dircect_upload",
        form_data: {
          "key"            => random_filename,
          "acl"            => "public-read",
          "Content-Type"   => "image/jpeg",
          "policy"         => "N/A",
          "signature"      => "N/A",
          "GoogleAccessId" => "N/A",
          "file"           => "REPLACE_THIS_WITH_A_BINARY_JPEG_FILE"
        },
        instructions: "Send a 'from-data' request to the URL provided."\
                      "Then POST the resulting URL as an 'attachment_url' "\
                      "(json) to api/images/."
      }
    end
  private
    # The image URL in the "untrusted bucket" in Google Cloud Storage
    def random_filename
      @range ||= "temp/#{SecureRandom.uuid}.jpg"
    end
  end
end
