FactoryBot.define do
  factory :pin_binding do
    device
    # association(:sequence) do
    #   FakeSequence.create(device: device)
    # end
    pin_num { rand(0..32) }
  end
end
