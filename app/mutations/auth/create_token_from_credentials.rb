module Auth
  class CreateTokenFromCredentials < Mutations::Command

    PRIVATE_KEY = KeyGen.current
    BAD_KEY     = "You are most likely on the wrong server env. That's not a "\
                  "valid credentials file."

    attr_reader :user

    required do
      string :credentials
      model  :fbos_version, class: Gem::Version
    end

    def validate
      cipher_text = Base64.decode64(credentials)
      plain_text  = PRIVATE_KEY.private_decrypt(cipher_text)
      cred_info   = JSON.parse(plain_text, symbolize_names: true)
      User.try_auth(cred_info[:email], cred_info[:password]) do |maybe_user|
        whoops! unless maybe_user
        @user = maybe_user
      end
    rescue OpenSSL::PKey::RSAError => e
      whoops!(BAD_KEY)
    end

    def execute
      SessionToken.as_json(user, AbstractJwtToken::BOT_AUD, fbos_version)
    end

private

    def whoops!(reason = "Bad email or password.")
      add_error :auth, :*, reason
    end
  end
end
