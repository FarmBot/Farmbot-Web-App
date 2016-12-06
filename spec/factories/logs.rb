FactoryGirl.define do
  factory :log do
    device
    message Faker::Company.bs
  end
end
