FactoryBot.define do
  factory :curve do
    device
    name { Faker::Games::Pokemon.name + SecureRandom.hex(8) }
    type { "water" }
    data { ({ 1 => 1, 100 => 100 }) }
  end
end
