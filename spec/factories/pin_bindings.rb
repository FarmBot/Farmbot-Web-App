FactoryBot.define do
  factory :pin_binding do
    device
    pin_num do
      [*(0..69)].without(PinBinding::OFF_LIMITS).sample
    end
  end
end
