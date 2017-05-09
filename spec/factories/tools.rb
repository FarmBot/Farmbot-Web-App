FactoryGirl.define do
  factory :tool do
    device
    name { Faker::Pokemon.name + Faker::Pokemon.name  }
  end
end
