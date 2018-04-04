FactoryBot.define do
  factory :token_issuance do
    device
    exp { (Time.now + 4.days).to_i }
    jti { SecureRandom.uuid }
  end
end
