describe ToolSlot do
  it "does not allow double slotting of tools" do
    slot1  = FactoryBot.create(:tool_slot)
    device = slot1.device
    tool   = slot1.tool
    expect do
      FactoryBot.create(:tool_slot, device: device, tool: tool)
    end.to raise_error(ActiveRecord::RecordInvalid)
  end
end
