FactoryBot.define do
  factory :log do
    device
    sequence(:created_at) { |n| n.minutes.ago.utc }
    message               { Faker::Company.bs }
    type                  { Log::TYPES.sample }
    channels ["toast"]
  end
end
