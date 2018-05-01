FactoryBot.define do
  factory :tool_slot do
    x { rand(1...550) }
    y { rand(1...550) }
    z { rand(1...550) }
    meta ({})
    device
    tool
    pointer_type("ToolSlot")
  end
end
