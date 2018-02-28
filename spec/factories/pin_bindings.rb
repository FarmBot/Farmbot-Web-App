FactoryBot.define do
  factory :pin_binding do
    device
    sequence_id { create(:sequence, device: device).id }
    pin_num { rand(0..32) }
  end
end
