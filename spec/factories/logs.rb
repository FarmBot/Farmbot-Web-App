FactoryBot.define do
  factory :log do
    device
    sequence(:created_at) { |n| n.minutes.ago.utc }
    message { Faker::Company.bs }
    type { Log::TYPES.sample }
    channels { ["toast"] }
    x { rand(-1000...1000) }
    y { rand(-1000...1000) }
    z { rand(-1000...1000) }
  end
end
