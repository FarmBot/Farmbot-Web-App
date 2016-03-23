# Service for creating key pairs for cryptographically secure operations.
# Mostly used for creation of jwt.pem- which is used to verify authenticity of
# JSON Web Tokens
class KeyGen
  SAVE_PATH = "jwt.#{Rails.env}.pem"

  def self.run(path = SAVE_PATH)
    rsa = OpenSSL::PKey::RSA.generate(2048)
    File.open(path, 'w') { |f| f.write(rsa.to_pem) }
    return rsa
  end

  # Heroku users can't store stuff on the file system.
  # For them, there's maybe_load_from_env.
  # Stores the *.pem file in an ENV var.
  def self.maybe_load_from_env
    OpenSSL::PKey::RSA.new(ENV['RSA_KEYS']) if ENV['RSA_KEYS']
  end

  def self.current
    @current ||= ( maybe_load_from_env || self.run)
  end
end
