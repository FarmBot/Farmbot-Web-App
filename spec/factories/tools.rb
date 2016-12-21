FactoryGirl.define do
  factory :tool do
    tool_slot
    device
    name { Faker::Pokemon.name }
  end
end
