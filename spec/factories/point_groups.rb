FactoryBot.define do
  factory :point_group do
    name { Faker::Games::Pokemon.name }
    # point_group_items # TODO: Broke - RC 23 Sept 19
  end
end
