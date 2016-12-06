FactoryGirl.define do
  factory :log do
    device
    message { Faker::Company.bs }
    channels ["toast"]
    meta do
      { types: [Log::TYPES.sample] }
    end
  end
end
