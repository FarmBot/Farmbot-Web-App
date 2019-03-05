FactoryBot.define do
  factory :regimen, :class => 'Regimen' do
    name { Faker::Games::Pokemon.name + Faker::Games::Pokemon.name }
    device
  end
end
