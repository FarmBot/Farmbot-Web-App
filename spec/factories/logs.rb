FactoryGirl.define do
  factory :log do
    device
    sequence(:created_at) { |n| n.minutes.ago.utc }
    message { Faker::Company.bs }
    channels ["toast"]
    meta do
      { type: [Log::TYPES.sample] }
    end
  end
end
