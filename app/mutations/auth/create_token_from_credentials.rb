module Auth
  class CreateTokenFromCredentials < Mutations::Command
    PRIVATE_KEY = KeyGen.current
    BAD_KEY     = "You are most likely on the wrong server env. That's not a "\
                  "valid credentials file."

    attr_reader :user

    required do
      string :credentials
    end

    def validate
      cipher_text = Base64.decode64(credentials)
      plain_text  = PRIVATE_KEY.private_decrypt(cipher_text)
      cred_info   = JSON.parse(plain_text).symbolize_keys!
      @user       = User.where(email: cred_info[:email]).first
      whoops! unless @user && @user.valid_password?(cred_info[:password])
    rescue OpenSSL::PKey::RSAError => e
      whoops!(BAD_KEY)
    end

    def execute
      SessionToken.as_json(user)
    end

private

    def whoops!(reason = "Bad email or password.")
      add_error :auth, :*, reason
    end
  end
end
