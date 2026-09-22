describe ToolSlot do
  it "defaults mounting attributes" do
    slot = FactoryBot.create(:tool_slot)

    expect(slot.mount_offset_x).to eq(0)
    expect(slot.mount_offset_y).to eq(0)
    expect(slot.mount_offset_z).to eq(0)
    expect(slot.mount_stage).to eq(ToolSlot::MOUNT_STAGE_NONE)
  end

  it "does not allow double slotting of tools" do
    slot1  = FactoryBot.create(:tool_slot)
    device = slot1.device
    tool   = slot1.tool
    expect do
      FactoryBot.create(:tool_slot, device: device, tool: tool)
    end.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "validates mount stage" do
    slot = FactoryBot.build(:tool_slot, mount_stage: 99)

    expect(slot.valid?).to be false
    expect(slot.errors[:mount_stage].first).to include("must be one of")
  end
end
