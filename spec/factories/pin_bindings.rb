FactoryBot.define do
  factory :pin_binding do
    device
    pin_num { self.random_pin_num }
  end
end
