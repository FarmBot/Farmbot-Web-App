FactoryBot.define do
  factory :tool do
    device
    name { Faker::Games::Pokemon.name + Faker::Games::Pokemon.name  }
  end
end
