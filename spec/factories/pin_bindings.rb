FactoryBot.define do
  factory :pin_binding do
    device
    association :sequence
    pin_num { rand(0..32) }
  end
end
