FactoryBot.define do
  factory :tool do
    device
    name { Faker::Games::Pokemon.name + SecureRandom.hex(8)  }
  end
end
