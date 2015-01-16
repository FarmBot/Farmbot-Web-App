# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :step do
    message_type "single_command"
    command do
      { action: 'MOVE RELATIVE',
        x: 1,
        y: 2,
        z: 3,
        speed: 100,
        delay: 0 }
    end
  end
end
