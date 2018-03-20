FactoryBot.define do
  factory :pin_binding do
    device
    pin_num { rand(0..32) }
  end
end
