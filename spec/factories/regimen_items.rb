FactoryGirl.define do
  factory :regimen_item do
    regimen
    after(:build) do |s|
      # SEQUENCE IS A RESERVED WORD IN FACTORY GIRL.
      # WE CAN'T JUST TYPE "SEQUENCE".
      s.sequence ||= create(:sequence)
    end
  end
end
