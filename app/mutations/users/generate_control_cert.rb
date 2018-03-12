module Users
  class GenerateControlCert < Mutations::Command

    required do
      model  :device, class: Device
      string :password
      string :email
    end

    def execute
      secret = {
        email:        email,
        password:     password,
        requested_by: device.users.pluck(:email),
        id:           SecureRandom.hex
      }.to_json
      ct       = KeyGen.current.public_encrypt(secret)
      return Base64.encode64(ct)
    end
  end
end
