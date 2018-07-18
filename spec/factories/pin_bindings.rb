FactoryBot.define do
  factory :pin_binding do
    device
    pin_num { [*0..32].without(17, 23).sample }
  end
end
