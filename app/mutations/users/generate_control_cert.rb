module Users
  class GenerateControlCert < Mutations::Command

    required do
      model  :device, class: Device
      string :password
      string :email
    end

    def validate
      User.try_auth(email, password) do |user|
        bad_user! unless user
      end
    end

    def execute
      return Base64.encode64(cipher_text)
    end

    private

    def cipher_text
      cipher_text ||= KeyGen.current.public_encrypt(secret)
    end

    def secret
      @secret ||= {
        email:        email,
        password:     password,
        requested_by: device.users.pluck(:email),
        id:           SecureRandom.hex
      }.to_json
    end

    def bad_user!
      add_error :credentials, :auth, "Bad email or password- can't proceed."
    end
  end
end
