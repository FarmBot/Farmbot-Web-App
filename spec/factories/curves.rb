FactoryBot.define do
  factory :curve do
    device
    name { Faker::Games::Pokemon.name + Faker::Games::Pokemon.name }
    type { "water" }
    data { ({ 1 => 1, 100 => 100 }) }
  end
end
