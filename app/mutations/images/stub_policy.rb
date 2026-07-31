module Images
  class StubPolicy < Mutations::Command
    URL = "#{$API_URL}/direct_upload/"

    def execute
      key = random_filename
      {
        verb: "POST",
        url: URL,
        form_data: {
          "key" => key,
          "acl" => "public-read",
          "Content-Type" => "image/jpeg",
          "policy" => "N/A",
          "signature" => Image.direct_upload_token(key),
          "GoogleAccessId" => "N/A",
          "file" => "REPLACE_THIS_WITH_A_BINARY_JPEG_FILE",
        },
        instructions: "Send a 'form-data' request to the URL provided." \
                      "Then POST the resulting URL as an 'attachment_url' " \
                      "(json) to api/images/.",
      }
    end

    private

    # The image URL in the "untrusted bucket" in Google Cloud Storage
    def random_filename
      @range ||= "temp/#{SecureRandom.uuid}.jpg"
    end
  end
end
