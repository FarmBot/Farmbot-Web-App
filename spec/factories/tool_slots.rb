FactoryGirl.define do
  factory :tool_slot do
    tool_bay
    name "Example Tool Slot"
    x 1; y 2; z 3
  end
end
