# 12 JAN 17: I'm going to store this here incase I need to reference it later.
#            If this is more than a month old, go ahead and delete it.
# Adapted from: https://gist.github.com/oestrich/44602a5262ad3c469681
ENV       = JSON.parse(File.read("secret.json"))
THE_CLOUD = Fog::Storage.new(provider: "Google",
                             google_storage_access_key_id: ENV["id"],
                             google_storage_secret_access_key: ENV["key"])


    def old_signed_url
      # https://storage.googleapis.com/farmbot-testing/80fce4351e87c3be4343c19492024f5e.jpg
      private_key  = ENV["private_key"]
      client_email = ENV["client_email"]
      bucket       = ENV["bucket"]
      path         = "#{SecureRandom.hex(16)}.jpg"

      full_path  = "/#{bucket}/#{path}"
      expiration = 2.hours.from_now.to_i

      signature_string = [
        "PUT",
        "",
        "",
        expiration,
        full_path,
      ].join("\n")

      digest    = OpenSSL::Digest::SHA256.new
      signer    = OpenSSL::PKey::RSA.new(private_key)
      signature = Base64.strict_encode64(signer.sign(digest, signature_string))
      signature = CGI.escape(signature)

      render plain: "https://storage.googleapis.com"\
                    "#{full_path}?GoogleAccessId="\
                    "#{client_email}&Expires=#{expiration}"\
                    "&Signature=#{signature}"
    end
