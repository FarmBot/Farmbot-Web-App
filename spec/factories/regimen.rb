FactoryBot.define do
  factory :regimen, :class => 'Regimen' do
    name { Faker::Games::Pokemon.name + SecureRandom.hex(8) }
    device
  end
end
